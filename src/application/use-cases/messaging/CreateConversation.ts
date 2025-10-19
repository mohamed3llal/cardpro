import { IMessagingRepository } from "@domain/interfaces/IMessagingRepository";
import { ICardRepository } from "@domain/interfaces/ICardRepository";
import { IUserRepository } from "@domain/interfaces/IUserRepository";
import { Conversation } from "@domain/entities/Conversation";
import { AppError } from "@shared/errors/AppError";

export interface CreateConversationDTO {
  userId: string;
  businessId: string;
  initialMessage?: string;
}

export class CreateConversationUseCase {
  constructor(
    private messagingRepository: IMessagingRepository,
    private cardRepository: ICardRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(dto: CreateConversationDTO): Promise<Conversation> {
    // Check if conversation already exists
    const existingId = await this.messagingRepository.conversationExists(
      dto.userId,
      dto.businessId
    );

    if (existingId) {
      throw new AppError("Conversation already exists with this business", 409);
    }

    // Validate business exists
    const business = await this.cardRepository.findById(dto.businessId);
    if (!business) {
      throw new AppError("Business not found", 404);
    }

    // Validate user exists
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Create conversation
    return await this.messagingRepository.createConversation(
      dto.userId,
      dto.businessId,
      dto.initialMessage
    );
  }
}
