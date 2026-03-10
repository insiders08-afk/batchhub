import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, CheckCircle2, Users, BookOpen, ClipboardList,
  MessageSquare, IndianRupee, TrendingUp, Star, ArrowRight,
  Zap, Shield, Smartphone, Globe, Download, X } from
"lucide-react";
import heroDashboard from "@/assets/hero-dashboard.png";
import InstallButton from "@/components/InstallButton";
import { supabase } from "@/integrations/supabase/client";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{outcome: "accepted" | "dismissed";}>;
}

const roleToPath: Record<string, string> = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
  parent: "/parent",
  super_admin: "/superadmin",
  app_owner: "/owner",
};

const features = [
{ icon: Users, title: "Batch Management", desc: "Organise students into batches by course. JEE, NEET, Foundation — all in one place.", color: "primary" },
{ icon: ClipboardList, title: "Digital Attendance", desc: "Mark attendance in seconds. Get instant reports, alerts for low-attendance students.", color: "accent" },
{ icon: MessageSquare, title: "Batch Chat", desc: "Replace WhatsApp groups with structured, role-based batch communication.", color: "success" },
{ icon: BarChart3, title: "Test & Rankings", desc: "Create tests, enter scores, auto-generate leaderboards and performance reports.", color: "primary" },
{ icon: IndianRupee, title: "Fee Tracking", desc: "Track payment history, send reminders, flag overdue fees with one click.", color: "accent" },
{ icon: BookOpen, title: "Homework / DPP", desc: "Upload daily practice problems per batch. Students never miss an assignment.", color: "success" }];


const stats = [
{ value: "2,400+", label: "Institutes onboarded" },
{ value: "1.2L+", label: "Students managed" },
{ value: "98%", label: "Attendance accuracy" },
{ value: "4.9★", label: "Average rating" }];


const testimonials = [
{
  name: "Rajesh Sharma",
  role: "Director, Apex Classes, Kota",
  text: "BatchHub replaced 6 WhatsApp groups and 3 spreadsheets. My teachers love the attendance feature.",
  avatar: "RS"
},
{
  name: "Priya Mehta",
  role: "Founder, Bright Minds Institute, Pune",
  text: "Fee tracking alone saved us 8 hours a week. Parents get instant updates now.",
  avatar: "PM"
},
{
  name: "Arun Kumar",
  role: "Principal, Vision Academy, Delhi",
  text: "The batch chat is a game-changer. Finally, structured communication without the chaos.",
  avatar: "AK"
}];


const plans = [
{
  name: "Starter",
  price: "₹999",
  period: "/month",
  desc: "Perfect for small institutes",
  features: ["Up to 100 students", "5 batches", "Attendance & Chat", "Basic analytics", "Email support"],
  cta: "Start Free Trial",
  highlighted: false
},
{
  name: "Growth",
  price: "₹2,499",
  period: "/month",
  desc: "For growing institutes",
  features: ["Up to 500 students", "Unlimited batches", "Fee management", "Test & Rankings", "Priority support", "Custom branding"],
  cta: "Start Free Trial",
  highlighted: true
},
{
  name: "Institute",
  price: "₹5,999",
  period: "/month",
  desc: "For large institutes",
  features: ["Unlimited students", "Multiple branches", "Advanced analytics", "Parent portal", "API access", "Dedicated support"],
  cta: "Contact Sales",
  highlighted: false
}];


const navLinks = ["Features", "Pricing", "Testimonials"];

export default function Index() {
  const navigate = useNavigate();
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Session check — redirect logged-in users straight to their dashboard
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // If user chose "session only" (no remember me), sessionStorage flag is set.
        // When the PWA is closed and reopened, sessionStorage is cleared → sign out.
        const noRemember = localStorage.getItem("lamba_remember_me") !== "true";
        const sessionActive = sessionStorage.getItem("lamba_session_only") === "true";
        if (noRemember && !sessionActive) {
          // Session exists in localStorage but user didn't want persistence → sign out
          await supabase.auth.signOut();
          setAuthChecking(false);
          return;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", session.user.id)
          .single();
        const path = profile?.role ? roleToPath[profile.role] : null;
        if (path) {
          navigate(path, { replace: true });
          return;
        }
      }
      setAuthChecking(false);
    });
  }, [navigate]);

  useEffect(() => {
    // Only show banner if NOT already installed and on mobile
    const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & {standalone?: boolean;}).standalone === true;
    if (isStandalone) return;

    const isMobile = window.innerWidth < 768;
    if (isMobile) setShowBanner(true);

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleNativeInstall = async () => {
    if (!installPrompt) return;
    const promptEvent = installPrompt as BeforeInstallPromptEvent;
    promptEvent.prompt();
  const result = await promptEvent.userChoice;
    if (result.outcome === "accepted") setShowBanner(false);
  };

  if (authChecking) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-gradient">BatchHub</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
            <a key={link} href={`#${link.toLowerCase()}`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {link}
              </a>
            )}
          </div>

          <div className="flex items-center gap-3">
            <InstallButton />
            <Link to="/role-select">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/role-select">
              <Button size="sm" className="gradient-hero text-white shadow-primary border-0 hover:opacity-90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-40 right-0 w-[300px] h-[300px] rounded-full bg-accent/8 blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto">
            
            <Badge className="mb-6 bg-primary-light text-primary border-primary/20 px-4 py-1.5 text-sm font-medium">
              🇮🇳 Built for Indian coaching institutes
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-6 leading-[1.05]">
              Run your coaching institute,{" "}
              <span className="text-gradient">not WhatsApp groups</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-light md:text-2xl font-sans">
              BatchHub replaces paper registers, scattered WhatsApp groups, and manual fee tracking with one clean platform built for how Indian coaching institutes actually work.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/role-select">
                <Button size="lg" className="gradient-hero text-white shadow-primary border-0 hover:opacity-90 px-8 h-12 text-base font-semibold">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Role demo links — use /demo/* routes that show only fake data */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground mr-1">Try a demo:</span>
              {[
              { label: "Admin Demo", to: "/demo/admin", color: "bg-primary-light text-primary border-primary/20 hover:bg-primary/10" },
              { label: "Teacher Demo", to: "/demo/teacher", color: "bg-success-light text-success border-success/20 hover:bg-success/10" },
              { label: "Student Demo", to: "/demo/student", color: "bg-accent-light text-accent border-accent/20 hover:bg-accent/10" },
              { label: "Parent Demo", to: "/demo/parent", color: "bg-muted text-foreground border-border/40 hover:bg-muted/70" }].
              map((d) =>
              <Link key={d.to} to={d.to}>
                  <Button size="sm" variant="outline" className={`h-8 text-xs font-medium border ${d.color}`}>
                    {d.label} →
                  </Button>
                </Link>
              )}
            </div>

            <p className="mt-4 text-sm text-muted-foreground">Free 14-day trial · No credit card · Setup in 5 minutes</p>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative">
            
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute inset-0 gradient-hero rounded-2xl blur-2xl opacity-10 scale-95" />
              <div className="relative rounded-2xl border border-border/50 shadow-lg overflow-hidden">
                <img src={heroDashboard} alt="BatchHub Dashboard Preview" className="w-full h-auto" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border/50 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) =>
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center">
              
                <div className="text-3xl font-display font-bold text-gradient mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16">
            
            <Badge className="mb-4 bg-accent-light text-accent border-accent/20">Everything you need</Badge>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Your institute, fully organised
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Every tool your institute needs, built into one seamless platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) =>
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border/50 rounded-xl p-6 shadow-card hover:shadow-lg transition-all hover:-translate-y-1 group">
              
                <div className={`w-11 h-11 rounded-xl mb-4 flex items-center justify-center ${
              f.color === 'primary' ? 'bg-primary-light' :
              f.color === 'accent' ? 'bg-accent-light' : 'bg-success-light'}`
              }>
                  <f.icon className={`w-5 h-5 ${
                f.color === 'primary' ? 'text-primary' :
                f.color === 'accent' ? 'text-accent' : 'text-success'}`
                } />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Why BatchHub Section */}
      <section className="py-20 bg-card border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}>
              
              <Link to="/auth/owner" className="mb-4 inline-flex items-center rounded-full border border-primary/20 bg-primary-light px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors cursor-pointer hover:bg-primary/10">Why BatchHub</Link>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                Designed for the real chaos of running a coaching institute
              </h2>
              <div className="space-y-4">
                {[
                { icon: Shield, text: "Role-based access for Admin, Teachers, Students & Parents" },
                { icon: Smartphone, text: "Works on any device — phone, tablet, or laptop" },
                { icon: Globe, text: "Supports Hindi & English interface" },
                { icon: TrendingUp, text: "Real-time analytics — know what's happening at a glance" },
                { icon: Zap, text: "Get your institute set up in under 5 minutes" }].
                map((item, i) =>
                <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-foreground/80 leading-relaxed">{item.text}</p>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4">
              
              {[
              { label: "Paper registers", emoji: "📋", strike: true },
              { label: "Digital attendance", emoji: "✅", strike: false },
              { label: "WhatsApp groups", emoji: "💬", strike: true },
              { label: "Batch Chat", emoji: "🗨️", strike: false },
              { label: "Excel fee sheets", emoji: "📊", strike: true },
              { label: "Fee dashboard", emoji: "💰", strike: false },
              { label: "Physical tests", emoji: "📝", strike: true },
              { label: "Online rankings", emoji: "🏆", strike: false }].
              map((item, i) =>
              <div
                key={i}
                className={`rounded-xl p-4 border ${
                item.strike ?
                'bg-danger-light border-danger/20 opacity-60' :
                'bg-success-light border-success/20'}`
                }>
                
                  <div className="text-2xl mb-1">{item.emoji}</div>
                  <p className={`text-sm font-medium ${item.strike ? 'line-through text-danger' : 'text-success'}`}>
                    {item.label}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16">
            
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Trusted by thousands of institutes
            </h2>
            <p className="text-muted-foreground">Real feedback from real educators across India</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) =>
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
              
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) =>
                <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                )}
                </div>
                <p className="text-foreground/80 leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-white text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-28 bg-card border-y border-border/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16">
            
            <Badge className="mb-4 bg-primary-light text-primary border-primary/20">Pricing</Badge>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground">14-day free trial on all plans. No credit card required.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) =>
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-xl border p-6 ${
              plan.highlighted ?
              'gradient-hero text-white border-primary/0 shadow-primary scale-105' :
              'bg-background border-border/60 shadow-card'}`
              }>
              
                {plan.highlighted &&
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-accent text-white border-0 px-3">Most Popular</Badge>
                  </div>
              }
                <div className="mb-6">
                  <h3 className={`font-display font-bold text-xl mb-1 ${plan.highlighted ? 'text-white' : ''}`}>{plan.name}</h3>
                  <p className={`text-sm mb-4 ${plan.highlighted ? 'text-white/70' : 'text-muted-foreground'}`}>{plan.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-display font-bold ${plan.highlighted ? 'text-white' : ''}`}>{plan.price}</span>
                    <span className={`text-sm ${plan.highlighted ? 'text-white/70' : 'text-muted-foreground'}`}>{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat) =>
                <li key={feat} className="flex items-center gap-2">
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? 'text-white/80' : 'text-success'}`} />
                      <span className={`text-sm ${plan.highlighted ? 'text-white/80' : 'text-foreground/80'}`}>{feat}</span>
                    </li>
                )}
                </ul>
                <Link to="/role-select">
                  <Button
                  className={`w-full font-semibold ${
                  plan.highlighted ?
                  'bg-white text-primary hover:bg-white/90' :
                  'gradient-hero text-white border-0 hover:opacity-90 shadow-primary'}`
                  }>
                  
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5 -z-10" />
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}>
            
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Ready to transform your institute?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-10 text-lg">
              Join 2,400+ institutes already running smarter with BatchHub.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/role-select">
                <Button size="lg" className="gradient-hero text-white shadow-primary border-0 hover:opacity-90 px-10 h-12 text-base font-semibold">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/admin">
                <Button size="lg" variant="outline" className="px-10 h-12 text-base font-semibold">
                  Explore Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mobile Install Banner */}
      {showBanner &&
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
          <div className="bg-card border-t border-border/60 shadow-2xl px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Install BatchHub App</p>
                <p className="text-xs text-muted-foreground">Add to home screen for the best experience</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {installPrompt ?
              <Button
                size="sm"
                className="h-8 text-xs gradient-hero text-white border-0 hover:opacity-90 gap-1.5"
                onClick={handleNativeInstall}>
                
                    <Download className="w-3.5 h-3.5" />
                    Install
                  </Button> :

              <Link to="/install">
                    <Button size="sm" className="h-8 text-xs gradient-hero text-white border-0 hover:opacity-90 gap-1.5">
                      <Download className="w-3.5 h-3.5" />
                      How to Install
                    </Button>
                  </Link>
              }
                <button
                onClick={() => setShowBanner(false)}
                className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      {/* Footer */}
      <footer className="border-t border-border/50 py-10 bg-card pb-20 md:pb-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-hero flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-gradient">BatchHub</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 BatchHub. Built for India's coaching ecosystem.</p>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground justify-center">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            <Link to="/auth/superadmin" className="hover:text-foreground transition-colors opacity-60 hover:opacity-100">
              City Partner Login
            </Link>
            <Link to="/apply/city-partner" className="hover:text-foreground transition-colors opacity-60 hover:opacity-100">
              Become a City Partner
            </Link>
          </div>
        </div>
      </footer>
    </div>);

}