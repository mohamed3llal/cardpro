import { IDomainRepository } from "../../../domain/interfaces/IDomainRepository";
import { DomainEntity } from "../../../domain/entities/Domain";

export class GetAllDomains {
  constructor(private readonly domainRepository: IDomainRepository) {}

  async execute(): Promise<DomainEntity[]> {
    try {
      const domains = await this.domainRepository.findAll();
      return domains;
    } catch (error) {
      throw new Error(
        `Failed to retrieve domains: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
