
-- Create super_admin_applications table
CREATE TABLE public.super_admin_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  position TEXT NOT NULL,
  city TEXT NOT NULL,
  facial_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.super_admin_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a super admin application"
  ON public.super_admin_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "App owner can view all applications"
  ON public.super_admin_applications FOR SELECT
  USING (has_role(auth.uid(), 'app_owner'::app_role));

CREATE POLICY "App owner can update application status"
  ON public.super_admin_applications FOR UPDATE
  USING (has_role(auth.uid(), 'app_owner'::app_role));

CREATE TRIGGER update_super_admin_applications_updated_at
  BEFORE UPDATE ON public.super_admin_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for facial images
INSERT INTO storage.buckets (id, name, public)
VALUES ('applicant-photos', 'applicant-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload applicant photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'applicant-photos');

CREATE POLICY "Applicant photos are publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'applicant-photos');

-- App owner policies on other tables
CREATE POLICY "App owner manages all roles"
  ON public.user_roles FOR ALL
  USING (has_role(auth.uid(), 'app_owner'::app_role));

CREATE POLICY "App owner can manage all institutes"
  ON public.institutes FOR ALL
  USING (has_role(auth.uid(), 'app_owner'::app_role));

CREATE POLICY "App owner can view all profiles"
  ON public.profiles FOR ALL
  USING (has_role(auth.uid(), 'app_owner'::app_role));
