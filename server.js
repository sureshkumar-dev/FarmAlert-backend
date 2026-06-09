
import express from "express";
import mongoose from "mongoose"
import cors from "cors";
import auth from "./models/authmodel.js";
import farmer from "./models/farmermodel.js";
import route from "./routes/registerRoute.js";
import authroute from "./routes/authRoute.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import farmermodel from "./models/farmermodel.js";
import sendSMS from "./utils/sendsms.js";
import multer from "multer";
import sharp from "sharp";
import axios from "axios";
import https from "https";
dotenv.config();
const app = express();
app.use(express.json())
app.use(cors({
    origin: "https://farm-alert-website.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use("/auth", authroute)
app.use("/farm", route)
mongoose.connect(process.env.MONGO_URI)
    .then(() => { console.log("db connected") })
    .catch((error) => {
        console.log("DB ERROR:", error)
    })
app.get("/", (req, res) => {
    res.send("Server  started")
    console.log(req.url);
})
app.get("/api/profile", async (req, res) => {
    const token_jwt = await req.headers.authorization;
    const token = token_jwt.split(" ")[1];

    if (!token) {
        res.json({
            message: "token not found"
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        const userdata = await auth.findOne({ _id: decoded.id });
        console.log(userdata)
        res.json({
            userdata: userdata
        })
    }
    catch (error) {
        console.log(error)
    }
})
app.get("/farm/all", async (req, res) => {
    console.log("STEP 1: API HIT");

    try {
        const authHeader = req.headers.authorization;
        console.log("STEP 2: HEADER", authHeader);

        if (!authHeader) {
            return res.status(401).json({ message: "No token" });
        }

        const token = authHeader.split(" ")[1];
        console.log("STEP 3: TOKEN", token);

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.TOKEN_SECRET);
            console.log("SECRET:", process.env.TOKEN_SECRET);
            console.log("STEP 4: DECODED", decoded);
        } catch (err) {
            console.log("JWT ERROR:", err);
            return res.status(401).json({ message: "Invalid token" });
        }

        const farmdata = await farmer.find({ userid: decoded.id });
        console.log("STEP 5: DATA", farmdata);


        return res.json({ data: farmdata });

    } catch (error) {
        console.log("FINAL ERROR:", error);
        return res.status(500).json({ message: "Server error" });
    }
});


const upload = multer({ dest: "uploads/" });

app.post("/predict", upload.single("image"), async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const image = req.file.path;

    const { dominant } = await sharp(image).stats();

    let disease = "Healthy Plant";

    // Yellow Disease
    if (dominant.r > 180 && dominant.g > 180 && dominant.b < 120) {
      disease = "Yellow Leaf Disease";
    }

    // Leaf Spot Disease
    else if (dominant.r > 140 && dominant.g < 120 && dominant.b < 120) {
      disease = "Leaf Spot Disease";
    }

    // Healthy
    else if (dominant.g > 140 && dominant.r < 140) {
      disease = "Healthy Plant";
    }

    res.json({
      disease: disease,
      rgb: dominant
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Prediction failed"
    });
  }
});
app.get("/farm/monitor/:id", async (req, res) => {
    try {
        const token = req.headers.authorization;
        const id = req.params.id;
        if (!token) {
            res.json({
                message: "token not found"
            })
        }
        const jwt_token = token.split(" ")[1];
        const decoded = jwt.verify(jwt_token, process.env.TOKEN_SECRET);
        const landdata = await farmer.find({ userid: decoded.id, _id: id })
        console.log(landdata)
        res.json({
            data: landdata
        })

    }
    catch (error) {
        res.json({
            message: error
        })
    }
})
app.get("/weather", async (req, res) => {
    try {

        const { lat, lon } = req.query;

        const response = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_KEY}&q=${lat},${lon}&days=3&aqi=yes&alerts=yes`
        );

        const data = await response.json();

        res.json(data);

    } catch (error) {
        console.log("WEATHER ERROR:", error);
        res.status(500).json(error);
    }
});
app.get("/weather-3day", async (req, res) => {
    try {

        const { lat, lon } = req.query

        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min&hourly=temperature_2m,relative_humidity_2m,precipitation,cloud_cover,wind_speed_10m,soil_moisture_0_to_1cm&forecast_days=3`
        )

        const data = await response.json()

        res.json(data)

    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})
app.post("/sent-alerts", async (req, res) => {
    const { phone, message } = req.body;
    console.log("ALERT ROUTE HIT")



    console.log("PHONE:", phone)
    console.log("MESSAGE:", message)
    await sendSMS(phone, message);
    res.json({ success: true });


})
app.delete("/farm/delete/:id", async (req, res) => {
    try {
        const id = req.params.id;
        await farmer.findByIdAndDelete({ _id: id });
        res.json({
            message: "data deleted"
        })
    }
    catch (error) {
        console.log(error)
    }

})

app.listen(5000, () => {
    console.log("server started")
})