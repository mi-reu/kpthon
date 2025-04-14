import { useState, useRef } from "react";
import { MessageData, MessageType } from "@/app/stores/chat";
import useWebSocket from "../useWebSocket";
import { playAudio } from "@/utils/audio";

interface Props {
  onMessage?: (data: MessageData) => void;
  onInterrupt?: () => void;
}

function useVoiceTextSync({ onMessage, onInterrupt }: Props) {
  const [pendingText, setPendingText] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useWebSocket({
    onMessage: async (data: MessageData) => {
      if (data.type === MessageType.AGENT_TEXT) {
        // 텍스트를 먼저 저장하지만 화면에는 표시하지 않음
        setPendingText(data.text ?? "");
      } else if (
        data.type === MessageType.AGENT_VOICE &&
        data.audio &&
        pendingText
      ) {
        // 오디오 데이터가 도착하면 텍스트를 화면에 표시하고 오디오 재생
        onMessage?.({
          ...data,
          text: pendingText,
        });

        // 오디오 재생
        try {
          setIsPlaying(true);
          await playAudio(data.audio);
          setIsPlaying(false);
          setPendingText("");
        } catch (error) {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
          setPendingText("");
        }
      }
    },
  });

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
    setPendingText("");
    onInterrupt?.();
  };

  return {
    isPlaying,
    stopAudio,
  };
}

export default useVoiceTextSync;
