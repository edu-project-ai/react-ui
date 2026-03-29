# Quickstart: Frontend Core Remediation

**Branch**: `fix/001-core-remediation`  
**Total steps**: 18 (Steps 1–17 source changes + Step 18 verification)  
**Reference documents**: [`plan.md`](./plan.md) · [`research.md`](./research.md) · [`data-model.md`](./data-model.md) · [`contracts/migration-map.md`](./contracts/migration-map.md)

---

## Execution Checklist

Tick each step as you complete it. Steps are ordered to respect dependency constraints (see `research.md §9`).

### Phase A — New type infrastructure (no deletions yet)

- [ ] **Step 1** — Delete `src/lib/http.ts`  
  Verify: `grep -r "lib/http" src/` → 0 results

- [ ] **Step 2** — Create `src/features/notifications/types.ts`  
  Add `NotificationPayload` discriminated union (see `data-model.md`)

- [ ] **Step 3** — Edit `src/features/notifications/store/notifications.slice.ts`  
  Add import of `NotificationPayload`; replace `data?: any` with `data?: NotificationPayload`

- [ ] **Step 4** — Edit `src/features/learning-paths/components/RoadmapNotificationListener.tsx`  
  Replace `data?: any` in `RoadmapUpdateMessage`; update `addNotification` import to `@/features/notifications` (pre-register this path — it resolves after Step 5)

- [ ] **Step 5** — Create `src/features/notifications/index.ts`  
  Export: `addNotification`, all other slice actions, `notificationsReducer`, `NotificationItem` type, `NotificationPayload` type

- [ ] **Step 6** — Edit `src/features/progress/index.ts`  
  Add: `export * from "./api/statisticsApi"` and `export type { ... } from "./types"`

---

### Phase B — Migrate learning-paths consumers (do NOT delete yet)

- [ ] **Step 7a** — Edit `src/features/learning-paths/hooks/useLearningPaths.ts`  
  Swap React Query mutations for RTK Query mutations (see `contracts/migration-map.md Part A`)

- [ ] **Step 7b** — Edit `src/features/learning-paths/components/LearningPathsPage.tsx`  
  Swap `useGetAllLearningPaths` → `useGetAllLearningPathsQuery`

- [ ] **Step 7c** — Edit `src/features/learning-paths/components/LearningPathDetailPage.tsx`  
  Swap hook; fix `CheckpointsTimeline` prop type `Checkpoint[]` → `CheckpointPreview[]`; remove `as any` cast  
  *(Resolves M-02 violation 4 simultaneously)*

- [ ] **Step 7d** — Edit `src/features/learning-paths/components/CheckpointPage.tsx`  
  Swap hook; update arg shape to object form

- [ ] **Step 7e** — Edit `src/features/learning-paths/components/TaskDetailPage.tsx`  
  Swap hook; update arg shape to object form

- [ ] **Step 7f** — Edit `src/features/learning-paths/components/detail-views/TheoryDetail.tsx`  
  Swap hook; update arg shape to object form

- [ ] **Step 7g** — Edit `src/features/learning-paths/components/detail-views/CodingDetail.tsx`  
  Swap hook; update arg shape to object form

- [ ] **Step 8** — Delete `src/features/learning-paths/api/learning-paths.queries.ts`  
  Verify: `grep -r "learning-paths.queries" src/` → 0 results

---

### Phase C — Migrate user consumers (do NOT delete yet)

- [ ] **Step 9a** — Edit `src/features/authorization/hooks/useUser.ts`  
  Swap `useUpdateProfile` → `useUpdateProfileMutation`; update mutation API pattern

- [ ] **Step 9b** — Edit `src/features/onboarding/hooks/useOnboarding.ts`  
  Swap hooks; update import path from `@/features/authorization/api/user.queries` → `@/features/authorization`  
  *(Resolves C-02 violation 2 simultaneously)*

- [ ] **Step 10** — Delete `src/features/authorization/api/user.queries.ts`  
  Verify: `grep -r "user.queries" src/` → 0 results  
  *(Auto-resolves M-02 violations 6 and 7)*

---

### Phase D — Remove Axios infrastructure

- [ ] **Step 11** — Delete `src/lib/api-client.ts`  
  Verify: `grep -r "api-client" src/` → 0 results

- [ ] **Step 12** — Create `src/features/ide/api/ideProxyApi.ts`  
  Full RTK Query slice (see `data-model.md` for complete implementation);  
  Register reducer + middleware in `src/store/index.ts`

- [ ] **Step 13a** — Edit `src/features/ide/hooks/useFileTree.ts`  
  Replace `fetchFileTree` imperative call → `useFetchFileTreeQuery` hook

- [ ] **Step 13b** — Edit `src/features/ide/components/EditorArea.tsx`  
  Replace `readFile` imperative call → `useLazyReadFileQuery` hook

- [ ] **Step 13c** — Edit `src/features/ide/hooks/useMonacoModels.ts`  
  Replace `writeFile` call → `useWriteFileMutation` hook

- [ ] **Step 13d** — Edit `src/features/ide/hooks/useSearch.ts`  
  Replace `searchFiles` call → `useLazySearchFilesQuery` hook

- [ ] **Step 14** — Delete `src/features/ide/api/fsApi.ts`  
  Verify: `grep -r "fsApi" src/` → 0 results

---

### Phase E — Fix remaining cross-feature import paths (C-02)

> All 14 import path changes. Each file gets 1–2 lines changed. See `contracts/migration-map.md Part D`.

- [ ] **Step 15a** — Edit `src/features/register/components/RegisterForm.tsx` (violation 1)
- [ ] **Step 15b** — Edit `src/features/learning-paths/components/CreateLearningPathPage.tsx` (violation 4)
- [ ] **Step 15c** — Edit `src/features/ide/pages/IdePage.tsx` (violation 5)
- [ ] **Step 15d** — Edit `src/features/dashboard/pages/DashboardPage.tsx` (violation 6)
- [ ] **Step 15e** — Edit `src/features/dashboard/components/ActivityCalendar.tsx` (violation 7)
- [ ] **Step 15f** — Edit `src/features/dashboard/components/RecentActivity.tsx` (violation 8)
- [ ] **Step 15g** — Edit `src/features/dashboard/components/StatsGrid.tsx` (violations 9 + 10)
- [ ] **Step 15h** — Edit `src/features/dashboard/components/PathCard.tsx` (violation 11)
- [ ] **Step 15i** — Edit `src/features/dashboard/components/ActivePathCard.tsx` (violation 12)
- [ ] **Step 15j** — Edit `src/features/dashboard/api/learningPathApi.ts` (violation 13)
- [ ] **Step 15k** — Edit `src/features/home/components/StatisticsSection.tsx` (violation 14)

---

### Phase F — Fix remaining `any` violations (M-02)

- [ ] **Step 16a** — Edit `src/main.tsx` — `getWorker(_: any, ...)` → `_: string`  
  Optionally remove the `@ts-ignore` directive if no longer needed

- [ ] **Step 16b** — Edit `src/features/ide/hooks/useDebouncedCallback.ts`  
  `any[]` / `any` → `unknown[]` / `unknown` in generic constraint

  *(Step 16c is LearningPathDetailPage.tsx — already done in Step 7c)*

---

### Phase G — Package removal and compile check

- [ ] **Step 17a** — Run in terminal:

  ```powershell
  npm uninstall axios @tanstack/react-query
  ```

- [ ] **Step 17b** — Edit `src/App.tsx`  
  Remove `QueryClient`, `QueryClientProvider` import; remove `queryClient` constant; remove `<QueryClientProvider>` wrapper

- [ ] **Step 18** — Type-check and build:

  ```powershell
  npx tsc --noEmit
  npm run build
  ```

  **Expected**: Zero errors in `tsc`, successful Vite build output

---

## Post-Execution Verification Queries

Run these grep commands after Step 18 to confirm all violations are closed:

```powershell
# C-01: No Axios imports
Select-String -Path "src/**/*.ts","src/**/*.tsx" -Pattern "from ['\"]axios" -Recurse

# C-01: No http.ts, api-client.ts, fsApi.ts
Select-String -Path "src/**/*.ts","src/**/*.tsx" -Pattern "lib/http|api-client|/fsApi" -Recurse

# M-01: No @tanstack/react-query
Select-String -Path "src/**/*.ts","src/**/*.tsx" -Pattern "@tanstack/react-query" -Recurse

# M-02: No remaining `any`
Select-String -Path "src/**/*.ts","src/**/*.tsx" -Pattern ": any|as any" -Recurse

# C-02 spot-check — no deep cross-feature imports
Select-String -Path "src/**/*.ts","src/**/*.tsx" -Pattern "@/features/\w+/(api|store|services|types|components|utils|constants)/" -Recurse
```

All queries should return zero results.
