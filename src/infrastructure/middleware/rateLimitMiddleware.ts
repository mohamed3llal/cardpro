// src/infrastructure/middleware/rateLimitMiddleware.ts
import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  message?: string;
}

export const rateLimitMiddleware = (options: RateLimitOptions) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message || {
      error: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later.",
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        error: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests from this IP, please try again later.",
        retry_after: Math.ceil(options.windowMs / 1000),
      });
    },
    skip: (req: Request) => {
      // Skip rate limiting for admin users (optional)
      return false;
    },
  });
};

// Pre-configured rate limiters
export const searchRateLimit = rateLimitMiddleware({
  windowMs: 60000, // 1 minute
  max: 100,
});

export const detailRateLimit = rateLimitMiddleware({
  windowMs: 60000, // 1 minute
  max: 200,
});

export const analyticsRateLimit = rateLimitMiddleware({
  windowMs: 60000, // 1 minute
  max: 1000,
});
