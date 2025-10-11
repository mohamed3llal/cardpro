// src/application/dtos/BusinessDTO.ts

export interface BusinessSearchParams {
  query?: string;
  page: number;
  limit: number;
  domain?: string;
  subdomain?: string[];
  city?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  rating?: number;
  languages?: string[];
  availability?: string;
  verified?: boolean;
  is_public?: boolean;
  tags?: string[];
  has_photo?: string;
  sort_by?: string;
}

export interface BusinessLocationDTO {
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distance?: number;
}

export interface BusinessContactDTO {
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
}

export interface BusinessRatingDTO {
  average: number;
  count: number;
  breakdown?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface BusinessStatsDTO {
  views: number;
  views_this_month: number;
  contact_clicks?: number;
}

export interface BusinessServiceDTO {
  id: string;
  name: string;
  description?: string;
  price_range?: string;
  duration?: string;
}

export interface BusinessHoursDTO {
  monday?: { open: string; close: string };
  tuesday?: { open: string; close: string };
  wednesday?: { open: string; close: string };
  thursday?: { open: string; close: string };
  friday?: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
}

export interface BusinessMediaDTO {
  logo?: string;
  cover?: string;
  gallery?: string[];
  videos?: string[];
}

export interface BusinessBadgesDTO {
  verified: boolean;
  premium?: boolean;
  years_in_business?: number;
}

export interface BusinessOwnerDTO {
  id: string;
  name: string;
  avatar?: string;
}

export interface BusinessListItemDTO {
  id: string;
  name: string;
  slug: string;
  domain_key: string;
  subdomain?: string;
  description?: string;
  logo?: string;
  cover_image?: string;
  contact: BusinessContactDTO;
  location: BusinessLocationDTO;
  rating: BusinessRatingDTO;
  stats: BusinessStatsDTO;
  tags?: string[];
  features?: string[];
  payment_methods?: string[];
  hours?: BusinessHoursDTO;
  status?: string;
  is_verified: boolean;
  is_public: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessDetailDTO extends BusinessListItemDTO {
  media: BusinessMediaDTO;
  services?: BusinessServiceDTO[];
  badges: BusinessBadgesDTO;
  owner: BusinessOwnerDTO;
}

export interface BusinessSearchResultDTO {
  businesses: BusinessListItemDTO[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_businesses: number;
    limit: number;
    has_next: boolean;
    has_prev: boolean;
  };
  filters_applied: Record<string, any>;
  total_results: number;
}

export interface FeaturedBusinessDTO {
  id: string;
  name: string;
  logo?: string;
  rating: BusinessRatingDTO;
  domain_key: string;
  is_verified: boolean;
}

export interface CategoryBusinessesDTO {
  domain_key: string;
  count: number;
  businesses: FeaturedBusinessDTO[];
}

export interface FeaturedBusinessesResultDTO {
  featured: FeaturedBusinessDTO[];
  categories: CategoryBusinessesDTO[];
}

export interface SimilarBusinessDTO {
  id: string;
  name: string;
  logo?: string;
  rating: BusinessRatingDTO;
  location: {
    city: string;
    distance?: number;
  };
  domain_key: string;
}
