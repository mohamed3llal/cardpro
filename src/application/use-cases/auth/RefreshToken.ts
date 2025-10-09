import { IUserRepository } from "@domain/interfaces/IUserRepository";
import { IAuthService } from "@domain/interfaces/IAuthServices";
import { AppError } from "@shared/errors/AppError";

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenUseCase {
  constructor(
    private userRepository: IUserRepository,
    private authService: IAuthService
  ) {}

  async execute(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      // Verify refresh token
      const decoded = await this.authService.verifyRefreshToken(refreshToken);

      // Check if user still exists and is active
      const user = await this.userRepository.findById(decoded.userId);

      if (!user) {
        throw new AppError("User not found", 404);
      }

      if (!user.isActive) {
        throw new AppError("Your account has been deactivated", 403);
      }

      // Generate new tokens
      const newAccessToken = this.authService.generateToken(
        user.id!,
        user.role!,
        user.email!
      );
      const newRefreshToken = this.authService.generateRefreshToken(
        user.id!,
        user.role!,
        user.email!
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Invalid or expired refresh token", 401);
    }
  }
}
