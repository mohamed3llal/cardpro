import { Subcategory } from "./../../domain/entities/Domain";
export interface CreateDomainDTO {
  key: string;
  ar: string;
  fr: string;
  en: string;
  keywords: {
    ar: string[];
    fr: string[];
    en: string[];
  };
  subcategories?: Subcategory[];
}

export interface UpdateDomainDTO {
  ar?: string;
  fr?: string;
  en?: string;
  keywords?: {
    ar?: string[];
    fr?: string[];
    en?: string[];
  };
}

export interface AddSubcategoryDTO {
  key: string;
  ar: string;
  fr: string;
  en: string;
  keywords: {
    ar: string[];
    fr: string[];
    en: string[];
  };
}

export interface UpdateSubcategoryDTO {
  ar?: string;
  fr?: string;
  en?: string;
  keywords?: {
    ar?: string[];
    fr?: string[];
    en?: string[];
  };
}
