// src/presentation/validators/adminValidator.ts
import Joi from "joi";

export const createUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  fullName: Joi.string().min(3).max(100).required().messages({
    "string.min": "Full name must be at least 3 characters long",
    "any.required": "Full name is required",
  }),
  role: Joi.string()
    .valid("user", "admin", "moderator", "super_admin")
    .required()
    .messages({
      "any.only": "Role must be one of: user, admin, moderator, super_admin",
      "any.required": "Role is required",
    }),
});

export const updateUserRoleSchema = Joi.object({
  role: Joi.string()
    .valid("user", "admin", "moderator", "super_admin")
    .required()
    .messages({
      "any.only": "Role must be one of: user, admin, moderator, super_admin",
      "any.required": "Role is required",
    }),
});

export const createDomainSchema = Joi.object({
  key: Joi.string()
    .pattern(/^[a-z_]+$/)
    .required()
    .messages({
      "string.pattern.base":
        "Domain key must be lowercase with underscores only",
      "any.required": "Domain key is required",
    }),
  ar: Joi.string().required().messages({
    "any.required": "Arabic translation is required",
  }),
  fr: Joi.string().required().messages({
    "any.required": "French translation is required",
  }),
  en: Joi.string().required().messages({
    "any.required": "English translation is required",
  }),
  keywords: Joi.object({
    ar: Joi.array().items(Joi.string()).min(1).required(),
    fr: Joi.array().items(Joi.string()).min(1).required(),
    en: Joi.array().items(Joi.string()).min(1).required(),
  }).required(),
  subcategories: Joi.array()
    .items(
      Joi.object({
        key: Joi.string().pattern(/^[a-z_]+$/),
        ar: Joi.string().required(),
        fr: Joi.string().required(),
        en: Joi.string().required(),
        keywords: Joi.object({
          ar: Joi.array().items(Joi.string()).min(1).required(),
          fr: Joi.array().items(Joi.string()).min(1).required(),
          en: Joi.array().items(Joi.string()).min(1).required(),
        }).required(),
      })
    )
    .optional(),
});

export const updateReportStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "resolved", "dismissed")
    .required()
    .messages({
      "any.only": "Status must be one of: pending, resolved, dismissed",
      "any.required": "Status is required",
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
});

export const updateSubscriptionSchema = Joi.object({
  plan: Joi.string().valid("free", "pro", "premium").required().messages({
    "any.only": "Plan must be one of: free, pro, premium",
    "any.required": "Plan is required",
  }),
  expiresAt: Joi.string().isoDate().required().messages({
    "string.isoDate": "Expires at must be a valid ISO date",
    "any.required": "Expires at is required",
  }),
});
