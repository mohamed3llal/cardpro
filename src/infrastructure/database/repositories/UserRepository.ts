import { User } from "@domain/entities/User";
import { IUserRepository } from "@domain/interfaces/IUserRepository";
import { UserModel } from "@infrastructure/database/models/UserModel";

export class UserRepository implements IUserRepository {
  // Helper method to convert Mongoose document to User entity
  private toUserEntity(doc: any): User {
    return new User({
      id: doc._id.toString(),
      email: doc.email,
      firstName: doc.firstName,
      lastName: doc.lastName,
      phone: doc.phone,
      avatar: doc.avatar,
      role: doc.role,
      isActive: doc.isActive,
      lastLoginAt: doc.lastLoginAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async create(user: User): Promise<User> {
    // Convert User entity to plain object before saving
    const userData = user.toJSON();
    const created = await UserModel.create(userData);
    return this.toUserEntity(created);
  }

  async findById(id: string): Promise<User | null> {
    const found = await UserModel.findById(id);
    return found ? this.toUserEntity(found) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const found = await UserModel.findOne({ email });
    return found ? this.toUserEntity(found) : null;
  }

  async update(id: string, user: User): Promise<User | null> {
    const updated = await UserModel.findByIdAndUpdate(
      id,
      {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        updatedAt: new Date(),
      },
      { new: true }
    );
    return updated ? this.toUserEntity(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }

  async exists(email: string): Promise<boolean> {
    const count = await UserModel.countDocuments({ email });
    return count > 0;
  }

  async findAll(): Promise<User[]> {
    const users = await UserModel.find();
    return users.map((doc) => this.toUserEntity(doc));
  }
}
