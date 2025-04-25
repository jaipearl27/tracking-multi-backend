import mongoose from "mongoose";

const AssignmentsSchema = new mongoose.Schema(
    {
        trackingLinkId: {
            type: mongoose.Types.ObjectId,
            ref: "TrackingLinks",
            required: function () {
                return this.platform === 'impact';
              },
        },
        campaign_id: {
            type: String,
            required: function() {
                return this.platform === 'partnerize';
            },
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
            required: false,
            default: null
        },
        platform: {
            type: String,
            required: [true, 'Platform type is required'],
            enums: ['impact', 'partnerize']
        },
        commissionPercentage: {
            type: Number,
            required: [true, "Commission percentage is required"],
            min: 0,
            max: 100,
        }
    },
    { timestamps: true }
);


const Assignments = mongoose.model("Assignments", AssignmentsSchema, "Assignments");


export default Assignments;