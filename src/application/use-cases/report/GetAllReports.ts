import { IReportRepository } from "@domain/interfaces/IReportRepository";

export class GetAllReportsUseCase {
  constructor(private reportRepository: IReportRepository) {}

  async execute(
    page: number = 1,
    limit: number = 50,
    filters?: { status?: string; report_type?: string }
  ) {
    const { reports, total } = await this.reportRepository.findAll(
      page,
      limit,
      filters
    );

    const totalPages = Math.ceil(total / limit);

    return {
      reports: reports.map((r) => r.toJSON()),
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_reports: total,
        per_page: limit,
      },
      stats: {
        pending: await this.reportRepository.count({ status: "pending" }),
        resolved: await this.reportRepository.count({ status: "resolved" }),
        dismissed: await this.reportRepository.count({ status: "dismissed" }),
      },
    };
  }
}
