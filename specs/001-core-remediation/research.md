# Research: Frontend Core Remediation

**Date**: 2026-03-01  
**Feature**: `fix/001-core-remediation`  
**Purpose**: Pre-scan findings grounding the execution plan in concrete codebase evidence

---

## §1 — C-01: Axios / HTTP Client Inventory

### Decision: `http.ts` → delete immediately (zero callers)

**Rationale**: Full-text search for `"lib/http"` across `src/**/*.{ts,tsx}` returned zero results. The file is annotated `@deprecated` and its 252-line `HttpClient` class is unused. Deletion is safe without any consumer migration.  
**Alternatives considered**: Keeping it as a type reference only — rejected; zero callers means zero value.

### Decision: `api-client.ts` → delete after M-01 consumer migration

**Rationale**: The file is called exclusively by `learning-paths.queries.ts` (7 API calls) and `user.queries.ts` (4 API calls). Both of those files will be deleted as part of the M-01 React Query removal. Once deleted, `api-client.ts` becomes a zero-caller file and can be removed in one step.  
**Alternatives considered**: Migrating `api-client.ts` callers to use it while removing React Query — rejected; the RTK Query slices already cover all 11 endpoints, making `api-client.ts` redundant.

### Decision: `ide/api/fsApi.ts` → replace with RTK Query slice `ideProxyApi.ts`

**Rationale**: `fsApi.ts` uses `VITE_WS_PROXY_URL` (the container WebSocket proxy), not `VITE_API_BASE_URL`. It makes no auth calls. It has 4 internal callers, all within `src/features/ide/`. The Constitution (§II) requires RTK Query for all HTTP. A dedicated `createApi` instance for the proxy is the correct approach — it has a different `reducerPath` and `baseUrl` from the main `apiSlice`.  
**Alternatives considered**:

- Replace with native `fetch()` — rejects Constitution §II intent of centralising HTTP
- Add proxy endpoints to the main `apiSlice` — rejected; different base URL would require a per-endpoint base URL override (messy) and these endpoints have no auth/tag-invalidation relationship with the main API

---

## §2 — C-01: Caller Map (confirmed by live grep)

| File | Import source | Line | Call |
|------|--------------|------|------|
| `learning-paths.queries.ts` | `@/lib/api-client` | 2 | `apiClient.get/post/put` (7 calls) |
| `user.queries.ts` | `@/lib/api-client` | 2 | `apiClient.get/post/put` (4 calls) |
| `ide/components/EditorArea.tsx` | `../api/fsApi` | 12 | `readFile(containerId, path)` |
| `ide/hooks/useSearch.ts` | `../api/fsApi` | 3 | `searchFiles(containerId, query)` |
| `ide/hooks/useMonacoModels.ts` | `../api/fsApi` | 6 | `writeFile(containerId, path, content)` |
| `ide/hooks/useFileTree.ts` | `../api/fsApi` | 3 | `fetchFileTree(containerId)` |

`http.ts` — **zero callers confirmed**.

---

## §3 — C-02: Feature Index Status (confirmed by live file inspection)

| Feature | `index.ts` present? | Already exports needed symbols? | Action |
|---------|---------------------|--------------------------------|--------|
| `authorization` | ✅ Yes | ✅ Yes — `utils/profile-checker` via `export *`, `api/userApi` via `export *` | Update 2 consumer import paths only |
| `onboarding` | ✅ Yes | ✅ Yes — `constants.ts` via `export *` | Update 1 consumer import path only |
| `learning-paths` | ✅ Yes | ✅ Yes — `services/type` via `export *`, `api/learningPathsApi` via `export *` | Update 6 consumer import paths |
| `dashboard` | ✅ Yes | ✅ Yes — `{ StatCard }` exported explicitly | Update 1 consumer import path |
| `notifications` | ❌ No index.ts | N/A — file must be created | Create `index.ts` + `types.ts` |
| `progress` | ⚠️ Minimal — only `ProgressPage` exported | ❌ Missing `statisticsApi` hooks and 3 types | Add 2 export lines |

---

## §4 — M-01: RTK Query Parity Confirmd

Both `learningPathsApi.ts` and `userApi.ts` were read in full. All React Query endpoints have direct RTK Query counterparts:

**`learning-paths.queries.ts` → `learningPathsApi.ts` parity:**

| React Query fn | RTK Query hook | Status |
|---------------|---------------|--------|
| `useGetAllLearningPaths` | `useGetAllLearningPathsQuery` | ✅ |
| `useGetLearningPathById` | `useGetLearningPathByIdQuery` | ✅ |
| `useGetCheckpoint` | `useGetCheckpointQuery` | ✅ (arg shape changes from positional to object) |
| `useGetTheoryResource` | `useGetTheoryResourceQuery` | ✅ (arg shape changes) |
| `useGetCodingTask` | `useGetCodingTaskQuery` | ✅ (arg shape changes) |
| `useGetQuiz` | `useGetQuizQuery` | ✅ (arg shape changes) |
| `useCreateLearningPath` | `useCreateLearningPathMutation` | ✅ (mutation API changes) |
| `useUpdateTaskCompletion` | `useUpdateTaskCompletionMutation` | ✅ (mutation API changes + tags) |

`learningPathsApi.ts` is already barrel-exported from `learning-paths/index.ts`.

**`user.queries.ts` → `userApi.ts` parity:**

| React Query fn | RTK Query hook | Status |
|---------------|---------------|--------|
| `useGetUserProfile` | `useGetUserProfileQuery` | ✅ |
| `useCreateUser` | `useCreateUserMutation` | ✅ |
| `useUpdateProfile` | `useUpdateProfileMutation` | ✅ |
| `useUploadProfilePhoto` | `useUploadProfilePhotoMutation` | ✅ |
| `isProfileNotFoundError` (utility) | `isProfileNotFoundError` (in `userApi.ts`) | ✅ — already there |

`userApi.ts` is already barrel-exported from `authorization/index.ts`.

---

## §5 — M-01: Consumer Map (files that must be updated)

**Consumers of `learning-paths.queries.ts` (7 files):**

| File | Hooks used |
|------|-----------|
| `hooks/useLearningPaths.ts` | `useCreateLearningPath`, `useUpdateTaskCompletion` |
| `components/LearningPathsPage.tsx` | `useGetAllLearningPaths` |
| `components/LearningPathDetailPage.tsx` | `useGetLearningPathById` |
| `components/CheckpointPage.tsx` | `useGetCheckpoint` |
| `components/TaskDetailPage.tsx` | `useGetCheckpoint` (aliased) |
| `components/detail-views/TheoryDetail.tsx` | `useGetTheoryResource` |
| `components/detail-views/CodingDetail.tsx` | `useGetCodingTask` |

**Consumers of `user.queries.ts` (2 files):**

| File | Hooks used | Also a C-02 violation? |
|------|-----------|----------------------|
| `authorization/hooks/useUser.ts` | `useUpdateProfile` | No (in-feature import) |
| `onboarding/hooks/useOnboarding.ts` | `useUploadProfilePhoto`, `useCreateUser` | Yes — import crosses feature boundary |

---

## §6 — M-02: `any` Violation Details

| # | Location | Root Cause | Fix Strategy |
|---|----------|-----------|-------------|
| 1 | `main.tsx:19` `getWorker(_: any, label: string)` | Monaco Environment interface not imported | Change `_: any` → `_: string` (Monaco's `getWorker` signature) |
| 2 | `notifications.slice.ts:10` `data?: any` | No type defined for notification payload | New `NotificationPayload` discriminated union |
| 3 | `RoadmapNotificationListener.tsx:13` `data?: any` | Same; duplicated inline | Use `NotificationPayload` from `notifications/types.ts` |
| 4 | `LearningPathDetailPage.tsx:324` `checkpoints as any` | `LearningPath.checkpoints` typed `CheckpointPreview[]`; component expects `Checkpoint[]` | Change `CheckpointsTimeline` prop to `CheckpointPreview[]` — component does not use `Checkpoint`-only fields |
| 5 | `useDebouncedCallback.ts:11` `any[]` / `any` in generic | Overly-broad constraint | Change to `unknown[]` / `unknown` |
| 6 | `user.queries.ts:27` `error: any` | React Query `retry` callback | **Auto-resolved**: file deleted in M-01 |
| 7 | `user.queries.ts:77` `(error as any).response` | Unsafe HTTP error cast | **Auto-resolved**: file deleted in M-01 |

---

## §7 — M-01: Mutation API Behavioral Change

React Query mutations return `{ mutateAsync, isPending }`. RTK Query mutations return a tuple `[triggerFn, { isLoading }]`. This is a call-site change in 4 files (`useLearningPaths.ts`, `useUser.ts`, `useOnboarding.ts`) that uses mutations. Critical differences:

| Aspect | React Query | RTK Query |
|--------|------------|-----------|
| Hook return | `{ mutateAsync, isPending }` | `[trigger, { isLoading }]` |
| Loading flag | `isPending` | `isLoading` |
| Execute mutation | `await mutateAsync(args)` | `await trigger(args).unwrap()` |
| Error handling | `mutateAsync` rejects on error | `.unwrap()` rejects on error — same behavior |
| Cache invalidation | `queryClient.invalidateQueries(...)` in `onSuccess` | Declarative `invalidatesTags` in endpoint definition — already set in `learningPathsApi.ts` / `userApi.ts` |

The `invalidateQueries` calls in the React Query mutation `onSuccess` callbacks are already covered by the `invalidatesTags` configuration in the RTK Query endpoints, so no additional cache invalidation logic needs to be migrated.

---

## §8 — `ideProxyApi.ts` Design Validation

`fetchBaseQuery` in RTK Query supports all required behaviors:

| `fsApi.ts` behavior | RTK Query mechanism |
|--------------------|--------------------|
| `responseType: 'text'` | `responseHandler: "text"` in endpoint definition |
| `transformResponse: [(d) => d]` (prevent JSON parse) | `responseHandler: "text"` handles this implicitly |
| `headers: { 'Content-Type': 'text/plain' }` | Per-request `headers` in query definition |
| Custom base URL | `fetchBaseQuery({ baseUrl: VITE_WS_PROXY_URL })` |
| No auth headers | No `prepareHeaders` needed |

The existing `EditorArea.tsx` uses `readFile` imperatively inside a callback. The migration to `useLazyReadFileQuery` (lazy RTK Query trigger) preserves this on-demand loading pattern.

---

## §9 — Sequencing Dependencies

Critical ordering constraints identified:

1. **Steps 2–3 before Step 4**: `notifications/types.ts` must exist before `notifications.slice.ts` imports from it.
2. **Step 5 before Step 4**: `notifications/index.ts` must exist before `RoadmapNotificationListener.tsx` imports `addNotification` from `@/features/notifications`.
3. **Step 7 before Step 8**: All 7 `learning-paths.queries.ts` consumers updated before the file is deleted.
4. **Step 9 before Step 10**: Both `user.queries.ts` consumers updated before the file is deleted.
5. **Steps 8 + 10 before Step 11**: `api-client.ts` has zero callers only after both query files are deleted.
6. **Step 12 before Step 13**: `ideProxyApi.ts` must exist before its callers are updated.
7. **Step 13 before Step 14**: All 4 `fsApi.ts` callers migrated before file deletion.
8. **Step 16c**: `LearningPathDetailPage.tsx` `as any` fix is part of Step 7c (same file, same edit pass).
9. **Step 17a (npm uninstall) last**: Package removal happens after all source references are gone.
