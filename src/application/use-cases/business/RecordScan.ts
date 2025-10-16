import { ICardRepository } from "@domain/interfaces/ICardRepository";

export type ScanDevice = "mobile" | "desktop";

export interface RecordScanDTO {
  businessId: string;
  source: "qr_code";
  device?: ScanDevice;
}

export class RecordScan {
  constructor(private readonly cardRepository: ICardRepository) {}

  async execute(dto: RecordScanDTO): Promise<void> {
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

      // Increment scans
      await this.cardRepository.incrementScans(dto.businessId);
    } catch (error) {
      // Silently fail
      console.error("Failed to record scan:", error);
    }
  }
}
