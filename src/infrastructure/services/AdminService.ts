// src/infrastructure/services/AdminService.ts
import { IAdminServices } from "@domain/interfaces/IAdminServices";
import {
  AdminStatsDTO,
  AdminUserDTO,
  AdminCardDTO,
} from "@application/dtos/AdminDTO";
import { UserModel } from "@infrastructure/database/models/UserModel";
import { CardModel } from "@infrastructure/database/models/CardModel";
import { DomainModel } from "@infrastructure/database/models/DomainModel";
import { UserRole } from "@domain/entities/User";

export class AdminService implements IAdminServices {
  async getDashboardStats(): Promise<AdminStatsDTO> {
    const totalUsers = await UserModel.countDocuments();
    const totalCards = await CardModel.countDocuments();
    const totalDomains = await DomainModel.countDocuments();

    const activeUsers = await UserModel.countDocuments({ isActive: true });
    const verifiedCards = await CardModel.countDocuments({ verified: true });
    const premiumUsers = await UserModel.countDocuments({
      role: { $in: [UserRole.ADMIN, UserRole.MODERATOR] },
    });

    // Calculate monthly growth (mock data - implement actual logic)
    const monthlyGrowth = 15;
    const totalReports = 0; // Implement if you have reports collection
    const pendingReviews = 0; // Implement if you have reviews collection

    return {
      totalUsers,
      totalCards,
      totalDomains,
      totalReports,
      activeUsers,
      pendingReviews,
      monthlyGrowth,
      verifiedCards,
      premiumUsers,
    };
  }

  async getAnalytics(days: number = 30): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Mock analytics data - implement actual aggregation logic
    const analytics = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      analytics.push({
        date: date.toISOString().split("T")[0],
        views: Math.floor(Math.random() * 2000) + 500,
        cards: Math.floor(Math.random() * 100) + 10,
        users: Math.floor(Math.random() * 50) + 5,
      });
    }

    return analytics;
  }

  async getAllUsers(): Promise<AdminUserDTO[]> {
    const users = await UserModel.find().sort({ createdAt: -1 }).lean();

    const usersWithCardCount: any = await Promise.all(
      users.map(async (user) => {
        const cardCount = await CardModel.countDocuments({
          user_id: user._id,
        });

        return {
          id: user._id,
          email: user.email,
          full_name: `${user.firstName} ${user.lastName}`,
          avatar_url: user.avatar || "",
          role: user.role,
          status: user.isActive ? "active" : "suspended",
          card_count: cardCount,
          created_at: user.createdAt.toISOString(),
        };
      })
    );

    return usersWithCardCount;
  }

  async createUser(data: {
    email: string;
    fullName: string;
    role: string;
  }): Promise<any> {
    const [firstName, ...lastNameParts] = data.fullName.split(" ");
    const lastName = lastNameParts.join(" ");

    const newUser = await UserModel.create({
      email: data.email,
      firstName,
      lastName,
      role: data.role as UserRole,
      isActive: true,
    });

    return {
      id: newUser._id,
      email: newUser.email,
      full_name: data.fullName,
      role: newUser.role,
    };
  }

  async updateUserRole(userId: string, role: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { role: role as UserRole });
  }

  async toggleUserStatus(userId: string): Promise<string> {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error("User not found");

    user.isActive = !user.isActive;
    await user.save();

    return user.isActive ? "active" : "suspended";
  }

  async getAllCards(): Promise<AdminCardDTO[]> {
    const cards = await CardModel.find().sort({ created_at: -1 }).lean();

    const cardsWithUserInfo: any = await Promise.all(
      cards.map(async (card) => {
        const user = await UserModel.findOne({
          _id: card.user_id,
        }).lean();

        return {
          id: card._id,
          name: card.title,
          title: card.title,
          company: card.company || "",
          domain: card.domain_key,
          is_public: card.is_public ?? true,
          view_count: card.views || 0,
          created_at:
            card.created_at?.toISOString() || new Date().toISOString(),
          user_id: card.user_id,
          user_email: user?.email || "",
        };
      })
    );

    return cardsWithUserInfo;
  }

  async deleteCard(cardId: string): Promise<void> {
    const result = await CardModel.findByIdAndDelete(cardId);
    if (!result) throw new Error("Card not found");
  }

  async createDomain(data: any): Promise<any> {
    const newDomain = await DomainModel.create(data);
    return {
      key: newDomain.key,
      ar: newDomain.ar,
      fr: newDomain.fr,
      en: newDomain.en,
    };
  }

  async deleteDomain(domainKey: string): Promise<void> {
    const result = await DomainModel.deleteOne({ key: domainKey });
    if (result.deletedCount === 0) throw new Error("Domain not found");
  }

  async getAllReports(): Promise<any[]> {
    // Implement if you have reports collection
    return [];
  }

  async updateReportStatus(reportId: string, status: string): Promise<void> {
    // Implement if you have reports collection
    throw new Error("Reports feature not implemented");
  }

  async getAllReviews(): Promise<any[]> {
    // Implement if you have reviews collection
    return [];
  }

  async deleteReview(reviewId: string): Promise<void> {
    // Implement if you have reviews collection
    throw new Error("Reviews feature not implemented");
  }

  async getAllFeedback(): Promise<any[]> {
    // Implement if you have feedback collection
    return [];
  }

  async updateFeedbackStatus(
    feedbackId: string,
    status: string
  ): Promise<void> {
    // Implement if you have feedback collection
    throw new Error("Feedback feature not implemented");
  }

  async getAllSubscriptions(): Promise<any[]> {
    // Implement if you have subscriptions collection
    return [];
  }

  async updateSubscription(
    userId: string,
    plan: string,
    expiresAt: string
  ): Promise<void> {
    // Implement if you have subscriptions collection
    throw new Error("Subscriptions feature not implemented");
  }
}
