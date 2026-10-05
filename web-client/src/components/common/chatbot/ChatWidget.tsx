"use client";

import { useAuth } from "@/context/auth-context";
import { X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import EmptyState from "./EmptyState";
import TypingIndicator from "./TypingIndicator";
import type {
  ChatApiResponse,
  ChatMessageModel,
  ChatMetadata,
  FoodSuggestion,
} from "./types";

const isClient = typeof window !== "undefined";
const sendSound = isClient ? new Audio("/sounds/send.mp3") : null;
const receiveSound = isClient
  ? new Audio("/sounds/receive.mp3")
  : null;
const MASCOT_IMAGE_SRC = "/mascot_background_removed.png";
const FALLBACK_MASCOT_IMAGE_SRC = "/bot-avatar.png";

const initialMetadata: ChatMetadata = {
  orderItems: [],
  addresses: [],
  isOrdering: false,
  isFoodConfirmed: false,
  isRestaurantConfirmed: false,
  isAddressConfirmed: false,
  isPaymentConfirmed: false,
  isQuickReorder: false,
  quickOrderOptions: [],
};

const createMessage = (
  from: ChatMessageModel["from"],
  data: Pick<ChatMessageModel, "text" | "foodCards">,
): ChatMessageModel => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  from,
  createdAt: new Date(),
  ...data,
});

const getReplyText = (data: ChatApiResponse) => {
  if (typeof data.reply === "string") return data.reply;
  return data.reply?.reply || "Bot không trả lời được.";
};

const getSuggestions = (data: ChatApiResponse): FoodSuggestion[] => {
  if (
    typeof data.reply !== "string" &&
    Array.isArray(data.reply?.suggestions)
  ) {
    return data.reply.suggestions;
  }

  return Array.isArray(data.suggestions) ? data.suggestions : [];
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageModel[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showLauncherPrompt, setShowLauncherPrompt] = useState(true);
  const [mascotSrc, setMascotSrc] = useState(MASCOT_IMAGE_SRC);
  const [metadata, setMetadata] =
    useState<ChatMetadata>(initialMetadata);

  const chatRef = useRef<HTMLDivElement>(null);
  const { getToken } = useAuth();
  const hasUnreadBotMessage =
    !open && messages.some((message) => message.from === "bot");

  useEffect(() => {
    localStorage.setItem("metadata", JSON.stringify(metadata));
  }, [metadata]);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping, open]);

  const sendMessage = useCallback(
    async (messageOverride?: string) => {
      const messageToSend = (messageOverride ?? input).trim();
      if (!messageToSend || isTyping) return;

      setMessages((prev) => [
        ...prev,
        createMessage("user", { text: messageToSend }),
      ]);
      sendSound?.play();
      setInput("");
      setIsTyping(true);

      try {
        const token = await getToken();
        if (!token) {
          console.error("[AUTH] Token không tồn tại!");
          throw new Error("Chưa đăng nhập hoặc token không tồn tại");
        }

        const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');
        const res = await fetch(
          `${apiBase}/chat`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userMessage: messageToSend,
              metadata,
            }),
          },
        );

        if (!res.ok) {
          const error = (await res.json()) as { message?: string };
          throw new Error(
            error.message || "Lỗi không xác định từ server",
          );
        }

        const data = (await res.json()) as ChatApiResponse;
        console.log("[BOT REPLY]", data);

        setMessages((prev) => [
          ...prev,
          createMessage("bot", {
            text: getReplyText(data),
            foodCards: getSuggestions(data),
          }),
        ]);

        setMetadata((prev) => ({
          ...prev,
          isOrdering: data.metadata?.isOrdering ?? prev.isOrdering,
          isFoodConfirmed:
            data.metadata?.isFoodConfirmed ?? prev.isFoodConfirmed,
          isRestaurantConfirmed:
            data.metadata?.isRestaurantConfirmed ??
            prev.isRestaurantConfirmed,
          isAddressConfirmed:
            data.metadata?.isAddressConfirmed ??
            prev.isAddressConfirmed,
          isPaymentConfirmed:
            data.metadata?.isPaymentConfirmed ??
            prev.isPaymentConfirmed,
          orderItems: data.metadata?.orderItems ?? prev.orderItems,
          quickOrderOptions:
            data.metadata?.quickOrderOptions ??
            prev.quickOrderOptions,
          isQuickReorder:
            data.metadata?.isQuickReorder ?? prev.isQuickReorder,
        }));

        receiveSound?.play();
      } catch (err) {
        if (err instanceof Error) {
          console.log("[BOT ERROR]", err.message);
          console.log("[BOT ERROR STACK]", err.stack);
        } else {
          console.log("[BOT ERROR]", err);
        }

        setMessages((prev) => [
          ...prev,
          createMessage("bot", {
            text: "Xin lỗi, đã có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.",
          }),
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [getToken, input, isTyping, metadata],
  );

  return (
    <section
      className="fixed bottom-4 right-4 z-[60] sm:bottom-6 sm:right-6"
      aria-label="Foodee Assistant"
    >
      <div
        className={`origin-bottom-right transition-all duration-300 ease-out ${
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-95 opacity-0"
        }`}
      >
        {open && (
          <div
            className="flex h-[70vh] w-[calc(100vw-24px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 sm:h-[560px] sm:w-[380px]"
            role="dialog"
            aria-modal="false"
            aria-labelledby="foodee-assistant-title"
          >
            <div id="foodee-assistant-title" className="sr-only">
              Foodee Assistant
            </div>
            <ChatHeader onClose={() => setOpen(false)} />

            <div
              ref={chatRef}
              className="flex-1 space-y-4 overflow-y-auto bg-slate-50/80 px-4 py-4"
              aria-live="polite"
            >
              {messages.length === 0 && !isTyping ? (
                <EmptyState onSelectSuggestion={sendMessage} />
              ) : (
                messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    metadata={metadata}
                    onSelectOrder={sendMessage}
                  />
                ))
              )}

              {isTyping && (
                <div className="flex gap-2">
                  <div
                    className="h-8 w-8 shrink-0"
                    aria-hidden="true"
                  />
                  <TypingIndicator />
                </div>
              )}
            </div>

            <ChatInput
              value={input}
              disabled={isTyping}
              onChange={setInput}
              onSubmit={() => sendMessage()}
            />
          </div>
        )}
      </div>

      {!open && (
        <div className="relative flex items-end justify-end gap-2 sm:gap-3">
          {showLauncherPrompt && (
            <div className="relative mb-12 hidden max-w-[236px] animate-[chat-slide-up_260ms_ease-out] sm:block">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="group rounded-2xl rounded-br-md border border-slate-200 bg-sky-100 px-5 py-4 text-left shadow-xl shadow-slate-900/12 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-sky-50 hover:shadow-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Mở hỗ trợ đặt món"
              >
                <span className="block text-sm font-extrabold text-slate-950">
                  Bạn cần hỗ trợ gì?
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Mình có thể gợi ý món, tìm đơn cũ hoặc hỗ trợ đặt
                  món.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setShowLauncherPrompt(false)}
                className="absolute -right-4 -top-4 flex h-11 w-11 items-center justify-center rounded-full bg-slate-600 text-white shadow-control transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Ẩn gợi ý hỗ trợ"
              >
                <X className="h-4 w-4" />
              </button>
              <span className="absolute -right-2 bottom-5 h-4 w-4 rotate-45 border-r border-t border-slate-200 bg-sky-100" />
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group relative flex h-[112px] w-[92px] items-end justify-center transition-transform duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:h-[140px] sm:w-[116px]"
            aria-label="Mở hỗ trợ đặt món"
          >
            <span className="absolute bottom-0 h-10 w-20 rounded-full bg-slate-900/10 blur-md sm:w-24" />
            <span className="relative h-full w-full drop-shadow-2xl">
              <Image
                src={mascotSrc}
                alt=""
                fill
                sizes="116px"
                className="object-contain object-bottom"
                priority={false}
                onError={() =>
                  setMascotSrc(FALLBACK_MASCOT_IMAGE_SRC)
                }
              />
            </span>
            {hasUnreadBotMessage && (
              <span
                className="absolute right-2 top-3 h-4 w-4 rounded-full border-2 border-white bg-red-500 shadow-sm"
                aria-label="Có tin nhắn mới"
              />
            )}
          </button>
        </div>
      )}
    </section>
  );
}
