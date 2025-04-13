import { useEffect, useState, useCallback, useRef } from "react";

interface Props {
  onMessage?: (message: { audio: string; isLast: boolean }) => void;
}

function useWebSocket({ onMessage }: Props) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef<Props["onMessage"]>(onMessage);

  // onMessage 참조를 최신으로 유지
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket("ws://3.83.110.83:8080/ws/chat");
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessageRef.current?.(data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      // 컴포넌트가 언마운트될 때만 연결을 닫음
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const sendAudioData = useCallback((audioData: Int16Array) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(audioData.buffer);
    }
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    }
  }, []);

  return {
    isConnected,
    sendMessage,
    sendAudioData,
  };
}

export default useWebSocket;
