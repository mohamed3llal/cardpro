export class SocialLinks {
  constructor(
    public readonly whatsapp?: string,
    public readonly linkedin?: string,
    public readonly twitter?: string,
    public readonly instagram?: string,
    public readonly facebook?: string
  ) {
    this.validate();
  }

  private validate(): void {
    const urlRegex = /^https?:\/\/.+/;

    if (this.linkedin && !urlRegex.test(this.linkedin)) {
      throw new Error("Invalid LinkedIn URL format");
    }
    if (this.twitter && !urlRegex.test(this.twitter)) {
      throw new Error("Invalid Twitter URL format");
    }
    if (this.instagram && !urlRegex.test(this.instagram)) {
      throw new Error("Invalid Instagram URL format");
    }
    if (this.facebook && !urlRegex.test(this.facebook)) {
      throw new Error("Invalid Facebook URL format");
    }
  }
}
