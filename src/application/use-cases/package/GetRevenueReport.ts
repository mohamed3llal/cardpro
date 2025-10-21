import { IPackageRepository } from "@domain/interfaces/IPackageRepository";

export class GetRevenueReport {
  constructor(private packageRepository: IPackageRepository) {}

  async execute(startDate?: Date, endDate?: Date): Promise<any> {
    return this.packageRepository.getRevenueReport(startDate, endDate);
  }
}
