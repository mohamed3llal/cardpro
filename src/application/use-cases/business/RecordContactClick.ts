import { ICardRepository } from "@domain/interfaces/ICardRepository";

export type ContactType = "phone" | "whatsapp" | "email" | "website";

export interface RecordContactClickDTO {
  businessId: string;
  contactType: ContactType;
}

export class RecordContactClick {
  constructor(private readonly cardRepository: ICardRepository) {}

  async execute(dto: RecordContactClickDTO): Promise<void> {
    try {
      // Validate businessId
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(dto.businessId)) {
        return;
      }

      // Check if business exists
      const exists = await this.cardRepository.exists(dto.businessId);
      if (!exists) {
        return;
      }

      // Increment contact clicks
      await this.cardRepository.incrementContactClicks(dto.businessId);
    } catch (error) {
      // Silently fail
      console.error("Failed to record contact click:", error);
    }
  }
}
