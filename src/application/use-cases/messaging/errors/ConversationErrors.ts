export class ConversationNotFoundError extends Error {
  constructor(conversationId: string) {
    super(`Conversation with ID ${conversationId} not found`);
    this.name = "ConversationNotFoundError";
  }
}

export class UnauthorizedAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedAccessError";
  }
}

export class InvalidConversationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidConversationError";
  }
}

export class MessageErrors {
  static InvalidContent = class extends Error {
    constructor(message: string) {
      super(message);
      this.name = "InvalidMessageContent";
    }
  };

  static RateLimitExceeded = class extends Error {
    constructor() {
      super("Too many messages. Please wait a moment.");
      this.name = "RateLimitExceeded";
    }
  };
}
