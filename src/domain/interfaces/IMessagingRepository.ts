import {
  Conversation,
  Message,
  NotificationSettings,
} from "@domain/entities/Messaging";

export interface IMessagingRepository {
  getConversations(
    userId: string,
    filter: any,
    page: number,
    limit: number
  ): Promise<{ conversations: Conversation[]; total: number }>;
  getConversationById(id: string): Promise<Conversation | null>;
  startConversation(
    userId: string,
    businessId: string,
    initialMessage: string
  ): Promise<{ conversation: Conversation; message: Message }>;
  archiveConversation(
    id: string,
    userId: string,
    isArchived: boolean
  ): Promise<Conversation>;
  getMessages(
    conversationId: string,
    userId: string,
    page: number,
    limit: number
  ): Promise<{ messages: Message[]; total: number }>;
  sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: string,
    attachments: any[]
  ): Promise<Message>;
  getUnreadCount(
    userId: string
  ): Promise<{ unread_count: number; conversations_with_unread: number }>;
  updateNotificationSettings(
    userId: string,
    data: Partial<NotificationSettings>
  ): Promise<NotificationSettings>;
}
