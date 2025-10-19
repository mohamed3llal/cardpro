import { IFavoriteRepository } from "@domain/interfaces/IFavoriteRepository";

export interface GetFavoriteBusinessesDTO {
  user_id: string;
  page?: number;
  limit?: number;
}

export class GetFavoriteBusinessesUseCase {
  constructor(private favoriteRepository: IFavoriteRepository) {}

  async execute(dto: GetFavoriteBusinessesDTO) {
    const page = dto.page || 1;
    const limit = Math.min(dto.limit || 20, 100);

    return await this.favoriteRepository.findFavoritesWithBusinessDetails(
      dto.user_id,
      page,
      limit
    );
  }
}
