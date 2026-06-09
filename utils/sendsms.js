import twilio from "twilio"
import dotenv from 'dotenv'
dotenv.config()
const accountSid = process.env.accountSid
const authToken = process.env.authToken

const client = twilio(accountSid, authToken)
const sendSMS = async (phone, message) => {

    try {

        await client.messages.create({
            body: message,
            messagingServiceSid: process.env.messagingServiceSid,
            to: `+91${phone}`
        })

        console.log("SMS sent")

    } catch (error) {
        console.log(error)
    }

}

export default sendSMS