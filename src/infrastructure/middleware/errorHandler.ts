import { Request, Response, NextFunction } from "express";
import { AppError } from "@shared/errors/AppError";
import { logger } from "@config/logger";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  logger.error("Unhandled error:", err);

  return res.status(500).json({
    message: "Internal server error",
  });
};
