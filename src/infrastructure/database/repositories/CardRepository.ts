// src/infrastructure/repositories/CardRepository.ts
import {
  ICardRepository,
  FindOptions,
} from "@domain/interfaces/ICardRepository";
import { Card, CardProps } from "@domain/entities/Card";
import { CardModel } from "@infrastructure/database/models/CardModel";
import mongoose from "mongoose";

export class CardRepository implements ICardRepository {
  async create(card: Card): Promise<Card> {
    const newCard = await CardModel.create(card.toJSON());
    return this.mapToEntity(newCard);
  }

  async aggregate(pipeline: any[]): Promise<any[]> {
    const cards = await CardModel.aggregate(pipeline);
    return cards;
  }

  async findById(id: string): Promise<Card | null> {
    const card = await CardModel.findById(id);
    return card ? this.mapToEntity(card) : null;
  }

  async findOne(query: any): Promise<Card | null> {
    const card = await CardModel.findOne(query);
    return card ? this.mapToEntity(card) : null;
  }

  async find(
    query: any,
    verified: boolean = false,
    options?: FindOptions
  ): Promise<Card[]> {
    try {
      // 🔹 Base query
      const finalQuery = { ...query };

      // ✅ Add verification filter if requested
      if (verified) {
        finalQuery.verified = true;
      }

      // ✅ Clean undefined/null values
      Object.keys(finalQuery).forEach(
        (key) => finalQuery[key] == null && delete finalQuery[key]
      );

      // 🔹 Start building query
      let queryBuilder = CardModel.find(finalQuery);

      // 🔹 Apply query options safely
      if (options?.sort) queryBuilder = queryBuilder.sort(options.sort);
      if (options?.limit) queryBuilder = queryBuilder.limit(options.limit);
      if (options?.skip) queryBuilder = queryBuilder.skip(options.skip);
      if (options?.select)
        queryBuilder = queryBuilder.select(options.select.join(" "));

      // ✅ Use .lean() for clean JSON objects (avoid circular structure)
      const cards = await queryBuilder.lean().exec();

      // 🔹 Map to entity domain if needed
      return cards.map((card) => this.mapToEntity(card));
    } catch (error) {
      console.error("❌ Error fetching cards:", error);
      throw error;
    }
  }

  // async findActiveVerifiedUserCards(
  //   query: any,
  //   options?: FindOptions
  // ): Promise<Card[]> {
  //   try {
  //     // ✅ FIX 1: Convert user_id string to ObjectId for lookup
  //     // ✅ FIX 2: Use correct collection name (Mongoose usually lowercases and pluralizes)
  //     const mongooseQuery = CardModel.aggregate([
  //       { $match: query },
  //       {
  //         $addFields: {
  //           user_id_obj: { $toObjectId: "$user_id" }, // ✅ Convert string to ObjectId
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "users", // ✅ Check your actual collection name with: db.getCollectionNames()
  //           localField: "user_id_obj", // ✅ Use converted ObjectId
  //           foreignField: "_id",
  //           as: "user",
  //         },
  //       },
  //       { $unwind: { path: "$user", preserveNullAndEmptyArrays: false } }, // ✅ Fail if user not found
  //       {
  //         $match: {
  //           "user.domainVerified": true,
  //           "user.isActive": true,
  //         },
  //       },
  //       ...(options?.sort ? [{ $sort: options.sort }] : []),
  //       ...(options?.skip ? [{ $skip: options.skip }] : []),
  //       ...(options?.limit ? [{ $limit: options.limit }] : []),
  //     ]);

  //     const results = await mongooseQuery.exec();

  //     console.log("✅ Aggregation returned:", results.length, "cards");

  //     return results.map((doc) => {
  //       // ✅ Map the aggregation result to your Card entity
  //       const entity: any = this.mapToEntity(doc);

  //       // ✅ Attach user data
  //       entity.props.user = {
  //         firstName: doc.user.firstName,
  //         lastName: doc.user.lastName,
  //         avatar: doc.user.avatar,
  //         email: doc.user.email,
  //         domainVerified: doc.user.domainVerified,
  //         domainKey: doc.user.domainKey,
  //         subcategoryKey: doc.user.subcategoryKey,
  //       };

  //       return entity;
  //     });
  //   } catch (error) {
  //     console.error("❌ Error in findActiveVerifiedUserCards:", error);
  //     throw error;
  //   }
  // }

  async findActiveVerifiedUserCards(
    query: any,
    options?: FindOptions
  ): Promise<Card[]> {
    try {
      // ✅ FIX 1: Convert user_id string to ObjectId for lookup
      // ✅ FIX 2: Use correct collection name (Mongoose usually lowercases and pluralizes)
      const mongooseQuery = CardModel.aggregate([
        { $match: query },
        {
          $addFields: {
            user_id_obj: { $toObjectId: "$user_id" }, // ✅ Convert string to ObjectId
          },
        },
        {
          $lookup: {
            from: "users", // ✅ Check your actual collection name with: db.getCollectionNames()
            localField: "user_id_obj", // ✅ Use converted ObjectId
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: false } }, // ✅ Fail if user not found
        {
          $match: {
            "user.domainVerified": true,
            "user.isActive": true,
          },
        },
        ...(options?.sort ? [{ $sort: options.sort }] : []),
        ...(options?.skip ? [{ $skip: options.skip }] : []),
        ...(options?.limit ? [{ $limit: options.limit }] : []),
      ]);

      const results = await mongooseQuery.exec();

      console.log("✅ Aggregation returned:", results.length, "cards");

      return results.map((doc) => {
        // ✅ Map the aggregation result to your Card entity
        const entity: any = this.mapToEntity(doc);

        // ✅ Attach user data
        entity.props.user = {
          firstName: doc.user.firstName,
          lastName: doc.user.lastName,
          avatar: doc.user.avatar,
          email: doc.user.email,
          domainVerified: doc.user.domainVerified,
          domainKey: doc.user.domainKey,
          subcategoryKey: doc.user.subcategoryKey,
        };

        return entity;
      });
    } catch (error) {
      console.error("❌ Error in findActiveVerifiedUserCards:", error);
      throw error;
    }
  }

  // ✅ ALTERNATIVE: If collection name is the issue, use this method
  async findActiveVerifiedUserCardsAlternative(
    query: any,
    options?: FindOptions
  ): Promise<Card[]> {
    try {
      // Method 1: Get the actual collection name from the model
      const userCollectionName = mongoose.model("User").collection.name;

      console.log("📦 Using collection name:", userCollectionName);

      const mongooseQuery = CardModel.aggregate([
        { $match: query },
        {
          $addFields: {
            user_id_obj: { $toObjectId: "$user_id" },
          },
        },
        {
          $lookup: {
            from: userCollectionName, // ✅ Dynamic collection name
            localField: "user_id_obj",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: false } },
        {
          $match: {
            "user.domainVerified": true,
            "user.isActive": true,
          },
        },
        ...(options?.sort ? [{ $sort: options.sort }] : []),
        ...(options?.skip ? [{ $skip: options.skip }] : []),
        ...(options?.limit ? [{ $limit: options.limit }] : []),
      ]);

      const results = await mongooseQuery.exec();
      console.log("✅ Found", results.length, "verified active user cards");

      return results.map((doc) => {
        const entity: any = this.mapToEntity(doc);
        entity.props.user = {
          firstName: doc.user.firstName,
          lastName: doc.user.lastName,
          avatar: doc.user.avatar,
          email: doc.user.email,
          domainVerified: doc.user.domainVerified,
          domainKey: doc.user.domainKey,
          subcategoryKey: doc.user.subcategoryKey,
        };
        return entity;
      });
    } catch (error) {
      console.error("❌ Error in findActiveVerifiedUserCards:", error);
      throw error;
    }
  }
  async update(id: string, card: Card): Promise<Card | null> {
    // Use card as the update data, but exclude _id if present
    const { _id, ...data } = card.toJSON();
    const updated = await CardModel.findByIdAndUpdate(id, data, {
      new: true,
    });

    return updated ? this.mapToEntity(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await CardModel.findByIdAndDelete(id);
    return !!result;
  }

  async search(query: any, skip: number, limit: number): Promise<Card[]> {
    const cards = await CardModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ score: { $meta: "textScore" } })
      .exec();

    return cards.map((card) => this.mapToEntity(card));
  }

  async count(query: any): Promise<number> {
    return await CardModel.countDocuments(query);
  }

  async distinct(field: string, query?: any): Promise<any[]> {
    return await CardModel.distinct(field, query || {});
  }

  async findByUserId(
    userId: string,
    options: any = {
      page: 1,
      limit: 20,
      sort_by: "created_at",
      sort_order: "desc",
    },
    filters: Record<string, any> = {}
  ): Promise<Card[]> {
    // Destructure pagination/sort options with defaults
    const {
      page = 1,
      limit = 20,
      sort_by = "created_at",
      sort_order = "desc",
    } = options;

    // Clean undefined filters
    const queryFilters = Object.fromEntries(
      Object.entries({
        user_id: userId,
        ...filters,
      }).filter(([_, value]) => value !== undefined && value !== null)
    );

    // Build the query
    const cards = await CardModel.find(queryFilters)
      .sort({ [sort_by]: sort_order === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Map results to entities (if you're using a domain model)
    return cards.map((card) => this.mapToEntity(card));
  }

  async findByUserIdPaginated(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ cards: Card[]; total: number }> {
    const skip = (page - 1) * limit;

    const [cards, total] = await Promise.all([
      CardModel.find({ user_id: userId })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      CardModel.countDocuments({ user_id: userId }),
    ]);

    return {
      cards: cards.map((card) => this.mapToEntity(card)),
      total,
    };
  }

  async incrementViews(cardId: string): Promise<void> {
    await CardModel.findByIdAndUpdate(cardId, {
      $inc: { views: 1, views_this_month: 1 },
    });
  }

  async incrementScans(cardId: string): Promise<void> {
    await CardModel.findByIdAndUpdate(cardId, {
      $inc: { scans: 1 },
    });
  }

  async incrementContactClicks(cardId: string): Promise<void> {
    await CardModel.findByIdAndUpdate(cardId, {
      $inc: { contact_clicks: 1 },
    });
  }

  async getPopularCards(limit: number): Promise<Card[]> {
    const cards = await CardModel.find({ is_public: true })
      .sort({ views: -1, "rating.average": -1 })
      .limit(limit);

    return cards.map((card) => this.mapToEntity(card));
  }

  async getRecentCards(limit: number): Promise<Card[]> {
    const cards = await CardModel.find({ is_public: true })
      .sort({ created_at: -1 })
      .limit(limit);

    return cards.map((card) => this.mapToEntity(card));
  }

  async getCardsByDomain(domain: string, limit: number = 10): Promise<Card[]> {
    const cards = await CardModel.find({
      domain_key: domain,
      is_public: true,
    })
      .sort({ "rating.average": -1, views: -1 })
      .limit(limit);

    return cards.map((card) => this.mapToEntity(card));
  }

  async findNearby(
    latitude: number,
    longitude: number,
    radius: number,
    limit: number = 20
  ): Promise<Card[]> {
    // Radius in meters (convert km to meters)
    const radiusInMeters = radius * 1000;

    const cards = await CardModel.find({
      is_public: true,
      "location.coordinates": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: radiusInMeters,
        },
      },
    }).limit(limit);

    return cards.map((card) => this.mapToEntity(card));
  }

  async exists(id: string): Promise<boolean> {
    const count = await CardModel.countDocuments({ _id: id });
    return count > 0;
  }

  async isOwner(cardId: string | undefined, userId: string): Promise<boolean> {
    if (!cardId) return false;
    const card = await CardModel.findOne({ _id: cardId, user_id: userId });
    return !!card;
  }

  private mapToEntity(data: any): Card {
    const cardProps: CardProps = {
      _id: data._id?.toString(),
      user_id: data.user_id,
      title: data.title,
      company: data.company,
      domain_key: data.domain_key,
      subdomain_key: data.subdomain_key,
      description: data.description,
      mobile_phones: data.mobile_phones,
      landline_phones: data.landline_phones,
      fax_numbers: data.fax_numbers,
      email: data.email,
      website: data.website,
      address: data.address,
      work_hours: data.work_hours,
      languages: data.languages,
      tags: data.tags,
      social_links: data.social_links,
      location: data.location,
      is_public: data.is_public,
      scans: data.scans,
      views: data.views,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return new Card(cardProps);
  }
}
