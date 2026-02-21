import { Router } from "express";
import AuthUser from "../Middlewares/AuthMiddelware.js";
import {
  createPickup,
  getUserPickups,
  getPickupById,
  updatePickupStatus,
  deletePickup,
} from "../Controllers/PickupController.js";
import AdminMiddleware from "../Middlewares/AdminMiddleware.js";
const PickupRouter = Router();

PickupRouter.use(AuthUser);

PickupRouter.post("/", createPickup);
PickupRouter.get("/", getUserPickups);
PickupRouter.get("/:id", getPickupById);
PickupRouter.patch("/:id/status", AdminMiddleware, updatePickupStatus);
PickupRouter.delete("/:id", AdminMiddleware, deletePickup);

export default PickupRouter;
