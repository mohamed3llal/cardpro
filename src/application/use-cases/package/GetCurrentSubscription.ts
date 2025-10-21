import { IPackageRepository } from "../../../domain/interfaces/IPackageRepository";
import { UserPackage } from "../../../domain/entities/Subscription";
import { AppError } from "../../../shared/errors/AppError";

export class GetCurrentSubscription {
  constructor(private packageRepository: IPackageRepository) {}

  async execute(userId: string): Promise<UserPackage> {
    const subscription = await this.packageRepository.getUserActiveSubscription(
      userId
    );

    if (!subscription) {
      throw new AppError("No active subscription found", 404);
    }

    return subscription;
  }
}
