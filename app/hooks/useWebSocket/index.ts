import { MessageData } from "@/app/stores/chat";
import { useEffect, useState, useCallback, useRef } from "react";

let globalSocket: WebSocket | null = null;
let messageHandlers: ((data: MessageData) => void)[] = [];

interface Props {
  onMessage?: (message: MessageData) => void;
}

function useWebSocket({ onMessage }: Props = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const onMessageRef = useRef<Props["onMessage"]>(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (globalSocket) {
      setIsConnected(globalSocket.readyState === WebSocket.OPEN);
      if (onMessage) {
        messageHandlers.push(onMessage);
      }
      return;
    }

    const ws = new WebSocket("ws://54.91.104.162:8080/ws/v2/chat");
    // 제이코 로컬
    // const ws = new WebSocket("ws://192.168.33.29:8000/ws/voice");
    // 그랙 로컬
    // const ws = new WebSocket("ws://192.168.32.223:8080/ws/v2/chat");
    globalSocket = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onclose = () => {
      setIsConnected(false);
      globalSocket = null;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        messageHandlers.forEach((handler) => handler(data));
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    if (onMessage) {
      messageHandlers.push(onMessage);
    }

    return () => {
      if (onMessage) {
        messageHandlers = messageHandlers.filter(
          (handler) => handler !== onMessage
        );
      }
      if (messageHandlers.length === 0 && globalSocket) {
        globalSocket.close();
        globalSocket = null;
      }
    };
  }, [onMessage]);

  const sendAudioData = useCallback((audioData: Int16Array) => {
    if (globalSocket?.readyState === WebSocket.OPEN) {
      globalSocket.send(audioData.buffer);
    }
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (globalSocket?.readyState === WebSocket.OPEN) {
      globalSocket.send(message);
    }
  }, []);

  return {
    isConnected,
    sendAudioData,
    sendMessage,
  };
}

export default useWebSocket;
