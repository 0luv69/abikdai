import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  CheckCircle,
  Truck,
  Plus,
  MapPin,
  Loader2,
  XCircle,
  Navigation,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/Utils/AxiosWrapper.js";
import { useQuery } from "@tanstack/react-query";

const statusConfig = {
  scheduled: { label: "Scheduled", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", icon: Clock },
  assigned: { label: "Assigned", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", icon: Navigation },
  in_progress: { label: "In Progress", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", icon: Truck },
  picked: { label: "Picked Up", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", icon: XCircle },
};

const wasteColors = {
  organic: "bg-[#4CAF50]",
  plastic: "bg-[#2196F3]",
  paper: "bg-[#D2B48C]",
  metal: "bg-[#78909C]",
  ewaste: "bg-[#7B1FA2]",
  glass: "bg-[#009688]",
  hazardous: "bg-[#FF5722]",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const Dashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["userPickups"],
    queryFn: () => api.get("/pickups?limit=10"),
  });

  const pickups = data?.pickups || [];
  const total = data?.total || 0;

  const stats = {
    scheduled: pickups.filter((p) => p.status === "scheduled").length,
    inProgress: pickups.filter((p) => p.status === "in_progress").length,
    picked: pickups.filter((p) => p.status === "picked").length,
    total,
  };

  const statCards = [
    { label: "Scheduled", value: stats.scheduled, icon: Clock, color: "text-blue-600" },
    { label: "In Progress", value: stats.inProgress, icon: Truck, color: "text-amber-600" },
    { label: "Completed", value: stats.picked, icon: CheckCircle, color: "text-emerald-600" },
    { label: "Total Requests", value: stats.total, icon: Calendar, color: "text-primary" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div variants={container} initial="hidden" animate="show">
        {/* Header */}
        <motion.div variants={item} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your waste pickups</p>
          </div>
          <Link to="/schedule">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Schedule Pickup
            </Button>
          </Link>
        </motion.div>

        {/* Stat Cards */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Recent Pickups */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Pickups</CardTitle>
              <Link to="/pickups">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : pickups.length === 0 ? (
                <div className="text-center py-12">
                  <Truck className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground">No pickups scheduled yet</p>
                  <Link to="/schedule">
                    <Button variant="outline" className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      Schedule your first pickup
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {pickups.slice(0, 5).map((pickup) => {
                    const sc = statusConfig[pickup.status] || statusConfig.scheduled;
                    const StatusIcon = sc.icon;
                    return (
                      <motion.div
                        key={pickup._id}
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-4 p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className={`w-2 h-10 rounded-full ${wasteColors[pickup.wasteType] || "bg-gray-400"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium capitalize">{pickup.wasteType} Waste</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(pickup.scheduledDate).toLocaleDateString()}</span>
                            {pickup.address && (
                              <>
                                <MapPin className="h-3 w-3 ml-2" />
                                <span className="truncate">{pickup.address}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary" className={`${sc.color} gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {sc.label}
                        </Badge>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
