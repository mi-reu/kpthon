"use client";
import { useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import VoiceChatModeButton from "./_components/VoiceChatModeButton";
import UserMessage from "./_components/UserMessage";
import AiMessage from "./_components/AiMessage";

export default function Home() {
  const { transcript, listening, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      alert("브라우저가 음성 인식을 지원하지 않습니다.");
    }
  }, [browserSupportsSpeechRecognition]);

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          {/* AI 메시지 */}
          <AiMessage message="안녕하세요! 대출 상담을 도와드리겠습니다. 어떤 도움이 필요하신가요?" />

          {transcript.length > 0 && (
            <>
              {/* 사용자 메시지 */}
              <UserMessage message={transcript} />
            </>
          )}
        </div>
      </div>
      <VoiceChatModeButton
        className="fixed bottom-8 left-1/2 -translate-x-1/2"
        loading={listening}
        onClick={() => {
          if (!isLoading) {
            SpeechRecognition.startListening({ language: "ko" });
          } else {
            SpeechRecognition.stopListening();
          }

          setIsLoading(!isLoading);
        }}
      />
    </div>
  );
}
