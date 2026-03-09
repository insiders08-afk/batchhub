
## Understanding the two requests

### Request 1: "Alert on mobile notification" toggle in announcement post dialog
- A `notify_push` boolean column needs to be added to the `announcements` table
- The "Post Announcement" dialog in `BatchWorkspace.tsx`, `AdminAnnouncements.tsx`, and `TeacherAnnouncements.tsx` needs a Switch toggle: "Alert students on their phone"
- For now: if the toggle is ON, store `notify_push = true` in the DB. No actual push delivery yet — just the infrastructure (column + UI toggle + data saved). We'll wire up real FCM/push delivery later when ready.
- Announcements with `notify_push = true` will show a small 🔔 bell badge so students can see "this was marked as important"

### Request 2: Real-time live updates (no manual refresh needed)

Currently pages that need realtime but don't have it:
- **Batch Chat** (`BatchWorkspace.tsx`): ✅ Already has realtime for `batch_messages`
- **Batch Announcements** (`BatchWorkspace.tsx`): ❌ No realtime — only fetches once on load, re-fetches manually after post
- **Admin Approvals** (`AdminApprovals.tsx`): ✅ Already has realtime for `pending_requests`
- **Teacher Dashboard** (`TeacherDashboard.tsx`): ❌ No realtime — batch requests (pending assignments) don't update live
- **Student Announcements** (`StudentAnnouncements.tsx`): ❌ No realtime subscription
- **Admin Announcements** (`AdminAnnouncements.tsx`): ❌ No realtime subscription
- **Teacher Announcements** (`TeacherAnnouncements.tsx`): ❌ No realtime subscription
- **Admin Dashboard** (`AdminDashboard.tsx`): ❌ Stats and recent announcements static after load

Supabase Realtime works via `postgres_changes` subscriptions. We already use this pattern in `BatchWorkspace.tsx` (chat) and `AdminApprovals.tsx`. We just need to wire up the same pattern to the missing pages.

For **realtime to work**, the tables must be added to the `supabase_realtime` publication. The `announcements` and `batch_teacher_requests` tables likely aren't in it yet. We need a migration to add them.

---

## Plan

### Step 1: DB migration
Two changes:
1. Add `notify_push boolean NOT NULL DEFAULT false` column to `announcements` table
2. Enable realtime on `announcements` and `batch_teacher_requests` tables:
```sql
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS notify_push boolean NOT NULL DEFAULT false;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.batch_teacher_requests;
```

### Step 2: Add `notify_push` toggle to announcement post dialogs

In **3 files** (`BatchWorkspace.tsx`, `AdminAnnouncements.tsx`, `TeacherAnnouncements.tsx`):
- Add `Switch` import from `@/components/ui/switch`
- Add `notifyPush` boolean state (default `false`) to the form state
- Add a row in the dialog: Switch + label "Alert students on phone" with a `Bell` icon
- Pass `notify_push: notifyPush` in the `.insert()` call
- Show a 🔔 bell badge on announcement cards when `notify_push === true`

### Step 3: Add realtime subscriptions to pages that are missing them

**`BatchWorkspace.tsx`** — add realtime for `announcements` tab:
```ts
supabase.channel(`batch-announcements-${batchId}`)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements', filter: `batch_id=eq.${batchId}` },
    (payload) => setAnnouncements(prev => [payload.new as Announcement, ...prev])
  ).subscribe()
```

**`TeacherDashboard.tsx`** — add realtime for `batch_teacher_requests` (pending requests for this teacher):
```ts
supabase.channel('teacher-batch-requests')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'batch_teacher_requests' },
    () => fetchData() // re-fetch when any request changes
  ).subscribe()
```

**`StudentAnnouncements.tsx`** — add realtime for `announcements`:
```ts
supabase.channel('student-announcements')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' },
    (payload) => setAnnouncements(prev => [payload.new as Announcement, ...prev])
  ).subscribe()
```

**`AdminAnnouncements.tsx`** — add realtime for `announcements`:
Same pattern — INSERT event triggers prepend to state.

**`TeacherAnnouncements.tsx`** — add realtime for `announcements`:
Same pattern.

**`AdminDashboard.tsx`** — add realtime for `announcements` (update the "Recent Announcements" widget live):
```ts
supabase.channel('admin-dashboard-announcements')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' },
    () => fetchData() // simplest: re-fetch the whole dashboard stats
  ).subscribe()
```

### Files to change

| File | Change |
|---|---|
| DB migration | Add `notify_push` column + enable realtime on `announcements` + `batch_teacher_requests` |
| `BatchWorkspace.tsx` | Add `notify_push` toggle in dialog + realtime subscription for announcements tab |
| `AdminAnnouncements.tsx` | Add `notify_push` toggle + realtime subscription |
| `TeacherAnnouncements.tsx` | Add `notify_push` toggle + realtime subscription |
| `StudentAnnouncements.tsx` | Add realtime subscription + show bell badge on `notify_push=true` announcements |
| `TeacherDashboard.tsx` | Add realtime subscription for `batch_teacher_requests` |
| `AdminDashboard.tsx` | Add realtime subscription for announcements widget |
