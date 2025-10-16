import Joi from "joi";

// 🛡️ Common reusable regex validations
const scriptPattern = /<script[^>]*>.*?<\/script>/gi;
const jsPattern = /javascript:/gi;
const eventPattern = /on\w+=/gi;

// 🔍 Shared message content validator (protects from XSS)
const messageSecurityValidation = (value: string, helpers: any) => {
  if (
    scriptPattern.test(value) ||
    jsPattern.test(value) ||
    eventPattern.test(value)
  ) {
    return helpers.error("any.invalid", { message: "Invalid message content" });
  }
  return value;
};

// 🧩 Joi schema definitions
export const messagingValidator = {
  /** ✅ Create Conversation */
  createConversation: Joi.object({
    business_id: Joi.string().required().messages({
      "string.base": "Business ID must be a string",
      "any.required": "Business ID is required",
    }),

    initial_message: Joi.string()
      .max(2000)
      .custom(messageSecurityValidation)
      .messages({
        "string.base": "Initial message must be a string",
        "string.max": "Message must be less than 2000 characters",
        "any.invalid": "Invalid message content",
      })
      .optional(),
  }),

  /** ✅ Send Message */
  sendMessage: Joi.object({
    conversation_id: Joi.string().required().messages({
      "string.base": "Conversation ID must be a string",
      "any.required": "Conversation ID is required",
    }),

    content: Joi.string()
      .trim()
      .min(1)
      .max(2000)
      .required()
      .custom(messageSecurityValidation)
      .messages({
        "string.base": "Message content must be a string",
        "string.empty": "Message content is required",
        "string.min": "Message must be between 1 and 2000 characters",
        "string.max": "Message must be between 1 and 2000 characters",
        "any.invalid": "Invalid message content",
      }),
  }),

  /** ✅ Get Messages (with pagination) */
  getMessages: Joi.object({
    conversationId: Joi.string().required().messages({
      "string.base": "Conversation ID must be a string",
      "any.required": "Conversation ID is required",
    }),

    page: Joi.number().integer().min(1).optional().messages({
      "number.base": "Page must be a positive integer",
      "number.min": "Page must be a positive integer",
    }),

    limit: Joi.number().integer().min(1).max(100).optional().messages({
      "number.base": "Limit must be a number",
      "number.min": "Limit must be between 1 and 100",
      "number.max": "Limit must be between 1 and 100",
    }),
  }),

  /** ✅ Validate Conversation ID only */
  conversationId: Joi.object({
    conversationId: Joi.string().required().messages({
      "string.base": "Conversation ID must be a string",
      "any.required": "Conversation ID is required",
    }),
  }),

  /** ✅ Pagination only (shared schema) */
  pagination: Joi.object({
    page: Joi.number().integer().min(1).optional().messages({
      "number.base": "Page must be a positive integer",
      "number.min": "Page must be a positive integer",
    }),
    limit: Joi.number().integer().min(1).max(100).optional().messages({
      "number.base": "Limit must be a number",
      "number.min": "Limit must be between 1 and 100",
      "number.max": "Limit must be between 1 and 100",
    }),
  }),
};
