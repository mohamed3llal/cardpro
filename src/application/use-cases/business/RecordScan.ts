import { ICardRepository } from "@domain/interfaces/ICardRepository";

export class RecordScan {
  constructor(private cardRepository: ICardRepository) {}

  async execute(
    businessId: string,
    source: string,
    device: string
  ): Promise<void> {
    try {
      // Increment scan count
      //   await this.cardRepository.update(businessId, {
      //     $inc: { scans: 1 },
      //   });
      // Optionally: Store detailed analytics
      // await analyticsRepository.recordEvent({
      //   business_id: businessId,
      //   event_type: 'scan',
      //   source,
      //   device,
      //   timestamp: new Date()
      // });
    } catch (error) {
      console.error("Failed to record scan:", error);
    }
  }
}
