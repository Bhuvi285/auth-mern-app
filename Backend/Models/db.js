 const mongoose = require('mongoose');  // importing mongoose package

 const mongo_url = process.env.MONGO_CONN;   //fetching mongoose URL through .env

//With this connecting to the mongoDB
 mongoose.connect(mongo_url)
    .then(()=>{
        console.log('MongoDB Connected');
    }).catch((err)=>{
        console.log("MongoDB Conncection Error: ", err);
    })

//import this file in the index.js to conncet and run this code snippet