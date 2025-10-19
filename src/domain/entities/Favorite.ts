export interface FavoriteProps {
  id?: string;
  user_id: string;
  business_id: string;
  created_at?: Date;
}

export class Favorite {
  private readonly props: FavoriteProps;

  constructor(props: FavoriteProps) {
    this.validateFavorite(props);
    this.props = {
      ...props,
      created_at: props.created_at || new Date(),
    };
  }

  private validateFavorite(props: FavoriteProps): void {
    if (!props.user_id || props.user_id.trim() === "") {
      throw new Error("User ID is required");
    }

    if (!props.business_id || props.business_id.trim() === "") {
      throw new Error("Business ID is required");
    }

    // Validate MongoDB ObjectId format (24 hex characters)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;

    if (!objectIdRegex.test(props.user_id)) {
      throw new Error("Invalid user ID format");
    }

    if (!objectIdRegex.test(props.business_id)) {
      throw new Error("Invalid business ID format");
    }
  }

  // Getters
  get id(): string | undefined {
    return this.props.id;
  }

  get userId(): string {
    return this.props.user_id;
  }

  get businessId(): string {
    return this.props.business_id;
  }

  get createdAt(): Date | undefined {
    return this.props.created_at;
  }

  // Serialization
  public toJSON(): FavoriteProps {
    return { ...this.props };
  }

  // Factory method
  public static create(props: FavoriteProps): Favorite {
    return new Favorite(props);
  }

  // Create from persistence
  public static fromPersistence(data: any): Favorite {
    return new Favorite({
      id: data._id?.toString(),
      user_id: data.user_id,
      business_id: data.business_id,
      created_at: data.created_at,
    });
  }
}
