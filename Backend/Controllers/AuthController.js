const bcrypt = require('bcrypt');
const UserModel = require('../Models/User');
const jwt = require('jsonwebtoken');

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
        res.status(500).json({ message: "Internal Server Error", success: false })
    }
}

const login = async (req, res) => {
    try {

        //check  if the user exists in database 
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        

        //if user doesnt exists then return error 
        const errorMsg = "Auth failed email or password is wrong⚠️";
        if (!user) {
            return res.status(403).json({ message: errorMsg, sucess: false });
        }

        //Compare incoming password with stored hashed password
        const isPassEqual = await bcrypt.compare(password, user.password); //in this line the password coming from the client is passed as the "password" and the password stored in database is passed as the "user.password "
        if (!isPassEqual) {
            return res.status(403).json({ message: errorMsg, success: false });
        }

        //Generate JWT token
        const jwtToken = jwt.sign(
            { email: user.email, _id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )

        res.status(200)
            .json({
                message: "Login successful",
                success: true,
                jwtToken,
                name: user.name
            })

    } catch (err) {
        res.status(500).json({ message: "Internal Server Error", success: false })
    }
}

module.exports = {
    signup,
    login
}