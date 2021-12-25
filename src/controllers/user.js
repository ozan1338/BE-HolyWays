const {registerSchema,loginSchema} = require('../middleware/joi')
const createError = require('http-errors')
const {createToken} = require('../middleware/jwt')
const bcrypt = require('bcrypt')
const {user} = require('../../models')

//Create Controller register User here
const registerUser = async(req,res,next) => {
    try {
        //check if user input is valid or not
        const valid = await registerSchema.validateAsync(req.body)
        const {name} = valid

        //search if email user is already register
        const doesExist = await user.findAll({
            where: {
                email: valid.email
            }
        })

        //if email user is alredy register throw an error siwth conflict and message
        if(doesExist.length !== 0){
            throw createError.Conflict(`${valid.email} is already register`);
        }

        //save user input to db
        const data = await user.create(valid, (err)=>{
            if(err){
                throw createError.InternalServerError();
            }
        });

        //create token for user
        const token = await createToken(data.id,data.name,data.email);


        res.send({
            status: "success",
            data: {user: {
                name,
                token
            }}
        })

    } catch (err) {
        //check if the error is form joi or not
        if(err.isJoi === true){
            //if is from joi give the status 422 or unproccesable
            err.status = 422
        }
        console.log(err);
        next(err)
    }
}

//create controller for login user here
const loginUser = async(req,res,next) => {
    try {
        //check if user email and password is valid
        const valid = await loginSchema.validateAsync(req.body)
        const {email,password} = valid

        //search if email is in db or not
        const data = await user.findAll({
            where:{
                email
            },
        });

        //if email that user input there is no in our db throw error with message
        if(!data[0]){
            throw createError.NotFound("User Not Register")
        }
        //compare password that user input and password in our database
        const isMatch = await bcrypt.compare(password, data[0].password)
        
        //if not match throw error with message
        if(!isMatch){
            throw createError.Unauthorized('Username or Password invalid')
        }

        //create token
        const token = await createToken(data[0].id,data[0].name,data[0].email)
        const {name} = data[0]

        res.send({
            status:"success",
            data: {user: {
                email,
                name,
                token
            }}
        })
    } catch (err) {
        //check if user is from joi
        if(err.isJoi === true){
            //if its from joi set the err.status 422 unprocessable entity
            err.status = 422
        }
        console.log(err);
        next(err)
    }
}

const getUsers = async(req,res,next) => {
    try{
        const users = await user.findAll({
            attributes: {
                exclude: ["password","createdAt","updatetAt"]
            }
        })

        res.send({
            status: "success",
            data: {user: [...users]}
        })
    }catch(err){
        console.log(err);
        next(err)
    }
}

const deleteUser = async(req,res,next) => {
    try {
        //destructure the id from request params
        const {id} = req.params;
        //console.log(id);

        //delete user with condition id from request params and id from id from db
        await user.destroy({
            where:{
                id
            }
        },(err)=>{
            //check if there is error when deleting data and throw error
            if(err){
                throw createError.InternalServerError()
            }
        })

        res.send({
            status: "success",
            data: {id}
        })

    } catch (err) {
        console.log(err);
        next(err)
    }
}

module.exports = {
    registerUser,
    loginUser,
    getUsers,
    deleteUser
}