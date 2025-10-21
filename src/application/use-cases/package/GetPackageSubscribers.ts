import { IPackageRepository } from "@domain/interfaces/IPackageRepository";

export class GetPackageSubscribers {
  constructor(private packageRepository: IPackageRepository) {}

  async execute(packageId: string, page = 1, limit = 20): Promise<any> {
    const result = await this.packageRepository.getPackageSubscribers(
      packageId,
      page,
      limit
    );

    return {
      ...result,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}
