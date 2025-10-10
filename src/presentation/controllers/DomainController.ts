import { Request, Response, NextFunction } from "express";
import { GetAllDomains } from "../../application/use-cases/domain/GetAllDomains";
import {
  GetDomainByKey,
  DomainNotFoundError,
} from "../../application/use-cases/domain/GetDomainByKey";
import {
  CreateDomain,
  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Constructor for DomainController.
   * @param {GetAllDomains} getAllDomainsUseCase - Use case for getting all domains.
   * @param {GetDomainByKey} getDomainByKeyUseCase - Use case for getting a domain by key.
   * @param {CreateDomain} createDomainUseCase - Use case for creating a domain.
   * @param {UpdateDomain} updateDomainUseCase - Use case for updating a domain.
   * @param {DeleteDomain} deleteDomainUseCase - Use case for deleting a domain.
   * @param {AddSubcategory} addSubcategoryUseCase - Use case for adding a subcategory.
   * @param {UpdateSubcategory} updateSubcategoryUseCase - Use case for updating a subcategory.
   * @param {DeleteSubcategory} deleteSubcategoryUseCase - Use case for deleting a subcategory.
   */
  /*******  7f5a8d11-08c6-4d8a-a4c0-4293fbfb43da  *******/ CreateDomainDTO,
  DomainValidationError,
  DuplicateDomainKeyError,
} from "../../application/use-cases/domain/CreateDomain";
import {
  UpdateDomain,
  UpdateDomainDTO,
} from "../../application/use-cases/domain/UpdateDomain";
import { DeleteDomain } from "../../application/use-cases/domain/DeleteDomain";
import { AddSubcategory } from "../../application/use-cases/domain/AddSubcategory";
import { UpdateSubcategory } from "../../application/use-cases/domain/UpdateSubcategory";
import { DeleteSubcategory } from "../../application/use-cases/domain/DeleteSubcategory";
import { DomainEntity } from "../../domain/entities/Domain";
import { DomainModel } from "@infrastructure/database/models/DomainModel";
export class DomainController {
  constructor(
    private readonly getAllDomainsUseCase: GetAllDomains,
    private readonly getDomainByKeyUseCase: GetDomainByKey,
    private readonly createDomainUseCase: CreateDomain,
    private readonly updateDomainUseCase: UpdateDomain,
    private readonly deleteDomainUseCase: DeleteDomain,
    private readonly addSubcategoryUseCase: AddSubcategory,
    private readonly updateSubcategoryUseCase: UpdateSubcategory,
    private readonly deleteSubcategoryUseCase: DeleteSubcategory
  ) {}

  /**
   * GET /api/v1/domains
   * Get all domains (Public endpoint)
   */
  async getAllDomains(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const domains = await this.getAllDomainsUseCase.execute();

      res.status(200).json({
        domains: domains.map((d) => ({
          key: d.key,
          ar: d.ar,
          fr: d.fr,
          en: d.en,
          keywords: d.keywords,
          subcategories: d.subcategories,
        })),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to retrieve domains",
        },
      });
    }
  }

  /**
   * GET /api/v1/domains/:domainKey
   * Get domain by key (Public endpoint)
   */
  async getDomainByKey(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { domainKey } = req.params;
      const domain = await this.getDomainByKeyUseCase.execute(domainKey);

      res.status(200).json({
        domain: {
          key: domain.key,
          ar: domain.ar,
          fr: domain.fr,
          en: domain.en,
          keywords: domain.keywords,
          subcategories: domain.subcategories,
        },
      });
    } catch (error) {
      if (error instanceof DomainNotFoundError) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Domain not found",
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to retrieve domain",
        },
      });
    }
  }

  /**
   * POST /api/v1/admin/domains
   * Create a new domain (Super Admin only)
   */
  async createDomain(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto: CreateDomainDTO = req.body;
      const domain = await this.createDomainUseCase.execute(dto);

      res.status(201).json({
        success: true,
        data: {
          key: domain.key,
          ar: domain.ar,
          fr: domain.fr,
          en: domain.en,
          keywords: domain.keywords,
          subcategories: domain.subcategories,
          created_at: domain.created_at,
        },
      });
    } catch (error) {
      if (error instanceof DomainValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
            details: error.details,
          },
        });
        return;
      }

      if (error instanceof DuplicateDomainKeyError) {
        res.status(409).json({
          success: false,
          error: {
            code: "DUPLICATE_KEY",
            message: error.message,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create domain",
        },
      });
    }
  }

  /**
   * PUT /api/v1/admin/domains/:domainKey
   * Update a domain (Super Admin only)
   */
  async updateDomain(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { domainKey } = req.params;
      const dto: UpdateDomainDTO = req.body;

      const domain = await this.updateDomainUseCase.execute(domainKey, dto);

      res.status(200).json({
        success: true,
        data: {
          key: domain.key,
          ar: domain.ar,
          fr: domain.fr,
          en: domain.en,
          keywords: domain.keywords,
          subcategories: domain.subcategories,
          updated_at: domain.updated_at,
        },
      });
    } catch (error) {
      if (error instanceof DomainNotFoundError) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Domain not found",
          },
        });
        return;
      }

      if (error instanceof DomainValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
            details: error.details,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update domain",
        },
      });
    }
  }

  /**
   * DELETE /api/v1/admin/domains/:domainKey
   * Delete a domain (Super Admin only)
   */
  async deleteDomain(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { domainKey } = req.params;
      await this.deleteDomainUseCase.execute(domainKey);

      res.status(200).json({
        success: true,
        message: "Domain deleted successfully",
      });
    } catch (error) {
      if (error instanceof DomainNotFoundError) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Domain not found",
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete domain",
        },
      });
    }
  }

  /**
   * POST /api/v1/admin/domains/:domainKey/subcategories
   * Add a subcategory to a domain (Super Admin only)
   */
  async addSubcategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { domainKey } = req.params;
      const subcategoryData = req.body;

      const domain: any = await this.addSubcategoryUseCase.execute(
        domainKey,
        subcategoryData
      );

      res.status(201).json({
        success: true,
        data: {
          key: domain.key,
          subcategories: domain.subcategories,
          updated_at: domain.updated_at,
        },
      });
    } catch (error) {
      if (error instanceof DomainNotFoundError) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Domain not found",
          },
        });
        return;
      }

      if (error instanceof DomainValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
            details: error.details,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to add subcategory",
        },
      });
    }
  }

  /**
   * PUT /api/v1/admin/domains/:domainKey/subcategories/:subcategoryKey
   * Update a subcategory (Super Admin only)
   */
  async updateSubcategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { domainKey, subcategoryKey } = req.params;
      const updateData = req.body;

      const domain: any = await this.updateSubcategoryUseCase.execute(
        domainKey,
        subcategoryKey,
        updateData
      );

      res.status(200).json({
        success: true,
        data: {
          key: domain.key,
          subcategories: domain.subcategories,
          updated_at: domain.updated_at,
        },
      });
    } catch (error) {
      if (error instanceof DomainNotFoundError) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof DomainValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
            details: error.details,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update subcategory",
        },
      });
    }
  }

  /**
   * DELETE /api/v1/admin/domains/:domainKey/subcategories/:subcategoryKey
   * Delete a subcategory (Super Admin only)
   */
  async deleteSubcategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { domainKey, subcategoryKey } = req.params;

      const domain: any = await this.deleteSubcategoryUseCase.execute(
        domainKey,
        subcategoryKey
      );

      res.status(200).json({
        success: true,
        data: {
          key: domain.key,
          subcategories: domain.subcategories,
          updated_at: domain.updated_at,
        },
        message: "Subcategory deleted successfully",
      });
    } catch (error) {
      if (error instanceof DomainNotFoundError) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete subcategory",
        },
      });
    }
  }

  async seedDomains(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).json({
          message: "Invalid data format. Expected an array of domains.",
        });
      }

      const keys = data.map((d) => d.key);
      const uniqueKeys = new Set(keys);
      if (uniqueKeys.size !== keys.length) {
        return res.status(400).json({
          message: "Duplicate domain keys detected. All keys must be unique.",
        });
      }
      const result = await DomainModel.insertMany(data);

      return res.status(201).json({
        message: "✅ Domains and subcategories inserted successfully",
        count: result.length,
      });
    } catch (error: any) {
      console.error("❌ Error seeding domains:", error);
      return res.status(500).json({ message: error.message });
    }
  }
}
