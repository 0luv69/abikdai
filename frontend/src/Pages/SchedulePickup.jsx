import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Leaf,
  Package,
  FileText,
  Wrench,
  Cpu,
  Wine,
  AlertTriangle,
  CalendarIcon,
  MapPin,
  StickyNote,
  Loader2,
  CheckCircle,
  Crosshair,
  Phone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/Utils/AxiosWrapper.js";
import toast from "react-hot-toast";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const wasteTypes = [
  { id: "organic", label: "Organic", icon: Leaf, color: "#4CAF50" },
  { id: "plastic", label: "Plastic", icon: Package, color: "#2196F3" },
  { id: "paper", label: "Paper", icon: FileText, color: "#D2B48C" },
  { id: "metal", label: "Metal", icon: Wrench, color: "#78909C" },
  { id: "ewaste", label: "E-Waste", icon: Cpu, color: "#7B1FA2" },
  { id: "glass", label: "Glass", icon: Wine, color: "#009688" },
  { id: "hazardous", label: "Hazardous", icon: AlertTriangle, color: "#FF5722" },
];

function DraggableMarker({ position, setPosition }) {
  const markerRef = useRef(null);

  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const latlng = marker.getLatLng();
        setPosition([latlng.lat, latlng.lng]);
      }
    },
  };

  return (
    <Marker
      draggable
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
}

function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, map.getZoom(), { duration: 1 });
  }, [position, map]);
  return null;
}

const BIRATNAGAR = [26.4525, 87.2718];

const SchedulePickup = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedWaste, setSelectedWaste] = useState("");
  const [scheduledDate, setScheduledDate] = useState(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [position, setPosition] = useState(BIRATNAGAR);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const mutation = useMutation({
    mutationFn: (data) => api.post("/pickups", data),
    onSuccess: () => {
      toast.success("Pickup scheduled successfully!");
      queryClient.invalidateQueries({ queryKey: ["userPickups"] });
      navigate("/dashboard");
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to schedule pickup");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedWaste) {
      toast.error("Please select a waste type");
      return;
    }
    if (!scheduledDate) {
      toast.error("Please select a date");
      return;
    }
    if (!phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    mutation.mutate({
      wasteType: selectedWaste,
      scheduledDate: scheduledDate.toISOString(),
      latitude: position[0],
      longitude: position[1],
      address,
      phone: phone.trim(),
      notes,
    });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Schedule a Pickup</h1>
          <p className="text-muted-foreground mt-1">Choose your waste type, date, and location</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Waste Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Waste Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {wasteTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedWaste === type.id;
                  return (
                    <motion.button
                      key={type.id}
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedWaste(type.id)}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${isSelected
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/30 hover:bg-muted/50"
                        }`}
                    >
                      {isSelected && (
                        <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-primary" />
                      )}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${type.color}20` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: type.color }} />
                      </div>
                      <span className="text-sm font-medium">{type.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pickup Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    Pickup Date
                  </Label>
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !scheduledDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduledDate
                          ? scheduledDate.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                          : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={scheduledDate}
                        onSelect={(date) => {
                          setScheduledDate(date);
                          setDateOpen(false);
                        }}
                        disabled={(date) => date < today}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Address (optional)
                  </Label>
                  <Input
                    id="address"
                    placeholder="Enter your address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g. 9812345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-primary" />
                  Notes (optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any special instructions for the pickup team..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Set Pickup Location
              </CardTitle>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Click on the map or drag the marker to set your location</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 shrink-0"
                  disabled={locating}
                  onClick={() => {
                    if (!navigator.geolocation) {
                      toast.error("Geolocation not supported");
                      return;
                    }
                    setLocating(true);
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setPosition([pos.coords.latitude, pos.coords.longitude]);
                        setLocating(false);
                        toast.success("Location updated");
                      },
                      () => {
                        setLocating(false);
                        toast.error("Could not get your location");
                      },
                      { enableHighAccuracy: true, timeout: 8000 }
                    );
                  }}
                >
                  {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Crosshair className="h-3.5 w-3.5" />}
                  {locating ? "Locating..." : "Use My Location"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl overflow-hidden border h-[400px]">
                <MapContainer
                  center={position}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <DraggableMarker position={position} setPosition={setPosition} />
                  <MapUpdater position={position} />
                </MapContainer>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Lat: {position[0].toFixed(5)}, Lng: {position[1].toFixed(5)}
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="gap-2 min-w-[160px]">
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Schedule Pickup
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SchedulePickup;
