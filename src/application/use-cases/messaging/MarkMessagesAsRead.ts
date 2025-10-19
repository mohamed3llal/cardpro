import { IMessagingRepository } from "@domain/interfaces/IMessagingRepository";
import { AppError } from "@shared/errors/AppError";

export interface MarkMessagesAsReadDTO {
  userId: string;
  conversationId: string;
}

export class MarkMessagesAsReadUseCase {
  constructor(private messagingRepository: IMessagingRepository) {}

  async execute(dto: MarkMessagesAsReadDTO): Promise<number> {
    // Verify conversation exists and user has access
    const conversation = await this.messagingRepository.getConversationById(
      dto.conversationId
    );

    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    if (conversation.userId !== dto.userId) {
      throw new AppError("Access denied to this conversation", 403);
    }

    // Mark messages as read
    const markedCount = await this.messagingRepository.markMessagesAsRead(
      dto.conversationId,
      dto.userId
    );

    // Reset unread count
    await this.messagingRepository.resetUnreadCount(
      dto.conversationId,
      dto.userId
    );

    return markedCount;
  }
}
