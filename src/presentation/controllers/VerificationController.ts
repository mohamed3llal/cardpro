// src/presentation/controllers/VerificationController.ts
import { Response, NextFunction } from "express";
import { AuthRequest } from "@infrastructure/middleware/authMiddleware";
import {
  SubmitDomainVerification,
  VerificationError,
} from "@application/use-cases/verification/SubmitDomainVerification";
import { GetPendingVerifications } from "@application/use-cases/verification/GetPendingVerifications";
import { GetAllVerifications } from "@application/use-cases/verification/GetAllVerifications";
import { ApproveUserVerification } from "@application/use-cases/verification/ApproveUserVerification";
import { RejectUserVerification } from "@application/use-cases/verification/RejectUserVerification";
import { logger } from "@config/logger";

export class VerificationController {
  constructor(
    private readonly submitDomainVerificationUseCase: SubmitDomainVerification,
    private readonly getPendingVerificationsUseCase: GetPendingVerifications,
    private readonly getAllVerificationsUseCase: GetAllVerifications,
    private readonly approveUserVerificationUseCase: ApproveUserVerification,
    private readonly rejectUserVerificationUseCase: RejectUserVerification
  ) {}

  /**
   * POST /api/v1/user/domain-verification
   * Submit domain verification request
   */
  async submitDomainVerification(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          error: "Unauthorized",
          message: "User not authenticated",
        });
        return;
      }

      const { domain_key, subcategory_key, document_url, document_type } =
        req.body;

      // Validation
      if (!domain_key || !subcategory_key || !document_url || !document_type) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "All fields are required",
          required: [
            "domain_key",
            "subcategory_key",
            "document_url",
            "document_type",
          ],
        });
        return;
      }

      logger.info(`Submitting domain verification for user: ${userId}`);

      const result = await this.submitDomainVerificationUseCase.execute(
        userId,
        {
          domain_key,
          subcategory_key,
          document_url,
          document_type,
        }
      );

      res.status(200).json({
        success: true,
        message: "Verification submitted successfully",
        user: result,
      });
    } catch (error) {
      if (error instanceof VerificationError) {
        res.status(400).json({
          error: error.code,
          message: error.message,
        });
        return;
      }

      logger.error("Error submitting domain verification:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to submit verification",
      });
    }
  }

  /**
   * GET /api/v1/admin/verifications/pending
   * Get all pending verifications (Admin only)
   */
  async getPendingVerifications(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      logger.info("Fetching pending verifications");

      const verifications = await this.getPendingVerificationsUseCase.execute();

      res.status(200).json({
        verifications,
      });
    } catch (error) {
      logger.error("Error fetching pending verifications:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to fetch pending verifications",
      });
    }
  }

  /**
   * GET /api/v1/admin/verifications
   * Get all verifications with optional status filter (Admin only)
   */
  async getAllVerifications(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { status } = req.query;

      logger.info(
        `Fetching all verifications${status ? ` with status: ${status}` : ""}`
      );

      const verifications = await this.getAllVerificationsUseCase.execute(
        status as any
      );

      res.status(200).json({
        verifications,
      });
    } catch (error) {
      logger.error("Error fetching all verifications:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to fetch verifications",
      });
    }
  }

  /**
   * POST /api/v1/admin/users/:userId/verify/approve
   * Approve user verification (Admin only)
   */
  async approveUserVerification(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const { notes } = req.body;

      logger.info(`Approving verification for user: ${userId}`);

      const result = await this.approveUserVerificationUseCase.execute(
        userId,
        notes
      );

      res.status(200).json({
        success: true,
        message: "User verification approved",
        user: result,
      });
    } catch (error) {
      if (error instanceof VerificationError) {
        const statusCode = error.code === "USER_NOT_FOUND" ? 404 : 400;
        res.status(statusCode).json({
          error: error.code,
          message: error.message,
        });
        return;
      }

      logger.error("Error approving user verification:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to approve verification",
      });
    }
  }

  /**
   * POST /api/v1/admin/users/:userId/verify/reject
   * Reject user verification (Admin only)
   */
  async rejectUserVerification(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const { notes } = req.body;

      if (!notes || notes.trim().length === 0) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Rejection notes are required",
        });
        return;
      }

      logger.info(`Rejecting verification for user: ${userId}`);

      const result = await this.rejectUserVerificationUseCase.execute(
        userId,
        notes
      );

      res.status(200).json({
        success: true,
        message: "User verification rejected",
        user: result,
      });
    } catch (error) {
      if (error instanceof VerificationError) {
        const statusCode = error.code === "USER_NOT_FOUND" ? 404 : 400;
        res.status(statusCode).json({
          error: error.code,
          message: error.message,
        });
        return;
      }

      logger.error("Error rejecting user verification:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to reject verification",
      });
    }
  }
}
