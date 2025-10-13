import { IUserRepository } from "@domain/interfaces/IUserRepository";
import { User } from "@domain/entities/User";
import { AppError } from "@shared/errors/AppError";

export interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  city?: string;
  domainKey?: string;
  subcategoryKey?: string;
}

export class UpdateUserProfile {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, data: UpdateProfileDTO) {
    // Find user
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Update basic profile if provided
    if (
      data.firstName ||
      data.lastName ||
      data.phone ||
      data.avatar ||
      data.bio ||
      data.city
    ) {
      try {
        user.updateProfile({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          avatar: data.avatar,
          bio: data.bio,
          city: data.city,
        });
      } catch (error: any) {
        throw new AppError(error.message, 400);
      }
    }

    // Update domain info if both provided
    if (data.domainKey && data.subcategoryKey) {
      try {
        user.setDomainInfo(data.domainKey, data.subcategoryKey);
      } catch (error: any) {
        throw new AppError(error.message, 400);
      }
    } else if (data.domainKey || data.subcategoryKey) {
      throw new AppError(
        "Both domain and subcategory must be provided together",
        400
      );
    }

    // Persist changes
    const updatedUser = await this.userRepository.update(userId, user.toJSON());

    if (!updatedUser) {
      throw new AppError("Failed to update user", 500);
    }

    return updatedUser.toPublicJSON();
  }
}
