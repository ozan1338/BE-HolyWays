const {transaction, fund} = require('../../models')
const createError = require("http-errors")
const {addFundSchema , updateFundSchema} = require("../middleware/joi")

const getAllFunds = async(req,res,next)=>{
    try {
        const data = await fund.findAll({
            include:[
                {
                    model:transaction,
                    as:"userDonate",
                    attributes:{
                        exclude:["createdAt","updatedAt","fundId","userId"]
                    }
                }
            ],
            attributes: {
                exclude:["createdAt","updatedAt","userId"]
            }
        }, (err)=>{
            if(err){
                throw createError.InternalServerError();
            }
        })

        res.send({
            status:"success",
            data:{funds: data}
        })

    } catch (err) {
        console.log(err);
        next(err)
    }
}

const getFundById = async(req,res,next) => {
    try {

        const {id} = req.params;

        const data = await fund.findAll({
            where: {
                id
            },
            include:[
                {
                    model:transaction,
                    as:"userDonate",
                    attributes:{
                        exclude:["createdAt","updatedAt","fundId","userId"]
                    }
                }
            ],
            attributes:{
                exclude:["createdAt","updatedAt","userId"]
            }
        }, (err)=>{
            if(err){
                throw createError.InternalServerError();
            }
        });

        if(data.length === 0){
            throw createError.NotFound("Not Found")
        }

        res.send({
            status:"Success",
            data:{fund: data}
        })
        
    } catch (err) {
        console.log(err);
        next(err)
    }
}

const addFund = async(req,res,next) => {
    try {
        //const {...data} = req.body;
        if(!req.file){
            throw createError.UnprocessableEntity("Please Upload Image")
        }
        
        const data = await addFundSchema.validateAsync(req.body)
        const newFund = await fund.create({
            ...data,
            thumbnail : req.file.filename,
            userId: req.payload.id
        }, (err)=>{
            if(err){
                throw createError.InternalServerError(err.message)
            }
        })

        let fundData = await fund.findAll({
            where: {
                id: newFund.id
            },
            include: [
                {
                    model:transaction,
                    as:"userDonate",
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
                throw createError.InternalServerError(err.message)
            }
        })

        fundData = JSON.parse(JSON.stringify(fundData))

        res.send({
            status:"success",
            data: {
                ...fundData
            }
        })
    } catch (err) {
        console.log(err);
        next(err)
    }
}

const updateFund = async(req,res,next) => {
    try {
        const {id} = req.params
        //const {...newData} = req.body

        const {...newData} = await updateFundSchema.validateAsync(req.body)

        if(!req.file){
            await fund.update({...newData},{
                where: {
                    id
                }
            }, (err)=>{
                if(err){
                    throw createError.InternalServerError()
                }
            });
        }else{
            await fund.update(
                {
                    ...newData,
                    thumbnail: req.file.filename
                },{
                where: {
                    id
                }
            }, (err)=>{
                if(err){
                    throw createError.InternalServerError()
                }
            });
        }

        

        const updateData = await fund.findAll({
            where:{
                id
            },
            include:[
                {
                    model:transaction,
                    as:"userDonate",
                    attributes:{
                        exclude:["createdAt","updatedAt","userId","fundId"]
                    }
                }
            ],
            attributes:{
                exclude:["createdAt","updatedAt","userId"]
            }
        }, (err)=>{
            if(err){
                throw createError.InternalServerError()
            }
        });

        res.send({
            status:"success",
            data:{fund: updateData}
        })

    } catch (err) {
        console.log(err);
        next(err)
    }
}

const deleteFund = async(req,res,next) => {
    try {
        const {id} = req.params

        await fund.destroy({
            where:{
                id
            }
        }, (err)=>{
            if(err){
                throw createError.InternalServerError()
            }
        });

        res.send({
            status:"success",
            data:{id}
        })

    } catch (err) {
        console.log(err);
        next(err)
    }
}

module.exports = {
    getAllFunds,
    getFundById,
    addFund,
    updateFund,
    deleteFund
}