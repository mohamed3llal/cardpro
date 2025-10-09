export interface SearchFilters {
  domain?: string;
  city?: string;
  minRating?: number;
  tags?: string[];
}

export interface ISearchRepository {
  searchCards(filters: SearchFilters): Promise<Card[]>;
}
