export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  MODERATOR = "moderator",
  SUPER_ADMIN = "super_admin",
}

export enum VerificationStatus {
  NONE = "none",
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

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
  isAdmin: boolean;
  lastLoginAt?: Date;

  // Domain verification fields
  domainKey?: string;
  subcategoryKey?: string;
  domainDocumentUrl?: string;
  verificationStatus: VerificationStatus;
  domainVerified: boolean;
  verificationNotes?: string;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private props: UserProps;

  constructor(props: UserProps) {
    this.props = {
      ...props,
      isActive: props.isActive ?? true,
      isAdmin: props.isAdmin ?? false,
      verificationStatus: props.verificationStatus ?? VerificationStatus.NONE,
      domainVerified: props.domainVerified ?? false,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
    this.validate();
  }

  private validate(): void {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.props.email)) {
      throw new Error("Invalid email format");
    }

    // Name validation
    if (!this.props.firstName || this.props.firstName.trim().length < 2) {
      throw new Error("First name must be at least 2 characters long");
    }

    if (!this.props.lastName || this.props.lastName.trim().length < 2) {
      throw new Error("Last name must be at least 2 characters long");
    }

    // Phone validation if provided
    if (this.props.phone) {
      const phoneRegex = /^\+?[\d\s\-()]+$/;
      if (!phoneRegex.test(this.props.phone)) {
        throw new Error("Invalid phone format");
      }
    }

    // Domain verification validation
    if (this.props.domainKey && !this.props.subcategoryKey) {
      throw new Error("Subcategory is required when domain is set");
    }

    if (this.props.subcategoryKey && !this.props.domainKey) {
      throw new Error("Domain is required when subcategory is set");
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
    return `${this.props.firstName} ${this.props.lastName}`;
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

  get isAdmin(): boolean {
    return (
      this.props.isAdmin ||
      this.props.role === UserRole.ADMIN ||
      this.props.role === UserRole.SUPER_ADMIN
    );
  }

  get isSuperAdmin(): boolean {
    return this.props.role === UserRole.SUPER_ADMIN;
  }

  get isModerator(): boolean {
    return this.props.role === UserRole.MODERATOR;
  }

  get lastLoginAt(): Date | undefined {
    return this.props.lastLoginAt;
  }

  get bio(): string | undefined {
    return this.props.bio;
  }

  get city(): string | undefined {
    return this.props.city;
  }

  get domainKey(): string | undefined {
    return this.props.domainKey;
  }

  get subcategoryKey(): string | undefined {
    return this.props.subcategoryKey;
  }

  get domainDocumentUrl(): string | undefined {
    return this.props.domainDocumentUrl;
  }

  get verificationStatus(): VerificationStatus {
    return this.props.verificationStatus;
  }

  get domainVerified(): boolean {
    return this.props.domainVerified;
  }

  get verificationNotes(): string | undefined {
    return this.props.verificationNotes;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  // Business methods
  updateLastLogin(): void {
    this.props.lastLoginAt = new Date();
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  changeRole(newRole: UserRole): void {
    this.props.role = newRole;
    this.props.isAdmin =
      newRole === UserRole.ADMIN || newRole === UserRole.SUPER_ADMIN;
    this.props.updatedAt = new Date();
  }

  updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
    bio?: string;
    city?: string;
  }): void {
    if (data.firstName !== undefined) {
      if (data.firstName.trim().length < 2) {
        throw new Error("First name must be at least 2 characters long");
      }
      this.props.firstName = data.firstName.trim();
    }

    if (data.lastName !== undefined) {
      if (data.lastName.trim().length < 2) {
        throw new Error("Last name must be at least 2 characters long");
      }
      this.props.lastName = data.lastName.trim();
    }

    if (data.phone !== undefined) {
      if (data.phone && !/^\+?[\d\s\-()]+$/.test(data.phone)) {
        throw new Error("Invalid phone format");
      }
      this.props.phone = data.phone || undefined;
    }

    if (data.avatar !== undefined) {
      this.props.avatar = data.avatar || undefined;
    }

    if (data.bio !== undefined) {
      this.props.bio = data.bio || undefined;
    }

    if (data.city !== undefined) {
      this.props.city = data.city || undefined;
    }

    this.props.updatedAt = new Date();
  }

  setDomainInfo(domainKey: string, subcategoryKey: string): void {
    if (!domainKey || !subcategoryKey) {
      throw new Error("Both domain and subcategory are required");
    }

    this.props.domainKey = domainKey;
    this.props.subcategoryKey = subcategoryKey;
    this.props.updatedAt = new Date();
  }

  submitVerification(documentUrl: string): void {
    if (!this.props.domainKey || !this.props.subcategoryKey) {
      throw new Error(
        "Domain and subcategory must be set before submitting verification"
      );
    }

    if (!documentUrl || !documentUrl.includes("cloudinary.com")) {
      throw new Error("Valid document URL is required");
    }

    if (this.props.verificationStatus === VerificationStatus.PENDING) {
      throw new Error("Verification already pending");
    }

    if (
      this.props.verificationStatus === VerificationStatus.APPROVED &&
      this.props.domainVerified
    ) {
      throw new Error("Domain already verified");
    }

    this.props.domainDocumentUrl = documentUrl;
    this.props.verificationStatus = VerificationStatus.PENDING;
    this.props.domainVerified = false;
    this.props.verificationNotes = undefined;
    this.props.updatedAt = new Date();
  }

  approveVerification(notes?: string): void {
    if (this.props.verificationStatus !== VerificationStatus.PENDING) {
      throw new Error("No pending verification to approve");
    }

    this.props.verificationStatus = VerificationStatus.APPROVED;
    this.props.domainVerified = true;
    this.props.verificationNotes = notes || "Verification approved";
    this.props.updatedAt = new Date();
  }

  rejectVerification(notes: string): void {
    if (!notes || notes.trim().length === 0) {
      throw new Error("Rejection notes are required");
    }

    if (this.props.verificationStatus !== VerificationStatus.PENDING) {
      throw new Error("No pending verification to reject");
    }

    this.props.verificationStatus = VerificationStatus.REJECTED;
    this.props.domainVerified = false;
    this.props.verificationNotes = notes;
    this.props.updatedAt = new Date();
  }

  canSubmitVerification(): boolean {
    return (
      !!this.props.domainKey &&
      !!this.props.subcategoryKey &&
      this.props.verificationStatus !== VerificationStatus.PENDING &&
      !(
        this.props.verificationStatus === VerificationStatus.APPROVED &&
        this.props.domainVerified
      )
    );
  }

  hasPendingVerification(): boolean {
    return this.props.verificationStatus === VerificationStatus.PENDING;
  }

  isVerified(): boolean {
    return (
      this.props.verificationStatus === VerificationStatus.APPROVED &&
      this.props.domainVerified
    );
  }

  // Serialization
  toJSON(): UserProps {
    return { ...this.props };
  }

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
      bio: this.bio,
      city: this.city,
      isActive: this.isActive,
      domainKey: this.domainKey,
      subcategoryKey: this.subcategoryKey,
      verificationStatus: this.verificationStatus,
      domainVerified: this.domainVerified,
      lastLoginAt: this.lastLoginAt?.toISOString(),
      createdAt: this.createdAt?.toISOString(),
      updatedAt: this.updatedAt?.toISOString(),
    };
  }

  toAdminJSON() {
    return {
      ...this.toPublicJSON(),
      isAdmin: this.isAdmin,
      domainDocumentUrl: this.domainDocumentUrl,
      verificationNotes: this.verificationNotes,
    };
  }

  // Factory method
  static create(props: UserProps): User {
    return new User(props);
  }

  static fromPersistence(data: any): User {
    return new User({
      id: data._id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      avatar: data.avatar,
      role: data.role as UserRole,
      bio: data.bio,
      city: data.city,
      isActive: data.isActive,
      isAdmin: data.isAdmin,
      lastLoginAt: data.lastLoginAt,
      domainKey: data.domainKey,
      subcategoryKey: data.subcategoryKey,
      domainDocumentUrl: data.domainDocumentUrl,
      verificationStatus:
        (data.verificationStatus as VerificationStatus) ||
        VerificationStatus.NONE,
      domainVerified: data.domainVerified || false,
      verificationNotes: data.verificationNotes,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
