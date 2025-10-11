import { ICardRepository } from "@domain/interfaces/ICardRepository";

export interface DeleteCardDTO {
  card_id: string;
  user_id: string;
}

export class DeleteCardUseCase {
  constructor(private readonly cardRepository: ICardRepository) {}

  async execute(dto: DeleteCardDTO): Promise<void> {
    try {
      // Check if card exists
      const cardExists = await this.cardRepository.exists(dto.card_id);

      if (!cardExists) {
        throw new Error("Card not found");
      }

      // Check ownership
      const isOwner = await this.cardRepository.isOwner(
        dto.card_id,
        dto.user_id
      );

      if (!isOwner) {
        throw new Error("You do not have permission to delete this card");
      }

      // Delete the card
      const deleted = await this.cardRepository.delete(dto.card_id);

      if (!deleted) {
        throw new Error("Failed to delete card");
      }
    } catch (error: any) {
      throw error;
    }
  }
}
