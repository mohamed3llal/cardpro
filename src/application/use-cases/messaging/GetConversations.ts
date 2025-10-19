import {
  IMessagingRepository,
  IPaginationOptions,
  IPaginationResult,
} from "@domain/interfaces/IMessagingRepository";
import { Conversation } from "@domain/entities/Conversation";

export class GetConversationsUseCase {
  constructor(private messagingRepository: IMessagingRepository) {}

  async execute(
    userId: string,
    options: IPaginationOptions
  ): Promise<IPaginationResult<Conversation>> {
    return await this.messagingRepository.getConversationsByUserId(
      userId,
      options
    );
  }
}
