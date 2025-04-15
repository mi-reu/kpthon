import { useRef, useState, useCallback, useEffect } from "react";

interface Props {
  sendMessage: (audioData: Int16Array) => void;
  isConnected: boolean;
  isPlaying: boolean;
}

function useVoiceRecorder({ sendMessage, isConnected, isPlaying }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isPausedRef = useRef(false);

  // 최신 상태를 추적하기 위한 ref
  const recordingStateRef = useRef({ isRecording, isConnected, isPlaying });

  // 상태가 변경될 때마다 ref 업데이트
  useEffect(() => {
    recordingStateRef.current = { isRecording, isConnected, isPlaying };
  }, [isRecording, isConnected, isPlaying]);

  const pauseRecording = useCallback(() => {
    isPausedRef.current = true;
  }, []);

  const resumeRecording = useCallback(() => {
    isPausedRef.current = false;
  }, []);

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
            dbThreshold: -30,
          },
        }
      );
      workletNodeRef.current = workletNode;

      let lastReceived = Date.now();

      workletNode.port.onmessage = (event) => {
        if (
          !recordingStateRef.current.isRecording ||
          !recordingStateRef.current.isConnected ||
          isPausedRef.current ||
          recordingStateRef.current.isPlaying
        )
          return;

        const audioData = event.data as Int16Array;
        const hasAudio = audioData.some(
          (sample: number) => Math.abs(sample) > 100
        );

        if (hasAudio) {
          lastReceived = Date.now();
          const CHUNK_SIZE = 4000;
          for (let i = 0; i < audioData.length; i += CHUNK_SIZE) {
            const chunk = audioData.slice(i, i + CHUNK_SIZE);
            sendMessage(chunk);
          }
        }
      };

      // 무음 감지 및 덤프 전송용 루프
      setInterval(() => {
        const now = Date.now();
        const silenceTimeout = 300; // ms
        if (now - lastReceived > silenceTimeout) {
          const silence = new Int16Array(2048); // 무음 덤프
          sendMessage(silence);
          lastReceived = now; // 중복 방지
        }
      }, 100);

      sourceNode.connect(workletNode);
      workletNode.connect(audioContext.destination);

      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = useCallback(() => {
    if (isRecording) {
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
    }
  }, [isRecording]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  };
}

export default useVoiceRecorder;
