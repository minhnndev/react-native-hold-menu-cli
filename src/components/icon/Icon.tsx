import React, { FunctionComponent, memo } from 'react';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import { useInternal } from '../../hooks';

type IconProps = {
  iconComponent: FunctionComponent<any>; // Simplified type
  name: string;
};

const Icon = ({ iconComponent, name }: IconProps) => {
  const { theme } = useInternal();
  const AnimatedIcon = Animated.createAnimatedComponent(iconComponent);

  const iconProps = useAnimatedProps(() => {
    return {
      color: theme.value === 'light' ? 'black' : 'white',
    };
  }, [theme]);

  return <AnimatedIcon name={name} size={18} animatedProps={iconProps} />;
};

export default memo(Icon);
