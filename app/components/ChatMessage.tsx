import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";

interface ChatMessageProps {
  isUser?: boolean;
  children: ReactNode;
}

const ChatMessage = ({ isUser = false, children }: ChatMessageProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setVisible(true);
    }, 250);
  }, []);

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
          {children}
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
