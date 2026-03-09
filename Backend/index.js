const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./Routes/AuthRouter');

require('dotenv').config(); // Load environment variables from .env file
require('./Models/db')
const PORT = process.env.PORT || 8080;

app.get('/ping' , (req , res)=>{
    res.send('POMG');
})

app.use(bodyParser.json());
app.use(cors());

app.use('/auth' , AuthRouter );

app.listen(PORT , ()=>{
    console.log(`Server is running on ${PORT}`);
})