import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Zap, MapPin, Loader2, Camera, CheckCircle, User, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const INDIA_CITIES = [
  "Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Kolkata",
  "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Kanpur", "Nagpur",
  "Patna", "Indore", "Bhopal", "Bareilly", "Agra", "Varanasi",
  "Meerut", "Allahabad", "Dehradun", "Noida", "Gurgaon", "Ghaziabad",
  "Aligarh", "Moradabad", "Gorakhpur", "Surat", "Vadodara", "Rajkot",
  "Coimbatore", "Visakhapatnam", "Bhubaneswar", "Kochi", "Chandigarh",
  "Jodhpur", "Udaipur", "Ranchi", "Raipur", "Amritsar",
];

export default function CityPartnerApply() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    position: "",
    city: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Photo too large", description: "Please upload a photo under 5MB.", variant: "destructive" });
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.city) {
      toast({ title: "City required", description: "Please select your city.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      let facial_image_url: string | null = null;

      // Upload photo if provided
      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("applicant-photos")
          .upload(fileName, photoFile, { cacheControl: "3600", upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("applicant-photos").getPublicUrl(uploadData.path);
        facial_image_url = urlData.publicUrl;
      }

      const { error } = await supabase.from("super_admin_applications").insert({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        position: form.position,
        city: form.city,
        facial_image_url,
      });

      if (error) throw error;

      setSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Submission failed";
      toast({ title: "Submission failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-2">Application Submitted!</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Your application to become a City Partner for <strong>{form.city}</strong> has been received.
            Our team will review it and get back to you at <strong>{form.email}</strong>.
          </p>
          <Link to="/">
            <Button variant="outline" className="w-full">Return to Homepage</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border/50 bg-card">
        <div className="container mx-auto flex items-center h-14 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-hero flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-lg font-display font-bold text-gradient">Lamba</span>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-display font-bold mb-1">Become a City Partner</h1>
              <p className="text-muted-foreground text-sm">
                Manage all coaching institutes in your city on Lamba
              </p>
            </div>

            <Card className="p-6 shadow-card border-border/50">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Photo Upload */}
                <div className="flex flex-col items-center gap-3 pb-4 border-b border-border/50">
                  <div
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-center bg-muted overflow-hidden"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Camera className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Face Photo</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs h-8"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {photoPreview ? "Change Photo" : "Upload Face Photo"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">Required for identity verification. Max 5MB.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    placeholder="Your full name"
                    required
                    value={form.full_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    required
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="position">Your Position / Role *</Label>
                  <Input
                    id="position"
                    name="position"
                    placeholder="e.g. Business Development Manager, Entrepreneur"
                    required
                    value={form.position}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="city">City *</Label>
                  <select
                    id="city"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select your city</option>
                    {INDIA_CITIES.sort().map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full gradient-hero text-white border-0 hover:opacity-90 h-11 font-semibold mt-2"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </form>
            </Card>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Already approved?{" "}
              <Link to="/auth/superadmin" className="text-primary hover:underline">City Partner Login →</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
