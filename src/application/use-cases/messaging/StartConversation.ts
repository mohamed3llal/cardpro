import { IMessagingRepository } from "@domain/interfaces/IMessagingRepository";
import { AppError } from "@shared/errors/AppError";

export interface StartConversationDTO {
  userId: string;
  businessId: string;
  initialMessage: string;
}

export class StartConversationUseCase {
  constructor(private messagingRepository: IMessagingRepository) {}

  async execute(dto: StartConversationDTO) {
    // Validate inputs
    if (!dto.businessId || !dto.initialMessage) {
      throw new AppError("Business ID and initial message are required", 400);
    }

    if (dto.initialMessage.length === 0 || dto.initialMessage.length > 1000) {
      throw new AppError("Message must be between 1 and 1000 characters", 400);
    }

    // Start conversation
    const result = await this.messagingRepository.startConversation(
      dto.userId,
      dto.businessId,
      dto.initialMessage
    );

    return result;
  }
}
