import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Zap, UserCircle } from "lucide-react";

export default function ParentAuth() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    parentName: "",
    parentId: "",
    studentId: "",
    instituteId: "",
    relation: "",
    phone: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requests = JSON.parse(localStorage.getItem("lamba_pending_requests") || "[]");
    requests.push({ ...form, role: "parent", status: "pending", submittedAt: new Date().toISOString() });
    localStorage.setItem("lamba_pending_requests", JSON.stringify(requests));
    setSubmitted(true);
  };

  if (submitted) {
    return <PendingApprovalScreen name={form.parentName} studentId={form.studentId} instituteId={form.instituteId} />;
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
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <UserCircle className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-display font-bold mb-1">Join as Parent</h1>
              <p className="text-muted-foreground text-sm">Link to your child's account. Admin will verify and approve your access.</p>
            </div>

            <Card className="p-6 shadow-card border-border/50">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 bg-muted/50 border border-border/40 rounded-lg mb-1">
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
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="parent@email.com" onChange={handleChange} value={form.email} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Mobile *</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="9876543210" required onChange={handleChange} value={form.phone} />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 hover:opacity-90 h-11 font-semibold">
                  Submit for Admin Approval
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function PendingApprovalScreen({ name, studentId, instituteId }: { name: string; studentId: string; instituteId: string }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-sm"
      >
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 opacity-20 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <UserCircle className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-display font-bold mb-2">Request Submitted!</h2>
        <p className="text-muted-foreground mb-4">
          Hi <span className="font-semibold text-foreground">{name}</span>, your parent access request for student{" "}
          <span className="font-semibold text-foreground">{studentId}</span> at institute{" "}
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
            <p className="text-sm text-muted-foreground">Admin verifying student ID and parent link...</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">3</div>
            <p className="text-sm text-muted-foreground">Admin assigns your Parent ID and grants access</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          Admin will verify that the student ID belongs to a enrolled student and then approve your access. You'll be contacted on your registered mobile.
        </p>

        <Link to="/">
          <Button variant="outline" size="sm">Back to Home</Button>
        </Link>
      </motion.div>
    </div>
  );
}
