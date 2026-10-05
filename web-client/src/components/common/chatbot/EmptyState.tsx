import { Flame, History, Sparkles } from "lucide-react";

interface EmptyStateProps {
  onSelectSuggestion: (message: string) => void;
}

const suggestions = [
  { label: "Gợi ý món", message: "Gợi ý món ngon hôm nay", icon: Sparkles },
  { label: "Đơn gần đây", message: "Cho tôi xem đơn gần đây", icon: History },
  { label: "Món hot", message: "Món nào đang hot?", icon: Flame },
];

export default function EmptyState({ onSelectSuggestion }: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-[280px] flex-col items-center px-4 py-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Sparkles className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-extrabold text-slate-900">
        Xin chào, mình có thể giúp gì?
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Tìm món ngon, đặt lại đơn cũ hoặc hỏi trợ lý Foodee trong vài giây.
      </p>

      <div className="mt-5 grid w-full gap-2">
        {suggestions.map((suggestion) => {
          const Icon = suggestion.icon;
          return (
            <button
              key={suggestion.label}
              type="button"
              onClick={() => onSelectSuggestion(suggestion.message)}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-bold text-slate-800 shadow-sm transition hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Icon className="h-4 w-4 text-primary" />
              {suggestion.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
