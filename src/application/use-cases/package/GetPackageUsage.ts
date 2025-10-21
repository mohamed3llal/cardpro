import { IPackageRepository } from "../../../domain/interfaces/IPackageRepository";
import { PackageUsage } from "../../../domain/entities/Subscription";
import { Package } from "../../../domain/entities/Package";
import { AppError } from "../../../shared/errors/AppError";

export class GetPackageUsage {
  constructor(private packageRepository: IPackageRepository) {}

  async execute(
    userId: string
  ): Promise<{ usage: PackageUsage; package: Package }> {
    const subscription = await this.packageRepository.getUserActiveSubscription(
      userId
    );

    if (!subscription) {
      throw new AppError("No active subscription found", 404);
    }

    const usage = await this.packageRepository.getPackageUsage(userId);

    if (!usage) {
      throw new AppError("Usage data not found", 404);
    }

    const pkg = await this.packageRepository.getPackageById(
      subscription.packageId
    );

    if (!pkg) {
      throw new AppError("Package not found", 404);
    }

    return { usage, package: pkg };
  }
}
