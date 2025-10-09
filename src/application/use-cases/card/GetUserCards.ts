// src/application/use-cases/card/GetUserCards.ts

import { Card } from "../../../domain/entities/Card";
import {
  ICardRepository,
  PaginationOptions,
  CardFilters,
  PaginatedResult,
} from "../../../domain/interfaces/ICardRepository";

export interface GetUserCardsDTO {
  user_id: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  is_public?: boolean;
  domain_key?: string;
  subdomain_key?: string[];
}

export class GetUserCardsUseCase {
  constructor(private readonly cardRepository: ICardRepository) {}

  async execute(dto: GetUserCardsDTO): Promise<PaginatedResult<Card>> {
    const options: PaginationOptions = {
      page: dto.page || 1,
      limit: Math.min(dto.limit || 20, 100), // Max 100 items per page
      sort_by: dto.sort_by || "created_at",
      sort_order: dto.sort_order || "desc",
    };

    const filters: CardFilters = {
      is_public: dto.is_public,
      domain_key: dto.domain_key,
      subdomain_key: dto.subdomain_key,
    };

    try {
      const result = await this.cardRepository.findByUserId(
        dto.user_id,
        options,
        filters
      );

      return result;
    } catch (error: any) {
      throw new Error(`Failed to retrieve user cards: ${error.message}`);
    }
  }
}
