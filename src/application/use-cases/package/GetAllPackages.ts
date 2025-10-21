import { IPackageRepository } from "@domain/interfaces/IPackageRepository";
import { Package } from "@domain/entities/Package";

export class GetAllPackagesAdmin {
  constructor(private packageRepository: IPackageRepository) {}

  async execute(includeInactive = true): Promise<Package[]> {
    const packages = await this.packageRepository.getAllPackages(
      includeInactive
    );

    // Add statistics to each package
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
