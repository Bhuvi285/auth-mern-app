const express = require('express');
const app = express();
require('dotenv').config(); // Load environment variables from .env file

const PORT = process.env.PORT || 8080;

app.get('/ping' , (req , res)=>{
    res.send('POMG');
})

app.listen(PORT , ()=>{
    console.log(`Serveris running on ${PORT}`);
})