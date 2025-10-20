import { Report } from "@domain/entities/Report";
import { IReportRepository } from "@domain/interfaces/IReportRepository";
import { ReportModel } from "@infrastructure/database/models/ReportModel";

export class ReportRepository implements IReportRepository {
  async create(report: Report): Promise<Report> {
    try {
      const reportDoc = await ReportModel.create(report.toJSON());
      return Report.fromPersistence(reportDoc);
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error("You have already reported this business card");
      }
      throw error;
    }
  }

  async findById(id: string): Promise<Report | null> {
    const report = await ReportModel.findById(id).lean();
    return report ? Report.fromPersistence(report) : null;
  }

  async findByCardAndUser(
    cardId: string,
    userId: string
  ): Promise<Report | null> {
    const report = await ReportModel.findOne({
      card_id: cardId,
      user_id: userId,
    }).lean();
    return report ? Report.fromPersistence(report) : null;
  }

  async findByUserId(userId: string): Promise<Report[]> {
    const reports = await ReportModel.find({ user_id: userId })
      .sort({ created_at: -1 })
      .lean();
    return reports.map((r) => Report.fromPersistence(r));
  }

  async findAll(
    page: number = 1,
    limit: number = 50,
    filters?: { status?: string; report_type?: string }
  ): Promise<{ reports: Report[]; total: number }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filters?.status && filters.status !== "all") {
      query.status = filters.status;
    }

    if (filters?.report_type && filters.report_type !== "all") {
      query.report_type = filters.report_type;
    }

    const [reports, total] = await Promise.all([
      ReportModel.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ReportModel.countDocuments(query),
    ]);

    return {
      reports: reports.map((r) => Report.fromPersistence(r)),
      total,
    };
  }

  async update(id: string, report: Report): Promise<Report | null> {
    const { id: _, ...data } = report.toJSON();
    const updated = await ReportModel.findByIdAndUpdate(id, data, {
      new: true,
    }).lean();
    return updated ? Report.fromPersistence(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await ReportModel.findByIdAndDelete(id);
    return !!result;
  }

  async exists(id: string): Promise<boolean> {
    const count = await ReportModel.countDocuments({ _id: id });
    return count > 0;
  }

  async count(filters?: any): Promise<number> {
    return await ReportModel.countDocuments(filters || {});
  }
}
