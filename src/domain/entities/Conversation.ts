export interface ConversationProps {
  id?: string;
  business_id: string;
  business_name: string;
  business_avatar?: string;
  business_owner_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  last_message?: string;
  last_message_at?: Date;
  unread_count: number;
  created_at?: Date;
  updated_at?: Date;
}

export class Conversation {
  constructor(
    public readonly id: string,
    public readonly businessId: string,
    public readonly businessName: string,
    public readonly businessOwnerId: string,
    public readonly userId: string,
    public readonly userName: string,
    public lastMessage: string | null,
    public lastMessageAt: Date | null,
    public unreadCount: number,
    public readonly businessAvatar?: string,
    public readonly userAvatar?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  static create(props: ConversationProps): Conversation {
    return new Conversation(
      props.id || "",
      props.business_id,
      props.business_name,
      props.business_owner_id,
      props.user_id,
      props.user_name,
      props.last_message || null,
      props.last_message_at || null,
      props.unread_count,
      props.business_avatar,
      props.user_avatar,
      props.created_at || new Date(),
      props.updated_at || new Date()
    );
  }

  updateLastMessage(content: string, timestamp: Date): void {
    this.lastMessage = content;
    this.lastMessageAt = timestamp;
  }

  incrementUnreadCount(): void {
    this.unreadCount++;
  }

  resetUnreadCount(): void {
    this.unreadCount = 0;
  }

  toJSON(): any {
    return {
      id: this.id,
      business_id: this.businessId,
      business_name: this.businessName,
      business_avatar: this.businessAvatar,
      business_owner_id: this.businessOwnerId,
      user_id: this.userId,
      user_name: this.userName,
      user_avatar: this.userAvatar,
      last_message: this.lastMessage,
      last_message_at: this.lastMessageAt && this.lastMessageAt?.toISOString(),
      unread_count: this.unreadCount,
      created_at: this.createdAt?.toISOString(),
      updated_at: this.updatedAt?.toISOString(),
    };
  }
}
