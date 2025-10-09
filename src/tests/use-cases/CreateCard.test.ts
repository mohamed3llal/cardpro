import { CreateCardUseCase } from "@application/use-cases/card/CreateCard";
import { ICardRepository } from "@domain/interfaces/ICardRepository";
import { Card } from "@domain/entities/Card";
import { AppError } from "@shared/errors/AppError";

// Mock repository
class MockCardRepository implements ICardRepository {
  private cards: Card[] = [];

  async create(card: Card): Promise<Card> {
    this.cards.push(card);
    return card;
  }

  async findById(id: string): Promise<Card | null> {
    return this.cards.find((c) => c.id === id) || null;
  }

  async findByUserId(userId: string): Promise<Card[]> {
    return this.cards.filter((c) => c.userId === userId);
  }

  async update(id: string, card: Card): Promise<Card | null> {
    const index = this.cards.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.cards[index] = card;
    return card;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.cards.findIndex((c) => c.id === id);
    if (index === -1) return false;
    this.cards.splice(index, 1);
    return true;
  }

  async exists(id: string): Promise<boolean> {
    return this.cards.some((c) => c.id === id);
  }
}

describe("CreateCardUseCase", () => {
  let createCardUseCase: CreateCardUseCase;
  let mockRepository: MockCardRepository;

  beforeEach(() => {
    mockRepository = new MockCardRepository();
    createCardUseCase = new CreateCardUseCase(mockRepository);
  });

  it("should create a card successfully", async () => {
    const cardData = {
      title: "Test Card",
      description: "A test card description",
      domain: "technology",
      subdomain: "software",
      contact: {
        phone: "+1234567890",
        email: "test@example.com",
        website: "https://example.com",
      },
      location: {
        address: "123 Main St",
        city: "New York",
        lat: 40.7128,
        lng: -74.006,
      },
      images: [],
      rating: 4.5,
      languages: ["en"],
      availability: "available",
      tags: ["test"],
      isPublic: true,
    };

    const card = await createCardUseCase.execute("user123", cardData);

    expect(card.title).toBe("Test Card");
    expect(card.userId).toBe("user123");
    expect(card.rating).toBe(4.5);
  });

  it("should throw error for invalid card data", async () => {
    const invalidData = {
      title: "ab", // Too short
      description: "A test card description",
      domain: "technology",
      subdomain: "software",
      contact: {
        phone: "",
        email: "",
        website: "",
      },
      location: {
        address: "123 Main St",
        city: "New York",
        lat: 40.7128,
        lng: -74.006,
      },
      images: [],
      rating: 4.5,
      languages: [],
      availability: "available",
      tags: [],
      isPublic: true,
    };

    await expect(
      createCardUseCase.execute("user123", invalidData)
    ).rejects.toThrow(AppError);
  });
});

// ============================================
// Example: Integration Testing
// ============================================
// src/tests/integration/card.integration.test.ts
import request from "supertest";
import { Database } from "@config/database";
import Server from "../../server";

describe("Card API Integration Tests", () => {
  let authToken: string;
  let server: any;

  beforeAll(async () => {
    const database = Database.getInstance();
    await database.connect();
    server = new Server().getApp();

    // Mock authentication - in real scenario, create user and get token
    authToken = "Bearer mock_jwt_token";
  });

  afterAll(async () => {
    const database = Database.getInstance();
    await database.clearDatabase();
    await database.disconnect();
  });

  describe("POST /api/v1/cards", () => {
    it("should create a new card", async () => {
      const cardData = {
        title: "Test Card",
        description: "This is a test card for integration testing",
        domain: "technology",
        subdomain: "software",
        contact: {
          phone: "+1234567890",
          email: "test@example.com",
          website: "https://example.com",
        },
        location: {
          address: "123 Main St",
          city: "New York",
          lat: 40.7128,
          lng: -74.006,
        },
        images: [],
        rating: 4.5,
        languages: ["en"],
        availability: "available",
        tags: ["test"],
        isPublic: true,
      };

      const response = await request(server)
        .post("/api/v1/cards")
        .set("Authorization", authToken)
        .send(cardData)
        .expect(200);

      expect(response.body).toHaveProperty("_id");
      expect(response.body.title).toBe("Test Card");
    });

    it("should return 400 for invalid data", async () => {
      const invalidData = {
        title: "ab", // Too short
        description: "Description",
      };

      await request(server)
        .post("/api/v1/cards")
        .set("Authorization", authToken)
        .send(invalidData)
        .expect(400);
    });
  });
});
