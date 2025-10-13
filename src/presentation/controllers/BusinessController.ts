// src/presentation/controllers/BusinessController.ts
import { Request, Response, NextFunction } from "express";
import { SearchBusinesses } from "@application/use-cases/business/SearchBusinesses";
import { GetBusinessById } from "@application/use-cases/business/GetBusinessById";
import { GetSimilarBusinesses } from "@application/use-cases/business/GetSimilarBusinesses";
import { RecordView } from "@application/use-cases/business/RecordView";
import { RecordScan } from "@application/use-cases/business/RecordScan";
import { RecordContactClick } from "@application/use-cases/business/RecordContactClick";
import { logger } from "@config/logger";
import { BusinessSearchParams } from "@application/dtos/BusinessDTO";
import { GetFeaturedBusinessesUseCase } from "@application/use-cases/business/GetFeaturedBusinesses";
import { Console } from "console";

export class BusinessController {
  constructor(
    private readonly searchBusinessesUseCase: SearchBusinesses,
    private readonly getFeaturedBusinessesUseCase: GetFeaturedBusinessesUseCase,
    private readonly getBusinessByIdUseCase: GetBusinessById,
    private readonly getSimilarBusinessesUseCase: GetSimilarBusinesses,
    private readonly recordViewUseCase: RecordView,
    private readonly recordScanUseCase: RecordScan,
    private readonly recordContactClickUseCase: RecordContactClick
  ) {}

  /**
   * GET /api/v1/businesses/search
   * Search and filter businesses
   */
  async searchBusinesses(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        q,
        page = 1,
        limit = 20,
        domain,
        subdomain,
        city,
        latitude,
        longitude,
        radius = 10,
        rating,
        languages,
        availability,
        verified,
        is_public,
        tags,
        has_photo,
        sort_by = "relevance",
      } = req.query;

      // Parse subdomain (can be comma-separated)
      const subdomainArray: any =
        typeof subdomain === "string"
          ? subdomain.split(",").map((s) => s.trim())
          : Array.isArray(subdomain)
          ? subdomain
          : undefined;

      // Parse tags (can be comma-separated)
      const tagsArray: any =
        typeof tags === "string"
          ? tags.split(",").map((t) => t.trim())
          : Array.isArray(tags)
          ? tags
          : undefined;

      // Parse languages
      const languagesArray: any =
        typeof languages === "string"
          ? languages.split(",").map((l) => l.trim())
          : Array.isArray(languages)
          ? languages
          : undefined;

      const searchParams: BusinessSearchParams = {
        query: q as string,
        page: parseInt(page as string) || 1,
        limit: Math.min(parseInt(limit as string) || 20, 100),
        domain: domain as string,
        subdomain: subdomainArray,
        city: city as string,
        latitude: latitude ? parseFloat(latitude as string) : undefined,
        longitude: longitude ? parseFloat(longitude as string) : undefined,
        radius: parseFloat(radius as string) || 10,
        rating: rating ? parseFloat(rating as string) : undefined,
        languages: languagesArray,
        availability: availability as string,
        verified: true,
        is_public: true,
        tags: tagsArray,
        has_photo: has_photo as string,
        sort_by: sort_by as string,
      };

      logger.info("Searching businesses with params:", searchParams);

      const result = await this.searchBusinessesUseCase.execute(searchParams);
      res.status(200).json({
        businesses: result.businesses,
        pagination: result.pagination,
        filters_applied: result.filters_applied,
        total_results: result.total_results,
      });
    } catch (error) {
      logger.error("Error searching businesses:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to search businesses",
      });
    }
  }

  /**
   * GET /api/v1/businesses/featured
   * Get featured businesses
   */
  async getFeaturedBusinesses(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Extract location parameters from query
      const latitude = req.query.latitude
        ? parseFloat(req.query.latitude as string)
        : undefined;
      const longitude = req.query.longitude
        ? parseFloat(req.query.longitude as string)
        : undefined;
      const radius = req.query.radius
        ? parseFloat(req.query.radius as string)
        : 10; // default 10km

      // Validate coordinates (both must be provided or neither)
      if (
        (latitude !== undefined && longitude === undefined) ||
        (latitude === undefined && longitude !== undefined)
      ) {
        res.status(400).json({
          error: "INVALID_PARAMETERS",
          message: "Both latitude and longitude must be provided together",
        });
        return;
      }
      console.log(latitude, longitude, radius);
      const result = await this.getFeaturedBusinessesUseCase.execute({
        latitude,
        longitude,
        radius,
      });

      console.log(JSON.stringify(result, null, 2));
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to fetch featured businesses",
      });
    }
  }

  /**
   * GET /api/v1/businesses/:id
   * Get business by ID or slug
   */
  async getBusinessById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { latitude, longitude } = req.query;

      logger.info(`Fetching business: ${id}`);

      const userLocation =
        latitude && longitude
          ? {
              lat: parseFloat(latitude as string),
              lng: parseFloat(longitude as string),
            }
          : undefined;

      const business = await this.getBusinessByIdUseCase.execute(
        id,
        userLocation
      );

      if (!business) {
        res.status(404).json({
          error: "NOT_FOUND",
          message: "Business not found",
        });
        return;
      }

      // Check if business is private
      if (!business.is_public) {
        res.status(403).json({
          error: "FORBIDDEN",
          message: "This business is private",
        });
        return;
      }

      res.status(200).json(business);
    } catch (error) {
      logger.error("Error fetching business:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to fetch business",
      });
    }
  }

  /**
   * GET /api/v1/businesses/:id/similar
   * Get similar businesses
   */
  async getSimilarBusinesses(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { limit = 5 } = req.query;

      logger.info(`Fetching similar businesses for: ${id}`);

      const similar = await this.getSimilarBusinessesUseCase.execute(
        id,
        Math.min(parseInt(limit as string) || 5, 20)
      );

      res.status(200).json({
        similar,
      });
    } catch (error) {
      logger.error("Error fetching similar businesses:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to fetch similar businesses",
      });
    }
  }

  /**
   * POST /api/v1/businesses/:id/view
   * Record a view event
   */
  async recordView(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { source = "direct" } = req.body;

      await this.recordViewUseCase.execute(id, source);

      res.status(200).json({
        success: true,
      });
    } catch (error) {
      // Silently fail - analytics should not break user experience
      logger.error("Error recording view:", error);
      res.status(200).json({
        success: true,
      });
    }
  }

  /**
   * POST /api/v1/businesses/:id/scan
   * Record a QR code scan event
   */
  async recordScan(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { source = "qr_code", device = "mobile" } = req.body;

      await this.recordScanUseCase.execute(id, source, device);

      res.status(200).json({
        success: true,
      });
    } catch (error) {
      // Silently fail
      logger.error("Error recording scan:", error);
      res.status(200).json({
        success: true,
      });
    }
  }

  /**
   * POST /api/v1/businesses/:id/contact-click
   * Record contact click event
   */
  async recordContactClick(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { contact_type } = req.body; // phone, whatsapp, email, website

      await this.recordContactClickUseCase.execute(id, contact_type);

      res.status(200).json({
        success: true,
      });
    } catch (error) {
      // Silently fail
      logger.error("Error recording contact click:", error);
      res.status(200).json({
        success: true,
      });
    }
  }
}
