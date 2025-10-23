// src/presentation/routes/packageRoutes.ts

import { Router } from "express";
import { PackageController } from "../controllers/PackageController";
import { AdminPackageController } from "../controllers/AdminPackageController";
import { authMiddleware } from "../../infrastructure/middleware/authMiddleware";
import { adminMiddleware } from "../../infrastructure/middleware/adminMiddleware";
import { validate } from "../../infrastructure/middleware/validator";
import packageValidators from "../validators/packageValidator";
import { PackageRepository } from "../../infrastructure/database/repositories/PackageRepository";

// Use cases
import { GetAvailablePackages } from "../../application/use-cases/package/GetAvailablePackages";
import { SubscribeToPackage } from "../../application/use-cases/package/SubscribeToPackage";
import { GetCurrentSubscription } from "../../application/use-cases/package/GetCurrentSubscription";
import { GetPackageUsage } from "../../application/use-cases/package/GetPackageUsage";
import { CancelSubscription } from "../../application/use-cases/package/CancelSubscription";
import { BoostCardUseCase } from "../../application/use-cases/package/BoostCard";
import { GetActiveBoosts } from "../../application/use-cases/package/GetActiveBoosts";

// Admin use cases
import { CreatePackage } from "../../application/use-cases/package/CreatePackage";
import { UpdatePackage } from "../../application/use-cases/package/UpdatePackage";
import { DeletePackage } from "../../application/use-cases/package/DeletePackage";
import { GetAllPackagesAdmin } from "../../application/use-cases/package/GetAllPackages";
import { SchedulePackage } from "../../application/use-cases/package/SchedulePackage";
import { GetAllSubscriptionsAdmin } from "../../application/use-cases/package/GetAllSubscriptions";
import { GetRevenueReport } from "../../application/use-cases/package/GetRevenueReport";
import { GetPlanUsageStats } from "../../application/use-cases/package/GetPlanUsageStats";
import { GetPackageSubscribers } from "../../application/use-cases/package/GetPackageSubscribers";

const router = Router();

// Initialize repository
const packageRepository = new PackageRepository();

// Initialize use cases
const getAvailablePackages = new GetAvailablePackages(packageRepository);
const subscribeToPackage = new SubscribeToPackage(packageRepository);
const getCurrentSubscription = new GetCurrentSubscription(packageRepository);
const getPackageUsage = new GetPackageUsage(packageRepository);
const cancelSubscription = new CancelSubscription(packageRepository);
const boostCard = new BoostCardUseCase(packageRepository);
const getActiveBoosts = new GetActiveBoosts(packageRepository);

// Initialize admin use cases
const createPackage = new CreatePackage(packageRepository);
const updatePackage = new UpdatePackage(packageRepository);
const deletePackage = new DeletePackage(packageRepository);
const getAllPackagesAdmin = new GetAllPackagesAdmin(packageRepository);
const schedulePackage = new SchedulePackage(packageRepository);
const getAllSubscriptionsAdmin = new GetAllSubscriptionsAdmin(
  packageRepository
);
const getRevenueReport = new GetRevenueReport(packageRepository);
const getPlanUsageStats = new GetPlanUsageStats(packageRepository);
const getPackageSubscribers = new GetPackageSubscribers(packageRepository);

// Initialize controllers
const packageController = new PackageController(
  getAvailablePackages,
  subscribeToPackage,
  getCurrentSubscription,
  getPackageUsage,
  cancelSubscription,
  boostCard,
  getActiveBoosts
);

const adminPackageController = new AdminPackageController(
  createPackage,
  updatePackage,
  deletePackage,
  getAllPackagesAdmin,
  schedulePackage,
  getAllSubscriptionsAdmin,
  getRevenueReport,
  getPlanUsageStats,
  getPackageSubscribers
);

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/packages
 * @desc    Get all available packages
 * @access  Public
 */
router.get("/packages", packageController.getPackages);

// ============================================================================
// USER PROTECTED ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/subscriptions/current
 * @desc    Get current user subscription
 * @access  Private
 */
router.get(
  "/subscriptions/current",
  authMiddleware,
  packageController.getCurrentUserSubscription
);

/**
 * @route   GET /api/v1/subscriptions/usage
 * @desc    Get package usage statistics
 * @access  Private
 */
router.get("/subscriptions/usage", authMiddleware, packageController.getUsage);

/**
 * @route   POST /api/v1/subscriptions
 * @desc    Subscribe to a package
 * @access  Private
 */
router.post(
  "/subscriptions",
  authMiddleware,
  validate(packageValidators.subscribe),
  packageController.subscribe
);

/**
 * @route   POST /api/v1/subscriptions/cancel
 * @desc    Cancel subscription
 * @access  Private
 */
router.post(
  "/subscriptions/cancel",
  authMiddleware,
  validate(packageValidators.cancel),
  packageController.cancel
);

/**
 * @route   GET /api/v1/boosts/active
 * @desc    Get active boosts
 * @access  Private
 */
router.get(
  "/boosts/active",
  authMiddleware,
  packageController.getActiveCardBoosts
);

/**
 * @route   POST /api/v1/cards/:cardId/boost
 * @desc    Boost a card
 * @access  Private
 */
router.post(
  "/cards/:cardId/boost",
  authMiddleware,
  validate(packageValidators.boostCard),
  packageController.boostCardById
);

// ============================================================================
// ADMIN ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/admin/packages
 * @desc    Get all packages (including inactive)
 * @access  Private/Admin
 */

router.get(
  "/admin/packages",
  authMiddleware,
  adminMiddleware,
  adminPackageController.getAll
);

/**
 * @route   POST /api/v1/admin/packages
 * @desc    Create a new package
 * @access  Private/Admin
 */
router.post(
  "/admin/packages",
  authMiddleware,
  adminMiddleware,
  validate(packageValidators.createPackage),
  adminPackageController.create
);

/**
 * @route   PUT /api/v1/admin/packages/:id
 * @desc    Update a package
 * @access  Private/Admin
 */
router.put(
  "/admin/packages/:id",
  authMiddleware,
  adminMiddleware,
  validate(packageValidators.updatePackage),
  adminPackageController.update
);

/**
 * @route   DELETE /api/v1/admin/packages/:id
 * @desc    Delete a package
 * @access  Private/Admin
 */
router.delete(
  "/admin/packages/:id",
  authMiddleware,
  adminMiddleware,
  validate(packageValidators.deletePackage),
  adminPackageController.delete
);

/**
 * @route   POST /api/v1/admin/packages/:id/schedule
 * @desc    Schedule package activation/deactivation
 * @access  Private/Admin
 */
router.post(
  "/admin/packages/:id/schedule",
  authMiddleware,
  adminMiddleware,
  validate(packageValidators.schedulePackage),
  adminPackageController.schedule
);

/**
 * @route   GET /api/v1/admin/subscriptions
 * @desc    Get all subscriptions with pagination
 * @access  Private/Admin
 */
router.get(
  "/admin/subscriptions",
  authMiddleware,
  adminMiddleware,
  validate(packageValidators.pagination),
  adminPackageController.getAllSubs
);

/**
 * @route   GET /api/v1/admin/packages/revenue-report
 * @desc    Get revenue report
 * @access  Private/Admin
 */
router.get(
  "/admin/packages/revenue-report",
  authMiddleware,
  adminMiddleware,
  validate(packageValidators.dateRange),
  adminPackageController.getRevenue
);

/**
 * @route   GET /api/v1/admin/packages/usage-stats
 * @desc    Get plan usage statistics
 * @access  Private/Admin
 */
router.get(
  "/admin/packages/usage-stats",
  authMiddleware,
  adminMiddleware,
  adminPackageController.getUsageStats
);

/**
 * @route   GET /api/v1/admin/packages/:packageId/subscribers
 * @desc    Get subscribers for a specific package
 * @access  Private/Admin
 */
router.get(
  "/admin/packages/:packageId/subscribers",
  authMiddleware,
  adminMiddleware,
  validate(packageValidators.getSubscribers),
  validate(packageValidators.pagination),
  adminPackageController.getSubscribers
);

/**
 * @route   POST /api/v1/admin/subscriptions/send-reminder
 * @desc    Send renewal reminder or upgrade offer
 * @access  Private/Admin
 */
router.post(
  "/admin/subscriptions/send-reminder",
  authMiddleware,
  adminMiddleware,
  validate(packageValidators.sendReminder),
  adminPackageController.sendReminder
);

/**
 * @route   GET /api/v1/admin/packages/export-billing
 * @desc    Export billing data as CSV
 * @access  Private/Admin
 */
router.get(
  "/admin/packages/export-billing",
  authMiddleware,
  adminMiddleware,
  validate(packageValidators.dateRange),
  adminPackageController.exportBilling
);

export default router;
