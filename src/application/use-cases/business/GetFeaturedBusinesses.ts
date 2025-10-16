import { Card } from "@domain/entities/Card";
import { ICardRepository } from "@domain/interfaces/ICardRepository";
import { AppError } from "@shared/errors/AppError";

export interface FeaturedBusinessDTO {
  id: string;
  name: string;
  logo?: string;
  rating: {
    average: number;
    count: number;
  };
  domain_key: string;
  is_verified: boolean;
}

export interface CategoryGroup {
  domain_key: string;
  count: number;
  businesses: FeaturedBusinessDTO[];
}

export interface GetFeaturedBusinessesResponse {
  featured: FeaturedBusinessDTO[];
  categories: CategoryGroup[];
}

export class GetFeaturedBusinessesUseCase {
  constructor(private readonly cardRepository: ICardRepository) {}

  async execute(
    latitude?: number,
    longitude?: number,
    radius: number = 10
  ): Promise<GetFeaturedBusinessesResponse> {
    try {
      // Build query for featured businesses
      const query: any = {
        is_public: true,
      };

      // Add location filter if coordinates provided
      if (latitude && longitude) {
        const radiusInMeters = radius * 1000;
        query["location.coordinates"] = {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            $maxDistance: radiusInMeters,
          },
        };
      }

      // Get featured businesses (sorted by views and rating)
      const featuredCards =
        await this.cardRepository.findActiveVerifiedUserCards(query, {
          sort: { views: -1, "rating.average": -1 },
          limit: 10,
        });

      // Get businesses grouped by category
      const categoriesData = await this.getBusinessesByCategory(
        query,
        latitude,
        longitude
      );

      return {
        featured: this.mapToFeaturedDTO(featuredCards),
        categories: categoriesData,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to get featured businesses", 500);
    }
  }

  private async getBusinessesByCategory(
    baseQuery: any,
    latitude?: number,
    longitude?: number
  ): Promise<CategoryGroup[]> {
    // Get all domain keys
    const domains = await this.cardRepository.distinct("domain_key", baseQuery);

    const categories: CategoryGroup[] = [];

    for (const domain of domains) {
      const domainQuery = { ...baseQuery, domain_key: domain };

      // Get top businesses for this domain
      const businesses = await this.cardRepository.findActiveVerifiedUserCards(
        domainQuery,
        {
          sort: { "rating.average": -1, views: -1 },
          limit: 5,
        }
      );

      if (businesses.length > 0) {
        const count = await this.cardRepository.count(domainQuery);

        categories.push({
          domain_key: domain,
          count,
          businesses: this.mapToFeaturedDTO(businesses),
        });
      }
    }

    return categories;
  }

  private mapToFeaturedDTO(cards: Card[]): FeaturedBusinessDTO[] {
    return cards.map((card: any) => ({
      id: card.props._id || card.id,
      name: card.props.title,
      logo: card.props.logo,
      rating: card.props.rating || { average: 0, count: 0 },
      domain_key: card.props.domain_key,
      is_verified: card.props.user?.domainVerified || false,
    }));
  }
}
