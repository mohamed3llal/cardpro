import express, { Application, Request, Response } from "express";
import http from "http";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { env } from "./config/env";
import { logger } from "./config/logger";
import { DIContainer } from "./config/i-container";
import { createRoutes } from "./presentation/routes";
import { errorHandler } from "./infrastructure/middleware/errorHandler";
import { connectMongoDB, getConnectionStatus } from "./config/database";

class Server {
  private app: Application;
  private port: number;
  private diContainer: DIContainer;

  // Initialize Supabase
  constructor() {
    this.app = express();
    this.port = Number(env.PORT || 3000);
    this.diContainer = DIContainer.getInstance();

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.set("trust proxy", 1);

    this.app.use(
      morgan("dev", {
        stream: {
          write: (message: string) => logger.info(message.trim()),
        },
      })
    );

    this.app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
      })
    );

    this.app.use(
      cors({
        origin: "*",
        credentials: true,
      })
    );

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 1000,
      standardHeaders: true,
      legacyHeaders: false,
    });

    this.app.use("/api/", limiter);

    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get("/health", (_req, res) => {
      const db = getConnectionStatus();
      res.status(db?.isConnected ? 200 : 503).json({
        status: db?.isConnected ? "OK" : "DEGRADED",
        dbStatus: db,
        timestamp: new Date().toISOString(),
      });
    });

    // Main API routes
    const routes = createRoutes(
      this.diContainer.cardController,
      this.diContainer.analyticsController,
      this.diContainer.authController,
      this.diContainer.userController,
      this.diContainer.authService,
      this.diContainer.domainController,
      this.diContainer.adminController,
      this.diContainer.businessController,
      this.diContainer.verificationController,
      this.diContainer.messagingController,
      this.diContainer.favoriteController,
      this.diContainer.reviewController,
      this.diContainer.reportController,
      this.diContainer.feedbackController,
      this.diContainer.packageController,
      this.diContainer.adminPackageController
    );

    this.app.use("/api/v1", routes);

    // Not found
    this.app.use("*", (req: Request, res: Response) => {
      res.status(404).json({
        error: "Not Found",
        message: `Route ${req.originalUrl} does not exist.`,
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      logger.info("Connecting to MongoDB...");
      await connectMongoDB();

      const server = http.createServer(this.app);
      server.listen(this.port, () => {
        logger.info(`✅ Server running on port ${this.port}`);
        logger.info(`🌍 API: http://localhost:${this.port}/api/v1`);
        logger.info(`🔐 Admin API: http://localhost:${this.port}/api/v1/admin`);
      });
    } catch (error) {
      logger.error("❌ Failed to start server:", error);
      process.exit(1);
    }
  }
}

// Run server
const server = new Server();
server.start();

export default Server;
