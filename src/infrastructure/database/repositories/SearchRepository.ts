import {
  ISearchRepository,
  SearchFilters,
} from "@domain/interfaces/ISearchRepository";
import { Card } from "@domain/entities/Card";
import { CardModel } from "../models/CardModel";
import { CardRepository } from "./CardRepository";

export class SearchRepository implements ISearchRepository {
  private cardRepository = new CardRepository();

  async searchCards(filters: SearchFilters): Promise<Card[]> {
    const query: any = { isPublic: true };

    if (filters.domain) {
      query.domain = filters.domain;
    }

    if (filters.city) {
      query["location.city"] = { $regex: filters.city, $options: "i" };
    }

    if (filters.minRating) {
      query.rating = { $gte: filters.minRating };
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    const cardDocuments = await CardModel.find(query)
      .sort({ rating: -1, createdAt: -1 })
      .limit(50);

    return cardDocuments.map((doc) => this.cardRepository["toDomain"](doc));
  }
}
