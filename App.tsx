import React, {useRef, useState} from 'react';
import {SafeAreaView, Text, Button} from 'react-native';
import {WebView} from 'react-native-webview';
import { Wallet } from 'ethers';
import { utils as SecpUtils } from '@noble/secp256k1';

function App(): JSX.Element {
  const webView = useRef<WebView | null>(null);
  const [result, setResult] = useState('hi pat');

  function sendGM() {
    console.log('on send gm');
    const account = new Wallet(SecpUtils.randomPrivateKey());
    const recipient = "0x33FA52E6a9DBFca57ed277491DBD8Ba5A0B248f4"
    webView.current?.injectJavaScript(`
      window.sendGM(account, recipient)

      true
    `);
  }


  let HTML = `
    <html>
      <head>
          <script src="https://unpkg.com/@xmtp/xmtp-js@7.14.2/dist/umd/index.js"></script>
      </head>
      <body>
      </body>
    </html>
    `;

  let jsCode = `
    function sendGM(account, recipient) {
      try {
        var xmtp = await Client.create(account);
        var conversation = await xmtp.conversations.newConversation(recipient);
        var message = await conversation.send("gm!");
        console.log('sent message: ' + message.content);
        window.ReactNativeWebView.postMessage(JSON.stringify({
            message: message.content
        }), "*");
        return true; 
      } catch (error) {
        console.log("error creating client: ".concat(error));
      }
    }
  `;

  return (
    <SafeAreaView>
      <Text style={{marginTop: 100}}>{result}</Text>
      <Button title="GM from random wallet" onPress={sendGM} />
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

          setResult(result.message);
        }}
      />
    </SafeAreaView>
  );
}

export default App;
