import { Wallet, Client } from "./imports";
let client: Client;

const commands = {
  connectRandomWallet: async (): Promise<string> => {
    const account = Wallet.createRandom();

    client = await Client.create(account);
    await client.publishUserContact();

    return client.address;
  },
  listConversations: async (): Promise<{ [id: string]: string }[]> => {
    const result: { [id: string]: string }[] = [];

    for (const convo of await client.conversations.list()) {
      const convoMap: { [id: string]: string } = {}
      convoMap['topic'] = convo.topic;
      convoMap['peerAddress'] = convo.peerAddress;
      result.push(convoMap);
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

  (window as any).ReactNativeWebView.postMessage(JSON.stringify(response));
};
