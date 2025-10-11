import { ICardRepository } from "@domain/interfaces/ICardRepository";
import { BusinessDetailDTO } from "@application/dtos/BusinessDTO";

export class GetBusinessById {
  constructor(private cardRepository: ICardRepository) {}

  async execute(
    idOrSlug: string,
    userLocation?: { lat: number; lng: number }
  ): Promise<BusinessDetailDTO | null> {
    // Try to find by ID first, then by slug
    let business: any = await this.cardRepository.findById(idOrSlug);

    if (!business) {
      business = await this.cardRepository.findOne({ slug: idOrSlug });
    }

    if (!business) {
      return null;
    }

    // Calculate distance if user location provided
    let distance: number | undefined;
    if (userLocation && business.location?.coordinates) {
      distance = this.calculateDistance(
        userLocation.lat,
        userLocation.lng,
        business.location.coordinates.lat,
        business.location.coordinates.lng
      );
    }

    return this.mapToDetailDTO(business, distance);
  }

  private mapToDetailDTO(business: any, distance?: number): BusinessDetailDTO {
    return {
      id: business._id,
      name: business.title,
      slug: business.slug || "",
      domain_key: business.domain_key,
      subdomain: business.subdomain,
      description: business.description,
      logo: business.logo,
      cover_image: business.cover_image,
      media: {
        logo: business.logo,
        cover: business.cover_image,
        gallery: business.gallery || [],
        videos: business.videos || [],
      },
      contact: {
        phone: business.phone,
        whatsapp: business.whatsapp,
        email: business.email,
        website: business.website,
      },
      location: {
        address: business.location?.address || "",
        city: business.location?.city || "",
        coordinates: {
          lat: business.location?.coordinates?.lat || 0,
          lng: business.location?.coordinates?.lng || 0,
        },
        distance,
      },
      rating: {
        average: business.rating?.average || 0,
        count: business.rating?.count || 0,
        breakdown: business.rating?.breakdown || {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      },
      stats: {
        views: business.views || 0,
        views_this_month: business.views_this_month || 0,
        contact_clicks: business.contact_clicks || 0,
      },
      services: business.services || [],
      hours: business.hours,
      tags: business.tags || [],
      features: business.features || [],
      payment_methods: business.payment_methods || [],
      badges: {
        verified: business.is_verified || false,
        premium: business.is_premium || false,
        years_in_business: business.years_in_business,
      },
      owner: {
        id: business.user_id,
        name: business.owner_name || "Business Owner",
        avatar: business.owner_avatar,
      },
      status: business.status || "open",
      is_verified: business.is_verified || false,
      is_public: business.is_public !== false,
      owner_id: business.user_id,
      created_at:
        business.created_at?.toISOString() || new Date().toISOString(),
      updated_at:
        business.updated_at?.toISOString() || new Date().toISOString(),
    };
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
