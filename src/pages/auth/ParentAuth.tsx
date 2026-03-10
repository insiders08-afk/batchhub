import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Zap, UserCircle, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import InstallButton from "@/components/InstallButton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Screen = "register" | "login";

export default function ParentAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [screen, setScreen] = useState<Screen>("register");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [submittedStudentId, setSubmittedStudentId] = useState("");
  const [submittedInstitute, setSubmittedInstitute] = useState("");
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [form, setForm] = useState({
    parentName: "", parentId: "", studentId: "",
    instituteId: "", relation: "", phone: "", email: "", password: "",
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { emailRedirectTo: `${window.location.origin}/auth/parent` },
      });

      if (authError) {
        if (authError.message?.includes("already registered") || authError.status === 422) {
          toast({ title: "Already registered", description: "This email is already registered. Please use Sign In.", variant: "destructive" });
          setScreen("login");
          return;
        }
        throw authError;
      }
      const userId = authData.user?.id;
      if (!userId) throw new Error("No user ID returned");

      const instituteCode = form.instituteId.trim();

      const { error: profError } = await supabase.from("profiles").insert({
        user_id: userId,
        full_name: form.parentName,
        email: form.email,
        phone: form.phone,
        role: "parent",
        institute_code: instituteCode,
        status: "pending",
      });
      if (profError && !profError.message?.includes("duplicate")) throw profError;

      const { error: reqError } = await supabase.from("pending_requests").insert({
        user_id: userId,
        full_name: form.parentName,
        email: form.email,
        role: "parent",
        institute_code: instituteCode,
        extra_data: { studentId: form.studentId, relation: form.relation, phone: form.phone },
        status: "pending",
      });
      if (reqError && !reqError.message?.includes("duplicate")) throw reqError;

      setPendingUserId(userId);
      setSubmittedName(form.parentName);
      setSubmittedStudentId(form.studentId);
      setSubmittedInstitute(instituteCode);
      setSubmitted(true);
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
        email: loginForm.email, password: loginForm.password,
      });
      if (error) throw error;
      if (rememberMe) {
        localStorage.setItem("batchhub_remember_me", "true");
        sessionStorage.removeItem("batchhub_session_only");
      } else {
        localStorage.removeItem("batchhub_remember_me");
        sessionStorage.setItem("batchhub_session_only", "true");
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("status, institute_code, full_name")
        .eq("user_id", data.user.id)
        .eq("role", "parent")
        .maybeSingle();

      if (!profile) {
        toast({ title: "Account not found", description: "No parent account linked to this email.", variant: "destructive" });
        return;
      }

      if (profile.status === "approved" || profile.status === "active") {
        navigate("/parent");
      } else if (profile.status === "rejected") {
        toast({ title: "Access Denied", description: "Your request was rejected. Please contact the institute admin.", variant: "destructive" });
        await supabase.auth.signOut();
      } else {
        setPendingUserId(data.user.id);
        setSubmittedName(profile.full_name);
        setSubmittedInstitute(profile.institute_code || "");
        setSubmitted(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      toast({ title: "Login failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <PendingApprovalScreen
        name={submittedName}
        studentId={submittedStudentId}
        instituteId={submittedInstitute}
        userId={pendingUserId}
        onApproved={() => navigate("/parent")}
      />
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
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <UserCircle className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-display font-bold mb-1">Parent Portal</h1>
              <p className="text-muted-foreground text-sm">Register or sign in to track your child's progress</p>
            </div>

            <div className="flex rounded-lg bg-muted p-1 mb-6">
              <button onClick={() => setScreen("register")}
                className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${screen === "register" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>
                Register
              </button>
              <button onClick={() => setScreen("login")}
                className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${screen === "login" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>
                Sign In
              </button>
            </div>

            <Card className="p-6 shadow-card border-border/50">
              {screen === "register" ? (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="p-3 bg-muted/50 border border-border/40 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>No pre-assigned ID needed.</strong> Provide your student's details — the admin will generate and share your Parent ID after approval.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="instituteId">Institute ID *</Label>
                    <Input id="instituteId" name="instituteId" placeholder="e.g. APEX-KOTA-001" required onChange={handleChange} value={form.instituteId} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="studentId">Your Child's Student ID / Roll Number *</Label>
                    <Input id="studentId" name="studentId" placeholder="e.g. STU-2024-045" required onChange={handleChange} value={form.studentId} />
                    <p className="text-xs text-muted-foreground">The roll number or student ID your child received from the institute.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="parentName">Your Full Name *</Label>
                      <Input id="parentName" name="parentName" placeholder="Suresh Sharma" required onChange={handleChange} value={form.parentName} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="relation">Relation *</Label>
                      <Input id="relation" name="relation" placeholder="Father / Mother" required onChange={handleChange} value={form.relation} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" name="email" type="email" placeholder="parent@email.com" required onChange={handleChange} value={form.email} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Mobile *</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="9876543210" required onChange={handleChange} value={form.phone} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password" name="password"
                        type={showRegPassword ? "text" : "password"}
                        placeholder="Min. 8 characters" required minLength={8}
                        onChange={handleChange} value={form.password}
                        className="pr-10"
                      />
                      <button type="button" onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 hover:opacity-90 h-11 font-semibold">
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : "Submit for Admin Approval"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="loginEmail">Email *</Label>
                    <Input id="loginEmail" name="email" type="email" placeholder="parent@email.com" required onChange={handleLoginChange} value={loginForm.email} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="loginPassword">Password *</Label>
                    <div className="relative">
                      <Input
                        id="loginPassword" name="password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Your password" required
                        onChange={handleLoginChange} value={loginForm.password}
                        className="pr-10"
                      />
                      <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
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
                  <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 hover:opacity-90 h-11 font-semibold">
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</> : "Sign In"}
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

function PendingApprovalScreen({
  name, studentId, instituteId, userId, onApproved
}: {
  name: string;
  studentId: string;
  instituteId: string;
  userId: string | null;
  onApproved: () => void;
}) {
  const [approvalStatus, setApprovalStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!userId) return;

    const checkStatus = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("status")
        .eq("user_id", userId)
        .maybeSingle();

      if (data?.status === "approved" || data?.status === "active") {
        setApprovalStatus("approved");
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimeout(onApproved, 2000);
      } else if (data?.status === "rejected") {
        setApprovalStatus("rejected");
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    };

    // Check immediately, then every 5 seconds
    checkStatus();
    intervalRef.current = setInterval(checkStatus, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userId, onApproved]);

  const handleBackHome = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (approvalStatus === "approved") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-2 text-success">Access Approved! 🎉</h2>
          <p className="text-muted-foreground mb-4">You're being redirected to your parent dashboard...</p>
          <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
        </motion.div>
      </div>
    );
  }

  if (approvalStatus === "rejected") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-danger-light flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✗</span>
          </div>
          <h2 className="text-2xl font-display font-bold mb-2 text-danger">Request Rejected</h2>
          <p className="text-muted-foreground mb-6">Your parent access request was not approved. Please contact your institute admin directly.</p>
          <Button onClick={handleBackHome} variant="outline">Back to Home</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 opacity-20 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <UserCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-display font-bold mb-2">Request Submitted!</h2>
        <p className="text-muted-foreground mb-4">
          Hi <span className="font-semibold text-foreground">{name}</span>, your parent access request for student{" "}
          <span className="font-semibold text-foreground">{studentId}</span> at{" "}
          <span className="font-semibold text-foreground">{instituteId}</span> has been sent to the admin.
        </p>
        <div className="bg-card border border-border/50 rounded-xl p-5 text-left space-y-3 mb-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-success-light flex items-center justify-center text-success text-xs font-bold">1</div>
            <p className="text-sm text-foreground">Your details have been submitted ✓</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground">Admin verifying student ID and parent link... <span className="text-xs">(auto-checking every 5s)</span></p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">3</div>
            <p className="text-sm text-muted-foreground">Admin assigns your Parent ID and grants access</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-4">You'll be automatically redirected when approved. No need to refresh!</p>
        <Button variant="outline" size="sm" onClick={handleBackHome}>Back to Home</Button>
      </motion.div>
    </div>
  );
}
