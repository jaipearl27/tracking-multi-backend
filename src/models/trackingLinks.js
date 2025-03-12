import mongoose from "mongoose";

const trackingLinksSchema = new mongoose.Schema(
  {
    trackingLink: {
      type: String,
      required: [true, "Tracking link is required"],
      trim: true,
    },
    programId: {
      type: String,
      required: [true, "programId is required"],
    },
  },
  { timestamps: true }
);


const TrackingLinks = mongoose.model("TrackingLinks", trackingLinksSchema, "TrackingLinks");


export default TrackingLinks;