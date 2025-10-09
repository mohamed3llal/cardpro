export interface CreateCardDTO {
  title: string;
  company?: string;
  domain_key: string;
  subdomain_key: string[];
  description: string;
  mobile_phones: string[];
  landline_phones?: string[];
  fax_numbers?: string[];
  email: string;
  website?: string;
  address: string;
  work_hours?: string;
  languages: string[];
  tags: string[];
  social_links?: {
    whatsapp?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  location: {
    lat: number;
    lng: number;
  };
  images?: string[];
  isPublic?: boolean;
}

export interface UpdateCardDTO extends Partial<CreateCardDTO> {}

export interface CardResponseDTO {
  _id: string;
  userId: string;
  title: string;
  company?: string;
  domain_key: string;
  subdomain_key: string[];
  description: string;
  mobile_phones: string[];
  landline_phones: string[];
  fax_numbers: string[];
  email: string;
  website: string;
  address: string;
  work_hours: string;
  languages: string[];
  tags: string[];
  social_links: {
    whatsapp?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  location: {
    lat: number;
    lng: number;
  };
  images: string[];
  rating: number;
  availability: string;
  is_public: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}
