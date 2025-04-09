import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  holdItem: { zIndex: 10, position: 'absolute' },
  portalOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 15,
  },
  childrenContainer: {
    width: '100%',
    height: '100%',
  }
});

export default styles;
