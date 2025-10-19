// src/presentation/validators/favoriteValidator.ts

import Joi from "joi";

export const addToFavoritesSchema = Joi.object({
  business_id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid business ID format",
      "any.required": "business_id is required",
    }),
});

export const businessIdParamSchema = Joi.object({
  business_id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid business ID format",
      "any.required": "business_id is required",
    }),
});

export const getFavoriteBusinessesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),
});
