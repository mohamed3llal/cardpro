// src/presentation/validators/reviewValidator.ts

import Joi from "joi";

export const createReviewSchema = Joi.object({
  business_id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid business ID format",
      "any.required": "Business ID is required",
    }),

  rating: Joi.number().integer().min(1).max(5).required().messages({
    "number.min": "Rating must be between 1 and 5",
    "number.max": "Rating must be between 1 and 5",
    "any.required": "Rating is required",
  }),

  title: Joi.string().min(3).max(100).required().trim().messages({
    "string.min": "Title must be at least 3 characters long",
    "string.max": "Title cannot exceed 100 characters",
    "any.required": "Title is required",
  }),

  comment: Joi.string().min(10).max(2000).required().trim().messages({
    "string.min": "Comment must be at least 10 characters long",
    "string.max": "Comment cannot exceed 2000 characters",
    "any.required": "Comment is required",
  }),
});

export const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).optional().messages({
    "number.min": "Rating must be between 1 and 5",
    "number.max": "Rating must be between 1 and 5",
  }),

  title: Joi.string().min(3).max(100).optional().trim().messages({
    "string.min": "Title must be at least 3 characters long",
    "string.max": "Title cannot exceed 100 characters",
  }),

  comment: Joi.string().min(10).max(2000).optional().trim().messages({
    "string.min": "Comment must be at least 10 characters long",
    "string.max": "Comment cannot exceed 2000 characters",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

export const reviewIdParamSchema = Joi.object({
  reviewId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid review ID format",
      "any.required": "Review ID is required",
    }),
});

export const businessIdParamSchema = Joi.object({
  businessId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid business ID format",
      "any.required": "Business ID is required",
    }),
});

export const getPaginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.min": "Page must be at least 1",
  }),

  limit: Joi.number().integer().min(1).max(50).default(10).messages({
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 50",
  }),
});

export const getAdminReviewsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.min": "Page must be at least 1",
  }),

  limit: Joi.number().integer().min(1).max(100).default(50).messages({
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),

  status: Joi.string()
    .valid("all", "flagged", "verified")
    .default("all")
    .messages({
      "any.only": "Status must be one of: all, flagged, verified",
    }),
});
