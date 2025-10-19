import { IMessagingRepository } from "@domain/interfaces/IMessagingRepository";
import { AppError } from "@shared/errors/AppError";

export interface DeleteConversationDTO {
  userId: string;
  conversationId: string;
}

export class DeleteConversationUseCase {
  constructor(private messagingRepository: IMessagingRepository) {}

  async execute(dto: DeleteConversationDTO): Promise<void> {
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

    // Delete messages first
    await this.messagingRepository.deleteMessagesByConversationId(
      dto.conversationId
    );

    // Delete conversation
    await this.messagingRepository.deleteConversation(dto.conversationId);
  }
}
