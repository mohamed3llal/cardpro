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
      // 1. Get active subscription
      const subscription =
        await this.packageRepository.getUserActiveSubscription(userId);

      if (!subscription) {
        console.error(`❌ No active subscription found for user: ${userId}`);
        throw new AppError("No active subscription found", 404);
      }

      // 2. Get usage data
      const usage = await this.packageRepository.getPackageUsage(userId);

      if (!usage) {
        console.error(`❌ Usage data not found for user: ${userId}`);
        throw new AppError("Usage data not found", 404);
      }

      // 3. ✅ FIX: Extract package ID correctly from subscription
      let packageId: string;

      if (typeof subscription.packageId === "string") {
        // packageId is already a string
        packageId = subscription.packageId;
      } else if (
        subscription.packageId &&
        typeof subscription.packageId === "object"
      ) {
        // packageId is a populated object - extract the id
        packageId =
          (subscription.packageId as any).id ||
          (subscription.packageId as any)._id?.toString() ||
          subscription.packageId;
      } else {
        throw new Error("Invalid packageId type in subscription");
      }

      // 4. ✅ FIX: If subscription.packageId is already populated, use it directly
      let pkg: any;

      if (
        typeof subscription.packageId === "object" &&
        subscription.packageId !== null &&
        (subscription.packageId as any).id
      ) {
        // Package is already populated, use it directly
        pkg = subscription.packageId as Package;
      } else {
        // Package not populated, fetch it
        pkg = await this.packageRepository.getPackageById(packageId);

        if (!pkg) {
          console.error(`❌ Package not found: ${packageId}`);
          throw new AppError("Package not found", 404);
        }
      }

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
