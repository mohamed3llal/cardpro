import { ICardRepository } from "@domain/interfaces/ICardRepository";

export class RecordContactClick {
  constructor(private cardRepository: ICardRepository) {}

  async execute(businessId: string, contactType: string): Promise<void> {
    try {
      // Increment contact clicks
      //   await this.cardRepository.update(businessId, {
      //     $inc: { contact_clicks: 1 },
      //   });
      // Optionally: Store detailed analytics
      // await analyticsRepository.recordEvent({
      //   business_id: businessId,
      //   event_type: 'contact_click',
      //   contact_type,
      //   timestamp: new Date()
      // });
    } catch (error) {
      console.error("Failed to record contact click:", error);
    }
  }
}
