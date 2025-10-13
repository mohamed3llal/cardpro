import { Router } from "express";
import { CardController } from "../controllers/CardController";
import { authMiddleware } from "@infrastructure/middleware/authMiddleware";
import { IAuthService } from "@domain/interfaces/IAuthServices";

export const createCardRoutes = (
  cardController: CardController,
  authService: IAuthService
): Router => {
  const router = Router();
  const auth = authMiddleware(authService);

  router.post("/cards", auth, cardController.createCard);

  router.get("/cards", auth, cardController.getUserCards);

  router.get("/cards/:cardId", auth, cardController.getCardById);

  router.put("/cards/:cardId", auth, cardController.updateCard);

  router.delete("/cards/:cardId", auth, cardController.deleteCard);

  router.patch(
    "/cards/:cardId/visibility",
    auth,
    cardController.toggleVisibility
  );

  return router;
};
