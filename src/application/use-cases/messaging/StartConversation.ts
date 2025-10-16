import { IMessagingRepository } from "../../../domain/interfaces/IMessagingRepository";
import { ICardRepository } from "../../../domain/interfaces/ICardRepository";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { Conversation } from "../../../domain/entities/Conversation";
import { Message } from "../../../domain/entities/Messaging";
import { AppError } from "../../../shared/errors/AppError";
import { CreateConversationDTO } from "../../dtos/MessagingDTO";

export class StartConversation {
  constructor(
    private messagingRepository: IMessagingRepository,
    private cardRepository: ICardRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(
    userId: string,
    data: CreateConversationDTO
  ): Promise<Conversation> {
    const { business_id, initial_message } = data;

    // Check if conversation already exists
    const existingConvId = await this.messagingRepository.conversationExists(
      userId,
      business_id
    );

    if (existingConvId) {
      const conversation = await this.messagingRepository.getConversationById(
        existingConvId
      );

      if (conversation) {
        // If there's an initial message, send it
        if (initial_message) {
          const user = await this.userRepository.findById(userId);
          if (user) {
            const message = Message.create({
              conversationId: existingConvId,
              senderId: userId,
              senderName: user.firstName + " " + user.lastName,
              content: initial_message.trim(),
              senderAvatar: user.avatar,
            });

            await this.messagingRepository.createMessage(message);
            await this.messagingRepository.updateConversation(
              existingConvId,
              initial_message.substring(0, 100),
              new Date()
            );
          }
        }

        return conversation;
      }
    }

    // Verify business/card exists
    const business = await this.cardRepository.findById(business_id);
    if (!business) {
      throw new AppError("Business not found", 404);
    }

    // Get user details
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Create conversation
    const conversation = await this.messagingRepository.createConversation(
      userId,
      business_id,
      initial_message
    );

    // Send initial message if provided
    if (initial_message) {
      const message = Message.create({
        conversationId: conversation.id,
        senderId: userId,
        senderName: user.firstName + " " + user.lastName,
        content: initial_message.trim(),
        senderAvatar: user.avatar,
      });

      await this.messagingRepository.createMessage(message);
    }

    return conversation;
  }
}
