import {
  IMessagingRepository,
  IPaginationResult,
} from "../../../domain/interfaces/IMessagingRepository";
import { Conversation } from "../../../domain/entities/Conversation";
import { PaginationDTO } from "../../dtos/MessagingDTO";
import { AppError } from "../../../shared/errors/AppError";

export class GetConversations {
  constructor(private messagingRepository: IMessagingRepository) {}

  async execute(
    userId: string,
    options: PaginationDTO
  ): Promise<IPaginationResult<Conversation>> {
    return await this.messagingRepository.getConversationsByUserId(
      userId,
      options
    );
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
