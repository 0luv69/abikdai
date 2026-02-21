import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  MapPin,
  Loader2,
  Filter,
  Plus,
  Navigation,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/Utils/AxiosWrapper.js";
import toast from "react-hot-toast";

const statusConfig = {
  scheduled: {
    label: "Scheduled",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    icon: Clock,
  },
  assigned: {
    label: "Assigned",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    icon: Navigation,
  },
  in_progress: {
    label: "In Progress",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    icon: Truck,
  },
  picked: {
    label: "Picked Up",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    icon: XCircle,
  },
};

const wasteColors = {
  organic: {
    bg: "bg-[#4CAF50]/10",
    text: "text-[#4CAF50]",
    dot: "bg-[#4CAF50]",
  },
  plastic: {
    bg: "bg-[#2196F3]/10",
    text: "text-[#2196F3]",
    dot: "bg-[#2196F3]",
  },
  paper: { bg: "bg-[#D2B48C]/10", text: "text-[#D2B48C]", dot: "bg-[#D2B48C]" },
  metal: { bg: "bg-[#78909C]/10", text: "text-[#78909C]", dot: "bg-[#78909C]" },
  ewaste: {
    bg: "bg-[#7B1FA2]/10",
    text: "text-[#7B1FA2]",
    dot: "bg-[#7B1FA2]",
  },
  glass: { bg: "bg-[#009688]/10", text: "text-[#009688]", dot: "bg-[#009688]" },
  hazardous: {
    bg: "bg-[#FF5722]/10",
    text: "text-[#FF5722]",
    dot: "bg-[#FF5722]",
  },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

const PickupHistory = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["userPickups", statusFilter, page],
    queryFn: () =>
      api.get(
        `/pickups?limit=20&page=${page}${statusFilter ? `&status=${statusFilter}` : ""}`,
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/pickups/${id}`),
    onSuccess: () => {
      toast.success("Pickup deleted");
      queryClient.invalidateQueries({ queryKey: ["userPickups"] });
    },
    onError: (err) => toast.error(err?.message || "Failed to delete pickup"),
  });

  const pickups = data?.pickups || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  const filters = [
    { value: "", label: "All" },
    { value: "scheduled", label: "Scheduled" },
    { value: "assigned", label: "Assigned" },
    { value: "in_progress", label: "In Progress" },
    { value: "picked", label: "Picked" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="w-full px-auto md:px-12 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Pickups</h1>
            <p className="text-muted-foreground mt-1">{total} total requests</p>
          </div>
          <Link to="/schedule">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Pickup
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {filters.map((f) => (
            <Button
              key={f.value}
              variant={statusFilter === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatusFilter(f.value);
                setPage(1);
              }}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : pickups.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Truck className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                No pickups found
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {statusFilter
                  ? "Try a different filter"
                  : "Schedule your first pickup"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {pickups.map((pickup) => {
              const sc = statusConfig[pickup.status] || statusConfig.scheduled;
              const wc = wasteColors[pickup.wasteType] || {
                bg: "bg-gray-100",
                text: "text-gray-600",
                dot: "bg-gray-400",
              };
              const StatusIcon = sc.icon;
              return (
                <motion.div key={pickup._id} variants={item}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-14 rounded-full ${wc.dot}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold capitalize">
                              {pickup.wasteType} Waste
                            </span>
                            <Badge
                              variant="secondary"
                              className={`${wc.bg} ${wc.text} text-xs`}
                            >
                              {pickup.wasteType}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(
                                pickup.scheduledDate,
                              ).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            {pickup.address && (
                              <span className="flex items-center gap-1 truncate max-w-[200px]">
                                <MapPin className="h-3.5 w-3.5" />
                                {pickup.address}
                              </span>
                            )}
                          </div>
                          {pickup.notes && (
                            <p className="text-xs text-muted-foreground/70 mt-1 truncate">
                              📝 {pickup.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant="secondary"
                            className={`bg-white gap-1.5`}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {sc.label}
                          </Badge>
                          {["scheduled", "assigned"].includes(
                            pickup.status,
                          ) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                disabled={deleteMutation.isPending}
                                onClick={() => {
                                  if (
                                    window.confirm("Delete this pickup request?")
                                  ) {
                                    deleteMutation.mutate(pickup._id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center text-sm text-muted-foreground px-3">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PickupHistory;
