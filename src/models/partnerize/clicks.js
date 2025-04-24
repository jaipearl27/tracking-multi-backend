import mongoose from "mongoose";

const PartnerizeClickEventSchema = new mongoose.Schema(
  {
    set_time: { type: Date, required: true }, // Explicitly define set_time as a Date
  },
  { strict: false, timestamps: true }
);

// Ensure set_time is converted to a Date before saving or updating
PartnerizeClickEventSchema.pre("save", function (next) {
  if (this.set_time && !(this.set_time instanceof Date)) {
    this.set_time = new Date(this.set_time); // Convert to Date if it's not already
  }
  next();
});

PartnerizeClickEventSchema.pre("updateOne", function (next) {
  if (this._update.$set?.set_time && !(this._update.$set.set_time instanceof Date)) {
    this._update.$set.set_time = new Date(this._update.$set.set_time);
  }
  next();
});

PartnerizeClickEventSchema.pre("insertMany", function (next, docs) {
  docs.forEach((doc) => {
    if (doc.set_time && !(doc.set_time instanceof Date)) {
      doc.set_time = new Date(doc.set_time);
    }
  });
  next();
});

const PartnerizeClickEventModel = mongoose.model("PartnerizeClickEvents", PartnerizeClickEventSchema, "PartnerizeClickEvents");

export default PartnerizeClickEventModel;
