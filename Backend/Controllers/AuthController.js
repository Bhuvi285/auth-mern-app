const bcrypt = require('bcrypt');
const UserModel = require('../Models/User');

const signup = async (req, res) => {
    try {

        //check  if the user exists in database 
        const { name, email, password } = req.body;
        const user = await UserModel.findOne({ email });

        //if user exists then goto login
        if (user) {
            return res.status(409).json({ message: "User already exist , you can login", sucess: false });
        }
        //Otherwise Create New User to database 
        const usermodel = new UserModel({ name, email, password });
        usermodel.password = await bcrypt.hash(password, 10);
        await usermodel.save();
        res.status(201).json({ message: " Signup Successful", success: true });
    } catch (err) {
        res.status(500).json({message: "Internal Server Error" , success:false })
    }
}

module.exports = {
    signup
}