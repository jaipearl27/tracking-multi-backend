import mongoose from "mongoose";

const ClickEventSchema = new mongoose.Schema({
  // Id: { type: String, required: true },
  // ProgramId: { type: String, required: true },
  // ProgramName: { type: String, required: true },
  // ProfileId: { type: String, required: true },
  // IpAddress: { type: String, required: true },
  // EventDate: { type: Date, required: true },
  // MediaId: { type: String, required: true },
  // MediaName: { type: String, required: true },
  // AdId: { type: String, required: true },
  // AdName: { type: String, required: true },
  // AdType: { type: String, required: true },
  // DealName: { type: String, default: null },
  // DealType: { type: String, default: null },
  // DealScope: { type: String, default: null },
  // CustomerArea: { type: String, default: "N/A" },
  // CustomerCity: { type: String, required: true },
  // CustomerRegion: { type: String, required: true },
  // CustomerCountry: { type: String, required: true },
  // DeviceType: { type: String, required: true },
  // DeviceFamily: { type: String, required: true },
  // Browser: { type: String, required: true },
  // Os: { type: String, required: true },
  // ReferringDomain: { type: String, default: "NA" },
  // LandingPageUrl: { type: String, required: true },
  // CpcBid: { type: Number, default: 0.0 },
  // UniqueClick: { type: Boolean, required: true }
}, { strict: false, timestamps: true });


const ClickEventModel = mongoose.model("ClickEvents", ClickEventSchema, "ClickEvents")

export default ClickEventModel;