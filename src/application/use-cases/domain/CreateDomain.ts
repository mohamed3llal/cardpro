import { IDomainRepository } from "../../../domain/interfaces/IDomainRepository";
import { DomainEntity, Domain } from "../../../domain/entities/Domain";

export class DomainValidationError extends Error {
  constructor(
    message: string,
    public readonly details: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = "DomainValidationError";
  }
}

export class DuplicateDomainKeyError extends Error {
  constructor(key: string) {
    super(`Domain with key '${key}' already exists`);
    this.name = "DuplicateDomainKeyError";
  }
}

export interface CreateDomainDTO {
  key: string;
  ar: string;
  fr: string;
  en: string;
  keywords: {
    ar: string[];
    fr: string[];
    en: string[];
  };
  subcategories?: Array<{
    key: string;
    ar: string;
    fr: string;
    en: string;
    keywords: {
      ar: string[];
      fr: string[];
      en: string[];
    };
  }>;
}

export class CreateDomain {
  constructor(private readonly domainRepository: IDomainRepository) {}

  async execute(dto: CreateDomainDTO): Promise<DomainEntity> {
    // Normalize key to lowercase
    const normalizedKey = dto.key.toLowerCase();

    // Create domain entity
    const domain = DomainEntity.create({
      key: normalizedKey,
      ar: dto.ar,
      fr: dto.fr,
      en: dto.en,
      keywords: dto.keywords,
      subcategories:
        dto.subcategories?.map((sub) => ({
          ...sub,
          category_key: dto.key, // Add category_key here
        })) || [],
    });

    // Validate domain
    const errors = domain.validate();
    if (errors.length > 0) {
      throw new DomainValidationError(
        "Invalid domain data",
        errors.map((err) => ({ field: "domain", message: err }))
      );
    }

    // Check if domain key already exists
    const exists = await this.domainRepository.existsByKey(normalizedKey);
    if (exists) {
      throw new DuplicateDomainKeyError(normalizedKey);
    }

    // Create domain
    try {
      const created = await this.domainRepository.create(domain);
      return created;
    } catch (error) {
      // Handle MongoDB duplicate key error
      if (error instanceof Error && error.message.includes("duplicate key")) {
        throw new DuplicateDomainKeyError(normalizedKey);
      }
      throw error;
    }
  }
}
