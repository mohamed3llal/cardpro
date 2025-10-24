// src/presentation/controllers/PackageController.ts

import { Request, Response } from "express";
import { ResponseHandler } from "../../shared/utils/ResponseHandler";
import { GetAvailablePackages } from "../../application/use-cases/package/GetAvailablePackages";
import { SubscribeToPackage } from "../../application/use-cases/package/SubscribeToPackage";
import { GetCurrentSubscription } from "../../application/use-cases/package/GetCurrentSubscription";
import { GetPackageUsage } from "../../application/use-cases/package/GetPackageUsage";
import { CancelSubscription } from "../../application/use-cases/package/CancelSubscription";
import { BoostCardUseCase } from "../../application/use-cases/package/BoostCard";
import { GetActiveBoosts } from "../../application/use-cases/package/GetActiveBoosts";
import {
  PackageDTO,
  UserPackageDTO,
  PackageUsageDTO,
  BoostCardDTO,
} from "../../application/dtos/PackageDTO";
import { AuthRequest } from "@infrastructure/middleware/authMiddleware";

export class PackageController {
  constructor(
    private getAvailablePackages: GetAvailablePackages,
    private subscribeToPackage: SubscribeToPackage,
    private getCurrentSubscription: GetCurrentSubscription,
    private getPackageUsage: GetPackageUsage,
    private cancelSubscription: CancelSubscription,
    private boostCard: BoostCardUseCase,
    private getActiveBoosts: GetActiveBoosts
  ) {}

  // GET /packages - Public
  async getPackages(req: AuthRequest, res: Response): Promise<void> {
    try {
      const packages = await this.getAvailablePackages.execute();
      const packagesDTO = PackageDTO.fromEntities(packages);

      ResponseHandler.success(res, packagesDTO);
    } catch (error: any) {
      ResponseHandler.error(res, error.message, error.statusCode || 500);
    }
  }

  // GET /subscriptions/current - Protected
  async getCurrentUserSubscription(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId: any = req.userId;
      const subscription = await this.getCurrentSubscription.execute(userId);
      const subscriptionDTO = UserPackageDTO.fromEntity(subscription);

      ResponseHandler.success(res, subscriptionDTO);
    } catch (error: any) {
      ResponseHandler.error(res, error.message, error.statusCode || 500);
    }
  }

  // GET /subscriptions/usage - Protected
  async getUsage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId: any = req.userId;

      if (!userId) {
        ResponseHandler.error(res, "User not authenticated", 401);
        return;
      }

      const { usage, package: pkg } = await this.getPackageUsage.execute(
        userId
      );

      const usageDTO = PackageUsageDTO.fromEntity(usage, pkg);

      ResponseHandler.success(res, usageDTO);
    } catch (error: any) {
      console.error(`❌ Error in PackageController.getUsage:`, error);
      console.error(`Stack:`, error.stack);

      ResponseHandler.error(res, error.message, error.statusCode || 500);
    }
  }
  // POST /subscriptions - Protected
  async subscribe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId: any = req.userId;
      const { packageId, paymentMethodId } = req.body;

      const subscription = await this.subscribeToPackage.execute({
        userId,
        packageId,
        paymentMethodId,
      });

      const subscriptionDTO = UserPackageDTO.fromEntity(subscription);

      ResponseHandler.success(res, subscriptionDTO, 201);
    } catch (error: any) {
      ResponseHandler.error(res, error.message, error.statusCode || 500);
    }
  }

  // POST /subscriptions/cancel - Protected
  async cancel(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId: any = req.userId;
      const { reason, cancelImmediately } = req.body;

      const subscription = await this.cancelSubscription.execute({
        userId,
        reason,
        cancelImmediately,
      });

      const message = cancelImmediately
        ? "Subscription cancelled immediately"
        : "Subscription will be cancelled at period end";

      ResponseHandler.success(res, {
        message,
        subscription: UserPackageDTO.fromEntity(subscription),
      });
    } catch (error: any) {
      ResponseHandler.error(res, error.message, error.statusCode || 500);
    }
  }

  // GET /boosts/active - Protected
  async getActiveCardBoosts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId: any = req.userId;
      const boosts = await this.getActiveBoosts.execute(userId);
      const boostsDTO = BoostCardDTO.fromEntities(boosts);

      ResponseHandler.success(res, boostsDTO);
    } catch (error: any) {
      ResponseHandler.error(res, error.message, error.statusCode || 500);
    }
  }

  // POST /cards/:cardId/boost - Protected
  async boostCardById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId: any = req.userId;
      const { cardId } = req.params;
      const { duration } = req.body;

      const boost = await this.boostCard.execute({
        userId,
        cardId,
        duration,
      });

      const boostDTO = BoostCardDTO.fromEntity(boost);

      ResponseHandler.success(res, boostDTO, 201);
    } catch (error: any) {
      ResponseHandler.error(res, error.message, error.statusCode || 500);
    }
  }
}
