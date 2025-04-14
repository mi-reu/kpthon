import { useState, useRef } from "react";
import { MessageData, MessageType } from "@/app/stores/chat";
import useWebSocket from "../useWebSocket";
import { playAudio, clearAudioQueue } from "@/app/utils/audio";

interface Props {
  onMessage?: (data: MessageData) => void;
  onInterrupt?: () => void;
  onResumeRecording?: () => void;
}

function useVoiceTextSync({
  onMessage,
  onInterrupt,
  onResumeRecording,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useWebSocket({
    onMessage: async (data: MessageData) => {
      if (data.type === MessageType.AGENT_TEXT) {
        onMessage?.(data);
      } else if (data.type === MessageType.AGENT_VOICE && data.audio) {
        // 오디오 재생
        try {
          setIsPlaying(true);
          await playAudio(data.audio);
          setIsPlaying(false);
          // 오디오 재생이 끝난 후 녹음 재개
          onResumeRecording?.();
        } catch (error) {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
          onResumeRecording?.();
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
    clearAudioQueue();
    onInterrupt?.();
  };

  return {
    isPlaying,
    stopAudio,
  };
}

export default useVoiceTextSync;
