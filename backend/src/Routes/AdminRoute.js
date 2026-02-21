import { Router } from "express";
import AuthUser from "../Middlewares/AuthMiddelware.js";
import AdminMiddleware from "../Middlewares/AdminMiddleware.js";
import {
  getAllPickups,
  adminUpdatePickupStatus,
  getAdminStats,
  getTodayPickups,
} from "../Controllers/AdminController.js";
import asyncHandler from "../Utils/AsyncHandler.js";
import ApiResponse from "../Utils/ApiResponse.js";
import ApiError from "../Utils/ApiError.js";
import User from "../Schemas/UserSchema.js";

const AdminRouter = Router();

AdminRouter.use(AuthUser);
AdminRouter.use(AdminMiddleware);

AdminRouter.get("/pickups", getAllPickups);
AdminRouter.get("/pickups/today", getTodayPickups);
AdminRouter.patch("/pickups/:id", adminUpdatePickupStatus);
AdminRouter.get("/stats", getAdminStats);

AdminRouter.get(
  "/location",
  asyncHandler(async (req, res) => {
    const admin = await User.findById(req.user.id).select("location").lean();
    if (!admin) throw new ApiError(404, "Admin not found");
    return res.json(new ApiResponse(200, "Admin location fetched", admin.location));
  })
);

AdminRouter.patch(
  "/location",
  asyncHandler(async (req, res) => {
    const { longitude, latitude } = req.body;
    if (longitude == null || latitude == null) {
      throw new ApiError(400, "longitude and latitude are required");
    }
    const admin = await User.findByIdAndUpdate(
      req.user.id,
      { location: { type: "Point", coordinates: [longitude, latitude] } },
      { new: true }
    ).select("location");
    return res.json(new ApiResponse(200, "Location updated", admin.location));
  })
);

AdminRouter.post(
  "/route",
  asyncHandler(async (req, res) => {
    const { coordinates } = req.body; // array of [lng, lat] pairs
    if (!coordinates || coordinates.length < 2) {
      throw new ApiError(400, "At least 2 coordinate pairs required");
    }
    const coordStr = coordinates.map((c) => `${c[0]},${c[1]}`).join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== "Ok") {
      throw new ApiError(502, "OSRM routing failed");
    }

    return res.json(new ApiResponse(200, "Route calculated", data));
  })
);

// Nearest-neighbor optimized route from admin's position through all today's pickups
AdminRouter.post(
  "/route/optimize",
  asyncHandler(async (req, res) => {
    const { startLongitude, startLatitude, pickupIds } = req.body;
    if (startLongitude == null || startLatitude == null) {
      throw new ApiError(400, "Start coordinates required");
    }
    if (!pickupIds || pickupIds.length === 0) {
      throw new ApiError(400, "At least one pickup ID required");
    }

    const MAX_RADIUS_KM = 20;
    const PickupRequest = (await import("../Schemas/PickupRequestSchema.js")).default;

    const pickups = await PickupRequest.find({
      _id: { $in: pickupIds },
      status: { $in: ["scheduled", "assigned"] },
      $or: [
        { assignedTo: null },
        { assignedTo: req.user.id },
      ],
    })
      .populate("userId", "fullname email phone")
      .lean();

    if (pickups.length === 0) {
      throw new ApiError(404, "No available pickups found");
    }

    function haversine(lon1, lat1, lon2, lat2) {
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
      return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 6371;
    }

    const withinRadius = pickups.filter((p) => {
      const [lng, lat] = p.location.coordinates;
      return haversine(startLongitude, startLatitude, lng, lat) <= MAX_RADIUS_KM;
    });

    const skippedCount = pickups.length - withinRadius.length;

    if (withinRadius.length === 0) {
      throw new ApiError(404, `No pickups within ${MAX_RADIUS_KM}km radius`);
    }

    const ordered = [];
    const remaining = [...withinRadius];
    let currentPos = [startLongitude, startLatitude];

    while (remaining.length > 0) {
      let nearestIdx = 0;
      let nearestDist = Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const [lng, lat] = remaining[i].location.coordinates;
        const dist = haversine(currentPos[0], currentPos[1], lng, lat);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = i;
        }
      }

      const nearest = remaining.splice(nearestIdx, 1)[0];
      ordered.push({ ...nearest, distanceFromPrev: nearestDist.toFixed(2) });
      currentPos = nearest.location.coordinates;
    }

    if (ordered.length > 0) {
      await PickupRequest.findByIdAndUpdate(ordered[0]._id, {
        status: "assigned",
        assignedTo: req.user.id,
      });
      ordered[0].status = "assigned";
    }

    const allCoords = [
      [startLongitude, startLatitude],
      ...ordered.map((p) => p.location.coordinates),
    ];
    const coordStr = allCoords.map((c) => `${c[0]},${c[1]}`).join(";");
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson&steps=true`;

    let routeData = null;
    try {
      const osrmRes = await fetch(osrmUrl);
      routeData = await osrmRes.json();
    } catch {
      // OSRM might fail, still return ordered pickups
    }

    return res.json(
      new ApiResponse(200, "Optimized route calculated", {
        orderedPickups: ordered,
        route: routeData?.code === "Ok" ? routeData : null,
        totalStops: ordered.length,
        skippedOutOfRadius: skippedCount,
        radiusKm: MAX_RADIUS_KM,
      })
    );
  })
);

export default AdminRouter;
