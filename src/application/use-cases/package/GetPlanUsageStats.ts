import { IPackageRepository } from "@domain/interfaces/IPackageRepository";

export class GetPlanUsageStats {
  constructor(private packageRepository: IPackageRepository) {}

  async execute(): Promise<any> {
    return this.packageRepository.getPlanUsageStats();
  }
}
