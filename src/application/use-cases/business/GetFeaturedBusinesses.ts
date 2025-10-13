import { ICardRepository } from "@domain/interfaces/ICardRepository";
import {
  FeaturedBusinessesResultDTO,
  FeaturedBusinessDTO,
  CategoryBusinessesDTO,
} from "@application/dtos/BusinessDTO";
interface LocationFilter {
  latitude?: number;
  longitude?: number;
  radius?: number;
}
export class GetFeaturedBusinessesUseCase {
  constructor(private cardRepository: ICardRepository) {}

  async execute(
    locationFilter?: LocationFilter
  ): Promise<FeaturedBusinessesResultDTO> {
    // Build query filter
    const filter: any = { is_public: true };

    // Add location-based filtering if coordinates provided
    if (locationFilter?.latitude && locationFilter?.longitude) {
      filter.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [locationFilter.longitude, locationFilter.latitude],
          },
          $maxDistance: (locationFilter.radius || 10) * 1000, // Convert km to meters
        },
      };
    }

    // Fetch cards with location filtering
    const allCards = await this.cardRepository.findActiveVerifiedUserCards(
      filter,
      {
        sort: { views: -1 },
        limit: 20,
      }
    );

    const featured = allCards.slice(0, 6);

    // Get categories with same location filter
    const categories = await this.getTopByCategoryAggregated(locationFilter);

    return {
      featured: featured.map((card) => this.mapToFeaturedDTO(card)),
      categories: categories.map((category) => this.mapToCategoryDTO(category)),
    };
  }

  // ✅ FIX 3: Use aggregation instead of N queries
  private async getTopByCategoryAggregated(
    locationFilter?: LocationFilter
  ): Promise<CategoryBusinessesDTO[]> {
    const pipeline: any[] = [
      // ✅ 1. Match only public cards
      { $match: { is_public: true } },
    ];

    // ✅ 2. Add location filtering if coordinates provided
    if (locationFilter?.latitude && locationFilter?.longitude) {
      pipeline.push({
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [locationFilter.longitude, locationFilter.latitude],
          },
          distanceField: "distance",
          maxDistance: (locationFilter.radius || 10) * 1000, // Convert km to meters
          spherical: true,
          query: { is_public: true }, // Combine with existing match
        },
      });
      // Remove the first $match since $geoNear must be first stage
      pipeline.shift();
    }

    // ✅ 3. Convert user_id (string) to ObjectId for lookup
    pipeline.push({
      $addFields: {
        user_id_obj: { $toObjectId: "$user_id" },
      },
    });

    // ✅ 4. Lookup user and flatten
    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "user_id_obj",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" }
    );

    // ✅ 5. Filter for active + verified users only
    pipeline.push({
      $match: {
        "user.isActive": true,
        "user.domainVerified": true,
      },
    });

    // ✅ 6. Group by domain (from user or card)
    pipeline.push({
      $group: {
        _id: "$user.domainKey",
        count: { $sum: 1 },
        businesses: {
          $push: {
            _id: "$_id",
            title: "$title",
            logo: "$logo",
            rating: "$rating",
            domain_key: "$user.domainKey",
            views: "$views",
            user_id: {
              _id: "$user._id",
              name: "$user.name",
              avatar: "$user.avatar",
              domainVerified: "$user.domainVerified",
            },
            is_verified: "$user.domainVerified", // ✅ Keep consistent flag
          },
        },
      },
    });

    // ✅ 7. Sort and slice top 3 per category
    pipeline.push({
      $project: {
        domain_key: "$_id",
        count: 1,
        businesses: {
          $slice: [
            {
              $sortArray: {
                input: "$businesses",
                sortBy: { views: -1 },
              },
            },
            3,
          ],
        },
      },
    });

    const results = await this.cardRepository.aggregate(pipeline);

    return results.map((category) => ({
      domain_key: category.domain_key || "others",
      count: category.count,
      businesses: category.businesses.map((biz: any) =>
        this.mapToFeaturedDTO(biz)
      ),
    }));
  }

  // ✅ FIX 4: Robust DTO mapping
  private mapToFeaturedDTO(business: any): FeaturedBusinessDTO {
    // Handle both entity and plain object
    const isEntity = business.props !== undefined;
    const data = isEntity ? business.props : business;
    const user = data.user || business.user;

    return {
      id: data._id?.toString() || data.id?.toString() || null,
      name: data.company || data.title || "Unnamed Business",
      logo: data.logo || user?.avatar || null, // ✅ Fallback to user avatar
      rating: {
        average: 0, // ✅ Cards don't have ratings yet
        count: 0,
      },
      domain_key: user?.domainKey || data.domain_key || "others",
      is_verified: user?.domainVerified || false, // ✅ From user, not card
    };
  }

  private mapToCategoryDTO(category: any) {
    return {
      domain_key: category.domain_key || "others",
      count: category.count,
      businesses: category.businesses.map((biz: any) =>
        this.mapToFeaturedDTO(biz)
      ),
    };
  }
}
