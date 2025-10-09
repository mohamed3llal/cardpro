import Joi from "joi";

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),

  firstName: Joi.string().min(2).max(50).required().messages({
    "string.min": "First name must be at least 2 characters long",
    "any.required": "First name is required",
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    "string.min": "Last name must be at least 2 characters long",
    "any.required": "Last name is required",
  }),
  phone: Joi.string()
    .pattern(/^\+?[\d\s\-()]+$/)
    .optional()
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
    }),
});

export const googleAuthSchema = Joi.object({
  token: Joi.string().required().messages({
    "any.required": "Google ID token is required",
  }),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "any.required": "Refresh token is required",
  }),
});

export const updateProfileSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).optional(),
  last_name: Joi.string().min(2).max(50).optional(),
  bio: Joi.string().min(10).max(2000).optional(),
  city: Joi.string().min(2).max(100).optional(),
  phone: Joi.string()
    .pattern(/^\+?[\d\s\-()]+$/)
    .optional()
    .allow(""),
  avatar_url: Joi.string().uri().optional().allow(""),
});
