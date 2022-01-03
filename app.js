const express = require('express');
const createError = require('http-errors')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config();

//import route from src/route/index
const router = require('./src/routes')

const app = express();
//serve static file
app.use('/uploads', express.static('uploads'))

const PORT = 5000;
//use morgan
app.use(morgan("dev"));
//user cors
app.use(cors())
//parse json
app.use(express.json());

//add endpoint router
app.use('/api/v1/', router);

//handle error if endpoint notfound
app.use(async(req,res,next)=>{
    next(createError.NotFound())
});

//catch every error
app.use((err,req,res,next)=>{
    res.status(err.status || 500);
    res.send({
        error:{
            status: err.status || 500,
            message: err.message
        }
    })
})

app.listen(PORT, ()=>console.log(`Listening on port ${PORT}`));