// src/application/use-cases/card/CreateCard.ts

import { Card, CardProps } from "@domain/entities/Card";
import { ICardRepository } from "@domain/interfaces/ICardRepository";

export interface CreateCardDTO {
  user_id: string;
  title: string;
  company?: string;
  domain_key: string;
  subdomain_key?: string[];
  description?: string;
  mobile_phones?: string[];
  landline_phones?: string[];
  fax_numbers?: string[];
  email?: string;
  website?: string;
  address?: string;
  work_hours?: string;
  languages?: string[];
  tags?: string[];
  social_links?: {
    whatsapp?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
  is_public?: boolean;
}

export class CreateCardUseCase {
  constructor(private readonly cardRepository: ICardRepository) {}

  async execute(dto: CreateCardDTO): Promise<Card> {
    try {
      // Create card entity (validation happens in constructor)
      const cardProps: CardProps = {
        user_id: dto.user_id,
        title: dto.title,
        company: dto.company,
        domain_key: dto.domain_key,
        subdomain_key: dto.subdomain_key,
        description: dto.description,
        mobile_phones: dto.mobile_phones,
        landline_phones: dto.landline_phones,
        fax_numbers: dto.fax_numbers,
        email: dto.email,
        website: dto.website,
        address: dto.address,
        work_hours: dto.work_hours,
        languages: dto.languages,
        tags: dto.tags,
        social_links: dto.social_links,
        location: dto.location,
        is_public: dto.is_public,
      };

      const card = Card.create(cardProps);

      // Persist the card
      const createdCard = await this.cardRepository.create(card);

      return createdCard;
    } catch (error: any) {
      throw new Error(`Failed to create card: ${error.message}`);
    }
  }
}
