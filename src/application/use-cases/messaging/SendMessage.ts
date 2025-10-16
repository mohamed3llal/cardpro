import { IMessagingRepository } from "@domain/interfaces/IMessagingRepository";
import { AppError } from "@shared/errors/AppError";

export interface SendMessageDTO {
  conversationId: string;
  senderId: string;
  content: string;
  type: "text" | "image" | "file" | "location";
  attachments?: any[];
}

export class SendMessageUseCase {
  constructor(private messagingRepository: IMessagingRepository) {}

  async execute(dto: SendMessageDTO) {
    // Validate
    if (!dto.content || dto.content.trim().length === 0) {
      throw new AppError("Message content is required", 400);
    }

    if (dto.content.length > 2000) {
      throw new AppError("Message cannot exceed 2000 characters", 400);
    }

    // Send message
    const message = await this.messagingRepository.sendMessage(
      dto.conversationId,
      dto.senderId,
      dto.content.trim(),
      dto.type,
      dto.attachments || []
    );

    return message;
  }
}
