import { IFavoriteRepository } from "@domain/interfaces/IFavoriteRepository";
import { ICardRepository } from "@domain/interfaces/ICardRepository";
import { Favorite } from "@domain/entities/Favorite";
import { AppError } from "@shared/errors/AppError";

export interface AddToFavoritesDTO {
  user_id: string;
  business_id: string;
}

export class AddToFavoritesUseCase {
  constructor(
    private favoriteRepository: IFavoriteRepository,
    private cardRepository: ICardRepository
  ) {}

  async execute(dto: AddToFavoritesDTO): Promise<Favorite> {
    // Validate business exists
    const business = await this.cardRepository.findById(dto.business_id);
    if (!business) {
      throw new AppError("Business not found", 404);
    }

    // Check if already favorited
    const exists = await this.favoriteRepository.exists(
      dto.user_id,
      dto.business_id
    );

    if (exists) {
      throw new AppError("Business already in favorites", 400);
    }

    // Create favorite
    const favorite = Favorite.create({
      user_id: dto.user_id,
      business_id: dto.business_id,
    });

    return await this.favoriteRepository.create(favorite);
  }
}
