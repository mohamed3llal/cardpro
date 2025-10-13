import { IUserRepository } from "@domain/interfaces/IUserRepository";
import { AppError } from "@shared/errors/AppError";

export class UpdateLastLogin {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    user.updateLastLogin();

    await this.userRepository.update(userId, user.toJSON());
  }
}
