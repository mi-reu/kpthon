import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Props {
  url?: string;
}

function useVoiceRecorder({ url }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!url) return;

    // 웹소켓 연결 설정
    const newSocket = io(url); // 서버 주소는 실제 서버 주소로 변경 필요
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [url]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          // 웹소켓으로 오디오 데이터 전송
          socket?.emit("audioData", event.data);
        }
      };

      mediaRecorder.start(100); // 100ms마다 데이터를 수집
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
}

export default useVoiceRecorder;
