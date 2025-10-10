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
import { GetCurrentUserUseCase } from "@application/use-cases/auth/GetCurrentUser";
import { UpdateUserProfileUseCase } from "@application/use-cases/auth/UpdateUserProfile";

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

import { env } from "./env";
import dotenv from "dotenv";
dotenv.config();

export class DIContainer {
  private static instance: DIContainer;

  // Repositories
  public readonly cardRepository: CardRepository;
  public readonly analyticsRepository: AnalyticsRepository;
  public readonly userRepository: UserRepository;
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
  public readonly getCurrentUserUseCase: GetCurrentUserUseCase;
  public readonly updateUserProfileUseCase: UpdateUserProfileUseCase;

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

  // Config
  private readonly googleClientId: string;

  //admin
  public readonly adminService: AdminService;
  public readonly adminController: AdminController;

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
    this.getCurrentUserUseCase = new GetCurrentUserUseCase(this.userRepository);
    this.updateUserProfileUseCase = new UpdateUserProfileUseCase(
      this.userRepository
    );

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

    this.userController = new UserController(
      this.getCurrentUserUseCase,
      this.updateUserProfileUseCase
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
  }

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }
}
