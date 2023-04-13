// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
//   <div>
//     Hi it's a webview
//   </div>
// `

import "./polyfills";
import { Wallet } from "@ethersproject/wallet";
// @ts-ignore: Unreachable code error
import { Client, Conversation, DecodedMessage } from "@xmtp/xmtp-js";

const commands = {
  ping: async (): Promise<string> => {
    return "PONG";
  },
  echo: async (msg: string): Promise<string> => {
    return "echo: " + msg;
  },
  complicated: async (): Promise<string[]> => {
    return ["1", "2", "3"];
  },
  fakeWallet: async (): Promise<string[]> => {
    const wallet1 = Wallet.createRandom();
    const wallet2 = Wallet.createRandom();

    const client1 = await Client.create(wallet1);
    const client2 = await Client.create(wallet2);

    await client1.publishUserContact();
    await client2.publishUserContact();

    const conversation = await client1.conversations.newConversation(
      wallet2.address
    );
    await conversation.send("hi from the network");

    const result: string[] = [];

    for (const convo of await client2.conversations.list()) {
      for (const message of await convo.messages()) {
        result.push(message.content);
      }
    }

    return result;
  },
} as { [key: string]: (...args: any) => Promise<any> };

window.handle = async function (id: string, command: string, args: any) {
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
