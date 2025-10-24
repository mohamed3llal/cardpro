import { IPackageRepository } from "../../../domain/interfaces/IPackageRepository";
import { PackageUsage } from "../../../domain/entities/Subscription";
import { Package } from "../../../domain/entities/Package";
import { AppError } from "../../../shared/errors/AppError";

export class GetPackageUsage {
  constructor(private packageRepository: IPackageRepository) {}

  async execute(
    userId: string
  ): Promise<{ usage: PackageUsage; package: Package }> {
    try {
      console.log(`📊 GetPackageUsage.execute for user: ${userId}`);

      const subscription =
        await this.packageRepository.getUserActiveSubscription(userId);

      if (!subscription) {
        console.error(`❌ No active subscription found for user: ${userId}`);
        throw new AppError("No active subscription found", 404);
      }

      console.log(`✅ Found subscription: ${subscription.id}`);

      const usage = await this.packageRepository.getPackageUsage(userId);

      if (!usage) {
        console.error(`❌ Usage data not found for user: ${userId}`);
        throw new AppError("Usage data not found", 404);
      }

      console.log(`✅ Found usage: ${usage.id}`);

      const pkg = await this.packageRepository.getPackageById(
        subscription.packageId
      );

      if (!pkg) {
        console.error(`❌ Package not found: ${subscription.packageId}`);
        throw new AppError("Package not found", 404);
      }

      console.log(`✅ Found package: ${pkg.id}`);

      return { usage, package: pkg };
    } catch (error: any) {
      console.error(`❌ Error in GetPackageUsage.execute:`, error);
      console.error(`Stack:`, error.stack);

      // Re-throw AppError as-is
      if (error instanceof AppError) {
        throw error;
      }

      // Wrap other errors
      throw new AppError(
        `Failed to retrieve usage data: ${error.message}`,
        500
      );
    }
  }
}
