import { IPackageRepository } from "../../../domain/interfaces/IPackageRepository";
import { BoostCard } from "../../../domain/entities/Subscription";
import { AppError } from "../../../shared/errors/AppError";

interface BoostCardInput {
  userId: string;
  cardId: string;
  duration: number;
}

export class BoostCardUseCase {
  constructor(private packageRepository: IPackageRepository) {}

  async execute(input: BoostCardInput): Promise<BoostCard> {
    const { userId, cardId, duration } = input;

    // Validate duration
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

    // Get usage
    const usage = await this.packageRepository.getPackageUsage(userId);
    const pkg = await this.packageRepository.getPackageById(
      subscription.packageId
    );

    if (!usage || !pkg) {
      throw new AppError("Usage data not found", 404);
    }

    // Check if user has available boosts
    if (usage.boostsUsed >= pkg.features.maxBoosts) {
      throw new AppError("Boost limit reached. Please upgrade your plan.", 400);
    }

    // Check if card already has an active boost
    const existingBoost = await this.packageRepository.getCardActiveBoost(
      cardId
    );
    if (existingBoost) {
      throw new AppError("Card already has an active boost", 409);
    }

    // TODO: Verify user owns the card
    // const card = await this.cardRepository.getCardById(cardId);
    // if (card.userId !== userId) throw new AppError('Forbidden', 403);

    // Create boost
    const boost = await this.packageRepository.createBoost({
      userId,
      cardId,
      duration,
    });

    // Increment boost usage
    await this.packageRepository.incrementBoostUsage(userId);

    return boost;
  }
}
