import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 5 * 60, // Document will expire after 5 minutes
    },
})

const otpModel = mongoose.model("otp", otpSchema, "otp")


otpModel.createIndexes({ email: 1 })

export default otpModel;
