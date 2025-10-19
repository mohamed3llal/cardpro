import { IMessagingRepository } from "@domain/interfaces/IMessagingRepository";
import { IUserRepository } from "@domain/interfaces/IUserRepository";
import { Message } from "@domain/entities/Messaging";
import { AppError } from "@shared/errors/AppError";

export interface SendMessageDTO {
  userId: string;
  conversationId: string;
  content: string;
}

export class SendMessageUseCase {
  constructor(
    private messagingRepository: IMessagingRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(dto: SendMessageDTO): Promise<Message> {
    // Verify conversation exists
    const conversation = await this.messagingRepository.getConversationById(
      dto.conversationId
    );

    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    // Verify user is part of conversation
    if (conversation.userId !== dto.userId) {
      throw new AppError("Access denied to this conversation", 403);
    }

    // Get sender details
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Validate message content
    const trimmedContent = dto.content.trim();
    if (trimmedContent.length === 0) {
      throw new AppError("Message cannot be empty", 400);
    }

    if (trimmedContent.length > 2000) {
      throw new AppError("Message cannot exceed 2000 characters", 400);
    }

    // Create message
    const message = Message.create({
      conversation_id: dto.conversationId,
      sender_id: dto.userId,
      sender_name: user.fullName,
      sender_avatar: user.avatar,
      content: trimmedContent,
      read: false,
    });

    // Save message
    const savedMessage = await this.messagingRepository.createMessage(message);

    // Update conversation
    await this.messagingRepository.updateConversation(
      dto.conversationId,
      trimmedContent,
      new Date()
    );

    // Increment unread count for recipient
    await this.messagingRepository.incrementUnreadCount(
      dto.conversationId,
      dto.userId
    );

    return savedMessage;
  }
}
