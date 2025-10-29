import Joi from "joi";
import { celebrate, Segments } from "celebrate";

export default class packageValidators {
  // Subscribe to package
  static subscribe = Joi.object({
    packageId: Joi.string()
      .required()
      .regex(/^[0-9a-fA-F]{24}$/)
      .messages({
        "string.empty": "Package ID is required",
        "string.pattern.base": "Invalid package ID",
      }),
    paymentMethodId: Joi.string().optional().messages({
      "string.base": "Payment method ID must be a string",
    }),
  });

  // Cancel subscription
  static cancel = Joi.object({
    reason: Joi.string().max(500).optional().messages({
      "string.base": "Reason must be a string",
      "string.max": "Reason must not exceed 500 characters",
    }),
    cancelImmediately: Joi.boolean().optional().messages({
      "boolean.base": "cancelImmediately must be a boolean",
    }),
  });

  // Boost card
  static boostCard = Joi.object({
    [Segments.BODY]: Joi.object({
      duration: Joi.number().integer().min(1).max(30).required().messages({
        "any.required": "Duration is required",
        "number.base": "Duration must be a number",
        "number.min": "Duration must be at least 1 day",
        "number.max": "Duration must be at most 30 days",
      }),
    }),
  });

  // Create package (Admin)
  static createPackage = Joi.object({
    name: Joi.string().min(3).max(100).required().trim().messages({
      "any.required": "Package name is required",
      "string.min": "Package name must be between 3 and 100 characters",
      "string.max": "Package name must be between 3 and 100 characters",
    }),
    tier: Joi.string()
      .valid("free", "basic", "premium", "business")
      .required()
      .messages({
        "any.required": "Tier is required",
        "any.only": "Invalid tier",
      }),
    price: Joi.number().min(0).required().messages({
      "any.required": "Price is required",
      "number.min": "Price must be a positive number",
    }),
    currency: Joi.string().length(3).required().uppercase().messages({
      "any.required": "Currency is required",
      "string.length": "Currency must be a 3-letter code",
    }),
    interval: Joi.string().valid("month", "year").required().messages({
      "any.required": "Interval is required",
      "any.only": "Interval must be month or year",
    }),
    description: Joi.string().min(10).max(500).required().messages({
      "any.required": "Description is required",
      "string.min": "Description must be between 10 and 500 characters",
      "string.max": "Description must be between 10 and 500 characters",
    }),
    features: Joi.object({
      maxCards: Joi.number().integer().min(0).required().messages({
        "any.required": "maxCards is required",
      }),
      maxBoosts: Joi.number().integer().min(0).required().messages({
        "any.required": "maxBoosts is required",
      }),
      canExploreCards: Joi.boolean().required().messages({
        "any.required": "canExploreCards is required",
      }),
      prioritySupport: Joi.boolean().required().messages({
        "any.required": "prioritySupport is required",
      }),
      verificationBadge: Joi.boolean().required().messages({
        "any.required": "verificationBadge is required",
      }),
      advancedAnalytics: Joi.boolean().required().messages({
        "any.required": "advancedAnalytics is required",
      }),
      customBranding: Joi.boolean().required().messages({
        "any.required": "customBranding is required",
      }),
      apiAccess: Joi.boolean().required().messages({
        "any.required": "apiAccess is required",
      }),
    }).required(),
    isActive: Joi.boolean().optional(),
  });

  // Update package (Admin)
  static updatePackage = Joi.object({
    id: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.empty": "Package ID is required",
        "string.pattern.base": "Invalid package ID",
      }),
    [Segments.BODY]: Joi.object({
      name: Joi.string().min(3).max(100).optional().trim(),
      tier: Joi.string()
        .valid("free", "basic", "premium", "business")
        .optional(),
      price: Joi.number().min(0).optional(),
      currency: Joi.string().length(3).optional().uppercase(),
      interval: Joi.string().valid("month", "year").optional(),
      description: Joi.string().min(10).max(500).optional(),
      isActive: Joi.boolean().optional(),
    }),
  });

  // Delete package (Admin)
  static deletePackage = Joi.object({
    id: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.empty": "Package ID is required",
        "string.pattern.base": "Invalid package ID",
      }),
  });

  // Schedule package (Admin)
  static schedulePackage = Joi.object({
    id: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.empty": "Package ID is required",
        "string.pattern.base": "Invalid package ID",
      }),
    [Segments.BODY]: Joi.object({
      scheduledActivateAt: Joi.date().iso().optional().messages({
        "date.format": "scheduledActivateAt must be a valid date",
      }),
      scheduledDeactivateAt: Joi.date().iso().optional().messages({
        "date.format": "scheduledDeactivateAt must be a valid date",
      }),
    }),
  });

  // Pagination
  static pagination = Joi.object({
    page: Joi.number().integer().min(1).optional().messages({
      "number.min": "Page must be a positive integer",
    }),
    limit: Joi.number().integer().min(1).max(100).optional().messages({
      "number.min": "Limit must be between 1 and 100",
      "number.max": "Limit must be between 1 and 100",
    }),
  });

  // Date range
  static dateRange = Joi.object({
    startDate: Joi.date().iso().optional().messages({
      "date.format": "startDate must be a valid date",
    }),
    endDate: Joi.date().iso().optional().messages({
      "date.format": "endDate must be a valid date",
    }),
  });

  // Send reminder (Admin)
  static sendReminder = Joi.object({
    userId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.empty": "User ID is required",
        "string.pattern.base": "Invalid user ID",
      }),
    packageId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.empty": "Package ID is required",
        "string.pattern.base": "Invalid package ID",
      }),
    type: Joi.string().valid("renewal", "upgrade").required().messages({
      "any.required": "Type is required",
      "any.only": "Type must be renewal or upgrade",
    }),
  });

  // Get package subscribers (Admin)
  static getSubscribers = Joi.object({
    packageId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.empty": "Package ID is required",
        "string.pattern.base": "Invalid package ID",
      }),
  });
}
