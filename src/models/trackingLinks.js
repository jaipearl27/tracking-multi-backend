import mongoose from "mongoose";

const trackingLinksSchema = new mongoose.Schema(
  {
    trackingLink: {
      type: String,
      required: [true, "Tracking link is required"],
      trim: true,
    },
    campaignId: {
      type: String,
      required: [true, "Campaign ID is required"],
    },
    user: {
      ref: "Users",
      type: mongoose.Types.ObjectId,
      // required: [true, "user id is required"]
    },
  },
  { timestamps: true }
);


const TrackingLinks = mongoose.model("TrackingLinks", trackingLinksSchema, "TrackingLinks");


export default TrackingLinks;