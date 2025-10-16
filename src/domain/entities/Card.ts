// src/domain/entities/Card.ts

export interface Location {
  lat: number;
  lng: number;
  distance?: number; // ✅ Added for search results
}

export interface SocialLinks {
  whatsapp?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
}

export interface CardProps {
  _id?: string;
  user_id: string;
  title: string;
  company?: string;
  logo?: string;
  domain_key: string;
  subdomain_key?: string;
  description?: string;
  mobile_phones?: string[];
  landline_phones?: string[];
  fax_numbers?: string[];
  email?: string;
  website?: string;
  address?: string;
  work_hours?: string;
  languages?: string[];
  tags?: string[];
  social_links?: SocialLinks;
  location?: Location;
  is_public?: boolean;
  scans?: number;
  views?: number;
  rating?: {
    average: number;
    count: number;
  };
  user?: {
    firstName: string;
    lastName: string;
    avatar?: string;
    email: string;
    domainVerified: boolean;
    domainKey: string;
    subcategoryKey: string;
  };
  created_at?: Date;
  updated_at?: Date;
}

export class Card {
  private readonly props: CardProps;

  constructor(props: CardProps) {
    this.validateCard(props);
    this.props = {
      ...props,
      mobile_phones: props.mobile_phones || [],
      landline_phones: props.landline_phones || [],
      fax_numbers: props.fax_numbers || [],
      languages: props.languages || [],
      tags: props.tags || [],
      is_public: props.is_public !== undefined ? props.is_public : true,
      scans: props.scans || 0,
      views: props.views || 0,
      created_at: props.created_at || new Date(),
      updated_at: props.updated_at || new Date(),
    };
  }

  private validateCard(props: CardProps): void {
    if (!props.title || props.title.trim().length === 0) {
      throw new Error("Title is required");
    }

    if (!props.user_id) {
      throw new Error("User ID is required");
    }

    if (!props.domain_key) {
      throw new Error("Domain key is required");
    }

    if (props.email && !this.isValidEmail(props.email)) {
      throw new Error("Invalid email format");
    }

    if (props.website && !this.isValidUrl(props.website)) {
      throw new Error("Invalid website URL");
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Getters
  get id(): string | undefined {
    return this.props._id;
  }

  get userId(): string {
    return this.props.user_id;
  }

  get title(): string {
    return this.props.title;
  }

  get company(): string | undefined {
    return this.props.company;
  }

  get domainKey(): string {
    return this.props.domain_key;
  }

  get subdomainKey(): string | undefined {
    return this.props.subdomain_key;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get isPublic(): boolean {
    return this.props.is_public || true;
  }

  get scans(): number {
    return this.props.scans || 0;
  }

  get views(): number {
    return this.props.views || 0;
  }

  // Business methods
  public toggleVisibility(): void {
    this.props.is_public = !this.props.is_public;
    this.props.updated_at = new Date();
  }

  public incrementViews(): void {
    this.props.views = (this.props.views || 0) + 1;
    this.props.updated_at = new Date();
  }

  public incrementScans(): void {
    this.props.scans = (this.props.scans || 0) + 1;
    this.props.updated_at = new Date();
  }

  public update(updates: Partial<CardProps>): void {
    this.validateCard({ ...this.props, ...updates });
    Object.assign(this.props, updates);
    this.props.updated_at = new Date();
  }

  public toJSON(): CardProps {
    return { ...this.props };
  }

  public static create(props: CardProps): Card {
    return new Card(props);
  }
}
