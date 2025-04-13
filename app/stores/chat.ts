import { atom } from "jotai";

export type MessageType = "user" | "ai";

export interface ChatMessage {
  type: MessageType;
  content: string;
  timestamp: number;
}

export const chatListAtom = atom<ChatMessage[]>([]);

export const addMessageAtom = atom(null, (get, set, message: ChatMessage) => {
  const currentList = get(chatListAtom);
  set(chatListAtom, [...currentList, message]);
});
