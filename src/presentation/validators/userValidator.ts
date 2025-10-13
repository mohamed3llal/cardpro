// src/presentation/validators/userValidator.ts

import Joi from "joi";

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).trim().optional().messages({
    "string.min": "First name must be at least 2 characters long",
    "string.max": "First name cannot exceed 50 characters",
  }),

  lastName: Joi.string().min(2).max(50).trim().optional().messages({
    "string.min": "Last name must be at least 2 characters long",
    "string.max": "Last name cannot exceed 50 characters",
  }),

  phone: Joi.string()
    .pattern(/^\+?[\d\s\-()]+$/)
    .allow("")
    .optional()
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
    }),

  avatar: Joi.string().uri().allow("").optional().messages({
    "string.uri": "Avatar must be a valid URL",
  }),

  bio: Joi.string().min(10).max(500).trim().allow("").optional().messages({
    "string.min": "Bio must be at least 10 characters long",
    "string.max": "Bio cannot exceed 500 characters",
  }),

  city: Joi.string().min(2).max(100).trim().allow("").optional().messages({
    "string.min": "City must be at least 2 characters long",
    "string.max": "City cannot exceed 100 characters",
  }),

  domain_key: Joi.string()
    .pattern(/^[a-z_]+$/)
    .optional()
    .messages({
      "string.pattern.base":
        "Domain key must be lowercase with underscores only",
    }),

  subcategory_key: Joi.string()
    .pattern(/^[a-z_]+$/)
    .optional()
    .messages({
      "string.pattern.base":
        "Subcategory key must be lowercase with underscores only",
    }),
})
  .custom((value, helpers) => {
    // If one of domain/subcategory is provided, both must be provided
    if (
      (value.domain_key && !value.subcategory_key) ||
      (!value.domain_key && value.subcategory_key)
    ) {
      return helpers.error("custom.domainSubcategory");
    }
    return value;
  }, "Domain and Subcategory validation")
  .messages({
    "custom.domainSubcategory":
      "Both domain and subcategory must be provided together",
  });

export const changeUserRoleSchema = Joi.object({
  role: Joi.string()
    .valid("user", "admin", "moderator", "super_admin")
    .required()
    .messages({
      "any.only": "Role must be one of: user, admin, moderator, super_admin",
      "any.required": "Role is required",
    }),
});

export const createUserSchema = Joi.object({
  email: Joi.string().email().required().trim().lowercase().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),

  firstName: Joi.string().min(2).max(50).required().trim().messages({
    "string.min": "First name must be at least 2 characters long",
    "string.max": "First name cannot exceed 50 characters",
    "any.required": "First name is required",
  }),

  lastName: Joi.string().min(2).max(50).required().trim().messages({
    "string.min": "Last name must be at least 2 characters long",
    "string.max": "Last name cannot exceed 50 characters",
    "any.required": "Last name is required",
  }),

  phone: Joi.string()
    .pattern(/^\+?[\d\s\-()]+$/)
    .optional()
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
    }),

  role: Joi.string()
    .valid("user", "admin", "moderator")
    .default("user")
    .messages({
      "any.only": "Role must be one of: user, admin, moderator",
    }),

  avatar: Joi.string().uri().optional().messages({
    "string.uri": "Avatar must be a valid URL",
  }),
});

export const userIdParamSchema = Joi.object({
  userId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid user ID format",
      "any.required": "User ID is required",
    }),
});

export const updateDomainSchema = Joi.object({
  domain_key: Joi.string()
    .pattern(/^[a-z_]+$/)
    .required()
    .messages({
      "string.pattern.base":
        "Domain key must be lowercase with underscores only",
      "any.required": "Domain key is required",
    }),

  subcategory_key: Joi.string()
    .pattern(/^[a-z_]+$/)
    .required()
    .messages({
      "string.pattern.base":
        "Subcategory key must be lowercase with underscores only",
      "any.required": "Subcategory key is required",
    }),
});
