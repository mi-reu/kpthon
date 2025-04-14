"use client";

import { useState, useEffect } from "react";
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
import useWebSocket from "../hooks/useWebSocket";
import { playAudio } from "@/utils/audio";

const helloAiMessage = `
  안녕하세요, 고객님! 카카오페이 대출 상담에 방문해주셔서 진심으로 감사합니다.
  상담을 통해 가장 적합한 대출 상품을 찾아드릴 수 있도록 최선을 다하겠습니다. 편안하게 말씀해주세요.
`;

export default function Home() {
  const [currentAiMessage, setCurrentAiMessage] = useState<MessageData | null>(
    null
  );
  const [currentUserMessage, setCurrentUserMessage] =
    useState<MessageData | null>(null);
  const [chatList] = useAtom(chatListAtom);
  const [, updateChatList] = useAtom(updateChatListAtom);
  const [isStarted, setIsStarted] = useState(false);

  const handleStartClick = () => {
    setIsStarted(true);
    // 초기 인사 메시지 전송
    sendMessage(helloAiMessage);
  };

  const { sendMessage } = useWebSocket({
    onMessage: async (message) => {
      console.log("onMessage", message);

      if (message.type === MessageType.AGENT_VOICE && message.audio) {
        try {
          updateChatList([
            {
              type: MessageType.AGENT_TEXT,
              text: helloAiMessage,
            },
          ]);
          await playAudio(message.audio);
        } catch (error) {
          console.error("Error playing audio:", error);
        }
      }
    },
  });

  const { isPlaying, stopAudio } = useVoiceTextSync({
    onMessage: (data: MessageData) => {
      console.log("useVoiceTextSync", data);
      if (data.type === MessageType.AGENT_TEXT) {
        setCurrentAiMessage(data);
      } else if (data.type === MessageType.AGENT_VOICE) {
        setCurrentAiMessage((prev) => {
          if (!prev) return null;
          return { ...prev, audio: data.audio };
        });
      }
    },
  });

  const { isRecording, startRecording, stopRecording } = useVoiceRecorder({
    onMessage: (data: MessageData) => {
      console.log("useVoiceRecorder", data);
      if (data.type === MessageType.USER_VOICE) {
        setCurrentUserMessage(data);
      }
    },
    isInterrupted: isPlaying,
    minDecibels: -20,
  });

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

  // AI 응답이 끝나면 메시지를 채팅 목록에 추가
  useEffect(() => {
    if (!isPlaying && currentAiMessage) {
      updateChatList([...chatList, currentAiMessage]);
      setCurrentAiMessage(null);
      // AI 응답이 끝나면 자동으로 녹음 시작
      if (!isRecording) {
        startRecording();
      }
    }
  }, [
    isPlaying,
    currentAiMessage,
    chatList,
    updateChatList,
    isRecording,
    startRecording,
  ]);

  // 사용자 음성이 끝나면 메시지를 채팅 목록에 추가
  useEffect(() => {
    if (!isRecording && currentUserMessage) {
      updateChatList([...chatList, currentUserMessage]);
      setCurrentUserMessage(null);
    }
  }, [isRecording, currentUserMessage, chatList, updateChatList]);

  if (!isStarted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-8">카카오페이 대출 상담</h1>
          <button
            onClick={handleStartClick}
            className="px-8 py-4 bg-[#374151] text-white rounded-full text-lg font-semibold hover:bg-[#4B5563] transition-colors"
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
        {currentUserMessage && (
          <ChatMessage isUser text={currentUserMessage.text ?? ""} />
        )}
        {currentAiMessage && <ChatMessage text={currentAiMessage.text ?? ""} />}
      </ChatContainer>
      <VoiceChatButton
        className="fixed bottom-8 left-1/2 -translate-x-1/2"
        loading={isRecording || isPlaying}
        onClick={handleVoiceButtonClick}
      />
    </div>
  );
}
