import React, { useState, useRef } from 'react';
import { View, Button } from 'react-native';
import { WebView } from 'react-native-webview';

const App = () => {
  const [result, setResult] = useState(null);
  const webViewRef = useRef();

  // Function to handle messages from the web worker
  const handleMessage = event => {
    const { data } = event.nativeEvent;
    setResult(data);
  };
  const webapp = require('./xmtp/index.html');
  
  return (
    <View>
      <WebView
        ref={webView => (this.webView = webView)}
        style={{ flex: 1, marginBottom: 20 }}
        source={{ webapp }}
        onMessage={event => {
          const { data } = event.nativeEvent;
          // Post message sends it back to react native
          const clientResponseCode = `
                window.postMessage(${JSON.stringify(data)}, "*");
                true;
              `;

          if (this.webView) {
            // Put the data into the webview
            this.webView.injectJavaScript(`add(1)(2);`);
          }
        }}
      />
    </View>
  );
};

export default App;