import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    complaint: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
      default: "General",
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      trim: true,
      default: "Medium",
    },
    status: {
      type: String,
      trim: true,
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

export const Complaint = mongoose.model("Complaint", complaintSchema);
