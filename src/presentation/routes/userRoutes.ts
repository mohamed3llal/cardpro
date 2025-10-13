import { Router } from "express";
import { authMiddleware } from "@infrastructure/middleware/authMiddleware";
import { validate } from "@infrastructure/middleware/validator";
import { updateProfileSchema } from "../validators/authValidator";
import { IAuthService } from "@domain/interfaces/IAuthServices";
import { UserController } from "@presentation/controllers/UserController";
import { VerificationController } from "../controllers/VerificationController";

export const createUserRoutes = (
  userController: UserController,
  verificationController: VerificationController,
  authService: IAuthService
): Router => {
  const router = Router();
  const auth = authMiddleware(authService);

  // Protected routes
  router.get("/me", auth, userController.getCurrentUser);

  router.put(
    "/profile",
    auth,
    validate(updateProfileSchema),
    userController.updateProfile
  );

  router.post("/domain-verification", auth, (req, res, next) =>
    verificationController.submitDomainVerification(req, res, next)
  );

  return router;
};
