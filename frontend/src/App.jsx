
import { Suspense } from "react";
import "./index.css";
import {
  LazyLandingPage,
  LazyRegisterPage,
  LazyLoginPage,
  LazyTestPage,
  LazyDashboard,
  LazySchedulePickup,
  LazyPickupHistory,
  LazyMapPage,
  LazyAdminDashboard,
  LazyAdminRouteView,
} from "./LazyLoading/LazyLoading";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./Utils/QueryConfig.jsx";
import Loader from "./LazyLoading/Loader.jsx";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout.jsx";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/login" element={<LazyLoginPage />} />
            <Route path="/register" element={<LazyRegisterPage />} />

            <Route element={<Layout />}>
              <Route path="/" element={<LazyLandingPage />} />
              <Route path="/dashboard" element={<LazyDashboard />} />
              <Route path="/schedule" element={<LazySchedulePickup />} />
              <Route path="/pickups" element={<LazyPickupHistory />} />
              <Route path="/map" element={<LazyMapPage />} />
              <Route path="/admin" element={<LazyAdminDashboard />} />
              <Route path="/admin/routes" element={<LazyAdminRouteView />} />
              <Route path="/test" element={<LazyTestPage />} />
            </Route>

            <Route path="*" element={<div className="p-10 text-center text-red-500 font-bold">404 | Page Not Found</div>} />
          </Routes>
        </Suspense>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

