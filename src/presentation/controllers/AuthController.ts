import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "@infrastructure/middleware/authMiddleware";
import { GetCurrentUser } from "@application/use-cases/user/GetCurrentUser";
import { UpdateUserProfile } from "@application/use-cases/user/UpdateUserProfile";
import { GoogleAuthUseCase } from "@application/use-cases/auth/GoogleAuth";
import { RefreshTokenUseCase } from "@application/use-cases/auth/RefreshToken";
import { logger } from "@config/logger";

export class AuthController {
  constructor(
    private getCurrentUserUseCase: GetCurrentUser,
    private updateUserProfileUseCase: UpdateUserProfile,
    private googleAuthUseCase: GoogleAuthUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase
  ) {}

  /**
   * Google OAuth authentication
   * POST /api/v1/auth/google
   */
  googleAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      logger.info("Google authentication attempt");

      const result = await this.googleAuthUseCase.execute(req.body);

      logger.info(
        `Google auth successful for user: ${result.user.id} (isNew: ${result.isNewUser})`
      );

      res.status(200).json({
        success: true,
        data: {
          access_token: result.accessToken,
          refresh_token: result.refreshToken,
          token_type: "Bearer",
          expires_in: 3600,
          user: result.user,
        },
      });
    } catch (error) {
      logger.error("Google auth error:", error);
      next(error);
    }
  };

  /**
   * Refresh JWT token
   * POST /api/v1/auth/refresh
   */
  refreshToken = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return next(new Error("Refresh token is required"));
      }

      logger.info("Token refresh attempt");

      const tokens = await this.refreshTokenUseCase.execute(refreshToken);

      logger.info("Token refreshed successfully");

      res.status(200).json({
        message: "Token refreshed successfully",
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      logger.error("Token refresh error:", error);
      next(error);
    }
  };

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
      res
        .status(200)
        .json({ user: user.toPublicJSON ? user.toPublicJSON() : user });
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
        message: "Profile updated successfully",
        user: user,
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
