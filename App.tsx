import React, { useRef, useState } from "react";
import { 
  SafeAreaView, 
  Text, 
  Button, 
  Platform, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  View, 
  Modal 
} from "react-native";
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
  const [addressText, setAddressText] = useState("No Connected Address");
  const [topic, setTopic] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [conversations, setConversations] = useState<{ [id: string]: string }[] | null>(null);
  const [messages, setMessages] = useState<{ [id: string]: string }[] | null>(null);
  const source = Platform.OS === 'ios' ? require("./html/dist/index.html") : { uri: "file:///android_asset/index.html" }

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

    return Promise.race<T>([promise, timeout]);
  }

  function connectRandomWallet() {
    return async () => {
      const address: string = await callIntoWebview("connectRandomWallet");
      setAddressText(address);
      setConnected(true);
      getConversations();
    };
  }

  function getConversations() {
    return async () => {
      const conversations: [any] = await callIntoWebview("listConversations");
      setConversations(conversations);
    };
  }

  function getMessages(topic: string) {
    return async () => {
      const messages: [any] = await callIntoWebview("listMessages", topic);
      console.log("messages fetch", JSON.stringify(messages));
      setMessages(messages);
    };
  }

  /**
  * Show a `FlatList` of conversations for the current XMTP user.
  *
  * This triggers {@param onPressTopic} when the user selects a conversation.
  */
  function ConversationList({
    onPressTopic,
  }: {
    onPressTopic: (topic: string) => void;
  }) {
    if (!conversations) {
      return null;
    }
    return (
      <FlatList
        data={conversations}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => { getMessages(item.topic); onPressTopic(item.topic); }}
            style={styles.conversationItemContainer}
          >
            <Text style={styles.conversationItemPeer}>
              {item.peerAddress}

            </Text>
            <Text style={styles.conversationItemTopic}>{item.topic}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.topic}
      />
    );
  }

  /**
  * Show a {@link Modal} listing messages for the conversation {@param topic}.
  *
  * The {@link Modal} is not visible when {@param topic} is absent.
  * This triggers {@param onClose} when the user dismisses the modal.
  */
  function ConversationModal({
    topic,
    onClose,
  }: {
    topic: string | null;
    onClose: () => void;
  }) {
    return (
      <Modal
        visible={!!topic}
        animationType={'slide'}
        statusBarTranslucent
        onDismiss={onClose}
        onRequestClose={onClose}
      >
        <View style={styles.messagesContainer}>
          <FlatList
            data={messages}
            ListHeaderComponent={
              <View style={styles.closeButton}>
                <Button onPress={onClose} title="Close" />
              </View>
            }
            renderItem={({ item }) => (
              <Text style={styles.messageText}>
                {item.senderAddress}&gt; {item.text}
              </Text>
            )}
            keyExtractor={({ id }) => id}
          />
        </View>
      </Modal>
    );
  }

  return (
    <SafeAreaView >
      <WebView
        style={{ flex: 1, height: 300, width: 300 }}
        ref={webView}
        source={source}
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
      <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}>
        <Text selectable={true} style={{ marginTop: 32, width: '100%', textAlign: 'center' }}>{addressText}</Text>
      </View>
      { connected ? <Button title="Refresh Conversations" onPress={getConversations()} /> : <Button title="Connect Random Wallet" onPress={connectRandomWallet()} /> }
      { connected ? <ConversationList onPressTopic={setTopic} /> : null }
      <ConversationModal topic={topic} onClose={() => setTopic(null)} />
    </SafeAreaView>
  );
}

/// Helpers

const styles = StyleSheet.create({
  conversationItemContainer: {
    marginTop: 16,
    paddingHorizontal: 24,
  },
  conversationItemPeer: {
    fontSize: 16,
    fontWeight: '600',
  },
  conversationItemTopic: {
    marginTop: 8,
    fontFamily: 'Courier',
    fontSize: 9,
    fontWeight: '400',
  },
  messagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 35,
  },
  messageText: {
    textAlign: 'left',
    fontSize: 20,
    fontWeight: '400',
  },
  closeButton: { margin: 20 },
});

export default App;
