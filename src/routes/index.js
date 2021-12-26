const express = require("express");
const router = express.Router();

//User Controller
const { registerUser,loginUser,getUsers,deleteUser } = require("../controllers/user");

//Fund Controller
const {getAllFunds, addFund, getFundById, updateFund, deleteFund} = require("../controllers/fund")

//Transaction Controller
const {addTransaction, updateTransaction} = require("../controllers/transaction")

//import VerifyToken from jwt middleware
const {verifyToken} = require("../middleware/jwt")

//import multer from multer middleware
const uploadFile = require("../middleware/multer")

//Route User
router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.get("/user", getUsers);
router.delete("/user/:id", deleteUser);

//Router Fund
router.get("/fund", getAllFunds);
router.post("/fund", verifyToken, uploadFile("thumbnail"), addFund);
router.get("/fund/:id", getFundById);
router.patch("/fund/:id", verifyToken, uploadFile("thumbnail") , updateFund);
router.delete("/fund/:id", verifyToken, deleteFund);

//Router Transaction
router.post("/fund/:fundId/:userId", verifyToken, uploadFile("proofAttachment"), addTransaction);
router.patch("/fund/:fundId/:userId", verifyToken, updateTransaction);


module.exports = router