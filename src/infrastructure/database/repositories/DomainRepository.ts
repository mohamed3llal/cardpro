// src/infrastructure/database/repositories/DomainRepository.ts

import { DomainEntity } from "../../../domain/entities/Domain";
import { IDomainRepository } from "../../../domain/interfaces/IDomainRepository";
import { DomainModel, IDomainDocument } from "../models/DomainModel";

export class DomainRepository implements IDomainRepository {
  private mapToDomain(doc: IDomainDocument): DomainEntity {
    return new DomainEntity(
      doc.key,
      doc.ar,
      doc.fr,
      doc.en,
      doc.keywords,
      doc.subcategories || [],
      doc.created_at,
      doc.updated_at
    );
  }

  async findAll(): Promise<DomainEntity[]> {
    const domains = await DomainModel.find()
      .sort({ created_at: -1 })
      .lean()
      .exec();
    return domains.map((doc) => this.mapToDomain(doc as IDomainDocument));
  }

  async findByKey(key: string): Promise<DomainEntity | null> {
    const domain = await DomainModel.findOne({ key }).lean().exec();
    return domain ? this.mapToDomain(domain as IDomainDocument) : null;
  }

  async create(domain: DomainEntity): Promise<DomainEntity> {
    // Assign category_key to all subcategories
    const subcategoriesWithCategoryKey = domain.subcategories.map((sub) => ({
      ...sub,
      category_key: domain.key,
    }));

    const newDomain = new DomainModel({
      key: domain.key,
      ar: domain.ar,
      fr: domain.fr,
      en: domain.en,
      keywords: domain.keywords,
      subcategories: subcategoriesWithCategoryKey,
    });

    const saved = await newDomain.save();
    return this.mapToDomain(saved);
  }

  async update(
    key: string,
    domain: Partial<DomainEntity>
  ): Promise<DomainEntity | null> {
    const updateData: any = {};

    if (domain.ar) updateData.ar = domain.ar;
    if (domain.fr) updateData.fr = domain.fr;
    if (domain.en) updateData.en = domain.en;
    if (domain.keywords) updateData.keywords = domain.keywords;

    if (domain.subcategories) {
      updateData.subcategories = domain.subcategories.map((sub) => ({
        ...sub,
        category_key: key,
      }));
    }

    const updated = await DomainModel.findOneAndUpdate(
      { key },
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .lean()
      .exec();

    return updated ? this.mapToDomain(updated as IDomainDocument) : null;
  }

  async delete(key: string): Promise<boolean> {
    const result = await DomainModel.deleteOne({ key }).exec();
    return result.deletedCount > 0;
  }

  async existsByKey(key: string): Promise<boolean> {
    const count = await DomainModel.countDocuments({ key }).exec();
    return count > 0;
  }
}
