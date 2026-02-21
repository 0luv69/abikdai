import asyncHandler from "../Utils/AsyncHandler.js";
import ApiError from "../Utils/ApiError.js";
import ApiResponse from "../Utils/ApiResponse.js";
import PickupRequest from "../Schemas/PickupRequestSchema.js";
import { sendPickupCompletedEmail } from "../Utils/Mailer.js";

export const getAllPickups = asyncHandler(async (req, res) => {
  const { status, wasteType, date, page = 1, limit = 30 } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (wasteType) filter.wasteType = wasteType;
  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    filter.scheduledDate = { $gte: start, $lt: end };
  }

  const pickups = await PickupRequest.find(filter)
    .populate("userId", "fullname email phone")
    .sort({ scheduledDate: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const total = await PickupRequest.countDocuments(filter);

  return res.json(
    new ApiResponse(200, "All pickups fetched", { pickups, total, page: Number(page), limit: Number(limit) })
  );
});

export const adminUpdatePickupStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["scheduled", "assigned", "in_progress", "picked", "cancelled"];

  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  const updateData = { status };
  if (status === "assigned") {
    updateData.assignedTo = req.user.id;
  }
  if (status === "scheduled" || status === "cancelled") {
    updateData.assignedTo = null;
  }

  const pickup = await PickupRequest.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  ).populate("userId", "fullname email");

  if (!pickup) throw new ApiError(404, "Pickup not found");

  if (status === "picked" && pickup.userId) {
    sendPickupCompletedEmail(pickup.userId.email, pickup.userId.fullname, pickup);
  }

  return res.json(new ApiResponse(200, "Pickup status updated", pickup));
});

export const getAdminStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [total, scheduled, assigned, inProgress, picked, cancelled, todayCount] =
    await Promise.all([
      PickupRequest.countDocuments(),
      PickupRequest.countDocuments({ status: "scheduled" }),
      PickupRequest.countDocuments({ status: "assigned" }),
      PickupRequest.countDocuments({ status: "in_progress" }),
      PickupRequest.countDocuments({ status: "picked" }),
      PickupRequest.countDocuments({ status: "cancelled" }),
      PickupRequest.countDocuments({
        scheduledDate: { $gte: today, $lt: tomorrow },
      }),
    ]);

  return res.json(
    new ApiResponse(200, "Stats fetched", {
      total,
      scheduled,
      assigned,
      inProgress,
      picked,
      cancelled,
      todayCount,
    })
  );
});

export const getTodayPickups = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const pickups = await PickupRequest.find({
    scheduledDate: { $gte: today, $lt: tomorrow },
    status: { $in: ["scheduled", "assigned", "in_progress"] },
  })
    .populate("userId", "fullname email phone")
    .sort({ scheduledDate: 1 })
    .lean();

  return res.json(new ApiResponse(200, "Today's pickups fetched", pickups));
});
