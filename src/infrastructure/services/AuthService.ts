import jwt from "jsonwebtoken";
import { IAuthService } from "@domain/interfaces/IAuthServices";
import { AppError } from "@shared/errors/AppError";

export class AuthService implements IAuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: number;
  private readonly refreshSecret: string;
  private readonly refreshExpiresIn: number;

  constructor(
    jwtSecret: string,
    jwtExpiresIn: number = 15 * 60, // Short-lived access token
    refreshSecret?: string,
    refreshExpiresIn: number = 24 * 60 * 60 * 7 // Long-lived refresh token
  ) {
    this.jwtSecret = jwtSecret;
    this.jwtExpiresIn = jwtExpiresIn;
    this.refreshSecret = refreshSecret || jwtSecret + "_refresh";
    this.refreshExpiresIn = refreshExpiresIn;
  }

  async verifyToken(
    token: string
  ): Promise<{ userId: string; userRole: string; userEmail: string }> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as {
        userId: string;
        userRole: string;
        userEmail: string;
      };
      return {
        userId: decoded.userId,
        userRole: decoded.userRole,
        userEmail: decoded.userEmail,
      };
    } catch (error) {
      throw new AppError("Invalid or expired token", 401);
    }
  }

  generateToken(userId: string, userRole: string, userEmail: string): string {
    return jwt.sign({ userId, userRole, userEmail }, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    });
  }

  generateRefreshToken(
    userId: string,
    userRole: string,
    userEmail: string
  ): string {
    return jwt.sign({ userId, userRole, userEmail }, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn,
    });
  }

  async verifyRefreshToken(
    token: string
  ): Promise<{ userId: string; userRole: string; userEmail: string }> {
    try {
      const decoded = jwt.verify(token, this.refreshSecret) as {
        userId: string;
        userRole: string;
        userEmail: string;
      };
      return {
        userId: decoded.userId,
        userRole: decoded.userRole,
        userEmail: decoded.userEmail,
      };
    } catch (error) {
      throw new AppError("Invalid or expired refresh token", 401);
    }
  }
}
