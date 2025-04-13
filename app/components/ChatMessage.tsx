import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";

interface ChatMessageProps {
  isUser?: boolean;
  children: ReactNode;
  // messageId?: string;
  isNewMessage?: boolean;
}

const ChatMessage = ({
  isUser = false,
  children,
  // messageId,
  isNewMessage = false,
}: ChatMessageProps) => {
  const [visible, setVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setVisible(true);
    }, 250);
  }, []);

  useEffect(() => {
    if (isUser || !isNewMessage) {
      setDisplayedText(children as string);
      setIsTypingComplete(true);
      return;
    }

    const text = children as string;
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTypingComplete(true);
      }
    }, 100); // 타이핑 속도 조절 (ms)

    return () => clearInterval(typingInterval);
  }, [children, isUser, isNewMessage]);

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } mb-4 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`flex items-start gap-2 transition-transform duration-300 ${
          visible
            ? "translate-x-0"
            : isUser
            ? "translate-x-4"
            : "-translate-x-4"
        }`}
      >
        {!isUser && (
          <div className="w-8 h-8 rounded-full overflow-hidden relative">
            <Image
              src="/ai-jordy.png"
              alt="AI"
              fill
              sizes="32px"
              className="object-contain"
              priority
            />
          </div>
        )}
        <div
          className={`px-4 py-2 rounded-2xl max-w-[80%] ${
            isUser ? "bg-[#374151] text-white" : "bg-white text-gray-900"
          }`}
        >
          {displayedText}
          {!isTypingComplete && <span className="animate-pulse">|</span>}
        </div>
        {isUser && (
          <div className="w-8 h-8 rounded-full overflow-hidden relative">
            <Image
              src="/user-avatar.svg"
              alt="User"
              fill
              sizes="32px"
              className="object-contain"
              priority
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
