
## What needs to be fixed — Full breakdown

You've reported 7 distinct problem areas. Here's each one mapped to specific code changes:

---

### 1. City Partner Apply — Block duplicate city submission at form level
**File**: `src/pages/CityPartnerApply.tsx`

Currently anyone can apply for a city that already has a super admin. The owner dashboard checks on approval, but the applicant gets no feedback upfront.

**Fix**: Before submit, query `user_roles` where `role = super_admin` and `city = selected city`. If found, show an error message instantly: "Bareilly already has a City Partner. This city is not available." Don't submit the form.

---

### 2. SuperAdminDashboard — Add a proper Tabs UI (Institutes list + Approvals)
**File**: `src/pages/SuperAdminDashboard.tsx`

Currently the page is one flat list. Need two tabs:
- **"Institutes"** tab → shows all approved institutes as clean compact cards: institute name, owner name, phone only. Clicking one opens a details sheet/dialog with full info.
- **"Approvals"** tab → existing pending/approved/rejected filter view (what's there now)

---

### 3. City dropdown in ALL auth forms
**Files**: `src/pages/auth/AdminAuth.tsx`, `src/pages/auth/TeacherAuth.tsx`, `src/pages/auth/StudentAuth.tsx`, `src/pages/auth/ParentAuth.tsx`

The `city` field in `AdminAuth` is a free-text `<Input>`. Teacher, Student, Parent don't even have a city field (but their institute is identified by institute code, not city — so for Teacher/Student/Parent, city is not needed on the form, they use Institute ID).

Only `AdminAuth` needs the dropdown (institute registration has a `city` field). Replace the city `<Input>` in `AdminAuth` with a `<select>` using the same `INDIA_CITIES` list from `CityPartnerApply.tsx`.

---

### 4. Admin pending screen — Add "try logging again" instruction + step 4 about rejection notice
**File**: `src/pages/auth/AdminAuth.tsx`

Add a 4th step to the pending steps list:
- Step 4: "Once approved, try logging in again to access your dashboard. If rejected, you'll see the reason on this screen."

Also update the rejected screen to say "Contact your city's Lamba partner for more information." (instead of support@lamba.app).

---

### 5. Super Admin phone number stored in applications — show it to admin on pending screen
**Issue**: When any city partner applies, their `phone` is stored in `super_admin_applications`. When an institute gets rejected, the pending screen should show the super admin's phone number.

**Problem**: The `AdminAuth` pending/rejected screens don't fetch the super admin for the city. 

**Fix**:
- In `AdminAuth.tsx`, when showing the pending/rejected screen, do a lookup of `super_admin_applications` (or `user_roles` with a join to `profiles`) to find the city's super admin phone. Display it in the rejected screen as "Contact your city partner: [phone number]."
- Also store the city from the institute registration in state so we can query by city.

---

### 6. The big one: All admin sub-pages still show fake demo data
These 5 pages need to be fully wired to the real database:

#### `src/pages/AdminStudents.tsx`
- Remove hardcoded `students` array
- Fetch from `profiles` where `role = 'student'` and `institute_code = get_my_institute_code()`
- Show real name, phone, enrollment status
- The "Add Student" dialog is decorative — wire it to actually insert a profile (or note that students self-register)

#### `src/pages/AdminAttendance.tsx`
- Remove hardcoded `batches`, `students`, `attendanceHistory` arrays
- Fetch real batches from `batches` table
- On batch select: fetch students enrolled via `students_batches` JOIN `profiles`
- Save Attendance: upsert to `attendance` table
- History: fetch last 5 dates from `attendance` table, grouped by date
- Add **attendance permission**: add a setting per batch for who can mark (teacher, admin, or both) — store in `batches.attendance_marked_by` column (already exists!)

#### `src/pages/AdminAnnouncements.tsx`
- Remove hardcoded announcements array
- Fetch from `announcements` table where `institute_code = mine`
- "New Announcement" dialog: wire Post button to INSERT into `announcements`
- Batch dropdown in dialog: populate from real `batches` table

#### `src/pages/AdminTests.tsx`
- Remove hardcoded `tests` and `results` arrays
- Fetch from `test_scores` table, group by `test_name`
- "Add Test" dialog: wire to INSERT `test_scores` for each student

#### `src/pages/AdminSettings.tsx`
- Remove hardcoded "Apex Classes", "admin@apexclasses.com" etc.
- Fetch real institute data from `institutes` table on load
- "Save Changes" button: UPDATE the `institutes` table
- Team Management: fetch real profiles with `role = admin` or co-admin role

---

### 7. Add Teachers tab + Co-Admins tab to Admin Dashboard
**File**: `src/pages/DashboardLayout.tsx` or `src/pages/AdminDashboard.tsx`

Add two new navigation buttons in the sidebar (in `DashboardLayout.tsx`):
- **"Teachers"** → `/admin/teachers` (new page)
- **"Co-Admins"** → `/admin/coadmins` (new page, or we can merge into Settings team view)

But creating two full new pages is a lot. Better approach: Add a **"Team"** page at `/admin/team` that shows two tabs — Teachers | Co-Admins — each listing approved members with relevant details.

---

## RLS critical fix
All the above admin pages query using `institute_code = get_my_institute_code()`. This works because the admin has a `user_roles` row. But the RLS policies on `announcements`, `attendance`, `batches`, `test_scores` etc. are all **RESTRICTIVE** (not PERMISSIVE). 

This is the core bug causing "no data showing". Need a DB migration to convert them all to PERMISSIVE.

---

## Files to change

| File | Change |
|---|---|
| **Migration** | Convert all RESTRICTIVE RLS policies to PERMISSIVE on all tables |
| `src/pages/CityPartnerApply.tsx` | Check city availability before submitting |
| `src/pages/SuperAdminDashboard.tsx` | Add Tabs: Institutes (clickable cards) + Approvals |
| `src/pages/auth/AdminAuth.tsx` | City dropdown (INDIA_CITIES), 4th step in pending, super admin phone in rejected |
| `src/pages/AdminStudents.tsx` | Wire to real `profiles` DB data |
| `src/pages/AdminAttendance.tsx` | Wire to real `batches`, `students_batches`, `attendance` DB data |
| `src/pages/AdminAnnouncements.tsx` | Wire to real `announcements` DB data |
| `src/pages/AdminTests.tsx` | Wire to real `test_scores` DB data |
| `src/pages/AdminSettings.tsx` | Wire to real `institutes` + `profiles` DB data |
| `src/pages/DashboardLayout.tsx` | Add Teachers + Co-Admins nav links |
| `src/App.tsx` | Add route `/admin/team` |
| New: `src/pages/AdminTeam.tsx` | Teachers + Co-Admins tabs with real data |
