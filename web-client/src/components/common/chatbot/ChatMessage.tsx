import Image from "next/image";
import ChatFoodCard from "./FoodCard";
import OrderCard from "./OrderCard";
import type { ChatMessageModel, ChatMetadata } from "./types";

interface ChatMessageProps {
  message: ChatMessageModel;
  metadata: ChatMetadata;
  onSelectOrder: (message: string) => void;
}

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

export default function ChatMessage({
  message,
  metadata,
  onSelectOrder,
}: ChatMessageProps) {
  const isUser = message.from === "user";
  const showQuickReorder =
    !isUser &&
    message.text?.includes("Bạn muốn đặt lại đơn nào?") &&
    metadata.isQuickReorder &&
    Array.isArray(metadata.quickOrderOptions) &&
    metadata.quickOrderOptions.length > 0;

  return (
    <div
      className={`flex animate-[chat-slide-up_220ms_ease-out] gap-2 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="mt-1 h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white">
          <Image
            src="/mascot_background_removed.png"
            alt=""
            width={32}
            height={32}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className={`max-w-[82%] space-y-2 ${isUser ? "items-end" : ""}`}>
        {message.text && (
          <div
            className={`whitespace-pre-wrap break-words px-4 py-3 text-sm leading-6 shadow-sm ${
              isUser
                ? "rounded-2xl rounded-br-md bg-primary text-primary-foreground"
                : "rounded-2xl rounded-bl-md bg-slate-100 text-slate-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {!isUser && message.foodCards && message.foodCards.length > 0 && (
          <div className="grid gap-2">
            {message.foodCards.map((food) => (
              <ChatFoodCard key={food.id} food={food} />
            ))}
          </div>
        )}

        {showQuickReorder && (
          <div className="grid gap-2">
            {metadata.quickOrderOptions?.map((order, index) => (
              <OrderCard
                key={order.orderId || index}
                order={order}
                index={index}
                onSelect={onSelectOrder}
              />
            ))}
          </div>
        )}

        <p
          className={`px-1 text-[11px] font-medium text-slate-400 ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
