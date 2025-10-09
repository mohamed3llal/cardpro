import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";

export const superAdminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.userId || !req.userRole) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
    return;
  }

  if (req.userRole !== "super_admin") {
    res.status(403).json({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Super admin access required",
      },
    });
    return;
  }

  next();
};
