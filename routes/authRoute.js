import express from "express";
import auth from "../models/authmodel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
const authroute = express.Router();
authroute.post("/signup", async (req, res) => {
    try {
        console.log("register hit")
        const hashedpwd = await bcrypt.hash(req.body.pwd, 10);
        const { username, email, pwd } = req.body
        const user = new auth({
            username,
            email,
            pwd: hashedpwd
        });
        await user.save();
        res.status(201).json({ message: "User created successfully" });
        console.log(req.body);
    }
    catch (err) {
        console.log(err);
    }
})
authroute.post("/signin", async (req, res) => {
    try {
        const { email, pwd } = req.body;
        if(!email || !pwd){
            res.json({
               message:"All fields are required"
            })
        }
        const userdata = await auth.findOne({ email });
        if (!userdata) {
            return res.json({
                message: "user not found"
            })
        }
        const ismatch = await bcrypt.compare(pwd, userdata.pwd);
        if (!ismatch) {
            res.json({
                message: "invalid password"
            })
        }
        

        const token = jwt.sign(
            { id: userdata._id },
            process.env.TOKEN_SECRET,
            { expiresIn: "30d" }
        )

        res.json({
            message: "login success",
            token: token

        })
       
    }
    catch (error) {
        console.log(error);
    }

});
export default authroute;