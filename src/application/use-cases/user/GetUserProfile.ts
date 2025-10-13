import { IUserRepository } from "@domain/interfaces/IUserRepository";
import { AppError } from "@shared/errors/AppError";

export class GetUserProfile {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user.toPublicJSON();
  }
}
