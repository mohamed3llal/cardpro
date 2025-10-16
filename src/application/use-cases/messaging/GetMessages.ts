import { IMessagingRepository } from "@domain/interfaces/IMessagingRepository";
import { Message } from "@domain/entities/Messaging";

export interface GetMessagesDTO {
  conversationId: string;
  userId: string;
  page: number;
  limit: number;
}

export interface GetMessagesResponse {
  messages: Message[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_messages: number;
    limit: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export class GetMessagesUseCase {
  constructor(private messagingRepository: IMessagingRepository) {}

  async execute(dto: GetMessagesDTO): Promise<GetMessagesResponse> {
    const { messages, total } = await this.messagingRepository.getMessages(
      dto.conversationId,
      dto.userId,
      dto.page,
      dto.limit
    );

    return {
      messages,
      pagination: {
        current_page: dto.page,
        total_pages: Math.ceil(total / dto.limit),
        total_messages: total,
        limit: dto.limit,
        has_next: dto.page * dto.limit < total,
        has_prev: dto.page > 1,
      },
    };
  }
}
