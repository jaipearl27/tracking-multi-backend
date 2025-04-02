import mongoose from "mongoose";

const AssignmentsSchema = new mongoose.Schema(
    {
        trackingLinkId: {
            type: mongoose.Types.ObjectId,
            ref: "TrackingLinks",
            required: [true, "Tracking link ID is required"],
        },
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },
        status: {
            type: String,
            enums: ['active', 'inactive'],
            default: 'active'
        },
        inactiveDate: {
            type: Date,
            required: false
        },
        platform: {
            type: String,
            required: true,
            enums: ['impact', 'partnerize']
        }
    },
    { timestamps: true }
);


const Assignments = mongoose.model("Assignments", AssignmentsSchema, "Assignments");


export default Assignments;