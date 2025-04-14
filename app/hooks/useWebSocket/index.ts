import { useEffect, useState, useCallback, useRef } from "react";
import { MessageData } from "@/app/stores/chat";

interface Props {
  onMessage?: (data: MessageData) => void;
}

function useWebSocket({ onMessage }: Props = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const onMessageRef = useRef<Props["onMessage"]>(onMessage);
  const socketRef = useRef<WebSocket | null>(null);
  const messageHandlersRef = useRef<((data: MessageData) => void)[]>([]);

  // onMessage 핸들러 메모이제이션
  const memoizedOnMessage = useCallback((data: MessageData) => {
    onMessageRef.current?.(data);
  }, []);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (socketRef.current) {
      setIsConnected(socketRef.current.readyState === WebSocket.OPEN);
      if (memoizedOnMessage) {
        messageHandlersRef.current.push(memoizedOnMessage);
      }
      return;
    }

    const ws = new WebSocket("ws://54.91.104.162:8080/ws/v2/chat");
    // 제이코 로컬
    // const ws = new WebSocket("ws://192.168.33.29:8000/ws/voice");
    // 그랙 로컬
    // const ws = new WebSocket("ws://192.168.32.223:8080/ws/v2/chat");
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onclose = () => {
      setIsConnected(false);
      socketRef.current = null;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        messageHandlersRef.current.forEach((handler) => handler(data));
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    if (memoizedOnMessage) {
      messageHandlersRef.current.push(memoizedOnMessage);
    }

    return () => {
      if (memoizedOnMessage) {
        messageHandlersRef.current = messageHandlersRef.current.filter(
          (handler) => handler !== memoizedOnMessage
        );
      }
      if (messageHandlersRef.current.length === 0 && socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [memoizedOnMessage]);

  const sendMessage = useCallback((message: Int16Array) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(message.buffer);
    }
  }, []);

  return {
    isConnected,
    sendMessage,
    socketRef,
  };
}

export default useWebSocket;
