import { Message, Conversation, CreateConversationDto, SendMessageDto } from "@/interface";
import { apiRequest } from "../base-api";
import type { PaginatedResponse } from "../types";

export const messengerApi = {
  createOrGetConversation: (token?: string, data?: CreateConversationDto): Promise<Conversation> =>
    apiRequest<Conversation>('/messenger/conversations', 'POST', { token, data }),

  getUserConversations: (token?: string, page = 1, pageSize = 10): Promise<PaginatedResponse<Conversation>> =>
    apiRequest<PaginatedResponse<Conversation>>('/messenger/conversations', 'GET', {
      token, query: { page, pageSize },
    }),

  sendMessage: (token?: string, data?: SendMessageDto): Promise<Message> =>
    apiRequest<Message>('/messenger/messages', 'POST', { token, data }),

  getConversationMessages: (token?: string, conversationId?: string, page = 1, pageSize = 20): Promise<PaginatedResponse<Message>> =>
    apiRequest<PaginatedResponse<Message>>(
      `/messenger/conversations/${conversationId}/messages`, 'GET',
      { token, query: { page, pageSize } }
    ),

  markMessagesAsRead: (token?: string, conversationId?: string): Promise<{ success: boolean }> =>
    apiRequest<{ success: boolean }>(`/messenger/conversations/${conversationId}/read`, 'PUT', { token }),

  deleteMessage: (token?: string, messageId?: string): Promise<{ success: boolean }> =>
    apiRequest<{ success: boolean }>(`/messenger/messages/${messageId}`, 'DELETE', { token }),

  toggleBlockConversation: (token?: string, conversationId?: string): Promise<Conversation> =>
    apiRequest<Conversation>(`/messenger/conversations/${conversationId}/block`, 'PUT', { token }),

  getUnreadMessageCount: (token?: string): Promise<{ unreadCount: number }> =>
    apiRequest<{ unreadCount: number }>('/messenger/unread-count', 'GET', { token }),

  getAvailableChatPartners: (token?: string): Promise<unknown> =>
    apiRequest('/messenger/available-partners', 'GET', { token }),
};
