import { Card } from "@domain/entities/Card";
import {
  ICardRepository,
  PaginationOptions,
  CardFilters,
  PaginatedResult,
} from "@domain/interfaces/ICardRepository";

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

      const total = await this.cardRepository.count(filters);

      return {
        data: result,
        pagination: {
          current_page: options.page,
          total_pages: Math.ceil(total / options.limit),
          total_items: total,
          limit: options.limit,
          has_next: options.page < Math.ceil(total / options.limit),
          has_prev: options.page > 1,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to retrieve user cards: ${error.message}`);
    }
  }
}
