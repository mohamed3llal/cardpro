// src/presentation/controllers/AdminPackageController.ts

import { Request, Response } from "express";
import { ResponseHandler } from "@shared/utils/ResponseHandler";
import { CreatePackage } from "@application/use-cases/package/CreatePackage";
import { UpdatePackage } from "@application/use-cases/package/UpdatePackage";
import { DeletePackage } from "@application/use-cases/package/DeletePackage";
import { GetAllPackagesAdmin } from "@application/use-cases/package/GetAllPackages";
import { SchedulePackage } from "@application/use-cases/package/SchedulePackage";
import { GetAllSubscriptionsAdmin } from "@application/use-cases/package/GetAllSubscriptions";
import { GetRevenueReport } from "@application/use-cases/package/GetRevenueReport";
import { GetPlanUsageStats } from "@application/use-cases/package/GetPlanUsageStats";
import { GetPackageSubscribers } from "@application/use-cases/package/GetPackageSubscribers";
import { PackageDTO, UserPackageDTO } from "@application/dtos/PackageDTO";
import { AuthRequest } from "@infrastructure/middleware/authMiddleware";

export class AdminPackageController {
  constructor(
    private readonly createPackageUseCase: CreatePackage,
    private readonly updatePackageUseCase: UpdatePackage,
    private readonly deletePackageUseCase: DeletePackage,
    private readonly getAllPackagesUseCase: GetAllPackagesAdmin,
    private readonly schedulePackageUseCase: SchedulePackage,
    private readonly getAllSubscriptionsUseCase: GetAllSubscriptionsAdmin,
    private readonly getRevenueReportUseCase: GetRevenueReport,
    private readonly getPlanUsageStatsUseCase: GetPlanUsageStats,
    private readonly getPackageSubscribersUseCase: GetPackageSubscribers
  ) {}

  // GET /admin/packages
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === "true";

      const packages = await this.getAllPackagesUseCase.execute(
        includeInactive
      );

      const packagesDTO = PackageDTO.fromEntities(packages);

      ResponseHandler.success(res, {
        packages: packagesDTO,
        total: packagesDTO.length,
      });
    } catch (error: any) {
      console.error("❌ Error in AdminPackageController.getAll:", error);
      console.error("Stack:", error.stack);

      ResponseHandler.error(
        res,
        error.message || "Failed to retrieve packages",
        error.statusCode || 500
      );
    }
  }

  // POST /admin/packages
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const packageData = req.body;
      const pkg = await this.createPackageUseCase.execute(packageData);
      const packageDTO = PackageDTO.fromEntity(pkg);

      ResponseHandler.success(res, packageDTO, 201);
    } catch (error: any) {
      ResponseHandler.error(res, error.message, error.statusCode || 500);
    }
  }

  // PUT /admin/packages/:id
  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const pkg = await this.updatePackageUseCase.execute(id, updateData);
      const packageDTO = PackageDTO.fromEntity(pkg);

      ResponseHandler.success(res, packageDTO);
    } catch (error: any) {
      ResponseHandler.error(res, error.message, error.statusCode || 500);
    }
  }

  // DELETE /admin/packages/:id
  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.deletePackageUseCase.execute(id);

      ResponseHandler.success(res, null, 204);
    } catch (error: any) {
      ResponseHandler.error(res, error.message, error.statusCode || 500);
    }
  }

  // POST /admin/packages/:id/schedule
  async schedule(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { scheduledActivateAt, scheduledDeactivateAt } = req.body;

      const pkg = await this.schedulePackageUseCase.execute({
        packageId: id,
        scheduledActivateAt: scheduledActivateAt
          ? new Date(scheduledActivateAt)
          : undefined,
        scheduledDeactivateAt: scheduledDeactivateAt
          ? new Date(scheduledDeactivateAt)
          : undefined,
      });

      const packageDTO = PackageDTO.fromEntity(pkg);

      ResponseHandler.success(res, packageDTO);
    } catch (error: any) {
      ResponseHandler.error(res, error.message, error.statusCode || 500);
    }
  }

  // GET /admin/subscriptions
  async getAllSubs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await this.getAllSubscriptionsUseCase.execute(page, limit);

      ResponseHandler.success(res, result);
    } catch (error: any) {
      ResponseHandler.error(res, error.message, error.statusCode || 500);
    }
  }

  // GET /admin/packages/revenue-report
  async getRevenue(req: AuthRequest, res: Response): Promise<void> {
    try {
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;

      const report = await this.getRevenueReportUseCase.execute(
        startDate,
        endDate
      );

      ResponseHandler.success(res, report);
    } catch (error: any) {
      ResponseHandler.error(res, error.message, error.statusCode || 500);
    }
  }

  // GET /admin/packages/usage-stats
  async getUsageStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await this.getPlanUsageStatsUseCase.execute();

      ResponseHandler.success(res, stats);
    } catch (error: any) {
      ResponseHandler.error(res, error.message, error.statusCode || 500);
    }
  }

  // GET /admin/packages/:packageId/subscribers
  async getSubscribers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { packageId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await this.getPackageSubscribersUseCase.execute(
        packageId,
        page,
        limit
      );

      ResponseHandler.success(res, result);
    } catch (error: any) {
      ResponseHandler.error(res, error.message, error.statusCode || 500);
    }
  }

  // POST /admin/subscriptions/send-reminder
  async sendReminder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, packageId, type } = req.body;

      // TODO: Implement email sending logic
      // await this.emailService.sendReminder(userId, packageId, type);

      ResponseHandler.success(res, {
        message: `${
          type === "upgrade" ? "Upgrade offer" : "Renewal reminder"
        } sent successfully`,
        sentAt: new Date().toISOString(),
      });
    } catch (error: any) {
      ResponseHandler.error(res, error.message, error.statusCode || 500);
    }
  }

  // GET /admin/packages/export-billing
  async exportBilling(req: AuthRequest, res: Response): Promise<void> {
    try {
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;

      // TODO: Implement CSV export logic
      // const csvData = await this.billingExportService.exportBilling(startDate, endDate);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=billing-export.csv"
      );

      const csvHeader =
        "User ID,User Email,Package Name,Status,Amount,Currency,Period Start,Period End,Created At\n";
      res.send(csvHeader + "// CSV data would go here");
    } catch (error: any) {
      ResponseHandler.error(res, error.message, error.statusCode || 500);
    }
  }
}
