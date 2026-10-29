/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { userApi } from "@/api/user";
import { useAuth } from "@/context/auth-context";
import {
  Conversation,
  Message,
  ConversationType,
  SendMessageDto,
} from "@/interface";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useParams } from "next/navigation";
import {
  MessageCircle,
  Send,
  Phone,
  User,
  Clock,
  Search,
  Check,
  CheckCheck,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubscription } from "@apollo/client";
import {
  MESSAGE_SENT_SUBSCRIPTION,
  MESSAGES_READ_SUBSCRIPTION,
} from "@/lib/graphql/subcriptions/messengerSubscriptions";
import { Textarea } from "@/components/ui/textarea";

const QUICK_REPLIES = [
  "Dạ quán đang chuẩn bị món ngay ạ! 🍳",
  "Món sẽ sẵn sàng giao trong 10-15 phút ạ 🛵",
  "Quán đã nhận được ghi chú của bạn rồi nhé! ✨",
  "Cảm ơn bạn đã tin tưởng ủng hộ quán! ❤️",
];

const RestaurantMessengerPage = () => {
  const { user, getToken } = useAuth();
  const params = useParams();
  const restaurantId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Subscription for new messages in selected conversation
  const { data: newMessageData, error: messageError } = useSubscription(
    MESSAGE_SENT_SUBSCRIPTION,
    {
      variables: { conversationId: selectedConversation?.id || "" },
      skip: !selectedConversation?.id,
      onError: (error) => {
        console.error("Message subscription error:", error);
        setConnectionError("Không thể kết nối dịch vụ chat thời gian thực");
      },
      onData: ({ data }) => {
        if (data.data?.messageSent) {
          const newMsg = data.data.messageSent;
          setShouldAutoScroll(true);

          setMessages((prev) => {
            if (prev.some((msg) => msg.id === newMsg.id)) {
              return prev;
            }
            const hasTemp = prev.some(
              (msg) =>
                msg.id.startsWith("temp_") &&
                msg.content === newMsg.content &&
                msg.sender.id === newMsg.sender.id,
            );
            if (hasTemp) {
              return prev.map((msg) =>
                msg.id.startsWith("temp_") &&
                msg.content === newMsg.content &&
                msg.sender.id === newMsg.sender.id
                  ? newMsg
                  : msg,
              );
            }
            return [...prev, newMsg];
          });

          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === newMsg.conversation.id
                ? {
                    ...conv,
                    lastMessage: newMsg.content,
                    lastMessageAt: new Date(newMsg.createdAt),
                  }
                : conv,
            ),
          );
        }
      },
    },
  );

  // Subscription for read receipts
  const { data: messagesReadData, error: readError } = useSubscription(
    MESSAGES_READ_SUBSCRIPTION,
    {
      variables: { conversationId: selectedConversation?.id || "" },
      skip: !selectedConversation?.id,
      onError: (error) => {
        console.error("Read receipts subscription error:", error);
      },
      onData: ({ data }) => {
        if (data.data?.messagesRead) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.sender.id === user?.id
                ? { ...msg, isRead: true, readAt: new Date() }
                : msg,
            ),
          );
        }
      },
    },
  );

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const response = await userApi.messenger.getUserConversations(token);
      const restaurantConversations = response.items.filter(
        (conv) =>
          conv.conversationType === ConversationType.CUSTOMER_SHOP &&
          conv.restaurantId === restaurantId,
      );
      setConversations(restaurantConversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [getToken, restaurantId]);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      try {
        const token = await getToken();
        if (!token) return;

        const response = await userApi.messenger.getConversationMessages(
          token,
          conversationId,
        );
        setMessages(response.items || []);
        await userApi.messenger.markMessagesAsRead(token, conversationId);
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    },
    [getToken],
  );

  const sendMessage = useCallback(
    async (contentToSend?: string) => {
      const text = contentToSend || newMessage.trim();
      if (!text || !selectedConversation || sendingMessage || !user) return;

      const tempId = `temp_${Date.now()}`;

      try {
        setSendingMessage(true);
        setShouldAutoScroll(true);
        const token = await getToken();
        if (!token) return;

        const tempMessage: Message = {
          id: tempId,
          content: text,
          sender: user,
          conversation: selectedConversation,
          messageType: "text",
          isRead: false,
          isEdited: false,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setMessages((prev) => [...prev, tempMessage]);
        if (!contentToSend) setNewMessage("");

        const messageData: SendMessageDto = {
          conversationId: selectedConversation.id,
          content: text,
          messageType: "text",
        };

        const sentMessage = await userApi.messenger.sendMessage(
          token,
          messageData,
        );

        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? sentMessage : msg)),
        );
      } catch (error) {
        console.error("Error sending message:", error);
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        if (!contentToSend) setNewMessage(text);
      } finally {
        setSendingMessage(false);
      }
    },
    [newMessage, selectedConversation, sendingMessage, user, getToken],
  );

  useEffect(() => {
    const token = getToken();
    if (token) {
      setConnectionError(null);
    }
  }, [getToken]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (shouldAutoScroll && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, shouldAutoScroll]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  const getCustomer = useCallback(
    (conversation: Conversation) => {
      return conversation.participant1.id === user?.id
        ? conversation.participant2
        : conversation.participant1;
    },
    [user?.id],
  );

  const formatTime = useCallback((date: Date | string) => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return "";
    }
  }, []);

  const handleConversationSelect = useCallback(
    (conversation: Conversation) => {
      setShouldAutoScroll(true);
      setSelectedConversation(conversation);
      loadMessages(conversation.id);
    },
    [loadMessages],
  );

  const filteredConversations = conversations.filter((conv) => {
    const customer = getCustomer(conv);
    return (
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="h-[calc(100vh-130px)] min-h-[580px] rounded-2xl border border-border bg-card shadow-2xs overflow-hidden flex flex-col">
      {/* Real-time Connection Warning Banner */}
      {connectionError && (
        <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{connectionError}. Tin nhắn có thể tải chậm hơn bình thường.</span>
          </div>
          <button
            onClick={() => {
              setConnectionError(null);
              window.location.reload();
            }}
            className="font-semibold underline hover:text-amber-900"
          >
            Làm mới
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - Conversations List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-card shrink-0 transition-all ${
            selectedConversation ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-border/70 bg-muted/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    Tin nhắn khách hàng
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    {filteredConversations.length} cuộc hội thoại
                  </p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm khách hàng theo tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 rounded-xl bg-card text-xs"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-muted rounded animate-pulse w-3/5" />
                      <div className="h-2.5 bg-muted rounded animate-pulse w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
                  <MessageCircle className="w-6 h-6 opacity-60" />
                </div>
                <h3 className="text-xs font-bold text-foreground">
                  Chưa có tin nhắn nào
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Khách hàng sẽ xuất hiện tại đây khi họ nhắn tin hỏi về món ăn
                  hoặc đơn hàng
                </p>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const customer = getCustomer(conversation);
                const isSelected =
                  selectedConversation?.id === conversation.id;
                return (
                  <button
                    type="button"
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation)}
                    className={`w-full text-left p-3.5 flex items-center gap-3 transition-colors ${
                      isSelected
                        ? "bg-primary/10 border-l-4 border-l-primary"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm">
                        {customer.name?.charAt(0) || "U"}
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-baseline justify-between gap-1">
                        <p className="text-xs font-bold text-foreground truncate">
                          {customer.name}
                        </p>
                        {conversation.lastMessageAt && (
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {formatTime(conversation.lastMessageAt)}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground truncate">
                        {conversation.lastMessage || "Bắt đầu cuộc trò chuyện..."}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={`flex-1 flex flex-col bg-muted/15 ${
            !selectedConversation ? "hidden md:flex" : "flex"
          }`}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 border-b border-border/70 bg-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden h-8 w-8 p-0 rounded-lg"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>

                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">
                      {getCustomer(selectedConversation).name?.charAt(0) || "U"}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-card" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {getCustomer(selectedConversation).name}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="text-emerald-600 font-medium">
                        Khách hàng
                      </span>
                      {getCustomer(selectedConversation).phone && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {getCustomer(selectedConversation).phone}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3"
              >
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                      <Sparkles className="w-6 h-6 text-primary/70" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">
                      Bắt đầu cuộc trò chuyện với khách hàng
                    </p>
                    <p className="text-[11px] text-muted-foreground max-w-xs">
                      Gửi tin nhắn chào mừng hoặc phản hồi các câu hỏi của thực
                      khách về thực đơn
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwn = message.sender?.id === user?.id;
                    const isTemp = message.id?.startsWith("temp_");

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[82%] sm:max-w-md px-4 py-2.5 shadow-2xs space-y-1 ${
                            isOwn
                              ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-xs"
                              : "bg-card text-foreground border border-border/80 rounded-2xl rounded-tl-xs"
                          }`}
                        >
                          <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed break-words">
                            {message.content}
                          </p>
                          <div
                            className={`flex items-center justify-end gap-1.5 text-[10px] ${
                              isOwn
                                ? "text-primary-foreground/75"
                                : "text-muted-foreground"
                            }`}
                          >
                            <span>{formatTime(message.createdAt)}</span>
                            {isOwn && (
                              <span>
                                {isTemp ? (
                                  <Clock className="w-2.5 h-2.5 animate-spin inline" />
                                ) : message.isRead ? (
                                  <CheckCheck className="w-3 h-3 inline text-white" />
                                ) : (
                                  <Check className="w-3 h-3 inline" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Chips */}
              <div className="px-4 py-2 border-t border-border/50 bg-card flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-bold text-muted-foreground shrink-0 mr-1">
                  Gợi ý nhanh:
                </span>
                {QUICK_REPLIES.map((reply, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendMessage(reply)}
                    disabled={sendingMessage}
                    className="text-[11px] font-medium px-3 py-1 rounded-full bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors border border-border/70 shrink-0 whitespace-nowrap"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Message Input Box */}
              <div className="p-3.5 border-t border-border bg-card">
                <div className="flex items-center gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Nhập phản hồi cho khách hàng (Nhấn Enter để gửi)..."
                    rows={1}
                    className="min-h-10 max-h-24 resize-none rounded-xl text-xs py-2.5"
                    disabled={sendingMessage}
                  />

                  <Button
                    onClick={() => sendMessage()}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="h-10 px-4 rounded-xl font-bold shrink-0 shadow-xs"
                  >
                    {sendingMessage ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                <MessageCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Chọn cuộc hội thoại
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  Chọn một khách hàng từ danh sách bên trái để xem tin nhắn và
                  trực tiếp hỗ trợ họ
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantMessengerPage;