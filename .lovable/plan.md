
## What exists vs. what's needed

**Exists:**
- `/student` route → `StudentDashboard.tsx` — thin: welcome card + 3 stat tiles + batch card
- `/teacher` route → `TeacherDashboard.tsx` — thin: welcome card + 2 batch cards
- `/parent` route → **does NOT exist** (no page file, not in App.tsx)
- No "View Demo" entry points for student/teacher/parent from auth pages or landing page
- `DashboardLayout` sidebar always shows Admin nav regardless of role

---

## Plan

### 1. Create `ParentDashboard.tsx` (new file)
Full demo page at `/parent` with:
- Welcome hero card — "Welcome back, Sunita Sharma · Parent · Apex Classes"
- Child summary card — Arjun Sharma, JEE Advanced A, Roll JA-001
- 3 stat tiles: Attendance 92%, Batch Rank #1, Fees Paid ✓
- Attendance summary (last 30 days mini breakdown — present/absent counts as cards)
- Recent announcements from batch (2-3 demo items)
- Fee status card — "₹18,000 paid · Next due: April 2025"
- Quick action: "Contact Teacher" button

### 2. Add demo "Quick Access" banner to StudentAuth & TeacherAuth pages
On `StudentAuth.tsx` and `TeacherAuth.tsx`, add a small highlighted banner near the top:

```
┌────────────────────────────────────────────────┐
│ 👁 Want to preview the student dashboard first? │
│           [View Student Demo →]                  │
└────────────────────────────────────────────────┘
```
This links to `/student` and `/teacher` respectively so you (or anyone) can jump straight to the demo without filling the form.

### 3. Add role-specific sidebar to `DashboardLayout`
Add a `role` prop (`"admin" | "teacher" | "student" | "parent"`, default `"admin"`):

- **Teacher sidebar**: My Dashboard, My Batches, Attendance, Announcements, Tests, Homework, Settings, Logout
- **Student sidebar**: My Dashboard, My Batch, Tests & Scores, Homework/DPP, Announcements, Settings, Logout  
- **Parent sidebar**: Overview, My Child, Attendance, Fees, Announcements, Logout

Pass `role="teacher"` in `TeacherDashboard`, `role="student"` in `StudentDashboard`, `role="parent"` in new `ParentDashboard`.

### 4. Enrich StudentDashboard
Add below existing content:
- Upcoming tests card (2 items: "Physics Mock · Mar 15", "Chemistry DPP · Mar 12")
- Recent homework card (2 items with due dates)
- Recent announcements card (2 items from batch)

### 5. Enrich TeacherDashboard
Add below existing batch cards:
- Quick actions row: "Mark Attendance" and "Post Announcement" buttons linking to batch workspace
- Today's summary row: Total students across batches, classes today, pending attendance

### 6. Register `/parent` route in `App.tsx`

### 7. Add demo entry point on landing page
In `Index.tsx` hero section, change "View Demo Dashboard" button into a dropdown or add a second row with three quick-access demo links:
- "Admin Demo" → `/admin`
- "Teacher Demo" → `/teacher`
- "Student Demo" → `/student`
- "Parent Demo" → `/parent`

---

## Files to change
| File | Action |
|---|---|
| `src/pages/ParentDashboard.tsx` | Create new |
| `src/App.tsx` | Add `/parent` route + import |
| `src/components/DashboardLayout.tsx` | Add `role` prop + role-specific sidebar menus |
| `src/pages/StudentDashboard.tsx` | Enrich with tests/homework/announcements cards |
| `src/pages/TeacherDashboard.tsx` | Enrich with quick actions + summary row |
| `src/pages/auth/StudentAuth.tsx` | Add demo preview banner |
| `src/pages/auth/TeacherAuth.tsx` | Add demo preview banner |
| `src/pages/auth/ParentAuth.tsx` | Add demo preview banner |
| `src/pages/Index.tsx` | Add multi-role demo links to hero |
