
-- ============================================================
-- FIX 1: Recreate ALL RLS policies as PERMISSIVE (not RESTRICTIVE)
-- This is the root cause of all blank dashboards
-- ============================================================

-- ANNOUNCEMENTS
DROP POLICY IF EXISTS "Institute members can view announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers and admins can delete announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers and admins can insert announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers and admins can update announcements" ON public.announcements;

CREATE POLICY "Institute members can view announcements"
  ON public.announcements FOR SELECT
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Teachers and admins can insert announcements"
  ON public.announcements FOR INSERT
  WITH CHECK (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Teachers and admins can update announcements"
  ON public.announcements FOR UPDATE
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Teachers and admins can delete announcements"
  ON public.announcements FOR DELETE
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

-- ATTENDANCE
DROP POLICY IF EXISTS "Institute members can view attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers and admins can insert attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers and admins can update attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers and admins can delete attendance" ON public.attendance;

CREATE POLICY "Institute members can view attendance"
  ON public.attendance FOR SELECT
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Teachers and admins can insert attendance"
  ON public.attendance FOR INSERT
  WITH CHECK (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Teachers and admins can update attendance"
  ON public.attendance FOR UPDATE
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Teachers and admins can delete attendance"
  ON public.attendance FOR DELETE
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

-- BATCH MESSAGES
DROP POLICY IF EXISTS "Institute members can view batch messages" ON public.batch_messages;
DROP POLICY IF EXISTS "Institute members can send messages" ON public.batch_messages;

CREATE POLICY "Institute members can view batch messages"
  ON public.batch_messages FOR SELECT
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Institute members can send messages"
  ON public.batch_messages FOR INSERT
  WITH CHECK (sender_id = auth.uid() AND institute_code = get_my_institute_code());

-- BATCHES
DROP POLICY IF EXISTS "Institute members can view batches" ON public.batches;
DROP POLICY IF EXISTS "Admins can insert batches" ON public.batches;
DROP POLICY IF EXISTS "Admins can update batches" ON public.batches;
DROP POLICY IF EXISTS "Admins can delete batches" ON public.batches;

CREATE POLICY "Institute members can view batches"
  ON public.batches FOR SELECT
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Admins can insert batches"
  ON public.batches FOR INSERT
  WITH CHECK (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role)));

CREATE POLICY "Admins can update batches"
  ON public.batches FOR UPDATE
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role)));

CREATE POLICY "Admins can delete batches"
  ON public.batches FOR DELETE
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role)));

-- FEES
DROP POLICY IF EXISTS "Admins can manage fees" ON public.fees;
DROP POLICY IF EXISTS "Students can view own fees" ON public.fees;

CREATE POLICY "Admins can manage fees"
  ON public.fees FOR ALL
  USING (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students can view own fees"
  ON public.fees FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Parents can view child fees"
  ON public.fees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.role = 'parent'
        AND (p.institute_code = (SELECT institute_code FROM public.fees f2 WHERE f2.id = fees.id LIMIT 1))
    )
  );

-- INSTITUTES
DROP POLICY IF EXISTS "Admin can view own institute" ON public.institutes;
DROP POLICY IF EXISTS "Admin can update own institute" ON public.institutes;
DROP POLICY IF EXISTS "App owner can manage all institutes" ON public.institutes;
DROP POLICY IF EXISTS "Institute members can view their institute" ON public.institutes;
DROP POLICY IF EXISTS "Owner can update their institute" ON public.institutes;
DROP POLICY IF EXISTS "Owner can view their institute" ON public.institutes;
DROP POLICY IF EXISTS "Public institute registration insert" ON public.institutes;
DROP POLICY IF EXISTS "Super admin can manage all institutes" ON public.institutes;

CREATE POLICY "Institute members can view their institute"
  ON public.institutes FOR SELECT
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Owner can view their institute"
  ON public.institutes FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "Admin can update own institute"
  ON public.institutes FOR UPDATE
  USING (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owner can update their institute"
  ON public.institutes FOR UPDATE
  USING (owner_user_id = auth.uid());

CREATE POLICY "Public institute registration insert"
  ON public.institutes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "App owner can manage all institutes"
  ON public.institutes FOR ALL
  USING (has_role(auth.uid(), 'app_owner'::app_role));

CREATE POLICY "Super admin can manage all institutes"
  ON public.institutes FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- PENDING REQUESTS
DROP POLICY IF EXISTS "Admins can manage their institute requests" ON public.pending_requests;
DROP POLICY IF EXISTS "Super admin can manage all requests" ON public.pending_requests;
DROP POLICY IF EXISTS "Users can insert own pending request" ON public.pending_requests;
DROP POLICY IF EXISTS "Users can update own pending request" ON public.pending_requests;
DROP POLICY IF EXISTS "Users can view own pending request" ON public.pending_requests;

CREATE POLICY "Admins can manage their institute requests"
  ON public.pending_requests FOR ALL
  USING (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Super admin can manage all requests"
  ON public.pending_requests FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can insert own pending request"
  ON public.pending_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pending request"
  ON public.pending_requests FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own pending request"
  ON public.pending_requests FOR SELECT
  USING (user_id = auth.uid());

-- PROFILES
DROP POLICY IF EXISTS "Admins can view profiles in their institute" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles in their institute" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can insert profile during signup" ON public.profiles;
DROP POLICY IF EXISTS "App owner can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view and update own profile" ON public.profiles;

CREATE POLICY "Users can view and update own profile"
  ON public.profiles FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can insert profile during signup"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view profiles in their institute"
  ON public.profiles FOR SELECT
  USING (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update profiles in their institute"
  ON public.profiles FOR UPDATE
  USING (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Institute members can view institute profiles"
  ON public.profiles FOR SELECT
  USING (institute_code = get_my_institute_code());

CREATE POLICY "App owner can view all profiles"
  ON public.profiles FOR ALL
  USING (has_role(auth.uid(), 'app_owner'::app_role));

CREATE POLICY "Super admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- STUDENTS_BATCHES
DROP POLICY IF EXISTS "Institute members can view enrollments" ON public.students_batches;
DROP POLICY IF EXISTS "Admins and teachers can insert enrollments" ON public.students_batches;
DROP POLICY IF EXISTS "Admins and teachers can delete enrollments" ON public.students_batches;

CREATE POLICY "Institute members can view enrollments"
  ON public.students_batches FOR SELECT
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Admins and teachers can insert enrollments"
  ON public.students_batches FOR INSERT
  WITH CHECK (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role)));

CREATE POLICY "Admins and teachers can delete enrollments"
  ON public.students_batches FOR DELETE
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role)));

-- TEST SCORES
DROP POLICY IF EXISTS "Institute members can view test scores" ON public.test_scores;
DROP POLICY IF EXISTS "Teachers and admins can insert test scores" ON public.test_scores;
DROP POLICY IF EXISTS "Teachers and admins can update test scores" ON public.test_scores;
DROP POLICY IF EXISTS "Teachers and admins can delete test scores" ON public.test_scores;

CREATE POLICY "Institute members can view test scores"
  ON public.test_scores FOR SELECT
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Teachers and admins can insert test scores"
  ON public.test_scores FOR INSERT
  WITH CHECK (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Teachers and admins can update test scores"
  ON public.test_scores FOR UPDATE
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Teachers and admins can delete test scores"
  ON public.test_scores FOR DELETE
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

-- USER ROLES
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can insert roles for their institute" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can update roles for their institute" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can delete roles for their institute" ON public.user_roles;
DROP POLICY IF EXISTS "App owner manages all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admin manages all roles" ON public.user_roles;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'app_owner'::app_role));

CREATE POLICY "Admin can insert roles for their institute"
  ON public.user_roles FOR INSERT
  WITH CHECK (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can update roles for their institute"
  ON public.user_roles FOR UPDATE
  USING (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can delete roles for their institute"
  ON public.user_roles FOR DELETE
  USING (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "App owner manages all roles"
  ON public.user_roles FOR ALL
  USING (has_role(auth.uid(), 'app_owner'::app_role));

CREATE POLICY "Super admin manages all roles"
  ON public.user_roles FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- SUPER ADMIN APPLICATIONS
DROP POLICY IF EXISTS "Admins can look up city partner contact" ON public.super_admin_applications;
DROP POLICY IF EXISTS "Anyone can submit a super admin application" ON public.super_admin_applications;
DROP POLICY IF EXISTS "App owner can update application status" ON public.super_admin_applications;
DROP POLICY IF EXISTS "App owner can view all applications" ON public.super_admin_applications;

CREATE POLICY "Admins can look up city partner contact"
  ON public.super_admin_applications FOR SELECT
  USING (true);

CREATE POLICY "Anyone can submit a super admin application"
  ON public.super_admin_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "App owner can update application status"
  ON public.super_admin_applications FOR UPDATE
  USING (has_role(auth.uid(), 'app_owner'::app_role));

CREATE POLICY "App owner can view all applications"
  ON public.super_admin_applications FOR SELECT
  USING (has_role(auth.uid(), 'app_owner'::app_role));

-- ============================================================
-- FIX 2: Create homeworks table with storage
-- ============================================================
CREATE TABLE IF NOT EXISTS public.homeworks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  institute_code TEXT NOT NULL,
  teacher_id UUID NOT NULL,
  teacher_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  type TEXT NOT NULL DEFAULT 'homework', -- 'homework' | 'dpp'
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.homeworks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institute members can view homeworks"
  ON public.homeworks FOR SELECT
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Teachers and admins can insert homeworks"
  ON public.homeworks FOR INSERT
  WITH CHECK (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Teachers and admins can update homeworks"
  ON public.homeworks FOR UPDATE
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Teachers and admins can delete homeworks"
  ON public.homeworks FOR DELETE
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

-- Trigger for updated_at
CREATE TRIGGER update_homeworks_updated_at
  BEFORE UPDATE ON public.homeworks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for homework files
INSERT INTO storage.buckets (id, name, public)
VALUES ('homework-files', 'homework-files', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Institute members can view homework files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'homework-files');

CREATE POLICY "Teachers can upload homework files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'homework-files' AND auth.role() = 'authenticated');

CREATE POLICY "Teachers can update their homework files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'homework-files' AND auth.role() = 'authenticated');

CREATE POLICY "Teachers can delete their homework files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'homework-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- FIX 3: Enable Realtime for pending_requests (if not already)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'pending_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pending_requests;
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'homeworks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.homeworks;
  END IF;
END;
$$;
