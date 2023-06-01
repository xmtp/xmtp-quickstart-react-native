# XMTP Example

This example shows you how to create a basic xmpt react native app that calls through to `@xmtp/react-native-sdk`

## 🚀 How to use

- Run `npm install`
- Run `npm run start` to try it out.
- Wait until the app is built and downloaded. Press "run again" to reload the app and splash screen.

## Getting setup on your own

- Run `npx create-expo-app AwesomeChatProject`
- Run `npx expo prebuild` to create the android and ios directories.
- Run `npx install-expo-modules@latest`
- Run `npm install expo`
- Run `npm i @xmtp/react-native-sdk`
- Then navigate to the `build.gradle` file inside the android director and update the minSDK to 22 which is required for XMTP
- Then navigate to the `Podfile` in the ios directory and update the min version to 16 which is required for XMTP
- Now you should be able to build your own chat app


