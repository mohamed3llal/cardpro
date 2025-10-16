import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { AuthRequest } from "./authMiddleware";

export const createCardLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each user to 10 card creations per hour
  message: "Too many cards created from this account, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Use userId from authenticated request
    return (req as any).userId || req.ip;
  },
});

export const analyticsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: "Too many analytics requests, please try again later",
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter (stricter for login/signup)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Messaging rate limiter (60 messages per minute)
export const messagingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit each user to 60 messages per minute
  message: "Too many messages. Please wait a moment.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: AuthRequest) => {
    // Use user ID instead of IP for authenticated routes
    return req.userId ?? "";
  },
});

export const rateLimiter = {
  api: apiLimiter,
  auth: authLimiter,
  messaging: messagingLimiter,
};
