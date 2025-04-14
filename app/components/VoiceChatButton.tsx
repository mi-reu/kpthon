import Image from "next/image";

interface VoiceChatButtonProps {
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

const VoiceChatButton = ({
  loading = false,
  onClick,
  className = "",
}: VoiceChatButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-16 h-16 rounded-full bg-[#FFFF00] flex items-center justify-center transition-all hover:bg-[#FFD700] ${
        loading ? "animate-pulse" : ""
      } ${className}`}
    >
      {loading ? (
        <Image
          src="/voice-loading.svg"
          alt="Voice Recording"
          width={32}
          height={32}
          priority
          className="filter brightness-0"
        />
      ) : (
        <Image
          src="/voice-chat.svg"
          alt="Voice Chat"
          width={32}
          height={32}
          priority
          className="filter brightness-0"
        />
      )}
    </button>
  );
};

export default VoiceChatButton;
