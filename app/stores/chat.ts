import { atom } from "jotai";

export enum MessageType {
  USER_VOICE = "USER_VOICE",
  USER_TEXT = "USER_TEXT",
  AGENT_VOICE = "AGENT_VOICE",
  AGENT_TEXT = "AGENT_TEXT",
}

export interface MessageData {
  type: MessageType;
  text?: string;
  audio?: Int16Array;
}

export const chatListAtom = atom<MessageData[]>([]);

export const updateChatListAtom = atom(
  null,
  (get, set, newMessages: MessageData[]) => {
    set(chatListAtom, newMessages);
  }
);
