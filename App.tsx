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
  Modal,
  TextInput, 
} from "react-native";
import { Client, Conversation, DecodedMessage } from '@xmtp/react-native-sdk';

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
  const [addressText, setAddressText] = useState("No Connected Address");
  const [connected, setConnected] = useState(false);
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [conversations, setConversations] = useState<Conversation[] | undefined>(undefined);
  const [messages, setMessages] = useState<DecodedMessage[] | undefined>(undefined);
  const [conversation, setConversation] = useState<Conversation | undefined>(undefined);

  function connectRandomWallet() {
    return async () => {
      // NOTE: react-native-sdk testing
      const client = await Client.createRandom('dev')
      setClient(client);
      const rnSDKAddress = await client.address;
      // const address: string = await callIntoWebview("connectRandomWallet");
      setAddressText('react-native-sdk npm address: ' + rnSDKAddress);
      setConnected(true);
      getConversations();
    };
  }

  function getConversations() {
    return async () => {
      const conversations = await client?.conversations.list();
      setConversations(conversations);
    };
  }

  function getMessages(conversation: Conversation) {
    return async () => {
      const messages = await conversation?.messages();
      setConversation(conversation);
      setMessages(messages);
    };
  }

  function sendMessage(message: string) {
    return async () => {
      await conversation?.send(message);
      getMessages(conversation!!);
    };
  }

  /**
  * Show a `FlatList` of conversations for the current XMTP user.
  *
  * This triggers {@param onPressTopic} when the user selects a conversation.
  */
  function ConversationList() {
    if (!conversations) {
      return null;
    }
    return (
      <FlatList
        data={conversations}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={getMessages(item)}
            style={styles.conversationItemContainer}
          >
            <Text style={styles.conversationItemPeer}>{item.peerAddress}</Text>
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
  function ConversationModal({ onClose }: { onClose: () => void; }) {
    const [inputText, onChangeInputText] = React.useState('');

    return (
      <Modal
        statusBarTranslucent
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
              <View>
                <Text style={styles.conversationItemTopic}>
                  {item.senderAddress}
                </Text>
                <Text style={styles.messageText}>
                  {item.content}
                </Text>
              </View>
            )}
            keyExtractor={({ id }) => id}
          />
        </View>
        <TextInput
          style={styles.input}
          onChangeText={onChangeInputText}
          value={inputText}
          placeholder="Send message"
          onSubmitEditing={() => { onChangeInputText(""); sendMessage(inputText) }}
        />
        <View style={{ marginBottom: 20 }}>
          <Button title="Send" onPress={sendMessage(inputText)}/>
        </View>

      </Modal>
    );
  }

  return (
    <SafeAreaView >
      <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}>
        <Text selectable={true} style={{ marginTop: 32, width: '100%', textAlign: 'center' }}>{addressText}</Text>
      </View>
      { connected ? <Button title="Refresh Conversations" onPress={getConversations()} /> : <Button title="Connect Random Wallet" onPress={connectRandomWallet()} /> }
      { connected ? <ConversationList /> : null }
      { messages ? <ConversationModal onClose={() => setMessages(null)} /> : null }
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
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    marginBottom: 15
  },
});

export default App;
