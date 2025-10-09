// src/application/use-cases/domain/UpdateDomain.ts

import { IDomainRepository } from "../../../domain/interfaces/IDomainRepository";
import { DomainEntity, Subcategory } from "../../../domain/entities/Domain";
import { DomainNotFoundError } from "./GetDomainByKey";
import { DomainValidationError } from "./CreateDomain";

export interface UpdateDomainDTO {
  ar?: string;
  fr?: string;
  en?: string;
  keywords?: {
    ar?: string[];
    fr?: string[];
    en?: string[];
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

export class UpdateDomain {
  constructor(private readonly domainRepository: IDomainRepository) {}

  async execute(key: string, dto: UpdateDomainDTO): Promise<DomainEntity> {
    const normalizedKey = key.toLowerCase();

    // Check if domain exists
    const existingDomain = await this.domainRepository.findByKey(normalizedKey);
    if (!existingDomain) {
      throw new DomainNotFoundError(normalizedKey);
    }

    // Validate that at least one field is being updated
    if (
      dto.ar === undefined &&
      dto.fr === undefined &&
      dto.en === undefined &&
      dto.keywords === undefined &&
      dto.subcategories === undefined
    ) {
      throw new DomainValidationError(
        "At least one field must be provided for update",
        [{ field: "body", message: "No update data provided" }]
      );
    }

    // Validate subcategories if provided
    if (dto.subcategories) {
      const subcategoryKeys = new Set<string>();
      const errors: string[] = [];

      dto.subcategories.forEach((sub, index) => {
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

      if (errors.length > 0) {
        throw new DomainValidationError(
          "Invalid domain data",
          errors.map((err) => ({ field: "subcategories", message: err }))
        );
      }
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date(),
    };

    if (dto.ar !== undefined) updateData.ar = dto.ar;
    if (dto.fr !== undefined) updateData.fr = dto.fr;
    if (dto.en !== undefined) updateData.en = dto.en;

    if (dto.keywords !== undefined) {
      // Merge with existing keywords if partial update
      updateData.keywords = {
        ar:
          dto.keywords.ar !== undefined
            ? dto.keywords.ar
            : existingDomain.keywords.ar,
        fr:
          dto.keywords.fr !== undefined
            ? dto.keywords.fr
            : existingDomain.keywords.fr,
        en:
          dto.keywords.en !== undefined
            ? dto.keywords.en
            : existingDomain.keywords.en,
      };
    }

    if (dto.subcategories !== undefined) {
      updateData.subcategories = dto.subcategories.map((sub) => ({
        ...sub,
        category_key: normalizedKey,
      })) as Subcategory[];
    }

    // Update domain
    const updated = await this.domainRepository.update(
      normalizedKey,
      updateData
    );

    if (!updated) {
      throw new DomainNotFoundError(normalizedKey);
    }

    return updated;
  }
}
