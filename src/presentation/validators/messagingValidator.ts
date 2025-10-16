import Joi from "joi";

export const startConversationSchema = Joi.object({
  business_id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid business ID format",
      "any.required": "Business ID is required",
    }),
  initial_message: Joi.string().min(1).max(1000).required().messages({
    "string.min": "Message cannot be empty",
    "string.max": "Message cannot exceed 1000 characters",
    "any.required": "Initial message is required",
  }),
});

export const sendMessageSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required().messages({
    "string.min": "Message cannot be empty",
    "string.max": "Message cannot exceed 2000 characters",
    "any.required": "Message content is required",
  }),
  type: Joi.string().valid("text", "image", "file", "location").default("text"),
  attachments: Joi.array().items(
    Joi.object({
      type: Joi.string().required(),
      url: Joi.string().uri().required(),
      thumbnail: Joi.string().uri().optional(),
      filename: Joi.string().optional(),
      size: Joi.number().optional(),
    })
  ),
});

export const archiveConversationSchema = Joi.object({
  is_archived: Joi.boolean().required().messages({
    "any.required": "is_archived field is required",
  }),
});

export const updateNotificationSettingsSchema = Joi.object({
  email_notifications: Joi.boolean().optional(),
  push_notifications: Joi.boolean().optional(),
  mute_until: Joi.date().iso().optional().allow(null),
});
