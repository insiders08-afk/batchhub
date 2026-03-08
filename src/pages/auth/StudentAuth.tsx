import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Zap, GraduationCap, Eye } from "lucide-react";

export default function StudentAuth() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    studentId: "",
    instituteId: "",
    batchName: "",
    phone: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requests = JSON.parse(localStorage.getItem("lamba_pending_requests") || "[]");
    requests.push({ ...form, role: "student", status: "pending", submittedAt: new Date().toISOString() });
    localStorage.setItem("lamba_pending_requests", JSON.stringify(requests));
    setSubmitted(true);
  };

  if (submitted) {
    return <PendingApprovalScreen name={form.name} instituteId={form.instituteId} />;
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
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Demo Banner */}
            <div className="mb-6 flex items-center justify-between p-3 rounded-xl bg-primary-light border border-primary/20">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-primary font-medium">Want to preview the student dashboard first?</span>
              </div>
              <Link to="/student">
                <Button size="sm" variant="outline" className="text-primary border-primary/30 hover:bg-primary-light h-8 text-xs gap-1 flex-shrink-0">
                  View Demo <Eye className="w-3 h-3" />
                </Button>
              </Link>
            </div>
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-orange-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-display font-bold mb-1">Join as Student</h1>
              <p className="text-muted-foreground text-sm">Enter your details — a teacher or admin will approve your access.</p>
            </div>

            <Card className="p-6 shadow-card border-border/50">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="instituteId">Institute ID *</Label>
                  <Input id="instituteId" name="instituteId" placeholder="e.g. APEX-KOTA-001" required onChange={handleChange} value={form.instituteId} />
                  <p className="text-xs text-muted-foreground">Provided by your institute at time of admission.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="studentId">Student ID / Roll Number *</Label>
                  <Input id="studentId" name="studentId" placeholder="e.g. STU-2024-045" required onChange={handleChange} value={form.studentId} />
                  <p className="text-xs text-muted-foreground">Your roll number or admission ID given by the institute.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" name="name" placeholder="Ravi Sharma" required onChange={handleChange} value={form.name} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="batchName">Batch Name (optional)</Label>
                  <Input id="batchName" name="batchName" placeholder="e.g. JEE-A, NEET-B" onChange={handleChange} value={form.batchName} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="student@email.com" onChange={handleChange} value={form.email} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Mobile *</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="9876543210" required onChange={handleChange} value={form.phone} />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-accent to-orange-400 text-white border-0 hover:opacity-90 h-11 font-semibold">
                  Submit for Approval
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function PendingApprovalScreen({ name, instituteId }: { name: string; instituteId: string }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-sm"
      >
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent to-orange-400 opacity-20 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-accent to-orange-400 flex items-center justify-center shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-display font-bold mb-2">Request Submitted!</h2>
        <p className="text-muted-foreground mb-4">
          Hi <span className="font-semibold text-foreground">{name}</span>, your student access request for institute{" "}
          <span className="font-semibold text-foreground">{instituteId}</span> has been sent for approval.
        </p>

        <div className="bg-card border border-border/50 rounded-xl p-5 text-left space-y-3 mb-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-success-light flex items-center justify-center text-success text-xs font-bold">1</div>
            <p className="text-sm text-foreground">Your details have been submitted ✓</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground">Waiting for teacher or admin to approve...</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">3</div>
            <p className="text-sm text-muted-foreground">Access to your batch dashboard will be granted</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          Your teacher or admin will verify your details and approve your request.
        </p>

        <Link to="/">
          <Button variant="outline" size="sm">Back to Home</Button>
        </Link>
      </motion.div>
    </div>
  );
}
