import { IPackageRepository } from "@domain/interfaces/IPackageRepository";
import { Package, CreatePackageData } from "@domain/entities/Package";

export class CreatePackage {
  constructor(private packageRepository: IPackageRepository) {}

  async execute(data: CreatePackageData): Promise<Package> {
    return this.packageRepository.createPackage(data);
  }
}
