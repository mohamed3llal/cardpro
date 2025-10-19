import { IFavoriteRepository } from "@domain/interfaces/IFavoriteRepository";

import { AppError } from "@shared/errors/AppError";

export interface RemoveFromFavoritesDTO {
  user_id: string;
  business_id: string;
}

export class RemoveFromFavoritesUseCase {
  constructor(private favoriteRepository: IFavoriteRepository) {}

  async execute(dto: RemoveFromFavoritesDTO): Promise<void> {
    const deleted = await this.favoriteRepository.delete(
      dto.user_id,
      dto.business_id
    );

    if (!deleted) {
      throw new AppError("Business not found in favorites", 404);
    }
  }
}
