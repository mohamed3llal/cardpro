import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Configure DNS to use reliable servers
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1", "1.0.0.1"]);

// Connection state tracking
let isConnecting = false;
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY = 5000; // 5 seconds

export const connectMongoDB = async (): Promise<void> => {
  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    console.log("⏳ Connection attempt already in progress...");
    return;
  }

  isConnecting = true;

  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error(
        "MONGODB_URI environment variable is not set. Please check your .env file."
      );
    }

    // Validate URI format
    if (
      !mongoUri.startsWith("mongodb://") &&
      !mongoUri.startsWith("mongodb+srv://")
    ) {
      throw new Error(
        "Invalid MONGODB_URI format. Must start with 'mongodb://' or 'mongodb+srv://'"
      );
    }

    console.log("🔌 Attempting to connect to MongoDB...");
    connectionAttempts++;

    // Enhanced connection options
    const options = {
      // Connection timeouts
      serverSelectionTimeoutMS: 20000, // Increased to 20s
      connectTimeoutMS: 20000,
      socketTimeoutMS: 45000,

      // Connection pool settings
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 60000,

      // Retry settings
      retryWrites: true,
      retryReads: true,

      // Other options
      bufferCommands: false,
      autoIndex: process.env.NODE_ENV !== "production",

      // Family preference (IPv4)
      family: 4,

      // Application name for MongoDB logs
      appName: process.env.APP_NAME || "api-server",
    };

    // Connect to MongoDB
    await mongoose.connect(mongoUri, options);

    console.log("✅ Successfully connected to MongoDB!");
    console.log(`📍 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);

    // Reset connection attempts on success
    connectionAttempts = 0;
    isConnecting = false;

    // Set up event listeners
    setupEventListeners();

    // Test the connection
    await testConnection();

    // Setup graceful shutdown
    setupGracefulShutdown();
  } catch (error: any) {
    isConnecting = false;

    console.error("❌ MongoDB connection failed:", error.message);

    // Provide detailed error diagnostics
    diagnoseConnectionError(error);

    // Retry logic for development/staging
    if (shouldRetry()) {
      console.log(
        `🔄 Retry attempt ${connectionAttempts}/${MAX_RETRY_ATTEMPTS} in ${
          RETRY_DELAY / 1000
        }s...`
      );

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return connectMongoDB();
    }

    // Reset and throw error if max retries exceeded or in production
    connectionAttempts = 0;
    throw error;
  }
};

const setupEventListeners = (): void => {
  // Connection error handler
  mongoose.connection.on("error", (error) => {
    console.error("❌ MongoDB connection error:", error.message);
  });

  // Disconnection handler
  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB disconnected. Attempting to reconnect...");
  });

  // Reconnection handler
  mongoose.connection.on("reconnected", () => {
    console.log("✅ MongoDB reconnected successfully");
  });

  // Connection established
  mongoose.connection.on("connected", () => {
    console.log("🔗 MongoDB connection established");
  });

  // Index build events (useful for development)
  if (process.env.NODE_ENV === "development") {
    mongoose.connection.on("index", (index) => {
      console.log(`📇 Index created:`, index);
    });
  }
};

const testConnection = async (): Promise<void> => {
  try {
    if (mongoose.connection && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      console.log("✅ MongoDB connection test (ping) successful");

      // Additional connection validation
      const collections = await mongoose.connection.db
        .listCollections()
        .toArray();
      console.log(`📊 Found ${collections.length} collections in database`);
    }
  } catch (error) {
    console.error("❌ MongoDB connection test failed:", error);
    throw error;
  }
};

const setupGracefulShutdown = (): void => {
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n📴 ${signal} received. Closing MongoDB connection...`);

    try {
      await mongoose.connection.close();
      console.log("✅ MongoDB connection closed gracefully");
      process.exit(0);
    } catch (error) {
      console.error("❌ Error during MongoDB shutdown:", error);
      process.exit(1);
    }
  };

  // Handle different termination signals
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGUSR2", () => gracefulShutdown("SIGUSR2")); // nodemon restart
};

const diagnoseConnectionError = (error: any): void => {
  const errorMessage = error.message?.toLowerCase() || "";

  console.log("\n🔍 Error Diagnosis:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
    console.log("⏱️  CONNECTION TIMEOUT DETECTED");
    console.log("\nPossible causes:");
    console.log("  1. IP Address not whitelisted in MongoDB Atlas");
    console.log("     → Go to: https://cloud.mongodb.com");
    console.log("     → Navigate to: Network Access");
    console.log("     → Click: 'Add IP Address'");
    console.log("     → Add: 0.0.0.0/0 (allows all IPs - for development)");
    console.log("  2. MongoDB cluster is paused or stopped");
    console.log("  3. Network/firewall blocking connection");
    console.log("  4. VPN or proxy interference");
  } else if (
    errorMessage.includes("authentication") ||
    errorMessage.includes("auth")
  ) {
    console.log("🔐 AUTHENTICATION FAILED");
    console.log("\nPossible causes:");
    console.log("  1. Incorrect username or password");
    console.log("  2. User doesn't have proper database permissions");
    console.log("  3. Password contains special characters not URL-encoded");
    console.log("     → Use encodeURIComponent() for special characters");
  } else if (
    errorMessage.includes("enotfound") ||
    errorMessage.includes("getaddrinfo")
  ) {
    console.log("🌐 DNS RESOLUTION FAILED");
    console.log("\nPossible causes:");
    console.log("  1. Incorrect MongoDB cluster hostname");
    console.log("  2. DNS server issues");
    console.log("  3. Network connectivity problems");
    console.log("  4. Cluster doesn't exist or was deleted");
  } else if (errorMessage.includes("econnrefused")) {
    console.log("🚫 CONNECTION REFUSED");
    console.log("\nPossible causes:");
    console.log("  1. MongoDB service not running");
    console.log("  2. Incorrect port number");
    console.log("  3. Firewall blocking connection");
  } else if (
    errorMessage.includes("network") ||
    errorMessage.includes("eai_again")
  ) {
    console.log("📡 NETWORK ERROR");
    console.log("\nPossible causes:");
    console.log("  1. No internet connection");
    console.log("  2. Network instability");
    console.log("  3. DNS resolution issues");
    console.log("  4. Proxy/VPN interference");
  }

  console.log("\n💡 Quick Fixes:");
  console.log("  • Verify MONGODB_URI in .env file");
  console.log("  • Check MongoDB Atlas dashboard: https://cloud.mongodb.com");
  console.log("  • Ensure cluster is running (not paused)");
  console.log("  • Whitelist IP: 0.0.0.0/0 for testing");
  console.log("  • Test connection string with MongoDB Compass");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
};

const shouldRetry = (): boolean => {
  const isProduction = process.env.NODE_ENV === "production";
  const hasAttemptsLeft = connectionAttempts < MAX_RETRY_ATTEMPTS;

  return !isProduction && hasAttemptsLeft;
};

// Utility functions
export const getConnectionStatus = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return {
    state,
    status: states[state as keyof typeof states] || "unknown",
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    isConnected: state === 1,
    port: mongoose.connection.port,
  };
};

export const waitForConnection = async (
  timeoutMs: number = 15000
): Promise<boolean> => {
  const startTime = Date.now();
  const checkInterval = 100;

  console.log(`⏳ Waiting for MongoDB connection (timeout: ${timeoutMs}ms)...`);

  while (Date.now() - startTime < timeoutMs) {
    if (mongoose.connection.readyState === 1) {
      console.log("✅ MongoDB connection verified");
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, checkInterval));
  }

  console.error("❌ MongoDB connection timeout");
  return false;
};

export const disconnectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log("✅ MongoDB disconnected successfully");
  } catch (error) {
    console.error("❌ Error disconnecting from MongoDB:", error);
    throw error;
  }
};

// Health check function
export const checkDatabaseHealth = async (): Promise<{
  isHealthy: boolean;
  latency: number;
  details: any;
}> => {
  const startTime = Date.now();

  try {
    if (!mongoose.connection.db) {
      return {
        isHealthy: false,
        latency: -1,
        details: { error: "Database connection not established" },
      };
    }

    await mongoose.connection.db.admin().ping();
    const latency = Date.now() - startTime;

    return {
      isHealthy: true,
      latency,
      details: getConnectionStatus(),
    };
  } catch (error) {
    return {
      isHealthy: false,
      latency: Date.now() - startTime,
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};
