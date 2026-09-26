const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Schema/users");

router.post("/register", async(req, res) => {
    try{
        const { name, email, password, role } = req.body;

        const checkEmail = await User.findOne({ email });

        if(checkEmail){
            return res.status(400).json({
                message: "Email already exists!"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "Barber"
        });

        const userObj = user.toObject();
        delete userObj.password;

        res.status(201).json({
            message: "User registered successfully",
            user: userObj
        });
    } 
    catch(err){
        res.status(500).json({
            message: err.message
        });
    }
});

router.post("/login", async(req, res) => {
    try{
        const {email, password} = req.body;

        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({
                message: "User not found!"
            })
        }

        const checkPassword = await bcrypt.compare(password, user.password);

        if (!checkPassword) {
            return res.status(401).json({
                message: "Invalid Password!"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        )

        res.status(200).json({
            message: "Login Successful",
            token
        });
    }
    catch(err){
        res.status(500).json({
            message: err.message
        });
    }
})

module.exports = router;