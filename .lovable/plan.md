
## Summary of findings

**Bug found — BatchWorkspace back button:**
Line 98-100 of `BatchWorkspace.tsx`:
```tsx
<Link to="/admin/batches">
  <Button variant="ghost" size="icon" className="w-8 h-8">
    <ArrowLeft className="w-4 h-4" />
  </Button>
</Link>
```
The back button is hardcoded to `/admin/batches`. So if a Teacher clicks a batch from their dashboard, the back button takes them to the Admin Batches page. Fix: use `useNavigate(-1)` (browser history back) so it returns to wherever the user came from.

**Current state — what works and what doesn't:**
- Admin demo: full sidebar + all pages working ✓
- Teacher demo: dashboard loads, batches open — but back button goes to admin ✗
- Student demo: dashboard loads ✓
- Parent demo: page exists ✓
- No real authentication — everything is mock/localStorage
- No database tables at all (types.ts is empty, no migrations run)
- The app is a polished UI prototype, not yet a real app

---

## Plan — Two phases

### Phase 1: Fix the back button bug (immediate)
**File: `src/pages/BatchWorkspace.tsx` line 98**
Replace `<Link to="/admin/batches">` with `useNavigate(-1)` — browser history back.
This is a 1-line fix. The user coming from Teacher Demo will go back to `/teacher`, and from Admin Batches will go back to `/admin/batches`.

### Phase 2: Make it a real publishable marketplace app

This is the big roadmap. Here's how to connect the backend step by step:

#### 2a. Database schema (run migrations)
Create these tables in the backend:

```text
institutes
  id, owner_name, institute_name, institute_id_code,
  govt_reg_no, email, phone, status (pending/approved/rejected),
  created_at

user_roles
  id, user_id (auth), role (admin/teacher/student/parent),
  institute_code

profiles
  id (= auth user id), full_name, role, institute_code,
  teacher_id / student_id / parent_id (nullable),
  status (pending/approved/active)

pending_requests
  id, name, role, institute_code, user_id (auth),
  extra_data (JSONB — govt reg no, IDs, etc.),
  status (pending/approved/rejected), created_at

batches
  id, name, course, institute_code, teacher_id, created_at

students_batches (join table)
  student_id, batch_id

attendance
  id, batch_id, student_id, date, present

test_scores
  id, batch_id, student_id, test_name, score, max_marks, date

fees
  id, student_id, institute_code, amount, due_date, paid, paid_date
```

#### 2b. Real authentication flow
- Admin registers → Supabase Auth signup → creates a row in `institutes` with `status: pending` → I (Lamba owner) approve via a super-admin panel
- Teacher/Student/Parent sign up → Supabase Auth signup → creates row in `pending_requests` → institute admin approves from their Approvals page
- After approval: profile `status` flips to `active`, user can log in and access their dashboard
- Each dashboard reads real data from the database filtered by `institute_code`

#### 2c. Multi-tenancy (marketplace isolation)
- Every record has an `institute_code` column
- RLS policies ensure an institute can only see its own data
- Admin of Institute A cannot see Institute B's students, batches, fees, etc.

#### 2d. Super-admin (you, the owner)
- A separate route `/superadmin` visible only to your account (checked via a `super_admin` role in `user_roles`)
- Shows all registered institutes with pending/approved/rejected status
- You approve new institute registrations from here

#### 2e. Publishing checklist
- [ ] Fix back button bug
- [ ] Run DB migrations
- [ ] Wire auth pages to Supabase Auth
- [ ] Build approval flow with real DB
- [ ] Add RLS policies per institute
- [ ] Build super-admin panel for you
- [ ] Test end-to-end: register institute → approve → log in → create batch → add teacher → teacher logs in → marks attendance
- [ ] Click "Publish" in Lovable

---

## What I will implement right now

**Immediate (this message):** Fix the back button bug in `BatchWorkspace.tsx` — replace hardcoded `/admin/batches` with `useNavigate(-1)`.

**Next steps (separate messages, one at a time):**
1. Run DB migrations — create `institutes`, `profiles`, `pending_requests` tables with RLS
2. Wire `AdminAuth.tsx` register form to Supabase Auth + `institutes` table
3. Wire teacher/student/parent auth to Supabase Auth + `pending_requests` table
4. Build real admin Approvals page reading from DB
5. Build super-admin panel for you
6. Test & publish

This way each step is verified before moving to the next — no big-bang risk.
