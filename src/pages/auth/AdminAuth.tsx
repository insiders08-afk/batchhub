import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Zap, Shield, Upload, CheckCircle2 } from "lucide-react";

export default function AdminAuth() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"register" | "login">("register");
  const [form, setForm] = useState({
    ownerName: "",
    instituteName: "",
    instituteId: "",
    govtRegistrationNo: "",
    ownershipProof: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Store in localStorage as demo
    const registrations = JSON.parse(localStorage.getItem("lamba_admins") || "[]");
    registrations.push({ ...form, status: "approved", role: "admin", createdAt: new Date().toISOString() });
    localStorage.setItem("lamba_admins", JSON.stringify(registrations));
    localStorage.setItem("lamba_current_user", JSON.stringify({ ...form, role: "admin", status: "approved" }));
    navigate("/admin");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/admin");
  };

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
                      Verification required — your institute will be verified before going live.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="ownerName">Owner's Full Name *</Label>
                      <Input id="ownerName" name="ownerName" placeholder="Rajesh Kumar" required onChange={handleChange} value={form.ownerName} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="instituteName">Institute Name *</Label>
                      <Input id="instituteName" name="instituteName" placeholder="Apex Classes" required onChange={handleChange} value={form.instituteName} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="instituteId">Institute ID / Code *</Label>
                    <Input id="instituteId" name="instituteId" placeholder="e.g. APEX-KOTA-001" required onChange={handleChange} value={form.instituteId} />
                    <p className="text-xs text-muted-foreground">This will be the unique identifier for your institute on Lamba.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="govtRegistrationNo">Government Registration / Trust No. *</Label>
                    <Input id="govtRegistrationNo" name="govtRegistrationNo" placeholder="e.g. MH/2015/0012345" required onChange={handleChange} value={form.govtRegistrationNo} />
                    <p className="text-xs text-muted-foreground">Your government-issued institute registration number for real-world verification.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="ownershipProof">Ownership Proof Document</Label>
                    <div className="flex items-center gap-3 p-3 border border-dashed border-border/60 rounded-lg bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors">
                      <Upload className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Upload ownership certificate, PAN, or GST certificate</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Accepted: PDF, JPG, PNG (max 5MB)</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" name="email" type="email" placeholder="owner@apex.com" required onChange={handleChange} value={form.email} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Mobile Number *</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="9876543210" required onChange={handleChange} value={form.phone} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password">Set Password *</Label>
                    <Input id="password" name="password" type="password" placeholder="Min. 8 characters" required minLength={8} onChange={handleChange} value={form.password} />
                  </div>

                  <Button type="submit" className="w-full gradient-hero text-white border-0 hover:opacity-90 h-11 font-semibold">
                    Register My Institute
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="loginInstituteId">Institute ID *</Label>
                    <Input id="loginInstituteId" placeholder="e.g. APEX-KOTA-001" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="loginEmail">Email *</Label>
                    <Input id="loginEmail" type="email" placeholder="owner@apex.com" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="loginPassword">Password *</Label>
                    <Input id="loginPassword" type="password" placeholder="Your password" required />
                  </div>
                  <Button type="submit" className="w-full gradient-hero text-white border-0 hover:opacity-90 h-11 font-semibold">
                    Sign In to Dashboard
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
