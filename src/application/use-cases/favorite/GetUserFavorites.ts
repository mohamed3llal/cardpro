import { IFavoriteRepository } from "@domain/interfaces/IFavoriteRepository";

export class GetUserFavoritesUseCase {
  constructor(private favoriteRepository: IFavoriteRepository) {}

  async execute(userId: string): Promise<{
    favorites: Array<{ business_id: string; created_at: Date }>;
    total: number;
  }> {
    const favorites = await this.favoriteRepository.findByUserId(userId);
    const total = favorites.length;

    return {
      favorites: favorites.map((fav) => ({
        business_id: fav.businessId,
        created_at: fav.createdAt!,
      })),
      total,
    };
  }
}
