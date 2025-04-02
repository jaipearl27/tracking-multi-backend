import mongoose from "mongoose";

const ActionSchema = new mongoose.Schema(
    {},
    { strict: false, timestamps: true }
);

const ActionModel = mongoose.model("Actions", ActionSchema, "Actions");

export default ActionModel;
