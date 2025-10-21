import { IPackageRepository } from "@domain/interfaces/IPackageRepository";
import { UserPackage } from "@domain/entities/Subscription";

export class GetAllSubscriptionsAdmin {
  constructor(private packageRepository: IPackageRepository) {}

  async execute(
    page = 1,
    limit = 20
  ): Promise<{
    data: UserPackage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { data, total } = await this.packageRepository.getAllSubscriptions(
      page,
      limit
    );

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
