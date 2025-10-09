import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authMiddleware } from "@infrastructure/middleware/authMiddleware";
import { validate } from "@infrastructure/middleware/validator";
import {
  googleAuthSchema,
  refreshTokenSchema,
} from "../validators/authValidator";
import { IAuthService } from "@domain/interfaces/IAuthServices";
import rateLimit from "express-rate-limit";

// Rate limiter for auth endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window for auth endpoints
  message: "Too many authentication attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

export const createAuthRoutes = (
  authController: AuthController,
  authService: IAuthService
): Router => {
  const router = Router();
  const auth = authMiddleware(authService);

  // Google OAuth authentication
  router.post(
    "/google",
    authRateLimit,
    validate(googleAuthSchema),
    authController.googleAuth
  );

  // Refresh JWT token
  router.post(
    "/refresh",
    validate(refreshTokenSchema),
    authController.refreshToken
  );

  router.post("/logout", auth, authController.logout);

  return router;
};
