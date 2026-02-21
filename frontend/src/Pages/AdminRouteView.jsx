import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Loader2,
  Route,
  Truck,
  Navigation,
  CheckCircle,
  Play,
  RotateCcw,
  Crosshair,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/Utils/AxiosWrapper.js";
import toast from "react-hot-toast";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const wasteColors = {
  organic: "#4CAF50",
  plastic: "#2196F3",
  paper: "#D2B48C",
  metal: "#78909C",
  ewaste: "#7B1FA2",
  glass: "#009688",
  hazardous: "#FF5722",
};

function createAdminIcon() {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 40px; height: 40px;
      background: #16a34a;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 10px rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
    "><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.684-.949V8a1 1 0 0 0-1-1h-1"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  });
}

function createPickupIcon(index, color, isNext) {
  const ring = isNext
    ? "box-shadow: 0 0 0 4px rgba(22,163,74,0.4), 0 2px 8px rgba(0,0,0,0.3);"
    : "box-shadow: 0 2px 8px rgba(0,0,0,0.3);";
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 28px; height: 28px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      ${ring}
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 11px; font-weight: 700;
    ">${index + 1}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function createCompletedIcon(index) {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 28px; height: 28px;
      background: #9ca3af;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 14px;
    ">✓</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function AdminLocationSetter({ onLocationSet }) {
  useMapEvents({
    click(e) {
      onLocationSet([e.latlng.lng, e.latlng.lat]);
    },
  });
  return null;
}

const AdminRouteView = () => {
  const queryClient = useQueryClient();
  const [adminPos, setAdminPos] = useState(null); // [lng, lat]
  const [settingLocation, setSettingLocation] = useState(false);
  const [orderedPickups, setOrderedPickups] = useState([]);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [routeActive, setRouteActive] = useState(false);
  const [segmentRoute, setSegmentRoute] = useState(null); // current segment route line

  // Fetch admin's saved location
  const { data: adminLocation } = useQuery({
    queryKey: ["adminLocation"],
    queryFn: () => api.get("/admin/location"),
  });

  // Set admin position from DB on load
  useEffect(() => {
    if (adminLocation?.coordinates && adminLocation.coordinates[0] !== 0) {
      setAdminPos(adminLocation.coordinates);
    }
  }, [adminLocation]);

  // Fetch today's pickups
  const { data: todayPickups, isLoading } = useQuery({
    queryKey: ["adminTodayPickups"],
    queryFn: () => api.get("/admin/pickups/today"),
  });

  const pickups = todayPickups || [];

  const center = useMemo(() => {
    if (adminPos) return [adminPos[1], adminPos[0]];
    if (pickups.length === 0) return [27.7172, 85.324];
    const avgLat =
      pickups.reduce((s, p) => s + p.location.coordinates[1], 0) /
      pickups.length;
    const avgLng =
      pickups.reduce((s, p) => s + p.location.coordinates[0], 0) /
      pickups.length;
    return [avgLat, avgLng];
  }, [pickups, adminPos]);

  // Save admin location to DB
  const saveLocationMutation = useMutation({
    mutationFn: (coords) =>
      api.patch("/admin/location", {
        longitude: coords[0],
        latitude: coords[1],
      }),
    onSuccess: () => {
      toast.success("Location saved");
      queryClient.invalidateQueries({ queryKey: ["adminLocation"] });
      setSettingLocation(false);
    },
    onError: () => toast.error("Failed to save location"),
  });

  // Calculate optimized route
  const optimizeMutation = useMutation({
    mutationFn: (data) => api.post("/admin/route/optimize", data),
    onSuccess: (data) => {
      setOrderedPickups(data.orderedPickups || []);
      setCurrentStopIndex(0);
      setCompletedIds(new Set());
      setRouteActive(true);

      if (data.route?.routes?.[0]) {
        const route = data.route.routes[0];
        const coords = route.geometry.coordinates.map(([lng, lat]) => [
          lat,
          lng,
        ]);
        setRouteGeoJSON(coords);
        setRouteInfo({
          distance: (route.distance / 1000).toFixed(1),
          duration: Math.round(route.duration / 60),
        });
      }

      // Calculate segment to first stop
      if (data.orderedPickups?.length > 0) {
        calculateSegment(adminPos, data.orderedPickups[0].location.coordinates);
      }

      let msg = `Route optimized! ${data.totalStops} stops`;
      if (data.skippedOutOfRadius > 0) {
        msg += ` (${data.skippedOutOfRadius} skipped — outside ${data.radiusKm}km)`;
      }
      toast.success(msg);
    },
    onError: () => toast.error("Failed to calculate route"),
  });

  // Calculate route segment between two points
  const calculateSegment = async (from, to) => {
    try {
      const data = await api.post("/admin/route", {
        coordinates: [from, to],
      });
      if (data?.routes?.[0]) {
        const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [
          lat,
          lng,
        ]);
        setSegmentRoute(coords);
      }
    } catch {
      // Segment calc failed — still functional
    }
  };

  // Mark pickup as completed and advance
  const markPickedMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/pickups/${id}`, { status: "picked" }),
    onSuccess: async (_, pickupId) => {
      const completed = orderedPickups.find((p) => p._id === pickupId);
      if (!completed) return;

      const newCompleted = new Set(completedIds);
      newCompleted.add(pickupId);
      setCompletedIds(newCompleted);

      // Update admin position to the completed pickup's location
      const newPos = completed.location.coordinates;
      setAdminPos(newPos);
      saveLocationMutation.mutate(newPos);

      const nextIdx = currentStopIndex + 1;
      setCurrentStopIndex(nextIdx);

      if (nextIdx < orderedPickups.length) {
        const nextPickup = orderedPickups[nextIdx];
        // Assign next pickup to this admin
        try {
          await api.patch(`/admin/pickups/${nextPickup._id}`, {
            status: "assigned",
          });
        } catch {
          /* non-critical */
        }

        calculateSegment(newPos, nextPickup.location.coordinates);
        toast.success(
          `Picked up! Next: Stop #${nextIdx + 1} (${nextPickup.wasteType})`,
        );
      } else {
        setSegmentRoute(null);
        setRouteActive(false);
        toast.success("All pickups completed! ");
      }

      queryClient.invalidateQueries({ queryKey: ["adminTodayPickups"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: () => toast.error("Failed to update pickup"),
  });

  const handleSetLocation = (coords) => {
    setAdminPos(coords);
    saveLocationMutation.mutate(coords);
  };

  const handleStartRoute = () => {
    if (!adminPos) {
      toast.error("Set your location first by clicking on the map");
      return;
    }
    const activePickupIds = pickups
      .filter((p) => !completedIds.has(p._id))
      .map((p) => p._id);
    if (activePickupIds.length === 0) {
      toast.error("No active pickups for today");
      return;
    }
    optimizeMutation.mutate({
      startLongitude: adminPos[0],
      startLatitude: adminPos[1],
      pickupIds: activePickupIds,
    });
  };

  const handleReset = () => {
    setOrderedPickups([]);
    setRouteGeoJSON(null);
    setSegmentRoute(null);
    setRouteInfo(null);
    setCurrentStopIndex(0);
    setCompletedIds(new Set());
    setRouteActive(false);
  };

  const currentTarget = routeActive && orderedPickups[currentStopIndex];

  return (
    <div className="w-full px-6 md:px-12 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Route className="h-7 w-7 text-primary" />
              Smart Route Planner
            </h1>
            <p className="text-muted-foreground mt-1">
              {pickups.length} pickup{pickups.length !== 1 ? "s" : ""} today •
              {completedIds.size} completed •
              {pickups.length - completedIds.size} remaining
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {routeInfo && (
              <div className="flex items-center gap-2 mr-2">
                <Badge variant="outline" className="gap-1">
                  <MapPin className="h-3 w-3" /> {routeInfo.distance} km
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Truck className="h-3 w-3" /> ~{routeInfo.duration} min
                </Badge>
              </div>
            )}
            <Button
              variant={settingLocation ? "destructive" : "outline"}
              size="sm"
              onClick={() => setSettingLocation(!settingLocation)}
              className="gap-1"
            >
              <Crosshair className="h-4 w-4" />
              {settingLocation ? "Cancel" : "Set My Location"}
            </Button>
            {routeActive ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-1"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
            ) : (
              <Button
                onClick={handleStartRoute}
                disabled={
                  optimizeMutation.isPending ||
                  !adminPos ||
                  pickups.length === 0
                }
                className="gap-2"
              >
                {optimizeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Start Route
              </Button>
            )}
          </div>
        </div>

        {/* Current target card */}
        {currentTarget && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Navigation className="h-5 w-5 text-primary animate-pulse" />
                      <span className="text-sm font-medium text-primary">
                        Next Stop
                      </span>
                    </div>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{
                        backgroundColor:
                          wasteColors[currentTarget.wasteType] || "#78909C",
                      }}
                    >
                      {currentStopIndex + 1}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {currentTarget.userId?.fullname}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {currentTarget.wasteType} waste
                        {currentTarget.distanceFromPrev &&
                          ` • ${currentTarget.distanceFromPrev} km away`}
                      </p>
                      {currentTarget.phone && (
                        <p className="text-xs text-muted-foreground">
                          📞 {currentTarget.phone}
                        </p>
                      )}
                      {currentTarget.address && (
                        <p className="text-xs text-muted-foreground">
                          {currentTarget.address}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => markPickedMutation.mutate(currentTarget._id)}
                    disabled={markPickedMutation.isPending}
                    className="gap-2"
                  >
                    {markPickedMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Mark as Picked
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {settingLocation && (
          <div className="mb-3 p-3 rounded-lg bg-blue-100 text-blue-800 border border-blue-200">
            Click on the map to set your current location
          </div>
        )}

        {/* Map */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-[550px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden h-[550px]">
                <MapContainer
                  center={center}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {settingLocation && (
                    <AdminLocationSetter onLocationSet={handleSetLocation} />
                  )}

                  {/* Admin position marker */}
                  {adminPos && (
                    <Marker
                      position={[adminPos[1], adminPos[0]]}
                      icon={createAdminIcon()}
                    >
                      <Popup>
                        <div className="text-sm font-semibold">
                          Your Location (Collection Vehicle)
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Pickup markers */}
                  {(routeActive ? orderedPickups : pickups).map(
                    (pickup, index) => {
                      const [lng, lat] = pickup.location.coordinates;
                      const color = wasteColors[pickup.wasteType] || "#78909C";
                      const isCompleted = completedIds.has(pickup._id);
                      const isNext = routeActive && index === currentStopIndex;

                      return (
                        <Marker
                          key={pickup._id}
                          position={[lat, lng]}
                          icon={
                            isCompleted
                              ? createCompletedIcon(index)
                              : createPickupIcon(index, color, isNext)
                          }
                        >
                          <Popup>
                            <div className="text-sm space-y-1">
                              <p className="font-bold">Stop #{index + 1}</p>
                              <p className="font-medium">
                                {pickup.userId?.fullname}
                              </p>
                              <p className="capitalize">
                                {pickup.wasteType} waste
                              </p>
                              {pickup.distanceFromPrev && (
                                <p className="text-gray-500">
                                  {pickup.distanceFromPrev} km from prev
                                </p>
                              )}
                              {pickup.address && (
                                <p className="text-gray-500">
                                  {pickup.address}
                                </p>
                              )}
                              {pickup.phone && (
                                <p className="text-gray-500">
                                  📞 {pickup.phone}
                                </p>
                              )}
                              {isCompleted && (
                                <p className="text-green-600 font-medium">
                                  ✓ Picked up
                                </p>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      );
                    },
                  )}

                  {/* Full route line (faded) */}
                  {routeGeoJSON && (
                    <Polyline
                      positions={routeGeoJSON}
                      pathOptions={{
                        color: "#16a34a",
                        weight: 3,
                        opacity: 0.25,
                        dashArray: "8 6",
                      }}
                    />
                  )}

                  {/* Current segment route (highlighted) */}
                  {segmentRoute && (
                    <Polyline
                      positions={segmentRoute}
                      pathOptions={{
                        color: "#16a34a",
                        weight: 5,
                        opacity: 0.85,
                      }}
                    />
                  )}
                </MapContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ordered pickup list */}
        {orderedPickups.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Route Order</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {orderedPickups.map((pickup, index) => {
                const isCompleted = completedIds.has(pickup._id);
                const isCurrent = index === currentStopIndex && routeActive;
                return (
                  <Card
                    key={pickup._id}
                    className={`transition-all ${isCompleted
                      ? "opacity-50"
                      : isCurrent
                        ? "ring-2 ring-primary shadow-md"
                        : "hover:shadow-md"
                      }`}
                  >
                    <CardContent className="py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${isCompleted ? "bg-gray-400" : ""
                            }`}
                          style={
                            isCompleted
                              ? {}
                              : {
                                backgroundColor:
                                  wasteColors[pickup.wasteType] || "#78909C",
                              }
                          }
                        >
                          {isCompleted ? "✓" : index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`font-medium truncate ${isCompleted ? "line-through" : ""}`}
                          >
                            {pickup.userId?.fullname}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {pickup.wasteType} • {pickup.distanceFromPrev} km
                          </p>
                          {pickup.address && (
                            <p className="text-xs text-muted-foreground truncate">
                              {pickup.address}
                            </p>
                          )}
                        </div>
                        {isCurrent && (
                          <Badge className="bg-primary text-primary-foreground shrink-0">
                            Next
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminRouteView;
