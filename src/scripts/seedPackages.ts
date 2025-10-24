// src/scripts/seedPackages.ts

import dotenv from "dotenv";
dotenv.config();

import { connectMongoDB } from "../config/database";
import { PackageModel } from "../infrastructure/database/models/PackageModel";
import { logger } from "../config/logger";

const packages = [
  {
    name: "Free Plan",
    tier: "free",
    price: 0,
    currency: "USD",
    interval: "month",
    description: "Perfect for getting started with basic features",
    isActive: true,
    features: {
      maxCards: 1,
      maxBoosts: 0,
      canExploreCards: true,
      prioritySupport: false,
      verificationBadge: false,
      advancedAnalytics: false,
      customBranding: false,
      apiAccess: false,
    },
  },
  {
    name: "Basic Plan",
    tier: "basic",
    price: 9.99,
    currency: "USD",
    interval: "month",
    description: "Great for individuals and small businesses",
    isActive: true,
    features: {
      maxCards: 5,
      maxBoosts: 3,
      canExploreCards: true,
      prioritySupport: false,
      verificationBadge: true,
      advancedAnalytics: false,
      customBranding: false,
      apiAccess: false,
    },
  },
  {
    name: "Premium Plan",
    tier: "premium",
    price: 29.99,
    currency: "USD",
    interval: "month",
    description: "For growing businesses that need more features",
    isActive: true,
    features: {
      maxCards: 20,
      maxBoosts: 10,
      canExploreCards: true,
      prioritySupport: true,
      verificationBadge: true,
      advancedAnalytics: true,
      customBranding: false,
      apiAccess: false,
    },
  },
  {
    name: "Business Plan",
    tier: "business",
    price: 99.99,
    currency: "USD",
    interval: "month",
    description: "Enterprise solution with unlimited features",
    isActive: true,
    features: {
      maxCards: -1, // Unlimited
      maxBoosts: -1, // Unlimited
      canExploreCards: true,
      prioritySupport: true,
      verificationBadge: true,
      advancedAnalytics: true,
      customBranding: true,
      apiAccess: true,
    },
  },
];

async function seedPackages() {
  try {
    logger.info("🌱 Starting package seeder...");

    // Connect to database
    await connectMongoDB();
    logger.info("✅ Connected to database");

    // Clear existing packages (optional)
    const existingCount = await PackageModel.countDocuments();
    if (existingCount > 0) {
      logger.info(`⚠️ Found ${existingCount} existing packages`);
      const shouldClear = process.argv.includes("--clear");

      if (shouldClear) {
        await PackageModel.deleteMany({});
        logger.info("🗑️ Cleared existing packages");
      } else {
        logger.info("ℹ️ Skipping package creation (use --clear to override)");
        process.exit(0);
      }
    }

    // Insert packages
    const result = await PackageModel.insertMany(packages);
    logger.info(`✅ Successfully created ${result.length} packages`);

    // Display created packages
    result.forEach((pkg: any) => {
      logger.info(`
📦 ${pkg.name} (${pkg.tier})
   - Price: $${pkg.price}/${pkg.interval}
   - Max Cards: ${
     pkg.features.maxCards === -1 ? "Unlimited" : pkg.features.maxCards
   }
   - Max Boosts: ${
     pkg.features.maxBoosts === -1 ? "Unlimited" : pkg.features.maxBoosts
   }
   - ID: ${pkg._id}
      `);
    });

    logger.info("✅ Package seeding completed successfully");
    process.exit(0);
  } catch (error) {
    logger.error("❌ Package seeding failed:", error);
    process.exit(1);
  }
}

// Run seeder
seedPackages();
