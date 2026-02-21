import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  Leaf,
  Recycle,
  MapPin,
  Calendar,
  Truck,
  CheckCircle,
  ArrowRight,
  Clock,
  Shield,
  ChevronRight,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

function AnimatedSection({ children, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const features = [
  { icon: Calendar, title: "Easy Scheduling", text: "Schedule garbage pickup with just a few clicks." },
  { icon: MapPin, title: "Smart Location", text: "Set your exact pickup location on an interactive map." },
  { icon: Truck, title: "Live Tracking", text: "Track your pickup status in real-time." },
  { icon: Clock, title: "Route Optimization", text: "Optimized collection routes save time and fuel." },
  { icon: Recycle, title: "Waste Segregation", text: "Categorize waste types for proper disposal." },
  { icon: Leaf, title: "Eco Impact", text: "Track your contribution to a cleaner environment." },
];

const steps = [
  { num: 1, title: "Sign Up", text: "Create your free account in seconds." },
  { num: 2, title: "Schedule Pickup", text: "Choose waste type, date, and location." },
  { num: 3, title: "We Collect", text: "Our team picks up your waste on time." },
  { num: 4, title: "Track & Repeat", text: "Monitor status and schedule again." },
];

const wasteCategories = [
  { name: "Organic", color: "#4CAF50", icon: Leaf },
  { name: "Plastic", color: "#2196F3", icon: Recycle },
  { name: "Paper", color: "#D2B48C", icon: CheckCircle },
  { name: "Metal", color: "#78909C", icon: Shield },
  { name: "E-Waste", color: "#7B1FA2", icon: Clock },
  { name: "Glass", color: "#009688", icon: ChevronRight },
];


const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      <section className="relative isolate px-6 pt-20 pb-24 md:pt-32 md:pb-36">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 h-[520px] w-[720px] rounded-full bg-primary/15 blur-[120px]" />
        </div>

        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="pointer-events-none absolute text-primary/10"
            style={{
              top: `${10 + i * 18}%`,
              left: `${5 + i * 20}%`,
            }}
            animate={{ y: [0, -18, 0], rotate: [0, 8, -8, 0] }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
          >
            <Leaf className="h-10 w-10 md:h-14 md:w-14" />
          </motion.div>
        ))}

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-3xl text-center space-y-6"
        >
          <motion.h1
            variants={fadeUp}
            custom={0}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight"
          >
            Smart Waste Management for a{" "}
            <span className="text-primary">Cleaner Tomorrow</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={1}
            className="mx-auto max-w-xl text-muted-foreground text-base sm:text-lg"
          >
            Schedule pickups, track waste collection in real-time, and help
            optimize routes — all from one simple platform.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={2}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button asChild size="lg" className="gap-2">
              <Link to="/schedule">
                Schedule a Pickup <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <a href="#features">
                Learn More <ChevronRight className="h-4 w-4" />
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      <section id="features" className="px-6 py-20 md:py-28">
        <AnimatedSection className="mx-auto max-w-5xl space-y-12">
          <motion.div variants={fadeUp} className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything You Need
            </h2>
            <p className="mx-auto max-w-lg text-muted-foreground">
              Powerful features designed to make waste management effortless.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} custom={i}>
                <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow h-full">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.text}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatedSection>
      </section>

      <section className="px-6 py-20 md:py-28 bg-muted/40">
        <AnimatedSection className="mx-auto max-w-4xl space-y-12">
          <motion.div variants={fadeUp} className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              How It Works
            </h2>
            <p className="mx-auto max-w-lg text-muted-foreground">
              Four simple steps to a cleaner neighborhood.
            </p>
          </motion.div>

          <div className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* connecting line (desktop) */}
            <div className="hidden lg:block absolute top-10 left-[12%] right-[12%] h-0.5 bg-border" />

            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                variants={fadeUp}
                custom={i}
                className="relative text-center space-y-3"
              >
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold shadow-md z-10">
                  {s.num}
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      <section className="px-6 py-20 md:py-28">
        <AnimatedSection className="mx-auto max-w-5xl space-y-12">
          <motion.div variants={fadeUp} className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Waste Categories
            </h2>
            <p className="mx-auto max-w-lg text-muted-foreground">
              We handle all major types of waste responsibly.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5"
          >
            {wasteCategories.map((w, i) => (
              <motion.div
                key={w.name}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -6, boxShadow: "0 12px 28px -8px rgba(0,0,0,0.15)" }}
                className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-6 cursor-default transition-colors"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${w.color}20` }}
                >
                  <w.icon className="h-7 w-7" style={{ color: w.color }} />
                </div>
                <span className="text-sm font-semibold">{w.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </AnimatedSection>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-20 md:py-28 bg-primary/5">
        <AnimatedSection className="mx-auto max-w-2xl text-center space-y-6">
          <motion.h2
            variants={fadeUp}
            className="text-3xl sm:text-4xl font-bold tracking-tight"
          >
            Ready to Make a Difference?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="text-muted-foreground text-base sm:text-lg"
          >
            Join EcoCollect today and help create a cleaner, greener community.
          </motion.p>
          <motion.div variants={fadeUp} custom={2}>
            <Button asChild size="lg" className="gap-2">
              <Link to="/register">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </AnimatedSection>
      </section>

      <footer className="px-6 py-10 text-center text-sm text-muted-foreground">
        © 2026 EcoCollect. Smart Waste, Clean Future.
      </footer>
    </div>
  );
};

export default LandingPage;

