import { Card } from "@domain/entities/Card";
import { ICardRepository } from "@domain/interfaces/ICardRepository";
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
  constructor(private readonly cardRepository: ICardRepository) {}

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

      // ✅ Execute query and get accurate count
      const [businesses, total] = await Promise.all([
        this.cardRepository.findActiveVerifiedUserCards(query, options),
        this.cardRepository.countActiveVerifiedUserCards(query, options),
      ]);

      return {
        businesses,
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

    // ✅ Ensure location exists for geo queries
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

    // ✅ Rating filter
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
        // Handled by $near in query
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

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
