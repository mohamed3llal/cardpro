// src/presentation/controllers/UserController.ts

import { Response, NextFunction } from "express";
import { AuthRequest } from "@infrastructure/middleware/authMiddleware";
import { GetCurrentUser } from "@application/use-cases/user/GetCurrentUser";
import { UpdateUserProfile } from "@application/use-cases/user/UpdateUserProfile";
import { GetUserProfile } from "@application/use-cases/user/GetUserProfile";
import { ToggleUserStatus } from "@application/use-cases/user/ToggleUserStatus";
import { ChangeUserRole } from "@application/use-cases/user/ChangeUserRole";
import { logger } from "@config/logger";
import { AppError } from "@shared/errors/AppError";

export class UserController {
  constructor(
    private readonly getCurrentUserUseCase: GetCurrentUser,
    private readonly updateUserProfileUseCase: UpdateUserProfile,
    private readonly getUserProfileUseCase: GetUserProfile,
    private readonly toggleUserStatusUseCase: ToggleUserStatus,
    private readonly changeUserRoleUseCase: ChangeUserRole
  ) {}

  /**
   * GET /api/v1/user/me
   * Get current authenticated user
   */
  getCurrentUser = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;

      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      const user = await this.getCurrentUserUseCase.execute(userId);
      res.status(200).json(user);
    } catch (error) {
      logger.error("Error getting current user:", error);
      next(error);
    }
  };

  /**
   * GET /api/v1/user/profile
   * Get user profile (alias for getCurrentUser)
   */
  getProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;

      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      const user = await this.getUserProfileUseCase.execute(userId);

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      logger.error("Error getting user profile:", error);
      next(error);
    }
  };

  /**
   * PUT /api/v1/user/profile
   * Update user profile
   */
  updateProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;

      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }
      const updateData = {
        firstName: req.body.first_name,
        lastName: req.body.last_name,
        phone: req.body.phone,
        avatar: req.body.avatar,
        bio: req.body.bio,
        city: req.body.city,
        domainKey: req.body.domain_key,
        subcategoryKey: req.body.subcategory_key,
      };

      // Remove undefined values
      Object.keys(updateData).forEach(
        (key) =>
          updateData[key as keyof typeof updateData] === undefined &&
          delete updateData[key as keyof typeof updateData]
      );

      logger.info(`Updating profile for user: ${userId}`, { updateData });

      const user = await this.updateUserProfileUseCase.execute(
        userId,
        updateData
      );
      res.status(200).json(user);
    } catch (error) {
      logger.error("Error updating profile:", error);
      next(error);
    }
  };

  /**
   * GET /api/v1/user/:userId
   * Get user by ID (Admin only)
   */
  getUserById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params;

      if (!userId) {
        throw new AppError("User ID is required", 400);
      }

      const user = await this.getUserProfileUseCase.execute(userId);

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      logger.error("Error getting user by ID:", error);
      next(error);
    }
  };

  /**
   * PATCH /api/v1/admin/users/:userId/status
   * Toggle user active status (Admin only)
   */
  toggleUserStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const requestingUserId = req.userId;

      if (!requestingUserId) {
        throw new AppError("User not authenticated", 401);
      }

      if (!userId) {
        throw new AppError("User ID is required", 400);
      }

      const result = await this.toggleUserStatusUseCase.execute(
        userId,
        requestingUserId
      );

      res.status(200).json({
        success: true,
        message: `User ${
          result.status === "active" ? "activated" : "deactivated"
        } successfully`,
        status: result.status,
      });
    } catch (error) {
      logger.error("Error toggling user status:", error);
      next(error);
    }
  };

  /**
   * PATCH /api/v1/admin/users/:userId/role
   * Change user role (Admin only)
   */
  changeUserRole = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      const requestingUserId = req.userId;

      if (!requestingUserId) {
        throw new AppError("User not authenticated", 401);
      }

      if (!userId) {
        throw new AppError("User ID is required", 400);
      }

      if (!role) {
        throw new AppError("Role is required", 400);
      }

      const validRoles = ["user", "admin", "moderator", "super_admin"];
      if (!validRoles.includes(role)) {
        throw new AppError(
          `Invalid role. Must be one of: ${validRoles.join(", ")}`,
          400
        );
      }

      const user = await this.changeUserRoleUseCase.execute(
        userId,
        role,
        requestingUserId
      );

      res.status(200).json({
        success: true,
        message: "User role updated successfully",
        user,
      });
    } catch (error) {
      logger.error("Error changing user role:", error);
      next(error);
    }
  };
}
