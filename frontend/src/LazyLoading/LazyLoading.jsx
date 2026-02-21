
import { lazy } from "react";

export const LazyLandingPage = lazy(() => import("../Pages/LandingPage.jsx"));
export const LazyLoginPage = lazy(() => import("../Auth/LoginPage.jsx"));
export const LazyRegisterPage = lazy(() => import("../Auth/Registerpage.jsx"));
export const LazyTestPage = lazy(() => import("../Pages/Testpage.jsx"));
export const LazyDashboard = lazy(() => import("../Pages/Dashboard.jsx"));
export const LazySchedulePickup = lazy(() => import("../Pages/SchedulePickup.jsx"));
export const LazyPickupHistory = lazy(() => import("../Pages/PickupHistory.jsx"));
export const LazyMapPage = lazy(() => import("../Pages/MapPage.jsx"));
export const LazyAdminDashboard = lazy(() => import("../Pages/AdminDashboard.jsx"));
export const LazyAdminRouteView = lazy(() => import("../Pages/AdminRouteView.jsx"));

