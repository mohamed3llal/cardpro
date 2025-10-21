import { IPackageRepository } from "@domain/interfaces/IPackageRepository";
import { Package, UpdatePackageData } from "@domain/entities/Package";
import { AppError } from "@shared/errors/AppError";

export class UpdatePackage {
  constructor(private packageRepository: IPackageRepository) {}

  async execute(id: string, data: UpdatePackageData): Promise<Package> {
    const pkg = await this.packageRepository.updatePackage(id, data);

    if (!pkg) {
      throw new AppError("Package not found", 404);
    }

    return pkg;
  }
}
