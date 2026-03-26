import {
  getAllComplaints,
  getComplaintById,
  getComplaintsByUserId,
} from "../services/complaint.service.js";

export const listComplaintsController = async (req, res, next) => {
  try {
    const complaints =
      req.user.role === "admin"
        ? await getAllComplaints()
        : await getComplaintsByUserId(req.user.id);

    res.status(200).json({ complaints });
  } catch (error) {
    next(error);
  }
};

export const getComplaintController = async (req, res, next) => {
  try {
    const complaint = await getComplaintById(
      req.params.id,
      req.user.id,
      req.user.role
    );

    if (!complaint) {
      const error = new Error("Complaint not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ complaint });
  } catch (error) {
    next(error);
  }
};



