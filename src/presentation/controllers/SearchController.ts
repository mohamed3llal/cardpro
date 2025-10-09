import { Request, Response, NextFunction } from "express";
import { SearchCardsUseCase } from "@application/use-cases/card/SearchCards";

export class SearchController {
  constructor(private searchCardsUseCase: SearchCardsUseCase) {}

  searchCards = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { domain, city, minRating, tags } = req.query;

      const filters = {
        domain: domain as string,
        city: city as string,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        tags: tags ? (tags as string).split(",") : undefined,
      };

      const cards = await this.searchCardsUseCase.execute(filters);
      res.status(200).json({ results: cards });
    } catch (error) {
      next(error);
    }
  };
}
