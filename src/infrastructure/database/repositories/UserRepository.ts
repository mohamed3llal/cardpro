import { IUserRepository } from "@domain/interfaces/IUserRepository";
import { User } from "@domain/entities/User";
import { UserModel } from "@infrastructure/database/models/UserModel";
import { VerificationStatus } from "@application/dtos/VerificationDTO";

export class UserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    const newUser = await UserModel.create(user);
    return this.mapToEntity(newUser);
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    return user ? this.mapToEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    return user ? this.mapToEntity(user) : null;
  }

  async findOne(query: any): Promise<User | null> {
    const user = await UserModel.findOne(query);
    return user ? this.mapToEntity(user) : null;
  }

  async update(id: string, user: User | any): Promise<User | null> {
    console.log("===============================");
    console.log("user:", user);
    console.log("===============================");
    const { _id, ...data } = user;
    console.log("===============================");
    console.log("data:", data);
    console.log("===============================");

    const updated = await UserModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return null;
    }

    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

  async findByVerificationStatus(status: VerificationStatus): Promise<User[]> {
    const users = await UserModel.find({ verificationStatus: status }).sort({
      updatedAt: -1,
    });

    return users.map((user) => this.mapToEntity(user));
  }

  async findWithVerification(): Promise<User[]> {
    const users = await UserModel.find({
      verificationStatus: { $in: ["pending", "approved", "rejected"] },
    }).sort({ updatedAt: -1 });

    return users.map((user) => this.mapToEntity(user));
  }

  async count(query: any = {}): Promise<number> {
    return await UserModel.countDocuments(query);
  }

  async exists(email: string): Promise<boolean> {
    const count = await UserModel.countDocuments({
      email: email.toLowerCase(),
    });
    return count > 0;
  }

  async findAll(query: any = {}): Promise<User[]> {
    const users = await UserModel.find(query);
    return users.map((user) => this.mapToEntity(user));
  }

  private mapToEntity(user: any): any {
    return {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      isActive: user.isActive,
      isAdmin: user.isAdmin,
      domainKey: user.domainKey,
      subcategoryKey: user.subcategoryKey,
      domainVerified: user.domainVerified,
      domainDocumentUrl: user.domainDocumentUrl,
      verificationStatus: user.verificationStatus,
      verificationNotes: user.verificationNotes,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
