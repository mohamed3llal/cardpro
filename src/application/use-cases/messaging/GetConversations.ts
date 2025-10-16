import { IMessagingRepository } from "@domain/interfaces/IMessagingRepository";

export class GetConversations {
  constructor(private messagingRepo: IMessagingRepository) {}

  async execute(userId: string, filter: string, page: number, limit: number) {
    return this.messagingRepo.getConversations(userId, filter, page, limit);
  }
}
