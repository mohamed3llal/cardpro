// src/application/use-cases/package/BoostCard.ts
import { IPackageRepository } from "../../../domain/interfaces/IPackageRepository";
import { BoostCard } from "../../../domain/entities/Subscription";
import { AppError } from "../../../shared/errors/AppError";

interface BoostCardInput {
  userId: string;
  cardId: string;
  duration: number; // Number of days (1 boost point = 1 day)
}

export class BoostCardUseCase {
  constructor(private packageRepository: IPackageRepository) {}

  async execute(input: BoostCardInput): Promise<BoostCard> {
    const { userId, cardId, duration } = input;

    // Validate duration (1 to 30 days)
    if (duration < 1 || duration > 30) {
      throw new AppError("Duration must be between 1 and 30 days", 400);
    }

    // Get active subscription
    const subscription = await this.packageRepository.getUserActiveSubscription(
      userId
    );
    if (!subscription) {
      throw new AppError("No active subscription found", 402);
    }

    // Extract packageId properly
    let packageId: string;
    if (typeof subscription.packageId === "string") {
      packageId = subscription.packageId;
    } else if (
      subscription.packageId &&
      typeof subscription.packageId === "object"
    ) {
      const pkgObj = subscription.packageId as any;
      packageId = pkgObj.id || pkgObj._id?.toString() || pkgObj._id;
    } else {
      throw new AppError("Invalid subscription package data", 500);
    }

    // Get usage and package details
    const [usage, pkg] = await Promise.all([
      this.packageRepository.getPackageUsage(userId),
      this.packageRepository.getPackageById(packageId),
    ]);

    if (!usage || !pkg) {
      throw new AppError("Usage data not found", 404);
    }

    // ✅ NEW: Calculate available boost points (maxBoosts - boostsUsed)
    const availableBoostPoints = pkg.features.maxBoosts - usage.boostsUsed;

    // ✅ NEW: Check if user has enough boost points for the requested duration
    if (availableBoostPoints < duration) {
      throw new AppError(
        `Insufficient boost points. You have ${availableBoostPoints} boost point(s) remaining. Each day requires 1 boost point. Please upgrade your plan or reduce the duration.`,
        400
      );
    }

    // Check if card already has an active boost
    const existingBoost = await this.packageRepository.getCardActiveBoost(
      cardId
    );
    if (existingBoost) {
      throw new AppError(
        `Card already has an active boost until ${existingBoost.endDate.toISOString()}`,
        409
      );
    }

    // Create boost
    const boost = await this.packageRepository.createBoost({
      userId,
      cardId,
      duration,
    });

    // ✅ NEW: Increment boost usage by the number of days (boost points used)
    await this.packageRepository.incrementBoostUsageByAmount(userId, duration);

    return boost;
  }
}
