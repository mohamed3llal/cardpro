// src/domain/interfaces/IAdminServices.ts
import {
  AdminStatsDTO,
  AdminUserDTO,
  AdminCardDTO,
} from "../../application/dtos/AdminDTO";

export interface IAdminServices {
  // Dashboard & Analytics
  getDashboardStats(): Promise<AdminStatsDTO>;
  getAnalytics(days: number): Promise<any[]>;

  // User Management
  getAllUsers(): Promise<AdminUserDTO[]>;
  createUser(data: {
    email: string;
    fullName: string;
    role: string;
  }): Promise<any>;
  updateUserRole(userId: string, role: string): Promise<void>;
  toggleUserStatus(userId: string): Promise<string>;

  // Card Management
  getAllCards(): Promise<AdminCardDTO[]>;
  deleteCard(cardId: string): Promise<void>;

  // Domain Management
  createDomain(data: any): Promise<any>;
  deleteDomain(domainKey: string): Promise<void>;

  // Subscription Management
  getAllSubscriptions(): Promise<any[]>;
  updateSubscription(
    userId: string,
    plan: string,
    expiresAt: string
  ): Promise<void>;
}
