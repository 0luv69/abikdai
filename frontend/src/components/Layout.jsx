import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Leaf,
  Home,
  CalendarPlus,
  Package,
  Map,
  LogOut,
  User,
  Shield,
  Sun,
  Moon,
} from "lucide-react";

import useUserStore from "@/ZustandStore/UserStore";
import api from "@/Utils/AxiosWrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/", label: "Home", icon: Home, requiresAuth: false },
  { to: "/schedule", label: "Schedule Pickup", icon: CalendarPlus, requiresAuth: true },
  { to: "/pickups", label: "My Pickups", icon: Package, requiresAuth: true },
  { to: "/map", label: "Map", icon: Map, requiresAuth: true },
];

const mobileNavLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/schedule", label: "Schedule", icon: CalendarPlus },
  { to: "/pickups", label: "Pickups", icon: Package },
  { to: "/map", label: "Map", icon: Map },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Layout() {
  const { currentUser, setCurrentUser, clearCurrentUser } = useUserStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored) return stored === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await api.get("/users/me");
        if (user && user.id) {
          setCurrentUser(user);
        }
      } catch {
        // User is not logged in — that's fine
      }
    };
    checkAuth();
  }, [setCurrentUser]);

  const handleLogout = async () => {
    try {
      await api.get("/users/logout");
    } catch {
      // Proceed with local cleanup even if request fails
    }
    clearCurrentUser();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Desktop Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="size-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">EcoCollect</span>
          </Link>

          {/* Center Nav Links — desktop only */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks
              .filter((link) => !link.requiresAuth || currentUser)
              .map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      "relative px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-x-0 -bottom-[calc(0.5rem+1px)] h-0.5 bg-primary"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}

            {currentUser?.role === "admin" && (
              <Link
                to="/admin"
                className={cn(
                  "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  location.pathname.startsWith("/admin")
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Shield className="size-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Right — auth actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDarkMode((d) => !d)}
              className="h-9 w-9 p-0"
            >
              {darkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            {currentUser ? (
              <>
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  <User className="size-3" />
                  {currentUser.fullname}
                </Badge>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav — only when authenticated */}
      {currentUser && (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/90 backdrop-blur md:hidden">
          <div className="flex items-center justify-around py-2">
            {mobileNavLinks.map((link) => {
              const isActive = location.pathname === link.to;
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className={cn("size-5", isActive && "fill-primary")} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Spacer to prevent content from hiding behind mobile nav */}
      {currentUser && <div className="h-16 md:hidden" />}
    </div>
  );
}
