const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./Routes/AuthRouter');
const ProductsRouter = require('./Routes/ProductsRouter');


require('dotenv').config(); // Load environment variables from .env file
require('./Models/db')
const PORT = process.env.PORT || 8181;

app.use(bodyParser.json());
app.use(cors());

app.use('/auth', AuthRouter);
//just for demonstration 
app.use('/products', ProductsRouter);

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})