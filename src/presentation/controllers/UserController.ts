import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "@infrastructure/middleware/authMiddleware";
import { GetCurrentUserUseCase } from "@application/use-cases/auth/GetCurrentUser";
import { UpdateUserProfileUseCase } from "@application/use-cases/auth/UpdateUserProfile";
import { logger } from "@config/logger";

export class UserController {
  constructor(
    private getCurrentUserUseCase: GetCurrentUserUseCase,
    private updateUserProfileUseCase: UpdateUserProfileUseCase
  ) {}

  getCurrentUser = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        return next(new Error("User ID not found in request"));
      }
      const user = await this.getCurrentUserUseCase.execute(userId);
      if (!user) {
        return next(new Error("User not found"));
      }

      res.status(200).json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        return next(new Error("User ID not found in request"));
      }
      const user = await this.updateUserProfileUseCase.execute(
        userId,
        req.body
      );

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          avatar: user.avatar,
          bio: user.bio,
          phone: user.phone,
          city: user.city,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        return next(new Error("User ID not found in request"));
      }
      logger.info(`User logged out: ${userId}`);
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  };
}
