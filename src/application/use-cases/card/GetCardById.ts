import { ICardRepository } from "@domain/interfaces/ICardRepository";
import { Card } from "@domain/entities/Card";
import { AppError } from "@shared/errors/AppError";

export class GetCardByIdUseCase {
  constructor(private cardRepository: ICardRepository) {}

  async execute(cardId: string, userId: string): Promise<Card> {
    // Validate cardId format
    if (!cardId || cardId.trim() === "") {
      throw new AppError("Card ID is required", 400);
    }

    // Validate MongoDB ObjectId format (24 hex characters)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(cardId)) {
      throw new AppError("Invalid card ID format", 400);
    }

    // Find the card
    const card = await this.cardRepository.findById(cardId);

    // Check if card exists
    if (!card) {
      throw new AppError("Card not found", 404);
    }

    // Check authorization - user can only access their own cards
    if (card.userId !== userId) {
      throw new AppError("Unauthorized access to this card", 403);
    }

    return card;
  }

  // Alternative method: Get card without authorization (for public cards)
  async executePublic(cardId: string): Promise<Card> {
    if (!cardId || cardId.trim() === "") {
      throw new AppError("Card ID is required", 400);
    }

    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(cardId)) {
      throw new AppError("Invalid card ID format", 400);
    }

    const card = await this.cardRepository.findById(cardId);

    if (!card) {
      throw new AppError("Card not found", 404);
    }

    // Check if card is public
    if (!card.isPublic) {
      throw new AppError("This card is private", 403);
    }

    return card;
  }
}
