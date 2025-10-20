export interface ReportProps {
  id?: string;
  card_id: string;
  user_id: string;
  report_type: "inappropriate" | "incorrect" | "spam" | "copyright" | "other";
  details?: string;
  status: "pending" | "resolved" | "dismissed";
  admin_notes?: string;
  resolved_by?: string;
  resolved_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export class Report {
  private readonly props: ReportProps;

  constructor(props: ReportProps) {
    this.validateReport(props);
    this.props = {
      ...props,
      status: props.status || "pending",
      created_at: props.created_at || new Date(),
      updated_at: props.updated_at || new Date(),
    };
  }

  private validateReport(props: ReportProps): void {
    if (!props.card_id || props.card_id.trim() === "") {
      throw new Error("Card ID is required");
    }

    if (!props.user_id || props.user_id.trim() === "") {
      throw new Error("User ID is required");
    }

    if (!props.report_type) {
      throw new Error("Report type is required");
    }

    const validTypes = [
      "inappropriate",
      "incorrect",
      "spam",
      "copyright",
      "other",
    ];
    if (!validTypes.includes(props.report_type)) {
      throw new Error(
        `Invalid report type. Must be one of: ${validTypes.join(", ")}`
      );
    }

    if (props.details && props.details.length > 500) {
      throw new Error("Details must not exceed 500 characters");
    }

    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(props.card_id)) {
      throw new Error("Invalid card ID format");
    }

    if (!objectIdRegex.test(props.user_id)) {
      throw new Error("Invalid user ID format");
    }
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get cardId(): string {
    return this.props.card_id;
  }

  get userId(): string {
    return this.props.user_id;
  }

  get reportType(): string {
    return this.props.report_type;
  }

  get details(): string | undefined {
    return this.props.details;
  }

  get status(): string {
    return this.props.status;
  }

  get adminNotes(): string | undefined {
    return this.props.admin_notes;
  }

  get resolvedBy(): string | undefined {
    return this.props.resolved_by;
  }

  get resolvedAt(): Date | undefined {
    return this.props.resolved_at;
  }

  updateStatus(
    status: "pending" | "resolved" | "dismissed",
    adminId: string,
    notes?: string
  ): void {
    const validStatuses = ["pending", "resolved", "dismissed"];
    if (!validStatuses.includes(status)) {
      throw new Error(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    this.props.status = status;
    this.props.resolved_by = adminId;
    this.props.resolved_at = new Date();
    if (notes) {
      this.props.admin_notes = notes;
    }
    this.props.updated_at = new Date();
  }

  toJSON(): ReportProps {
    return { ...this.props };
  }

  static create(props: ReportProps): Report {
    return new Report(props);
  }

  static fromPersistence(data: any): Report {
    return new Report({
      id: data._id?.toString(),
      card_id: data.card_id,
      user_id: data.user_id,
      report_type: data.report_type,
      details: data.details,
      status: data.status,
      admin_notes: data.admin_notes,
      resolved_by: data.resolved_by,
      resolved_at: data.resolved_at,
      created_at: data.created_at,
      updated_at: data.updated_at,
    });
  }
}
