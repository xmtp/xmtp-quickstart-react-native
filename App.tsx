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
      document.handle("${id}", ${JSON.stringify(command)}, ${JSON.stringify(
        args
      )})

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
        setResult(JSON.stringify(res));
      }
    };
  }

  return (
    <SafeAreaView>
      <WebView
        style={{ flex: 1, height: 300, width: 300 }}
        ref={webView}
        // style={{ flex: 1, marginBottom: 20 }}
        // source={{ uri: "http://localhost:5173/" }}
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
      <Button title="Ping" onPress={onPress("ping")} />
      <Button title="Echo" onPress={onPress("echo")} />
      <Button title="Fake wallets" onPress={onPress("fakeWallet")} />
    </SafeAreaView>
  );
}

export default App;
