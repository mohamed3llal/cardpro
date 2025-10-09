import { IDomainRepository } from "../../../domain/interfaces/IDomainRepository";
import { DomainNotFoundError } from "./GetDomainByKey";
import { SubcategoryNotFoundError } from "./UpdateSubcategory";

export class CannotDeleteSubcategoryError extends Error {
  constructor(key: string, public readonly businessCount: number) {
    super(
      `Cannot delete subcategory with existing businesses. Use force=true to override.`
    );
    this.name = "CannotDeleteSubcategoryError";
  }
}

export interface DeleteSubcategoryResult {
  deleted_subcategory: string;
  parent_domain: string;
  affected_businesses: number;
}

export class DeleteSubcategory {
  constructor(
    private readonly domainRepository: IDomainRepository,
    private readonly businessRepository?: any // Optional: IBusinessRepository
  ) {}

  async execute(
    domainKey: string,
    subcategoryKey: string,
    force: boolean = false
  ): Promise<DeleteSubcategoryResult> {
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

    // Check for existing businesses (if business repository is provided)
    let affectedBusinesses = 0;
    if (this.businessRepository) {
      affectedBusinesses = await this.businessRepository.countBySubcategory(
        normalizedSubcategoryKey
      );

      if (affectedBusinesses > 0 && !force) {
        throw new CannotDeleteSubcategoryError(
          normalizedSubcategoryKey,
          affectedBusinesses
        );
      }

      // Delete businesses if force is true
      if (affectedBusinesses > 0 && force) {
        await this.businessRepository.deleteBySubcategory(
          normalizedSubcategoryKey
        );
      }
    }

    // Remove subcategory from array
    const updatedSubcategories = domain.subcategories!.filter(
      (sub) => sub.key !== normalizedSubcategoryKey
    );

    // Update domain without the deleted subcategory
    await this.domainRepository.update(normalizedDomainKey, {
      subcategories: updatedSubcategories,
    });

    return {
      deleted_subcategory: normalizedSubcategoryKey,
      parent_domain: normalizedDomainKey,
      affected_businesses: affectedBusinesses,
    };
  }
}
