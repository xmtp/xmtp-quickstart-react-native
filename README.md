# XMTP Example

This example shows you how to create a basic xmpt react native app that calls through to `xmtp-js` via a webview.
** Note: This is necessary because the JS engine React Native uses (hermes) does not work with our crypto and polyfills (you can see an example using that here: https://github.com/xmtp/example-chat-react-native **

Long term we plan to have a React Native SDK that will be easy to integrate with and also performant. You can follow the progress of that here: https://github.com/xmtp/xmtp-react-native/issues/11

## 🚀 How to use

- Run `yarn` or `npm install`
- Run `cd html` to go into the html file
- Run `npm run build` to generate the single page html
- Run `cd ..` to get back to the main folder
- Run `cp html/dist/index.html android/app/src/main/assets` to copy the html into a folder android can see
- Run `yarn start` or `npm run start` to try it out.
- Wait until the app is built and downloaded. Press "run again" to reload the app and splash screen.

