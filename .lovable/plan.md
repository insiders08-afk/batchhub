
## Understanding the full picture

All 4 auth pages (AdminAuth, TeacherAuth, StudentAuth, ParentAuth) currently use localStorage. The database schema is fully in place with proper RLS. Now we need to wire everything to real Supabase Auth.

## The 3 things to implement in one go:

### 1. Admin Auth → Real Authentication
**Register flow:**
- `supabase.auth.signUp({ email, password })` → get user
- Insert into `institutes` table: `{ owner_name, institute_name, institute_code, govt_registration_no, email, phone, owner_user_id: user.id, status: 'pending' }`
- Insert into `profiles`: `{ user_id: user.id, full_name, email, phone, role: 'admin', institute_code, status: 'pending' }`
- Show "Your institute is pending approval by the platform" screen (not redirect to /admin yet)

**Login flow:**
- `supabase.auth.signInWithPassword({ email, password })`
- Query `institutes` where `owner_user_id = user.id`
- If `status === 'approved'` → navigate to `/admin`
- If `status === 'pending'` → show pending screen
- If `status === 'rejected'` → show rejected message

**Why two-step login (no institute ID required on login):** User logs in by email+password only. We look up their institute from the DB — no need to remember institute code at login time.

### 2. Teacher / Student / Parent Auth → Real Authentication
Same pattern for all three:
- `supabase.auth.signUp({ email, password })` → get user
- Insert into `profiles`: `{ user_id, full_name, email, phone, role, institute_code, status: 'pending' }`
- Insert into `pending_requests`: `{ user_id, full_name, email, role, institute_code, extra_data: { teacherId/studentId/relation/subject/batchName }, status: 'pending' }`
- Show "Pending approval" screen (existing UI is already good)

**Login flow for Teacher/Student/Parent (new — currently missing):**
- Currently auth pages only have a Register form. Need to add Sign In tab (same as admin).
- `supabase.auth.signInWithPassword({ email, password })`
- Query `profiles` where `user_id = user.id`
- If `status === 'approved'` → navigate to `/teacher`, `/student`, or `/parent`
- If `status === 'pending'` → show waiting screen

**Password field:** Need to add `password` field to Teacher/Student/Parent register forms (currently missing — they don't have it).

### 3. Super Admin Panel → `/superadmin` route
- New page `src/pages/SuperAdminDashboard.tsx`
- Lists all rows from `institutes` table (all statuses)
- Approve button: updates `institutes.status = 'approved'` + inserts row into `user_roles` `{ user_id: institute.owner_user_id, role: 'admin', institute_code }`
- Reject button: updates `institutes.status = 'rejected'`
- Shows: institute name, code, owner name, govt reg no, email, phone, submitted date, current status
- Route: `/superadmin` added to App.tsx
- **Access guard:** checks if logged-in user has `super_admin` role, else redirects to `/`
- **Your super admin account:** We need to seed your user_id into `user_roles` with `super_admin` role. After you register/login, you tell me and I insert the record.

### 4. Admin Approvals → Wire to real DB
- `AdminApprovals.tsx` currently reads from localStorage + demo array
- Replace with Supabase query: `supabase.from('pending_requests').select('*').eq('institute_code', myInstituteCode)`
- Approve action: `update status='approved'` in `pending_requests` + insert into `user_roles` + update `profiles.status='approved'`
- Reject action: `update status='rejected'`

### 5. Attendance permission — configurable per institute
Add a setting in `AdminSettings.tsx` to choose who can mark attendance:
- "Admin only" / "Teachers" / "Admin & Teachers"
- Store in `institutes` table (add `attendance_marked_by` column via migration)
- Read this setting when a teacher tries to access attendance marking — show/hide the button

---

## Files to create/change

| File | Change |
|---|---|
| `src/pages/auth/AdminAuth.tsx` | Replace localStorage with Supabase Auth signUp + signIn; institute insert; pending screen |
| `src/pages/auth/TeacherAuth.tsx` | Add password field; add Sign In tab; Supabase Auth signUp + signIn; pending_requests insert |
| `src/pages/auth/StudentAuth.tsx` | Add password field; add Sign In tab; Supabase Auth signUp + signIn; pending_requests insert |
| `src/pages/auth/ParentAuth.tsx` | Add password field; add Sign In tab; Supabase Auth signUp + signIn; pending_requests insert |
| `src/pages/SuperAdminDashboard.tsx` | New: list all institutes, approve/reject, super_admin guard |
| `src/pages/AdminApprovals.tsx` | Replace localStorage with Supabase queries; approve = user_roles insert + profile update |
| `src/App.tsx` | Add `/superadmin` route |
| Migration | Add `attendance_marked_by` column to `institutes` (text, default 'both') |

## Order of execution
1. Migration: add `attendance_marked_by` to institutes
2. Wire all 4 auth pages
3. Wire AdminApprovals to DB
4. Create SuperAdminDashboard
5. Add route in App.tsx
