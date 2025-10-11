// src/presentation/controllers/UserController.ts (Add these methods)
import { Response, NextFunction } from "express";
import { AuthRequest } from "@infrastructure/middleware/authMiddleware";
import { IUserRepository } from "@domain/interfaces/IUserRepository";
import { logger } from "@config/logger";
import { UpdateUserProfileUseCase } from "@application/use-cases/auth/UpdateUserProfile";
import { GetCurrentUserUseCase } from "@application/use-cases/auth/GetCurrentUser";

export class UserController {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase
  ) {}

  // ... existing methods ...

  /**
   * PUT /api/v1/user/profile
   * Update user profile (including domain selection)
   */
  async updateProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          error: "Unauthorized",
          message: "User not authenticated",
        });
        return;
      }
      console.log(req.body);
      const updateData: any = {};

      // Basic profile fields
      if (req.body.firstName) updateData.firstName = req.body.firstName;
      if (req.body.lastName) updateData.lastName = req.body.lastName;
      if (req.body.phone) updateData.phone = req.body.phone;
      if (req.body.avatar) updateData.avatar = req.body.avatar;

      // Domain selection fields
      if (req.body.domain_key) {
        updateData.domainKey = req.body.domain_key;
      }
      if (req.body.subcategory_key) {
        updateData.subcategoryKey = req.body.subcategory_key;
      }

      logger.info(`Updating profile for user: ${userId}`);

      console.log("updateData:", updateData);

      const updatedUser: any = await this.updateUserProfileUseCase.execute(
        userId,
        updateData
      );

      res.status(200).json({
        success: true,
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          fullName: `${updatedUser.firstName} ${updatedUser.lastName}`,
          phone: updatedUser.phone,
          avatar: updatedUser.avatar,
          role: updatedUser.role,
          domainKey: updatedUser.domainKey,
          subcategoryKey: updatedUser.subcategoryKey,
          verificationStatus: updatedUser.verificationStatus || "none",
          domainVerified: updatedUser.domainVerified || false,
          domainDocumentUrl: updatedUser.domainDocumentUrl,
        },
      });
    } catch (error) {
      logger.error("Error updating profile:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to update profile",
      });
    }
  }

  /**
   * GET /api/v1/user/profile
   * Get user profile
   */
  async getProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          error: "Unauthorized",
          message: "User not authenticated",
        });
        return;
      }

      const user: any = await this.userRepository.findById(userId);
      if (!user) {
        res.status(404).json({
          error: "NOT_FOUND",
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
          domainKey: user.domainKey,
          subcategoryKey: user.subcategoryKey,
          domainVerified: user.domainVerified || false,
          domainDocumentUrl: user.domainDocumentUrl,
          verificationStatus: user.verificationStatus || "none",
          verificationNotes: user.verificationNotes,
          createdAt: user.createdAt?.toISOString(),
          updatedAt: user.updatedAt?.toISOString(),
        },
      });
    } catch (error) {
      logger.error("Error getting profile:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to get profile",
      });
    }
  }

  async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          error: "Unauthorized",
          message: "User not authenticated",
        });
        return;
      }
      const user = await this.getCurrentUserUseCase.execute(userId);
      res.status(200).json(user);
    } catch (error) {
      logger.error("Error getting current user:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to get current user",
      });
    }
  }
}
