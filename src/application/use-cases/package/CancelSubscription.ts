import { IPackageRepository } from "../../../domain/interfaces/IPackageRepository";
import { UserPackage } from "../../../domain/entities/Subscription";
import { AppError } from "../../../shared/errors/AppError";

interface CancelSubscriptionInput {
  userId: string;
  reason?: string;
  cancelImmediately?: boolean;
}

export class CancelSubscription {
  constructor(private packageRepository: IPackageRepository) {}

  async execute(input: CancelSubscriptionInput): Promise<UserPackage> {
    const { userId, cancelImmediately = false } = input;

    // Get active subscription
    const subscription = await this.packageRepository.getUserActiveSubscription(
      userId
    );

    if (!subscription) {
      throw new AppError("No active subscription found", 404);
    }

    // Cancel subscription
    const cancelledSubscription =
      await this.packageRepository.cancelSubscription(
        subscription.id,
        cancelImmediately
      );

    // TODO: Log cancellation reason
    // TODO: Send cancellation confirmation email

    return cancelledSubscription;
  }
}
