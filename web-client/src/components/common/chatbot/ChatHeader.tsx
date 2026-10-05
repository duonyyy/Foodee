import { X } from "lucide-react";
import Image from "next/image";

interface ChatHeaderProps {
  onClose: () => void;
}

export default function ChatHeader({ onClose }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="relative h-11 w-11 overflow-hidden rounded-2xl bg-primary/10 shadow-sm ring-1 ring-primary/15">
            <Image
              src="/mascot_background_removed.png"
              alt="Foodee Assistant"
              fill
              sizes="44px"
              className="object-cover object-center"
            />
          </div>
          <span
            className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400"
            aria-label="Đang online"
          />
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-slate-950">
            Foodee Assistant
          </h2>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            Trợ lý đặt món
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Đóng chatbot"
      >
        <X className="h-4.5 w-4.5" />
      </button>
    </header>
  );
}
