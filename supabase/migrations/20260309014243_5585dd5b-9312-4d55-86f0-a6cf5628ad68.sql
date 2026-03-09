
-- =============================================================
-- CRITICAL FIX: Drop ALL existing policies and recreate as PERMISSIVE
-- =============================================================

-- ---- ANNOUNCEMENTS ----
DROP POLICY IF EXISTS "Institute members can view announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers and admins can delete announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers and admins can insert announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers and admins can update announcements" ON public.announcements;

CREATE POLICY "Institute members can view announcements"
  ON public.announcements FOR SELECT TO authenticated
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Teachers and admins can insert announcements"
  ON public.announcements FOR INSERT TO authenticated
  WITH CHECK (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));

CREATE POLICY "Teachers and admins can update announcements"
  ON public.announcements FOR UPDATE TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));

CREATE POLICY "Teachers and admins can delete announcements"
  ON public.announcements FOR DELETE TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));

-- ---- ATTENDANCE ----
DROP POLICY IF EXISTS "Institute members can view attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers and admins can delete attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers and admins can insert attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers and admins can update attendance" ON public.attendance;

CREATE POLICY "Institute members can view attendance"
  ON public.attendance FOR SELECT TO authenticated
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Teachers and admins can insert attendance"
  ON public.attendance FOR INSERT TO authenticated
  WITH CHECK (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));

CREATE POLICY "Teachers and admins can update attendance"
  ON public.attendance FOR UPDATE TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));

CREATE POLICY "Teachers and admins can delete attendance"
  ON public.attendance FOR DELETE TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));

-- ---- BATCH_APPLICATIONS ----
DROP POLICY IF EXISTS "Admins and teachers can delete applications" ON public.batch_applications;
DROP POLICY IF EXISTS "Admins and teachers can update applications" ON public.batch_applications;
DROP POLICY IF EXISTS "Admins and teachers can view institute applications" ON public.batch_applications;
DROP POLICY IF EXISTS "Students can apply to batches" ON public.batch_applications;
DROP POLICY IF EXISTS "Students can view own applications" ON public.batch_applications;

CREATE POLICY "Admins and teachers can view institute applications"
  ON public.batch_applications FOR SELECT TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teacher')));

CREATE POLICY "Students can view own applications"
  ON public.batch_applications FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can apply to batches"
  ON public.batch_applications FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid() AND institute_code = get_my_institute_code());

CREATE POLICY "Admins and teachers can update applications"
  ON public.batch_applications FOR UPDATE TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teacher')));

CREATE POLICY "Admins and teachers can delete applications"
  ON public.batch_applications FOR DELETE TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teacher')));

-- ---- BATCH_MESSAGES ----
DROP POLICY IF EXISTS "Institute members can send messages" ON public.batch_messages;
DROP POLICY IF EXISTS "Institute members can view batch messages" ON public.batch_messages;

CREATE POLICY "Institute members can view batch messages"
  ON public.batch_messages FOR SELECT TO authenticated
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Institute members can send messages"
  ON public.batch_messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND institute_code = get_my_institute_code());

-- ---- BATCHES ----
DROP POLICY IF EXISTS "Admins can delete batches" ON public.batches;
DROP POLICY IF EXISTS "Admins can insert batches" ON public.batches;
DROP POLICY IF EXISTS "Admins can update batches" ON public.batches;
DROP POLICY IF EXISTS "Institute members can view batches" ON public.batches;

CREATE POLICY "Institute members can view batches"
  ON public.batches FOR SELECT TO authenticated
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Admins can insert batches"
  ON public.batches FOR INSERT TO authenticated
  WITH CHECK (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update batches"
  ON public.batches FOR UPDATE TO authenticated
  USING (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete batches"
  ON public.batches FOR DELETE TO authenticated
  USING (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'));

-- ---- FEES: Fix infinite recursion with security definer function ----
DROP POLICY IF EXISTS "Admins can manage fees" ON public.fees;
DROP POLICY IF EXISTS "Parents can view child fees" ON public.fees;
DROP POLICY IF EXISTS "Students can view own fees" ON public.fees;

CREATE OR REPLACE FUNCTION public.get_my_child_user_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ((extra_data->>'child_id')::uuid)
  FROM public.pending_requests
  WHERE user_id = auth.uid()
    AND role = 'parent'
    AND status = 'approved'
  LIMIT 1
$$;

CREATE POLICY "Admins can manage fees"
  ON public.fees FOR ALL TO authenticated
  USING (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can view own fees"
  ON public.fees FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Parents can view child fees"
  ON public.fees FOR SELECT TO authenticated
  USING (student_id = get_my_child_user_id());

-- ---- HOMEWORKS ----
DROP POLICY IF EXISTS "Institute members can view homeworks" ON public.homeworks;
DROP POLICY IF EXISTS "Teachers and admins can delete homeworks" ON public.homeworks;
DROP POLICY IF EXISTS "Teachers and admins can insert homeworks" ON public.homeworks;
DROP POLICY IF EXISTS "Teachers and admins can update homeworks" ON public.homeworks;

CREATE POLICY "Institute members can view homeworks"
  ON public.homeworks FOR SELECT TO authenticated
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Teachers and admins can insert homeworks"
  ON public.homeworks FOR INSERT TO authenticated
  WITH CHECK (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));

CREATE POLICY "Teachers and admins can update homeworks"
  ON public.homeworks FOR UPDATE TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));

CREATE POLICY "Teachers and admins can delete homeworks"
  ON public.homeworks FOR DELETE TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));

-- ---- INSTITUTES ----
DROP POLICY IF EXISTS "Admin can update own institute" ON public.institutes;
DROP POLICY IF EXISTS "App owner can manage all institutes" ON public.institutes;
DROP POLICY IF EXISTS "Institute members can view their institute" ON public.institutes;
DROP POLICY IF EXISTS "Owner can update their institute" ON public.institutes;
DROP POLICY IF EXISTS "Owner can view their institute" ON public.institutes;
DROP POLICY IF EXISTS "Public institute registration insert" ON public.institutes;
DROP POLICY IF EXISTS "Super admin can manage all institutes" ON public.institutes;

CREATE POLICY "Public institute registration insert"
  ON public.institutes FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Institute members can view their institute"
  ON public.institutes FOR SELECT TO authenticated
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Owner can view their institute"
  ON public.institutes FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid());

CREATE POLICY "Admin can update own institute"
  ON public.institutes FOR UPDATE TO authenticated
  USING (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Owner can update their institute"
  ON public.institutes FOR UPDATE TO authenticated
  USING (owner_user_id = auth.uid());

CREATE POLICY "App owner can manage all institutes"
  ON public.institutes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'app_owner'));

CREATE POLICY "Super admin can manage all institutes"
  ON public.institutes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'));

-- ---- PENDING_REQUESTS ----
DROP POLICY IF EXISTS "Admins can manage their institute requests" ON public.pending_requests;
DROP POLICY IF EXISTS "Super admin can manage all requests" ON public.pending_requests;
DROP POLICY IF EXISTS "Users can insert own pending request" ON public.pending_requests;
DROP POLICY IF EXISTS "Users can update own pending request" ON public.pending_requests;
DROP POLICY IF EXISTS "Users can view own pending request" ON public.pending_requests;

CREATE POLICY "Users can view own pending request"
  ON public.pending_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own pending request"
  ON public.pending_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pending request"
  ON public.pending_requests FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage their institute requests"
  ON public.pending_requests FOR ALL TO authenticated
  USING (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Super admin can manage all requests"
  ON public.pending_requests FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'));

-- ---- PROFILES ----
DROP POLICY IF EXISTS "Admins can update profiles in their institute" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can insert profile during signup" ON public.profiles;
DROP POLICY IF EXISTS "App owner can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Institute members can view institute profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view and update own profile" ON public.profiles;

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
  USING (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'));

CREATE POLICY "App owner can view all profiles"
  ON public.profiles FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'app_owner'));

CREATE POLICY "Super admin can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'super_admin'));

-- ---- STUDENTS_BATCHES ----
DROP POLICY IF EXISTS "Admins and teachers can delete enrollments" ON public.students_batches;
DROP POLICY IF EXISTS "Admins and teachers can insert enrollments" ON public.students_batches;
DROP POLICY IF EXISTS "Institute members can view enrollments" ON public.students_batches;

CREATE POLICY "Institute members can view enrollments"
  ON public.students_batches FOR SELECT TO authenticated
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Admins and teachers can insert enrollments"
  ON public.students_batches FOR INSERT TO authenticated
  WITH CHECK (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teacher')));

CREATE POLICY "Admins and teachers can delete enrollments"
  ON public.students_batches FOR DELETE TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teacher')));

-- ---- TEST_SCORES ----
DROP POLICY IF EXISTS "Institute members can view test scores" ON public.test_scores;
DROP POLICY IF EXISTS "Teachers and admins can delete test scores" ON public.test_scores;
DROP POLICY IF EXISTS "Teachers and admins can insert test scores" ON public.test_scores;
DROP POLICY IF EXISTS "Teachers and admins can update test scores" ON public.test_scores;

CREATE POLICY "Institute members can view test scores"
  ON public.test_scores FOR SELECT TO authenticated
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Teachers and admins can insert test scores"
  ON public.test_scores FOR INSERT TO authenticated
  WITH CHECK (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));

CREATE POLICY "Teachers and admins can update test scores"
  ON public.test_scores FOR UPDATE TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));

CREATE POLICY "Teachers and admins can delete test scores"
  ON public.test_scores FOR DELETE TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));

-- ---- USER_ROLES ----
DROP POLICY IF EXISTS "Admin can delete roles for their institute" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can insert roles for their institute" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can update roles for their institute" ON public.user_roles;
DROP POLICY IF EXISTS "App owner manages all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admin manages all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'app_owner'));

CREATE POLICY "Admin can insert roles for their institute"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update roles for their institute"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete roles for their institute"
  ON public.user_roles FOR DELETE TO authenticated
  USING (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'));

CREATE POLICY "App owner manages all roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'app_owner'));

CREATE POLICY "Super admin manages all roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'));

-- ---- SUPER_ADMIN_APPLICATIONS ----
DROP POLICY IF EXISTS "Admins can look up city partner contact" ON public.super_admin_applications;
DROP POLICY IF EXISTS "Anyone can submit a super admin application" ON public.super_admin_applications;
DROP POLICY IF EXISTS "App owner can update application status" ON public.super_admin_applications;
DROP POLICY IF EXISTS "App owner can view all applications" ON public.super_admin_applications;

CREATE POLICY "Anyone can submit a super admin application"
  ON public.super_admin_applications FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can look up city partner contact"
  ON public.super_admin_applications FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "App owner can view all applications"
  ON public.super_admin_applications FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'app_owner'));

CREATE POLICY "App owner can update application status"
  ON public.super_admin_applications FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'app_owner'));

-- =============================================================
-- NEW TABLE: batch_teacher_requests
-- When admin assigns a teacher to a batch, a request is created.
-- Teacher must approve/reject before being active in the batch.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.batch_teacher_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL,
  institute_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  requested_by uuid NOT NULL,
  batch_name text,
  course text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.batch_teacher_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teacher can view own requests"
  ON public.batch_teacher_requests FOR SELECT TO authenticated
  USING (teacher_id = auth.uid() OR (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin')));

CREATE POLICY "Admin can create teacher requests"
  ON public.batch_teacher_requests FOR INSERT TO authenticated
  WITH CHECK (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Teacher or admin can update request status"
  ON public.batch_teacher_requests FOR UPDATE TO authenticated
  USING (teacher_id = auth.uid() OR (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin')));

CREATE POLICY "Admin can delete teacher requests"
  ON public.batch_teacher_requests FOR DELETE TO authenticated
  USING (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'));
