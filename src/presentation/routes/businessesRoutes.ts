import { Router } from "express";
import { CardController } from "../controllers/CardController";
import { authMiddleware } from "@infrastructure/middleware/authMiddleware";
import { IAuthService } from "@domain/interfaces/IAuthServices";

export const createBusinessesRoutes = (
  cardController: CardController,
  authService: IAuthService
): Router => {
  const router = Router();
  const auth = authMiddleware(authService);
  // POST /api/v1/cards - Create a new card
  router.post("/", auth, cardController.createCard);
  // GET /api/v1/cards - Get user's cards with pagination
  router.get("/", auth, cardController.getUserCards);
  // GET /api/v1/cards/:cardId - Get a specific card
  router.get("/:cardId", auth, cardController.getCardById);
  // PUT /api/v1/cards/:cardId - Update a card
  router.put("/:cardId", auth, cardController.updateCard);
  // DELETE /api/v1/cards/:cardId - Delete a card
  router.delete("/:cardId", auth, cardController.deleteCard);
  // PATCH /api/v1/cards/:cardId/visibility - Toggle card visibility
  router.patch("/:cardId/visibility", auth, cardController.toggleVisibility);

  return router;
};
