import { User, UserRole, VerificationStatus } from "@domain/entities/User";
import { IUserRepository } from "@domain/interfaces/IUserRepository";
import { UserModel } from "@infrastructure/database/models/UserModel";
import { Types } from "mongoose";

export class UserRepository implements IUserRepository {
  async create(userData: any): Promise<User> {
    try {
      const userDoc = await UserModel.create(userData);
      return User.fromPersistence(userDoc.toObject());
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error("User with this email already exists");
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return null;
      }

      const userDoc = await UserModel.findById(id).lean();
      if (!userDoc) {
        return null;
      }

      return User.fromPersistence(userDoc);
    } catch (error: any) {
      throw new Error(`Failed to find user by ID: ${error.message}`);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const userDoc = await UserModel.findOne({
        email: email.toLowerCase().trim(),
      }).lean();

      if (!userDoc) {
        return null;
      }

      return User.fromPersistence(userDoc);
    } catch (error: any) {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  async update(id: string, updateData: any): Promise<User | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new Error("Invalid user ID format");
      }

      // Sanitize update data
      const sanitizedData = this.sanitizeUpdateData(updateData);

      const userDoc = await UserModel.findByIdAndUpdate(
        id,
        {
          ...sanitizedData,
          updatedAt: new Date(),
        },
        {
          new: true,
          runValidators: true,
        }
      ).lean();

      if (!userDoc) {
        return null;
      }

      return User.fromPersistence(userDoc);
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error("Email already in use");
      }
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return false;
      }

      const result = await UserModel.findByIdAndDelete(id);
      return !!result;
    } catch (error: any) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  async exists(email: string): Promise<boolean> {
    try {
      const count = await UserModel.countDocuments({
        email: email.toLowerCase().trim(),
      });
      return count > 0;
    } catch (error: any) {
      throw new Error(`Failed to check user existence: ${error.message}`);
    }
  }

  async findAll(query: any = {}): Promise<User[]> {
    try {
      const userDocs = await UserModel.find(query)
        .sort({ createdAt: -1 })
        .lean();

      return userDocs.map((doc) => User.fromPersistence(doc));
    } catch (error: any) {
      throw new Error(`Failed to find users: ${error.message}`);
    }
  }

  async findByVerificationStatus(status: VerificationStatus): Promise<User[]> {
    try {
      const userDocs = await UserModel.find({
        verificationStatus: status,
      })
        .sort({ updatedAt: -1 })
        .lean();

      return userDocs.map((doc) => User.fromPersistence(doc));
    } catch (error: any) {
      throw new Error(
        `Failed to find users by verification status: ${error.message}`
      );
    }
  }

  async findVerifiedUserIds(): Promise<string[]> {
    const users = await UserModel.find(
      { domainVerified: true, isActive: true },
      { _id: 1 }
    ).lean();

    return users.map((user) => user._id.toString());
  }

  async findWithVerification(): Promise<User[]> {
    try {
      const userDocs = await UserModel.find({
        verificationStatus: {
          $in: [
            VerificationStatus.PENDING,
            VerificationStatus.APPROVED,
            VerificationStatus.REJECTED,
          ],
        },
      })
        .sort({ updatedAt: -1 })
        .lean();

      return userDocs.map((doc) => User.fromPersistence(doc));
    } catch (error: any) {
      throw new Error(
        `Failed to find users with verification: ${error.message}`
      );
    }
  }

  async findByDomain(domainKey: string): Promise<User[]> {
    try {
      const userDocs = await UserModel.find({
        domainKey,
        domainVerified: true,
      })
        .sort({ createdAt: -1 })
        .lean();

      return userDocs.map((doc) => User.fromPersistence(doc));
    } catch (error: any) {
      throw new Error(`Failed to find users by domain: ${error.message}`);
    }
  }

  async findByRole(role: UserRole): Promise<User[]> {
    try {
      const userDocs = await UserModel.find({ role })
        .sort({ createdAt: -1 })
        .lean();

      return userDocs.map((doc) => User.fromPersistence(doc));
    } catch (error: any) {
      throw new Error(`Failed to find users by role: ${error.message}`);
    }
  }

  async count(query: any = {}): Promise<number> {
    try {
      return await UserModel.countDocuments(query);
    } catch (error: any) {
      throw new Error(`Failed to count users: ${error.message}`);
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new Error("Invalid user ID format");
      }

      await UserModel.findByIdAndUpdate(id, {
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error: any) {
      throw new Error(`Failed to update last login: ${error.message}`);
    }
  }

  // Helper method to sanitize update data
  private sanitizeUpdateData(data: any): any {
    const allowed = [
      "firstName",
      "lastName",
      "phone",
      "avatar",
      "bio",
      "city",
      "role",
      "isActive",
      "isAdmin",
      "domainKey",
      "subcategoryKey",
      "domainDocumentUrl",
      "verificationStatus",
      "domainVerified",
      "verificationNotes",
      "lastLoginAt",
    ];

    const sanitized: any = {};

    for (const key of allowed) {
      if (data[key] !== undefined) {
        sanitized[key] = data[key];
      }
    }

    // Trim string fields
    if (sanitized.firstName) sanitized.firstName = sanitized.firstName.trim();
    if (sanitized.lastName) sanitized.lastName = sanitized.lastName.trim();
    if (sanitized.phone) sanitized.phone = sanitized.phone.trim();
    if (sanitized.bio) sanitized.bio = sanitized.bio.trim();
    if (sanitized.city) sanitized.city = sanitized.city.trim();

    return sanitized;
  }
}
