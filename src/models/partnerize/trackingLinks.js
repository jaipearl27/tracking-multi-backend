import mongoose from "mongoose";

const PartnerizeTrackingLinkSchema = new mongoose.Schema(
    {},
    { strict: false, timestamps: true }
);

const PartnerizeTrackingLink = mongoose.model("PartnerizeTrackingLinks", PartnerizeTrackingLinkSchema, "PartnerizeTrackingLinks");

export default PartnerizeTrackingLink;

