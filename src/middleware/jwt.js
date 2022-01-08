const jwt = require('jsonwebtoken');
const createError = require('http-errors');

const createToken = (userId) => {
    return new Promise((resolve,reject)=>{
        jwt.sign({id:userId}, process.env.TOKEN_SECRET, (err,token)=>{
            if(err){
                console.log(err);
                return reject(createError.InternalServerError())
            }
            resolve(token)
        })
    })
}

const verifyToken = (req,res,next) => {
    if(!req.headers['authorization']){
        console.log("nihao");
        return next(createError.Unauthorized())
    }

    const authHeader = req.headers['authorization']
    const bearerToken = authHeader.split(' ')
    const token = bearerToken[1]

    jwt.verify(token, process.env.TOKEN_SECRET, (err,payload)=>{
        if(err){
            if(err.name === 'JsonWebTokenError'){
                console.log("ciao");
                return next(createError.Unauthorized())
            }else{
                return next(createError.Unauthorized(err.message))
            }
        }
        req.payload = payload;
        next()
    })
}

module.exports = {
    createToken,
    verifyToken
}