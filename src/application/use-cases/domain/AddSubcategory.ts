// src/application/use-cases/domain/AddSubcategory.ts

import { IDomainRepository } from "../../../domain/interfaces/IDomainRepository";
import { Subcategory } from "../../../domain/entities/Domain";
import { DomainNotFoundError } from "./GetDomainByKey";
import { DomainValidationError } from "./CreateDomain";

export class DuplicateSubcategoryKeyError extends Error {
  constructor(key: string) {
    super(`Subcategory with key '${key}' already exists`);
    this.name = "DuplicateSubcategoryKeyError";
  }
}

export interface AddSubcategoryDTO {
  key: string;
  ar: string;
  fr: string;
  en: string;
  keywords: {
    ar: string[];
    fr: string[];
    en: string[];
  };
}

export class AddSubcategory {
  constructor(private readonly domainRepository: IDomainRepository) {}

  async execute(
    domainKey: string,
    dto: AddSubcategoryDTO
  ): Promise<Subcategory> {
    const normalizedDomainKey = domainKey.toLowerCase();
    const normalizedSubcategoryKey = dto.key.toLowerCase();

    // Check if parent domain exists
    const domain = await this.domainRepository.findByKey(normalizedDomainKey);
    if (!domain) {
      throw new DomainNotFoundError(normalizedDomainKey);
    }

    // Validate subcategory
    const errors: string[] = [];

    if (
      !normalizedSubcategoryKey ||
      !/^[a-z_]+$/.test(normalizedSubcategoryKey)
    ) {
      errors.push("Subcategory key must be lowercase with underscores only");
    }

    if (!dto.ar || !dto.fr || !dto.en) {
      errors.push("All language translations (ar, fr, en) are required");
    }

    if (
      !dto.keywords?.ar?.length ||
      !dto.keywords?.fr?.length ||
      !dto.keywords?.en?.length
    ) {
      errors.push("Keywords for all languages (ar, fr, en) are required");
    }

    if (errors.length > 0) {
      throw new DomainValidationError(
        "Invalid subcategory data",
        errors.map((err) => ({ field: "subcategory", message: err }))
      );
    }

    // Check if subcategory key already exists
    const existingSubcategory = domain.subcategories?.find(
      (sub) => sub.key === normalizedSubcategoryKey
    );

    if (existingSubcategory) {
      throw new DuplicateSubcategoryKeyError(normalizedSubcategoryKey);
    }

    // Create new subcategory
    const newSubcategory: Subcategory = {
      key: normalizedSubcategoryKey,
      category_key: normalizedDomainKey,
      ar: dto.ar,
      fr: dto.fr,
      en: dto.en,
      keywords: dto.keywords,
    };

    // Add subcategory to domain
    const updatedSubcategories = [
      ...(domain.subcategories || []),
      newSubcategory,
    ];

    // Update domain with new subcategory
    const updated = await this.domainRepository.update(normalizedDomainKey, {
      subcategories: updatedSubcategories,
    });

    if (!updated) {
      throw new DomainNotFoundError(normalizedDomainKey);
    }

    return newSubcategory;
  }
}
