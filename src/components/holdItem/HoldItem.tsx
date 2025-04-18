/* eslint-disable react-hooks/exhaustive-deps */
import React, { memo, useMemo } from 'react';
import { ViewProps } from 'react-native';

//#region reanimated & gesture handler
import {
  TapGestureHandler,
  LongPressGestureHandler,
  TapGestureHandlerGestureEvent,
  LongPressGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  measure,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedProps,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  withSequence,
  withSpring,
  useAnimatedReaction,
  useDerivedValue,
  useAnimatedKeyboard,
  KeyboardState,
} from 'react-native-reanimated';
//#endregion

//#region dependencies
import { Portal } from '@gorhom/portal';
import { nanoid } from 'nanoid/non-secure';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
//#endregion

//#region utils & types
import {
  TransformOriginAnchorPosition,
  getTransformOrigin,
  calculateMenuHeight,
} from '../../utils/calculations';
import {
  HOLD_ITEM_TRANSFORM_DURATION,
  HOLD_ITEM_SCALE_DOWN_DURATION,
  HOLD_ITEM_SCALE_DOWN_VALUE,
  SPRING_CONFIGURATION,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
  CONTEXT_MENU_STATE,
} from '../../constants';
import { useDeviceOrientation } from '../../hooks';
import styles from './styles';

import type { HoldItemProps, GestureHandlerProps } from './types';
import styleGuide from '../../styleGuide';
import { useInternal } from '../../hooks';
//#endregion

type Context = { didMeasureLayout: boolean };

const HoldItemComponent = ({
  items,
  bottom,
  containerStyles,
  disableMove,
  menuAnchorPosition,
  activateOn,
  hapticFeedback,
  actionParams,
  closeOnTap,
  longPressMinDurationMs = 150,
  children,
  activeContainerStyles,
}: HoldItemProps) => {
  //#region hooks
  const { state, menuProps, safeAreaInsets } = useInternal();
  const deviceOrientation = useDeviceOrientation();
  const [menuActive, setMenuActive] = React.useState(false);
  //#endregion

  //#region variables
  const isActive = useSharedValue(false);
  const isAnimationStarted = useSharedValue(false);

  const itemRectY = useSharedValue<number>(0);
  const itemRectX = useSharedValue<number>(0);
  const itemRectWidth = useSharedValue<number>(0);
  const itemRectHeight = useSharedValue<number>(0);
  const itemScale = useSharedValue<number>(1);
  const transformValue = useSharedValue<number>(0);
  const keyboard = useAnimatedKeyboard();
  const keyboardHeight = useSharedValue(0);

  useDerivedValue(() => {
    if (keyboard.state.value === KeyboardState.OPEN) {
      keyboardHeight.value = keyboard.height.value;
    }
  });

  const transformOrigin = useSharedValue<TransformOriginAnchorPosition>(
    menuAnchorPosition || 'top-right'
  );

  const key = useMemo(() => `hold-item-${nanoid()}`, []);
  const menuHeight = useMemo(() => {
    const itemsWithSeparator = items.filter(item => item.withSeparator);
    return calculateMenuHeight(items.length, itemsWithSeparator.length);
  }, [items]);

  const isHold = !activateOn || activateOn === 'hold';
  //#endregion

  //#region refs
  const containerRef = useAnimatedRef<Animated.View>();
  //#endregion

  //#region functions
  const hapticResponse = () => {
    const style = !hapticFeedback ? 'Medium' : hapticFeedback;
    const options = {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    };
    switch (style) {
      case 'Selection':
        ReactNativeHapticFeedback.trigger('selection', options);
        break;
      case 'Light':
      case 'Medium':
      case 'Heavy':
        ReactNativeHapticFeedback.trigger(`impact${style}`, options);
        break;
      case 'Success':
      case 'Warning':
      case 'Error':
        ReactNativeHapticFeedback.trigger(`notification${style}`, options);
        break;
      default:
    }
  };
  //#endregion

  //#region worklet functions
  const activateAnimation = (ctx: any) => {
    'worklet';
    if (!ctx.didMeasureLayout) {
      const measured = measure(containerRef);

      itemRectY.value = measured.pageY;
      itemRectX.value = measured.pageX;
      itemRectHeight.value = measured.height;
      itemRectWidth.value = measured.width;

      if (!menuAnchorPosition) {
        const position = getTransformOrigin(
          measured.pageX,
          itemRectWidth.value,
          deviceOrientation === 'portrait' ? WINDOW_WIDTH : WINDOW_HEIGHT,
          bottom
        );
        transformOrigin.value = position;
      }
    }
  };

  const calculateTransformValue = () => {
    'worklet';

    const height =
      deviceOrientation === 'portrait' ? WINDOW_HEIGHT : WINDOW_WIDTH;

    const isAnchorPointTop = transformOrigin.value.includes('top');

    let tY = 0;
    if (!disableMove) {
      if (isAnchorPointTop) {
        const topTransform =
          itemRectY.value +
          itemRectHeight.value +
          menuHeight +
          styleGuide.spacing +
          (safeAreaInsets?.bottom || 0);

        tY = topTransform > height ? height - topTransform : 0;
      } else {
        const bottomTransform =
          itemRectY.value - menuHeight - (safeAreaInsets?.top || 0);
        tY =
          bottomTransform < 0 ? -bottomTransform + styleGuide.spacing * 2 : 0;
      }
    }
    return tY;
  };

  const setMenuProps = () => {
    'worklet';

    menuProps.value = {
      itemHeight: itemRectHeight.value,
      itemWidth: itemRectWidth.value,
      itemY: itemRectY.value,
      itemX: itemRectX.value,
      anchorPosition: transformOrigin.value,
      menuHeight: menuHeight,
      items,
      transformValue: transformValue.value,
      actionParams: actionParams || {},
    };
  };

  const scaleBack = () => {
    'worklet';
    itemScale.value = withTiming(1, {
      duration: HOLD_ITEM_TRANSFORM_DURATION / 2,
    });
  };

  const onCompletion = (isFinised?: boolean) => {
    'worklet';
    const isListValid = items && items.length > 0;
    if (isFinised && isListValid) {
      state.value = CONTEXT_MENU_STATE.ACTIVE;
      isActive.value = true;
      runOnJS(setMenuActive)(true);
      scaleBack();
      if (hapticFeedback !== 'None') {
        runOnJS(hapticResponse)();
      }
    }

    isAnimationStarted.value = false;

    // TODO: Warn user if item list is empty or not given
  };

  const scaleHold = () => {
    'worklet';
    itemScale.value = withTiming(
      HOLD_ITEM_SCALE_DOWN_VALUE,
      { duration: HOLD_ITEM_SCALE_DOWN_DURATION },
      onCompletion
    );
  };

  const scaleTap = () => {
    'worklet';
    isAnimationStarted.value = true;

    itemScale.value = withSequence(
      withTiming(HOLD_ITEM_SCALE_DOWN_VALUE, {
        duration: HOLD_ITEM_SCALE_DOWN_DURATION,
      }),
      withTiming(
        1,
        {
          duration: HOLD_ITEM_TRANSFORM_DURATION / 2,
        },
        onCompletion
      )
    );
  };

  /**
   * When use tap activation ("tap") and trying to tap multiple times,
   * scale animation is called again despite it is started. This causes a bug.
   * To prevent this, it is better to check is animation already started.
   */
  const canCallActivateFunctions = () => {
    'worklet';
    const willActivateWithTap =
      activateOn === 'double-tap' || activateOn === 'tap';

    return (
      (willActivateWithTap && !isAnimationStarted.value) || !willActivateWithTap
    );
  };
  //#endregion

  //#region gesture events
  const gestureEvent = useAnimatedGestureHandler<
    LongPressGestureHandlerGestureEvent | TapGestureHandlerGestureEvent,
    Context
  >({
    onActive: (_, context) => {
      if (canCallActivateFunctions()) {
        if (!context.didMeasureLayout) {
          activateAnimation(context);
          transformValue.value = calculateTransformValue();
          setMenuProps();
          context.didMeasureLayout = true;
        }

        if (!isActive.value) {
          if (isHold) {
            scaleHold();
          } else {
            scaleTap();
          }
        }
      }
    },
    onFinish: (_, context) => {
      context.didMeasureLayout = false;
      if (isHold) {
        scaleBack();
      }
    },
  });

  const overlayGestureEvent = useAnimatedGestureHandler<
    TapGestureHandlerGestureEvent,
    Context
  >({
    onActive: _ => {
      if (closeOnTap) state.value = CONTEXT_MENU_STATE.END;
      runOnJS(setMenuActive)(false);
    },
  });
  //#endregion

  //#region animated styles & props
  const animatedContainerStyle = useAnimatedStyle(() => {
    const animateOpacity = () =>
      withDelay(HOLD_ITEM_TRANSFORM_DURATION, withTiming(1, { duration: 0 }));

    return {
      opacity: isActive.value ? 0 : animateOpacity(),
      transform: [
        {
          scale: isActive.value
            ? withTiming(1, { duration: HOLD_ITEM_TRANSFORM_DURATION })
            : itemScale.value,
        },
      ],
    };
  });
  const containerStyle = React.useMemo(
    () => [
      containerStyles,
      animatedContainerStyle,
      isActive.value ? activeContainerStyles : {},
    ],
    [containerStyles, animatedContainerStyle, menuActive]
  );

  const animatedPortalStyle = useAnimatedStyle(() => {
    const animateOpacity = () =>
      withDelay(HOLD_ITEM_TRANSFORM_DURATION, withTiming(0, { duration: 0 }));

    // Tính toán available height (bao gồm cả bàn phím)
    const windowHeight =
      deviceOrientation === 'portrait' ? WINDOW_HEIGHT : WINDOW_WIDTH;
    const availableHeight = windowHeight - keyboardHeight.value;

    // Tính tỷ lệ scale dựa trên availableHeight và chiều cao item
    const scaleFactor = Math.min(availableHeight / itemRectHeight.value, 1);
    const scaledHeight = itemRectHeight.value * scaleFactor;

    // Tính toán vị trí top mới để item nằm hoàn toàn trong màn hình
    const desiredTop = Math.max(
      0,
      Math.min(itemRectY.value, availableHeight - scaledHeight)
    );
    const translateY = desiredTop - itemRectY.value;

    // Animation cho transform
    const transformAnimation = disableMove
      ? 0
      : isActive.value
      ? withSpring(translateY, SPRING_CONFIGURATION)
      : withTiming(0, { duration: HOLD_ITEM_TRANSFORM_DURATION });

    // Animation cho scale
    const scaleAnimation = isActive.value
      ? withTiming(scaleFactor, { duration: HOLD_ITEM_TRANSFORM_DURATION })
      : withTiming(1, { duration: HOLD_ITEM_TRANSFORM_DURATION });

    return {
      zIndex: 10,
      position: 'absolute',
      top: itemRectY.value,
      left: itemRectX.value,
      width: itemRectWidth.value,
      height: itemRectHeight.value,
      opacity: isActive.value ? 1 : animateOpacity(),
      transform: [
        { translateY: transformAnimation },
        { scale: scaleAnimation },
      ],
    };
  });
  const portalContainerStyle = useMemo(
    () => [styles.holdItem, animatedPortalStyle],
    [animatedPortalStyle]
  );

  const animatedPortalProps = useAnimatedProps<ViewProps>(() => ({
    pointerEvents: isActive.value ? 'auto' : 'none',
  }));
  //#endregion

  //#region animated effects
  useAnimatedReaction(
    () => state.value,
    _state => {
      if (_state === CONTEXT_MENU_STATE.END) {
        isActive.value = false;
        runOnJS(setMenuActive)(false);
      }
    }
  );
  //#endregion

  //#region components
  const GestureHandler = useMemo(() => {
    switch (activateOn) {
      case `double-tap`:
        return ({ children: handlerChildren }: GestureHandlerProps) => (
          <TapGestureHandler
            numberOfTaps={2}
            onHandlerStateChange={gestureEvent}
          >
            {handlerChildren}
          </TapGestureHandler>
        );
      case `tap`:
        return ({ children: handlerChildren }: GestureHandlerProps) => (
          <TapGestureHandler
            numberOfTaps={1}
            onHandlerStateChange={gestureEvent}
          >
            {handlerChildren}
          </TapGestureHandler>
        );
      // default is hold
      default:
        return ({ children: handlerChildren }: GestureHandlerProps) => (
          <LongPressGestureHandler
            minDurationMs={longPressMinDurationMs}
            onHandlerStateChange={gestureEvent}
          >
            {handlerChildren}
          </LongPressGestureHandler>
        );
    }
  }, [activateOn, gestureEvent]);

  const PortalOverlay = useMemo(() => {
    return () => (
      <TapGestureHandler
        numberOfTaps={1}
        onHandlerStateChange={overlayGestureEvent}
      >
        <Animated.View style={styles.portalOverlay} />
      </TapGestureHandler>
    );
  }, [overlayGestureEvent]);
  //#endregion

  //#region render
  return (
    <>
      <GestureHandler>
        <Animated.View ref={containerRef} style={containerStyle}>
          {children}
        </Animated.View>
      </GestureHandler>

      <Portal key={key} name={key}>
        <Animated.View
          key={key}
          style={[
            portalContainerStyle,
            isActive.value ? activeContainerStyles : {},
          ]}
          animatedProps={animatedPortalProps}
        >
          <PortalOverlay />
          {children}
        </Animated.View>
      </Portal>
    </>
  );
  //#endregion
};

const HoldItem = memo(HoldItemComponent);

export default HoldItem;
