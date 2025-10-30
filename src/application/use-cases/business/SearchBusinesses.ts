// src/application/use-cases/business/SearchBusinesses.ts (Updated)
import { Card } from "@domain/entities/Card";
import { ICardRepository } from "@domain/interfaces/ICardRepository";
import { IPackageRepository } from "@domain/interfaces/IPackageRepository";
import { AppError } from "@shared/errors/AppError";

export interface SearchBusinessesFilters {
  q?: string;
  page?: number;
  limit?: number;
  domain?: string;
  subdomain?: string | string[];
  city?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  rating?: number;
  languages?: string[];
  availability?: string;
  verified?: boolean;
  is_public?: boolean;
  tags?: string[];
  has_photo?: string;
  sort_by?: "relevance" | "popular" | "rating" | "nearest" | "newest";
}

export interface SearchBusinessesResponse {
  businesses: Card[];
  boosted: Card[]; // ✅ NEW: Separate boosted results
  pagination: {
    current_page: number;
    total_pages: number;
    total_businesses: number;
    limit: number;
    has_next: boolean;
    has_prev: boolean;
  };
  filters_applied: Record<string, any>;
  total_results: number;
}

export class SearchBusinesses {
  constructor(
    private readonly cardRepository: ICardRepository,
    private readonly packageRepository: IPackageRepository // ✅ NEW: Inject package repository
  ) {}

  async execute(
    filters: SearchBusinessesFilters
  ): Promise<SearchBusinessesResponse> {
    try {
      this.validateFilters(filters);

      const page = filters.page || 1;
      const limit = Math.min(filters.limit || 20, 100);
      const skip = (page - 1) * limit;

      const query = this.buildQuery(filters);
      const sort = this.buildSort(filters);

      const options: any = { sort, skip, limit };

      if (filters.latitude && filters.longitude) {
        options.userLocation = {
          latitude: filters.latitude,
          longitude: filters.longitude,
        };
        options.radiusKm = filters.radius || 10;
      }

      // ✅ NEW: Get active boosted cards matching the search criteria
      const boostedCards = await this.getBoostedCards(query, filters);

      // Execute main query
      const [businesses, total] = await Promise.all([
        this.cardRepository.findActiveVerifiedUserCards(query, options),
        this.cardRepository.countActiveVerifiedUserCards(query, options),
      ]);

      // ✅ NEW: Filter out boosted cards from regular results to avoid duplicates
      const boostedCardIds = new Set(
        boostedCards.map((c: any) => c.id || c._id?.toString())
      );
      const regularBusinesses = businesses.filter(
        (b: any) => !boostedCardIds.has(b.id || b.props?._id?.toString())
      );

      return {
        boosted: boostedCards, // ✅ NEW: Boosted cards appear first
        businesses: regularBusinesses,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_businesses: total,
          limit,
          has_next: page < Math.ceil(total / limit),
          has_prev: page > 1,
        },
        filters_applied: this.getAppliedFilters(filters),
        total_results: total,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to search businesses", 500);
    }
  }

  // ✅ NEW: Get boosted cards matching search criteria
  private async getBoostedCards(
    baseQuery: any,
    filters: SearchBusinessesFilters
  ): Promise<Card[]> {
    try {
      // Get active boosts
      const activeBoosts = await this.packageRepository.getAllActiveBoosts();

      if (!activeBoosts || activeBoosts.length === 0) {
        return [];
      }

      // Extract card IDs from active boosts
      const boostedCardIds = activeBoosts.map((boost) => boost.cardId);

      // Build query for boosted cards (apply same filters as main search)
      const boostedQuery = {
        ...baseQuery,
        _id: { $in: boostedCardIds },
      };

      // Get boosted cards with same filters
      const options: any = {
        sort: {
          views: -1, // Sort boosted by popularity
          "rating.average": -1,
        },
        limit: 5, // Show max 5 boosted cards
      };

      if (filters.latitude && filters.longitude) {
        options.userLocation = {
          latitude: filters.latitude,
          longitude: filters.longitude,
        };
        options.radiusKm = filters.radius || 10;
      }

      const boostedCards =
        await this.cardRepository.findActiveVerifiedUserCards(
          boostedQuery,
          options
        );

      return boostedCards;
    } catch (error) {
      console.error("Error fetching boosted cards:", error);
      return []; // Don't fail the whole search if boost fetch fails
    }
  }

  private validateFilters(filters: SearchBusinessesFilters): void {
    if (filters.page && filters.page < 1) {
      throw new AppError("Page must be greater than 0", 400);
    }

    if (filters.limit && (filters.limit < 1 || filters.limit > 100)) {
      throw new AppError("Limit must be between 1 and 100", 400);
    }

    if (filters.rating && (filters.rating < 1 || filters.rating > 5)) {
      throw new AppError("Rating must be between 1 and 5", 400);
    }

    if (filters.radius && filters.radius < 0) {
      throw new AppError("Radius must be positive", 400);
    }

    if (
      (filters.latitude && !filters.longitude) ||
      (!filters.latitude && filters.longitude)
    ) {
      throw new AppError("Both latitude and longitude must be provided", 400);
    }
  }

  private buildQuery(filters: SearchBusinessesFilters): any {
    const query: any = {
      is_public: filters.is_public !== undefined ? filters.is_public : true,
    };

    if (filters.q) {
      query.$text = { $search: filters.q };
    }

    if (filters.domain) {
      query.domain_key = filters.domain;
    }

    if (filters.subdomain) {
      if (Array.isArray(filters.subdomain)) {
        query.subdomain_key = { $in: filters.subdomain };
      } else {
        query.subdomain_key = filters.subdomain;
      }
    }

    if (filters.city) {
      query.address = { $regex: filters.city, $options: "i" };
    }

    if (filters.latitude && filters.longitude) {
      query["location.lat"] = { $exists: true, $ne: null };
      query["location.lng"] = { $exists: true, $ne: null };
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (filters.languages && filters.languages.length > 0) {
      query.languages = { $in: filters.languages };
    }

    if (filters.rating && filters.rating > 0) {
      query["rating.average"] = { $gte: filters.rating };
    }

    return query;
  }

  private buildSort(filters: SearchBusinessesFilters): any {
    const sortBy = filters.sort_by || "relevance";

    switch (sortBy) {
      case "relevance":
        if (filters.q) {
          return { score: { $meta: "textScore" }, views: -1 };
        }
        return { views: -1, created_at: -1 };

      case "popular":
        return { views: -1, "rating.average": -1 };

      case "rating":
        return { "rating.average": -1, "rating.count": -1 };

      case "newest":
        return { created_at: -1 };

      case "nearest":
        return {};

      default:
        return { created_at: -1 };
    }
  }

  private getAppliedFilters(
    filters: SearchBusinessesFilters
  ): Record<string, any> {
    const applied: Record<string, any> = {};

    if (filters.city) applied.city = filters.city;
    if (filters.domain) applied.domain = filters.domain;
    if (filters.subdomain) applied.subdomain = filters.subdomain;
    if (filters.radius) applied.radius = filters.radius;
    if (filters.rating) applied.rating = filters.rating;
    if (filters.verified !== undefined) applied.verified = filters.verified;
    if (filters.tags) applied.tags = filters.tags;
    if (filters.languages) applied.languages = filters.languages;

    return applied;
  }
}
