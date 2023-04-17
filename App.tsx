import React, { useRef, useState } from "react";
import { SafeAreaView, Text, Button } from "react-native";
import { WebView } from "react-native-webview";

let id = 0;
const promises = {} as {
  [key: string]: [(arg: any) => void, (arg: any) => void];
};

type WebviewResponse = {
  id: string;
  error: string | undefined;
  result: any;
};

function App(): JSX.Element {
  const webView = useRef<WebView | null>(null);
  const [result, setResult] = useState("");

  async function callIntoWebview<T>(command: string, ...args: any): Promise<T> {
    id++;
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Promise timed out'));
      }, 10000);
    });

    const promise = new Promise<T>((resolve, reject) => {
      webView.current?.injectJavaScript(`
      document.handle("${id}", ${JSON.stringify(command)}, ${JSON.stringify(
        args
      )})

      true
    `);

      promises[String(id)] = [resolve, reject];
    });
  }

  function sendGM() {
    return async () => {
      const res: [any] = await callIntoWebview("sendGM", "RECIPIENT ADDRESS HERE");
      setResult(JSON.stringify(res));
    };
  }

  return (
    <SafeAreaView>
      <WebView
        style={{ flex: 1, height: 300, width: 300 }}
        ref={webView}
        source={require("./html/dist/index.html")}
        javaScriptEnabled={true}
        onLoad={(e) => {
          console.log("webview loaded", e.target.toString());
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn("WebView error: ", nativeEvent);
        }}
        originWhitelist={["*"]}
        onMessage={(event) => {
          const { data } = event.nativeEvent;
          console.log("got a message", data);
          const response: WebviewResponse = JSON.parse(data);
          console.log("got a response", response);

          const [resolve, reject] = promises[response.id];

          if (response.error) {
            console.log("oh no error", response.error);
            reject(new Error(response.error));
          } else {
            resolve(JSON.parse(response.result));
          }

          delete promises[response.id];
        }}
      />
      <Text style={{ marginTop: 100 }}>{result}</Text>
      <Button title="Send GM from Random Wallet" onPress={sendGM()} />
    </SafeAreaView>
  );
}

export default App;
