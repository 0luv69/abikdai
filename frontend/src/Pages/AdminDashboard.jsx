import { useState } from "react";
import { motion } from "framer-motion";
import {
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  BarChart3,
  Users,
  Loader2,
  MapPin,
  ChevronDown,
  Navigation,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/Utils/AxiosWrapper.js";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const statusConfig = {
  scheduled: { label: "Scheduled", color: "bg-blue-100 text-blue-700", icon: Clock },
  assigned: { label: "Assigned", color: "bg-purple-100 text-purple-700", icon: Navigation },
  in_progress: { label: "In Progress", color: "bg-amber-100 text-amber-700", icon: Truck },
  picked: { label: "Picked Up", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: XCircle },
};

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => api.get("/admin/stats"),
  });

  const { data: pickupsData, isLoading: pickupsLoading } = useQuery({
    queryKey: ["adminPickups", statusFilter, dateFilter, page],
    queryFn: () => {
      let url = `/admin/pickups?page=${page}&limit=20`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (dateFilter) url += `&date=${dateFilter}`;
      return api.get(url);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/admin/pickups/${id}`, { status }),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["adminPickups"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (err) => toast.error(err?.message || "Update failed"),
  });

  const pickups = pickupsData?.pickups || [];
  const total = pickupsData?.total || 0;

  const statCards = [
    { label: "Total Requests", value: stats?.total || 0, icon: BarChart3, color: "text-primary" },
    { label: "Today's Pickups", value: stats?.todayCount || 0, icon: Calendar, color: "text-blue-600" },
    { label: "Scheduled", value: stats?.scheduled || 0, icon: Clock, color: "text-amber-600" },
    { label: "In Progress", value: stats?.inProgress || 0, icon: Truck, color: "text-orange-600" },
    { label: "Completed", value: stats?.picked || 0, icon: CheckCircle, color: "text-emerald-600" },
    { label: "Cancelled", value: stats?.cancelled || 0, icon: XCircle, color: "text-red-600" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage all pickup requests</p>
          </div>
          <Link to="/admin/routes">
            <Button variant="outline" className="gap-2">
              <MapPin className="h-4 w-4" />
              Route Map
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold mt-1">
                  {statsLoading ? "—" : stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            {["", "scheduled", "assigned", "in_progress", "picked", "cancelled"].map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                size="sm"
                onClick={() => { setStatusFilter(s); setPage(1); }}
              >
                {s ? s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "All"}
              </Button>
            ))}
          </div>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
            className="w-auto"
          />
          {dateFilter && (
            <Button variant="ghost" size="sm" onClick={() => setDateFilter("")}>
              Clear date
            </Button>
          )}
        </div>

        {/* Pickups Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pickup Requests ({total})</CardTitle>
          </CardHeader>
          <CardContent>
            {pickupsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : pickups.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">No pickups found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 font-medium">User</th>
                      <th className="pb-3 font-medium">Waste Type</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Address</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pickups.map((pickup) => {
                      const sc = statusConfig[pickup.status] || statusConfig.scheduled;
                      return (
                        <tr key={pickup._id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3">
                            <div>
                              <p className="font-medium">{pickup.userId?.fullname || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">{pickup.userId?.email}</p>
                            </div>
                          </td>
                          <td className="py-3">
                            <Badge variant="outline" className="capitalize">{pickup.wasteType}</Badge>
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {new Date(pickup.scheduledDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-muted-foreground max-w-[150px] truncate">
                            {pickup.address || "—"}
                          </td>
                          <td className="py-3">
                            <Badge className={`${sc.color} gap-1`}>
                              <sc.icon className="h-3 w-3" />
                              {sc.label}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <select
                              value={pickup.status}
                              onChange={(e) =>
                                updateMutation.mutate({ id: pickup._id, status: e.target.value })
                              }
                              className="text-xs border rounded-md px-2 py-1 bg-background"
                            >
                              <option value="scheduled">Scheduled</option>
                              <option value="assigned">Assigned</option>
                              <option value="in_progress">In Progress</option>
                              <option value="picked">Picked</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {Math.ceil(total / 20) > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="flex items-center text-sm text-muted-foreground px-3">
              Page {page} of {Math.ceil(total / 20)}
            </span>
            <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
