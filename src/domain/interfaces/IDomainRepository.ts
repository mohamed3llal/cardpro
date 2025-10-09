import { DomainEntity } from "../entities/Domain";

export interface IDomainRepository {
  findAll(): Promise<DomainEntity[]>;
  findByKey(key: string): Promise<DomainEntity | null>;
  create(domain: DomainEntity): Promise<DomainEntity>;
  update(
    key: string,
    domain: Partial<DomainEntity>
  ): Promise<DomainEntity | null>;
  delete(key: string): Promise<boolean>;
  existsByKey(key: string): Promise<boolean>;
}
