export class MessageContent {
  private readonly value: string;

  constructor(content: string) {
    this.value = this.sanitize(content);
    this.validate();
  }

  private sanitize(content: string): string {
    let sanitized = content.replace(/<script[^>]*>.*?<\/script>/gi, "");
    sanitized = sanitized.replace(/javascript:/gi, "");
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
    return sanitized.trim();
  }

  private validate(): void {
    if (this.value.length === 0) {
      throw new Error("Message cannot be empty after sanitization");
    }
    if (this.value.length > 2000) {
      throw new Error("Message exceeds maximum length");
    }
  }

  getValue(): string {
    return this.value;
  }
}
