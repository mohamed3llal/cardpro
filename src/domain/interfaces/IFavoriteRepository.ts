import { Favorite } from "@domain/entities/Favorite";

export interface FavoriteWithBusiness {
  business: any; // Full business card details
  favorited_at: Date;
}

export interface PaginatedFavorites {
  businesses: any[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_favorites: number;
    limit: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface IFavoriteRepository {
  // Create a favorite
  create(favorite: Favorite): Promise<Favorite>;

  // Find all favorites for a user
  findByUserId(userId: string): Promise<Favorite[]>;

  // Find a specific favorite
  findOne(userId: string, businessId: string): Promise<Favorite | null>;

  // Check if a favorite exists
  exists(userId: string, businessId: string): Promise<boolean>;

  // Delete a favorite
  delete(userId: string, businessId: string): Promise<boolean>;

  // Get favorite count for a user
  countByUserId(userId: string): Promise<number>;

  // Get favorites with business details (paginated)
  findFavoritesWithBusinessDetails(
    userId: string,
    page: number,
    limit: number
  ): Promise<PaginatedFavorites>;

  // Check if business is favorited by user
  isFavorited(
    userId: string,
    businessId: string
  ): Promise<{
    is_favorite: boolean;
    created_at?: Date;
  }>;
}
