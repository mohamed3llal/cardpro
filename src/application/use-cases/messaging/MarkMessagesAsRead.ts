import { AppError } from "../../../shared/errors/AppError";
import { IMessagingRepository } from "../../../domain/interfaces/IMessagingRepository";

export class MarkMessagesAsRead {
  constructor(private messagingRepository: IMessagingRepository) {}

  async execute(userId: string, conversationId: string): Promise<void> {
    // Verify conversation exists and user has access
    const conversation = await this.messagingRepository.getConversationById(
      conversationId
    );

    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    if (conversation.userId !== userId && conversation.businessId !== userId) {
      throw new AppError(
        "You are not authorized to access this conversation",
        403
      );
    }

    // Mark messages as read
    await this.messagingRepository.markMessagesAsRead(conversationId, userId);

    // Reset unread count
    await this.messagingRepository.resetUnreadCount(conversationId, userId);
  }
}

// src/application/use-cases/messaging/DeleteConversation.ts
export class DeleteConversation {
  constructor(private messagingRepository: IMessagingRepository) {}

  async execute(userId: string, conversationId: string): Promise<void> {
    // Verify conversation exists and user has access
    const conversation = await this.messagingRepository.getConversationById(
      conversationId
    );

    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    if (conversation.userId !== userId && conversation.businessId !== userId) {
      throw new AppError(
        "You are not authorized to delete this conversation",
        403
      );
    }

    // Delete all messages in conversation
    await this.messagingRepository.deleteMessagesByConversationId(
      conversationId
    );

    // Delete conversation
    await this.messagingRepository.deleteConversation(conversationId);
  }
}
