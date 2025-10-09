import { Request, Response, NextFunction } from "express";
import { IAuthService } from "@domain/interfaces/IAuthServices";
import { AppError } from "@shared/errors/AppError";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  userEmail?: string;
}

export const authMiddleware = (authService: IAuthService) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError("No token provided", 401);
      }

      const token = authHeader.split(" ")[1];
      const { userId, userRole, userEmail } = await authService.verifyToken(
        token
      );

      req.userId = userId;
      req.userRole = userRole;
      req.userEmail = userEmail;
      next();
    } catch (error) {
      next(error);
    }
  };
};
