import {
  IMessagingRepository,
  IPaginationOptions,
  IPaginationResult,
} from "@domain/interfaces/IMessagingRepository";
import { Message } from "@domain/entities/Messaging";
import { AppError } from "@shared/errors/AppError";

export interface GetMessagesDTO {
  userId: string;
  conversationId: string;
  options: IPaginationOptions;
}

export class GetMessagesUseCase {
  constructor(private messagingRepository: IMessagingRepository) {}

  async execute(dto: GetMessagesDTO): Promise<IPaginationResult<Message>> {
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

    return await this.messagingRepository.getMessagesByConversationId(
      dto.conversationId,
      dto.options
    );
  }
}
