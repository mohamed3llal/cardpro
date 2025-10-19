import { ConversationModel } from "../models/ConversationModel";
import { MessageModel } from "../models/MessageModel";
import { Conversation } from "../../../domain/entities/Conversation";
import { Message } from "../../../domain/entities/Messaging";
import {
  IMessagingRepository,
  IPaginationOptions,
  IPaginationResult,
} from "../../../domain/interfaces/IMessagingRepository";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { ICardRepository } from "@domain/interfaces/ICardRepository";

export class MessagingRepository implements IMessagingRepository {
  private userRepository: IUserRepository;
  private cardRepository: ICardRepository;

  constructor(
    userRepository: IUserRepository,
    cardRepository: ICardRepository
  ) {
    this.userRepository = userRepository;
    this.cardRepository = cardRepository;
  }

  async createConversation(
    userId: string,
    businessId: string,
    initialMessage?: string
  ): Promise<Conversation> {
    // Check if conversation already exists
    const existingConv = await ConversationModel.findOne({
      user_id: userId,
      business_id: businessId,
    });

    if (existingConv) {
      return this.mapToConversationEntity(existingConv);
    }

    const userData = await this.userRepository.findById(userId);
    const cardData: any = await this.cardRepository.findById(businessId);
    const businessOwnerId = cardData?.props?.user_id;
    const businessData = await this.userRepository.findById(businessOwnerId);

    // Get user and card details (you might want to inject these services)
    const conversation = await ConversationModel.create({
      business_id: cardData?.props?._id,
      business_owner_id: businessOwnerId,
      business_name:
        cardData?.props?.titel ||
        businessData?.firstName + " " + businessData?.lastName ||
        "Unknown Business",
      business_avatar: businessData?.avatar || null,
      user_id: userId,
      user_name: userData?.firstName + " " + userData?.lastName, // Fetch from UserRepository
      user_avatar: userData?.avatar,
      last_message: initialMessage || null,
      last_message_at: initialMessage ? new Date() : null,
      unread_count: 0,
      created_at: new Date(),
    });

    return this.mapToConversationEntity(conversation);
  }

  async getConversationById(
    conversationId: string
  ): Promise<Conversation | null> {
    const conversation = await ConversationModel.findById(conversationId);
    return conversation ? this.mapToConversationEntity(conversation) : null;
  }

  async getConversationsByUserId(
    userId: string,
    options: IPaginationOptions
  ): Promise<any> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      ConversationModel.find({
        $or: [{ user_id: userId }, { business_owner_id: userId }],
      })
        .sort({ last_message_at: -1 })
        .skip(skip)
        .limit(limit),
      ConversationModel.countDocuments({
        $or: [{ user_id: userId }, { business_owner_id: userId }],
      }),
    ]);

    return this.buildPaginationResult(conversations, total, page, limit);
  }

  async getConversationsByBusinessId(
    businessId: string,
    options: IPaginationOptions
  ): Promise<any> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      ConversationModel.find({ business_id: businessId })
        .sort({ last_message_at: -1 })
        .skip(skip)
        .limit(limit),
      ConversationModel.countDocuments({ business_id: businessId }),
    ]);

    return this.buildPaginationResult(conversations, total, page, limit);
  }

  async updateConversation(
    conversationId: string,
    lastMessage: string,
    lastMessageAt: Date
  ): Promise<void> {
    await ConversationModel.findByIdAndUpdate(conversationId, {
      last_message: lastMessage,
      last_message_at: lastMessageAt,
      updated_at: new Date(),
    });
  }

  async incrementUnreadCount(
    conversationId: string,
    userId: string
  ): Promise<void> {
    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) return;

    // Increment unread for the recipient (not the sender)
    if (conversation.user_id !== userId) {
      await ConversationModel.findByIdAndUpdate(conversationId, {
        $inc: { unread_count: 1 },
      });
    }
  }

  async resetUnreadCount(
    conversationId: string,
    userId: string
  ): Promise<void> {
    await ConversationModel.findByIdAndUpdate(conversationId, {
      unread_count: 0,
    });
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await ConversationModel.findByIdAndDelete(conversationId);
  }

  async conversationExists(
    userId: string,
    businessId: string
  ): Promise<string | null> {
    const conversation: any = await ConversationModel.findOne({
      user_id: userId,
      business_id: businessId,
    });
    return conversation ? conversation._id.toString() : null;
  }

  // Messages
  async createMessage(message: Message): Promise<Message> {
    const messageDoc = await MessageModel.create({
      conversation_id: message.conversationId,
      sender_id: message.senderId,
      sender_name: message.senderName,
      sender_avatar: message.senderAvatar,
      content: message.content,
      read: false,
      created_at: new Date(),
    });

    return this.mapToMessageEntity(messageDoc);
  }

  async getMessagesByConversationId(
    conversationId: string,
    options: IPaginationOptions
  ): Promise<IPaginationResult<Message>> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      MessageModel.find({ conversation_id: conversationId })
        .sort({ created_at: 1 })
        .skip(skip)
        .limit(limit),
      MessageModel.countDocuments({ conversation_id: conversationId }),
    ]);

    return this.buildPaginationResult(
      messages.map((m: any) => this.mapToMessageEntity(m)),
      total,
      page,
      limit
    );
  }

  async markMessagesAsRead(
    conversationId: string,
    userId: string
  ): Promise<number> {
    const result = await MessageModel.updateMany(
      {
        conversation_id: conversationId,
        sender_id: { $ne: userId },
        read: false,
      },
      {
        read: true,
        updated_at: new Date(),
      }
    );

    return result.modifiedCount;
  }

  async deleteMessagesByConversationId(conversationId: string): Promise<void> {
    await MessageModel.deleteMany({ conversation_id: conversationId });
  }

  // Helper methods
  private mapToConversationEntity(doc: any): Conversation {
    return new Conversation(
      doc._id.toString(),
      doc.business_id,
      doc.business_name,
      doc.business_owner_id,
      doc.user_id,
      doc.user_name,
      doc.last_message,
      doc.last_message_at,
      doc.unread_count,
      doc.business_avatar,
      doc.user_avatar,
      doc.created_at,
      doc.updated_at
    );
  }

  private mapToMessageEntity(doc: any): Message {
    return new Message(
      doc._id.toString(),
      doc.conversation_id,
      doc.sender_id,
      doc.sender_name,
      doc.content,
      doc.read,
      doc.sender_avatar,
      doc.created_at,
      doc.updated_at
    );
  }

  private buildPaginationResult<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
  ): IPaginationResult<T> {
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_items: total,
        limit,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    };
  }
}
