import { ICardRepository } from "@domain/interfaces/ICardRepository";
import {
  BusinessSearchParams,
  BusinessSearchResultDTO,
  BusinessListItemDTO,
} from "@application/dtos/BusinessDTO";

export class SearchBusinesses {
  constructor(private cardRepository: ICardRepository) {}

  async execute(
    params: BusinessSearchParams
  ): Promise<BusinessSearchResultDTO> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = this.buildSearchQuery(params);

    // Execute search
    const [businesses, total] = await Promise.all([
      this.cardRepository.search(searchQuery, skip, limit),
      this.cardRepository.count(searchQuery),
    ]);

    // Calculate distance if coordinates provided
    const enrichedBusinesses = await this.enrichBusinesses(
      businesses,
      params.latitude,
      params.longitude
    );

    // Apply sorting
    const sortedBusinesses = this.sortBusinesses(
      enrichedBusinesses,
      params.sort_by || "relevance"
    );

    return {
      businesses: sortedBusinesses,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_businesses: total,
        limit,
        has_next: page * limit < total,
        has_prev: page > 1,
      },
      filters_applied: this.getAppliedFilters(params),
      total_results: total,
    };
  }

  private buildSearchQuery(params: BusinessSearchParams): any {
    const query: any = {};

    // Always show only public cards
    query.is_public = true;

    // Text search
    if (params.query) {
      query.$text = { $search: params.query };
    }

    // Domain filter
    if (params.domain) {
      query.domain_key = params.domain;
    }

    // Subdomain filter
    if (params.subdomain && params.subdomain.length > 0) {
      query.subdomain = { $in: params.subdomain };
    }

    // City filter
    if (params.city) {
      query["location.city"] = new RegExp(params.city, "i");
    }

    // Rating filter
    if (params.rating) {
      query["rating.average"] = { $gte: params.rating };
    }

    // Verified filter
    if (params.verified) {
      query.is_verified = true;
    }

    // Tags filter
    if (params.tags && params.tags.length > 0) {
      query.tags = { $in: params.tags };
    }

    // Photo filter
    if (params.has_photo === "with") {
      query.logo = { $exists: true, $ne: null };
    } else if (params.has_photo === "without") {
      query.$or = [{ logo: { $exists: false } }, { logo: null }];
    }

    // Availability filter (open now)
    if (params.availability === "open_now") {
      const now = new Date();
      const day = now.toLocaleDateString("en-US", { weekday: "short" });
      const time = now.toTimeString().slice(0, 5);
      query[`hours.${day}.open`] = { $lte: time };
      query[`hours.${day}.close`] = { $gte: time };
    }

    return query;
  }

  private async enrichBusinesses(
    businesses: any[],
    latitude?: number,
    longitude?: number
  ): Promise<BusinessListItemDTO[]> {
    return businesses.map((business) => {
      const dto: BusinessListItemDTO = {
        id: business._id,
        name: business.title,
        slug: business.slug || this.generateSlug(business.title),
        domain_key: business.domain_key,
        subdomain: business.subdomain,
        description: business.description,
        logo: business.logo,
        cover_image: business.cover_image,
        contact: {
          phone: business.phone,
          whatsapp: business.whatsapp,
          email: business.email,
          website: business.website,
        },
        location: {
          address: business.location?.address || "",
          city: business.location?.city || "",
          coordinates: {
            lat: business.location?.coordinates?.lat || 0,
            lng: business.location?.coordinates?.lng || 0,
          },
          distance:
            latitude && longitude
              ? this.calculateDistance(
                  latitude,
                  longitude,
                  business.location?.coordinates?.lat || 0,
                  business.location?.coordinates?.lng || 0
                )
              : undefined,
        },
        rating: {
          average: business.rating?.average || 0,
          count: business.rating?.count || 0,
        },
        stats: {
          views: business.views || 0,
          views_this_month: business.views_this_month || 0,
        },
        tags: business.tags || [],
        features: business.features || [],
        payment_methods: business.payment_methods || [],
        hours: business.hours,
        status: business.status || "open",
        is_verified: business.is_verified || false,
        is_public: business.is_public !== false,
        owner_id: business.user_id,
        created_at:
          business.created_at?.toISOString() || new Date().toISOString(),
        updated_at:
          business.updated_at?.toISOString() || new Date().toISOString(),
      };

      return dto;
    });
  }

  private sortBusinesses(
    businesses: BusinessListItemDTO[],
    sortBy: string
  ): BusinessListItemDTO[] {
    switch (sortBy) {
      case "rating":
        return businesses.sort((a, b) => b.rating.average - a.rating.average);

      case "popular":
        return businesses.sort(
          (a, b) =>
            b.stats.views +
            b.rating.count * 10 -
            (a.stats.views + a.rating.count * 10)
        );

      case "nearest":
        return businesses.sort(
          (a, b) =>
            (a.location.distance || Infinity) -
            (b.location.distance || Infinity)
        );

      case "newest":
        return businesses.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

      case "relevance":
      default:
        return businesses; // MongoDB text search already sorts by relevance
    }
  }

  private getAppliedFilters(params: BusinessSearchParams): Record<string, any> {
    const filters: Record<string, any> = {};

    if (params.domain) filters.domain = params.domain;
    if (params.subdomain) filters.subdomain = params.subdomain;
    if (params.city) filters.city = params.city;
    if (params.radius) filters.radius = params.radius;
    if (params.rating) filters.rating = params.rating;
    if (params.verified) filters.verified = params.verified;
    if (params.tags) filters.tags = params.tags;

    return filters;
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
}
