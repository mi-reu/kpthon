interface AiMessageProps {
  message: string;
}

function AiMessage({ message }: AiMessageProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center font-semibold">
        AI
      </div>
      <div className="flex-1 bg-primary/10 rounded-lg p-4 text-foreground">
        {message}
      </div>
    </div>
  );
}

export default AiMessage;
