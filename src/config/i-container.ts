import dotenv from "dotenv";
dotenv.config();
import { env } from "./env";

import { CardRepository } from "@infrastructure/database/repositories/CardRepository";
import { AnalyticsRepository } from "@infrastructure/database/repositories/AnalyticsRepository";
import { UserRepository } from "@infrastructure/database/repositories/UserRepository";

import { AuthService } from "@infrastructure/services/AuthService";

import { CreateCardUseCase } from "@application/use-cases/card/CreateCard";
import { GetUserCardsUseCase } from "@application/use-cases/card/GetUserCards";
import { GetCardByIdUseCase } from "@application/use-cases/card/GetCardById";
import { UpdateCardUseCase } from "@application/use-cases/card/UpdateCard";
import { DeleteCardUseCase } from "@application/use-cases/card/DeleteCard";
import { ToggleCardVisibilityUseCase } from "@application/use-cases/card/ToggleCardVisibility";

import { GetDashboardStatsUseCase } from "@application/use-cases/analytics/GetDashboardStats";
import { GoogleAuthUseCase } from "@application/use-cases/auth/GoogleAuth";
import { RefreshTokenUseCase } from "@application/use-cases/auth/RefreshToken";
import { GetCurrentUser } from "@application/use-cases/user/GetCurrentUser";
import { UpdateUserProfile } from "@application/use-cases/user/UpdateUserProfile";

import { CardController } from "@presentation/controllers/CardController";
import { AnalyticsController } from "@presentation/controllers/AnalyticsController";
import { AuthController } from "@presentation/controllers/AuthController";
import { UserController } from "@presentation/controllers/UserController";

import { DomainRepository } from "@infrastructure/database/repositories/DomainRepository";
import { GetAllDomains } from "@application/use-cases/domain/GetAllDomains";
import { GetDomainByKey } from "@application/use-cases/domain/GetDomainByKey";
import { CreateDomain } from "@application/use-cases/domain/CreateDomain";
import { UpdateDomain } from "@application/use-cases/domain/UpdateDomain";
import { DeleteDomain } from "@application/use-cases/domain/DeleteDomain";
import { AddSubcategory } from "@application/use-cases/domain/AddSubcategory";
import { UpdateSubcategory } from "@application/use-cases/domain/UpdateSubcategory";
import { DeleteSubcategory } from "@application/use-cases/domain/DeleteSubcategory";
import { DomainController } from "@presentation/controllers/DomainController";

import { AdminService } from "@infrastructure/services/AdminService";
import { AdminController } from "@presentation/controllers/AdminController";

// Add to imports section:
import { SearchBusinesses } from "@application/use-cases/business/SearchBusinesses";
import { GetFeaturedBusinessesUseCase } from "@application/use-cases/business/GetFeaturedBusinesses";
import { GetBusinessById } from "@application/use-cases/business/GetBusinessById";
import { RecordView } from "@application/use-cases/business/RecordView";
import { RecordScan } from "@application/use-cases/business/RecordScan";
import { RecordContactClick } from "@application/use-cases/business/RecordContactClick";
import { BusinessController } from "@presentation/controllers/BusinessController";

import { SubmitDomainVerification } from "@application/use-cases/verification/SubmitDomainVerification";
import { GetPendingVerifications } from "@application/use-cases/verification/GetPendingVerifications";
import { GetAllVerifications } from "@application/use-cases/verification/GetAllVerifications";
import { ApproveUserVerification } from "@application/use-cases/verification/ApproveUserVerification";
import { RejectUserVerification } from "@application/use-cases/verification/RejectUserVerification";
import { VerificationController } from "@presentation/controllers/VerificationController";

// User Use Cases
import { GetUserProfile } from "@application/use-cases/user/GetUserProfile";
import { ToggleUserStatus } from "@application/use-cases/user/ToggleUserStatus";
import { ChangeUserRole } from "@application/use-cases/user/ChangeUserRole";
import { UpdateLastLogin } from "@application/use-cases/user/UpdateLastLogin";

// Add to imports section:
import { MessagingRepository } from "@infrastructure/database/repositories/MessagingRepository";
import { MessagingController } from "@presentation/controllers/MessagingController";

//favorites
import { FavoriteRepository } from "@infrastructure/database/repositories/FavoriteRepository";
import { AddToFavoritesUseCase } from "@application/use-cases/favorite/AddToFavorites";
import { RemoveFromFavoritesUseCase } from "@application/use-cases/favorite/RemoveFromFavorites";
import { GetUserFavoritesUseCase } from "@application/use-cases/favorite/GetUserFavorites";
import { GetFavoriteBusinessesUseCase } from "@application/use-cases/favorite/GetFavoriteBusinesses";
import { CheckIsFavoritedUseCase } from "@application/use-cases/favorite/CheckIsFavorited";
import { FavoriteController } from "@presentation/controllers/FavoriteController";

// reviews
import { ReviewRepository } from "@infrastructure/database/repositories/ReviewRepository";
import { CreateReviewUseCase } from "@application/use-cases/review/CreateReview";
import { GetBusinessReviewsUseCase } from "@application/use-cases/review/GetBusinessReviews";
import { GetUserReviewsUseCase } from "@application/use-cases/review/GetUserReviews";
import { UpdateReviewUseCase } from "@application/use-cases/review/UpdateReview";
import { DeleteReviewUseCase } from "@application/use-cases/review/DeleteReview";
import { MarkReviewHelpfulUseCase } from "@application/use-cases/review/MarkReviewHelpful";
import { ReviewController } from "@presentation/controllers/ReviewController";

// reports
import { ReportRepository } from "@infrastructure/database/repositories/ReportRepository";
import { SubmitReportUseCase } from "@application/use-cases/report/SubmitReport";
import { GetUserReportsUseCase } from "@application/use-cases/report/GetUserReports";
import { GetReportByIdUseCase } from "@application/use-cases/report/GetReportById";
import { UpdateReportStatusUseCase } from "@application/use-cases/report/UpdateReportStatus";
import { DeleteReportUseCase } from "@application/use-cases/report/DeleteReport";
import { ReportController } from "@presentation/controllers/ReportController";
import { GetAllReportsUseCase } from "@application/use-cases/report/GetAllReports";

// Import feedback components
import { FeedbackRepository } from "@infrastructure/database/repositories/FeedbackRepository";
import { SubmitFeedbackUseCase } from "@application/use-cases/feedback/SubmitFeedback";
import { GetUserFeedbackUseCase } from "@application/use-cases/feedback/GetUserFeedback";
import { GetFeedbackByIdUseCase } from "@application/use-cases/feedback/GetFeedbackById";
import { DeleteFeedbackUseCase } from "@application/use-cases/feedback/DeleteFeedback";
import { GetAllFeedbackUseCase } from "@application/use-cases/feedback/GetAllFeedback";
import { UpdateFeedbackStatusUseCase } from "@application/use-cases/feedback/UpdateFeedbackStatus";
import { FeedbackController } from "@presentation/controllers/FeedbackController";
import { GetAllReviewsUseCase } from "@application/use-cases/review/GetAllReviews";

// Package imports
import { PackageRepository } from "@infrastructure/database/repositories/PackageRepository";
import { PackageController } from "@presentation/controllers/PackageController";
import { AdminPackageController } from "@presentation/controllers/AdminPackageController";

// Package use cases
import { GetAvailablePackages } from "@application/use-cases/package/GetAvailablePackages";
import { SubscribeToPackage } from "@application/use-cases/package/SubscribeToPackage";
import { GetCurrentSubscription } from "@application/use-cases/package/GetCurrentSubscription";
import { GetPackageUsage } from "@application/use-cases/package/GetPackageUsage";
import { CancelSubscription } from "@application/use-cases/package/CancelSubscription";
import { BoostCardUseCase } from "@application/use-cases/package/BoostCard";
import { GetActiveBoosts } from "@application/use-cases/package/GetActiveBoosts";

// Admin package use cases
import { CreatePackage } from "@application/use-cases/package/CreatePackage";
import { UpdatePackage } from "@application/use-cases/package/UpdatePackage";
import { DeletePackage } from "@application/use-cases/package/DeletePackage";
import { GetAllPackagesAdmin } from "@application/use-cases/package/GetAllPackages";
import { SchedulePackage } from "@application/use-cases/package/SchedulePackage";
import { GetAllSubscriptionsAdmin } from "@application/use-cases/package/GetAllSubscriptions";
import { GetRevenueReport } from "@application/use-cases/package/GetRevenueReport";
import { GetPlanUsageStats } from "@application/use-cases/package/GetPlanUsageStats";
import { GetPackageSubscribers } from "@application/use-cases/package/GetPackageSubscribers";

export class DIContainer {
  private static instance: DIContainer;

  // Package Repository
  public readonly packageRepository: PackageRepository;

  // Package Use Cases
  public readonly getAvailablePackagesUseCase: GetAvailablePackages;
  public readonly subscribeToPackageUseCase: SubscribeToPackage;
  public readonly getCurrentSubscriptionUseCase: GetCurrentSubscription;
  public readonly getPackageUsageUseCase: GetPackageUsage;
  public readonly cancelSubscriptionUseCase: CancelSubscription;
  public readonly boostCardUseCase: BoostCardUseCase;
  public readonly getActiveBoostsUseCase: GetActiveBoosts;

  // Admin Package Use Cases
  public readonly createPackageUseCase: CreatePackage;
  public readonly updatePackageUseCase: UpdatePackage;
  public readonly deletePackageUseCase: DeletePackage;
  public readonly getAllPackagesAdminUseCase: GetAllPackagesAdmin;
  public readonly schedulePackageUseCase: SchedulePackage;
  public readonly getAllSubscriptionsAdminUseCase: GetAllSubscriptionsAdmin;
  public readonly getRevenueReportUseCase: GetRevenueReport;
  public readonly getPlanUsageStatsUseCase: GetPlanUsageStats;
  public readonly getPackageSubscribersUseCase: GetPackageSubscribers;

  // Package Controllers
  public readonly packageController: PackageController;
  public readonly adminPackageController: AdminPackageController;

  // Feedback Repository
  public readonly feedbackRepository: FeedbackRepository;

  // Feedback Use Cases
  public readonly submitFeedbackUseCase: SubmitFeedbackUseCase;
  public readonly getUserFeedbackUseCase: GetUserFeedbackUseCase;
  public readonly getFeedbackByIdUseCase: GetFeedbackByIdUseCase;
  public readonly deleteFeedbackUseCase: DeleteFeedbackUseCase;
  public readonly getAllFeedbackUseCase: GetAllFeedbackUseCase;
  public readonly updateFeedbackStatusUseCase: UpdateFeedbackStatusUseCase;

  // Feedback Controller
  public readonly feedbackController: FeedbackController;

  // reports repository
  public readonly reportRepository: ReportRepository;

  // reports use cases
  public readonly submitReportUseCase: SubmitReportUseCase;
  public readonly getUserReportsUseCase: GetUserReportsUseCase;
  public readonly getReportByIdUseCase: GetReportByIdUseCase;
  public readonly updateReportStatusUseCase: UpdateReportStatusUseCase;
  public readonly deleteReportUseCase: DeleteReportUseCase;
  public readonly getAllReportsUseCase: GetAllReportsUseCase;

  // reports controller
  public readonly reportController: ReportController;

  // Review Repository
  public readonly reviewRepository: ReviewRepository;

  // Review Use Cases
  public readonly createReviewUseCase: CreateReviewUseCase;
  public readonly getBusinessReviewsUseCase: GetBusinessReviewsUseCase;
  public readonly getUserReviewsUseCase: GetUserReviewsUseCase;
  public readonly updateReviewUseCase: UpdateReviewUseCase;
  public readonly deleteReviewUseCase: DeleteReviewUseCase;
  public readonly markReviewHelpfulUseCase: MarkReviewHelpfulUseCase;
  public readonly getAllReviewsUseCase: GetAllReviewsUseCase;

  // Review Controller
  public readonly reviewController: ReviewController;

  // Repositories
  public readonly analyticsRepository: AnalyticsRepository;
  public readonly domainRepository: DomainRepository;

  // Services
  public readonly authService: AuthService;

  // Card Use Cases
  public readonly createCardUseCase: CreateCardUseCase;
  public readonly getUserCardsUseCase: GetUserCardsUseCase;
  public readonly getCardByIdUseCase: GetCardByIdUseCase;
  public readonly updateCardUseCase: UpdateCardUseCase;
  public readonly deleteCardUseCase: DeleteCardUseCase;
  public readonly toggleCardVisibilityUseCase: ToggleCardVisibilityUseCase;
  public readonly getDashboardStatsUseCase: GetDashboardStatsUseCase;

  // Auth Use Cases
  public readonly googleAuthUseCase: GoogleAuthUseCase;
  public readonly refreshTokenUseCase: RefreshTokenUseCase;
  public readonly getCurrentUserUseCase: GetCurrentUser;
  public readonly updateUserProfileUseCase: UpdateUserProfile;

  // Domain Use Cases
  public readonly getAllDomainsUseCase: GetAllDomains;
  public readonly getDomainByKeyUseCase: GetDomainByKey;
  public readonly createDomainUseCase: CreateDomain;
  public readonly updateDomainUseCase: UpdateDomain;
  public readonly deleteDomainUseCase: DeleteDomain;
  public readonly addSubcategoryUseCase: AddSubcategory;
  public readonly updateSubcategoryUseCase: UpdateSubcategory;
  public readonly deleteSubcategoryUseCase: DeleteSubcategory;

  // Controllers
  public readonly cardController: CardController;
  public readonly analyticsController: AnalyticsController;
  public readonly authController: AuthController;
  public readonly userController: UserController;
  public readonly domainController: DomainController;
  public readonly businessController: BusinessController;

  // Config
  private readonly googleClientId: string;

  //admin
  public readonly adminService: AdminService;
  public readonly adminController: AdminController;

  // Business Use Cases
  public readonly searchBusinessesUseCase: SearchBusinesses;
  public readonly getFeaturedBusinessesUseCase: GetFeaturedBusinessesUseCase;
  public readonly getBusinessByIdUseCase: GetBusinessById;
  public readonly recordViewUseCase: RecordView;
  public readonly recordScanUseCase: RecordScan;
  public readonly recordContactClickUseCase: RecordContactClick;

  // Verification Use Cases
  public readonly submitDomainVerificationUseCase: SubmitDomainVerification;
  public readonly getPendingVerificationsUseCase: GetPendingVerifications;
  public readonly getAllVerificationsUseCase: GetAllVerifications;
  public readonly approveUserVerificationUseCase: ApproveUserVerification;
  public readonly rejectUserVerificationUseCase: RejectUserVerification;

  // Controllers
  public readonly verificationController: VerificationController;

  // User Use Cases
  public readonly getUserProfileUseCase: GetUserProfile;
  public readonly toggleUserStatusUseCase: ToggleUserStatus;
  public readonly changeUserRoleUseCase: ChangeUserRole;
  public readonly updateLastLoginUseCase: UpdateLastLogin;

  private cardRepository: CardRepository;
  private userRepository: UserRepository;

  // Messaging
  public readonly messagingRepository: MessagingRepository;
  public readonly messagingController: MessagingController;

  // Favorite Repository
  public readonly favoriteRepository: FavoriteRepository;

  // Favorite Use Cases
  public readonly addToFavoritesUseCase: AddToFavoritesUseCase;
  public readonly removeFromFavoritesUseCase: RemoveFromFavoritesUseCase;
  public readonly getUserFavoritesUseCase: GetUserFavoritesUseCase;
  public readonly getFavoriteBusinessesUseCase: GetFavoriteBusinessesUseCase;
  public readonly checkIsFavoritedUseCase: CheckIsFavoritedUseCase;

  // Favorite Controller
  public readonly favoriteController: FavoriteController;

  private constructor() {
    // Initialize Repositories
    this.cardRepository = new CardRepository();
    this.analyticsRepository = new AnalyticsRepository();
    this.userRepository = new UserRepository();
    this.domainRepository = new DomainRepository();

    // Initialize Config
    this.googleClientId = env.GOOGLE_CLIENT_ID ?? "";

    // Initialize Services
    const jwtSecret = env.JWT_SECRET ?? "";
    const jwtExpiresIn = env.JWT_EXPIRES_IN ? parseInt(env.JWT_EXPIRES_IN) : 0;

    this.authService = new AuthService(jwtSecret, jwtExpiresIn);

    // Initialize Card Use Cases
    this.createCardUseCase = new CreateCardUseCase(this.cardRepository);
    this.getUserCardsUseCase = new GetUserCardsUseCase(this.cardRepository);
    this.getCardByIdUseCase = new GetCardByIdUseCase(this.cardRepository);
    this.updateCardUseCase = new UpdateCardUseCase(this.cardRepository);
    this.deleteCardUseCase = new DeleteCardUseCase(this.cardRepository);
    this.toggleCardVisibilityUseCase = new ToggleCardVisibilityUseCase(
      this.cardRepository
    );

    this.getDashboardStatsUseCase = new GetDashboardStatsUseCase(
      this.analyticsRepository
    );

    this.adminService = new AdminService();
    this.adminController = new AdminController(this.adminService);

    // Initialize Auth Use Cases
    this.googleAuthUseCase = new GoogleAuthUseCase(
      this.userRepository,
      this.authService,
      this.googleClientId
    );
    this.refreshTokenUseCase = new RefreshTokenUseCase(
      this.userRepository,
      this.authService
    );
    this.getCurrentUserUseCase = new GetCurrentUser(this.userRepository);
    this.updateUserProfileUseCase = new UpdateUserProfile(this.userRepository);

    // Initialize Domain Use Cases
    this.getAllDomainsUseCase = new GetAllDomains(this.domainRepository);
    this.getDomainByKeyUseCase = new GetDomainByKey(this.domainRepository);
    this.createDomainUseCase = new CreateDomain(this.domainRepository);
    this.updateDomainUseCase = new UpdateDomain(this.domainRepository);
    this.deleteDomainUseCase = new DeleteDomain(this.domainRepository);
    this.addSubcategoryUseCase = new AddSubcategory(this.domainRepository);
    this.updateSubcategoryUseCase = new UpdateSubcategory(
      this.domainRepository
    );
    this.deleteSubcategoryUseCase = new DeleteSubcategory(
      this.domainRepository
    );

    // Initialize Controllers
    this.cardController = new CardController(
      this.createCardUseCase,
      this.getUserCardsUseCase,
      this.getCardByIdUseCase,
      this.updateCardUseCase,
      this.deleteCardUseCase,
      this.toggleCardVisibilityUseCase
    );

    this.analyticsController = new AnalyticsController(
      this.getDashboardStatsUseCase,
      this.analyticsRepository
    );

    this.authController = new AuthController(
      this.getCurrentUserUseCase,
      this.updateUserProfileUseCase,
      this.googleAuthUseCase,
      this.refreshTokenUseCase
    );

    // Initialize User Use Cases
    this.getCurrentUserUseCase = new GetCurrentUser(this.userRepository);
    this.updateUserProfileUseCase = new UpdateUserProfile(this.userRepository);
    this.getUserProfileUseCase = new GetUserProfile(this.userRepository);
    this.toggleUserStatusUseCase = new ToggleUserStatus(this.userRepository);
    this.changeUserRoleUseCase = new ChangeUserRole(this.userRepository);
    this.updateLastLoginUseCase = new UpdateLastLogin(this.userRepository);

    // ... other use cases initialization ...

    // Initialize User Controller
    this.userController = new UserController(
      this.getCurrentUserUseCase,
      this.updateUserProfileUseCase,
      this.getUserProfileUseCase,
      this.toggleUserStatusUseCase,
      this.changeUserRoleUseCase
    );

    this.domainController = new DomainController(
      this.getAllDomainsUseCase,
      this.getDomainByKeyUseCase,
      this.createDomainUseCase,
      this.updateDomainUseCase,
      this.deleteDomainUseCase,
      this.addSubcategoryUseCase,
      this.updateSubcategoryUseCase,
      this.deleteSubcategoryUseCase
    );

    // Initialize Business Use Cases (add after existing use case initialization)
    this.searchBusinessesUseCase = new SearchBusinesses(this.cardRepository);
    this.getFeaturedBusinessesUseCase = new GetFeaturedBusinessesUseCase(
      this.cardRepository
    );
    this.getBusinessByIdUseCase = new GetBusinessById(this.cardRepository);

    this.recordViewUseCase = new RecordView(this.cardRepository);
    this.recordScanUseCase = new RecordScan(this.cardRepository);
    this.recordContactClickUseCase = new RecordContactClick(
      this.cardRepository
    );

    // Initialize Business Controller (add after existing controller initialization)

    this.businessController = new BusinessController(
      this.searchBusinessesUseCase,
      this.getFeaturedBusinessesUseCase,
      this.getBusinessByIdUseCase,
      this.recordViewUseCase,
      this.recordScanUseCase,
      this.recordContactClickUseCase
    );

    // Initialize Verification Use Cases
    this.submitDomainVerificationUseCase = new SubmitDomainVerification(
      this.userRepository
    );
    this.getPendingVerificationsUseCase = new GetPendingVerifications(
      this.userRepository
    );
    this.getAllVerificationsUseCase = new GetAllVerifications(
      this.userRepository
    );
    this.approveUserVerificationUseCase = new ApproveUserVerification(
      this.userRepository
    );
    this.rejectUserVerificationUseCase = new RejectUserVerification(
      this.userRepository
    );
    // Initialize Verification Controller
    this.verificationController = new VerificationController(
      this.submitDomainVerificationUseCase,
      this.getPendingVerificationsUseCase,
      this.getAllVerificationsUseCase,
      this.approveUserVerificationUseCase,
      this.rejectUserVerificationUseCase
    );

    this.messagingRepository = new MessagingRepository(
      this.userRepository,
      this.cardRepository
    );

    this.messagingController = new MessagingController(
      this.messagingRepository
    );

    // Initialize Favorite Repository
    this.favoriteRepository = new FavoriteRepository();

    // Initialize Favorite Use Cases
    this.addToFavoritesUseCase = new AddToFavoritesUseCase(
      this.favoriteRepository,
      this.cardRepository
    );

    this.removeFromFavoritesUseCase = new RemoveFromFavoritesUseCase(
      this.favoriteRepository
    );

    this.getUserFavoritesUseCase = new GetUserFavoritesUseCase(
      this.favoriteRepository
    );

    this.getFavoriteBusinessesUseCase = new GetFavoriteBusinessesUseCase(
      this.favoriteRepository
    );

    this.checkIsFavoritedUseCase = new CheckIsFavoritedUseCase(
      this.favoriteRepository
    );

    // Initialize Favorite Controller
    this.favoriteController = new FavoriteController(
      this.addToFavoritesUseCase,
      this.removeFromFavoritesUseCase,
      this.getUserFavoritesUseCase,
      this.getFavoriteBusinessesUseCase,
      this.checkIsFavoritedUseCase
    );

    // Initialize Review Repository
    this.reviewRepository = new ReviewRepository();

    // Initialize Review Use Cases
    this.createReviewUseCase = new CreateReviewUseCase(
      this.reviewRepository,
      this.cardRepository
    );

    this.getBusinessReviewsUseCase = new GetBusinessReviewsUseCase(
      this.reviewRepository
    );

    this.getUserReviewsUseCase = new GetUserReviewsUseCase(
      this.reviewRepository
    );

    this.updateReviewUseCase = new UpdateReviewUseCase(this.reviewRepository);

    this.deleteReviewUseCase = new DeleteReviewUseCase(this.reviewRepository);

    this.markReviewHelpfulUseCase = new MarkReviewHelpfulUseCase(
      this.reviewRepository
    );

    this.getAllReviewsUseCase = new GetAllReviewsUseCase(this.reviewRepository);

    // Initialize Review Controller
    this.reviewController = new ReviewController(
      this.createReviewUseCase,
      this.getBusinessReviewsUseCase,
      this.getUserReviewsUseCase,
      this.updateReviewUseCase,
      this.deleteReviewUseCase,
      this.markReviewHelpfulUseCase,
      this.userRepository,
      this.getAllReviewsUseCase
    );

    // Initialize reports Repository
    this.reportRepository = new ReportRepository();

    // Initialize reports Use Cases
    this.submitReportUseCase = new SubmitReportUseCase(
      this.reportRepository,
      this.cardRepository
    );

    this.getUserReportsUseCase = new GetUserReportsUseCase(
      this.reportRepository
    );

    this.getReportByIdUseCase = new GetReportByIdUseCase(this.reportRepository);

    this.updateReportStatusUseCase = new UpdateReportStatusUseCase(
      this.reportRepository
    );

    this.deleteReportUseCase = new DeleteReportUseCase(this.reportRepository);

    this.getAllReportsUseCase = new GetAllReportsUseCase(this.reportRepository);

    this.reportController = new ReportController(
      this.submitReportUseCase,
      this.getUserReportsUseCase,
      this.getReportByIdUseCase,
      this.deleteReportUseCase,
      this.getAllReportsUseCase,
      this.updateReportStatusUseCase
    );

    // Initialize Feedback Repository
    this.feedbackRepository = new FeedbackRepository();

    // Initialize Feedback Use Cases
    this.submitFeedbackUseCase = new SubmitFeedbackUseCase(
      this.feedbackRepository,
      this.cardRepository
    );

    this.getUserFeedbackUseCase = new GetUserFeedbackUseCase(
      this.feedbackRepository
    );

    this.getFeedbackByIdUseCase = new GetFeedbackByIdUseCase(
      this.feedbackRepository
    );

    this.deleteFeedbackUseCase = new DeleteFeedbackUseCase(
      this.feedbackRepository
    );

    this.getAllFeedbackUseCase = new GetAllFeedbackUseCase(
      this.feedbackRepository
    );

    this.updateFeedbackStatusUseCase = new UpdateFeedbackStatusUseCase(
      this.feedbackRepository
    );

    // Initialize Feedback Controller
    this.feedbackController = new FeedbackController(
      this.submitFeedbackUseCase,
      this.getUserFeedbackUseCase,
      this.getFeedbackByIdUseCase,
      this.deleteFeedbackUseCase,
      this.getAllFeedbackUseCase,
      this.updateFeedbackStatusUseCase
    );

    this.packageRepository = new PackageRepository();

    // Initialize Package Use Cases
    this.getAvailablePackagesUseCase = new GetAvailablePackages(
      this.packageRepository
    );
    this.subscribeToPackageUseCase = new SubscribeToPackage(
      this.packageRepository
    );
    this.getCurrentSubscriptionUseCase = new GetCurrentSubscription(
      this.packageRepository
    );
    this.getPackageUsageUseCase = new GetPackageUsage(this.packageRepository);
    this.cancelSubscriptionUseCase = new CancelSubscription(
      this.packageRepository
    );
    this.boostCardUseCase = new BoostCardUseCase(this.packageRepository);
    this.getActiveBoostsUseCase = new GetActiveBoosts(this.packageRepository);

    // Initialize Admin Package Use Cases
    this.createPackageUseCase = new CreatePackage(this.packageRepository);
    this.updatePackageUseCase = new UpdatePackage(this.packageRepository);
    this.deletePackageUseCase = new DeletePackage(this.packageRepository);
    this.getAllPackagesAdminUseCase = new GetAllPackagesAdmin(
      this.packageRepository
    );
    this.schedulePackageUseCase = new SchedulePackage(this.packageRepository);
    this.getAllSubscriptionsAdminUseCase = new GetAllSubscriptionsAdmin(
      this.packageRepository
    );
    this.getRevenueReportUseCase = new GetRevenueReport(this.packageRepository);
    this.getPlanUsageStatsUseCase = new GetPlanUsageStats(
      this.packageRepository
    );
    this.getPackageSubscribersUseCase = new GetPackageSubscribers(
      this.packageRepository
    );

    // Initialize Package Controllers
    this.packageController = new PackageController(
      this.getAvailablePackagesUseCase,
      this.subscribeToPackageUseCase,
      this.getCurrentSubscriptionUseCase,
      this.getPackageUsageUseCase,
      this.cancelSubscriptionUseCase,
      this.boostCardUseCase,
      this.getActiveBoostsUseCase
    );

    this.adminPackageController = new AdminPackageController(
      this.createPackageUseCase,
      this.updatePackageUseCase,
      this.deletePackageUseCase,
      this.getAllPackagesAdminUseCase,
      this.schedulePackageUseCase,
      this.getAllSubscriptionsAdminUseCase,
      this.getRevenueReportUseCase,
      this.getPlanUsageStatsUseCase,
      this.getPackageSubscribersUseCase
    );
  }

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }
}
