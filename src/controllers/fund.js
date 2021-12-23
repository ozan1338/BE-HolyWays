const {transaction, fund} = require('../../models')
const createError = requier("http-errors")

const getAllFunds = async(req,res,next)=>{
    try {
        const data = await fund.findAll({
            include:[
                {
                    model:transaction,
                    as:"userDonate",
                    attributes:{
                        exclude:["createdAt","updatedAt","fundId"]
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
            data:{funds: {...data}}
        })

    } catch (err) {
        
    }
}

const addFunds = async(req,res,next) => {

}

module.exports = {
    getAllFunds
}