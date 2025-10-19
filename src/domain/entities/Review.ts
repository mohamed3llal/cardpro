export interface ReviewProps {
  id?: string;
  business_id: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  rating: number;
  title: string;
  comment: string;
  helpful_count?: number;
  verified_purchase?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class Review {
  private readonly props: ReviewProps;

  constructor(props: ReviewProps) {
    this.validateReview(props);
    this.props = {
      ...props,
      helpful_count: props.helpful_count || 0,
      verified_purchase: props.verified_purchase || false,
      created_at: props.created_at || new Date(),
      updated_at: props.updated_at || new Date(),
    };
  }

  private validateReview(props: ReviewProps): void {
    if (!props.business_id || props.business_id.trim() === "") {
      throw new Error("Business ID is required");
    }

    if (!props.user_id || props.user_id.trim() === "") {
      throw new Error("User ID is required");
    }

    if (!props.rating || props.rating < 1 || props.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    if (
      !props.title ||
      props.title.trim().length < 3 ||
      props.title.trim().length > 100
    ) {
      throw new Error("Title must be between 3 and 100 characters");
    }

    if (
      !props.comment ||
      props.comment.trim().length < 10 ||
      props.comment.trim().length > 2000
    ) {
      throw new Error("Comment must be between 10 and 2000 characters");
    }

    // Validate MongoDB ObjectId format
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(props.business_id)) {
      throw new Error("Invalid business ID format");
    }

    if (!objectIdRegex.test(props.user_id)) {
      throw new Error("Invalid user ID format");
    }
  }

  // Getters
  get id(): string | undefined {
    return this.props.id;
  }

  get businessId(): string {
    return this.props.business_id;
  }

  get userId(): string {
    return this.props.user_id;
  }

  get userName(): string | undefined {
    return this.props.user_name;
  }

  get userAvatar(): string | undefined {
    return this.props.user_avatar;
  }

  get rating(): number {
    return this.props.rating;
  }

  get title(): string {
    return this.props.title;
  }

  get comment(): string {
    return this.props.comment;
  }

  get helpfulCount(): number {
    return this.props.helpful_count || 0;
  }

  get verifiedPurchase(): boolean {
    return this.props.verified_purchase || false;
  }

  get createdAt(): Date | undefined {
    return this.props.created_at;
  }

  get updatedAt(): Date | undefined {
    return this.props.updated_at;
  }

  // Business methods
  public update(updates: Partial<ReviewProps>): void {
    const { rating, title, comment } = updates;

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }
      this.props.rating = rating;
    }

    if (title !== undefined) {
      if (title.trim().length < 3 || title.trim().length > 100) {
        throw new Error("Title must be between 3 and 100 characters");
      }
      this.props.title = title.trim();
    }

    if (comment !== undefined) {
      if (comment.trim().length < 10 || comment.trim().length > 2000) {
        throw new Error("Comment must be between 10 and 2000 characters");
      }
      this.props.comment = comment.trim();
    }

    this.props.updated_at = new Date();
  }

  public incrementHelpfulCount(): void {
    this.props.helpful_count = (this.props.helpful_count || 0) + 1;
  }

  public decrementHelpfulCount(): void {
    this.props.helpful_count = Math.max(0, (this.props.helpful_count || 0) - 1);
  }

  // Serialization
  public toJSON(): ReviewProps {
    return { ...this.props };
  }

  // Factory method
  public static create(props: ReviewProps): Review {
    return new Review(props);
  }

  // Create from persistence
  public static fromPersistence(data: any): Review {
    return new Review({
      id: data._id?.toString(),
      business_id: data.business_id,
      user_id: data.user_id,
      user_name: data.user_name,
      user_avatar: data.user_avatar,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      helpful_count: data.helpful_count,
      verified_purchase: data.verified_purchase,
      created_at: data.created_at,
      updated_at: data.updated_at,
    });
  }
}
