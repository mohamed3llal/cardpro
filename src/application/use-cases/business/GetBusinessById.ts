import { Card } from "@domain/entities/Card";
import { ICardRepository } from "@domain/interfaces/ICardRepository";
import { AppError } from "@shared/errors/AppError";

export class GetBusinessById {
  constructor(private readonly cardRepository: ICardRepository) {}

  async execute(businessId: string): Promise<Card> {
    // Validate businessId format
    if (!businessId || businessId.trim() === "") {
      throw new AppError("Business ID is required", 400);
    }

    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(businessId)) {
      throw new AppError("Invalid business ID format", 400);
    }

    // Find the business
    const business = await this.cardRepository.findById(businessId);

    if (!business) {
      throw new AppError("Business not found", 404);
    }

    // Check if business is public
    if (!business.isPublic) {
      throw new AppError("This business is private", 403);
    }

    // Increment views
    await this.cardRepository.incrementViews(businessId);

    return business;
  }
}

// src/application/use-cases/business/GetSimilarBusinesses.ts

export interface SimilarBusinessDTO {
  id: string;
  name: string;
  logo?: string;
  rating: {
    average: number;
    count: number;
  };
  location?: {
    city?: string;
    distance?: number;
  };
  domain_key: string;
}

export class GetSimilarBusinesses {
  constructor(private readonly cardRepository: ICardRepository) {}

  async execute(
    businessId: string,
    limit: number = 5
  ): Promise<SimilarBusinessDTO[]> {
    // Validate limit
    if (limit < 1 || limit > 20) {
      throw new AppError("Limit must be between 1 and 20", 400);
    }

    // Get the reference business
    const business = await this.cardRepository.findById(businessId);

    if (!business) {
      throw new AppError("Business not found", 404);
    }

    // Build query for similar businesses
    const query: any = {
      _id: { $ne: businessId }, // Exclude current business
      is_public: true,
      domain_key: business.domainKey,
    };

    // Add subdomain filter if exists
    if (business.subdomainKey) {
      query.subdomain_key = business.subdomainKey;
    }

    // Add location filter if coordinates exist
    if (business.toJSON().location) {
      const location = business.toJSON().location!;
      const radiusInMeters = 10000; // 10km

      query["location.coordinates"] = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [location.lng, location.lat],
          },
          $maxDistance: radiusInMeters,
        },
      };
    }

    // Get similar businesses
    const similarBusinesses =
      await this.cardRepository.findActiveVerifiedUserCards(query, {
        sort: { "rating.average": -1, views: -1 },
        limit: Math.min(limit, 20),
      });

    return this.mapToSimilarDTO(similarBusinesses, business);
  }

  private mapToSimilarDTO(
    cards: Card[],
    referenceCard: Card
  ): SimilarBusinessDTO[] {
    const refLocation = referenceCard.toJSON().location;

    return cards.map((card: any) => {
      const cardData = card.props || card.toJSON();
      const location: any = {};

      // Extract city from address
      if (cardData.address) {
        const addressParts = cardData.address.split(",");
        location.city = addressParts[addressParts.length - 1]?.trim();
      }

      // Calculate distance if both have coordinates
      if (refLocation && cardData.location) {
        location.distance = this.calculateDistance(
          refLocation.lat,
          refLocation.lng,
          cardData.location.lat,
          cardData.location.lng
        );
      }

      return {
        id: cardData._id || cardData.id,
        name: cardData.title,
        logo: cardData.logo,
        rating: cardData.rating || { average: 0, count: 0 },
        location: Object.keys(location).length > 0 ? location : undefined,
        domain_key: cardData.domain_key,
      };
    });
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
