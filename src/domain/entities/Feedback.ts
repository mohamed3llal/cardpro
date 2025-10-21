// src/domain/entities/Feedback.ts

export interface FeedbackProps {
  id?: string;
  card_id: string;
  user_id: string;
  feedback_type: "general" | "bug" | "feature" | "improvement" | "question";
  subject: string;
  message: string;
  email?: string;
  rating?: number;
  status: "pending" | "reviewed" | "resolved";
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export class Feedback {
  private readonly props: FeedbackProps;

  constructor(props: FeedbackProps) {
    this.validateFeedback(props);
    this.props = {
      ...props,
      status: props.status || "pending",
      created_at: props.created_at || new Date(),
      updated_at: props.updated_at || new Date(),
    };
  }

  private validateFeedback(props: FeedbackProps): void {
    if (!props.card_id || props.card_id.trim() === "") {
      throw new Error("Card ID is required");
    }

    if (!props.user_id || props.user_id.trim() === "") {
      throw new Error("User ID is required");
    }

    if (!props.feedback_type) {
      throw new Error("Feedback type is required");
    }

    const validTypes = ["general", "bug", "feature", "improvement", "question"];
    if (!validTypes.includes(props.feedback_type)) {
      throw new Error(
        `Invalid feedback type. Must be one of: ${validTypes.join(", ")}`
      );
    }

    if (
      !props.subject ||
      props.subject.trim().length < 3 ||
      props.subject.trim().length > 100
    ) {
      throw new Error("Subject must be between 3 and 100 characters");
    }

    if (
      !props.message ||
      props.message.trim().length < 10 ||
      props.message.trim().length > 1000
    ) {
      throw new Error("Message must be between 10 and 1000 characters");
    }

    if (props.email && !this.isValidEmail(props.email)) {
      throw new Error("Invalid email format");
    }

    if (props.rating !== undefined && (props.rating < 1 || props.rating > 5)) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Validate MongoDB ObjectId format
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(props.card_id)) {
      throw new Error("Invalid card ID format");
    }

    if (!objectIdRegex.test(props.user_id)) {
      throw new Error("Invalid user ID format");
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Getters
  get id(): string | undefined {
    return this.props.id;
  }

  get cardId(): string {
    return this.props.card_id;
  }

  get userId(): string {
    return this.props.user_id;
  }

  get feedbackType(): string {
    return this.props.feedback_type;
  }

  get subject(): string {
    return this.props.subject;
  }

  get message(): string {
    return this.props.message;
  }

  get email(): string | undefined {
    return this.props.email;
  }

  get rating(): number | undefined {
    return this.props.rating;
  }

  get status(): string {
    return this.props.status;
  }

  get adminNotes(): string | undefined {
    return this.props.admin_notes;
  }

  get reviewedBy(): string | undefined {
    return this.props.reviewed_by;
  }

  get reviewedAt(): Date | undefined {
    return this.props.reviewed_at;
  }

  get createdAt(): Date | undefined {
    return this.props.created_at;
  }

  get updatedAt(): Date | undefined {
    return this.props.updated_at;
  }

  // Business methods
  updateStatus(
    status: "pending" | "reviewed" | "resolved",
    adminId: string,
    notes?: string
  ): void {
    const validStatuses = ["pending", "reviewed", "resolved"];
    if (!validStatuses.includes(status)) {
      throw new Error(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    this.props.status = status;
    this.props.reviewed_by = adminId;
    this.props.reviewed_at = new Date();
    if (notes) {
      this.props.admin_notes = notes;
    }
    this.props.updated_at = new Date();
  }

  // Serialization
  toJSON(): FeedbackProps {
    return { ...this.props };
  }

  // Factory method
  static create(props: FeedbackProps): Feedback {
    return new Feedback(props);
  }

  // Create from persistence
  static fromPersistence(data: any): Feedback {
    return new Feedback({
      id: data._id?.toString(),
      card_id: data.card_id,
      user_id: data.user_id,
      feedback_type: data.feedback_type,
      subject: data.subject,
      message: data.message,
      email: data.email,
      rating: data.rating,
      status: data.status,
      admin_notes: data.admin_notes,
      reviewed_by: data.reviewed_by,
      reviewed_at: data.reviewed_at,
      created_at: data.created_at,
      updated_at: data.updated_at,
    });
  }
}
