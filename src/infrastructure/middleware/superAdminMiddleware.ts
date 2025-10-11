// src/infrastructure/middleware/superAdminMiddleware.ts
import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";
import { UserModel } from "@infrastructure/database/models/UserModel";

export const superAdminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    // Check if user has super admin privileges
    const user = await UserModel.findById(req.userId);

    if (!user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "User not found",
      });
      return;
    }

    if (user.role !== "super_admin") {
      res.status(403).json({
        error: "Forbidden",
        message: "Super admin privileges required",
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to verify super admin privileges",
    });
  }
};
