// src/application/use-cases/card/UpdateCard.ts

import { Card, CardProps } from "../../../domain/entities/Card";
import { ICardRepository } from "../../../domain/interfaces/ICardRepository";

export interface UpdateCardDTO {
  card_id: string;
  user_id: string;
  title?: string;
  company?: string;
  domain_key?: string;
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

export class UpdateCardUseCase {
  constructor(private readonly cardRepository: ICardRepository) {}

  async execute(dto: UpdateCardDTO): Promise<Card> {
    try {
      // Check if card exists and user is the owner
      const existingCard = await this.cardRepository.findById(dto.card_id);

      if (!existingCard) {
        throw new Error("Card not found");
      }

      const isOwner = await this.cardRepository.isOwner(
        dto.card_id,
        dto.user_id
      );

      if (!isOwner) {
        throw new Error("You do not have permission to update this card");
      }

      // Prepare update data (only include provided fields)
      const updates: Partial<CardProps> = {};

      if (dto.title !== undefined) updates.title = dto.title;
      if (dto.company !== undefined) updates.company = dto.company;
      if (dto.domain_key !== undefined) updates.domain_key = dto.domain_key;
      if (dto.subdomain_key !== undefined)
        updates.subdomain_key = dto.subdomain_key;
      if (dto.description !== undefined) updates.description = dto.description;
      if (dto.mobile_phones !== undefined)
        updates.mobile_phones = dto.mobile_phones;
      if (dto.landline_phones !== undefined)
        updates.landline_phones = dto.landline_phones;
      if (dto.fax_numbers !== undefined) updates.fax_numbers = dto.fax_numbers;
      if (dto.email !== undefined) updates.email = dto.email;
      if (dto.website !== undefined) updates.website = dto.website;
      if (dto.address !== undefined) updates.address = dto.address;
      if (dto.work_hours !== undefined) updates.work_hours = dto.work_hours;
      if (dto.languages !== undefined) updates.languages = dto.languages;
      if (dto.tags !== undefined) updates.tags = dto.tags;
      if (dto.social_links !== undefined)
        updates.social_links = dto.social_links;
      if (dto.location !== undefined) updates.location = dto.location;
      if (dto.is_public !== undefined) updates.is_public = dto.is_public;

      // Update the entity
      existingCard.update(updates);

      // Persist changes
      const updatedCard = await this.cardRepository.update(
        dto.card_id,
        existingCard
      );

      if (!updatedCard) {
        throw new Error("Failed to update card");
      }

      return updatedCard;
    } catch (error: any) {
      throw error;
    }
  }
}
