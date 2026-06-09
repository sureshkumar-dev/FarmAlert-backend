import mongoose, { Schema } from "mongoose";
const farmerschema = new mongoose.Schema({
    userid:String,
    cropName: String,
    cropVariety: String,

    district
        :
        String,
    farmName
        :
        String,
    farmSize
        :
        String,
    farmerName
        :
        String,
    growthStage
        :
        String,
    latitude
        :
        Number,
    longitude
        :
        Number,
    mobile
        :
        String,
    plantingDate
        :
        Date,
    smsLang
        :
        String,
    soilType
        :
        String,
    taluk
        :
        String,
    village
        :
        String,
    waterSource
        :
        String
})
export default mongoose.model("farmer", farmerschema);