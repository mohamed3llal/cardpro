export interface IAuthService {
  verifyToken(
    token: string
  ): Promise<{ userId: string; userRole: string; userEmail: string }>;
  generateToken(userId: string, userRole: string, userEmail: string): string;

  generateRefreshToken(
    userId: string,
    userRole: string,
    userEmail: string
  ): string;
  verifyRefreshToken(
    token: string
  ): Promise<{ userId: string; userRole: string; userEmail: string }>;
}
