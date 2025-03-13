import mongoose from "mongoose";

const AssignmentsSchema = new mongoose.Schema(
    {
        trackingLinkId: {
            type: mongoose.Types.ObjectId,
            ref: "TrackingLinks",
            required: [true, "Tracking link ID is required"],
        },
        // programId: {
        //     type: String,
        //     required: [true, "Program ID is required"],
        // },
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "Users",
            required: [true, "User ID is required"],
        },
        
    },
    { timestamps: true }
);


const Assignments = mongoose.model("Assignments", AssignmentsSchema, "Assignments");


export default Assignments;