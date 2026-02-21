import mongoose from "mongoose";

const PickupRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    wasteType: {
      type: String,
      enum: ["organic", "plastic", "paper", "metal", "ewaste", "glass", "hazardous"],
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "assigned", "in_progress", "picked", "cancelled"],
      default: "scheduled",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

PickupRequestSchema.index({ location: "2dsphere" });
PickupRequestSchema.index({ status: 1, scheduledDate: 1 });

const PickupRequest = mongoose.model("PickupRequest", PickupRequestSchema);
export default PickupRequest;
