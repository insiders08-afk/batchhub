import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Zap, Shield, Upload, CheckCircle2, Clock, XCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Screen = "register" | "login" | "pending" | "rejected";

export default function AdminAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<Screen>("register");
  const [loading, setLoading] = useState(false);
  const [pendingInstituteName, setPendingInstituteName] = useState("");
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

  const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setRegForm({ ...regForm, [e.target.name]: e.target.value });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: regForm.email,
        password: regForm.password,
        options: { emailRedirectTo: `${window.location.origin}/auth/admin` },
      });
      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) throw new Error("No user ID returned");

      // 2. Insert institute record (status: pending) with city
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

      // 3. Insert profile (status: pending)
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

      const userId = data.user?.id;

      // Check if super_admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "super_admin")
        .maybeSingle();

      if (roleData) {
        navigate("/superadmin");
        return;
      }

      // Look up institute
      const { data: institute, error: instErr } = await supabase
        .from("institutes")
        .select("status, institute_name")
        .eq("owner_user_id", userId)
        .maybeSingle();

      if (instErr) throw instErr;

      if (!institute) {
        toast({ title: "No institute found", description: "No institute is linked to this account.", variant: "destructive" });
        return;
      }

      if (institute.status === "approved") {
        navigate("/admin");
      } else if (institute.status === "pending") {
        setPendingInstituteName(institute.institute_name);
        setStep("pending");
      } else {
        setPendingInstituteName(institute.institute_name);
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
          <h2 className="text-2xl font-display font-bold mb-2">Pending Platform Approval</h2>
          <p className="text-muted-foreground mb-4">
            <span className="font-semibold text-foreground">{pendingInstituteName}</span> has been submitted and is pending verification by the Lamba platform team.
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
              <p className="text-sm text-muted-foreground">Platform team reviewing govt. registration...</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">3</div>
              <p className="text-sm text-muted-foreground">Access to admin dashboard granted</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-4">You'll be notified via email once approved. Usually within 24 hours.</p>
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
          <p className="text-muted-foreground mb-6">
            Unfortunately, <span className="font-semibold text-foreground">{pendingInstituteName}</span>'s registration was not approved. This may be due to invalid government registration details.
          </p>
          <p className="text-xs text-muted-foreground mb-4">Please contact support at <strong>support@lamba.app</strong> for more information.</p>
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
            <span className="text-lg font-display font-bold text-gradient">Lamba</span>
          </Link>
          <Link to="/role-select">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
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
                      Verification required — your institute will be verified by the Lamba team before going live.
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
                      <Input id="city" name="city" placeholder="e.g. Bareilly" required onChange={handleRegChange} value={regForm.city} />
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
