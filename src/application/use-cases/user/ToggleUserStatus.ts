import { IUserRepository } from "@domain/interfaces/IUserRepository";
import { AppError } from "@shared/errors/AppError";

export class ToggleUserStatus {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, requestingUserId: string) {
    // Verify requesting user is admin
    const requestingUser = await this.userRepository.findById(requestingUserId);

    if (!requestingUser || !requestingUser.isAdmin) {
      throw new AppError("Unauthorized: Admin access required", 403);
    }

    // Find target user
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Prevent deactivating super admins
    if (user.isSuperAdmin && !requestingUser.isSuperAdmin) {
      throw new AppError("Cannot modify super admin status", 403);
    }

    // Toggle status
    if (user.isActive) {
      user.deactivate();
    } else {
      user.activate();
    }

    const updatedUser = await this.userRepository.update(userId, user.toJSON());

    if (!updatedUser) {
      throw new AppError("Failed to update user status", 500);
    }

    return {
      status: updatedUser.isActive ? "active" : "suspended",
      user: updatedUser.toPublicJSON(),
    };
  }
}
