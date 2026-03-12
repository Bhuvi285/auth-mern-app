const router = require('express').Router();
const {signupValidation, loginValidation} = require('../Middleware/AuthValidation.js')
const {signup, login} = require('../Controllers/AuthController.js')

router.post('/login' , loginValidation , login);
router.post('/signup' , signupValidation , signup);

module.exports = router;