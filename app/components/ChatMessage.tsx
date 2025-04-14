import { useEffect, useState } from "react";
import Image from "next/image";

interface ChatMessageProps {
  isUser?: boolean;
  text: string;
}

const ChatMessage = ({ isUser = false, text }: ChatMessageProps) => {
  const [visible, setVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState<string>("");

  useEffect(() => {
    setTimeout(() => {
      setVisible(true);
    }, 250);
  }, []);

  useEffect(() => {
    let currentIndex = 0;
    let result = "";

    const typingInterval = setInterval(() => {
      if (currentIndex < text.length) {
        if (text[currentIndex] === "<") {
          const tagEndIndex = text.indexOf(">", currentIndex);
          if (tagEndIndex !== -1) {
            result += text.slice(currentIndex, tagEndIndex + 1);
            currentIndex = tagEndIndex + 1;
          } else {
            result += text[currentIndex];
            currentIndex++;
          }
        } else {
          result += text[currentIndex];
          currentIndex++;
        }
        setDisplayedText(result);
      } else {
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [text]);

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
              src="/ai-avatar.png"
              alt="AI Avatar"
              fill
              sizes="32px"
              className="object-contain"
              priority
            />
          </div>
        )}
        <div
          className={`px-4 py-2 rounded-2xl max-w-[80%] ${
            isUser ? "bg-[#FFFF00] text-black" : "bg-white text-gray-900"
          }`}
        >
          <div dangerouslySetInnerHTML={{ __html: displayedText }} />
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
