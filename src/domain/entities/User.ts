export interface UserProps {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  bio?: string;
  city?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  isAdmin?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  fullName?: string; // Add this for compatibility with service
  domainKey?: string;
  subcategoryKey?: string;
  domainDocumentUrl?: string;
  verificationStatus?: string;
  domainVerified?: boolean;
  verificationNotes?: string;
}

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  MODERATOR = "moderator",
  SUPER_ADMIN = "super_admin",
}

export class User {
  private props: UserProps;

  constructor(props: UserProps) {
    this.props = props;
    this.validate();
  }

  private validate(): void {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.props.email)) {
      throw new Error("Invalid email format");
    }

    // Validate name
    if (!this.props.firstName || this.props.firstName.trim().length < 2) {
      throw new Error("First name must be at least 2 characters long");
    }

    if (!this.props.lastName || this.props.lastName.trim().length < 2) {
      throw new Error("Last name must be at least 2 characters long");
    }

    // Validate phone if provided
    if (this.props.phone) {
      const phoneRegex = /^\+?[\d\s\-()]+$/;
      if (!phoneRegex.test(this.props.phone)) {
        throw new Error("Invalid phone format");
      }
    }
  }

  // Getters
  get id(): string | undefined {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get fullName(): string {
    return (
      this.props.fullName || `${this.props.firstName} ${this.props.lastName}`
    );
  }

  get phone(): string | undefined {
    return this.props.phone;
  }

  get avatar(): string | undefined {
    return this.props.avatar;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get lastLoginAt(): Date | undefined {
    return this.props.lastLoginAt;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  get bio(): string | undefined {
    return this.props.bio;
  }

  get city(): string | undefined {
    return this.props.city;
  }

  updateLastLogin(): void {
    this.props.lastLoginAt = new Date();
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  updateAvatar(newAvatar: string): void {
    this.props.avatar = newAvatar;
  }

  updateProfile(data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    avatar_url?: string;
  }): void {
    if (data.first_name) {
      if (data.first_name.trim().length < 2) {
        throw new Error("First name must be at least 2 characters long");
      }
      this.props.firstName = data.first_name;
    }

    if (data.last_name) {
      if (data.last_name.trim().length < 2) {
        throw new Error("Last name must be at least 2 characters long");
      }
      this.props.lastName = data.last_name;
    }

    if (data.phone !== undefined) {
      if (data.phone && !/^\+?[\d\s\-()]+$/.test(data.phone)) {
        throw new Error("Invalid phone format");
      }
      this.props.phone = data.phone;
    }

    if (data.avatar_url !== undefined) {
      this.props.avatar = data.avatar_url;
    }

    this.props.updatedAt = new Date();
  }

  changeRole(newRole: UserRole): void {
    this.props.role = newRole;
    this.props.updatedAt = new Date();
  }

  isAdmin(): boolean {
    return this.props.isAdmin === true;
  }

  isModerator(): boolean {
    return this.props.role === UserRole.MODERATOR;
  }

  toJSON(): UserProps {
    return {
      ...this.props,
      fullName: this.fullName,
    };
  }

  // Return user data without sensitive information
  toPublicJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      phone: this.phone,
      avatar: this.avatar,
      role: this.role,
      isActive: this.isActive,
      lastLoginAt: this.lastLoginAt?.toISOString(),
      createdAt: this.createdAt?.toISOString(),
      updatedAt: this.updatedAt?.toISOString(),
    };
  }
}
