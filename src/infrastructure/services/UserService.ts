import { IUserRepository } from "@domain/interfaces/IUserRepository";
import { User } from "@domain/entities/User";

export class UserService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async updateProfile(
    userId: string,
    updateData: Partial<User>
  ): Promise<User | null> {
    return await this.userRepository.update(userId, updateData);
  }

  // ...add other user-related service methods as needed...
}
