// src/domain/entities/Domain.ts

export interface Subcategory {
  key: string;
  category_key: string;
  ar: string;
  fr: string;
  en: string;
  keywords: {
    ar: string[];
    fr: string[];
    en: string[];
  };
}

export interface Domain {
  key: string;
  ar: string;
  fr: string;
  en: string;
  keywords: {
    ar: string[];
    fr: string[];
    en: string[];
  };
  subcategories?: Subcategory[];
  created_at?: Date;
  updated_at?: Date;
}

export class DomainEntity {
  constructor(
    public readonly key: string,
    public readonly ar: string,
    public readonly fr: string,
    public readonly en: string,
    public readonly keywords: {
      ar: string[];
      fr: string[];
      en: string[];
    },
    public readonly subcategories: Subcategory[] = [],
    public readonly created_at?: Date,
    public readonly updated_at?: Date
  ) {}

  static create(data: Omit<Domain, "created_at" | "updated_at">): DomainEntity {
    return new DomainEntity(
      data.key,
      data.ar,
      data.fr,
      data.en,
      data.keywords,
      data.subcategories || [],
      new Date(),
      new Date()
    );
  }

  validate(): string[] {
    const errors: string[] = [];

    if (!this.key || !/^[a-z_]+$/.test(this.key)) {
      errors.push("Domain key must be lowercase with underscores only");
    }

    if (!this.ar || !this.fr || !this.en) {
      errors.push("All language translations (ar, fr, en) are required");
    }

    if (
      !this.keywords.ar?.length ||
      !this.keywords.fr?.length ||
      !this.keywords.en?.length
    ) {
      errors.push("Keywords for all languages (ar, fr, en) are required");
    }

    // Validate subcategories
    if (this.subcategories && this.subcategories.length > 0) {
      const subcategoryKeys = new Set<string>();

      this.subcategories.forEach((sub, index) => {
        if (!sub.key || !/^[a-z_]+$/.test(sub.key)) {
          errors.push(
            `Subcategory ${
              index + 1
            }: key must be lowercase with underscores only`
          );
        }

        if (subcategoryKeys.has(sub.key)) {
          errors.push(`Duplicate subcategory key: ${sub.key}`);
        }
        subcategoryKeys.add(sub.key);

        if (!sub.ar || !sub.fr || !sub.en) {
          errors.push(
            `Subcategory ${sub.key}: all language translations are required`
          );
        }

        if (
          !sub.keywords?.ar?.length ||
          !sub.keywords?.fr?.length ||
          !sub.keywords?.en?.length
        ) {
          errors.push(
            `Subcategory ${sub.key}: keywords for all languages are required`
          );
        }
      });
    }

    return errors;
  }

  withSubcategories(subcategories: Subcategory[]): DomainEntity {
    return new DomainEntity(
      this.key,
      this.ar,
      this.fr,
      this.en,
      this.keywords,
      subcategories,
      this.created_at,
      this.updated_at
    );
  }
}
