const {registerSchema,loginSchema, updateUserSchema} = require('../middleware/joi')
const createError = require('http-errors')
const {createToken} = require('../middleware/jwt')
const bcrypt = require('bcrypt')
const {user, transaction, fund, profile} = require('../../models')

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
        const data = await user.create({
            ...valid,
            photoProfile: "",
            phoneNumber: ""
        }, (err)=>{
            if(err){
                throw createError.InternalServerError();
            }
        });

        //create token for user
        const token = await createToken(data.id);


        res.send({
            status: "success",
            data: {user: {
                name,
                token,
                id: data.id
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
        console.log(req.body);
        const valid = await loginSchema.validateAsync(req.body)
        const {email,password} = valid

        //search if email is in db or not
        const data = await user.findOne({
            where:{
                email
            },
        });

        //if email that user input there is no in our db throw error with message
        if(!data){
            throw createError.NotFound("User Not Register")
        }
        //compare password that user input and password in our database
        const isMatch = await bcrypt.compare(password, data[0].password)
        
        //if not match throw error with message
        if(!isMatch){
            throw createError.Unauthorized('Username or Password invalid')
        }

        //create token
        const token = await createToken(data.id)
        const {name} = data

        res.send({
            status:"success",
            data: {user: {
                email,
                name,
                token,
                id:data.id
            }}
        })
    } catch (err) {
        //check if user is from joi
        if(err.isJoi === true){
            //if its from joi set the err.status 422 unprocessable entity
            err.status = 422
        }
        //console.log(err);
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

const getUserById = async(req,res,next) => {
    try{
        const {id} = req.params;

        const users = await user.findAll({
            where: {
                id
            },
            include : [
                {
                    model: transaction,
                    as: "transactions",
                    include: {
                        model:user,
                        as:"user",
                        attributes: {
                            exclude:["id","password","createdAt","updatedAt"]
                        },
                        model:fund,
                        as:"UserDonate",
                        attributes: {
                            exclude: ["id","password","createdAt","updatedAt"]
                        }
                    },
                    attributes: {
                        exclude: ["updatedAt"]
                    }
                },
                {
                    model: fund,
                    as: "funds",
                    attributes: {
                        exclude:["createdAt","updatedAt"]
                    },
                    include : [
                        {
                            model:transaction,
                            as:"userDonate",
                            attributes:{
                                exclude:["updatedAt","fundId","userId"]
                            }
                        }
                    ]
                },
                {
                    model: profile,
                    as: "profile",
                    attributes: {
                        exclude:["createdAt","updatedAt","userId"]
                    }
                }
            ],
            attributes: {
                exclude: ["password","createdAt","updatetAt"]
            }
        })

        // if(users[0].profile){
        //    users[0].profile.photoProfile = process.env.PATH_FILE + users[0].profile.photoProfile
        // }

        //if(user[0].photoProfile){
        //    user[0].photoProfile = process.env.PATH_FILE + users[0].photoProfile
        //}

        //users[0].funds.map(item => {
        //    return {...item, thumbnail: process.env.PATH_FILE + item.thumbnail}
        //})

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

const updateUser = async(req,res,next) => {
    try {
        const {id} = req.params
        const{...newData} = await updateUserSchema.validateAsync(req.body);

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'holy-way',
            use_filename: true,
            unique_filename: false,
        });

        let imageSrc = process.env.PATH_FILE + result.public_id


        await user.update({
            ...newData,
            photoProfile: imageSrc
        }, {
            where : {
                id
            }
        }, (err) => {
            if(err) throw createError.InternalServerError()
        })

        const updateUser = await user.findAll({
            where: {
                id
            },
            attributes: {
                exclude: ["password","updatedAt"]
            }
        });

        res.send({
            status: "success",
            data: {user: [...updateUser]}
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

module.exports = {
    registerUser,
    loginUser,
    getUsers,
    getUserById,
    deleteUser,
    updateUser
}