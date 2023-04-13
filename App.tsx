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
      window.add(1)(2)

      true
    `);
  }


  let HTML = `
    <html>
      <head>
          <script src="https://unpkg.com/@xmtp/xmtp-js@7.14.2/dist/umd/index.js"></script>
          <script src="./xmtp.js"></script>
      </head>
      <body>
      </body>
    </html>
    `;

  let jsCode = `
    var add = function (x) {
        return function (y) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                key: x+y
            }), "*");
            return true; 
        };
    }
  `;

  return (
    <SafeAreaView>
      <Text style={{marginTop: 100}}>{result}</Text>
      <Button title="Press me" onPress={onPress} />
      <WebView
        ref={webView}
        style={{flex: 1, marginBottom: 20}}
        source={{ html: HTML }}
        javaScriptEnabled={true}
        onLoad={() => {
          console.log('webview loaded');
        }}
        injectedJavaScript={jsCode}
        originWhitelist={["*"]}
        onMessage={event => {
          console.log('onMessage called');
          const {data} = event.nativeEvent;
          console.log('got a message', data);
          const result = JSON.parse(data);

          setResult(result.key);
        }}
      />
    </SafeAreaView>
  );
}

export default App;
