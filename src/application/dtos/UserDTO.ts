export interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: string;
  bio?: string;
  city?: string;
  isActive: boolean;
  domainKey?: string;
  subcategoryKey?: string;
  verificationStatus: string;
  domainVerified: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUserDTO extends UserDTO {
  isAdmin: boolean;
  domainDocumentUrl?: string;
  verificationNotes?: string;
  cardCount?: number;
}

export interface CreateUserDTO {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role?: string;
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  city?: string;
  domainKey?: string;
  subcategoryKey?: string;
}

export interface UserStatsDTO {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  verifiedUsers: number;
  pendingVerifications: number;
  usersByRole: {
    user: number;
    admin: number;
    moderator: number;
    super_admin: number;
  };
  recentUsers: UserDTO[];
}

export interface UserFilterDTO {
  role?: string;
  isActive?: boolean;
  verificationStatus?: string;
  domainVerified?: boolean;
  domainKey?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedUsersDTO {
  users: UserDTO[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
