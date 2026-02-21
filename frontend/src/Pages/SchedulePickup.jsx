import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/Utils/AxiosWrapper.js";
import toast from "react-hot-toast";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
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

const wasteTypes = [
  { id: "organic", label: "Organic", icon: Leaf, color: "#4CAF50" },
  { id: "plastic", label: "Plastic", icon: Package, color: "#2196F3" },
  { id: "paper", label: "Paper", icon: FileText, color: "#D2B48C" },
  { id: "metal", label: "Metal", icon: Wrench, color: "#78909C" },
  { id: "ewaste", label: "E-Waste", icon: Cpu, color: "#7B1FA2" },
  { id: "glass", label: "Glass", icon: Wine, color: "#009688" },
  {
    id: "hazardous",
    label: "Hazardous",
    icon: AlertTriangle,
    color: "#FF5722",
  },
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
  const [step, setStep] = useState(1);
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
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  const mutation = useMutation({
    mutationFn: (data) => api.post("/pickups", data),
    onSuccess: () => {
      toast.success("Pickup scheduled successfully!");
      queryClient.invalidateQueries({ queryKey: ["userPickups"] });
      setStep(1);
      navigate("/dashboard");
      setSelectedWaste("");
      setScheduledDate(null);
      setAddress("");
      setPhone("");
      setNotes("");
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to schedule pickup");
    },
  });

  const handleNext = () => {
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
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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

  const selectedWasteType = wasteTypes.find((t) => t.id === selectedWaste);

  return (
    <div className="w-full max-w-6xl mx-auto px-6 md:px-12 py-18">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Schedule a Pickup
          </h1>
          <p className="text-muted-foreground mt-3">
            Choose your waste type, date, and location
          </p>
          {/* Step Indicator */}
          <div className="flex items-center gap-3 mt-8">
            <div
              className={cn(
                "flex items-center gap-2 text-sm font-medium",
                step === 1 ? "text-primary" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2",
                  step === 1
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-primary bg-primary/10 text-primary",
                )}
              >
                1
              </span>
              Details
            </div>
            <div className="h-px w-8 bg-border" />
            <div
              className={cn(
                "flex items-center gap-2 text-sm font-medium",
                step === 2 ? "text-primary" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2",
                  step === 2
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-muted text-muted-foreground",
                )}
              >
                2
              </span>
              Confirm & Submit
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                {/* Pickup Details - Step 1 */}
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
                                !scheduledDate && "text-muted-foreground",
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
                        <Label
                          htmlFor="phone"
                          className="flex items-center gap-2"
                        >
                          <Phone className="h-4 w-4 text-primary" />
                          Phone Number{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="e.g. 9812345678"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Waste Type <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={selectedWaste}
                        onValueChange={setSelectedWaste}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select waste type" />
                        </SelectTrigger>
                        <SelectContent>
                          {wasteTypes.map((type) => {
                            const Icon = type.icon;
                            return (
                              <SelectItem key={type.id} value={type.id}>
                                <span className="flex items-center gap-2">
                                  <Icon
                                    className="h-4 w-4"
                                    style={{ color: type.color }}
                                  />
                                  {type.label}
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="notes"
                        className="flex items-center gap-2"
                      >
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

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleNext} className="gap-2">
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Review Your Pickup
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Waste Type</p>
                        <p className="font-medium flex items-center gap-2">
                          {selectedWasteType && (
                            <>
                              {(() => {
                                const Icon = selectedWasteType.icon;
                                return (
                                  <Icon
                                    className="h-4 w-4"
                                    style={{ color: selectedWasteType.color }}
                                  />
                                );
                              })()}
                              {selectedWasteType.label}
                            </>
                          )}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Pickup Date</p>
                        <p className="font-medium">
                          {scheduledDate?.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-medium">{phone}</p>
                      </div>
                      {address && (
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Address</p>
                          <p className="font-medium">{address}</p>
                        </div>
                      )}
                      {notes && (
                        <div className="space-y-1 sm:col-span-2">
                          <p className="text-muted-foreground">Notes</p>
                          <p className="font-medium">{notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Map / Location */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Set Pickup Location
                    </CardTitle>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Click on the map or drag the marker to set your location
                      </p>
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
                              setPosition([
                                pos.coords.latitude,
                                pos.coords.longitude,
                              ]);
                              setLocating(false);
                              toast.success("Location updated");
                            },
                            () => {
                              setLocating(false);
                              toast.error("Could not get your location");
                            },
                            { enableHighAccuracy: true, timeout: 8000 },
                          );
                        }}
                      >
                        {locating ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Crosshair className="h-3.5 w-3.5" />
                        )}
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
                        <DraggableMarker
                          position={position}
                          setPosition={setPosition}
                        />
                        <MapUpdater position={position} />
                      </MapContainer>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Lat: {position[0].toFixed(5)}, Lng:{" "}
                      {position[1].toFixed(5)}
                    </p>
                  </CardContent>
                </Card>

                <div className="flex justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="gap-2 min-w-[160px]"
                  >
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
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  );
};

export default SchedulePickup;
