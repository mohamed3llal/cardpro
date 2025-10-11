import { ICardRepository } from "@domain/interfaces/ICardRepository";
import {
  FeaturedBusinessesResultDTO,
  FeaturedBusinessDTO,
  CategoryBusinessesDTO,
} from "@application/dtos/BusinessDTO";

export class GetFeaturedBusinesses {
  constructor(private cardRepository: ICardRepository) {}

  async execute(): Promise<FeaturedBusinessesResultDTO> {
    // Get top 6 featured businesses (highest rated + most viewed)
    const featured = await this.cardRepository.find(
      {
        is_public: true,
        is_verified: true,
      },
      { sort: { "rating.average": -1, views: -1 }, limit: 6 }
    );

    // Get top businesses by category (top 3 per category)
    const categories = await this.getTopByCategory();

    return {
      featured: featured.map(this.mapToFeaturedDTO),
      categories,
    };
  }

  private async getTopByCategory(): Promise<CategoryBusinessesDTO[]> {
    // Get unique domains
    const domains = await this.cardRepository.distinct("domain_key", {
      is_public: true,
    });

    const categories: CategoryBusinessesDTO[] = [];

    for (const domain of domains) {
      const businesses = await this.cardRepository.find(
        {
          domain_key: domain,
          is_public: true,
        },
        { sort: { "rating.average": -1, views: -1 }, limit: 3 }
      );

      const count = await this.cardRepository.count({
        domain_key: domain,
        is_public: true,
      });

      categories.push({
        domain_key: domain,
        count,
        businesses: businesses.map(this.mapToFeaturedDTO),
      });
    }

    return categories;
  }

  private mapToFeaturedDTO(business: any): FeaturedBusinessDTO {
    return {
      id: business._id,
      name: business.title,
      logo: business.logo || business.avatar || null,
      rating: {
        average: business.rating?.average || 0,
        count: business.rating?.count || 0,
      },
      domain_key: business.domain_key,
      is_verified: business.is_verified || false,
    };
  }
}
