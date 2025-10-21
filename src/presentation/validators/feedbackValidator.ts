// src/presentation/validators/feedbackValidator.ts

import Joi from "joi";

export const submitFeedbackSchema = Joi.object({
  card_id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid card ID format",
      "any.required": "card_id is required",
    }),

  feedback_type: Joi.string()
    .valid("general", "bug", "feature", "improvement", "question")
    .required()
    .messages({
      "any.only":
        "feedback_type must be one of: general, bug, feature, improvement, question",
      "any.required": "feedback_type is required",
    }),

  subject: Joi.string().min(3).max(100).required().trim().messages({
    "string.min": "Subject must be at least 3 characters long",
    "string.max": "Subject cannot exceed 100 characters",
    "any.required": "Subject is required",
  }),

  message: Joi.string().min(10).max(1000).required().trim().messages({
    "string.min": "Message must be at least 10 characters long",
    "string.max": "Message cannot exceed 1000 characters",
    "any.required": "Message is required",
  }),

  email: Joi.string().email().max(255).optional().trim().messages({
    "string.email": "Please provide a valid email address",
    "string.max": "Email cannot exceed 255 characters",
  }),

  rating: Joi.number().integer().min(1).max(5).optional().messages({
    "number.min": "Rating must be between 1 and 5",
    "number.max": "Rating must be between 1 and 5",
  }),
});

export const updateFeedbackStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "reviewed", "resolved")
    .required()
    .messages({
      "any.only": "Status must be one of: pending, reviewed, resolved",
      "any.required": "Status is required",
    }),

  admin_notes: Joi.string().max(1000).optional().trim().messages({
    "string.max": "Admin notes cannot exceed 1000 characters",
  }),
});

export const feedbackIdParamSchema = Joi.object({
  feedbackId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid feedback ID format",
      "any.required": "Feedback ID is required",
    }),
});

export const getFeedbackQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.min": "Page must be at least 1",
  }),

  limit: Joi.number().integer().min(1).max(100).default(50).messages({
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),

  status: Joi.string()
    .valid("all", "pending", "reviewed", "resolved")
    .default("all")
    .messages({
      "any.only": "Status must be one of: all, pending, reviewed, resolved",
    }),

  feedback_type: Joi.string()
    .valid("all", "general", "bug", "feature", "improvement", "question")
    .default("all")
    .messages({
      "any.only":
        "feedback_type must be one of: all, general, bug, feature, improvement, question",
    }),

  rating: Joi.number().integer().min(1).max(5).optional().messages({
    "number.min": "Rating must be between 1 and 5",
    "number.max": "Rating must be between 1 and 5",
  }),
});
