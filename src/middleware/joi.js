const joi = require("joi");

const registerSchema = joi.object({
    email: joi.string().email().lowercase().required(),
    password: joi.string().min(4).required(),
    name: joi.string().required(),
    photoProfile: joi.string(),
    phoneNumber: joi.number()
});

const loginSchema = joi.object({
    email: joi.string().email().lowercase().required(),
    password: joi.string().min(4).required()
});

const updateUserSchema = joi.object({
    email: joi.string().email().lowercase(),
    name: joi.string(),
    photoProfile: joi.string(),
    phoneNumber: joi.number()
});

const addFundSchema = joi.object({
    title: joi.string().required(),
    thumbnail: joi.string(),
    goal: joi.number().required(),
    description: joi.string().required(),
    userId: joi.number(),
    expiredDate: joi.number().required()
})

const updateFundSchema = joi.object({
    title: joi.string(),
    thumbnail: joi.string(),
    goal: joi.number(),
    description: joi.string(),
    userId: joi.number(),
    expiredDate: joi.number()
})



module.exports = {
    registerSchema,
    loginSchema,
    updateUserSchema,
    updateFundSchema,
    addFundSchema
}