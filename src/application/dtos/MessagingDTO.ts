// src/application/dtos/MessagingDTO.ts
import { z } from "zod";

// Validation schemas
export const createConversationSchema = z.object({
  business_id: z.string().min(1, "Business ID is required"),
  initial_message: z
    .string()
    .max(2000, "Message must be less than 2000 characters")
    .refine(
      (content) => {
        const scriptPattern = /<script[^>]*>.*?<\/script>/gi;
        const jsPattern = /javascript:/gi;
        const eventPattern = /on\w+=/gi;
        return (
          !scriptPattern.test(content) &&
          !jsPattern.test(content) &&
          !eventPattern.test(content)
        );
      },
      { message: "Invalid message content" }
    )
    .optional(),
});

export const sendMessageSchema = z.object({
  conversation_id: z.string().min(1, "Conversation ID is required"),
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be less than 2000 characters")
    .refine(
      (content) => {
        const scriptPattern = /<script[^>]*>.*?<\/script>/gi;
        const jsPattern = /javascript:/gi;
        const eventPattern = /on\w+=/gi;
        return (
          !scriptPattern.test(content) &&
          !jsPattern.test(content) &&
          !eventPattern.test(content)
        );
      },
      { message: "Invalid message content" }
    ),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

// DTOs
export interface CreateConversationDTO {
  business_id: string;
  initial_message?: string;
}

export interface SendMessageDTO {
  conversation_id: string;
  content: string;
}

export interface PaginationDTO {
  page: number;
  limit: number;
}

export interface ConversationResponseDTO {
  id: string;
  business_id: string;
  business_name: string;
  business_avatar?: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  last_message?: string;
  last_message_at?: Date;
  unread_count: number;
  created_at: Date;
  updated_at?: Date;
}

export interface MessageResponseDTO {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  read: boolean;
  created_at: Date;
  updated_at?: Date;
}

export interface ConversationsListResponseDTO {
  conversations: ConversationResponseDTO[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    limit: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface MessagesListResponseDTO {
  messages: MessageResponseDTO[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    limit: number;
    has_next: boolean;
    has_prev: boolean;
  };
}
