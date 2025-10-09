import Joi from "joi";

export const createCardSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).max(2000).required(),
  domain: Joi.string().required(),
  subdomain: Joi.string().required(),
  contact: Joi.object({
    phone: Joi.string().allow(""),
    email: Joi.string().email().allow(""),
    website: Joi.string().uri().allow(""),
  }).required(),
  location: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
  }).required(),
  images: Joi.array().items(Joi.string().uri()),
  rating: Joi.number().min(0).max(5).default(0),
  languages: Joi.array().items(Joi.string()),
  availability: Joi.string().default("available"),
  tags: Joi.array().items(Joi.string()),
  isPublic: Joi.boolean().default(true),
});

export const updateCardSchema = Joi.object({
  title: Joi.string().min(3).max(200),
  description: Joi.string().min(10).max(2000),
  domain: Joi.string(),
  subdomain: Joi.string(),
  contact: Joi.object({
    phone: Joi.string().allow(""),
    email: Joi.string().email().allow(""),
    website: Joi.string().uri().allow(""),
  }),
  location: Joi.object({
    address: Joi.string(),
    city: Joi.string(),
    lat: Joi.number().min(-90).max(90),
    lng: Joi.number().min(-180).max(180),
  }),
  images: Joi.array().items(Joi.string().uri()),
  rating: Joi.number().min(0).max(5),
  languages: Joi.array().items(Joi.string()),
  availability: Joi.string(),
  tags: Joi.array().items(Joi.string()),
  isPublic: Joi.boolean(),
});
