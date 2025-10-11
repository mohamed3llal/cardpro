import { ICardRepository } from "@domain/interfaces/ICardRepository";

export class RecordView {
  constructor(private cardRepository: ICardRepository) {}

  async execute(businessId: string, source: string): Promise<void> {
    try {
      await this.cardRepository.incrementViews(businessId);

      // Optionally: Store detailed analytics in separate collection
      // await analyticsRepository.recordEvent({
      //   business_id: businessId,
      //   event_type: 'view',
      //   source,
      //   timestamp: new Date()
      // });
    } catch (error) {
      // Silently fail - don't break user experience
      console.error("Failed to record view:", error);
    }
  }
}
