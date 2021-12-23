const joi = require("joi");

const registerSchema = joi.object({
    email: joi.string().email().lowercase().required(),
    password: joi.string().min(4).required(),
    name: joi.string().required()
});

const loginSchema = joi.object({
    email: joi.string().email().lowercase().required(),
    password: joi.string().min(4).required()
});

module.exports = {
    registerSchema,
    loginSchema
}