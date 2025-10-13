import { IUserRepository } from "@domain/interfaces/IUserRepository";
import { User, UserRole, VerificationStatus } from "@domain/entities/User";
import { AppError } from "@shared/errors/AppError";
import {
  PaginatedUsersDTO,
  UserFilterDTO,
  UserStatsDTO,
} from "@application/dtos/UserDTO";

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  /**
   * Get paginated users with filters
   */
  async getPaginatedUsers(filters: UserFilterDTO): Promise<PaginatedUsersDTO> {
    const {
      role,
      isActive,
      verificationStatus,
      domainVerified,
      domainKey,
      search,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    // Build query
    const query: any = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive;
    if (verificationStatus) query.verificationStatus = verificationStatus;
    if (domainVerified !== undefined) query.domainVerified = domainVerified;
    if (domainKey) query.domainKey = domainKey;

    // Search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Get total count
    const totalItems = await this.userRepository.count(query);

    // Calculate pagination
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const skip = (currentPage - 1) * limit;

    // Fetch users
    const users = await this.userRepository.findAll(query);

    // Apply sorting and pagination in memory (ideally done in repository)
    const sortedUsers = users.sort((a, b) => {
      const aValue = a[sortBy as keyof User];
      const bValue = b[sortBy as keyof User];

      if (aValue === undefined || bValue === undefined) return 0;

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const paginatedUsers: any = sortedUsers.slice(skip, skip + limit);

    return {
      users: paginatedUsers.map((user: any) => user.toPublicJSON()),
      pagination: {
        currentPage,
        totalPages,
        totalItems,
        limit,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
      },
    };
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStatsDTO> {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({ isActive: true });
    const inactiveUsers = await this.userRepository.count({ isActive: false });
    const verifiedUsers = await this.userRepository.count({
      verificationStatus: VerificationStatus.APPROVED,
      domainVerified: true,
    });
    const pendingVerifications = await this.userRepository.count({
      verificationStatus: VerificationStatus.PENDING,
    });

    // Count by role
    const usersByRole = {
      user: await this.userRepository.count({ role: UserRole.USER }),
      admin: await this.userRepository.count({ role: UserRole.ADMIN }),
      moderator: await this.userRepository.count({ role: UserRole.MODERATOR }),
      super_admin: await this.userRepository.count({
        role: UserRole.SUPER_ADMIN,
      }),
    };

    // Get recent users (last 10)
    const allUsers = await this.userRepository.findAll();
    const recentUsers = allUsers
      .sort((a, b) => {
        const aTime = a.createdAt?.getTime() || 0;
        const bTime = b.createdAt?.getTime() || 0;
        return bTime - aTime;
      })
      .slice(0, 10)
      .map((user: any) => user.toPublicJSON());

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      verifiedUsers,
      pendingVerifications,
      usersByRole,
      recentUsers,
    };
  }

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(
    userIds: string[],
    updates: Partial<User>
  ): Promise<number> {
    let updatedCount = 0;

    for (const userId of userIds) {
      try {
        const result = await this.userRepository.update(userId, updates);
        if (result) updatedCount++;
      } catch (error) {
        console.error(`Failed to update user ${userId}:`, error);
      }
    }

    return updatedCount;
  }

  /**
   * Search users by term
   */
  async searchUsers(searchTerm: string, limit: number = 10): Promise<User[]> {
    const users = await this.userRepository.findAll();

    const filtered = users.filter((user) => {
      const fullName = user.fullName.toLowerCase();
      const email = user.email.toLowerCase();
      const term = searchTerm.toLowerCase();

      return fullName.includes(term) || email.includes(term);
    });

    return filtered.slice(0, limit);
  }

  /**
   * Get users by domain
   */
  async getUsersByDomain(domainKey: string): Promise<User[]> {
    return await this.userRepository.findByDomain(domainKey);
  }

  /**
   * Validate user can perform action
   */
  async canPerformAction(
    userId: string,
    action: "create_card" | "verify_domain" | "admin_access"
  ): Promise<boolean> {
    const user = await this.userRepository.findById(userId);

    if (!user || !user.isActive) {
      return false;
    }

    switch (action) {
      case "create_card":
        return true; // All active users can create cards

      case "verify_domain":
        return !!user.domainKey && !!user.subcategoryKey;

      case "admin_access":
        return user.isAdmin;

      default:
        return false;
    }
  }

  /**
   * Cleanup inactive users (soft delete or deactivate)
   */
  async cleanupInactiveUsers(daysInactive: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

    const users = await this.userRepository.findAll();

    let deactivatedCount = 0;

    for (const user of users) {
      const lastActivity = user.lastLoginAt || user.createdAt;

      if (lastActivity && lastActivity < cutoffDate && user.isActive) {
        user.deactivate();
        await this.userRepository.update(user.id!, user.toJSON());
        deactivatedCount++;
      }
    }

    return deactivatedCount;
  }

  /**
   * Export users to CSV format
   */
  async exportUsers(): Promise<string> {
    const users = await this.userRepository.findAll();

    const headers = [
      "ID",
      "Email",
      "First Name",
      "Last Name",
      "Phone",
      "Role",
      "Status",
      "Domain",
      "Subcategory",
      "Verified",
      "Created At",
    ];

    const rows = users.map((user) => [
      user.id || "",
      user.email,
      user.firstName,
      user.lastName,
      user.phone || "",
      user.role,
      user.isActive ? "Active" : "Inactive",
      user.domainKey || "",
      user.subcategoryKey || "",
      user.domainVerified ? "Yes" : "No",
      user.createdAt?.toISOString() || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    return csv;
  }
}
