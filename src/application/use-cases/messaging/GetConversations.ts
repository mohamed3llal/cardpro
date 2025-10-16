import {
  IMessagingRepository,
  IPaginationResult,
} from "../../../domain/interfaces/IMessagingRepository";
import { Conversation } from "../../../domain/entities/Conversation";
import { PaginationDTO } from "../../dtos/MessagingDTO";

export class GetConversations {
  constructor(private messagingRepository: IMessagingRepository) {}

  async execute(
    userId: string,
    options: PaginationDTO
  ): Promise<IPaginationResult<Conversation>> {
    return await this.messagingRepository.getConversationsByUserId(
      userId,
      options
    );
  }
}
