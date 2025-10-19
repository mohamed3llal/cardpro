import { Favorite } from "@domain/entities/Favorite";
import {
  IFavoriteRepository,
  PaginatedFavorites,
} from "@domain/interfaces/IFavoriteRepository";
import { FavoriteModel } from "@infrastructure/database/models/FavoriteModel";
import { CardModel } from "@infrastructure/database/models/CardModel";
import { UserModel } from "@infrastructure/database/models/UserModel";
import mongoose from "mongoose";

export class FavoriteRepository implements IFavoriteRepository {
  async create(favorite: Favorite): Promise<Favorite> {
    try {
      const favoriteDoc = await FavoriteModel.create({
        user_id: favorite.userId,
        business_id: favorite.businessId,
      });

      return Favorite.fromPersistence(favoriteDoc);
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error("Business already in favorites");
      }
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Favorite[]> {
    const favorites = await FavoriteModel.find({ user_id: userId })
      .sort({ created_at: -1 })
      .lean();

    return favorites.map((fav) => Favorite.fromPersistence(fav));
  }

  async findOne(userId: string, businessId: string): Promise<Favorite | null> {
    const favorite = await FavoriteModel.findOne({
      user_id: userId,
      business_id: businessId,
    }).lean();

    return favorite ? Favorite.fromPersistence(favorite) : null;
  }

  async exists(userId: string, businessId: string): Promise<boolean> {
    const count = await FavoriteModel.countDocuments({
      user_id: userId,
      business_id: businessId,
    });

    return count > 0;
  }

  async delete(userId: string, businessId: string): Promise<boolean> {
    const result = await FavoriteModel.deleteOne({
      user_id: userId,
      business_id: businessId,
    });

    return result.deletedCount > 0;
  }

  async countByUserId(userId: string): Promise<number> {
    return await FavoriteModel.countDocuments({ user_id: userId });
  }

  async findFavoritesWithBusinessDetails(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedFavorites> {
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.countByUserId(userId);

    // Aggregate favorites with business details
    const pipeline: any[] = [
      { $match: { user_id: userId } },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $addFields: {
          business_id_obj: { $toObjectId: "$business_id" },
        },
      },
      {
        $lookup: {
          from: "cards",
          localField: "business_id_obj",
          foreignField: "_id",
          as: "business",
        },
      },
      { $unwind: { path: "$business", preserveNullAndEmptyArrays: false } },
      {
        $addFields: {
          user_id_obj: { $toObjectId: "$business.user_id" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id_obj",
          foreignField: "_id",
          as: "owner",
        },
      },
      { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: "$business._id",
          title: "$business.title",
          company: "$business.company",
          logo: "$business.logo",
          domain_key: "$business.domain_key",
          subdomain_key: "$business.subdomain_key",
          description: "$business.description",
          email: "$business.email",
          mobile_phones: "$business.mobile_phones",
          address: "$business.address",
          location: "$business.location",
          rating: "$business.rating",
          views: "$business.views",
          verified: "$owner.domainVerified",
          favorited_at: "$created_at",
          is_public: "$business.is_public",
        },
      },
    ];

    const results = await FavoriteModel.aggregate(pipeline);

    const totalPages = Math.ceil(total / limit);

    return {
      businesses: results,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_favorites: total,
        limit,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    };
  }

  async isFavorited(
    userId: string,
    businessId: string
  ): Promise<{ is_favorite: boolean; created_at?: Date }> {
    const favorite = await this.findOne(userId, businessId);

    if (!favorite) {
      return { is_favorite: false };
    }

    return {
      is_favorite: true,
      created_at: favorite.createdAt,
    };
  }
}
