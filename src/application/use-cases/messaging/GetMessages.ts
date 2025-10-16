import { IMessagingRepository } from "../../../domain/interfaces/IMessagingRepository";

import { Message } from "../../../domain/entities/Messaging";
import { AppError } from "../../../shared/errors/AppError";
import { PaginationDTO } from "../../dtos/MessagingDTO";

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
export class GetMessages {
  constructor(private messagingRepository: IMessagingRepository) {}

  async execute(
    userId: string,
    conversationId: string,
    options: PaginationDTO
  ): Promise<IPaginationResult<Message>> {
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

    return await this.messagingRepository.getMessagesByConversationId(
      conversationId,
      options
    );
  }
}
