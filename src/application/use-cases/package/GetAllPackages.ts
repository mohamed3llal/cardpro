// src/application/use-cases/package/GetAllPackages.ts
import { IPackageRepository } from "@domain/interfaces/IPackageRepository";
import { Package } from "@domain/entities/Package";

export class GetAllPackagesAdmin {
  constructor(private packageRepository: IPackageRepository) {}

  async execute(includeInactive = true): Promise<Package[]> {
    try {
      console.log("📦 Fetching packages, includeInactive:", includeInactive);

      // Get base packages
      const packages = await this.packageRepository.getAllPackages(
        includeInactive
      );

      console.log(`✅ Found ${packages.length} packages`);

      // If no packages, return empty array
      if (!packages || packages.length === 0) {
        return [];
      }

      // Add statistics to each package
      const packagesWithStats = await Promise.all(
        packages.map(async (pkg) => {
          try {
            const [subscriberCount, revenue] = await Promise.all([
              this.packageRepository.getSubscriberCount(pkg.id),
              this.packageRepository.getPackageRevenue(pkg.id),
            ]);

            return {
              ...pkg,
              subscriberCount,
              revenue,
            } as Package;
          } catch (error) {
            console.error(`Error fetching stats for package ${pkg.id}:`, error);
            // Return package without stats on error
            return {
              ...pkg,
              subscriberCount: 0,
              revenue: 0,
            } as Package;
          }
        })
      );

      console.log(
        `✅ Successfully enriched ${packagesWithStats.length} packages with stats`
      );
      return packagesWithStats;
    } catch (error) {
      console.error("❌ Error in GetAllPackagesAdmin.execute:", error);
      throw error;
    }
  }
}
