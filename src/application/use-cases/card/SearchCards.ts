import {
  ISearchRepository,
  SearchFilters,
} from "@domain/interfaces/ISearchRepository";
import { Card } from "@domain/entities/Card";
import { AppError } from "@shared/errors/AppError";

export class SearchCardsUseCase {
  constructor(private searchRepository: ISearchRepository) {}

  async execute(filters: SearchFilters): Promise<Card[]> {
    try {
      // Business logic: validate filters
      if (
        filters.minRating &&
        (filters.minRating < 0 || filters.minRating > 5)
      ) {
        throw new AppError("Invalid rating filter", 400);
      }

      return await this.searchRepository.searchCards(filters);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to search cards", 500);
    }
  }
}
