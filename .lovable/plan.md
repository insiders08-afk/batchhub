
## Current State Assessment

The app has excellent UI but is mostly running on **hardcoded/mock data**. The key gaps for real launch:

1. **AdminDashboard** — stats, charts, batches, announcements are all fake static data
2. **BatchWorkspace** — chat messages, attendance, tests, homework are all hardcoded arrays
3. **TeacherDashboard / StudentDashboard / ParentDashboard** — show fake names and data
4. **DashboardLayout** — shows "Apex Classes, Kota" and fake user names (RK, AG, etc.) for everyone
5. **AdminApprovals** — already live (reads from DB ✓)
6. **AdminBatches** — hardcoded batch cards, not reading real batches from `batches` table
7. **Chat** — currently local state only, messages lost on refresh, not in database

## Answering your questions first

**Auto-login (like Instagram):** Yes, the app already does this. Once you log in on your laptop, Supabase saves your session in the browser. Next time you open the app, you're already logged in — you won't need to type your password again unless you explicitly log out or it's been a very long time. This works for admin, teacher, student, everyone.

**Phone OTP:** Currently phone numbers are collected but there's NO OTP verification wired up. Phone OTP requires a Twilio/SMS service and extra cost. For your local institute launch, you don't need it — the admin approval flow handles verification. We can add it later when you scale.

**Email verification:** You're 100% right. We removed it because: every student/teacher/parent gets approved by the admin. Every admin gets approved by the super admin. Every super admin gets approved by you. That chain IS the verification. Email confirmation was just an extra step that would slow down and confuse real users.

---

## The Plan — Make It Real for One Institute

### Priority order for today's launch:

**Phase 1 — Live Data Wiring (most critical)**
These pages need to read/write from the real database instead of showing fake data.

**Phase 2 — Real-time Chat**
The batch chat needs to save messages to the database and show them in real time across all users.

**Phase 3 — Session & Name Personalization**
Every dashboard needs to show the REAL logged-in user's name, not "Amit Gupta" or "Rajesh Kumar".

---

## Files to change and what changes

### 1. `src/components/DashboardLayout.tsx`
- Add a `useEffect` that calls `supabase.auth.getUser()` then fetches the `profiles` table for that user
- Replace hardcoded `roleNames`, `roleAvatars` with real name from the database
- Replace hardcoded "Apex Classes, Kota" with the real `institute_code` from the user's profile
- Add real logout: `supabase.auth.signOut()` then redirect to `/role-select`

### 2. `src/pages/AdminDashboard.tsx`
- Replace fake stats with real queries:
  - Total students → count from `profiles` where `role=student` and `institute_code = mine`
  - Active batches → count from `batches` where `institute_code = mine`
  - Today's attendance → percentage from `attendance` table for today
  - Fee alerts → count from `fees` where `paid=false`
- Replace fake batch list with real `batches` table query
- Replace fake announcements with real `announcements` table query

### 3. `src/pages/AdminBatches.tsx`
- Replace `batchesData` hardcoded array with live query from `batches` table
- Wire "Create Batch" dialog to actually INSERT into the `batches` table
- Wire delete button to DELETE from `batches` table
- Fetch real teacher list from `profiles` where `role=teacher`

### 4. `src/pages/BatchWorkspace.tsx`
This is the biggest one:
- **Chat**: Create a new `batch_messages` table in the database → wire send/receive → enable Supabase Realtime so messages appear live for all users in the batch
- **Attendance**: Wire the "Save Attendance" button to INSERT into `attendance` table
- **Announcements**: Wire "Post Announcement" button to INSERT into `announcements` table; load real announcements from DB
- **Tests**: Load from `test_scores` table; wire "Add Test" to INSERT
- Batch info (name, teacher, student count) loaded from `batches` table using the batch `id` from the URL

### 5. `src/pages/TeacherDashboard.tsx`
- Show real teacher name from session/profile
- Show real assigned batches from `batches` table where `teacher_id = current user`
- Show real attendance stats

### 6. `src/pages/StudentDashboard.tsx`
- Show real student name
- Show real batch enrollment from `students_batches` table
- Show real upcoming tests from `test_scores`

### 7. `src/pages/ParentDashboard.tsx`
- Show real parent name
- Fetch child's attendance and fee records

---

## Database change needed: `batch_messages` table

Need to create one new table for chat:
```
batch_messages
- id (uuid)
- batch_id (uuid)
- institute_code (text)
- sender_id (uuid) 
- sender_name (text)
- sender_role (text)
- message (text)
- created_at (timestamptz)
```
With RLS: institute members of the same batch can read; authenticated members can insert their own messages.
Enable Realtime on this table for live chat.

---

## What this gives you by tonight

After these changes:
1. Admin registers → gets approved → logs in → sees REAL dashboard with their institute's live data
2. Admin creates a batch → it appears immediately in the batch list
3. Admin goes to Approvals → approves a teacher → teacher logs in and sees their dashboard
4. Teacher opens a batch → can mark attendance (saves to DB), post announcements (saves to DB), chat with students in real time
5. Student logs in → sees their batch, their test scores, their attendance
6. Everyone auto-logs-in on their device after first login

---

## Files summary

| File | Type of change |
|---|---|
| Migration: `batch_messages` table | New DB table + RLS + Realtime |
| `src/components/DashboardLayout.tsx` | Real session/profile data, real logout |
| `src/pages/AdminDashboard.tsx` | Live stats from DB |
| `src/pages/AdminBatches.tsx` | Live batch CRUD from DB |
| `src/pages/BatchWorkspace.tsx` | Live chat, attendance, announcements, tests |
| `src/pages/TeacherDashboard.tsx` | Real name and batch data |
| `src/pages/StudentDashboard.tsx` | Real name, batch, tests |
| `src/pages/ParentDashboard.tsx` | Real name and child data |

This is a substantial but well-defined scope. All of it is doable today. Shall I proceed?
