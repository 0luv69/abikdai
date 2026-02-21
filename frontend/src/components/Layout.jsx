import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard,
  ChevronDown,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useUserStore from "@/ZustandStore/UserStore";
import api from "@/Utils/AxiosWrapper";

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, setCurrentUser, clearCurrentUser } = useUserStore();
  const location = useLocation();
  const navigate = useNavigate();

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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground font-sans">
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="w-full px-6 md:px-12 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="font-semibold tracking-tight text-lg">
              CivicWaste
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium ">
            <Link
              to="/"
              className={`transition-colors ${location.pathname === "/" ? "text-foreground" : ""}`}
            >
              Home
            </Link>
            <Link
              to="/schedule"
              className={`hover:text-foreground transition-colors ${location.pathname === "/schedule" ? "text-foreground" : ""}`}
            >
              Schedule
            </Link>

            <div className="flex items-center gap-4 ml-4">
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 hover:bg-transparent hover:text-foreground"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="hidden lg:inline">
                        {currentUser.fullname}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hover:scale-105 transition-colors"
                  >
                    Log in
                  </Link>
                  <Button asChild size="sm" className="rounded-full px-5">
                    <Link to="/register">Register</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          <button
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border/40 bg-background overflow-hidden"
            >
              <div className="px-6 py-4 space-y-4">
                <Link
                  to="/"
                  className="block text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Home
                </Link>
                <Link
                  to="/schedule"
                  className="block text-sm font-medium text-muted-foreground hover:scale-105 transition-transform"
                >
                  Schedule
                </Link>
                <div className="pt-4 flex flex-col gap-3 border-t border-border/40">
                  {currentUser ? (
                    <>
                      <span className="text-sm font-medium text-foreground flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {currentUser.fullname}
                      </span>
                      <Link
                        to="/dashboard"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full rounded-full justify-center hover:text-red-500"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground"
                      >
                        Log in
                      </Link>
                      <Button asChild className="w-full rounded-full">
                        <Link to="/register">Register</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex-1 flex flex-col w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-border/40 bg-primary text-primary-foreground mt-auto">
        <div className="w-full px-6 md:px-12 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
            <div className="sm:col-span-2 lg:col-span-1 space-y-4">
              <Link to="/" className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-accent" />
                <span className="font-semibold tracking-tight text-lg">
                  CivicWaste
                </span>
              </Link>
              <p className="text-sm text-primary-foreground/60 leading-relaxed max-w-xs">
                A modern platform connecting citizens and municipalities for
                cleaner, more transparent waste management.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold tracking-wide uppercase text-primary-foreground/80">
                Navigate
              </h4>
              <ul className="space-y-2.5 text-sm text-primary-foreground/60">
                <li>
                  <Link
                    to="/"
                    className="transition-colors hover:text-primary-foreground"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/schedule"
                    className="transition-colors hover:text-primary-foreground"
                  >
                    Schedule Pickup
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="transition-colors hover:text-primary-foreground"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pickups"
                    className="transition-colors hover:text-primary-foreground"
                  >
                    My Pickups
                  </Link>
                </li>
              </ul>
            </div>

            {/* Platform */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold tracking-wide uppercase text-primary-foreground/80">
                Platform
              </h4>
              <ul className="space-y-2.5 text-sm text-primary-foreground/60">
                <li>
                  <Link
                    to="/map"
                    className="transition-colors hover:text-primary-foreground"
                  >
                    Pickup Map
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="transition-colors hover:text-primary-foreground"
                  >
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="transition-colors hover:text-primary-foreground"
                  >
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold tracking-wide uppercase text-primary-foreground/80">
                Contact
              </h4>
              <ul className="space-y-2.5 text-sm text-primary-foreground/60">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                  <span>Biratnagar, Morang, Nepal</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-accent" />
                  <span>+977 021-000000</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-accent" />
                  <span>hello@civicwaste.np</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-primary-foreground/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-primary-foreground/40">
              © {new Date().getFullYear()} CivicWaste Platform. All rights
              reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-primary-foreground/40">
              <span className="transition-colors hover:text-primary-foreground cursor-pointer">
                Privacy Policy
              </span>
              <span className="transition-colors hover:text-primary-foreground cursor-pointer">
                Terms of Service
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
