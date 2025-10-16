import { IMessagingRepository } from "@domain/interfaces/IMessagingRepository";
import { Conversation } from "@domain/entities/Messaging";

export interface GetConversationsDTO {
  userId: string;
  filter: "all" | "unread" | "archived";
  page: number;
  limit: number;
}

export interface GetConversationsResponse {
  conversations: Conversation[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_conversations: number;
    limit: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export class GetConversationsUseCase {
  constructor(private messagingRepository: IMessagingRepository) {}

  async execute(dto: GetConversationsDTO): Promise<GetConversationsResponse> {
    const { conversations, total } =
      await this.messagingRepository.getConversations(
        dto.userId,
        dto.filter,
        dto.page,
        dto.limit
      );

    return {
      conversations,
      pagination: {
        current_page: dto.page,
        total_pages: Math.ceil(total / dto.limit),
        total_conversations: total,
        limit: dto.limit,
        has_next: dto.page * dto.limit < total,
        has_prev: dto.page > 1,
      },
    };
  }
}
