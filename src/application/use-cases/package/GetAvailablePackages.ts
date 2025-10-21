// src/application/use-cases/package/GetAvailablePackages.ts

import { IPackageRepository } from "../../../domain/interfaces/IPackageRepository";
import { Package } from "../../../domain/entities/Package";

export class GetAvailablePackages {
  constructor(private packageRepository: IPackageRepository) {}

  async execute(): Promise<Package[]> {
    const packages = await this.packageRepository.getActivePackages();

    // Update subscriber count and revenue for each package
    const packagesWithStats = await Promise.all(
      packages.map(async (pkg) => {
        const subscriberCount = await this.packageRepository.getSubscriberCount(
          pkg.id
        );
        const revenue = await this.packageRepository.getPackageRevenue(pkg.id);

        return {
          ...pkg,
          subscriberCount,
          revenue,
        };
      })
    );

    return packagesWithStats;
  }
}
