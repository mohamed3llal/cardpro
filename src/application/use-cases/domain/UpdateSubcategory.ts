// src/application/use-cases/domain/UpdateSubcategory.ts

import { IDomainRepository } from "../../../domain/interfaces/IDomainRepository";
import { Subcategory } from "../../../domain/entities/Domain";
import { DomainNotFoundError } from "./GetDomainByKey";
import { DomainValidationError } from "./CreateDomain";

export class SubcategoryNotFoundError extends Error {
  constructor(subcategoryKey: string, domainKey: string) {
    super(`Subcategory '${subcategoryKey}' not found in domain '${domainKey}'`);
    this.name = "SubcategoryNotFoundError";
  }
}

export interface UpdateSubcategoryDTO {
  ar?: string;
  fr?: string;
  en?: string;
  keywords?: {
    ar?: string[];
    fr?: string[];
    en?: string[];
  };
}

export class UpdateSubcategory {
  constructor(private readonly domainRepository: IDomainRepository) {}

  async execute(
    domainKey: string,
    subcategoryKey: string,
    dto: UpdateSubcategoryDTO
  ): Promise<Subcategory> {
    const normalizedDomainKey = domainKey.toLowerCase();
    const normalizedSubcategoryKey = subcategoryKey.toLowerCase();

    // Check if parent domain exists
    const domain = await this.domainRepository.findByKey(normalizedDomainKey);
    if (!domain) {
      throw new DomainNotFoundError(normalizedDomainKey);
    }

    // Find subcategory
    const subcategoryIndex = domain.subcategories?.findIndex(
      (sub) => sub.key === normalizedSubcategoryKey
    );

    if (subcategoryIndex === undefined || subcategoryIndex === -1) {
      throw new SubcategoryNotFoundError(
        normalizedSubcategoryKey,
        normalizedDomainKey
      );
    }

    const existingSubcategory = domain.subcategories![subcategoryIndex];

    // Build updated subcategory
    const updatedSubcategory: Subcategory = {
      key: existingSubcategory.key,
      category_key: normalizedDomainKey,
      ar: dto.ar !== undefined ? dto.ar : existingSubcategory.ar,
      fr: dto.fr !== undefined ? dto.fr : existingSubcategory.fr,
      en: dto.en !== undefined ? dto.en : existingSubcategory.en,
      keywords: {
        ar: dto.keywords?.ar || existingSubcategory.keywords.ar,
        fr: dto.keywords?.fr || existingSubcategory.keywords.fr,
        en: dto.keywords?.en || existingSubcategory.keywords.en,
      },
    };

    // Validate updated subcategory
    const errors: string[] = [];

    if (
      !updatedSubcategory.ar ||
      !updatedSubcategory.fr ||
      !updatedSubcategory.en
    ) {
      errors.push("All language translations (ar, fr, en) are required");
    }

    if (
      !updatedSubcategory.keywords.ar?.length ||
      !updatedSubcategory.keywords.fr?.length ||
      !updatedSubcategory.keywords.en?.length
    ) {
      errors.push("Keywords for all languages (ar, fr, en) are required");
    }

    if (errors.length > 0) {
      throw new DomainValidationError(
        "Invalid subcategory data",
        errors.map((err) => ({ field: "subcategory", message: err }))
      );
    }

    // Update subcategories array
    const updatedSubcategories = [...domain.subcategories!];
    updatedSubcategories[subcategoryIndex] = updatedSubcategory;

    // Update domain with modified subcategories
    await this.domainRepository.update(normalizedDomainKey, {
      subcategories: updatedSubcategories,
    });

    return updatedSubcategory;
  }
}
