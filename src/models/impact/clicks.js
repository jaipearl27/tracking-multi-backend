import mongoose from "mongoose";

const ClickEventSchema = new mongoose.Schema(
  {
    EventDate: { type: Date, required: true }, // Explicitly define EventDate as a Date
  },
  { strict: false, timestamps: true }
);

// Ensure EventDate is converted to a Date before saving or updating
ClickEventSchema.pre("save", function (next) {
  if (this.EventDate && !(this.EventDate instanceof Date)) {
    this.EventDate = new Date(this.EventDate); // Convert to Date if it's not already
  }
  next();
});

ClickEventSchema.pre("updateOne", function (next) {
  if (this._update.$set?.EventDate && !(this._update.$set.EventDate instanceof Date)) {
    this._update.$set.EventDate = new Date(this._update.$set.EventDate);
  }
  next();
});

ClickEventSchema.pre("insertMany", function (next, docs) {
  docs.forEach((doc) => {
    if (doc.EventDate && !(doc.EventDate instanceof Date)) {
      doc.EventDate = new Date(doc.EventDate);
    }
  });
  next();
});

const ClickEventModel = mongoose.model("ClickEvents", ClickEventSchema, "ClickEvents");

export default ClickEventModel;
