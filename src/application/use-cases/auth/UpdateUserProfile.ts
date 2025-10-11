import { IUserRepository } from "@domain/interfaces/IUserRepository";
import { User } from "@domain/entities/User";
import { AppError } from "@shared/errors/AppError";

export interface UpdateUserProfileDTO {
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
}

export class UpdateUserProfileUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, data: UpdateUserProfileDTO): Promise<User> {
    // Find the user
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Check if user account is active
    if (!user.isActive) {
      throw new AppError("Your account has been deactivated", 403);
    }

    try {
      // Update user profile using the entity method
      // This will validate the data and throw errors if invalid
      user.updateProfile(data);

      // Save updated user to database
      const updatedUser = await this.userRepository.update(userId, user);

      if (!updatedUser) {
        throw new AppError("Failed to update user profile", 500);
      }

      return updatedUser;
    } catch (error) {
      // Re-throw AppError as-is
      if (error instanceof AppError) {
        throw error;
      }

      // Handle validation errors from User entity
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }

      // Handle unexpected errors
      throw new AppError(
        "An unexpected error occurred while updating profile",
        500
      );
    }
  }
}
