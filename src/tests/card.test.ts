import { Card } from "@domain/entities/Card";
import { Contact } from "@domain/value-objects/Contact";
import { Location } from "@domain/value-objects/Location";

describe("Card Entity", () => {
  const validContact = new Contact(
    "+1234567890",
    "test@example.com",
    "https://example.com"
  );

  const validLocation = new Location(
    "123 Main St",
    "New York",
    40.7128,
    -74.006
  );

  const validCardProps = {
    userId: "user123",
    title: "Test Card",
    description: "This is a test card description",
    domain: "technology",
    subdomain: "software",
    contact: validContact,
    location: validLocation,
    images: [],
    rating: 4.5,
    languages: ["en", "fr"],
    availability: "available",
    tags: ["test", "sample"],
    isPublic: true,
    isVerified: false,
  };

  it("should create a valid card", () => {
    const card = new Card(validCardProps);
    expect(card.title).toBe("Test Card");
    expect(card.rating).toBe(4.5);
  });

  it("should throw error for invalid title", () => {
    const invalidProps = { ...validCardProps, title: "ab" };
    expect(() => new Card(invalidProps)).toThrow(
      "Title must be at least 3 characters long"
    );
  });

  it("should throw error for invalid rating", () => {
    const invalidProps = { ...validCardProps, rating: 6 };
    expect(() => new Card(invalidProps)).toThrow(
      "Rating must be between 0 and 5"
    );
  });

  it("should toggle visibility", () => {
    const card = new Card(validCardProps);
    expect(card.isPublic).toBe(true);
    card.toggleVisibility();
    expect(card.isPublic).toBe(false);
  });

  it("should update rating", () => {
    const card = new Card(validCardProps);
    card.updateRating(3.5);
    expect(card.rating).toBe(3.5);
  });
});
