import { Conversation } from "../entities/Conversation";
import { Message } from "../entities/Messaging";

export interface IPaginationOptions {
  page: number;
  limit: number;
}

export interface IPaginationResult<T> {
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    limit: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface IMessagingRepository {
  // Conversations
  createConversation(
    userId: string,
    businessId: string,
    initialMessage?: string
  ): Promise<Conversation>;
  getConversationById(conversationId: string): Promise<Conversation | null>;
  getConversationsByUserId(
    userId: string,
    options: IPaginationOptions
  ): Promise<IPaginationResult<Conversation>>;
  getConversationsByBusinessId(
    businessId: string,
    options: IPaginationOptions
  ): Promise<IPaginationResult<Conversation>>;
  updateConversation(
    conversationId: string,
    lastMessage: string,
    lastMessageAt: Date
  ): Promise<void>;
  incrementUnreadCount(conversationId: string, userId: string): Promise<void>;
  resetUnreadCount(conversationId: string, userId: string): Promise<void>;
  deleteConversation(conversationId: string): Promise<void>;
  conversationExists(
    userId: string,
    businessId: string
  ): Promise<string | null>;

  // Messages
  createMessage(message: Message): Promise<Message>;
  getMessagesByConversationId(
    conversationId: string,
    options: IPaginationOptions
  ): Promise<IPaginationResult<Message>>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<number>;
  deleteMessagesByConversationId(conversationId: string): Promise<void>;
}
