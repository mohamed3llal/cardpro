// src/application/use-cases/card/ToggleCardVisibility.ts

import { Card } from "../../../domain/entities/Card";
import { ICardRepository } from "../../../domain/interfaces/ICardRepository";

export interface ToggleCardVisibilityDTO {
  card_id: string;
  user_id: string;
  is_public: boolean;
}

export class ToggleCardVisibilityUseCase {
  constructor(private readonly cardRepository: ICardRepository) {}

  async execute(dto: ToggleCardVisibilityDTO): Promise<Card> {
    try {
      // Check if card exists and user is the owner
      const existingCard = await this.cardRepository.findById(dto.card_id);

      if (!existingCard) {
        throw new Error("Card not found");
      }

      const isOwner = await this.cardRepository.isOwner(
        dto.card_id,
        dto.user_id
      );

      if (!isOwner) {
        throw new Error("You do not have permission to modify this card");
      }

      // Update visibility
      existingCard.update({ is_public: dto.is_public });

      // Persist changes
      const updatedCard = await this.cardRepository.update(
        dto.card_id,
        existingCard
      );

      if (!updatedCard) {
        throw new Error("Failed to update card visibility");
      }

      return updatedCard;
    } catch (error: any) {
      throw error;
    }
  }
}
