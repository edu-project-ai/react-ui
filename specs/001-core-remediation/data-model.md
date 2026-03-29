# Data Model: Frontend Core Remediation

**Date**: 2026-03-01  
**Feature**: `fix/001-core-remediation`

---

## New Entities

### `NotificationPayload` (new type)

**File**: `src/features/notifications/types.ts` *(new file)*  
**Purpose**: Typed discriminated union to replace `data?: any` in `NotificationItem` and `RoadmapUpdateMessage`.

```ts
/**
 * Typed payload for notification items.
 * Discriminated by `type` field matching server-sent SignalR message types.
 *
 * Constitution §V: Replaces `data?: any` in notifications.slice.ts and
 * RoadmapNotificationListener.tsx.
 */
export type NotificationPayload =
  | { type: 'roadmap_ready'; roadmapId: string }
  | { type: 'roadmap_progress'; correlationId: string; status: string; percentage?: number }
  | { type: 'roadmap_completed'; correlationId: string; learningPathId: string }
  | { type: 'roadmap_error'; correlationId: string; message: string }
  | { type: 'error'; message: string }
  | Record<string, unknown>;
// Final arm is an escape hatch for forward-compatibility with new server-sent
// types not yet modelled. This avoids `any` while remaining extensible.
```

**Relationships**:

- Used by `NotificationItem.data` in `notifications.slice.ts`
- Used by `RoadmapUpdateMessage.data` in `RoadmapNotificationListener.tsx`

---

### `ideProxyApi` (new RTK Query slice)

**File**: `src/features/ide/api/ideProxyApi.ts` *(new file)*  
**Purpose**: RTK Query slice for the WebSocket container proxy (`VITE_WS_PROXY_URL`). Replaces the Axios-based `fsApi.ts`.

**Endpoints:**

| Endpoint name | Kind | URL | Input | Output |
|--------------|------|-----|-------|--------|
| `fetchFileTree` | `query` | `GET /fs/tree?id={containerId}` | `containerId: string` | `FileNode[]` |
| `readFile` | `query` | `GET /fs/file?id={containerId}&path={path}` | `{ containerId: string; path: string }` | `string` (raw text) |
| `writeFile` | `mutation` | `POST /fs/file?id={containerId}&path={path}` | `{ containerId, path, content: string }` | `void` |
| `searchFiles` | `query` | `GET /fs/search?id={containerId}&q={query}` | `{ containerId: string; query: string }` | `SearchResult[]` |

**Generated hooks**: `useFetchFileTreeQuery`, `useReadFileQuery`, `useLazyReadFileQuery`, `useWriteFileMutation`, `useSearchFilesQuery`, `useLazySearchFilesQuery`

**Store impact**: Requires adding `[ideProxyApi.reducerPath]: ideProxyApi.reducer` and `ideProxyApi.middleware` to `src/store/index.ts`.

---

## Modified Entities

### `NotificationItem` (modified)

**File**: `src/features/notifications/store/notifications.slice.ts`

```ts
// Before
export interface NotificationItem {
  // ...
  data?: any;    // ← violation M-02 #2
}

// After
import type { NotificationPayload } from '../types';

export interface NotificationItem {
  // ...
  data?: NotificationPayload;    // ← typed
}
```

---

### `RoadmapUpdateMessage` (modified)

**File**: `src/features/learning-paths/components/RoadmapNotificationListener.tsx`

```ts
// Before
interface RoadmapUpdateMessage {
  type: "RoadmapProgress" | "RoadmapCompleted" | "RoadmapError" | "RoadmapPreview";
  correlationId: string;
  status: string;
  message: string;
  data?: any;    // ← violation M-02 #3
}

// After
import type { NotificationPayload } from '@/features/notifications';

interface RoadmapUpdateMessage {
  type: "RoadmapProgress" | "RoadmapCompleted" | "RoadmapError" | "RoadmapPreview";
  correlationId: string;
  status: string;
  message: string;
  data?: NotificationPayload;    // ← typed
}
```

---

### `CheckpointsTimelineProps` (modified)

**File**: `src/features/learning-paths/components/LearningPathDetailPage.tsx`

```ts
// Before (incorrect — LearningPath.checkpoints is CheckpointPreview[], not Checkpoint[])
interface CheckpointsTimelineProps {
  checkpoints: Checkpoint[];    // ← caused `as any` cast
  learningPathId: string;
}

// After (aligned with LearningPath type definition)
interface CheckpointsTimelineProps {
  checkpoints: CheckpointPreview[];    // ← matches LearningPath.checkpoints field type
  learningPathId: string;
}
```

**Root cause**: `LearningPath.checkpoints` is typed `CheckpointPreview[]` in `services/type.ts`. The `as any` cast papered over this shape mismatch. The component renders `title`, `description`, `isCompleted`, and `id` — all present in `CheckpointPreview`. No `Checkpoint`-only fields (`items`, `order`, `createdAt`, `updatedAt`) are accessed.

---

### `useDebouncedCallback` generic constraint (modified)

**File**: `src/features/ide/hooks/useDebouncedCallback.ts`

```ts
// Before
export function useDebouncedCallback<T extends (...args: any[]) => any>(

// After
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
```

**Compatibility**: All callers pass typed callbacks. TypeScript's structural typing ensures that a callback typed as `(x: string) => void` satisfies `(...args: unknown[]) => unknown`.

---

### Monaco `getWorker` parameter (modified)

**File**: `src/main.tsx`

```ts
// Before
self.MonacoEnvironment = {
  getWorker(_: any, label: string) {

// After (remove @ts-ignore if possible; if not, retain with a comment)
self.MonacoEnvironment = {
  getWorker(_: string, label: string) {
```

The first parameter is `moduleId: string` in the standard Monaco type. Using `_: string` is correct for an unused-but-typed parameter.

---

## Deleted Entities

| File | Type | Replaced By |
|------|------|-------------|
| `src/lib/http.ts` | Class: `HttpClient` | Already replaced by `apiSlice` / feature RTK Query slices |
| `src/lib/api-client.ts` | Constant: `apiClient` (Axios instance) | Callers migrate to `learningPathsApi` / `userApi` |
| `src/features/learning-paths/api/learning-paths.queries.ts` | React Query hooks + `learningPathKeys` | `learningPathsApi.ts` (already complete) |
| `src/features/authorization/api/user.queries.ts` | React Query hooks + `userKeys` | `userApi.ts` (already complete) |
| `src/features/ide/api/fsApi.ts` | Plain async functions (Axios) | `ideProxyApi.ts` (new RTK Query slice) |

---

## New Files Summary

| File | Purpose |
|------|---------|
| `src/features/notifications/index.ts` | Public barrel export for the `notifications` feature |
| `src/features/notifications/types.ts` | `NotificationPayload` discriminated union type |
| `src/features/ide/api/ideProxyApi.ts` | RTK Query slice for the container proxy API |
