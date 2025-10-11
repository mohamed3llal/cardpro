import { User } from "@domain/entities/User";
import { VerificationStatus } from "@application/dtos/VerificationDTO";

export interface IUserRepository {
  create(user: User | any): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, user: User | any): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  exists(email: string): Promise<boolean>;
  findAll(query?: any): Promise<User[]>;

  // Verification queries
  findByVerificationStatus(status: VerificationStatus): Promise<User[]>;
  findWithVerification(): Promise<User[]>;

  // Query methods
  count(query?: any): Promise<number>;
}
