
-- =====================================================================
-- CRITICAL FIX: Convert all RESTRICTIVE policies to PERMISSIVE
-- In Postgres, RESTRICTIVE policies only work when PERMISSIVE ones exist.
-- With ZERO permissive policies, ALL access is denied regardless of rules.
-- We recreate every policy WITHOUT AS RESTRICTIVE (default = PERMISSIVE).
-- =====================================================================

-- ---- ANNOUNCEMENTS ----
DROP POLICY IF EXISTS "Institute members can view announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers and admins can insert announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers and admins can update announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers and admins can delete announcements" ON public.announcements;

CREATE POLICY "Institute members can view announcements"
  ON public.announcements FOR SELECT TO authenticated
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Teachers and admins can insert announcements"
  ON public.announcements FOR INSERT TO authenticated
  WITH CHECK (institute_code = get_my_institute_code() AND (has_role(auth.uid(),'teacher') OR has_role(auth.uid(),'admin')));

CREATE POLICY "Teachers and admins can update announcements"
  ON public.announcements FOR UPDATE TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(),'teacher') OR has_role(auth.uid(),'admin')));

CREATE POLICY "Teachers and admins can delete announcements"
  ON public.announcements FOR DELETE TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(),'teacher') OR has_role(auth.uid(),'admin')));

-- ---- ATTENDANCE ----
DROP POLICY IF EXISTS "Institute members can view attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers and admins can insert attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers and admins can update attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers and admins can delete attendance" ON public.attendance;

CREATE POLICY "Institute members can view attendance"
  ON public.attendance FOR SELECT TO authenticated
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Teachers and admins can insert attendance"
  ON public.attendance FOR INSERT TO authenticated
  WITH CHECK (institute_code = get_my_institute_code() AND (has_role(auth.uid(),'teacher') OR has_role(auth.uid(),'admin')));

CREATE POLICY "Teachers and admins can update attendance"
  ON public.attendance FOR UPDATE TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(),'teacher') OR has_role(auth.uid(),'admin')));

CREATE POLICY "Teachers and admins can delete attendance"
  ON public.attendance FOR DELETE TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(),'teacher') OR has_role(auth.uid(),'admin')));

-- ---- BATCH MESSAGES ----
DROP POLICY IF EXISTS "Institute members can view batch messages" ON public.batch_messages;
DROP POLICY IF EXISTS "Institute members can send messages" ON public.batch_messages;

CREATE POLICY "Institute members can view batch messages"
  ON public.batch_messages FOR SELECT TO authenticated
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Institute members can send messages"
  ON public.batch_messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND institute_code = get_my_institute_code());

-- ---- BATCHES ----
DROP POLICY IF EXISTS "Institute members can view batches" ON public.batches;
DROP POLICY IF EXISTS "Admins can insert batches" ON public.batches;
DROP POLICY IF EXISTS "Admins can update batches" ON public.batches;
DROP POLICY IF EXISTS "Admins can delete batches" ON public.batches;

CREATE POLICY "Institute members can view batches"
  ON public.batches FOR SELECT TO authenticated
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Admins can insert batches"
  ON public.batches FOR INSERT TO authenticated
  WITH CHECK (institute_code = get_my_institute_code() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'teacher')));

CREATE POLICY "Admins can update batches"
  ON public.batches FOR UPDATE TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'teacher')));

CREATE POLICY "Admins can delete batches"
  ON public.batches FOR DELETE TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'teacher')));

-- ---- FEES ----
DROP POLICY IF EXISTS "Admins can manage fees" ON public.fees;
DROP POLICY IF EXISTS "Students can view own fees" ON public.fees;
DROP POLICY IF EXISTS "Parents can view child fees" ON public.fees;

CREATE POLICY "Admins can manage fees"
  ON public.fees FOR ALL TO authenticated
  USING (institute_code = get_my_institute_code() AND has_role(auth.uid(),'admin'));

CREATE POLICY "Students can view own fees"
  ON public.fees FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Parents can view child fees"
  ON public.fees FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pending_requests pr
      WHERE pr.user_id = auth.uid()
        AND pr.role = 'parent'
        AND pr.status = 'approved'
        AND (pr.extra_data->>'child_id')::uuid = fees.student_id
    )
  );

-- ---- HOMEWORKS ----
DROP POLICY IF EXISTS "Institute members can view homeworks" ON public.homeworks;
DROP POLICY IF EXISTS "Teachers and admins can insert homeworks" ON public.homeworks;
DROP POLICY IF EXISTS "Teachers and admins can update homeworks" ON public.homeworks;
DROP POLICY IF EXISTS "Teachers and admins can delete homeworks" ON public.homeworks;

CREATE POLICY "Institute members can view homeworks"
  ON public.homeworks FOR SELECT TO authenticated
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Teachers and admins can insert homeworks"
  ON public.homeworks FOR INSERT TO authenticated
  WITH CHECK (institute_code = get_my_institute_code() AND (has_role(auth.uid(),'teacher') OR has_role(auth.uid(),'admin')));

CREATE POLICY "Teachers and admins can update homeworks"
  ON public.homeworks FOR UPDATE TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(),'teacher') OR has_role(auth.uid(),'admin')));

CREATE POLICY "Teachers and admins can delete homeworks"
  ON public.homeworks FOR DELETE TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(),'teacher') OR has_role(auth.uid(),'admin')));

-- ---- INSTITUTES ----
DROP POLICY IF EXISTS "Institute members can view their institute" ON public.institutes;
DROP POLICY IF EXISTS "Owner can view their institute" ON public.institutes;
DROP POLICY IF EXISTS "Public institute registration insert" ON public.institutes;
DROP POLICY IF EXISTS "Admin can update own institute" ON public.institutes;
DROP POLICY IF EXISTS "Owner can update their institute" ON public.institutes;
DROP POLICY IF EXISTS "App owner can manage all institutes" ON public.institutes;
DROP POLICY IF EXISTS "Super admin can manage all institutes" ON public.institutes;

CREATE POLICY "Institute members can view their institute"
  ON public.institutes FOR SELECT TO authenticated
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Owner can view their institute"
  ON public.institutes FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid());

CREATE POLICY "Public institute registration insert"
  ON public.institutes FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin can update own institute"
  ON public.institutes FOR UPDATE TO authenticated
  USING (institute_code = get_my_institute_code() AND has_role(auth.uid(),'admin'));

CREATE POLICY "Owner can update their institute"
  ON public.institutes FOR UPDATE TO authenticated
  USING (owner_user_id = auth.uid());

CREATE POLICY "App owner can manage all institutes"
  ON public.institutes FOR ALL TO authenticated
  USING (has_role(auth.uid(),'app_owner'));

CREATE POLICY "Super admin can manage all institutes"
  ON public.institutes FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin'));

-- ---- PENDING REQUESTS ----
DROP POLICY IF EXISTS "Admins can manage their institute requests" ON public.pending_requests;
DROP POLICY IF EXISTS "Super admin can manage all requests" ON public.pending_requests;
DROP POLICY IF EXISTS "Users can insert own pending request" ON public.pending_requests;
DROP POLICY IF EXISTS "Users can update own pending request" ON public.pending_requests;
DROP POLICY IF EXISTS "Users can view own pending request" ON public.pending_requests;

CREATE POLICY "Users can insert own pending request"
  ON public.pending_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own pending request"
  ON public.pending_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own pending request"
  ON public.pending_requests FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage their institute requests"
  ON public.pending_requests FOR ALL TO authenticated
  USING (institute_code = get_my_institute_code() AND has_role(auth.uid(),'admin'));

CREATE POLICY "Super admin can manage all requests"
  ON public.pending_requests FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin'));

-- ---- PROFILES ----
DROP POLICY IF EXISTS "Users can view and update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can insert profile during signup" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view profiles in their institute" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles in their institute" ON public.profiles;
DROP POLICY IF EXISTS "Institute members can view institute profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "App owner can view all profiles" ON public.profiles;

CREATE POLICY "Users can view and update own profile"
  ON public.profiles FOR ALL TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can insert profile during signup"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Institute members can view institute profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Admins can update profiles in their institute"
  ON public.profiles FOR UPDATE TO authenticated
  USING (institute_code = get_my_institute_code() AND has_role(auth.uid(),'admin'));

CREATE POLICY "Super admin can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'super_admin'));

CREATE POLICY "App owner can view all profiles"
  ON public.profiles FOR ALL TO authenticated
  USING (has_role(auth.uid(),'app_owner'));

-- ---- STUDENTS_BATCHES ----
DROP POLICY IF EXISTS "Institute members can view enrollments" ON public.students_batches;
DROP POLICY IF EXISTS "Admins and teachers can insert enrollments" ON public.students_batches;
DROP POLICY IF EXISTS "Admins and teachers can delete enrollments" ON public.students_batches;

CREATE POLICY "Institute members can view enrollments"
  ON public.students_batches FOR SELECT TO authenticated
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Admins and teachers can insert enrollments"
  ON public.students_batches FOR INSERT TO authenticated
  WITH CHECK (institute_code = get_my_institute_code() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'teacher')));

CREATE POLICY "Admins and teachers can delete enrollments"
  ON public.students_batches FOR DELETE TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'teacher')));

-- ---- TEST SCORES ----
DROP POLICY IF EXISTS "Institute members can view test scores" ON public.test_scores;
DROP POLICY IF EXISTS "Teachers and admins can insert test scores" ON public.test_scores;
DROP POLICY IF EXISTS "Teachers and admins can update test scores" ON public.test_scores;
DROP POLICY IF EXISTS "Teachers and admins can delete test scores" ON public.test_scores;

CREATE POLICY "Institute members can view test scores"
  ON public.test_scores FOR SELECT TO authenticated
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Teachers and admins can insert test scores"
  ON public.test_scores FOR INSERT TO authenticated
  WITH CHECK (institute_code = get_my_institute_code() AND (has_role(auth.uid(),'teacher') OR has_role(auth.uid(),'admin')));

CREATE POLICY "Teachers and admins can update test scores"
  ON public.test_scores FOR UPDATE TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(),'teacher') OR has_role(auth.uid(),'admin')));

CREATE POLICY "Teachers and admins can delete test scores"
  ON public.test_scores FOR DELETE TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(),'teacher') OR has_role(auth.uid(),'admin')));

-- ---- USER ROLES ----
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can insert roles for their institute" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can update roles for their institute" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can delete roles for their institute" ON public.user_roles;
DROP POLICY IF EXISTS "App owner manages all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admin manages all roles" ON public.user_roles;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'app_owner'));

CREATE POLICY "Admin can insert roles for their institute"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (institute_code = get_my_institute_code() AND has_role(auth.uid(),'admin'));

CREATE POLICY "Admin can update roles for their institute"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (institute_code = get_my_institute_code() AND has_role(auth.uid(),'admin'));

CREATE POLICY "Admin can delete roles for their institute"
  ON public.user_roles FOR DELETE TO authenticated
  USING (institute_code = get_my_institute_code() AND has_role(auth.uid(),'admin'));

CREATE POLICY "App owner manages all roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (has_role(auth.uid(),'app_owner'));

CREATE POLICY "Super admin manages all roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin'));

-- ---- SUPER ADMIN APPLICATIONS ----
DROP POLICY IF EXISTS "Admins can look up city partner contact" ON public.super_admin_applications;
DROP POLICY IF EXISTS "Anyone can submit a super admin application" ON public.super_admin_applications;
DROP POLICY IF EXISTS "App owner can update application status" ON public.super_admin_applications;
DROP POLICY IF EXISTS "App owner can view all applications" ON public.super_admin_applications;

CREATE POLICY "Anyone can submit a super admin application"
  ON public.super_admin_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can look up city partner contact"
  ON public.super_admin_applications FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "App owner can update application status"
  ON public.super_admin_applications FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'app_owner'));

CREATE POLICY "App owner can view all applications"
  ON public.super_admin_applications FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'app_owner'));

-- =====================================================================
-- NEW: batch_applications table — student self-service batch enrollment
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.batch_applications (
  id             UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id     UUID NOT NULL,
  batch_id       UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  institute_code TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending',
  applied_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_by    UUID,
  reviewed_at    TIMESTAMP WITH TIME ZONE,
  UNIQUE(student_id, batch_id)
);

ALTER TABLE public.batch_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can apply to batches"
  ON public.batch_applications FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid() AND institute_code = get_my_institute_code());

CREATE POLICY "Students can view own applications"
  ON public.batch_applications FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Admins and teachers can view institute applications"
  ON public.batch_applications FOR SELECT TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'teacher')));

CREATE POLICY "Admins and teachers can update applications"
  ON public.batch_applications FOR UPDATE TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'teacher')));

CREATE POLICY "Admins and teachers can delete applications"
  ON public.batch_applications FOR DELETE TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'teacher')));

CREATE INDEX IF NOT EXISTS idx_batch_applications_student ON public.batch_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_batch_applications_batch ON public.batch_applications(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_applications_institute ON public.batch_applications(institute_code);
