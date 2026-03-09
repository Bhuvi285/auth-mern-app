const router = require('express').Router();
const {signupValidation} = require('../Middleware/AuthValidation.js')
const {signup} = require('../Controllers/AuthController.js')

router.post('/login' , (req , res)=>{
    res.send("Login Success")
});

router.post('/signup' , signupValidation , signup);

module.exports = router;