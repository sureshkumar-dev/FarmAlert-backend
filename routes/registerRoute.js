import express from "express"
import farmer from "../models/farmermodel.js";
import auth from "../models/authmodel.js"
import bcrypt from "bcrypt";
import jwt, { decode } from "jsonwebtoken";
import env from "dotenv"
const route = express.Router();
env.config();
route.post("/register", async (req, res) => {
    try {
        const token = req.headers.authorization;
        const token_jwt = token.split(" ")[1];
        const decoded = await jwt.verify(token_jwt, process.env.TOKEN_SECRET);
        console.log(decoded.id);
        const Farmer = new farmer({
            ...req.body,
            userid: decoded.id
        })
        await Farmer.save();
        const data = await farmer.find({ userid: decoded.id });
        res.json({
            data:data
        })
        res.json({ message: "saved" })
        
    }
    catch (error) {
        console.log(error);
        res.json({ message: "error" })
    }
})

export default route;