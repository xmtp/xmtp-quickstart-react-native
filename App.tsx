import React, { useRef, useState } from "react";
import { SafeAreaView, Text, Button } from "react-native";
import { WebView } from "react-native-webview";
import html from "./html/dist/index.html";

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
  const [result, setResult] = useState("hi pat");

  async function callIntoWebview<T>(command: string, ...args: any): Promise<T> {
    id++;
    return new Promise<T>((resolve, reject) => {
      webView.current?.injectJavaScript(`
      window.global.handle("${id}", ${JSON.stringify(
        command
      )}, ${JSON.stringify(args)})

      true
    `);

      promises[String(id)] = [resolve, reject];
    });
  }

  function onPress(command: string) {
    return async () => {
      if (command === "ping") {
        const res: string = await callIntoWebview(command);
        setResult(res);
      } else if (command === "echo") {
        const res: string = await callIntoWebview(command, "yo yo yo");
        setResult(res);
      } else if (command === "fakeWallet") {
        const res: [any] = await callIntoWebview(command);
        console.log("got res", res);
        setResult(JSON.stringify(res));
      }
    };
  }

  return (
    <SafeAreaView>
      <Text style={{ marginTop: 100 }}>{result}</Text>
      <Button title="Ping" onPress={onPress("ping")} />
      <Button title="Echo" onPress={onPress("echo")} />
      <Button title="Fake wallets" onPress={onPress("fakeWallet")} />
      <WebView
        ref={webView}
        style={{ flex: 1, marginBottom: 20 }}
        // source={{ uri: "http://localhost:5173/" }}
        source={html}
        javaScriptEnabled={true}
        onLoad={() => {
          console.log("webview loaded");
        }}
        onError={(e) => {
          console.log("WEBVIEW ERR", e);
        }}
        originWhitelist={["*"]}
        onMessage={(event) => {
          const { data } = event.nativeEvent;
          console.log("got a message", data);
          const response: WebviewResponse = JSON.parse(data);

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
    </SafeAreaView>
  );
}

export default App;
