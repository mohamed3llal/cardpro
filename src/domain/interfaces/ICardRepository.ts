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
  subdomain_key?: string;
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
  update(id: string, card: Card): Promise<Card | null>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
  isOwner(cardId: string | undefined, userId: string): Promise<boolean>;
  incrementViews(id: string): Promise<void>;
  incrementScans(id: string): Promise<void>;

  findActiveVerifiedUserCards(
    query: any,
    options?: FindOptions
  ): Promise<Card[]>;
  findOne(query: any): Promise<Card | null>;
  find(query: any, verified?: boolean, options?: FindOptions): Promise<Card[]>;

  // Search & Filter
  search(query: any, skip: number, limit: number): Promise<Card[]>;
  count(query: any): Promise<number>;
  distinct(field: string, query?: any): Promise<any[]>;

  // User-specific
  findByUserId(
    userId: string,
    options?: FindOptions,
    filters?: any
  ): Promise<Card[]>;
  findByUserIdPaginated(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ cards: Card[]; total: number }>;

  // Analytics
  incrementViews(cardId: string): Promise<void>;
  incrementScans(cardId: string): Promise<void>;
  incrementContactClicks(cardId: string): Promise<void>;

  // Aggregation
  getPopularCards(limit: number): Promise<Card[]>;
  getRecentCards(limit: number): Promise<Card[]>;
  getCardsByDomain(domain: string, limit?: number): Promise<Card[]>;

  // Geospatial
  findNearby(
    latitude: number,
    longitude: number,
    radius: number,
    limit?: number
  ): Promise<Card[]>;

  // Add this method for aggregation support
  aggregate(pipeline: any[]): Promise<any[]>;
}

export interface FindOptions {
  sort?: Record<string, 1 | -1>;
  limit?: number;
  skip?: number;
  select?: string[];
}
