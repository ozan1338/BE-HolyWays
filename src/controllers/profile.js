const createError = require("http-errors");
const {user, profile} = require("../../models")
const cloudinary = require('../utils/cloudinary');

const addProfile = async(req,res,next) => {
    try {
        const {userId} = req.params;
        //console.log(id);
        const {phoneNumber} = req.body;
        //console.error(req.body);
        let imageSrc = ""

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'holy-way',
            use_filename: true,
            unique_filename: false,
        });

        // if(!req.file){
        //     imageSrc = "http://localhost:5000/uploads/img_avatar.png"
        // }else {
        //     imageSrc = "http://localhost:5000/uploads/" + req.file.filename
        // }
        
        if(!req.file){
            imageSrc = process.env.PATH_FILE + "holy-way/img_avatar_sxnc4d.png"
        }else {
            imageSrc = result.public_id
        }

        await profile.create({
            phoneNumber,
            photoProfile: imageSrc,
            userId
        }, (err)=>{
            if(err){
                console.log(err);
                throw createError.InternalServerError()
            }
        })

        let userData = await user.findAll({
            where: {
                id: userId
            },
            include: [
                {
                    model: profile,
                    as: "profile",
                    attributes: {
                        exclude: ["id","createdAt","updatedAt","userId"]
                    }
                }
            ],
            attributes: {
                exclude: ["password","createdAt","updatetAt"]
            }
        }, err => {
            if(err){
                console.log(err);
                throw createError.InternalServerError()
            }
        })

        res.send({
            status: "success",
            data: {user: [...userData]}
        })

    } catch (err) {
        console.log(err);
        next(err)
    }
}

const updateProfile = async(req,res,next) => {
    try {
        const {profileId} = req.params
        const {id} = req.payload
        console.log(id);
        console.log('\x1b[33m%s\x1b[0m', req.body);
        const {...data} = req.body
        let imageSrc = ""

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'holy-way',
            use_filename: true,
            unique_filename: false,
        });

        if(req.file){
            //imageSrc = "http://localhost:5000/uploads/" + req.file.filename
            imageSrc = result.public_id
        }

        if(!req.file){
            await profile.update({
                ...data,
            },{
                where: {
                    id: profileId
                }
            }, (err) => {
                if(err){
                    throw createError.InternalServerError()
                }
            }) 
        }else{
            await profile.update({
                ...data,
                photoProfile: imageSrc,
            },{
                where: {
                    id: profileId
                }
            }, (err) => {
                if(err){
                    throw createError.InternalServerError()
                }
            }, (err)=>{
                if(err){
                    throw createError.InternalServerError()
                }
            })  
        }

        const updateProfile = await user.findAll({
            where: {
                id
            },
            include: [
                {
                    model: profile,
                    as: "profile",
                    attributes: {
                        exclude: ["id","createdAt","updatedAt","userId"]
                    }
                }
            ],
            attributes: {
                exclude: ["password","createdAt","updatetAt"]
            }
        }, (err)=>{
            if(err){
                throw createError.InternalServerError()
            }
        })

        res.send({
            status: "success",
            data: {user: [...updateProfile]}
        })   

    } catch (err) {
        next(err)
    }
}

module.exports = {
    addProfile,
    updateProfile
}