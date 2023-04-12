/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useRef, useState} from 'react';
import {SafeAreaView, Text, Button} from 'react-native';
import {WebView} from 'react-native-webview';
import html from './xmtp/index.html';

function App(): JSX.Element {
  const webView = useRef<WebView | null>(null);
  const [result, setResult] = useState('hi pat');

  function onPress() {
    console.log('on press called');
    webView.current?.injectJavaScript(`
      window.ReactNativeWebView.postMessage(JSON.stringify({
        key: "sup hi its gonna work"
      }), "*")

      true
    `);
    // setResult('helo world');
  }

  return (
    <SafeAreaView>
      <Text style={{marginTop: 100}}>{result}</Text>
      <Button title="Press me" onPress={onPress} />
      <WebView
        ref={webView}
        style={{flex: 1, marginBottom: 20}}
        source={{html}}
        onLoad={() => {
          console.log('webview loaded');
        }}
        onMessage={event => {
          console.log('onMessage called');
          const {data} = event.nativeEvent;
          console.log('got a message', data);
          const result = JSON.parse(data);

          setResult(result.key);
          // // Post message sends it back to react native
          // const clientResponseCode = `
          //       window.postMessage(${JSON.stringify(data)}, "*");
          //       true;
          //     `;
          // if (this.webView) {
          //   // Put the data into the webview
          //   this.webView.injectJavaScript(`add(1)(2);`);
          // }
        }}
      />
    </SafeAreaView>
  );
}

export default App;
