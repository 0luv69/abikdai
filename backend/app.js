import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import UserRouter from "./src/Routes/UserRoute.js";
import PickupRouter from "./src/Routes/PickupRoute.js";
import AdminRouter from "./src/Routes/AdminRoute.js";
import { GoogleLogin, GoogleLoginProvider } from "./src/Utils/GoogleLogin.js";

dotenv.config
  ();
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));


app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is up and running");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/users", UserRouter);
app.use("/pickups", PickupRouter);
app.use("/admin", AdminRouter);
app.get("/auth/google", GoogleLogin)
app.get("/auth/google/callback", GoogleLoginProvider)

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
  });
});

export default app;

