const {transaction, fund, user} = require('../../models')
const createError = require("http-errors")

const addTransaction = async(req,res,next) => {
    try {
        
        const {fundId,userId} = req.params
        const {...data} = req.body;
        //const userId = req.payload.id;
        let imageSrc = "http://localhost:5000/uploads/" + req.file.filename

        await transaction.create({
            ...data,
            proofAttachment: imageSrc,
            userId:userId,
            fundId:fundId,
            status: "pending"
        }, (err)=>{
            if(err){
                throw createError.InternalServerError()
            }
        })

        let fundData = await fund.findAll({
            where:{
                id: fundId
            },
            include: [
                {
                    model:transaction,
                    as:"userDonate",
                    include: {
                        model:user,
                        as:"user",
                        attributes: {
                            exclude: ["id","password","createdAt","updatedAt"]
                        }
                    },
                    attributes:{
                        exclude:["createdAt","updatedAt","userId","fundId"]
                    }
                }
            ],
            attributes: {
                exclude:["createdAt","updatedAt","userId"]
            }
        }, (err)=>{
            if(err){
                throw createError.InternalServerError()
            }
        });

        fundData = JSON.parse(JSON.stringify(fundData))

        res.send({
            status: "success",
            data: {
                ...fundData
            }
        })

    } catch (err) {
        console.log(err);
        next(err)
    }
};

const updateTransaction = async(req,res,next) => {
    try {
        const {fundId,userId} = req.params;
        const {...newData} = req.body;

        const updatets = await transaction.update(newData, {
            where:{
                userId,
                fundId
            }
        }, (err)=>{
            if(err){
                throw createError.InternalServerError()
            }
        });

        //console.log(updatets);

        const updateData = await fund.findAll({
            where:{
                id:fundId
            },
            include:[
                {
                    model:transaction,
                    as:"userDonate",
                    include: {
                        model:user,
                        as:"user",
                        attributes: {
                            exclude:["id","password","createdAt","updatedAt"]
                        }
                    },
                    attributes:{
                        exclude:["createdAt","updatedAt","userId","fundId"]
                    }
                }
            ],
            attributes: {
                exclude:["createdAt","updatedAt","userId"]
            }
        }, (err)=>{
            if(err){
                return createError.InternalServerError()
            }
        });

        res.send({
            data: updateData
        })

    } catch (err) {
        console.log(err);
        next(err)
    }
}

module.exports = {
    addTransaction,
    updateTransaction
}