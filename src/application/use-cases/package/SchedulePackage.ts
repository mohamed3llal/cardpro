import { IPackageRepository } from "@domain/interfaces/IPackageRepository";
import { Package } from "@domain/entities/Package";
import { AppError } from "@shared/errors/AppError";

interface SchedulePackageInput {
  packageId: string;
  scheduledActivateAt?: Date;
  scheduledDeactivateAt?: Date;
}

export class SchedulePackage {
  constructor(private packageRepository: IPackageRepository) {}

  async execute(input: SchedulePackageInput): Promise<Package> {
    const { packageId, scheduledActivateAt, scheduledDeactivateAt } = input;

    // Validate dates
    if (scheduledActivateAt && scheduledDeactivateAt) {
      if (scheduledActivateAt >= scheduledDeactivateAt) {
        throw new AppError(
          "Activation date must be before deactivation date",
          400
        );
      }
    }

    const pkg = await this.packageRepository.updatePackage(packageId, {
      scheduledActivateAt,
      scheduledDeactivateAt,
    });

    if (!pkg) {
      throw new AppError("Package not found", 404);
    }

    return pkg;
  }
}
