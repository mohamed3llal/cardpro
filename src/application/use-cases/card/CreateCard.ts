// src/application/use-cases/card/CreateCard.ts

import { Card, CardProps } from "@domain/entities/Card";
import { ICardRepository } from "@domain/interfaces/ICardRepository";
import { IPackageRepository } from "@domain/interfaces/IPackageRepository";
import { AppError } from "@shared/errors/AppError";

export interface CreateCardDTO {
  user_id: string;
  title: string;
  company?: string;
  domain_key: string;
  subdomain_key?: string;
  subdomain?: string;
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
  constructor(
    private readonly cardRepository: ICardRepository,
    private readonly packageRepository: IPackageRepository
  ) {}

  async execute(dto: CreateCardDTO): Promise<Card> {
    try {
      // 1. Get user's active subscription
      const subscription =
        await this.packageRepository.getUserActiveSubscription(dto.user_id);

      if (!subscription) {
        throw new AppError(
          "No active subscription found. Please subscribe to a package to create cards.",
          402
        );
      }

      // 2. Get package details
      const pkg = await this.packageRepository.getPackageById(
        subscription.packageId
      );

      if (!pkg) {
        throw new AppError("Package not found", 404);
      }

      // 3. Get current usage
      const usage = await this.packageRepository.getPackageUsage(dto.user_id);

      if (!usage) {
        throw new AppError("Usage data not found", 404);
      }

      // 4. Check card limit
      if (usage.cardsCreated >= pkg.features.maxCards) {
        throw new AppError(
          `Card limit reached. Your ${pkg.name} plan allows ${pkg.features.maxCards} card(s). Please upgrade your plan to create more cards.`,
          403
        );
      }

      // 5. Create card entity (validation happens in constructor)
      const cardProps: CardProps = {
        user_id: dto.user_id,
        title: dto.title,
        company: dto.company,
        domain_key: dto.domain_key,
        subdomain_key: dto.subdomain_key || dto.subdomain,
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
        is_public: dto.is_public !== undefined ? dto.is_public : true,
      };

      const card = Card.create(cardProps);

      // 6. Create card in database
      const createdCard = await this.cardRepository.create(card);

      // 7. Increment usage counter
      await this.packageRepository.incrementCardUsage(dto.user_id);

      return createdCard;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new Error(`Failed to create card: ${error.message}`);
    }
  }
}
