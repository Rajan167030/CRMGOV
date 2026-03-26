import { Complaint } from "../models/complaint.model.js";
import {
  normalizeDepartment,
  validateComplaintFields,
} from "../utils/validator.js";

export const createComplaint = async ({ userId, state }) => {
  const validation = validateComplaintFields(state);

  if (!validation.isValid) {
    const error = new Error(
      `Missing required complaint fields: ${validation.missingFields.join(", ")}`
    );
    error.statusCode = 400;
    throw error;
  }

  const complaint = await Complaint.create({
    userId,
    complaint: state.complaint.trim(),
    ticketId:
      typeof state.ticketId === "string" && state.ticketId.trim()
        ? state.ticketId.trim()
        : undefined,
    department: normalizeDepartment(state.department),
    location: state.location.trim(),
    priority: typeof state.priority === "string" ? state.priority.trim() || "Medium" : "Medium",
  });

  return complaint;
};

export const getComplaintByMongoId = async (complaintId) => {
  return Complaint.findById(complaintId);
};

export const getComplaintsByUserId = async (userId) => {
  return Complaint.find({ userId }).sort({ createdAt: -1 });
};

export const getAllComplaints = async () => {
  return Complaint.find({}).sort({ createdAt: -1 });
};

export const getComplaintById = async (complaintId, userId, role) => {
  if (role === "admin") {
    return Complaint.findById(complaintId);
  }

  return Complaint.findOne({ _id: complaintId, userId });
};
