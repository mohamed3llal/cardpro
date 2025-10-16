import { ICardRepository } from "@domain/interfaces/ICardRepository";

export type ViewSource = "browse" | "search" | "map" | "qr_code" | "direct";

export interface RecordViewDTO {
  businessId: string;
  source: ViewSource;
}

export class RecordView {
  constructor(private readonly cardRepository: ICardRepository) {}

  async execute(dto: RecordViewDTO): Promise<void> {
    try {
      // Validate businessId
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(dto.businessId)) {
        // Silently fail for invalid IDs (as per spec)
        return;
      }

      // Check if business exists
      const exists = await this.cardRepository.exists(dto.businessId);
      if (!exists) {
        // Silently fail if business not found (as per spec)
        return;
      }

      // Increment views
      await this.cardRepository.incrementViews(dto.businessId);
    } catch (error) {
      // Silently fail (as per spec - used for analytics only)
      console.error("Failed to record view:", error);
    }
  }
}
