import { Send } from "lucide-react";
import { FormEvent, KeyboardEvent } from "react";

interface ChatInputProps {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function ChatInput({
  value,
  disabled,
  onChange,
  onSubmit,
}: ChatInputProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-slate-200 bg-white p-3"
      aria-label="Gửi tin nhắn"
    >
      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 transition-colors focus-within:border-primary/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/15">
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
          className="min-w-0 flex-1 bg-transparent px-1 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
          aria-label="Nội dung tin nhắn"
        />
        <button
          type="submit"
          disabled={!canSend}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={disabled ? "Đang chờ trợ lý trả lời" : "Gửi tin nhắn"}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
