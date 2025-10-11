import { ICardRepository } from "@domain/interfaces/ICardRepository";
import { SimilarBusinessDTO } from "@application/dtos/BusinessDTO";

export class GetSimilarBusinesses {
  constructor(private cardRepository: ICardRepository) {}

  async execute(
    businessId: string,
    limit: number = 5
  ): Promise<SimilarBusinessDTO[]> {
    // Get the business
    const business: any = await this.cardRepository.findById(businessId);

    if (!business) {
      return [];
    }

    // Find similar businesses
    const query: any = {
      _id: { $ne: business._id },
      is_public: true,
    };

    // Same category or subcategory
    if (business.subdomain) {
      query.subdomain = business.subdomain;
    } else {
      query.domain_key = business.domain_key;
    }

    // Within 10km radius if location available
    if (business.location?.coordinates) {
      query["location.coordinates"] = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [
              business.location.coordinates.lng,
              business.location.coordinates.lat,
            ],
          },
          $maxDistance: 10000, // 10km in meters
        },
      };
    }

    const similarBusinesses = await this.cardRepository.find(query, {
      sort: { "rating.average": -1, views: -1 },
      limit,
    });

    return similarBusinesses.map((b) =>
      this.mapToSimilarDTO(b, business.location?.coordinates)
    );
  }

  private mapToSimilarDTO(
    business: any,
    originCoords?: any
  ): SimilarBusinessDTO {
    let distance: number | undefined;

    if (originCoords && business.location?.coordinates) {
      distance = this.calculateDistance(
        originCoords.lat,
        originCoords.lng,
        business.location.coordinates.lat,
        business.location.coordinates.lng
      );
    }

    return {
      id: business._id,
      name: business.title,
      logo: business.logo,
      rating: {
        average: business.rating?.average || 0,
        count: business.rating?.count || 0,
      },
      location: {
        city: business.location?.city || "",
        distance,
      },
      domain_key: business.domain_key,
    };
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371;
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
}
