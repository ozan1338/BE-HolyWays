const express = require("express");
const router = express.Router();

//User Controller
const { registerUser,loginUser,getUsers,deleteUser } = require("../controllers/user");

//Fund Controller
const {getAllFunds} = require("../controllers/fund")

//import VerifyToken from jwt middleware
const {verifyToken} = require("../middleware/jwt")

//import multer from multer middleware

//Route User
router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.get("/user", getUsers);
router.delete("/user/:id", deleteUser);

//Router Fund
router.get("/fund", getAllFunds)


module.exports = router