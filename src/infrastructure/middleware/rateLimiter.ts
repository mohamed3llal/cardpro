import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

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
