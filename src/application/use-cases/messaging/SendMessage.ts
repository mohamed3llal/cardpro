// src/application/use-cases/messaging/SendMessage.ts
import { IMessagingRepository } from "../../../domain/interfaces/IMessagingRepository";
import { Message } from "../../../domain/entities/Messaging";
import { AppError } from "../../../shared/errors/AppError";
import { SendMessageDTO } from "../../dtos/MessagingDTO";

export class SendMessage {
  constructor(private messagingRepository: IMessagingRepository) {}

  async execute(
    userId: string,
    userName: string,
    userAvatar: string | undefined,
    data: SendMessageDTO
  ): Promise<Message> {
    const { conversation_id, content } = data;

    // Verify conversation exists
    const conversation = await this.messagingRepository.getConversationById(
      conversation_id
    );

    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    // Verify user is part of the conversation
    if (conversation.userId !== userId && conversation.businessId !== userId) {
      throw new AppError(
        "You are not authorized to send messages in this conversation",
        403
      );
    }

    // Create message
    const message = Message.create({
      conversationId: conversation_id,
      senderId: userId,
      senderName: userName,
      content: content.trim(),
      senderAvatar: userAvatar,
    });

    // Save message
    const savedMessage = await this.messagingRepository.createMessage(message);

    // Update conversation metadata
    await this.messagingRepository.updateConversation(
      conversation_id,
      content.substring(0, 100), // Store truncated message
      new Date()
    );

    // Increment unread count for recipient
    await this.messagingRepository.incrementUnreadCount(
      conversation_id,
      userId
    );

    return savedMessage;
  }
}
