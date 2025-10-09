import { Card, CardProps } from "../../../domain/entities/Card";
import {
  ICardRepository,
  PaginationOptions,
  CardFilters,
  PaginatedResult,
} from "../../../domain/interfaces/ICardRepository";
import { CardModel } from "../models/CardModel";
import mongoose from "mongoose";

export class CardRepository implements ICardRepository {
  async create(card: Card): Promise<Card> {
    const cardData = card.toJSON();
    const cardDocument = new CardModel(cardData);
    const savedCard = await cardDocument.save();
    return this.toEntity(savedCard.toObject());
  }

  async findById(id: string): Promise<Card | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const cardDocument = await CardModel.findById(id);
    if (!cardDocument) {
      return null;
    }

    return this.toEntity(cardDocument.toObject());
  }

  async findByUserId(
    userId: string,
    options: PaginationOptions = { page: 1, limit: 20 },
    filters: CardFilters = {}
  ): Promise<PaginatedResult<Card>> {
    const {
      page = 1,
      limit = 20,
      sort_by = "created_at",
      sort_order = "desc",
    } = options;

    const query: any = { user_id: userId };

    if (filters.is_public !== undefined) {
      query.is_public = filters.is_public;
    }

    if (filters.domain_key) {
      query.domain_key = filters.domain_key;
    }

    if (filters.subdomain_key) {
      query.subdomain_key = filters.subdomain_key;
    }

    const skip = (page - 1) * limit;
    const sortOrder = sort_order === "asc" ? 1 : -1;
    const sortOptions: any = { [sort_by]: sortOrder };

    const [cards, total] = await Promise.all([
      CardModel.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
      CardModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: cards.map((card) => this.toEntity(card)),
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_items: total,
        limit,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    };
  }

  async update(id: string, card: Card): Promise<Card | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const cardData = card.toJSON();
    delete cardData._id; // Remove _id from update data

    const updatedCard = await CardModel.findByIdAndUpdate(
      id,
      { $set: cardData },
      { new: true, runValidators: true }
    );

    if (!updatedCard) {
      return null;
    }

    return this.toEntity(updatedCard.toObject());
  }

  async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }

    const result = await CardModel.findByIdAndDelete(id);
    return result !== null;
  }

  async exists(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }

    const count = await CardModel.countDocuments({ _id: id });
    return count > 0;
  }

  async isOwner(cardId: string, userId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(cardId)) {
      return false;
    }

    const card = await CardModel.findOne({ _id: cardId, user_id: userId });
    return card !== null;
  }

  async incrementViews(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return;
    }

    await CardModel.findByIdAndUpdate(id, {
      $inc: { views: 1 },
      $set: { updated_at: new Date() },
    });
  }

  async incrementScans(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return;
    }

    await CardModel.findByIdAndUpdate(id, {
      $inc: { scans: 1 },
      $set: { updated_at: new Date() },
    });
  }

  private toEntity(data: any): Card {
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
      verified: data.verified,
      scans: data.scans,
      views: data.views,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return new Card(cardProps);
  }
}
