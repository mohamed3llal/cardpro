export interface MessageProps {
  id?: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  read: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class Message {
  constructor(
    public readonly id: string,
    public readonly conversationId: string,
    public readonly senderId: string,
    public readonly senderName: string,
    public readonly content: string,
    public read: boolean,
    public readonly senderAvatar?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.content || this.content.trim().length === 0) {
      throw new Error("Message content cannot be empty");
    }

    if (this.content.trim().length > 2000) {
      throw new Error("Message content cannot exceed 2000 characters");
    }

    // Prevent XSS
    if (this.containsScriptTag(this.content)) {
      throw new Error("Message content contains forbidden elements");
    }
  }

  private containsScriptTag(content: string): boolean {
    const scriptRegex = /<script[^>]*>.*?<\/script>/gi;
    return scriptRegex.test(content);
  }

  static create(props: MessageProps): Message {
    return new Message(
      props.id || "",
      props.conversation_id,
      props.sender_id,
      props.sender_name,
      props.content.trim(),
      props.read || false,
      props.sender_avatar,
      props.created_at || new Date(),
      props.updated_at
    );
  }

  markAsRead(): void {
    this.read = true;
  }

  toJSON(): any {
    return {
      id: this.id,
      conversation_id: this.conversationId,
      sender_id: this.senderId,
      sender_name: this.senderName,
      sender_avatar: this.senderAvatar,
      content: this.content,
      read: this.read,
      created_at: this.createdAt?.toISOString(),
      updated_at: this.updatedAt?.toISOString(),
    };
  }
}
