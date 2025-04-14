"use client";

import { useState } from "react";

import ChatContainer from "@/app/components/ChatContainer";
import ChatMessage from "@/app/components/ChatMessage";
import VoiceChatButton from "@/app/components/VoiceChatButton";
import useVoiceRecorder from "@/app/hooks/useVoiceRecorder";
import useVoiceTextSync from "@/app/hooks/useVoiceTextSync";
import { useAtom } from "jotai";
import {
  chatListAtom,
  MessageData,
  MessageType,
  updateChatListAtom,
} from "@/app/stores/chat";

const helloAiMessage = `
  안녕하세요, 고객님! 카카오페이 대출 상담에 방문해주셔서 진심으로 감사합니다.
  상담을 통해 가장 적합한 대출 상품을 찾아드릴 수 있도록 최선을 다하겠습니다. 편안하게 말씀해주세요.
`;

export default function Home() {
  const [chatList] = useAtom(chatListAtom);
  const [, updateChatList] = useAtom(updateChatListAtom);
  const [isStarted, setIsStarted] = useState(false);

  const { isPlaying, stopAudio } = useVoiceTextSync({
    onMessage: (data: MessageData) => {
      if (data.type === MessageType.AGENT_TEXT) {
        updateChatList([...chatList, data]);
      }
    },
    onResumeRecording: () => {
      resumeRecording();
    },
  });

  const {
    isRecording,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  } = useVoiceRecorder({
    onMessage: (data: MessageData) => {
      if (data.type === MessageType.USER_TEXT) {
        updateChatList([...chatList, data]);
        // 사용자 텍스트가 전달되면 녹음 일시 중지
        pauseRecording();
      }
    },
  });

  const handleStartClick = () => {
    setIsStarted(true);
    // 초기 인사 메시지 전송
    // sendMessage(helloAiMessage);
    updateChatList([
      {
        type: MessageType.AGENT_TEXT,
        text: helloAiMessage,
      },
    ]);
  };

  const handleVoiceButtonClick = () => {
    if (isPlaying) {
      stopAudio();
    } else if (isRecording) {
      stopRecording();
    } else if (!isPlaying) {
      // AI가 응답 중이 아닐 때만 녹음 시작
      startRecording();
    }
  };

  if (!isStarted) {
    return (
      <div
        style={{
          backgroundImage: `url(/bg.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          width: "100%",
          position: "relative",
        }}
        className="flex flex-col items-center"
      >
        <div className="text-center absolute bottom-[10%]">
          <button
            onClick={handleStartClick}
            className="px-8 py-4 bg-[#FFFF00] text-black rounded-full text-lg font-semibold hover:bg-[#FFD700] transition-colors"
          >
            대출 상담 시작하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-gray-100">
      <ChatContainer>
        {chatList.map((message, index) => (
          <ChatMessage
            key={index}
            isUser={message.type === MessageType.USER_TEXT}
            text={message.text || ""}
          />
        ))}
      </ChatContainer>
      <VoiceChatButton
        className="fixed bottom-8 left-1/2 -translate-x-1/2"
        loading={isRecording || isPlaying}
        onClick={handleVoiceButtonClick}
      />
    </div>
  );
}
