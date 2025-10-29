// src/presentation/routes/packageRoutes.ts

import { Router } from "express";
import { PackageController } from "@presentation/controllers/PackageController";
import { AdminPackageController } from "@presentation/controllers/AdminPackageController";
import { authMiddleware } from "@infrastructure/middleware/authMiddleware";
import { adminMiddleware } from "@infrastructure/middleware/adminMiddleware";
import { IAuthService } from "@domain/interfaces/IAuthServices";
import { validate } from "@infrastructure/middleware/validator";
import packageValidators from "@presentation/validators/packageValidator";

export const createPackageRoutes = (
  packageController: PackageController,
  authService: IAuthService
): Router => {
  const router = Router();
  const auth = authMiddleware(authService);

  // ============================================================================
  // PUBLIC ROUTES
  // ============================================================================

  /**
   * @route   POST /api/v1/cards/:cardId/boost
   * @desc    Boost a card for X days (1 boost point = 1 day)
   * @access  Private
   * @body    { duration: number } - Number of days (1-30)
   */
  router.post(
    "/cards/:cardId/boost",
    auth,
    validate(packageValidators.boostCard),
    packageController.boostCardById.bind(packageController)
  );

  /**
   * @route   GET /api/v1/boosts/remaining
   * @desc    Get remaining boost points
   * @access  Private
   */
  router.get(
    "/boosts/remaining",
    auth,
    packageController.getRemainingBoostPoints.bind(packageController)
  );

  /**
   * @route   GET /api/v1/cards/:cardId/boost-stats
   * @desc    Get boost statistics for a card
   * @access  Private
   */
  router.get(
    "/cards/:cardId/boost-stats",
    auth,
    packageController.getCardBoostStats.bind(packageController)
  );

  /**
   * @route   POST /api/v1/cards/:cardId/boost
   * @desc    Boost a card
   * @access  Private
   */
  router.post(
    "/cards/:cardId/boost",
    auth,
    validate(packageValidators.boostCard),
    packageController.boostCardById.bind(packageController)
  );

  return router;
};

export const createAdminPackageRoutes = (
  adminPackageController: AdminPackageController,
  authService: IAuthService
): Router => {
  const router = Router();
  const auth = authMiddleware(authService);

  // All admin routes require authentication and admin privileges
  router.use(auth);
  router.use(adminMiddleware);

  // ============================================================================
  // ADMIN ROUTES
  // ============================================================================

  /**
   * @route   GET /api/v1/admin/packages
   * @desc    Get all packages (including inactive)
   * @access  Private/Admin
   */
  router.get(
    "/packages",
    adminPackageController.getAll.bind(adminPackageController)
  );

  /**
   * @route   POST /api/v1/admin/packages
   * @desc    Create a new package
   * @access  Private/Admin
   */
  router.post(
    "/packages",
    validate(packageValidators.createPackage),
    adminPackageController.create.bind(adminPackageController)
  );

  /**
   * @route   PUT /api/v1/admin/packages/:id
   * @desc    Update a package
   * @access  Private/Admin
   */
  router.put(
    "/packages/:id",
    validate(packageValidators.updatePackage),
    adminPackageController.update.bind(adminPackageController)
  );

  /**
   * @route   DELETE /api/v1/admin/packages/:id
   * @desc    Delete a package
   * @access  Private/Admin
   */
  router.delete(
    "/packages/:id",
    validate(packageValidators.deletePackage),
    adminPackageController.delete.bind(adminPackageController)
  );

  /**
   * @route   POST /api/v1/admin/packages/:id/schedule
   * @desc    Schedule package activation/deactivation
   * @access  Private/Admin
   */
  router.post(
    "/packages/:id/schedule",
    validate(packageValidators.schedulePackage),
    adminPackageController.schedule.bind(adminPackageController)
  );

  /**
   * @route   GET /api/v1/admin/subscriptions
   * @desc    Get all subscriptions with pagination
   * @access  Private/Admin
   */
  router.get(
    "/subscriptions",
    validate(packageValidators.pagination),
    adminPackageController.getAllSubs.bind(adminPackageController)
  );

  /**
   * @route   GET /api/v1/admin/packages/revenue-report
   * @desc    Get revenue report
   * @access  Private/Admin
   */
  router.get(
    "/packages/revenue-report",
    validate(packageValidators.dateRange),
    adminPackageController.getRevenue.bind(adminPackageController)
  );

  /**
   * @route   GET /api/v1/admin/packages/usage-stats
   * @desc    Get plan usage statistics
   * @access  Private/Admin
   */
  router.get(
    "/packages/usage-stats",
    adminPackageController.getUsageStats.bind(adminPackageController)
  );

  /**
   * @route   GET /api/v1/admin/packages/:packageId/subscribers
   * @desc    Get subscribers for a specific package
   * @access  Private/Admin
   */
  router.get(
    "/packages/:packageId/subscribers",
    validate(packageValidators.getSubscribers),
    validate(packageValidators.pagination),
    adminPackageController.getSubscribers.bind(adminPackageController)
  );

  /**
   * @route   POST /api/v1/admin/subscriptions/send-reminder
   * @desc    Send renewal reminder or upgrade offer
   * @access  Private/Admin
   */
  router.post(
    "/subscriptions/send-reminder",
    validate(packageValidators.sendReminder),
    adminPackageController.sendReminder.bind(adminPackageController)
  );

  /**
   * @route   GET /api/v1/admin/packages/export-billing
   * @desc    Export billing data as CSV
   * @access  Private/Admin
   */
  router.get(
    "/packages/export-billing",
    validate(packageValidators.dateRange),
    adminPackageController.exportBilling.bind(adminPackageController)
  );

  return router;
};
