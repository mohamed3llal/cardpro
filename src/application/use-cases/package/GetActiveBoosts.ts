import { IPackageRepository } from "../../../domain/interfaces/IPackageRepository";
import { BoostCard } from "../../../domain/entities/Subscription";

export class GetActiveBoosts {
  constructor(private packageRepository: IPackageRepository) {}

  async execute(userId: string): Promise<BoostCard[]> {
    return this.packageRepository.getActiveBoosts(userId);
  }
}
