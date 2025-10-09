import { IDomainRepository } from "../../../domain/interfaces/IDomainRepository";
import { DomainEntity } from "../../../domain/entities/Domain";

export class DomainNotFoundError extends Error {
  constructor(key: string) {
    super(`Domain with key '${key}' not found`);
    this.name = "DomainNotFoundError";
  }
}

export class GetDomainByKey {
  constructor(private readonly domainRepository: IDomainRepository) {}

  async execute(key: string): Promise<DomainEntity> {
    if (!key || typeof key !== "string") {
      throw new Error("Domain key is required");
    }

    const domain = await this.domainRepository.findByKey(key.toLowerCase());

    if (!domain) {
      throw new DomainNotFoundError(key);
    }

    return domain;
  }
}
