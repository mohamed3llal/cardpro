import cron from "node-cron";
import { IPackageRepository } from "@domain/interfaces/IPackageRepository";
import { logger } from "@config/logger";

export class CronService {
  private jobs: cron.ScheduledTask[] = [];

  constructor(private packageRepository: IPackageRepository) {}

  /**
   * Initialize all cron jobs
   */
  start(): void {
    logger.info("🕐 Starting Cron Service...");

    // Daily: Renew/expire subscriptions (runs at 1:00 AM)
    this.scheduleSubscriptionRenewal();

    // Hourly: Expire boosts
    this.scheduleBoostExpiration();

    // Daily: Activate/deactivate scheduled packages (runs at 2:00 AM)
    this.schedulePackageActivation();

    // Monthly: Reset usage counters (runs on 1st of month at 3:00 AM)
    this.scheduleUsageReset();

    logger.info(`✅ Cron Service started with ${this.jobs.length} jobs`);
  }

  /**
   * Stop all cron jobs
   */
  stop(): void {
    logger.info("🛑 Stopping Cron Service...");
    this.jobs.forEach((job) => job.stop());
    this.jobs = [];
    logger.info("✅ Cron Service stopped");
  }

  /**
   * Daily: Check for expired subscriptions and renew or deactivate
   */
  private scheduleSubscriptionRenewal(): void {
    const job = cron.schedule("0 1 * * *", async () => {
      try {
        logger.info("🔄 Running subscription renewal job...");

        const { data: subscriptions } =
          await this.packageRepository.getAllSubscriptions(1, 1000);
        let renewed = 0;
        let expired = 0;

        for (const subscription of subscriptions) {
          const now = new Date();
          const periodEnd = new Date(subscription.currentPeriodEnd);

          // Check if subscription has ended
          if (periodEnd <= now && subscription.status === "active") {
            if (subscription.cancelAtPeriodEnd) {
              // Cancel subscription
              await this.packageRepository.updateSubscriptionStatus(
                subscription.id,
                "cancelled"
              );
              expired++;
              logger.info(`❌ Cancelled subscription ${subscription.id}`);
            } else {
              // Renew subscription (for now, just extend period)
              const pkg = await this.packageRepository.getPackageById(
                subscription.packageId
              );

              if (pkg) {
                const newPeriodEnd = new Date(periodEnd);
                if (pkg.interval === "month") {
                  newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
                } else if (pkg.interval === "year") {
                  newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
                }

                // In production, you'd process payment here
                // For now, just extend the period
                renewed++;
                logger.info(`✅ Renewed subscription ${subscription.id}`);
              }
            }
          }
        }

        logger.info(
          `✅ Subscription renewal complete: ${renewed} renewed, ${expired} expired`
        );
      } catch (error) {
        logger.error("❌ Subscription renewal job failed:", error);
      }
    });

    this.jobs.push(job);
    logger.info("✅ Scheduled: Subscription renewal (daily at 1:00 AM)");
  }

  /**
   * Hourly: Expire active boosts that have passed their end date
   */
  private scheduleBoostExpiration(): void {
    const job = cron.schedule("0 * * * *", async () => {
      try {
        logger.info("🔄 Running boost expiration job...");

        // Get all active boosts
        const { data: subscriptions } =
          await this.packageRepository.getAllSubscriptions(1, 1000);
        let expiredCount = 0;

        for (const subscription of subscriptions) {
          const boosts = await this.packageRepository.getActiveBoosts(
            subscription.userId
          );

          for (const boost of boosts) {
            const now = new Date();
            const endDate = new Date(boost.endDate);

            if (endDate <= now && boost.status === "active") {
              await this.packageRepository.expireBoost(boost.id);
              expiredCount++;
              logger.info(
                `⏰ Expired boost ${boost.id} for card ${boost.cardId}`
              );
            }
          }
        }

        logger.info(
          `✅ Boost expiration complete: ${expiredCount} boosts expired`
        );
      } catch (error) {
        logger.error("❌ Boost expiration job failed:", error);
      }
    });

    this.jobs.push(job);
    logger.info("✅ Scheduled: Boost expiration (hourly)");
  }

  /**
   * Daily: Activate/deactivate packages based on schedule
   */
  private schedulePackageActivation(): void {
    const job = cron.schedule("0 2 * * *", async () => {
      try {
        logger.info("🔄 Running package activation job...");

        const packages = await this.packageRepository.getAllPackages(true);
        const now = new Date();
        let activated = 0;
        let deactivated = 0;

        for (const pkg of packages) {
          // Activate packages
          if (
            pkg.scheduledActivateAt &&
            new Date(pkg.scheduledActivateAt) <= now &&
            !pkg.isActive
          ) {
            await this.packageRepository.updatePackage(pkg.id, {
              isActive: true,
              scheduledActivateAt: undefined,
            });
            activated++;
            logger.info(`✅ Activated package ${pkg.name}`);
          }

          // Deactivate packages
          if (
            pkg.scheduledDeactivateAt &&
            new Date(pkg.scheduledDeactivateAt) <= now &&
            pkg.isActive
          ) {
            await this.packageRepository.updatePackage(pkg.id, {
              isActive: false,
              scheduledDeactivateAt: undefined,
            });
            deactivated++;
            logger.info(`❌ Deactivated package ${pkg.name}`);
          }
        }

        logger.info(
          `✅ Package activation complete: ${activated} activated, ${deactivated} deactivated`
        );
      } catch (error) {
        logger.error("❌ Package activation job failed:", error);
      }
    });

    this.jobs.push(job);
    logger.info("✅ Scheduled: Package activation (daily at 2:00 AM)");
  }

  /**
   * Monthly: Reset usage counters (runs on 1st of each month)
   */
  private scheduleUsageReset(): void {
    const job = cron.schedule("0 3 1 * *", async () => {
      try {
        logger.info("🔄 Running monthly usage reset job...");

        const { data: subscriptions } =
          await this.packageRepository.getAllSubscriptions(1, 10000);
        let resetCount = 0;

        for (const subscription of subscriptions) {
          if (subscription.status === "active") {
            await this.packageRepository.resetUsageCounters(
              subscription.userId
            );
            resetCount++;
          }
        }

        logger.info(`✅ Usage reset complete: ${resetCount} users reset`);
      } catch (error) {
        logger.error("❌ Usage reset job failed:", error);
      }
    });

    this.jobs.push(job);
    logger.info("✅ Scheduled: Usage reset (monthly on 1st at 3:00 AM)");
  }
}
