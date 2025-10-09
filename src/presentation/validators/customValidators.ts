import Joi from "joi";

export const mongoIdValidator = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

export const phoneValidator = Joi.string().regex(/^\+?[\d\s\-()]+$/);

export const coordinateValidator = {
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
};
