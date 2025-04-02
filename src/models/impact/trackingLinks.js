import mongoose from "mongoose";

const trackingLinksSchema = new mongoose.Schema(
  {
    TrackingLink: {
      type: String,
      required: [true, "Tracking link is required"],
      trim: true,
    },
    ProgramId: {
      type: String,
      required: [true, "programId is required"],
    },
    platform: {
      type: String, 
      required: [true, "Platform name is required."],
      enums: ["impact", "partnerize"]
    }
  },
  { timestamps: true }
);


const TrackingLinks = mongoose.model("TrackingLinks", trackingLinksSchema, "TrackingLinks");


export default TrackingLinks;