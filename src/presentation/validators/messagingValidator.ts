import Joi from "joi";

export const createConversationSchema = Joi.object({
  business_id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid business ID format",
      "any.required": "Business ID is required",
    }),
  initial_message: Joi.string().max(2000).optional().messages({
    "string.max": "Message cannot exceed 2000 characters",
  }),
});

export const sendMessageSchema = Joi.object({
  conversation_id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid conversation ID format",
      "any.required": "Conversation ID is required",
    }),
  content: Joi.string().min(1).max(2000).required().messages({
    "string.min": "Message cannot be empty",
    "string.max": "Message cannot exceed 2000 characters",
    "any.required": "Message content is required",
  }),
});

export const conversationIdParamSchema = Joi.object({
  conversationId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid conversation ID format",
      "any.required": "Conversation ID is required",
    }),
});

export const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).max(100).default(50).messages({
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),
});
