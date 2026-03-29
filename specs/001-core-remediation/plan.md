# Implementation Plan: Frontend Core Remediation — Critical & Medium Violation Fix

**Branch**: `fix/001-core-remediation` | **Date**: 2026-03-01 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/001-core-remediation/spec.md`  
**Audit Reference**: [`frontend-architecture-audit-report.md`](../../frontend-architecture-audit-report.md)

## Summary

This plan eliminates all **Critical** and **Medium** violations from the `frontend-architecture-audit-report.md` in a single focused remediation pass. The work breaks down into four violation categories:

- **C-01** (3 files): Remove the deprecated `HttpClient` class (`lib/http.ts`), undocumented Axios wrapper (`lib/api-client.ts`), and direct Axios usage in the IDE feature (`ide/api/fsApi.ts`). Replace `fsApi.ts` with an RTK Query slice; the two library files are deleted because their sole callers (`learning-paths.queries.ts`, `user.queries.ts`) are themselves being deleted in M-01.
- **C-02** (14 imports / 11 files): Seal cross-feature boundaries — most target features (`authorization`, `onboarding`, `learning-paths`, `dashboard`) already expose the needed symbols through their `index.ts`. The `notifications` feature has no `index.ts` (must be created) and the `progress` feature `index.ts` needs additional exports. The remaining work is updating the 14 import paths.
- **M-01** (4 locations): `@tanstack/react-query` is installed but its two feature-level query files (`learning-paths.queries.ts`, `user.queries.ts`) are duplicate implementations alongside already-complete RTK Query slices (`learningPathsApi.ts`, `userApi.ts`). Migration = delete the React Query files, update their 9 consumer call sites to use RTK Query hooks with `Query`/`Mutation` suffix naming, and remove the `QueryClientProvider` from `App.tsx`.
- **M-02** (7 occurrences / 6 files): Five explicit `any` fixes (violations 1–5); violations 6 & 7 in `user.queries.ts` are resolved automatically when that file is deleted in M-01.

**Critical pre-scan finding**: `src/lib/http.ts` has zero callers in the entire `src/` tree. It can be deleted immediately. `src/lib/api-client.ts` is called exclusively by `learning-paths.queries.ts` and `user.queries.ts`, so it too becomes zero-caller after M-01 and can be deleted in a single step.

---

## Technical Context

**Language/Version**: TypeScript 5.x / React 18  
**Primary Dependencies**: `@reduxjs/toolkit` ^2.9 (RTK Query), `react-redux` ^9.2, `react-router-dom` ^7.9, `aws-amplify`, `tailwindcss` ^4, `react-hook-form` ^7.71, `zod` ^3.25, `@microsoft/signalr` ^10  
**Storage**: N/A (client-side only; server state via RTK Query cache)  
**Testing**: TypeScript compiler (`tsc --noEmit`) as the primary correctness gate; `npm run build` for bundle validity  
**Target Platform**: Vite SPA — modern browser  
**Project Type**: React web application (feature-based / feature-sliced)  
**Performance Goals**: N/A — this is a structural compliance fix; no performance targets  
**Constraints**: Zero functional regressions. No change to any user-visible behavior. All changes must leave `tsc --noEmit` green.  
**Scale/Scope**: 20 files modified / deleted / created across `src/lib/`, `src/features/`, `src/App.tsx`, `src/main.tsx`, `package.json`

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Rule (Constitution §) | Status | Notes |
|------|-----------------------|--------|-------|
| All HTTP via RTK Query | §II — "exclusively for all HTTP requests" | ✅ PASS | All Axios usage replaced with RTK Query endpoints or `fetch`. `api-client.ts`, `http.ts` deleted. `fsApi.ts` migrated to `ideProxyApi.ts`. |
| No alternative data-fetching libraries | §II — "Do not introduce … React Query, SWR" | ✅ PASS | `@tanstack/react-query` removed from `package.json`; `QueryClientProvider` removed from `App.tsx`. |
| Feature encapsulation via `index.ts` | §I — "MUST do so through an explicit public API" | ✅ PASS | `notifications/index.ts` created; `progress/index.ts` extended; 14 deep import paths updated. |
| Strict TypeScript — no `any` | §V — "use of `any` is strictly prohibited" | ✅ PASS | All 7 violations addressed (5 explicit + 2 auto-resolved via M-01 file deletion). |
| Zustand scope | §II — "strictly reserved for … Web IDE component" | ✅ PASS | No changes touch Zustand; `ide/store/useIdeStore.ts` unchanged. |
| Tailwind-only styling | §III — "Avoid writing custom `.css` files" | ✅ PASS | L-01 CSS files out of scope; not touched. |
| Named exports | §III — "Prefer named exports" | ✅ PASS | All new files use named exports. L-02 (existing default exports) out of scope. |
| Branch prefix `fix/` | §Workflow-1 — "fix/ for bug fixes and remediation tasks" | ✅ PASS | Branch: `fix/001-core-remediation`. |

**Constitution Check Result**: ✅ All 8 gates pass. No complexity violations.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-core-remediation/
├── plan.md              ← This file
├── research.md          ← Phase 0 output (pre-scan findings)
├── data-model.md        ← Phase 1 output (entity changes)
├── quickstart.md        ← Phase 1 output (execution reference)
├── contracts/
│   └── migration-map.md ← Hook name mapping: React Query → RTK Query
└── tasks.md             ← Phase 2 output (task breakdown, NOT yet created)
```

### Source Changes (complete file inventory)

```text
src/
├── lib/
│   ├── http.ts                    ❌ DELETE — zero callers, @deprecated
│   └── api-client.ts              ❌ DELETE — callers deleted in M-01
│
├── App.tsx                        ✏️  MODIFY — remove QueryClient / QueryClientProvider
├── main.tsx                       ✏️  MODIFY — fix Monaco worker `any` (M-02)
│
├── features/
│   ├── notifications/
│   │   ├── index.ts               ➕ CREATE — new public barrel export
│   │   ├── types.ts               ➕ CREATE — NotificationPayload discriminated union
│   │   ├── store/
│   │   │   └── notifications.slice.ts   ✏️  MODIFY — data?: any → NotificationPayload
│   │   └── components/
│   │       └── (existing component files — updated import paths only)
│   │
│   ├── authorization/
│   │   └── api/
│   │       └── user.queries.ts    ❌ DELETE — React Query + apiClient; replaced by userApi.ts
│   │   hooks/
│   │       └── useUser.ts         ✏️  MODIFY — update import + hook name suffix
│   │
│   ├── onboarding/
│   │   └── hooks/
│   │       └── useOnboarding.ts   ✏️  MODIFY — update import + hook name suffixes
│   │
│   ├── learning-paths/
│   │   ├── api/
│   │   │   └── learning-paths.queries.ts  ❌ DELETE — React Query + apiClient; replaced by learningPathsApi.ts
│   │   ├── components/
│   │   │   ├── LearningPathsPage.tsx        ✏️  MODIFY — hook rename + import update
│   │   │   ├── LearningPathDetailPage.tsx   ✏️  MODIFY — hook rename + fix `as any` (M-02)
│   │   │   ├── CheckpointPage.tsx           ✏️  MODIFY — hook rename + import update
│   │   │   ├── TaskDetailPage.tsx           ✏️  MODIFY — hook rename + import update
│   │   │   ├── CreateLearningPathPage.tsx   ✏️  MODIFY — fix C-02 deep import path
│   │   │   ├── RoadmapNotificationListener.tsx  ✏️  MODIFY — fix C-02 + M-02 (data?: any)
│   │   │   └── detail-views/
│   │   │       ├── TheoryDetail.tsx         ✏️  MODIFY — hook rename + import update
│   │   │       └── CodingDetail.tsx         ✏️  MODIFY — hook rename + import update
│   │   └── hooks/
│   │       └── useLearningPaths.ts          ✏️  MODIFY — hook rename + mutation API update
│   │
│   ├── register/
│   │   └── components/
│   │       └── RegisterForm.tsx             ✏️  MODIFY — fix C-02 deep import path
│   │
│   ├── progress/
│   │   └── index.ts                         ✏️  MODIFY — add statisticsApi + types exports
│   │
│   ├── dashboard/
│   │   ├── api/
│   │   │   └── learningPathApi.ts           ✏️  MODIFY — fix C-02 deep import path (learning-paths type)
│   │   ├── pages/
│   │   │   └── DashboardPage.tsx            ✏️  MODIFY — fix C-02 deep import path (progress API)
│   │   └── components/
│   │       ├── ActivityCalendar.tsx         ✏️  MODIFY — fix C-02 deep import path
│   │       ├── RecentActivity.tsx           ✏️  MODIFY — fix C-02 deep import path
│   │       ├── StatsGrid.tsx                ✏️  MODIFY — fix 2 deep import paths
│   │       ├── PathCard.tsx                 ✏️  MODIFY — fix C-02 deep import path
│   │       └── ActivePathCard.tsx           ✏️  MODIFY — fix C-02 deep import path
│   │
│   ├── home/
│   │   └── components/
│   │       └── StatisticsSection.tsx        ✏️  MODIFY — fix C-02 deep import path
│   │
│   └── ide/
│       ├── api/
│       │   ├── fsApi.ts                     ❌ DELETE — Axios; replaced by ideProxyApi.ts
│       │   └── ideProxyApi.ts               ➕ CREATE — RTK Query slice for VITE_WS_PROXY_URL
│       ├── components/
│       │   └── EditorArea.tsx               ✏️  MODIFY — migrate to useReadFileQuery hook
│       └── hooks/
│           ├── useFileTree.ts               ✏️  MODIFY — migrate to useFetchFileTreeQuery hook
│           ├── useSearch.ts                 ✏️  MODIFY — migrate to useSearchFilesQuery hook
│           └── useMonacoModels.ts           ✏️  MODIFY — migrate to useWriteFileMutation hook
│
└── (no other src/ directories affected)

package.json   ✏️  MODIFY — uninstall axios, @tanstack/react-query
```

**Structure Decision**: Single React project. No new feature directories added. All changes are within existing feature modules or `src/lib/`.

---

## Phase 0: Research

> See [`research.md`](./research.md) for full findings. Key conclusions below.

### R-01: `src/lib/http.ts` — Safe to delete immediately

**Finding**: Zero `import … from "@/lib/http"` or `"../lib/http"` matches in `src/`. The file's `@deprecated` JSDoc is accurate. RTK Query slices are already the active HTTP mechanism.  
**Action**: Delete in Step 1.

### R-02: `src/lib/api-client.ts` — Callers are exactly learning-paths.queries.ts and user.queries.ts

**Finding**: `grep "api-client"` returned 17 unique match entries across only 2 feature files + the definition itself. Both caller files will be deleted in M-01.  
**Action**: Delete in Step 8 (after M-01 consumer migrations are done in Steps 6–7, after which `api-client.ts` is zero-caller).

### R-03: `src/features/ide/api/fsApi.ts` — Uses VITE_WS_PROXY_URL, no auth

**Finding**: `fsApi.ts` constructs its base URL from `VITE_WS_PROXY_URL` (the WebSocket container proxy), distinct from `VITE_API_BASE_URL` used by `apiSlice`. No auth headers are set or needed. Functions are plain `async` — not hooks. Four internal-only callers all within `src/features/ide/`.  
**Decision**: Create `ideProxyApi.ts` RTK Query slice with a dedicated `fetchBaseQuery({ baseUrl: VITE_WS_PROXY_URL })`. Endpoints: `fetchFileTree` (query), `readFile` (query w/ `responseHandler: 'text'`), `writeFile` (mutation w/ `text/plain` body), `searchFiles` (query). Existing callers migrate to the generated hooks.

### R-04: `learningPathsApi.ts` — Endpoint-complete; all React Query hooks already have RTK equivalents

**Finding**: Every endpoint in `learning-paths.queries.ts` has a direct counterpart in `learningPathsApi.ts` (which already exists and uses `apiSlice.injectEndpoints`). `learningPathsApi.ts` is already exported from `learning-paths/index.ts` as `export * from "./api/learningPathsApi"`.  
**Conclusion**: Migration is purely consumer-side: rename hooks, update argument shapes, swap mutation API pattern. No new endpoints needed.

**Hook name mapping — learning-paths.queries.ts → learningPathsApi.ts:**

| React Query hook (deleted file) | RTK Query hook (learningPathsApi.ts) | Arg shape change |
|--------------------------------|--------------------------------------|-----------------|
| `useGetAllLearningPaths()` | `useGetAllLearningPathsQuery()` | None |
| `useGetLearningPathById(id, opts?)` | `useGetLearningPathByIdQuery(id, opts?)` | None (RTK accepts `skip` option) |
| `useGetCheckpoint(lpId, cpId, opts?)` | `useGetCheckpointQuery({ learningPathId: lpId, checkpointId: cpId }, opts?)` | Args bundled into object |
| `useGetTheoryResource(lpId, itemId, opts?)` | `useGetTheoryResourceQuery({ learningPathId: lpId, itemId }, opts?)` | Args bundled into object |
| `useGetCodingTask(lpId, itemId, opts?)` | `useGetCodingTaskQuery({ learningPathId: lpId, itemId }, opts?)` | Args bundled into object |
| `useGetQuiz(lpId, itemId, opts?)` | `useGetQuizQuery({ learningPathId: lpId, itemId }, opts?)` | Args bundled into object |
| `useCreateLearningPath()` | `useCreateLearningPathMutation()` | — |
| `useUpdateTaskCompletion()` | `useUpdateTaskCompletionMutation()` | — |

**Mutation API change** — React Query pattern vs RTK Query pattern:

```ts
// Before (React Query in useLearningPaths.ts)
const { mutateAsync: createPathMutation, isPending: isCreating } = useCreateLearningPath();
await createPathMutation(data);

// After (RTK Query)
const [createPath, { isLoading: isCreating }] = useCreateLearningPathMutation();
await createPath(data).unwrap();
```

### R-05: `userApi.ts` — Also endpoint-complete; same migration pattern

**Finding**: Every endpoint in `user.queries.ts` has a counterpart in `userApi.ts`. `userApi.ts` is already exported from `authorization/index.ts` as `export * from "./api/userApi"`. The `isProfileNotFoundError` utility function is also already defined in `userApi.ts`.  
**Conclusion**: Delete `user.queries.ts`; update 2 consumer call sites.

**Hook name mapping — user.queries.ts → userApi.ts:**

| React Query hook (deleted file) | RTK Query hook (userApi.ts) | Notes |
|--------------------------------|-----------------------------|-------|
| `useGetUserProfile()` | `useGetUserProfileQuery()` | — |
| `useCreateUser()` | `useCreateUserMutation()` | `mutateAsync` → `.unwrap()` |
| `useUpdateProfile()` | `useUpdateProfileMutation()` | `mutateAsync` → `.unwrap()` |
| `useUploadProfilePhoto()` | `useUploadProfilePhotoMutation()` | `mutateAsync` → `.unwrap()` |

**Consumers:**

- `src/features/authorization/hooks/useUser.ts` — uses `useUpdateProfile` (1 import)
- `src/features/onboarding/hooks/useOnboarding.ts` — uses `useUploadProfilePhoto`, `useCreateUser` (2 imports; also a C-02 violation — import path changes from deep `@/features/authorization/api/user.queries` to `@/features/authorization`)

### R-06: Cross-feature index.ts status (what already exists vs. what must be added)

| Feature | `index.ts` Status | Action Required |
|---------|-------------------|-----------------|
| `authorization` | ✅ exists; already exports `utils/profile-checker` + `api/userApi` | No new exports needed — only consumer import paths must be updated |
| `onboarding` | ✅ exists; already exports `* from "./constants"` | No new exports needed — only consumer import path must be updated |
| `learning-paths` | ✅ exists; already exports `* from "./services/type"` + `* from "./api/learningPathsApi"` | No new exports needed — only consumer import paths must be updated |
| `dashboard` | ✅ exists; already exports `{ StatCard }` | No new exports needed — only consumer import path must be updated |
| `notifications` | ❌ does NOT exist | Must CREATE `index.ts` exporting `addNotification` action + `NotificationPayload` type + notification components |
| `progress` | ⚠️ exists but only exports `ProgressPage` | Must ADD `export * from "./api/statisticsApi"` and `export * from "./types"` |

### R-07: M-02 — Five explicit `any` fixes (violations 6 & 7 auto-resolved via M-01)

| # | File | Fix Strategy |
|---|------|-------------|
| 1 | `src/main.tsx` line 19 — `getWorker(_: any, label: string)` | Change to `_: string` — Monaco `getWorker` first param is `moduleId: string` |
| 2 | `notifications.slice.ts` line 10 — `data?: any` | Define `NotificationPayload` discriminated union in new `notifications/types.ts`; update `NotificationItem.data` field |
| 3 | `RoadmapNotificationListener.tsx` line 13 — `data?: any` | Replace inline `data?: any` in `RoadmapUpdateMessage` interface with `NotificationPayload` |
| 4 | `LearningPathDetailPage.tsx` line 324 — `checkpoints={... as any}` | `LearningPath.checkpoints` is `CheckpointPreview[]`; `CheckpointsTimeline` expects `Checkpoint[]`. Fix: change `CheckpointsTimeline`'s prop type to `CheckpointPreview[]` since the component does not access `Checkpoint`-only fields (`items`, `order`, etc.) |
| 5 | `useDebouncedCallback.ts` line 11 — `<T extends (...args: any[]) => any>` | Change to `<T extends (...args: unknown[]) => unknown>` — compatible with all callers |
| 6 | `user.queries.ts` line 27 — `error: any` | **Auto-resolved**: file deleted in M-01 |
| 7 | `user.queries.ts` line 77 — `(error as any).response?.status` | **Auto-resolved**: file deleted in M-01 |

---

## Phase 1: Design & Contracts

### Data Model Changes

> See [`data-model.md`](./data-model.md) for full entity definitions.

**New types:**

```ts
// src/features/notifications/types.ts (NEW)
export type NotificationPayload =
  | { type: 'roadmap_ready'; roadmapId: string }
  | { type: 'roadmap_progress'; correlationId: string; status: string }
  | { type: 'error'; message: string }
  | Record<string, unknown>;  // escape hatch for unknown server-sent types
```

**Modified types:**

```ts
// notifications.slice.ts — before
data?: any;

// after
data?: NotificationPayload;
```

```ts
// LearningPathDetailPage.tsx — CheckpointsTimeline props (before)
interface CheckpointsTimelineProps {
  checkpoints: Checkpoint[];  // ← wrong; LearningPath.checkpoints is CheckpointPreview[]
  ...
}

// after
interface CheckpointsTimelineProps {
  checkpoints: CheckpointPreview[];
  ...
}
```

**New API slice:**

```ts
// src/features/ide/api/ideProxyApi.ts (NEW)
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { FileNode, SearchResult } from "../types";

export const ideProxyApi = createApi({
  reducerPath: "ideProxy",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_WS_PROXY_URL
      ?.replace("ws://", "http://")
      .replace("wss://", "https://") ?? "http://localhost:8080",
  }),
  endpoints: (builder) => ({
    fetchFileTree: builder.query<FileNode[], string>({
      query: (containerId) => ({ url: "/fs/tree", params: { id: containerId } }),
    }),
    readFile: builder.query<string, { containerId: string; path: string }>({
      query: ({ containerId, path }) => ({
        url: "/fs/file",
        params: { id: containerId, path },
        responseHandler: "text",
      }),
    }),
    writeFile: builder.mutation<void, { containerId: string; path: string; content: string }>({
      query: ({ containerId, path, content }) => ({
        url: "/fs/file",
        method: "POST",
        params: { id: containerId, path },
        body: content,
        headers: { "Content-Type": "text/plain" },
        responseHandler: "text",
      }),
    }),
    searchFiles: builder.query<SearchResult[], { containerId: string; query: string }>({
      query: ({ containerId, query }) => ({
        url: "/fs/search",
        params: { id: containerId, q: query },
      }),
    }),
  }),
});

export const {
  useFetchFileTreeQuery,
  useReadFileQuery,
  useWriteFileMutation,
  useSearchFilesQuery,
} = ideProxyApi;
```

**Store registration** — `ideProxyApi` reducer must be added to `src/store/index.ts`:

```ts
// src/store/index.ts — add to combineReducers / configureStore
import { ideProxyApi } from "@/features/ide/api/ideProxyApi";

export const store = configureStore({
  reducer: {
    ...existingReducers,
    [ideProxyApi.reducerPath]: ideProxyApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      apiSlice.middleware,
      ideProxyApi.middleware,   // ← add this
    ),
});
```

### Contracts

> See [`contracts/migration-map.md`](./contracts/migration-map.md) for the full hook-to-hook and import-path mapping tables used by the implementation agent.

---

## Execution Plan

### Step 1 — Delete `src/lib/http.ts` (C-01, no callers)

**Evidence**: Zero `import … from "@/lib/http"` results in `src/`. File is `@deprecated` with JSDoc.  
**Action**: Delete `src/lib/http.ts`.  
**Verification**: `grep -r "lib/http" src/` returns no results.

---

### Step 2 — Create `src/features/notifications/types.ts` (M-02 prerequisite)

**Action**: Create the file with the `NotificationPayload` discriminated union (see Design section above).

**Rationale for `Record<string, unknown>` escape hatch**: The SignalR server may emit notification types not yet modelled client-side. A final `Record<string, unknown>` arm allows forward compatibility without `any`.

---

### Step 3 — Fix `notifications.slice.ts` `data?: any` (M-02 violation 2)

**Target**: `src/features/notifications/store/notifications.slice.ts` line 10  
**Change**: Add import of `NotificationPayload` from `../types`; replace `data?: any` with `data?: NotificationPayload` in the `NotificationItem` interface.

---

### Step 4 — Fix `RoadmapNotificationListener.tsx` `data?: any` (M-02 violation 3, C-02 violation 3)

**Target**: `src/features/learning-paths/components/RoadmapNotificationListener.tsx`  
**Changes**:

1. Replace `data?: any` in `RoadmapUpdateMessage` with `data?: NotificationPayload` — import from `@/features/notifications` (not the deep path, pre-empting step 8).
2. Update `addNotification` import from `@/features/notifications/store/notifications.slice` → `@/features/notifications` (requires `notifications/index.ts` to exist first — see Step 5).

---

### Step 5 — Create `src/features/notifications/index.ts` (C-02, new file)

**Action**: Create the barrel export file:

```ts
// src/features/notifications/index.ts
export { addNotification, markAsRead, markAllAsRead, removeNotification, clearAllNotifications } from "./store/notifications.slice";
export { default as notificationsReducer } from "./store/notifications.slice";
export type { NotificationItem } from "./store/notifications.slice";
export type { NotificationPayload } from "./types";
```

**Verification**: `RoadmapNotificationListener.tsx`'s updated import from Step 4 now resolves through the public API.

---

### Step 6 — Extend `src/features/progress/index.ts` (C-02)

**Target**: `src/features/progress/index.ts`  
**Current content**: Single line — `export { ProgressPage } from "./pages/ProgressPage";`  
**Add**:

```ts
export * from "./api/statisticsApi";
export type { UserStatistics, ActivityCalendarData, LearningPathProgress } from "./types";
```

**Verification**: `useGetActivityCalendarQuery`, `useGetUserStatisticsQuery`, `useGetLearningPathsProgressQuery`, and the three types are now resolvable from `@/features/progress`.

---

### Step 7 — Migrate `learning-paths.queries.ts` consumers to RTK Query (M-01, C-01 indirect)

This is the largest single step. Seven files consume hooks from `learning-paths.queries.ts`. They must all be updated *before* that file is deleted.

**7a — `src/features/learning-paths/hooks/useLearningPaths.ts`**

- Replace `import { useCreateLearningPath, useUpdateTaskCompletion } from "../api/learning-paths.queries"` with `import { useCreateLearningPathMutation, useUpdateTaskCompletionMutation } from "../api/learningPathsApi"`.
- Update `const { mutateAsync: createPathMutation, isPending: isCreating } = useCreateLearningPath()` to `const [createPath, { isLoading: isCreating }] = useCreateLearningPathMutation()`.
- Update `const { mutateAsync: updateTaskMutation, isPending: isUpdating } = useUpdateTaskCompletion()` to `const [updateTask, { isLoading: isUpdating }] = useUpdateTaskCompletionMutation()`.
- Replace all `await createPathMutation(data)` calls with `await createPath(data).unwrap()`.
- Replace all `await updateTaskMutation(args)` calls with `await updateTask(args).unwrap()`.
- Remove the now-unused `learningPathKeys` import (it was a React Query cache key helper used only inside `learning-paths.queries.ts`).

**7b — `src/features/learning-paths/components/LearningPathsPage.tsx`**

- Replace `import { useGetAllLearningPaths } from "../api/learning-paths.queries"` with `import { useGetAllLearningPathsQuery } from "../api/learningPathsApi"`.
- Rename call site: `useGetAllLearningPaths()` → `useGetAllLearningPathsQuery()`.
- Update destructured properties: `{ isLoading, isError, data }` — RTK Query uses `isLoading`, `isError`, `data` equivalently for queries. No change needed for these specific properties.

**7c — `src/features/learning-paths/components/LearningPathDetailPage.tsx`**

- Replace `import { useGetLearningPathById } from "../api/learning-paths.queries"` with `import { useGetLearningPathByIdQuery } from "../api/learningPathsApi"`.
- Rename call site: `useGetLearningPathById(id, { enabled: !!id })` → `useGetLearningPathByIdQuery(id!, { skip: !id })` (RTK Query uses `skip` instead of `enabled`).
- Fix M-02 violation 4: change `CheckpointsTimeline` prop interface from `checkpoints: Checkpoint[]` to `checkpoints: CheckpointPreview[]` — remove `as any` cast. (Must also update import: `Checkpoint` → `CheckpointPreview` from `../services/type`.)

**7d — `src/features/learning-paths/components/CheckpointPage.tsx`**

- Replace `import { useGetCheckpoint } from "../api/learning-paths.queries"` with `import { useGetCheckpointQuery } from "../api/learningPathsApi"`.
- Rename call site: `useGetCheckpoint(lpId, cpId, { enabled })` → `useGetCheckpointQuery({ learningPathId: lpId, checkpointId: cpId }, { skip: !enabled })`.

**7e — `src/features/learning-paths/components/TaskDetailPage.tsx`**

- Replace `import { useGetCheckpoint as useGetCheckpointDetails } from "../api/learning-paths.queries"` with `import { useGetCheckpointQuery } from "../api/learningPathsApi"`.
- Update call site to use the `{ learningPathId, checkpointId }` object form.

**7f — `src/features/learning-paths/components/detail-views/TheoryDetail.tsx`**

- Replace `import { useGetTheoryResource } from "../../api/learning-paths.queries"` with `import { useGetTheoryResourceQuery } from "../../api/learningPathsApi"`.
- Rename call site with object arg form.

**7g — `src/features/learning-paths/components/detail-views/CodingDetail.tsx`**

- Replace `import { useGetCodingTask } from "../../api/learning-paths.queries"` with `import { useGetCodingTaskQuery } from "../../api/learningPathsApi"`.
- Rename call site with object arg form.

---

### Step 8 — Delete `src/features/learning-paths/api/learning-paths.queries.ts` (M-01, C-01 indirect)

**Pre-condition**: All 7 consumers from Step 7 have been updated.  
**Action**: Delete the file.  
**Verification**: `grep -r "learning-paths.queries" src/` returns no results.

---

### Step 9 — Migrate `user.queries.ts` consumers to RTK Query (M-01, C-01 indirect, C-02)

**9a — `src/features/authorization/hooks/useUser.ts`**

- Replace `import { useUpdateProfile } from "../api/user.queries"` with `import { useUpdateProfileMutation } from "../api/userApi"`.
- Update usage: `const { mutateAsync: updateProfile, isPending } = useUpdateProfile()` → `const [updateProfile, { isLoading: isPending }] = useUpdateProfileMutation()`.
- Replace `await updateProfile(data)` with `await updateProfile(data).unwrap()`.

**9b — `src/features/onboarding/hooks/useOnboarding.ts`** (also C-02 fix)

- Replace `import { useUploadProfilePhoto, useCreateUser } from "@/features/authorization/api/user.queries"` with `import { useUploadProfilePhotoMutation, useCreateUserMutation } from "@/features/authorization"` (path changes from deep path to feature root — C-02 fix).
- Update usage:
  - `const { mutateAsync: uploadPhoto, isPending: isUploadingPhoto } = useUploadProfilePhoto()` → `const [uploadPhoto, { isLoading: isUploadingPhoto }] = useUploadProfilePhotoMutation()`
  - `const { mutateAsync: createUser, isPending: isCreatingUser } = useCreateUser()` → `const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation()`
- Replace `await uploadPhoto(file)` with `await uploadPhoto(file).unwrap()`.
- Replace `await createUser(formData)` with `await createUser(formData).unwrap()`.

---

### Step 10 — Delete `src/features/authorization/api/user.queries.ts` (M-01, C-01 indirect, M-02 auto-fix)

**Pre-condition**: Both consumers from Step 9 have been updated.  
**Action**: Delete the file.  
**Effect**: Also auto-resolves M-02 violations 6 (`error: any`) and 7 (`(error as any).response?.status`) — both resided in this file.  
**Verification**: `grep -r "user.queries" src/` returns no results.

---

### Step 11 — Delete `src/lib/api-client.ts` (C-01)

**Pre-condition**: Steps 8 and 10 complete — `api-client.ts` now has zero callers.  
**Action**: Delete `src/lib/api-client.ts`.  
**Verification**: `grep -r "api-client" src/` returns no results.

---

### Step 12 — Create `src/features/ide/api/ideProxyApi.ts` (C-01)

**Action**: Create the RTK Query slice using the full implementation shown in the Design section above.

**Key implementation details:**

- `baseUrl`: derived from `VITE_WS_PROXY_URL` env var with `ws://` → `http://` protocol swap (same logic as the original `fsApi.ts`)
- `readFile` endpoint uses `responseHandler: "text"` to receive raw text content without JSON parsing
- `writeFile` mutation sends raw string body with `Content-Type: text/plain`
- No auth headers — this proxy does not require authentication

**Store registration**: Add `ideProxyApi.reducer` and `ideProxyApi.middleware` to `src/store/index.ts`.

---

### Step 13 — Migrate `fsApi.ts` callers to `ideProxyApi.ts` hooks (C-01)

**13a — `src/features/ide/hooks/useFileTree.ts`**

- Remove `import { fetchFileTree } from '../api/fsApi'`.
- Add `import { useFetchFileTreeQuery } from '../api/ideProxyApi'`.
- Convert from imperative `const tree = await fetchFileTree(containerId)` to declarative `const { data: tree, isLoading } = useFetchFileTreeQuery(containerId)`.

**13b — `src/features/ide/components/EditorArea.tsx`**

- Remove `import { readFile } from '../api/fsApi'`.
- Add `import { useReadFileQuery } from '../api/ideProxyApi'` (or use lazy query `useLazyReadFileQuery` if reading is triggered on-demand).
- Convert from `const content = await readFile(containerId, path)` to using the hook's `data` field.

**13c — `src/features/ide/hooks/useMonacoModels.ts`**

- Remove `import { writeFile } from '../api/fsApi'`.
- Add `import { useWriteFileMutation } from '../api/ideProxyApi'`.
- Convert from `await writeFile(containerId, path, content)` to `await writeFileMutation({ containerId, path, content }).unwrap()`.

**13d — `src/features/ide/hooks/useSearch.ts`**

- Remove `import { searchFiles } from '../api/fsApi'`.
- Add `import { useLazySearchFilesQuery } from '../api/ideProxyApi'` (lazy query triggered by user input).
- Convert from `const results = await searchFiles(containerId, query)` to using the lazy hook trigger.

---

### Step 14 — Delete `src/features/ide/api/fsApi.ts` (C-01)

**Pre-condition**: All 4 callers from Step 13 have been migrated.  
**Action**: Delete `src/features/ide/api/fsApi.ts`.  
**Verification**: `grep -r "fsApi" src/` returns no results.

---

### Step 15 — Fix remaining C-02 cross-feature import paths (C-02)

Update the 11 remaining files with deep import paths. Most are one-line import path changes:

| File | Old import | New import |
|------|-----------|------------|
| `register/components/RegisterForm.tsx` | `@/features/authorization/utils/profile-checker` | `@/features/authorization` |
| `learning-paths/components/CreateLearningPathPage.tsx` | `@/features/onboarding/constants` | `@/features/onboarding` |
| `dashboard/pages/DashboardPage.tsx` | `@/features/progress/api/statisticsApi` | `@/features/progress` |
| `dashboard/components/ActivityCalendar.tsx` | `@/features/progress/api/statisticsApi` | `@/features/progress` |
| `dashboard/components/RecentActivity.tsx` | `@/features/learning-paths/services/type` | `@/features/learning-paths` |
| `dashboard/components/StatsGrid.tsx` | `@/features/learning-paths/services/type` | `@/features/learning-paths` |
| `dashboard/components/StatsGrid.tsx` | `@/features/progress/types` | `@/features/progress` |
| `dashboard/components/PathCard.tsx` | `@/features/learning-paths/services/type` | `@/features/learning-paths` |
| `dashboard/components/ActivePathCard.tsx` | `@/features/learning-paths/services/type` | `@/features/learning-paths` |
| `dashboard/api/learningPathApi.ts` | `@/features/learning-paths/services/type` | `@/features/learning-paths` |
| `home/components/StatisticsSection.tsx` | `@/features/dashboard/components/StatCard` | `@/features/dashboard` |

**Note on `ide/pages/IdePage.tsx`** (C-02 violation 5 in audit): This file imports from `@/features/learning-paths/api/learningPathsApi`. After Step 7, `learningPathsApi` is already exported from `learning-paths/index.ts` via `export * from "./api/learningPathsApi"`. Update import to `@/features/learning-paths`.

Updated import table (add row):

| File | Old import | New import |
|------|-----------|------------|
| `ide/pages/IdePage.tsx` | `@/features/learning-paths/api/learningPathsApi` | `@/features/learning-paths` |

---

### Step 16 — Fix remaining M-02 `any` violations (M-02 violations 1, 4, 5)

**16a — `src/main.tsx` line 19** (violation 1)

Change `getWorker(_: any, label: string)` to `getWorker(_: string, label: string)`.  
The first parameter is `moduleId: string` in the native Monaco Environment interface. The function already has a `@ts-ignore` directive above it — that directive can be removed if the types resolve cleanly after the fix.

**16b — `src/features/ide/hooks/useDebouncedCallback.ts` line 11** (violation 5)

Change `<T extends (...args: any[]) => any>` to `<T extends (...args: unknown[]) => unknown>`.  
This is a stricter constraint that is still satisfied by all actual callers of `useDebouncedCallback` (which pass typed callbacks, not `any`-typed functions).

**16c — `src/features/learning-paths/components/LearningPathDetailPage.tsx`** (violation 4)

Already handled in Step 7c: `CheckpointsTimeline` prop interface changed from `Checkpoint[]` to `CheckpointPreview[]`, removing the `as any` cast.

---

### Step 17 — Remove packages and `QueryClientProvider` (M-01, C-01)

**17a — Uninstall packages**:

```powershell
npm uninstall axios @tanstack/react-query
```

**17b — Remove `QueryClientProvider` from `src/App.tsx`**:

Remove `import { QueryClient, QueryClientProvider } from "@tanstack/react-query"`, the `queryClient` constant initialization, and the `<QueryClientProvider client={queryClient}>` wrapper. The resulting `App()` function should render:

```tsx
function App() {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SignalRProvider>
          <BasicDataRouter />
        </SignalRProvider>
      </ThemeProvider>
    </Provider>
  );
}
```

---

### Step 18 — Final type-check verification

```powershell
Set-Location "D:\Projects\Project\ui"
npx tsc --noEmit
```

**Expected outcome**: Zero errors. The compiler confirms:

- No imports of deleted files (`http.ts`, `api-client.ts`, `learning-paths.queries.ts`, `user.queries.ts`, `fsApi.ts`)
- No `any` types that the compiler can statically catch
- All renamed hooks resolve to their RTK Query declarations
- `NotificationPayload` type is used correctly wherever `data` appears

**If errors occur**: Resolve them before proceeding to `npm run build`.

```powershell
npm run build
```

**Expected outcome**: Vite build completes without `ERROR` lines.

---

## Complexity Tracking

> No Constitution violations. No architectural deviations. No complexity tickets.

All changes strictly follow §I (feature encapsulation via `index.ts`), §II (RTK Query for all HTTP), §III (named exports for new files), and §V (no `any`). The `ideProxyApi.ts` slice creates a second `createApi` instance — this is permitted by the Constitution because it uses a fundamentally different base URL (the WebSocket proxy) and the two APIs have no shared tags or cache invalidation cross-dependency.
