import { Request, Response, NextFunction } from "express";
import { CreateCardUseCase } from "../../application/use-cases/card/CreateCard";
import { GetUserCardsUseCase } from "../../application/use-cases/card/GetUserCards";
import { GetCardByIdUseCase } from "../../application/use-cases/card/GetCardById";
import { UpdateCardUseCase } from "../../application/use-cases/card/UpdateCard";
import { DeleteCardUseCase } from "../../application/use-cases/card/DeleteCard";
import { ToggleCardVisibilityUseCase } from "../../application/use-cases/card/ToggleCardVisibility";
import { AuthRequest } from "@infrastructure/middleware/authMiddleware";
import { ConnectionStates } from "mongoose";

export class CardController {
  constructor(
    private readonly createCardUseCase: CreateCardUseCase,
    private readonly getUserCardsUseCase: GetUserCardsUseCase,
    private readonly getCardByIdUseCase: GetCardByIdUseCase,
    private readonly updateCardUseCase: UpdateCardUseCase,
    private readonly deleteCardUseCase: DeleteCardUseCase,
    private readonly toggleCardVisibilityUseCase: ToggleCardVisibilityUseCase
  ) {}

  createCard = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        });
        return;
      }

      const card = await this.createCardUseCase.execute({
        user_id: userId,
        ...req.body,
      });

      res.status(201).json({
        success: true,
        data: card.toJSON(),
      });
    } catch (error: any) {
      if (
        error.message.includes("required") ||
        error.message.includes("Invalid")
      ) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
          },
        });
        return;
      }
      next(error);
    }
  };

  getUserCards = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        });
        return;
      }

      const {
        page,
        limit,
        sort_by,
        sort_order,
        is_public,
        domain_key,
        subdomain_key,
      } = req.query;

      const result = await this.getUserCardsUseCase.execute({
        user_id: userId,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sort_by: sort_by as string,
        sort_order: sort_order as "asc" | "desc",
        is_public:
          is_public === "true"
            ? true
            : is_public === "false"
            ? false
            : undefined,
        domain_key: domain_key as string,
        subdomain_key: subdomain_key as string,
      });

      res.status(200).json({
        success: true,
        data: {
          cards: result.data.map((card) => card.toJSON()),
          pagination: result.pagination,
        },
      });
    } catch (error: any) {
      next(error);
    }
  };

  getCardById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      const { cardId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        });
        return;
      }

      const card = await this.getCardByIdUseCase.execute(cardId, userId);

      res.status(200).json({
        success: true,
        data: card.toJSON(),
      });
    } catch (error: any) {
      if (error.message === "Card not found") {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Card not found",
          },
        });
        return;
      }

      if (error.message.includes("permission")) {
        res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: error.message,
          },
        });
        return;
      }

      next(error);
    }
  };

  updateCard = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      const { cardId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        });
        return;
      }

      const updatedCard = await this.updateCardUseCase.execute({
        card_id: cardId,
        user_id: userId,
        ...req.body,
      });

      res.status(200).json({
        success: true,
        data: updatedCard.toJSON(),
      });
    } catch (error: any) {
      if (error.message === "Card not found") {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Card not found",
          },
        });
        return;
      }

      if (error.message.includes("permission")) {
        res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: error.message,
          },
        });
        return;
      }

      if (error.message.includes("Invalid")) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
          },
        });
        return;
      }

      next(error);
    }
  };

  deleteCard = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      const { cardId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        });
        return;
      }

      await this.deleteCardUseCase.execute({
        card_id: cardId,
        user_id: userId,
      });

      res.status(200).json({
        success: true,
        message: "Card deleted successfully",
      });
    } catch (error: any) {
      if (error.message === "Card not found") {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Card not found",
          },
        });
        return;
      }

      if (error.message.includes("permission")) {
        res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: error.message,
          },
        });
        return;
      }

      next(error);
    }
  };

  toggleVisibility = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      const { cardId } = req.params;
      const { is_public } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        });
        return;
      }

      if (typeof is_public !== "boolean") {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "is_public must be a boolean value",
          },
        });
        return;
      }

      const updatedCard = await this.toggleCardVisibilityUseCase.execute({
        card_id: cardId,
        user_id: userId,
        is_public,
      });

      res.status(200).json({
        success: true,
        data: updatedCard.toJSON(),
      });
    } catch (error: any) {
      if (error.message === "Card not found") {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Card not found",
          },
        });
        return;
      }

      if (error.message.includes("permission")) {
        res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: error.message,
          },
        });
        return;
      }

      next(error);
    }
  };
}
