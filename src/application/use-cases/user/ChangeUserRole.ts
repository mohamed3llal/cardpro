import { IUserRepository } from "@domain/interfaces/IUserRepository";
import { UserRole } from "@domain/entities/User";
import { AppError } from "@shared/errors/AppError";

export class ChangeUserRole {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, newRole: UserRole, requestingUserId: string) {
    // Verify requesting user is admin
    const requestingUser = await this.userRepository.findById(requestingUserId);

    if (!requestingUser || !requestingUser.isAdmin) {
      throw new AppError("Unauthorized: Admin access required", 403);
    }

    // Only super admins can assign super admin role
    if (newRole === UserRole.SUPER_ADMIN && !requestingUser.isSuperAdmin) {
      throw new AppError("Only super admins can assign super admin role", 403);
    }

    // Find target user
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Prevent modifying super admin roles unless requesting user is super admin
    if (user.isSuperAdmin && !requestingUser.isSuperAdmin) {
      throw new AppError("Cannot modify super admin role", 403);
    }

    // Change role
    user.changeRole(newRole);

    const updatedUser = await this.userRepository.update(userId, user.toJSON());

    if (!updatedUser) {
      throw new AppError("Failed to update user role", 500);
    }

    return updatedUser.toPublicJSON();
  }
}
