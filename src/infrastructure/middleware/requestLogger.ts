import { Request, Response, NextFunction } from "express";
import { logger } from "@config/logger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  // Log request
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  // Log response
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    logger.info(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });

  next();
};
