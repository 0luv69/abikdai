import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Truck,
  BarChart3,
  Leaf,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function AnimatedSection({ children, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
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
  {
    icon: MapPin,
    title: "Waste Issue Reporting",
    text: "Pinpoint exact locations of uncollected waste or illegal dumping for immediate municipal attention.",
  },
  {
    icon: Truck,
    title: "Real-Time Tracking",
    text: "Monitor the status of your reported issues and scheduled collections with live updates.",
  },
  {
    icon: BarChart3,
    title: "Municipal Dashboard",
    text: "Equip authorities with data-driven insights to optimize collection routes and resource allocation.",
  },
  {
    icon: Leaf,
    title: "Environmental Monitoring",
    text: "Track community cleanliness metrics and measure the direct impact of waste management efforts.",
  },
];

const steps = [
  {
    num: "01",
    title: "Report",
    text: "Submit a detailed request or report an issue with precise location data.",
  },
  {
    num: "02",
    title: "Manage",
    text: "Authorities review, prioritize, and assign the task to the appropriate collection team.",
  },
  {
    num: "03",
    title: "Resolve",
    text: "The issue is addressed, and you receive confirmation of the completed service.",
  },
];

const LandingPage = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="px-6 pb-20 md:pt-4 md:pb-12">
        <AnimatedSection className="px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center rounded-full border border-border/50 bg-secondary px-3 py-1 text-sm text-muted-foreground"
            >
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
              Modernizing municipal waste management
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground leading-[1.1]"
            >
              Structured waste collection for cleaner communities.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              A centralized platform for citizens to report issues and
              authorities to manage operations efficiently. Built for
              transparency and environmental accountability.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4"
            >
              <Button
                asChild
                size="lg"
                className="rounded-full px-8 h-12 text-base"
              >
                <Link to="/schedule">Report an Issue</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-8 h-12 text-base border-border hover:bg-secondary"
              >
                <Link to="/register">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
          {/* Hero Image / SVG */}
          <motion.div
            variants={fadeUp}
            custom={4}
            className="relative w-full aspect-square max-w-md mx-auto lg:max-w-none"
          >
            <img src="/ursvg.svg" alt="My SVG" />
            {/* RADIANT BACK GLOW */}
          </motion.div>{" "}
        </AnimatedSection>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="px-6 py-20 md:py-28 border-t border-border/40 bg-secondary/30"
      >
        <AnimatedSection className="px-6 md:px-12 space-y-16">
          <motion.div variants={fadeUp} className="space-y-4 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Comprehensive operational control.
            </h2>
            <p className="text-muted-foreground text-lg">
              Tools designed to bridge the gap between civic reporting and
              municipal action.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid gap-6 sm:grid-cols-2"
          >
            {features.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} custom={i}>
                <Card className="p-8 h-full bg-background border-border/50 hover:border-border transition-colors rounded-2xl">
                  <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary border border-border/50">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-3">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {f.text}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatedSection>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="px-6 py-20 md:py-28 border-t border-border/40"
      >
        <AnimatedSection className="px-6 md:px-12 space-y-16">
          <motion.div variants={fadeUp} className="space-y-4 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              A streamlined process.
            </h2>
            <p className="text-muted-foreground text-lg">
              From reporting to resolution, every step is tracked and verified.
            </p>
          </motion.div>

          <div className="grid gap-12 md:grid-cols-3 relative">
            <div className="hidden md:block absolute top-6 left-[15%] right-[15%] h-[1px] bg-border/50" />

            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                variants={fadeUp}
                custom={i}
                className="relative space-y-6"
              >
                <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary border border-border text-sm font-medium z-10">
                  {s.num}
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-3">{s.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {s.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24 md:py-32 border-t border-border/40 bg-surface/30">
        <AnimatedSection className="px-6 md:px-12 text-center space-y-8">
          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-5xl font-semibold tracking-tight"
          >
            Participate in maintaining a cleaner environment.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Register today to start reporting issues and tracking municipal
            progress in your area.
          </motion.p>
          <motion.div variants={fadeUp} custom={2} className="pt-4">
            <Button
              asChild
              size="lg"
              className="rounded-full px-8 h-12 text-base"
            >
              <Link to="/register">Create an Account</Link>
            </Button>
          </motion.div>
        </AnimatedSection>
      </section>

      {/* Map Section */}
      <section className="px-6 py-20 md:py-28 border-t border-border/40">
        <AnimatedSection className="px-6 md:px-12 space-y-12">
          <motion.div
            variants={fadeUp}
            className="space-y-4 max-w-3xl text-center mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Active Service Areas
            </h2>
            <p className="text-muted-foreground text-lg">
              We are currently operating and optimizing routes in these
              municipal zones.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden border border-border/50 shadow-sm"
          >
            <iframe
              src="https://www.google.com/maps?q=Biratnagar,Nepal&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Service Area Map"
              className="grayscale contrast-125 opacity-90"
            ></iframe>
          </motion.div>
        </AnimatedSection>
      </section>
    </div>
  );
};

export default LandingPage;
