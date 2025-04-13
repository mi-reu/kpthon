"use client";

import { useEffect, useState } from "react";
import ChatContainer from "@/app/components/ChatContainer";
import ChatMessage from "@/app/components/ChatMessage";
import VoiceChatButton from "@/app/components/VoiceChatButton";
import useVoiceRecorder from "@/app/hooks/useVoiceRecorder";

export default function Home() {
  const { isRecording, startRecording, stopRecording } = useVoiceRecorder({
    // url: "http://localhost:3001", // 실제 서버 URL로 변경 필요
  });

  const [messages, setMessages] = useState<
    Array<{ text: string; isUser: boolean }>
  >([]);

  useEffect(() => {
    setTimeout(() => {
      setMessages((messages) =>
        messages.concat({ text: "고마워!", isUser: true })
      );
    }, 1000);

    setTimeout(() => {
      setMessages((messages) =>
        messages.concat({
          text: "더 필요한 내용이 있으면 말씀해주세요!",
          isUser: false,
        })
      );
    }, 2000);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col bg-gray-100">
      <ChatContainer>
        <ChatMessage>안녕하세요! 무엇을 도와드릴까요?</ChatMessage>
        <ChatMessage isUser>AI에 대해 설명해주세요.</ChatMessage>
        <ChatMessage>
          인공지능(AI)은 인간의 학습능력, 추론능력, 지각능력을 컴퓨터로 구현하는
          기술입니다...
        </ChatMessage>
        {messages.map((message, index) => (
          <ChatMessage key={index} isUser={message.isUser} isNewMessage>
            {message.text}
          </ChatMessage>
        ))}
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
