"use client";

import { useState } from "react";

import ChatContainer from "@/app/components/ChatContainer";
import ChatMessage from "@/app/components/ChatMessage";
import VoiceChatButton from "@/app/components/VoiceChatButton";
import useVoiceRecorder from "@/app/hooks/useVoiceRecorder";
import useWebSocket from "@/app/hooks/useWebSocket";
import { useAtom } from "jotai";
import {
  chatListAtom,
  MessageData,
  MessageType,
  updateChatListAtom,
} from "@/app/stores/chat";
import { playAudio, clearAudioQueue } from "@/app/utils/audio";
import Image from "next/image";

const helloAiMessage = `
  안녕하세요, 고객님! 카카오페이 대출 상담에 방문해주셔서 진심으로 감사합니다.
  상담을 통해 가장 적합한 대출 상품을 찾아드릴 수 있도록 최선을 다하겠습니다. 편안하게 말씀해주세요.
`;

export default function Home() {
  const [chatList] = useAtom(chatListAtom);
  const [, updateChatList] = useAtom(updateChatListAtom);
  const [isStarted, setIsStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleAudioPlayback = async (audio: Int16Array<ArrayBufferLike>) => {
    try {
      setIsPlaying(true);
      await playAudio(audio);
      setIsPlaying(false);
      resumeRecording();
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
      resumeRecording();
    }
  };

  const { isConnected, sendMessage } = useWebSocket({
    onMessage: async (data: MessageData) => {
      if (data.type === MessageType.AGENT_TEXT) {
        updateChatList([...chatList, data]);
      } else if (data.type === MessageType.USER_TEXT) {
        updateChatList([...chatList, data]);
      } else if (data.audio) {
        await handleAudioPlayback(data.audio);
      }
    },
  });

  const { isRecording, startRecording, stopRecording, resumeRecording } =
    useVoiceRecorder({
      sendMessage,
      isConnected,
      isPlaying,
    });

  const stopAudio = () => {
    setIsPlaying(false);
    clearAudioQueue();
  };

  const handleStartClick = () => {
    setIsStarted(true);
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
      startRecording();
    }
  };

  if (!isStarted) {
    return (
      <div
        style={{
          backgroundImage: `url(/bg.png)`,
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          width: "100%",
          position: "relative",
        }}
        className="flex flex-col items-center"
      >
        <Image
          src="/logo.png"
          alt="logo"
          width={300}
          height={300}
          style={{
            position: "absolute",
            top: "0",
            left: "50%",
            transform: "translate(-50%, 0)",
          }}
        />
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
