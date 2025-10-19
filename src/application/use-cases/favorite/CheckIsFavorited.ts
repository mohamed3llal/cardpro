import { IFavoriteRepository } from "@domain/interfaces/IFavoriteRepository";

export interface CheckIsFavoritedDTO {
  user_id: string;
  business_id: string;
}

export class CheckIsFavoritedUseCase {
  constructor(private favoriteRepository: IFavoriteRepository) {}

  async execute(dto: CheckIsFavoritedDTO) {
    return await this.favoriteRepository.isFavorited(
      dto.user_id,
      dto.business_id
    );
  }
}
