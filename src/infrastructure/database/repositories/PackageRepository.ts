import { IPackageRepository } from "../../../domain/interfaces/IPackageRepository";
import {
  Package,
  CreatePackageData,
  UpdatePackageData,
} from "../../../domain/entities/Package";
import {
  UserPackage,
  PackageUsage,
  BoostCard,
  CreateSubscriptionData,
  BoostCardData,
} from "../../../domain/entities/Subscription";
import { PackageModel } from "../models/PackageModel";
import {
  UserPackageModel,
  PackageUsageModel,
  BoostCardModel,
} from "../models/UserPackageModel";
import { AppError } from "../../../shared/errors/AppError";

export class PackageRepository implements IPackageRepository {
  // Package Management
  async createPackage(data: CreatePackageData): Promise<Package> {
    const pkg = await PackageModel.create(data);
    return pkg.toJSON() as Package;
  }

  async getPackageById(id: string): Promise<Package | null> {
    const pkg = await PackageModel.findById(id);
    return pkg ? (pkg.toJSON() as Package) : null;
  }

  async getAllPackages(includeInactive = false): Promise<Package[]> {
    try {
      console.log(
        "🔍 PackageRepository.getAllPackages - includeInactive:",
        includeInactive
      );

      const query = includeInactive ? {} : { isActive: true };
      console.log("📋 Query:", JSON.stringify(query));

      const packages = await PackageModel.find(query)
        .sort({ price: 1 })
        .lean()
        .exec();

      console.log(`✅ Found ${packages.length} packages in database`);

      // Transform MongoDB documents to Package entities
      return packages.map((pkg: any) => ({
        id: pkg._id.toString(),
        name: pkg.name,
        tier: pkg.tier,
        price: pkg.price,
        currency: pkg.currency,
        interval: pkg.interval,
        features: pkg.features,
        description: pkg.description,
        isActive: pkg.isActive,
        scheduledActivateAt: pkg.scheduledActivateAt,
        scheduledDeactivateAt: pkg.scheduledDeactivateAt,
        subscriberCount: pkg.subscriberCount || 0,
        revenue: pkg.revenue || 0,
        createdAt: pkg.createdAt,
        updatedAt: pkg.updatedAt,
      })) as Package[];
    } catch (error) {
      console.error("❌ Error in PackageRepository.getAllPackages:", error);
      throw error;
    }
  }

  async getSubscriberCount(packageId: string): Promise<number> {
    try {
      const count = await UserPackageModel.countDocuments({
        packageId,
        status: "active",
      });
      return count || 0;
    } catch (error) {
      console.error(`Error getting subscriber count for ${packageId}:`, error);
      return 0;
    }
  }

  async getPackageRevenue(packageId: string): Promise<number> {
    try {
      const pkg = await PackageModel.findById(packageId).lean();
      if (!pkg) return 0;

      const subscriberCount = await this.getSubscriberCount(packageId);
      return (pkg.price || 0) * subscriberCount;
    } catch (error) {
      console.error(`Error getting revenue for ${packageId}:`, error);
      return 0;
    }
  }

  async getPlanUsageStats(): Promise<any> {
    try {
      const stats = await UserPackageModel.aggregate([
        { $match: { status: "active" } },
        {
          $lookup: {
            from: "packages",
            let: { packageId: { $toObjectId: "$packageId" } },
            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$packageId"] } } }],
            as: "package",
          },
        },
        { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$package.tier",
            count: { $sum: 1 },
            revenue: { $sum: { $ifNull: ["$package.price", 0] } },
          },
        },
        {
          $project: {
            tier: "$_id",
            count: 1,
            revenue: 1,
            _id: 0,
          },
        },
      ]);

      const totalSubscribers = stats.reduce((sum, stat) => sum + stat.count, 0);

      return {
        totalSubscribers,
        byTier: stats.map((stat) => ({
          ...stat,
          percentage:
            totalSubscribers > 0 ? (stat.count / totalSubscribers) * 100 : 0,
        })),
      };
    } catch (error) {
      console.error("Error in getPlanUsageStats:", error);
      return {
        totalSubscribers: 0,
        byTier: [],
      };
    }
  }

  async getRevenueReport(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      const matchStage: any = { status: "active" };
      if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = startDate;
        if (endDate) matchStage.createdAt.$lte = endDate;
      }

      const report = await UserPackageModel.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: "packages",
            let: { packageId: { $toObjectId: "$packageId" } },
            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$packageId"] } } }],
            as: "package",
          },
        },
        { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $ifNull: ["$package.price", 0] } },
            subscriptionCount: { $sum: 1 },
          },
        },
      ]);

      return report[0] || { totalRevenue: 0, subscriptionCount: 0 };
    } catch (error) {
      console.error("Error in getRevenueReport:", error);
      return { totalRevenue: 0, subscriptionCount: 0 };
    }
  }

  async getActivePackages(): Promise<Package[]> {
    return this.getAllPackages(false);
  }

  async updatePackage(
    id: string,
    data: UpdatePackageData
  ): Promise<Package | null> {
    const pkg = await PackageModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    return pkg ? (pkg.toJSON() as Package) : null;
  }

  async deletePackage(id: string): Promise<boolean> {
    // Check if package has active subscriptions
    const activeCount = await UserPackageModel.countDocuments({
      packageId: id,
      status: "active",
    });

    if (activeCount > 0) {
      throw new AppError(
        "Cannot delete package with active subscriptions",
        409
      );
    }

    const result = await PackageModel.findByIdAndDelete(id);
    return !!result;
  }

  // Subscription Management
  async createSubscription(data: CreateSubscriptionData): Promise<UserPackage> {
    const subscription = await UserPackageModel.create(data);

    // Update subscriber count
    await PackageModel.findByIdAndUpdate(data.packageId, {
      $inc: { subscriberCount: 1 },
    });

    const populated = await subscription.populate("packageId");
    return populated.toJSON() as UserPackage;
  }

  async getUserActiveSubscription(userId: string): Promise<UserPackage | null> {
    const subscription = await UserPackageModel.findOne({
      userId,
      status: "active",
    }).populate("packageId");

    return subscription ? (subscription.toJSON() as UserPackage) : null;
  }

  async getSubscriptionById(id: string): Promise<UserPackage | null> {
    const subscription = await UserPackageModel.findById(id).populate(
      "packageId"
    );
    return subscription ? (subscription.toJSON() as UserPackage) : null;
  }

  async getAllSubscriptions(
    page: number,
    limit: number
  ): Promise<{
    data: UserPackage[];
    total: number;
  }> {
    const skip = (page - 1) * limit;

    const [subscriptions, total] = await Promise.all([
      UserPackageModel.find()
        .populate("packageId")
        .populate("userId", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      UserPackageModel.countDocuments(),
    ]);

    return {
      data: subscriptions.map((sub) => sub.toJSON() as UserPackage),
      total,
    };
  }

  async cancelSubscription(
    id: string,
    immediately: boolean
  ): Promise<UserPackage> {
    const update = immediately
      ? { status: "cancelled" }
      : { cancelAtPeriodEnd: true };

    const subscription = await UserPackageModel.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    ).populate("packageId");

    if (!subscription) {
      throw new AppError("Subscription not found", 404);
    }

    return subscription.toJSON() as UserPackage;
  }

  async updateSubscriptionStatus(
    id: string,
    status: string
  ): Promise<UserPackage | null> {
    const subscription = await UserPackageModel.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    ).populate("packageId");

    return subscription ? (subscription.toJSON() as UserPackage) : null;
  }

  // Usage Tracking
  async getPackageUsage(userId: string): Promise<PackageUsage | null> {
    const usage = await PackageUsageModel.findOne({ userId });
    return usage ? (usage.toJSON() as PackageUsage) : null;
  }

  async createPackageUsage(
    userId: string,
    packageId: string
  ): Promise<PackageUsage> {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const usage = await PackageUsageModel.create({
      userId,
      packageId,
      cardsCreated: 0,
      boostsUsed: 0,
      periodStart: now,
      periodEnd,
    });

    return usage.toJSON() as PackageUsage;
  }

  async incrementCardUsage(userId: string): Promise<void> {
    await PackageUsageModel.findOneAndUpdate(
      { userId },
      { $inc: { cardsCreated: 1 } }
    );
  }

  async incrementBoostUsage(userId: string): Promise<void> {
    await PackageUsageModel.findOneAndUpdate(
      { userId },
      { $inc: { boostsUsed: 1 } }
    );
  }

  async resetUsageCounters(userId: string): Promise<void> {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await PackageUsageModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          boostsUsed: 0,
          periodStart: now,
          periodEnd,
        },
      }
    );
  }

  // Boost Management
  async createBoost(data: BoostCardData): Promise<BoostCard> {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + data.duration);

    const boost = await BoostCardModel.create({
      ...data,
      startDate,
      endDate,
      status: "active",
      impressions: 0,
      clicks: 0,
    });

    return boost.toJSON() as BoostCard;
  }

  async getActiveBoosts(userId: string): Promise<BoostCard[]> {
    const boosts = await BoostCardModel.find({
      userId,
      status: "active",
      endDate: { $gte: new Date() },
    }).populate("cardId");

    return boosts.map((boost) => boost.toJSON() as BoostCard);
  }

  async getCardActiveBoost(cardId: string): Promise<BoostCard | null> {
    const boost = await BoostCardModel.findOne({
      cardId,
      status: "active",
      endDate: { $gte: new Date() },
    });

    return boost ? (boost.toJSON() as BoostCard) : null;
  }

  async expireBoost(id: string): Promise<void> {
    await BoostCardModel.findByIdAndUpdate(id, { $set: { status: "expired" } });
  }

  async updateBoostStats(
    id: string,
    impressions: number,
    clicks: number
  ): Promise<void> {
    await BoostCardModel.findByIdAndUpdate(id, {
      $inc: { impressions, clicks },
    });
  }

  async getPackageSubscribers(
    packageId: string,
    page: number,
    limit: number
  ): Promise<any> {
    const skip = (page - 1) * limit;

    const [subscribers, total] = await Promise.all([
      UserPackageModel.find({ packageId, status: "active" })
        .populate("userId", "firstName lastName email")
        .populate("packageId", "name price")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      UserPackageModel.countDocuments({ packageId, status: "active" }),
    ]);

    return {
      data: subscribers.map((sub) => sub.toJSON()),
      total,
    };
  }
}
