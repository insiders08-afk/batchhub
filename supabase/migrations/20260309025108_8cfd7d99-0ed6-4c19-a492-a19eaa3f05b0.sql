
-- ============================================================
-- CRITICAL FIX: Convert ALL RESTRICTIVE policies to PERMISSIVE
-- RESTRICTIVE means ALL policies must pass (AND logic) which 
-- causes failures when any single policy returns false.
-- PERMISSIVE means ANY passing policy grants access (OR logic).
-- ============================================================

-- ---- ANNOUNCEMENTS ----
DROP POLICY IF EXISTS "Institute members can view announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers and admins can delete announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers and admins can insert announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers and admins can update announcements" ON public.announcements;

CREATE POLICY "Institute members can view announcements" ON public.announcements FOR SELECT USING (institute_code = get_my_institute_code());
CREATE POLICY "Teachers and admins can delete announcements" ON public.announcements FOR DELETE USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));
CREATE POLICY "Teachers and admins can insert announcements" ON public.announcements FOR INSERT WITH CHECK (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));
CREATE POLICY "Teachers and admins can update announcements" ON public.announcements FOR UPDATE USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));

-- ---- ATTENDANCE ----
DROP POLICY IF EXISTS "Institute members can view attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers and admins can delete attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers and admins can insert attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers and admins can update attendance" ON public.attendance;

CREATE POLICY "Institute members can view attendance" ON public.attendance FOR SELECT USING (institute_code = get_my_institute_code());
CREATE POLICY "Teachers and admins can delete attendance" ON public.attendance FOR DELETE USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));
CREATE POLICY "Teachers and admins can insert attendance" ON public.attendance FOR INSERT WITH CHECK (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));
CREATE POLICY "Teachers and admins can update attendance" ON public.attendance FOR UPDATE USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));

-- ---- BATCH_APPLICATIONS ----
DROP POLICY IF EXISTS "Admins and teachers can delete applications" ON public.batch_applications;
DROP POLICY IF EXISTS "Admins and teachers can update applications" ON public.batch_applications;
DROP POLICY IF EXISTS "Admins and teachers can view institute applications" ON public.batch_applications;
DROP POLICY IF EXISTS "Students can apply to batches" ON public.batch_applications;
DROP POLICY IF EXISTS "Students can view own applications" ON public.batch_applications;

CREATE POLICY "Admins and teachers can delete applications" ON public.batch_applications FOR DELETE USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teacher')));
CREATE POLICY "Admins and teachers can update applications" ON public.batch_applications FOR UPDATE USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teacher')));
CREATE POLICY "Admins and teachers can view institute applications" ON public.batch_applications FOR SELECT USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teacher')));
CREATE POLICY "Students can apply to batches" ON public.batch_applications FOR INSERT WITH CHECK (student_id = auth.uid() AND institute_code = get_my_institute_code());
CREATE POLICY "Students can view own applications" ON public.batch_applications FOR SELECT USING (student_id = auth.uid());

-- ---- BATCH_MESSAGES ----
DROP POLICY IF EXISTS "Institute members can send messages" ON public.batch_messages;
DROP POLICY IF EXISTS "Institute members can view batch messages" ON public.batch_messages;

CREATE POLICY "Institute members can send messages" ON public.batch_messages FOR INSERT WITH CHECK (sender_id = auth.uid() AND institute_code = get_my_institute_code());
CREATE POLICY "Institute members can view batch messages" ON public.batch_messages FOR SELECT USING (institute_code = get_my_institute_code());

-- ---- BATCH_TEACHER_REQUESTS ----
DROP POLICY IF EXISTS "Admin can create teacher requests" ON public.batch_teacher_requests;
DROP POLICY IF EXISTS "Admin can delete teacher requests" ON public.batch_teacher_requests;
DROP POLICY IF EXISTS "Teacher can view own requests" ON public.batch_teacher_requests;
DROP POLICY IF EXISTS "Teacher or admin can update request status" ON public.batch_teacher_requests;

CREATE POLICY "Admin can create teacher requests" ON public.batch_teacher_requests FOR INSERT WITH CHECK (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can delete teacher requests" ON public.batch_teacher_requests FOR DELETE USING (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Teacher can view own requests" ON public.batch_teacher_requests FOR SELECT USING (teacher_id = auth.uid() OR (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin')));
CREATE POLICY "Teacher or admin can update request status" ON public.batch_teacher_requests FOR UPDATE USING (teacher_id = auth.uid() OR (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin')));

-- ---- BATCHES ----
DROP POLICY IF EXISTS "Admins can delete batches" ON public.batches;
DROP POLICY IF EXISTS "Admins can insert batches" ON public.batches;
DROP POLICY IF EXISTS "Admins can update batches" ON public.batches;
DROP POLICY IF EXISTS "Institute members can view batches" ON public.batches;
-- Also allow teachers to update their own batch (needed for accepting requests)
DROP POLICY IF EXISTS "Teachers can update own batches" ON public.batches;

CREATE POLICY "Admins can delete batches" ON public.batches FOR DELETE USING (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert batches" ON public.batches FOR INSERT WITH CHECK (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update batches" ON public.batches FOR UPDATE USING (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can update own batches" ON public.batches FOR UPDATE USING (teacher_id = auth.uid());
CREATE POLICY "Institute members can view batches" ON public.batches FOR SELECT USING (institute_code = get_my_institute_code());

-- ---- FEES ----
DROP POLICY IF EXISTS "Admins can manage fees" ON public.fees;
DROP POLICY IF EXISTS "Parents can view child fees" ON public.fees;
DROP POLICY IF EXISTS "Students can view own fees" ON public.fees;

CREATE POLICY "Admins can manage fees" ON public.fees FOR ALL USING (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Parents can view child fees" ON public.fees FOR SELECT USING (student_id = get_my_child_user_id());
CREATE POLICY "Students can view own fees" ON public.fees FOR SELECT USING (student_id = auth.uid());

-- ---- HOMEWORKS ----
DROP POLICY IF EXISTS "Institute members can view homeworks" ON public.homeworks;
DROP POLICY IF EXISTS "Teachers and admins can delete homeworks" ON public.homeworks;
DROP POLICY IF EXISTS "Teachers and admins can insert homeworks" ON public.homeworks;
DROP POLICY IF EXISTS "Teachers and admins can update homeworks" ON public.homeworks;

CREATE POLICY "Institute members can view homeworks" ON public.homeworks FOR SELECT USING (institute_code = get_my_institute_code());
CREATE POLICY "Teachers and admins can delete homeworks" ON public.homeworks FOR DELETE USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));
CREATE POLICY "Teachers and admins can insert homeworks" ON public.homeworks FOR INSERT WITH CHECK (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));
CREATE POLICY "Teachers and admins can update homeworks" ON public.homeworks FOR UPDATE USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));

-- ---- INSTITUTES ----
DROP POLICY IF EXISTS "Admin can update own institute" ON public.institutes;
DROP POLICY IF EXISTS "Institute members can view their institute" ON public.institutes;
DROP POLICY IF EXISTS "Owner can update their institute" ON public.institutes;
DROP POLICY IF EXISTS "Owner can view their institute" ON public.institutes;
DROP POLICY IF EXISTS "Public institute registration insert" ON public.institutes;

CREATE POLICY "Admin can update own institute" ON public.institutes FOR UPDATE USING (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Institute members can view their institute" ON public.institutes FOR SELECT USING (institute_code = get_my_institute_code());
CREATE POLICY "Owner can update their institute" ON public.institutes FOR UPDATE USING (owner_user_id = auth.uid());
CREATE POLICY "Owner can view their institute" ON public.institutes FOR SELECT USING (owner_user_id = auth.uid());
CREATE POLICY "Public institute registration insert" ON public.institutes FOR INSERT WITH CHECK (true);

-- ---- PENDING_REQUESTS ----
DROP POLICY IF EXISTS "Admins can manage their institute requests" ON public.pending_requests;
DROP POLICY IF EXISTS "Users can insert own pending request" ON public.pending_requests;
DROP POLICY IF EXISTS "Users can update own pending request" ON public.pending_requests;
DROP POLICY IF EXISTS "Users can view own pending request" ON public.pending_requests;

CREATE POLICY "Admins can manage their institute requests" ON public.pending_requests FOR ALL USING (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own pending request" ON public.pending_requests FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own pending request" ON public.pending_requests FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can view own pending request" ON public.pending_requests FOR SELECT USING (user_id = auth.uid());

-- ---- PROFILES ----
DROP POLICY IF EXISTS "Admins can update profiles in their institute" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can insert profile during signup" ON public.profiles;
DROP POLICY IF EXISTS "Institute members can view institute profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view and update own profile" ON public.profiles;

CREATE POLICY "Admins can update profiles in their institute" ON public.profiles FOR UPDATE USING (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert profile during signup" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Institute members can view institute profiles" ON public.profiles FOR SELECT USING (institute_code = get_my_institute_code());
CREATE POLICY "Users can view and update own profile" ON public.profiles FOR ALL USING (user_id = auth.uid());

-- ---- STUDENTS_BATCHES ----
DROP POLICY IF EXISTS "Admins and teachers can delete enrollments" ON public.students_batches;
DROP POLICY IF EXISTS "Admins and teachers can insert enrollments" ON public.students_batches;
DROP POLICY IF EXISTS "Institute members can view enrollments" ON public.students_batches;

CREATE POLICY "Admins and teachers can delete enrollments" ON public.students_batches FOR DELETE USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teacher')));
CREATE POLICY "Admins and teachers can insert enrollments" ON public.students_batches FOR INSERT WITH CHECK (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teacher')));
CREATE POLICY "Institute members can view enrollments" ON public.students_batches FOR SELECT USING (institute_code = get_my_institute_code());

-- ---- TEST_SCORES ----
DROP POLICY IF EXISTS "Institute members can view test scores" ON public.test_scores;
DROP POLICY IF EXISTS "Teachers and admins can delete test scores" ON public.test_scores;
DROP POLICY IF EXISTS "Teachers and admins can insert test scores" ON public.test_scores;
DROP POLICY IF EXISTS "Teachers and admins can update test scores" ON public.test_scores;

CREATE POLICY "Institute members can view test scores" ON public.test_scores FOR SELECT USING (institute_code = get_my_institute_code());
CREATE POLICY "Teachers and admins can delete test scores" ON public.test_scores FOR DELETE USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));
CREATE POLICY "Teachers and admins can insert test scores" ON public.test_scores FOR INSERT WITH CHECK (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));
CREATE POLICY "Teachers and admins can update test scores" ON public.test_scores FOR UPDATE USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));

-- ---- USER_ROLES ----
DROP POLICY IF EXISTS "Admin can delete roles for their institute" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can insert roles for their institute" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can update roles for their institute" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Admin can delete roles for their institute" ON public.user_roles FOR DELETE USING (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can insert roles for their institute" ON public.user_roles FOR INSERT WITH CHECK (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can update roles for their institute" ON public.user_roles FOR UPDATE USING (institute_code = get_my_institute_code() AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid() OR has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'app_owner'));

-- ============================================================
-- BACKFILL: Insert missing user_roles for all approved profiles
-- This fixes users who were approved but missing user_roles rows
-- ============================================================
INSERT INTO public.user_roles (user_id, role, institute_code)
SELECT p.user_id, p.role::public.app_role, p.institute_code
FROM public.profiles p
WHERE p.status IN ('approved', 'active')
  AND p.institute_code IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p.user_id
  )
ON CONFLICT DO NOTHING;
