import Image from "next/image";
import { cn } from "@/lib/utils";

interface VoiceChatModeButtonProps {
  className?: string;
  loading?: boolean;
  onClick?: () => void;
}

function VoiceChatModeButton({
  className,
  loading,
  onClick,
}: VoiceChatModeButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "active:scale-95 transition-transform duration-100",
        className
      )}
    >
      <Image
        src={loading ? "/voice-loading.svg" : "/voice-chat.svg"}
        alt="음성 모드 사용"
        width={100}
        height={100}
        priority
        onClick={onClick}
      />
    </button>
  );
}

export default VoiceChatModeButton;
