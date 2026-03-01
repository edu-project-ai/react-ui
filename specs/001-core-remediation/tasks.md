# Tasks: Frontend Core Remediation — Critical & Medium Violation Fix

**Branch**: `fix/001-core-remediation` | **Date**: 2026-03-01  
**Input**: `specs/001-core-remediation/` — plan.md, spec.md, research.md, data-model.md, contracts/migration-map.md  
**Audit Reference**: `frontend-architecture-audit-report.md` — violations C-01, C-02, M-01, M-02

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel with other [P] tasks in the same phase (different files, no mutual dependency)
- **[Story]**: Which user story this task belongs to — US1, US2, US3, US4
- Exact file paths are included in every task description

---

## Phase 1: Setup

**Purpose**: Zero-dependency deletions that unblock all subsequent phases.

- [x] T001 Delete `src/lib/http.ts` — zero callers confirmed by audit; `@deprecated` JSDoc with no importers in `src/`

**Checkpoint**: `grep -r "lib/http" src/` returns zero results.

---

## Phase 2: Foundational (Type Infrastructure)

**Purpose**: New type definitions and barrel exports that US2 and US4 both depend on. No user story work can begin until this phase is complete.

**⚠️ CRITICAL**: T003, T004, T005 all depend on T002. Start T003–T005 sequentially after T002, or in parallel once T002 is confirmed written.

- [x] T002 Create `src/features/notifications/types.ts` — define `NotificationPayload` discriminated union (`roadmap_ready | roadmap_progress | error | Record<string, unknown>`)
- [x] T003 [P] Fix `src/features/notifications/store/notifications.slice.ts` — add `import type { NotificationPayload } from "../types"`; replace `data?: any` with `data?: NotificationPayload` in `NotificationItem` interface (M-02 violation 2)
- [x] T004 [P] Create `src/features/notifications/index.ts` — barrel export for `addNotification`, `markAsRead`, `markAllAsRead`, `removeNotification`, `clearAllNotifications` actions, `notificationsReducer`, `NotificationItem` type, and `NotificationPayload` type (C-02 prerequisite)
- [x] T005 [P] Extend `src/features/progress/index.ts` — append `export * from "./api/statisticsApi"` and `export type { UserStatistics, ActivityCalendarData, LearningPathProgress } from "./types"` after the existing `ProgressPage` export (C-02 prerequisite)

**Checkpoint**: `useGetActivityCalendarQuery` and `useGetUserStatisticsQuery` resolve from `@/features/progress`; `addNotification` resolves from `@/features/notifications`.

---

## Phase 3: User Story 1 — Eliminate Deprecated HTTP Clients (Priority: P1) 🎯 MVP

**Goal**: Replace all Axios-based HTTP with RTK Query. Delete `fsApi.ts` and defer `api-client.ts` deletion to after Phase 5 (it becomes zero-caller only when `learning-paths.queries.ts` and `user.queries.ts` are deleted in Phase 5).

**Independent Test**: `grep -r "from.*fsApi" src/` returns zero results; all IDE file-system operations continue via RTK Query hooks; `tsc --noEmit` passes.

- [x] T006 [US1] Create `src/features/ide/api/ideProxyApi.ts` — RTK Query slice with `reducerPath: "ideProxy"`, `baseUrl: VITE_WS_PROXY_URL` (with `ws://→http://` swap), and four endpoints: `fetchFileTree` (query), `readFile` (query, `responseHandler: "text"`), `writeFile` (mutation, `text/plain` body), `searchFiles` (query); export generated hooks `useFetchFileTreeQuery`, `useReadFileQuery`, `useLazyReadFileQuery`, `useWriteFileMutation`, `useLazySearchFilesQuery`
- [x] T007 [P] [US1] Register `ideProxyApi` in `src/store/index.ts` — add `[ideProxyApi.reducerPath]: ideProxyApi.reducer` to `reducer` map and `ideProxyApi.middleware` to `.concat()` chain
- [x] T008 [P] [US1] Migrate `src/features/ide/hooks/useFileTree.ts` — remove `import { fetchFileTree } from '../api/fsApi'`; add `import { useFetchFileTreeQuery } from '../api/ideProxyApi'`; convert imperative `await fetchFileTree(containerId)` call to declarative `useFetchFileTreeQuery(containerId, { skip: !containerId })`
- [x] T009 [P] [US1] Migrate `src/features/ide/components/EditorArea.tsx` — remove `import { readFile } from '../api/fsApi'`; add `import { useLazyReadFileQuery } from '../api/ideProxyApi'`; replace `await readFile(containerId, path)` with lazy hook trigger `await triggerReadFile({ containerId, path }).unwrap()`
- [x] T010 [P] [US1] Migrate `src/features/ide/hooks/useMonacoModels.ts` — remove `import { writeFile } from '../api/fsApi'`; add `import { useWriteFileMutation } from '../api/ideProxyApi'`; replace `await writeFile(containerId, path, content)` with `const [writeFile] = useWriteFileMutation(); await writeFile({ containerId, path, content }).unwrap()`
- [x] T011 [P] [US1] Migrate `src/features/ide/hooks/useSearch.ts` — remove `import { searchFiles } from '../api/fsApi'`; add `import { useLazySearchFilesQuery } from '../api/ideProxyApi'`; replace `await searchFiles(containerId, query)` with `const [triggerSearch] = useLazySearchFilesQuery(); await triggerSearch({ containerId, query }).unwrap()`
- [x] T012 [US1] Delete `src/features/ide/api/fsApi.ts` — all four callers migrated in T008–T011

> **Note**: `src/lib/api-client.ts` deletion is T036 (Phase 5) — it becomes zero-caller only after `learning-paths.queries.ts` and `user.queries.ts` are deleted.

**Checkpoint**: `grep -r "fsApi\|from.*api-client" src/features/ide` returns zero results; IDE feature compiles in isolation.

---

## Phase 4: User Story 2 — Fix Cross-Feature Encapsulation Leaks (Priority: P2)

**Goal**: All 14 cross-feature deep import paths replaced with feature barrel root paths. `notifications/index.ts` (T004) and `progress/index.ts` extension (T005) from Phase 2 are prerequisites.

**Independent Test**: A search for `@/features/<name>/(api|store|services|types|components|utils|constants)/` from a file in a different feature returns zero results; `tsc --noEmit` still passes.

All twelve tasks below touch different files — all are parallelizable once Phase 2 is complete.

- [x] T013 [P] [US2] Fix `src/features/register/components/RegisterForm.tsx` — change deep import `@/features/authorization/utils/profile-checker` to `@/features/authorization`
- [x] T014 [P] [US2] Fix `src/features/learning-paths/components/CreateLearningPathPage.tsx` — change deep import `@/features/onboarding/constants` to `@/features/onboarding`
- [x] T015 [P] [US2] Fix `src/features/learning-paths/components/RoadmapNotificationListener.tsx` — (1) change `addNotification` import from `@/features/notifications/store/notifications.slice` to `@/features/notifications`; (2) import `NotificationPayload` from `@/features/notifications`; (3) replace `data?: any` in the local `RoadmapUpdateMessage` interface with `data?: NotificationPayload` (also resolves M-02 violation 3)
- [x] T016 [P] [US2] Fix `src/features/dashboard/pages/DashboardPage.tsx` — change deep import `@/features/progress/api/statisticsApi` to `@/features/progress`
- [x] T017 [P] [US2] Fix `src/features/dashboard/components/ActivityCalendar.tsx` — change deep import `@/features/progress/api/statisticsApi` to `@/features/progress`
- [x] T018 [P] [US2] Fix `src/features/dashboard/components/RecentActivity.tsx` — change deep import `@/features/learning-paths/services/type` to `@/features/learning-paths`
- [x] T019 [P] [US2] Fix `src/features/dashboard/components/StatsGrid.tsx` — change deep import `@/features/learning-paths/services/type` to `@/features/learning-paths`; change deep import `@/features/progress/types` to `@/features/progress` (two import changes in one file)
- [x] T020 [P] [US2] Fix `src/features/dashboard/components/PathCard.tsx` — change deep import `@/features/learning-paths/services/type` to `@/features/learning-paths`
- [x] T021 [P] [US2] Fix `src/features/dashboard/components/ActivePathCard.tsx` — change deep import `@/features/learning-paths/services/type` to `@/features/learning-paths`
- [x] T022 [P] [US2] Fix `src/features/dashboard/api/learningPathApi.ts` — change deep import `@/features/learning-paths/services/type` to `@/features/learning-paths`
- [x] T023 [P] [US2] Fix `src/features/home/components/StatisticsSection.tsx` — change deep import `@/features/dashboard/components/StatCard` to `@/features/dashboard`
- [x] T024 [P] [US2] Fix `src/features/ide/pages/IdePage.tsx` — change deep import `@/features/learning-paths/api/learningPathsApi` to `@/features/learning-paths`

> **Note**: `onboarding/hooks/useOnboarding.ts` deep-import fix (`@/features/authorization/api/user.queries` → `@/features/authorization`) is handled in T034 (Phase 5) because it is part of the React Query migration for that file.

**Checkpoint**: `grep -rn "@/features/[a-z-]\+/\(api\|store\|services\|types\|components\|utils\|constants\)" src/features` returns zero cross-feature matches.

---

## Phase 5: User Story 3 — Remove Prohibited Data-Fetching Library (Priority: P3)

**Goal**: Delete all `@tanstack/react-query` usage. Migrate 9 consumer call sites from React Query hooks to RTK Query hooks. Remove `QueryClientProvider`. Complete US1 by deleting `api-client.ts`.

**Independent Test**: `@tanstack/react-query` absent from `package.json`; `grep -r "tanstack/react-query\|QueryClient" src/` returns zero results; `npm run build` succeeds.

**Mutation API change** (applies to T025, T033, T034): `const { mutateAsync, isPending } = useMutation()` → `const [trigger, { isLoading }] = useMutation(); await trigger(args).unwrap()`

**Query option change** (applies to T027–T031): `enabled: !!x` → `skip: !x`

### Learning-paths consumers (T025–T031 are all parallelizable — different files)

- [x] T025 [P] [US3] Migrate `src/features/learning-paths/hooks/useLearningPaths.ts` — replace `useCreateLearningPath` + `useUpdateTaskCompletion` imports from `learning-paths.queries` with `useCreateLearningPathMutation` + `useUpdateTaskCompletionMutation` from `../api/learningPathsApi`; update both from `mutateAsync`/`isPending` destructure to `[trigger, { isLoading }]` pattern; replace `await mutateAsync(args)` with `await trigger(args).unwrap()`
- [x] T026 [P] [US3] Migrate `src/features/learning-paths/components/LearningPathsPage.tsx` — replace `useGetAllLearningPaths` import from `learning-paths.queries` with `useGetAllLearningPathsQuery` from `../api/learningPathsApi`; rename call site
- [x] T027 [P] [US3] Migrate `src/features/learning-paths/components/LearningPathDetailPage.tsx` — (1) replace `useGetLearningPathById` with `useGetLearningPathByIdQuery` from `../api/learningPathsApi`; (2) change call site from `useGetLearningPathById(id, { enabled: !!id })` to `useGetLearningPathByIdQuery(id!, { skip: !id })`; (3) fix `CheckpointsTimeline` internal prop interface from `checkpoints: Checkpoint[]` to `checkpoints: CheckpointPreview[]`; (4) remove `checkpoints={learningPath.checkpoints as any}` cast (also resolves M-02 violation 4)
- [x] T028 [P] [US3] Migrate `src/features/learning-paths/components/CheckpointPage.tsx` — replace `useGetCheckpoint` with `useGetCheckpointQuery` from `../api/learningPathsApi`; update call from positional args `(lpId, cpId, { enabled })` to object arg `({ learningPathId: lpId, checkpointId: cpId }, { skip: !enabled })`
- [x] T029 [P] [US3] Migrate `src/features/learning-paths/components/TaskDetailPage.tsx` — replace `useGetCheckpoint` (aliased as `useGetCheckpointDetails`) with `useGetCheckpointQuery` from `../api/learningPathsApi`; update to object arg form `{ learningPathId, checkpointId }`
- [x] T030 [P] [US3] Migrate `src/features/learning-paths/components/detail-views/TheoryDetail.tsx` — replace `useGetTheoryResource` with `useGetTheoryResourceQuery` from `../../api/learningPathsApi`; update call from positional args `(lpId, itemId, { enabled })` to `({ learningPathId: lpId, itemId }, { skip: !enabled })`
- [x] T031 [P] [US3] Migrate `src/features/learning-paths/components/detail-views/CodingDetail.tsx` — replace `useGetCodingTask` with `useGetCodingTaskQuery` from `../../api/learningPathsApi`; update call from positional args `(lpId, itemId, { enabled })` to `({ learningPathId: lpId, itemId }, { skip: !enabled })`
- [x] T032 [US3] Delete `src/features/learning-paths/api/learning-paths.queries.ts` — all 7 consumers migrated in T025–T031

### User consumers (T033–T034 are parallelizable — different files)

- [x] T033 [P] [US3] Migrate `src/features/authorization/hooks/useUser.ts` — replace `useUpdateProfile` import from `../api/user.queries` with `useUpdateProfileMutation` from `../api/userApi`; update from `const { mutateAsync: updateProfile, isPending }` to `const [updateProfile, { isLoading: isPending }]`; replace `await updateProfile(data)` with `await updateProfile(data).unwrap()`
- [x] T034 [P] [US3] Migrate `src/features/onboarding/hooks/useOnboarding.ts` — replace `import { useUploadProfilePhoto, useCreateUser } from "@/features/authorization/api/user.queries"` with `import { useUploadProfilePhotoMutation, useCreateUserMutation } from "@/features/authorization"` (deep path → barrel, also fixes C-02); update both hooks from `mutateAsync`/`isPending` destructure to `[trigger, { isLoading }]` pattern; update all `await mutateAsync(args)` calls to `await trigger(args).unwrap()`
- [x] T035 [US3] Delete `src/features/authorization/api/user.queries.ts` — both consumers migrated in T033–T034; also auto-resolves M-02 violations 6 (`error: any`) and 7 (`(error as any).response?.status`)

### Cleanup (requires T032 + T035)

- [x] T036 [US1] Delete `src/lib/api-client.ts` — now zero callers (T032 and T035 removed its only two importers)
- [x] T037 [US3] Remove `QueryClient`, `QueryClientProvider` from `src/App.tsx` — delete the import line, the `const queryClient = new QueryClient(...)` initialization, and the `<QueryClientProvider client={queryClient}>` JSX wrapper; the resulting `App()` return should nest `<BasicDataRouter />` directly inside `<SignalRProvider>`

**Checkpoint**: `grep -r "react-query\|useQuery\|useMutation\|QueryClient\|api-client\|apiClient" src/` returns zero results.

---

## Phase 6: User Story 4 — Eliminate TypeScript `any` Usages (Priority: P4)

**Goal**: Remove the two remaining explicit `any` violations not yet resolved by earlier phases.

> **Already resolved by earlier phases** — no action needed:
>
> - M-02 violation 2 (`notifications.slice.ts data?: any`) → T003 (Phase 2)
> - M-02 violation 3 (`RoadmapNotificationListener.tsx data?: any`) → T015 (Phase 4)
> - M-02 violation 4 (`LearningPathDetailPage.tsx checkpoints as any`) → T027 (Phase 5)
> - M-02 violations 6 & 7 (`user.queries.ts error: any`) → T035 (Phase 5, auto-resolved by deletion)

**Independent Test**: `grep -rn ": any\|as any" src/` returns zero results in the target files; `tsc --noEmit` passes with strict mode.

- [x] T038 [P] [US4] Fix `src/main.tsx` — change `getWorker(_: any, label: string)` to `getWorker(_: string, label: string)` (Monaco `getWorker` first param is `moduleId: string`); remove `@ts-ignore` directive above the function if it resolves cleanly after the fix
- [x] T039 [P] [US4] Fix `src/features/ide/hooks/useDebouncedCallback.ts` — change generic constraint from `<T extends (...args: any[]) => any>` to `<T extends (...args: unknown[]) => unknown>`

**Checkpoint**: `grep -n "any" src/main.tsx src/features/ide/hooks/useDebouncedCallback.ts` returns zero matches.

---

## Final Phase: Polish & Verification

**Purpose**: Package removal and compiler/bundler confirmation that all violations are resolved.

- [x] T040 Run `npm uninstall axios @tanstack/react-query` in `D:\Projects\Project\ui` — removes both prohibited packages from `package.json` and `node_modules`
- [x] T041 Run `npx tsc --noEmit` in `D:\Projects\Project\ui` — verify exit code 0 and zero error lines; if errors appear, resolve before proceeding to T042
- [x] T042 Run `npm run build` in `D:\Projects\Project\ui` — verify Vite build completes with zero `ERROR` lines

---

## Summary

| Phase | Story | Tasks | Parallelizable |
|-------|-------|-------|---------------|
| 1 — Setup | — | T001 | — |
| 2 — Foundational | — | T002–T005 | T003, T004, T005 |
| 3 — US1 HTTP Clients | US1 | T006–T012 | T007–T011 |
| 4 — US2 Encapsulation | US2 | T013–T024 | T013–T024 (all) |
| 5 — US3 React Query | US3 | T025–T037 | T025–T031, T033–T034 |
| 6 — US4 TypeScript any | US4 | T038–T039 | T038–T039 |
| 7 — Polish | — | T040–T042 | — |
| **Total** | | **42** | **28 parallelizable** |

**Per user story**:

- US1 (Eliminate HTTP clients): T006–T012 + T036 = **8 tasks**
- US2 (Fix encapsulation leaks): T013–T024 = **12 tasks**
- US3 (Remove React Query): T025–T035 + T037 = **13 tasks**
- US4 (Eliminate `any`): T038–T039 + 4 resolved in earlier phases = **6 violations addressed**

---

## Dependency Graph

```text
T001 (delete http.ts)
  └── independent — can run at any time

T002 (create notifications/types.ts)
  ├── T003 (fix notifications.slice.ts)
  ├── T004 (create notifications/index.ts)
  └── T015 (fix RoadmapNotificationListener.tsx — needs T004 for import resolution)

T005 (extend progress/index.ts)
  ├── T016 (DashboardPage.tsx)
  └── T017 (ActivityCalendar.tsx)

T006 (create ideProxyApi.ts)
  ├── T007 (register in store)
  ├── T008 (useFileTree.ts)
  ├── T009 (EditorArea.tsx)
  ├── T010 (useMonacoModels.ts)
  └── T011 (useSearch.ts)
        └── T012 (delete fsApi.ts — needs T007–T011)

T025–T031 (LP React Query consumers)
  └── T032 (delete learning-paths.queries.ts — needs all T025–T031)

T033–T034 (user React Query consumers)
  └── T035 (delete user.queries.ts — needs T033+T034)

T032 + T035
  └── T036 (delete api-client.ts — needs both)

T037 (remove QueryClientProvider — independent but logically final for US3)

T040 (npm uninstall — must be LAST; needs T036 + T037 + all source changes done)
  └── T041 (tsc --noEmit)
        └── T042 (npm run build)
```

---

## Parallel Execution Examples

### Phase 3 batch (after T006 is written)

Run simultaneously in separate terminals:

```
T007: Edit src/store/index.ts
T008: Edit src/features/ide/hooks/useFileTree.ts
T009: Edit src/features/ide/components/EditorArea.tsx
T010: Edit src/features/ide/hooks/useMonacoModels.ts
T011: Edit src/features/ide/hooks/useSearch.ts
```

### Phase 4 batch (12 files, all independent)

All of T013–T024 can run simultaneously — each touches a single unique file.

### Phase 5 learning-paths batch (after Phase 2 complete)

Run simultaneously:

```
T025: Edit src/features/learning-paths/hooks/useLearningPaths.ts
T026: Edit src/features/learning-paths/components/LearningPathsPage.tsx
T027: Edit src/features/learning-paths/components/LearningPathDetailPage.tsx
T028: Edit src/features/learning-paths/components/CheckpointPage.tsx
T029: Edit src/features/learning-paths/components/TaskDetailPage.tsx
T030: Edit src/features/learning-paths/components/detail-views/TheoryDetail.tsx
T031: Edit src/features/learning-paths/components/detail-views/CodingDetail.tsx
```

Then T032 (delete), then run T033+T034 simultaneously, then T035.

### Phase 6 batch

T038 (`src/main.tsx`) and T039 (`src/features/ide/hooks/useDebouncedCallback.ts`) are independent — run together.

---

## Implementation Strategy

**Suggested MVP**: Complete Phase 1 + Phase 2 + Phase 3 first. This eliminates the most dangerous violations (undocumented parallel HTTP clients and direct Axios usage in an active feature) while leaving the React Query migration and import path fixes for subsequent passes.

**Incremental verification**: After each phase, run `npx tsc --noEmit`. The compiler is the primary correctness gate — any unresolved import or type error surfaces immediately.

**⚠️ Final package removal (T040) must be last**: `npm uninstall axios @tanstack/react-query` should only be run after ALL source references to both packages are gone. Running it mid-migration will break the remaining unconverted files.
