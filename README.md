# React Native Hold Menu CLI

[![Reanimated v2 version](https://img.shields.io/github/package-json/v/enesozturk/react-native-hold-menu/develop?label=Reanimated%20v2&style=flat-square)](https://www.npmjs.com/package/react-native-hold-menu) [![npm](https://img.shields.io/npm/l/react-native-hold-menu?style=flat-square)](https://www.npmjs.com/package/react-native-hold-menu) [![npm](https://img.shields.io/badge/types-included-blue?style=flat-square)](https://www.npmjs.com/package/react-native-hold-menu) [![runs with expo](https://img.shields.io/badge/Runs%20with%20Expo-4630EB.svg?style=flat-square&logo=EXPO&labelColor=f3f3f3&logoColor=000)](https://expo.io/)

A performant, easy to use hold to open context menu for React Native CLI powered by Reanimated. 🔥

> This package is experimental and still in progress. Using it in production is not preffered yet.

---

![hold-menu-preview](./preview.gif)

## Features

- Powered with Reanimated **v3**. 🚀
- Smooth interactions & animations.
- Supports dark/light Mode. 🌚 🌝
- Supports device orientation change.
- Compatible with React Native CLI (instead off Expo).
- Written in `TypeScript`.

## Installation

```cmd
yarn add react-native-hold-menu-cli
```

#### Dependencies

This library needs these dependencies to be installed in your project before you can use it:

```bash
yarn add react-native-reanimated react-native-gesture-handler react-native-unimodules @react-native-community/blur react-native-haptic-feedback
```

**React Native Gesture Handler** needs extra steps to finalize its installation, please follow their [installation instructions](https://github.com/software-mansion/react-native-gesture-handler).

**React Native Reanimated** needs extra steps to finalize its installation, please follow their [installation instructions](https://docs.swmansion.com/react-native-reanimated/docs).

### Icon


If you want to use an icon in your menu items, you need to set your Icon component to **`HoldMenuProvider`** to be able to use it. Then you can put just the icon's name in the menu item list with the `icon` prop like below.

`<Provider iconComponent={Icon} />`

note `Icon` can be used with just **`react-native-vector-icons`** for now.

```tsx
import FeatherIcon from 'react-native-vector-icons/Feather';

/* ... */
<HoldMenuProvider iconComponent={FeatherIcon}>
```

## Getting Started

Check out [the documentation website](https://enesozturk.github.io/react-native-hold-menu).

---

## Contributors

- [Mo Gorhom](https://gorhom.dev/)

## License

[MIT](./LICENSE)

#### Show Your Support

Please give a star if you like this project! 🤩
