import { Response, NextFunction } from "express";
import { AuthRequest } from "@infrastructure/middleware/authMiddleware";
import { SubmitReportUseCase } from "@application/use-cases/report/SubmitReport";
import { GetUserReportsUseCase } from "@application/use-cases/report/GetUserReports";
import { GetReportByIdUseCase } from "@application/use-cases/report/GetReportById";
import { DeleteReportUseCase } from "@application/use-cases/report/DeleteReport";
import { GetAllReportsUseCase } from "@application/use-cases/report/GetAllReports";
import { UpdateReportStatusUseCase } from "@application/use-cases/report/UpdateReportStatus";
import { logger } from "@config/logger";

export class ReportController {
  constructor(
    private submitReportUseCase: SubmitReportUseCase,
    private getUserReportsUseCase: GetUserReportsUseCase,
    private getReportByIdUseCase: GetReportByIdUseCase,
    private deleteReportUseCase: DeleteReportUseCase,
    private getAllReportsUseCase: GetAllReportsUseCase,
    private updateReportStatusUseCase: UpdateReportStatusUseCase
  ) {}

  submitReport = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Authentication required",
        });
        return;
      }

      const report = await this.submitReportUseCase.execute({
        card_id: req.body.card_id,
        user_id: userId,
        report_type: req.body.report_type,
        details: req.body.details,
      });

      res.status(201).json({
        report: report.toJSON(),
        message:
          "Report submitted successfully. Thank you for helping us improve the platform.",
      });
    } catch (error: any) {
      logger.error("Error submitting report:", error);
      next(error);
    }
  };

  getUserReports = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Authentication required",
        });
        return;
      }

      const result = await this.getUserReportsUseCase.execute(userId);
      res.status(200).json(result);
    } catch (error) {
      logger.error("Error getting user reports:", error);
      next(error);
    }
  };

  getReportById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Authentication required",
        });
        return;
      }

      const isAdmin =
        req.userRole === "admin" || req.userRole === "super_admin";
      const report = await this.getReportByIdUseCase.execute(
        req.params.reportId,
        userId,
        isAdmin
      );

      res.status(200).json({ report });
    } catch (error) {
      logger.error("Error getting report:", error);
      next(error);
    }
  };

  deleteReport = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Authentication required",
        });
        return;
      }

      const result = await this.deleteReportUseCase.execute(
        req.params.reportId,
        userId
      );

      res.status(200).json(result);
    } catch (error) {
      logger.error("Error deleting report:", error);
      next(error);
    }
  };

  getAllReports = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const status = req.query.status as string;
      const reportType = req.query.report_type as string;

      const result = await this.getAllReportsUseCase.execute(page, limit, {
        status,
        report_type: reportType,
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error("Error getting all reports:", error);
      next(error);
    }
  };

  updateReportStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const adminId = req.userId;
      if (!adminId) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Authentication required",
        });
        return;
      }

      const report = await this.updateReportStatusUseCase.execute(
        req.params.reportId,
        adminId,
        {
          status: req.body.status,
          admin_notes: req.body.admin_notes,
        }
      );

      res.status(200).json({
        report,
        message: "Report status updated successfully",
      });
    } catch (error) {
      logger.error("Error updating report status:", error);
      next(error);
    }
  };
}
