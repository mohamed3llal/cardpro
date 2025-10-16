// src/presentation/controllers/BusinessController.ts

import { Request, Response, NextFunction } from "express";
import {
  SearchBusinesses,
  SearchBusinessesFilters,
} from "@application/use-cases/business/SearchBusinesses";
import { GetFeaturedBusinessesUseCase } from "@application/use-cases/business/GetFeaturedBusinesses";
import { GetBusinessById } from "@application/use-cases/business/GetBusinessById";
import { RecordView } from "@application/use-cases/business/RecordView";
import { RecordScan } from "@application/use-cases/business/RecordScan";
import { RecordContactClick } from "@application/use-cases/business/RecordContactClick";

export class BusinessController {
  constructor(
    private readonly searchBusinessesUseCase: SearchBusinesses,
    private readonly getFeaturedBusinessesUseCase: GetFeaturedBusinessesUseCase,
    private readonly getBusinessByIdUseCase: GetBusinessById,
    private readonly recordViewUseCase: RecordView,
    private readonly recordScanUseCase: RecordScan,
    private readonly recordContactClickUseCase: RecordContactClick
  ) {}

  /**
   * GET /businesses/search
   * Search and filter businesses
   */
  searchBusinesses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {
        q,
        page,
        limit,
        domain,
        subdomain,
        city,
        latitude,
        longitude,
        radius,
        rating,
        languages,
        availability,
        verified,
        is_public,
        tags,
        has_photo,
        sort_by,
      } = req.query;

      // Parse query parameters
      const filters: any = {
        q: q as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        domain: domain as string,
        subdomain: subdomain
          ? typeof subdomain === "string"
            ? subdomain.split(",")
            : subdomain
          : undefined,
        city: city as string,
        latitude: latitude ? parseFloat(latitude as string) : undefined,
        longitude: longitude ? parseFloat(longitude as string) : undefined,
        radius: radius ? parseFloat(radius as string) : undefined,
        rating: rating ? parseFloat(rating as string) : undefined,
        languages: languages
          ? typeof languages === "string"
            ? languages.split(",")
            : languages
          : undefined,
        availability: availability as string,
        verified:
          verified === "true" ? true : verified === "false" ? false : undefined,
        is_public:
          is_public === "true"
            ? true
            : is_public === "false"
            ? false
            : undefined,
        tags: tags
          ? typeof tags === "string"
            ? tags.split(",")
            : tags
          : undefined,
        has_photo: has_photo as string,
        sort_by: sort_by as any,
      };

      const result = await this.searchBusinessesUseCase.execute(filters);

      res.status(200).json({
        businesses: result.businesses.map((b: any) =>
          this.formatBusinessResponse(b)
        ),
        pagination: result.pagination,
        filters_applied: result.filters_applied,
        total_results: result.total_results,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /businesses/featured
   * Get featured businesses for home page
   */
  getFeaturedBusinesses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { latitude, longitude, radius } = req.query;

      const lat = latitude ? parseFloat(latitude as string) : undefined;
      const lng = longitude ? parseFloat(longitude as string) : undefined;
      const rad = radius ? parseFloat(radius as string) : 10;

      const result = await this.getFeaturedBusinessesUseCase.execute(
        lat,
        lng,
        rad
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /businesses/:id
   * Get business details by ID
   */
  getBusinessById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;

      const business = await this.getBusinessByIdUseCase.execute(id);

      res.status(200).json(this.formatDetailedBusinessResponse(business));
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /businesses/:id/view
   * Record a view event
   */
  recordView = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { source } = req.body;

      await this.recordViewUseCase.execute({
        businessId: id,
        source: source || "direct",
      });

      res.status(200).json({ success: true });
    } catch (error) {
      // Always return success for analytics endpoints
      res.status(200).json({ success: true });
    }
  };

  /**
   * POST /businesses/:id/scan
   * Record a QR code scan event
   */
  recordScan = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { source, device } = req.body;

      await this.recordScanUseCase.execute({
        businessId: id,
        source: source || "qr_code",
        device: device || "mobile",
      });

      res.status(200).json({ success: true });
    } catch (error) {
      // Always return success
      res.status(200).json({ success: true });
    }
  };

  /**
   * POST /businesses/:id/contact-click
   * Record a contact click event
   */
  recordContactClick = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { contact_type } = req.body;

      await this.recordContactClickUseCase.execute({
        businessId: id,
        contactType: contact_type,
      });

      res.status(200).json({ success: true });
    } catch (error) {
      // Always return success
      res.status(200).json({ success: true });
    }
  };

  // Helper methods to format responses
  private formatBusinessResponse(card: any): any {
    const data = card.props || card.toJSON();

    return {
      id: data._id,
      name: data.title,
      slug: this.generateSlug(data.title),
      domain_key: data.domain_key,
      subdomain: data.subdomain_key,
      description: data.description,
      logo: data.logo,
      cover_image: data.cover_image,
      contact: {
        phone: data.mobile_phones?.[0],
        whatsapp: data.social_links?.whatsapp,
        email: data.email,
        website: data.website,
      },
      location: data.location
        ? {
            address: data.address,
            city: this.extractCity(data.address),
            coordinates: {
              lat: data.location.lat,
              lng: data.location.lng,
            },
            distance: data.location.distance,
          }
        : undefined,
      rating: data.rating || { average: 0, count: 0 },
      stats: {
        views: data.views || 0,
        views_this_month: data.views_this_month || 0,
      },
      tags: data.tags || [],
      features: data.features || [],
      payment_methods: data.payment_methods || [],
      hours: data.work_hours,
      status: "open", // You can add logic to determine status
      is_verified: data.user?.domainVerified || false,
      is_public: data.is_public,
      owner_id: data.user_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  private formatDetailedBusinessResponse(card: any): any {
    const data = card.props || card.toJSON();

    return {
      id: data._id,
      name: data.title,
      slug: this.generateSlug(data.title),
      domain_key: data.domain_key,
      subdomain: data.subdomain_key,
      description: data.description,
      media: {
        logo: data.logo,
        cover: data.cover_image,
        gallery: data.images || [],
        videos: data.videos || [],
      },
      contact: {
        phone: data.mobile_phones?.[0],
        whatsapp: data.social_links?.whatsapp,
        email: data.email,
        website: data.website,
      },
      location: data.location
        ? {
            address: data.address,
            city: this.extractCity(data.address),
            coordinates: {
              lat: data.location.lat,
              lng: data.location.lng,
            },
          }
        : undefined,
      rating: data.rating || {
        average: 0,
        count: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      },
      stats: {
        views: data.views || 0,
        views_this_month: data.views_this_month || 0,
        contact_clicks: data.contact_clicks || 0,
      },
      services: data.services || [],
      hours: data.work_hours,
      tags: data.tags || [],
      features: data.features || [],
      payment_methods: data.payment_methods || [],
      badges: {
        verified: data.user?.domainVerified || false,
        premium: false,
        years_in_business: this.calculateYearsInBusiness(data.created_at),
      },
      owner: data.user
        ? {
            id: data.user_id,
            name: `${data.user.firstName} ${data.user.lastName}`,
            avatar: data.user.avatar,
          }
        : undefined,
      status: "open",
      is_public: data.is_public,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  private extractCity(address?: string): string | undefined {
    if (!address) return undefined;
    const parts = address.split(",");
    return parts[parts.length - 1]?.trim();
  }

  private calculateYearsInBusiness(createdAt?: Date): number {
    if (!createdAt) return 0;
    const now = new Date();
    const created = new Date(createdAt);
    return Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 365)
    );
  }
}
