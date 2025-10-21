import { IPackageRepository } from "@domain/interfaces/IPackageRepository";
import { AppError } from "@shared/errors/AppError";

export class DeletePackage {
  constructor(private packageRepository: IPackageRepository) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.packageRepository.deletePackage(id);

    if (!deleted) {
      throw new AppError("Package not found", 404);
    }
  }
}
