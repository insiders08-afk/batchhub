
## Complete End-to-End App Audit

### What I read:
- All 7 auth pages (AdminAuth, TeacherAuth, StudentAuth, ParentAuth, SuperAdminAuth, OwnerAuth)
- All 10 admin pages (Dashboard, Batches, Students, Attendance, Fees, Announcements, Tests, Settings, Approvals, Team)
- TeacherDashboard, StudentDashboard, ParentDashboard
- BatchWorkspace, DashboardLayout, SuperAdminDashboard, OwnerDashboard
- All DB schemas, RLS policies, DB functions
- Live network request logs (all 200s — approval flow IS working now)

---

## THE CRITICAL FINDING — RLS Is Still All RESTRICTIVE

**This is the root cause of why half the app appears broken.** Looking at the current schema:

Every table — `announcements`, `attendance`, `batches`, `batch_messages`, `students_batches`, `test_scores`, `fees`, `profiles`, `pending_requests`, `user_roles`, `institutes` — has ALL policies marked as `Permissive: No` (RESTRICTIVE).

In Postgres, **when ALL policies on a table are RESTRICTIVE, access is always denied** regardless of what the policies say. RESTRICTIVE policies only further limit access *after* a PERMISSIVE policy already grants it. With zero PERMISSIVE policies, no data can be read or written by anyone.

Previous migrations tried to fix this but they appear to have not executed properly — the schema still shows `Permissive: No` on everything. This is the #1 bug to fix.

---

## Complete Bug List

### CRITICAL (breaks everything)
**BUG 1 — All RLS policies are RESTRICTIVE, not PERMISSIVE**
- Effect: No data loads anywhere. AdminDashboard, AdminStudents, AdminAttendance, AdminAnnouncements, AdminTests, AdminFees all show empty even when data exists.
- Fix: Migration to `DROP` all existing policies and recreate them as `FOR SELECT/INSERT/UPDATE/DELETE ... USING (...)` without `AS RESTRICTIVE` — which makes them PERMISSIVE by default.

**BUG 2 — Parent Dashboard: child is never found**
`ParentDashboard.tsx` line 80-83 tries to get `child_id` from `pending_requests.extra_data` but the registration form (`ParentAuth.tsx`) stores `studentId` (the text roll number like "STU-001"), NOT a `child_id` UUID. So `childUserId` is always null → the entire parent view is blank.
- Fix: The parent registration needs to either (a) look up the student by their roll number/studentId at login time to find their actual `user_id`, OR (b) the admin needs to link parent → child manually (extra UI work). Realistic fix for now: on parent login, query `profiles` where `role = student` and match on the `extra_data.studentId` field that the student provided at registration.

**BUG 3 — AdminSettings: institute not found for non-owner admins**
`AdminSettings.tsx` line 38 queries `institutes` with `.eq("owner_user_id", user.id)` — this only works for the institute OWNER. If a co-admin (someone else with admin role) logs in, `inst` is always null and nothing loads.
- Fix: Query by `institute_code = get_my_institute_code()` instead of `owner_user_id`.

**BUG 4 — Teacher sidebar links all point to `/teacher` (no sub-pages)**
`DashboardLayout.tsx` lines 28-36: every teacher menu item (Attendance, Announcements, Tests, etc.) links to `/teacher`. Clicking them doesn't navigate anywhere different — they all just reload the teacher dashboard. 
- Fix: Either add proper sub-pages or clearly indicate these items open the batch workspace. At minimum, they should deep-link into BatchWorkspace tabs.

**BUG 5 — Student sidebar links all point to `/student`** (same problem as Teacher)
Same issue. All 6 student menu items point to `/student`.

**BUG 6 — Parent sidebar links all point to `/parent`** (same problem)
All parent menu items point to `/parent`.

**BUG 7 — `profiles` RLS: Students/Teachers can't read the `institutes` table**
`StudentDashboard.tsx` and `TeacherDashboard.tsx` both query `institutes` to get the institute name. But `institutes` RLS only allows: `admin` role with matching institute_code, `app_owner`, `super_admin`, or `owner_user_id`. Students and teachers have NONE of these — so their queries for institute name return null/empty. The institute name badge will always be blank.
- Fix: Add a policy: `SELECT` on `institutes` for any authenticated user whose `institute_code` matches (via a join or get_my_institute_code function).

**BUG 8 — BatchWorkspace: students can't access their own batch**
`BatchWorkspace.tsx` fetches batch data and messages from the DB. The `batches` SELECT policy is `Permissive: No` AND requires `institute_code = get_my_institute_code()`. But `get_my_institute_code()` reads from `user_roles WHERE role != 'super_admin'`. Students don't have a `user_roles` row until approved — wait, they do after AdminApprovals approves them. But if the student role is not in `user_roles`, `get_my_institute_code()` returns null and the batch workspace shows nothing.
- Verify: After a student is approved, AdminApprovals inserts `user_roles (user_id, role='student', institute_code)`. This appears to be in the code (line 100-106 in AdminApprovals). So approved students SHOULD have user_roles. But since all policies are RESTRICTIVE, it still won't work.

---

### MISSING FEATURES (not built yet)

**MISSING 1 — Parent auth flow: no auto-redirect polling**
`ParentAuth.tsx` shows the pending screen but has NO polling mechanism (unlike TeacherAuth and StudentAuth which have 5-second polling + auto-redirect). Parent stays on pending screen forever even after being approved.

**MISSING 2 — Parent login: no approved/rejected state handling**
`ParentAuth.tsx` `handleLogin` checks `profile.status` but the `PendingApprovalScreen` component has no polling (unlike Teacher/Student). If a parent signs in while still pending, they see a static screen.

**MISSING 3 — Teacher sub-pages not built**
TeacherDashboard shows a list of batches but there are no dedicated pages for:
- Teacher → Attendance marking (outside of BatchWorkspace)
- Teacher → Announcements list
- Teacher → Test scores entry
These currently just redirect to `/teacher`. The TeacherDashboard shows batch cards with "Open Workspace" links to BatchWorkspace — that works. But the sidebar items are broken (all go to `/teacher`).

**MISSING 4 — Student sub-pages not built** (same pattern)
No dedicated student pages for tests, homework, announcements. Everything is on the single StudentDashboard.

**MISSING 5 — Parent-child linking system**
Admin has no UI to link a parent to a specific student (set `child_id` in `pending_requests.extra_data`). Without this link, the ParentDashboard always shows "Child profile not linked yet."

**MISSING 6 — AdminStudents: enroll in batch from Students page**
`AdminStudents.tsx` shows a list of students but has no "Enroll in Batch" button from that view (it exists in AdminBatches via `EnrollStudentsDialog`). Not a critical bug but a UX gap.

**MISSING 7 — No route protection / auth guards**
Any user can navigate directly to `/admin`, `/teacher`, `/student`, `/parent`, `/superadmin` without being logged in. There are no route guards — the pages simply render and queries return empty. Should show a redirect to login.

---

## What Works Correctly (confirmed from network logs)

The network logs confirm these are fully working right now:
1. Admin login (Waseem@gmail.com → MISS077 → routes to /admin)
2. get_my_institute_code() RPC → returns "MISS077" ✓
3. pending_requests SELECT → returns real data ✓
4. Teacher approval flow: PATCH pending_requests → 204, PATCH profiles → 204, POST user_roles → 201 ✓
5. AdminApprovals realtime subscription working (session replay shows "Kavi has been granted teacher access" toast)
6. Institute name fetch from institutes table → works for admin ✓
7. DashboardLayout shows real user name ✓
8. Pending count badge in sidebar ✓

---

## What I'll Fix in This Implementation

### Priority 1: The RLS PERMISSIVE fix (enables all data to load)
Migration: Drop and recreate all policies as PERMISSIVE

### Priority 2: Fix parent dashboard child lookup
Query by studentId text match instead of child_id UUID

### Priority 3: Fix AdminSettings to use institute_code not owner_user_id

### Priority 4: Add institutes SELECT policy for students/teachers

### Priority 5: Add polling + auto-redirect to ParentAuth pending screen

### Priority 6: Fix sidebar nav links for Teacher/Student/Parent (point to correct deep-links)

### Priority 7: Parent admin approval should now also link parent to child (store actual student user_id in extra_data when admin approves, or a new field)

---

## Files to change

| File | Change |
|---|---|
| Migration | DROP + RECREATE all policies as PERMISSIVE, add institutes SELECT for all institute members |
| `src/pages/auth/ParentAuth.tsx` | Add 5-second polling in pending screen (same pattern as TeacherAuth) |
| `src/pages/AdminSettings.tsx` | Fix query: use `institute_code` instead of `owner_user_id` |
| `src/pages/ParentDashboard.tsx` | Fix child lookup: query pending_requests extra_data.studentId → match to profiles |
| `src/components/DashboardLayout.tsx` | Fix teacher/student/parent sidebar nav: each item should navigate within the same dashboard or show active-tab state |
| `src/pages/AdminApprovals.tsx` | When approving a PARENT request, also try to find the student by studentId and store the student's user_id into the parent's pending_request extra_data |
