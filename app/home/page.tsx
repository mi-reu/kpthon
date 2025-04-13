"use client";

import { useState } from "react";
import ChatContainer from "@/app/components/ChatContainer";
import ChatMessage from "@/app/components/ChatMessage";
import VoiceChatButton from "@/app/components/VoiceChatButton";
import useVoiceRecorder from "@/app/hooks/useVoiceRecorder";
import { useAtom } from "jotai";
import { addMessageAtom, chatListAtom } from "@/app/stores/chat";

export default function Home() {
  const [currentUserMessage, setCurrentUserMessage] = useState("");
  const [, addMessage] = useAtom(addMessageAtom);
  const [chatList] = useAtom(chatListAtom);

  const { isRecording, startRecording, stopRecording } = useVoiceRecorder({
    onMessage: (data: { audio: string; isLast: boolean }) => {
      setCurrentUserMessage(data.audio);
      if (data.isLast) {
        addMessage({
          type: "user",
          content: data.audio,
          timestamp: Date.now(),
        });
        setCurrentUserMessage("");
      }
    },
  });

  return (
    <div className="relative min-h-screen flex flex-col bg-gray-100">
      <ChatContainer>
        <ChatMessage>안녕하세요! 무엇을 도와드릴까요?</ChatMessage>
        {chatList.map((message, index) => (
          <ChatMessage key={index} isUser={message.type === "user"}>
            {message.content}
          </ChatMessage>
        ))}
        {currentUserMessage && (
          <ChatMessage isUser>{currentUserMessage}</ChatMessage>
        )}
      </ChatContainer>
      <VoiceChatButton
        className="fixed bottom-8 left-1/2 -translate-x-1/2"
        loading={isRecording}
        onClick={() => {
          if (isRecording) {
            stopRecording();
          } else {
            startRecording();
          }
        }}
      />
    </div>
  );
}
