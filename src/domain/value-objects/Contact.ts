export class Contact {
  constructor(
    public readonly mobile_phones: string[],
    public readonly email: string,
    public readonly website: string = "",
    public readonly landline_phones: string[] = [],
    public readonly fax_numbers: string[] = []
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.email) {
      throw new Error("Email is required");
    }
    if (!this.isValidEmail(this.email)) {
      throw new Error("Invalid email format");
    }
    if (this.mobile_phones.length === 0) {
      throw new Error("At least one mobile phone is required");
    }

    // Validate phone numbers format (optional - basic validation)
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    const allPhones = [
      ...this.mobile_phones,
      ...this.landline_phones,
      ...this.fax_numbers,
    ];

    for (const phone of allPhones) {
      if (phone && !phoneRegex.test(phone)) {
        throw new Error(`Invalid phone format: ${phone}`);
      }
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
