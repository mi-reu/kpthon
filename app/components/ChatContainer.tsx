import { ReactNode, useEffect, useRef } from "react";

interface ChatContainerProps {
  children: ReactNode;
}

const ChatContainer = ({ children }: ChatContainerProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [children]);

  return (
    <div className="w-full max-w-3xl mx-auto p-4 pb-32">
      <div className="space-y-4">{children}</div>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatContainer;
