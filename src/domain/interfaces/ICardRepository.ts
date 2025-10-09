import { Card } from "../entities/Card";

export interface PaginationOptions {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface CardFilters {
  user_id?: string;
  is_public?: boolean;
  domain_key?: string;
  subdomain_key?: string[];
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    limit: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface ICardRepository {
  create(card: Card): Promise<Card>;
  findById(id: string): Promise<Card | null>;
  findByUserId(
    userId: string,
    options?: PaginationOptions,
    filters?: CardFilters
  ): Promise<PaginatedResult<Card>>;
  update(id: string, card: Card): Promise<Card | null>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
  isOwner(cardId: string | undefined, userId: string): Promise<boolean>;
  incrementViews(id: string): Promise<void>;
  incrementScans(id: string): Promise<void>;
}
