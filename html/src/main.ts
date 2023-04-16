import { Wallet, Client } from "./imports";
let client: Client;

const commands = {
  sendGM: async (recipient: string): Promise<string[]> => {
    const account = Wallet.createRandom();

    client = await Client.create(account);
    await client.publishUserContact();

    const conversation = await client.conversations.newConversation(recipient);
    await conversation.send("gm from ReactNative");

    const result: string[] = [];

    for (const convo of await client.conversations.list()) {
      for (const message of await convo.messages()) {
        result.push(message.content);
      }
    }

    return result;
  },
} as { [key: string]: (...args: any) => Promise<any> };

document.handle = async function (id: string, command: string, args: any) {
  const response: {
    id: string;
    error: string | null;
    result: string | null;
  } = {
    id: id,
    error: null,
    result: null,
  };

  try {
    const result = await commands[command](...args);
    response.result = JSON.stringify(result);
  } catch (e) {
    response.error = String(e);
  }

  (window as any).ReactNativeWebView.postMessage(JSON.stringify(response), "*");
};
