import asyncHandler from "../Utils/AsyncHandler.js";
import ApiError from "../Utils/ApiError.js";
import ApiResponse from "../Utils/ApiResponse.js";
import PickupRequest from "../Schemas/PickupRequestSchema.js";
import Joi from "joi";

const createPickupSchema = Joi.object({
  wasteType: Joi.string()
    .valid("organic", "plastic", "paper", "metal", "ewaste", "glass", "hazardous")
    .required(),
  scheduledDate: Joi.date().iso().custom((value, helpers) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (value < today) {
      return helpers.error("date.min", { limit: "today" });
    }
    return value;
  }).required().messages({ "date.min": '"scheduledDate" must not be in the past' }),
  longitude: Joi.number().min(-180).max(180).required(),
  latitude: Joi.number().min(-90).max(90).required(),
  address: Joi.string().max(500).allow("").optional(),
  notes: Joi.string().max(1000).allow("").optional(),
  phone: Joi.string().pattern(/^[0-9+\-\s()]{7,20}$/).required().messages({
    "string.pattern.base": "Please enter a valid phone number",
  }),
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid("scheduled", "assigned", "in_progress", "picked", "cancelled")
    .required(),
});

export const createPickup = asyncHandler(async (req, res) => {
  const { error, value } = createPickupSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, "Invalid input", error.details.map((d) => d.message));
  }

  const pickup = new PickupRequest({
    userId: req.user.id,
    wasteType: value.wasteType,
    scheduledDate: value.scheduledDate,
    location: {
      type: "Point",
      coordinates: [value.longitude, value.latitude],
    },
    address: value.address || "",
    notes: value.notes || "",
    phone: value.phone,
  });

  await pickup.save();

  return res
    .status(201)
    .json(new ApiResponse(201, "Pickup request created", pickup));
});

export const getUserPickups = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = { userId: req.user.id };
  if (status) filter.status = status;

  const pickups = await PickupRequest.find(filter)
    .sort({ scheduledDate: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const total = await PickupRequest.countDocuments(filter);

  return res.json(
    new ApiResponse(200, "Pickups fetched", { pickups, total, page: Number(page), limit: Number(limit) })
  );
});

export const getPickupById = asyncHandler(async (req, res) => {
  const pickup = await PickupRequest.findOne({
    _id: req.params.id,
    userId: req.user.id,
  }).lean();

  if (!pickup) throw new ApiError(404, "Pickup not found");

  return res.json(new ApiResponse(200, "Pickup fetched", pickup));
});

export const updatePickupStatus = asyncHandler(async (req, res) => {
  const { error, value } = updateStatusSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, "Invalid status", error.details.map((d) => d.message));
  }

  const pickup = await PickupRequest.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { status: value.status },
    { new: true }
  );

  if (!pickup) throw new ApiError(404, "Pickup not found");

  return res.json(new ApiResponse(200, "Status updated", pickup));
});

export const deletePickup = asyncHandler(async (req, res) => {
  const pickup = await PickupRequest.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!pickup) throw new ApiError(404, "Pickup not found");
  if (["picked", "in_progress"].includes(pickup.status)) {
    throw new ApiError(400, "Cannot delete a pickup that is in progress or already picked");
  }

  await pickup.deleteOne();
  return res.json(new ApiResponse(200, "Pickup deleted"));
});
