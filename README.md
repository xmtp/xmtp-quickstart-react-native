# XMTP React Native quickstart example app

Use this quickstart example app to learn how to create a basic XMTP React Native app that calls through to [`@xmtp/react-native-sdk`](https://github.com/xmtp/xmtp-react-native).

## Run the example app 🚀

1. Follow the [React Native guide](https://reactnative.dev/docs/environment-setup?platform=android) to set up a CLI environment.
2. Run `npm install`.
3. Run `npm run ios` or `npm run android`.

## Get started building your own React Native app

1. Run `npx react-native init AwesomeChatProject`.
2. Run `npx install-expo-modules@latest`.
3. Run `npm install expo`.
4. Run `npm i @xmtp/react-native-sdk`.
5. In the `android` directory, update the `build.gradle` file to use `minSdkVersion = 22`. This is required by XMTP.
6. In the `ios` directory, update the `Podfile` file as follows: 
   - Set this value: `platform :ios, '16.0'`. This is required by XMTP.
   - Add this line: `pod 'secp256k1.swift', :modular_headers => true`. This is required for web3.swift.

You're now ready to build your own React Native chat app with XMTP!
