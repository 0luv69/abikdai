import { useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import api from "@/Utils/AxiosWrapper.js";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const wasteMarkerColors = {
  organic: "#4CAF50",
  plastic: "#2196F3",
  paper: "#D2B48C",
  metal: "#78909C",
  ewaste: "#7B1FA2",
  glass: "#009688",
  hazardous: "#FF5722",
};

function createColoredIcon(color) {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 24px; height: 24px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}

const MapPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["userPickups", "map"],
    queryFn: () => api.get("/pickups?limit=100"),
  });

  const pickups = data?.pickups || [];

  const center = useMemo(() => {
    if (pickups.length === 0) return [27.7172, 85.3240];
    const avgLat = pickups.reduce((s, p) => s + p.location.coordinates[1], 0) / pickups.length;
    const avgLng = pickups.reduce((s, p) => s + p.location.coordinates[0], 0) / pickups.length;
    return [avgLat, avgLng];
  }, [pickups]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <MapPin className="h-7 w-7 text-primary" />
            Pickup Map
          </h1>
          <p className="text-muted-foreground mt-1">View all your pickup locations</p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4">
          {Object.entries(wasteMarkerColors).map(([type, color]) => (
            <Badge key={type} variant="outline" className="gap-1.5 capitalize">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              {type}
            </Badge>
          ))}
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-[500px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden h-[500px]">
                <MapContainer
                  center={center}
                  zoom={12}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {pickups.map((pickup) => {
                    const [lng, lat] = pickup.location.coordinates;
                    const color = wasteMarkerColors[pickup.wasteType] || "#78909C";
                    return (
                      <Marker
                        key={pickup._id}
                        position={[lat, lng]}
                        icon={createColoredIcon(color)}
                      >
                        <Popup>
                          <div className="text-sm space-y-1">
                            <p className="font-semibold capitalize">{pickup.wasteType} Waste</p>
                            <p className="text-gray-600">
                              {new Date(pickup.scheduledDate).toLocaleDateString()}
                            </p>
                            <p className="capitalize text-gray-500">Status: {pickup.status.replace("_", " ")}</p>
                            {pickup.address && <p className="text-gray-500">{pickup.address}</p>}
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default MapPage;
