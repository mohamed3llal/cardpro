// src/presentation/controllers/AdminController.ts
import { Response, NextFunction } from "express";
import { AuthRequest } from "@infrastructure/middleware/authMiddleware";
import { IAdminServices } from "@domain/interfaces/IAdminServices";
import { logger } from "@config/logger";

export class AdminController {
  constructor(private adminService: IAdminServices) {}

  checkAdminRole = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const isAdmin =
        req.userRole === "admin" || req.userRole === "super_admin";

      res.status(200).json({
        isAdmin,
      });
    } catch (error) {
      next(error);
    }
  };

  getDashboardStats = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const stats = await this.adminService.getDashboardStats();

      res.status(200).json({
        stats,
      });
    } catch (error) {
      logger.error("Error fetching dashboard stats:", error);
      next(error);
    }
  };

  getAnalytics = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const analytics = await this.adminService.getAnalytics(days);

      res.status(200).json({
        analytics,
      });
    } catch (error) {
      logger.error("Error fetching analytics:", error);
      next(error);
    }
  };

  getAllUsers = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const users = await this.adminService.getAllUsers();

      res.status(200).json({
        users,
      });
    } catch (error) {
      logger.error("Error fetching users:", error);
      next(error);
    }
  };

  createUser = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, fullName, role } = req.body;

      if (!email || !fullName || !role) {
        res.status(400).json({
          error: "Validation Error",
          message: "Email, fullName, and role are required",
        });
        return;
      }

      const user = await this.adminService.createUser({
        email,
        fullName,
        role,
      });

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      logger.error("Error creating user:", error);
      if (error.code === 11000) {
        res.status(409).json({
          error: "Duplicate Error",
          message: "User with this email already exists",
        });
        return;
      }
      next(error);
    }
  };

  updateUserRole = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!role) {
        res.status(400).json({
          error: "Validation Error",
          message: "Role is required",
        });
        return;
      }

      await this.adminService.updateUserRole(userId, role);

      res.status(200).json({
        success: true,
        message: "User role updated successfully",
      });
    } catch (error) {
      logger.error("Error updating user role:", error);
      next(error);
    }
  };

  toggleUserStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const status = await this.adminService.toggleUserStatus(userId);

      res.status(200).json({
        success: true,
        status,
      });
    } catch (error) {
      logger.error("Error toggling user status:", error);
      next(error);
    }
  };

  getAllCards = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const cards = await this.adminService.getAllCards();

      res.status(200).json({
        cards,
      });
    } catch (error) {
      logger.error("Error fetching cards:", error);
      next(error);
    }
  };

  deleteCard = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { cardId } = req.params;
      await this.adminService.deleteCard(cardId);

      res.status(200).json({
        success: true,
        message: "Card deleted successfully",
      });
    } catch (error) {
      logger.error("Error deleting card:", error);
      next(error);
    }
  };

  /**
   * POST /api/v1/admin/domains
   * Create a new domain (Super Admin only)
   */
  createDomain = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const domain = await this.adminService.createDomain(req.body);

      res.status(201).json({
        success: true,
        domain,
      });
    } catch (error: any) {
      logger.error("Error creating domain:", error);
      if (error.code === 11000) {
        res.status(409).json({
          error: "Duplicate Error",
          message: "Domain with this key already exists",
        });
        return;
      }
      next(error);
    }
  };

  /**
   * DELETE /api/v1/admin/domains/:domainKey
   * Delete a domain (Super Admin only)
   */
  deleteDomain = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { domainKey } = req.params;
      await this.adminService.deleteDomain(domainKey);

      res.status(200).json({
        success: true,
        message: "Domain deleted successfully",
      });
    } catch (error) {
      logger.error("Error deleting domain:", error);
      next(error);
    }
  };

  getAllSubscriptions = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const subscriptions = await this.adminService.getAllSubscriptions();

      res.status(200).json({
        subscriptions,
      });
    } catch (error) {
      logger.error("Error fetching subscriptions:", error);
      next(error);
    }
  };

  updateSubscription = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const { plan, expiresAt } = req.body;

      if (!plan || !expiresAt) {
        res.status(400).json({
          error: "Validation Error",
          message: "Plan and expiresAt are required",
        });
        return;
      }

      await this.adminService.updateSubscription(userId, plan, expiresAt);

      res.status(200).json({
        success: true,
        message: "Subscription updated successfully",
      });
    } catch (error) {
      logger.error("Error updating subscription:", error);
      next(error);
    }
  };
}
