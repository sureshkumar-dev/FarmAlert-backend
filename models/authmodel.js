import mongoose from "mongoose";

const authschema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true
    },
    pwd:{
        type:String,
        required:true

    }
})
export default mongoose.model("auth",authschema)