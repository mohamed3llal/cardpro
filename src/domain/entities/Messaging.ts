export interface Conversation {
  id: string;
  business_id: string;
  participant_id: string;
  unread_count: number;
  is_archived: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: string;
  attachments: any[];
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  mute_until?: Date;
}
