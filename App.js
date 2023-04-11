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

  return (
    <View>
      <WebView
        ref={webView => (this.webView = webView)}
        style={{ flex: 1, marginBottom: 20 }}
        source={{ SOURCE_REPLACE_ME }}
        onMessage={event => {
          const { data } = event.nativeEvent;
          const clientResponseCode = `
                window.postMessage(${JSON.stringify(data)}, "*");
                true;
              `;

          if (this.webView) {
            this.webView.injectJavaScript(clientResponseCode);
          }
        }}
      />
    </View>
  );
};

export default App;