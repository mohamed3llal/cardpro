import { IPackageRepository } from "@domain/interfaces/IPackageRepository";
import { Package } from "@domain/entities/Package";

export class GetAllPackagesAdmin {
  constructor(private packageRepository: IPackageRepository) {}

  async execute(includeInactive = true): Promise<Package[]> {
    console.log(" include Inactive after", includeInactive);

    const packages = await this.packageRepository.getAllPackages(
      includeInactive
    );
    console.log("packages", packages);
    // Add statistics to each package
    const packagesWithStats = await Promise.all(
      packages.map(async (pkg) => {
        const subscriberCount = await this.packageRepository.getSubscriberCount(
          pkg.id
        );

        console.log("packagesWithStats", packagesWithStats);

        const revenue = await this.packageRepository.getPackageRevenue(pkg.id);
        console.log("revenue", revenue);

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
