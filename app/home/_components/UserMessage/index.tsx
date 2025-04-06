interface UserMessageProps {
  message: string;
}

function UserMessage({ message }: UserMessageProps) {
  return (
    <div className="flex items-start gap-3 justify-end">
      <div className="flex-1 bg-primary text-primary-foreground rounded-lg p-4">
        {message}
      </div>
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
        U
      </div>
    </div>
  );
}

export default UserMessage;
