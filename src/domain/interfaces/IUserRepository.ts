import { User } from "../entities/User";

export interface IUserRepository {
  create(user: User | any): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, user: User | any): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  exists(email: string): Promise<boolean>;
  findAll(): Promise<User[]>;
}
