import { IUserRepository } from "@domain/interfaces/IUserRepository";
import { User } from "@domain/entities/User";
import { AppError } from "@shared/errors/AppError";

export class GetCurrentUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.isActive) {
      throw new AppError("Your account has been deactivated", 403);
    }

    return user;
  }
}
