// src/application/use-cases/domain/DeleteDomain.ts

import { IDomainRepository } from "../../../domain/interfaces/IDomainRepository";
import { DomainNotFoundError } from "./GetDomainByKey";

export class CannotDeleteDomainError extends Error {
  constructor(key: string, public readonly businessCount: number) {
    super(
      `Cannot delete domain with existing businesses. Use force=true to override.`
    );
    this.name = "CannotDeleteDomainError";
  }
}

export interface DeleteDomainResult {
  deleted_domain: string;
  affected_businesses: number;
  affected_subcategories: number;
}

export class DeleteDomain {
  constructor(
    private readonly domainRepository: IDomainRepository,
    private readonly businessRepository?: any // Optional: IBusinessRepository for checking businesses
  ) {}

  async execute(
    key: string,
    force: boolean = false
  ): Promise<DeleteDomainResult> {
    const normalizedKey = key.toLowerCase();

    // Check if domain exists
    const domain = await this.domainRepository.findByKey(normalizedKey);
    if (!domain) {
      throw new DomainNotFoundError(normalizedKey);
    }

    // Check for existing businesses (if business repository is provided)
    let affectedBusinesses = 0;
    if (this.businessRepository) {
      affectedBusinesses = await this.businessRepository.countByDomain(
        normalizedKey
      );

      if (affectedBusinesses > 0 && !force) {
        throw new CannotDeleteDomainError(normalizedKey, affectedBusinesses);
      }

      // Delete businesses if force is true
      if (affectedBusinesses > 0 && force) {
        await this.businessRepository.deleteByDomain(normalizedKey);
      }
    }

    // Count subcategories
    const affectedSubcategories = domain.subcategories?.length || 0;

    // Delete domain
    const deleted = await this.domainRepository.delete(normalizedKey);

    if (!deleted) {
      throw new DomainNotFoundError(normalizedKey);
    }

    return {
      deleted_domain: normalizedKey,
      affected_businesses: affectedBusinesses,
      affected_subcategories: affectedSubcategories,
    };
  }
}
