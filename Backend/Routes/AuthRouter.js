const router = require('express').Router();

router.post('/login' , (req , res)=>{
    res.send("Login Success")
});

router.post('/signup' , (req , res) =>{
    res.send('Signup Success');
})

module.exports = router;