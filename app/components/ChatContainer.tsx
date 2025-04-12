import { ReactNode } from "react";

interface ChatContainerProps {
  children: ReactNode;
}

const ChatContainer = ({ children }: ChatContainerProps) => {
  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="space-y-4">{children}</div>
    </div>
  );
};

export default ChatContainer;
