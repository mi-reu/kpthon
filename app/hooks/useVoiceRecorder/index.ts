import { useRef, useState, useCallback, useEffect } from "react";
import { MessageData } from "@/app/stores/chat";
import useWebSocket from "../useWebSocket";

interface Props {
  onMessage?: (data: MessageData) => void;
  isInterrupted?: boolean;
  minDecibels?: number;
}

function useVoiceRecorder({
  onMessage,
  isInterrupted,
  minDecibels = -50,
}: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const { sendAudioData, isConnected } = useWebSocket({
    onMessage,
  });
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 최신 상태를 추적하기 위한 ref
  const recordingStateRef = useRef({ isRecording, isConnected });

  // 상태가 변경될 때마다 ref 업데이트
  useEffect(() => {
    recordingStateRef.current = { isRecording, isConnected };
  }, [isRecording, isConnected]);

  // 인터럽트 상태가 변경되면 녹음 중지
  useEffect(() => {
    if (isInterrupted && isRecording) {
      setIsRecording(false);
    }
  }, [isInterrupted, isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const audioContext = new AudioContext({
        sampleRate: 16000,
      });
      audioContextRef.current = audioContext;

      // AudioWorklet 등록
      await audioContext.audioWorklet.addModule("/audio-processor.js");

      const sourceNode = audioContext.createMediaStreamSource(stream);
      sourceNodeRef.current = sourceNode;

      const workletNode = new AudioWorkletNode(
        audioContext,
        "audio-processor",
        {
          numberOfInputs: 1,
          numberOfOutputs: 1,
          processorOptions: {
            bufferSize: 2048,
            minDecibels,
          },
        }
      );
      workletNodeRef.current = workletNode;

      workletNode.port.onmessage = (event) => {
        // ref를 통해 최신 상태 확인
        if (
          !recordingStateRef.current.isRecording ||
          !recordingStateRef.current.isConnected
        )
          return;

        const audioData = event.data as Int16Array;
        const hasAudio = audioData.some(
          (sample: number) => Math.abs(sample) > 100
        );

        if (hasAudio) {
          sendAudioData(audioData);
        }
      };

      sourceNode.connect(workletNode);
      workletNode.connect(audioContext.destination);

      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = useCallback(() => {
    setIsRecording(false);

    if (workletNodeRef.current && sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      workletNodeRef.current.disconnect();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    sourceNodeRef.current = null;
    workletNodeRef.current = null;
    streamRef.current = null;
    audioContextRef.current = null;
  }, []);

  useEffect(() => {
    if (isInterrupted && isRecording) {
      stopRecording();
    }
  }, [isInterrupted, isRecording, stopRecording]);

  return {
    isRecording,
    isConnected,
    startRecording,
    stopRecording,
  };
}

export default useVoiceRecorder;
