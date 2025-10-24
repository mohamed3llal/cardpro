// src/application/use-cases/package/HandlePackageDowngrade.ts

import { IPackageRepository } from "@domain/interfaces/IPackageRepository";
import { ICardRepository } from "@domain/interfaces/ICardRepository";
import { AppError } from "@shared/errors/AppError";
import { logger } from "@config/logger";

interface DowngradeResult {
  disabledCards: number;
  excessCards: number;
  message: string;
}

export class HandlePackageDowngrade {
  constructor(
    private packageRepository: IPackageRepository,
    private cardRepository: ICardRepository
  ) {}

  /**
   * Handle package downgrade by disabling excess cards
   */
  async execute(
    userId: string,
    newPackageId: string
  ): Promise<DowngradeResult> {
    try {
      // Get new package details
      const newPackage = await this.packageRepository.getPackageById(
        newPackageId
      );
      if (!newPackage) {
        throw new AppError("Package not found", 404);
      }

      // Get user's current usage
      const usage = await this.packageRepository.getPackageUsage(userId);
      if (!usage) {
        throw new AppError("Usage data not found", 404);
      }

      // Check if downgrade is needed
      const currentCards = usage.cardsCreated;
      const newMaxCards = newPackage.features.maxCards;

      let disabledCards = 0;
      let excessCards = 0;

      // Handle unlimited cards case
      if (newMaxCards === -1) {
        // Upgrading to unlimited, no action needed
        return {
          disabledCards: 0,
          excessCards: 0,
          message: "Upgraded to unlimited cards",
        };
      }

      // Check if user has more cards than new limit
      if (currentCards > newMaxCards) {
        excessCards = currentCards - newMaxCards;

        // Get user's cards sorted by creation date (oldest first)
        const userCards = await this.cardRepository.findByUserId(userId, {
          limit: currentCards,
        });

        // Disable excess cards (keep the newest ones)
        const cardsToDisable = userCards.slice(0, excessCards);

        for (const card of cardsToDisable) {
          await this.cardRepository.update(card.id!, {
            ...card.toJSON(),
            is_public: false, // Make them private instead of deleting
          } as any);
          disabledCards++;
        }

        logger.info(
          `✅ Downgrade handled for user ${userId}: ${disabledCards} cards disabled`
        );
      }

      return {
        disabledCards,
        excessCards,
        message:
          disabledCards > 0
            ? `Downgrade complete. ${disabledCards} card(s) have been made private due to your new plan limit.`
            : "Downgrade complete. All cards remain active.",
      };
    } catch (error) {
      logger.error("❌ Failed to handle package downgrade:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to handle package downgrade", 500);
    }
  }

  /**
   * Preview downgrade impact without making changes
   */
  async previewDowngrade(
    userId: string,
    newPackageId: string
  ): Promise<{
    currentCards: number;
    newLimit: number;
    cardsToDisable: number;
    willLoseAccess: boolean;
  }> {
    const newPackage = await this.packageRepository.getPackageById(
      newPackageId
    );
    if (!newPackage) {
      throw new AppError("Package not found", 404);
    }

    const usage = await this.packageRepository.getPackageUsage(userId);
    if (!usage) {
      throw new AppError("Usage data not found", 404);
    }

    const currentCards = usage.cardsCreated;
    const newLimit = newPackage.features.maxCards;
    const cardsToDisable =
      newLimit === -1 ? 0 : Math.max(0, currentCards - newLimit);

    return {
      currentCards,
      newLimit: newLimit === -1 ? Infinity : newLimit,
      cardsToDisable,
      willLoseAccess: cardsToDisable > 0,
    };
  }
}
