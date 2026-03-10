import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Zap, Shield, Upload, CheckCircle2, Clock, XCircle, Loader2, Eye, EyeOff, Phone } from "lucide-react";
import InstallButton from "@/components/InstallButton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { INDIA_CITIES } from "../CityPartnerApply";

type Screen = "register" | "login" | "pending" | "rejected";

export default function AdminAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<Screen>("register");
  const [loading, setLoading] = useState(false);
  const [pendingInstituteName, setPendingInstituteName] = useState("");
  const [pendingCity, setPendingCity] = useState("");
  const [superAdminPhone, setSuperAdminPhone] = useState<string | null>(null);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [regForm, setRegForm] = useState({
    ownerName: "",
    instituteName: "",
    instituteId: "",
    govtRegistrationNo: "",
    city: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(true);

  const handleRegChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setRegForm({ ...regForm, [e.target.name]: e.target.value });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });

  // When we go to pending/rejected, fetch the super admin's phone for that city
  const fetchSuperAdminPhone = async (city: string) => {
    if (!city) return;
    try {
      const { data } = await supabase
        .from("super_admin_applications")
        .select("phone, full_name")
        .eq("city", city)
        .eq("status", "approved")
        .maybeSingle();
      if (data?.phone) setSuperAdminPhone(data.phone);
    } catch {
      // silently ignore
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.city) {
      toast({ title: "City required", description: "Please select your city.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: regForm.email,
        password: regForm.password,
        options: { emailRedirectTo: `${window.location.origin}/auth/admin` },
      });
      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) throw new Error("No user ID returned");

      const institutePayload = {
        owner_user_id: userId,
        owner_name: regForm.ownerName,
        institute_name: regForm.instituteName,
        institute_code: regForm.instituteId.toUpperCase(),
        govt_registration_no: regForm.govtRegistrationNo,
        city: regForm.city,
        email: regForm.email,
        phone: regForm.phone,
        status: "pending" as const,
      };
      const { error: instError } = await supabase.from("institutes").insert(institutePayload as never);
      if (instError) throw instError;

      const { error: profError } = await supabase.from("profiles").insert({
        user_id: userId,
        full_name: regForm.ownerName,
        email: regForm.email,
        phone: regForm.phone,
        role: "admin",
        institute_code: regForm.instituteId.toUpperCase(),
        status: "pending",
      });
      if (profError) throw profError;

      setPendingInstituteName(regForm.instituteName);
      setPendingCity(regForm.city);
      fetchSuperAdminPhone(regForm.city);
      setStep("pending");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      toast({ title: "Registration failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });
      if (error) throw error;
      // Remember me: mark session as active in sessionStorage (cleared on app close)
      // Index.tsx checks this flag — if missing on next open, signs out
      if (rememberMe) {
        localStorage.setItem("lamba_remember_me", "true");
        sessionStorage.removeItem("lamba_session_only");
      } else {
        localStorage.removeItem("lamba_remember_me");
        sessionStorage.setItem("lamba_session_only", "true");
      }

      const userId = data.user?.id;

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "super_admin")
        .maybeSingle();

      if (roleData) { navigate("/superadmin"); return; }

      const { data: institute, error: instErr } = await supabase
        .from("institutes")
        .select("status, institute_name, city")
        .eq("owner_user_id", userId)
        .maybeSingle();

      if (instErr) throw instErr;

      if (!institute) {
        toast({ title: "No institute found", description: "No institute is linked to this account.", variant: "destructive" });
        return;
      }

      setPendingInstituteName(institute.institute_name);
      setPendingCity(institute.city || "");
      if (institute.city) fetchSuperAdminPhone(institute.city);

      if (institute.status === "approved") {
        navigate("/admin");
      } else if (institute.status === "pending") {
        setStep("pending");
      } else {
        setStep("rejected");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      toast({ title: "Login failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (step === "pending") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent to-orange-400 opacity-20 animate-ping" />
            <div className="relative w-20 h-20 rounded-full gradient-hero flex items-center justify-center shadow-lg">
              <Clock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-display font-bold mb-2">Pending City Partner Approval</h2>
          <p className="text-muted-foreground mb-4">
            <span className="font-semibold text-foreground">{pendingInstituteName}</span> has been submitted and is pending review by {pendingCity ? `the ${pendingCity} City Partner` : "your city's Lamba partner"}.
          </p>
          <div className="bg-card border border-border/50 rounded-xl p-5 text-left space-y-3 mb-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-success-light flex items-center justify-center text-success text-xs font-bold">1</div>
              <p className="text-sm">Institute registered ✓</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground">City Partner is reviewing your govt. registration...</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">3</div>
              <p className="text-sm text-muted-foreground">Access to admin dashboard granted</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">4</div>
              <p className="text-sm text-muted-foreground">
                Once approved, try <strong>signing in again</strong> to access your dashboard. If rejected, you'll see the reason on the login screen.
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-4">The City Partner for {pendingCity || "your city"} will review and approve within 24 hours.</p>
          <Link to="/"><Button variant="outline" size="sm">Back to Home</Button></Link>
        </motion.div>
      </div>
    );
  }

  if (step === "rejected") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-danger-light flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-danger" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-2">Application Rejected</h2>
          <p className="text-muted-foreground mb-4">
            Unfortunately, <span className="font-semibold text-foreground">{pendingInstituteName}</span>'s registration was not approved. This may be due to invalid government registration details.
          </p>
          {superAdminPhone ? (
            <div className="bg-card border border-border/50 rounded-xl p-4 text-left mb-4 shadow-card">
              <p className="text-sm font-semibold mb-1.5">Contact your City Partner</p>
              <p className="text-xs text-muted-foreground mb-2">Reach out to your {pendingCity} City Partner for more information:</p>
              <a href={`tel:${superAdminPhone}`} className="flex items-center gap-2 text-primary hover:underline text-sm font-medium">
                <Phone className="w-4 h-4" /> {superAdminPhone}
              </a>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mb-4">Please contact your city's BatchHub partner for more information.</p>
          )}
          <Link to="/"><Button variant="outline" size="sm">Back to Home</Button></Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border/50 bg-card">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-hero flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-lg font-display font-bold text-gradient">BatchHub</span>
          </Link>
          <div className="flex items-center gap-2">
            <InstallButton />
            <Link to="/role-select">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-display font-bold mb-1">Admin / Institute Owner</h1>
              <p className="text-muted-foreground text-sm">Register your institute or sign in to your dashboard</p>
            </div>

            {/* Toggle */}
            <div className="flex rounded-lg bg-muted p-1 mb-6">
              <button
                onClick={() => setStep("register")}
                className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${step === "register" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}
              >
                Register Institute
              </button>
              <button
                onClick={() => setStep("login")}
                className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${step === "login" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}
              >
                Sign In
              </button>
            </div>

            <Card className="p-6 shadow-card border-border/50">
              {step === "register" ? (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="p-3 bg-primary-light border border-primary/20 rounded-lg mb-2">
                    <p className="text-xs text-primary font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Your institute will be reviewed by your city's Lamba partner before going live.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="ownerName">Owner's Full Name *</Label>
                      <Input id="ownerName" name="ownerName" placeholder="Rajesh Kumar" required onChange={handleRegChange} value={regForm.ownerName} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="instituteName">Institute Name *</Label>
                      <Input id="instituteName" name="instituteName" placeholder="Apex Classes" required onChange={handleRegChange} value={regForm.instituteName} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="instituteId">Institute ID / Code *</Label>
                      <Input id="instituteId" name="instituteId" placeholder="e.g. APEX-KOTA-001" required onChange={handleRegChange} value={regForm.instituteId} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="city">City *</Label>
                      <select
                        id="city"
                        name="city"
                        value={regForm.city}
                        onChange={handleRegChange}
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Select city</option>
                        {INDIA_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-2">Institute ID will be the unique identifier on Lamba.</p>

                  <div className="space-y-1.5">
                    <Label htmlFor="govtRegistrationNo">Government Registration / Trust No. *</Label>
                    <Input id="govtRegistrationNo" name="govtRegistrationNo" placeholder="e.g. MH/2015/0012345" required onChange={handleRegChange} value={regForm.govtRegistrationNo} />
                    <p className="text-xs text-muted-foreground">Your government-issued institute registration number for real-world verification.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Ownership Proof Document</Label>
                    <div className="flex items-center gap-3 p-3 border border-dashed border-border/60 rounded-lg bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors">
                      <Upload className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Upload ownership certificate, PAN, or GST certificate</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Accepted: PDF, JPG, PNG (max 5MB)</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" name="email" type="email" placeholder="owner@apex.com" required onChange={handleRegChange} value={regForm.email} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Mobile Number *</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="9876543210" required onChange={handleRegChange} value={regForm.phone} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password">Set Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showRegPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        required
                        minLength={8}
                        onChange={handleRegChange}
                        value={regForm.password}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full gradient-hero text-white border-0 hover:opacity-90 h-11 font-semibold">
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Registering...</> : "Register My Institute"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="loginEmail">Email *</Label>
                    <Input id="loginEmail" name="email" type="email" placeholder="owner@apex.com" required onChange={handleLoginChange} value={loginForm.email} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="loginPassword">Password *</Label>
                    <div className="relative">
                      <Input
                        id="loginPassword"
                        name="password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Your password"
                        required
                        onChange={handleLoginChange}
                        value={loginForm.password}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 accent-primary rounded"
                    />
                    <span className="text-sm text-muted-foreground">Keep me signed in</span>
                    {!rememberMe && <span className="text-xs text-muted-foreground/60 ml-auto">(session only)</span>}
                  </label>
                  <Button type="submit" disabled={loading} className="w-full gradient-hero text-white border-0 hover:opacity-90 h-11 font-semibold">
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</> : "Sign In to Dashboard"}
                  </Button>
                </form>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
