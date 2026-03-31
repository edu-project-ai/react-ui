# Migration Map: React Query → RTK Query

**Feature**: `fix/001-core-remediation`  
**Purpose**: Complete reference for the implementation agent during Steps 7, 9, and 13 — exact hook/function name substitutions, argument shape changes, and import path updates.

---

## Part A: `learning-paths.queries.ts` → `learningPathsApi.ts`

### Import change (all 7 consumer files)

```ts
// OLD import (to all 7 files)
import { hookName } from "../api/learning-paths.queries";
// or deep variant
import { hookName } from "../../api/learning-paths.queries";

// NEW import (use feature barrel — also fixes C-02 for external callers)
import { hookName } from "../api/learningPathsApi";
// or for same-level files
import { hookName } from "../../api/learningPathsApi";
// external feature callers use:
import { hookName } from "@/features/learning-paths";
```

---

### Query hook substitutions

#### `useGetAllLearningPaths` → `useGetAllLearningPathsQuery`

```ts
// Before
const { data, isLoading, isError } = useGetAllLearningPaths();

// After
const { data, isLoading, isError } = useGetAllLearningPathsQuery();
```

No argument or return shape changes. `data` is `LearningPath[] | undefined` in both.

---

#### `useGetLearningPathById` → `useGetLearningPathByIdQuery`

```ts
// Before (React Query)
const { data, isLoading } = useGetLearningPathById(id, { enabled: !!id });

// After (RTK Query)
const { data, isLoading } = useGetLearningPathByIdQuery(id!, { skip: !id });
```

`enabled: false` → `skip: true`. The `id!` non-null assertion is safe because `skip: true` prevents the query from executing when `id` is falsy.

---

#### `useGetCheckpoint` → `useGetCheckpointQuery`

```ts
// Before (React Query — positional args)
const { data, isLoading } = useGetCheckpoint(learningPathId, checkpointId, { enabled });

// After (RTK Query — object arg)
const { data, isLoading } = useGetCheckpointQuery(
  { learningPathId, checkpointId },
  { skip: !enabled }
);
```

---

#### `useGetTheoryResource` → `useGetTheoryResourceQuery`

```ts
// Before
const { data, isLoading } = useGetTheoryResource(learningPathId, itemId, { enabled });

// After
const { data, isLoading } = useGetTheoryResourceQuery(
  { learningPathId, itemId },
  { skip: !enabled }
);
```

---

#### `useGetCodingTask` → `useGetCodingTaskQuery`

```ts
// Before
const { data, isLoading } = useGetCodingTask(learningPathId, itemId, { enabled });

// After
const { data, isLoading } = useGetCodingTaskQuery(
  { learningPathId, itemId },
  { skip: !enabled }
);
```

---

#### `useGetQuiz` → `useGetQuizQuery`

```ts
// Before
const { data, isLoading } = useGetQuiz(learningPathId, itemId, { enabled });

// After
const { data, isLoading } = useGetQuizQuery(
  { learningPathId, itemId },
  { skip: !enabled }
);
```

---

### Mutation hook substitutions

#### `useCreateLearningPath` → `useCreateLearningPathMutation`

```ts
// Before (React Query)
const { mutateAsync: createPathMutation, isPending: isCreating } = useCreateLearningPath();
const result = await createPathMutation(requestData);

// After (RTK Query)
const [createPath, { isLoading: isCreating }] = useCreateLearningPathMutation();
const result = await createPath(requestData).unwrap();
```

**Cache invalidation**: The `onSuccess: () => queryClient.invalidateQueries(...)` in the React Query version is replaced by `invalidatesTags: [{ type: "LearningPath", id: "LIST" }]` already configured in `learningPathsApi.ts:createLearningPath`. No additional action needed.

---

#### `useUpdateTaskCompletion` → `useUpdateTaskCompletionMutation`

```ts
// Before (React Query)
const { mutateAsync: updateTaskMutation, isPending: isUpdating } = useUpdateTaskCompletion();
const result = await updateTaskMutation({ learningPathId, itemId, data });

// After (RTK Query)
const [updateTask, { isLoading: isUpdating }] = useUpdateTaskCompletionMutation();
const result = await updateTask({ learningPathId, itemId, data }).unwrap();
```

**Statistics invalidation**: The React Query version calls `store.dispatch(apiSlice.util.invalidateTags(["Statistics"]))` in `onSuccess`. The RTK Query endpoint in `learningPathsApi.ts` only invalidates `LearningPath` tags. Check if `statisticsApi` entries need to be invalidated — if so, add `"Statistics"` to the `invalidatesTags` in `learningPathsApi.ts:updateTaskCompletion`.

> ⚠️ **Action required during implementation**: Verify whether `updateTaskCompletion` in `learningPathsApi.ts` needs `{ type: "Statistics" }` added to its `invalidatesTags`. If the Statistics dashboard does not auto-refresh after task completion post-migration, add it.

---

## Part B: `user.queries.ts` → `userApi.ts`

### Import change

```ts
// OLD (deep cross-feature import — also C-02 violation)
import { hookName } from "@/features/authorization/api/user.queries";

// NEW (feature barrel — fixes both M-01 and C-02 simultaneously)
import { hookName } from "@/features/authorization";
```

---

### Query hook substitutions

#### `useGetUserProfile` → `useGetUserProfileQuery`

```ts
// Before (React Query)
const { data: user, isLoading, error } = useGetUserProfile();
// React Query retry config was baked into the hook definition in user.queries.ts:
//   retry: (failureCount, error: any) => error?.response?.status === 404 ? false : failureCount < 3

// After (RTK Query)
const { data: user, isLoading, error } = useGetUserProfileQuery();
// RTK Query version in userApi.ts uses apiSlice's baseQueryWithErrorHandling which
// already normalises 404 → { error: { status: 404, data: null } }.
// The 404 short-circuit from user.queries.ts retry config is handled by the
// existing baseQueryWithErrorHandling wrapper. No per-hook retry config needed.
```

---

### Mutation hook substitutions

#### `useCreateUser` → `useCreateUserMutation`

```ts
// Before (React Query)
const { mutateAsync: createUser, isPending: isCreatingUser } = useCreateUser();
const user = await createUser(formData);

// After (RTK Query)
const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();
const user = await createUser(formData).unwrap();
```

---

#### `useUpdateProfile` → `useUpdateProfileMutation`

```ts
// Before (React Query — useUser.ts)
const { mutateAsync: updateProfile, isPending } = useUpdateProfile();
await updateProfile(data);

// After (RTK Query)
const [updateProfile, { isLoading: isPending }] = useUpdateProfileMutation();
await updateProfile(data).unwrap();
```

---

#### `useUploadProfilePhoto` → `useUploadProfilePhotoMutation`

```ts
// Before (React Query — useOnboarding.ts)
const { mutateAsync: uploadPhoto, isPending: isUploadingPhoto } = useUploadProfilePhoto();
const result = await uploadPhoto(file);

// After (RTK Query)
const [uploadPhoto, { isLoading: isUploadingPhoto }] = useUploadProfilePhotoMutation();
const result = await uploadPhoto(file).unwrap();
```

---

### Utility function

`isProfileNotFoundError` exists in both `user.queries.ts` and `userApi.ts`. After deleting `user.queries.ts`, any remaining import of this utility should point to `@/features/authorization` (already exported via `authorization/index.ts → userApi.ts`).

---

## Part C: `fsApi.ts` → `ideProxyApi.ts`

### Import change (all 4 IDE-internal files)

```ts
// OLD
import { fetchFileTree } from '../api/fsApi';
import { readFile } from '../api/fsApi';
import { writeFile } from '../api/fsApi';
import { searchFiles } from '../api/fsApi';

// NEW
import { useFetchFileTreeQuery } from '../api/ideProxyApi';
import { useReadFileQuery, useLazyReadFileQuery } from '../api/ideProxyApi';
import { useWriteFileMutation } from '../api/ideProxyApi';
import { useSearchFilesQuery, useLazySearchFilesQuery } from '../api/ideProxyApi';
```

---

### Function → hook substitutions

#### `fetchFileTree(containerId)` → `useFetchFileTreeQuery(containerId)`

**File**: `ide/hooks/useFileTree.ts`

```ts
// Before (imperative, called inside useEffect/callback)
const tree = await fetchFileTree(containerId);

// After (declarative RTK Query hook)
const { data: tree, isLoading, refetch } = useFetchFileTreeQuery(containerId, {
  skip: !containerId,
});
```

---

#### `readFile(containerId, path)` → `useLazyReadFileQuery`

**File**: `ide/components/EditorArea.tsx`

```ts
// Before (imperative — called on file selection event)
const content = await readFile(containerId, path);

// After (lazy RTK Query — triggered on demand)
const [triggerReadFile] = useLazyReadFileQuery();
// ...
const { data: content } = await triggerReadFile({ containerId, path });
// or:
const result = await triggerReadFile({ containerId, path }).unwrap();
```

---

#### `writeFile(containerId, path, content)` → `useWriteFileMutation`

**File**: `ide/hooks/useMonacoModels.ts`

```ts
// Before
await writeFile(containerId, path, content);

// After
const [writeFile] = useWriteFileMutation();
await writeFile({ containerId, path, content }).unwrap();
```

---

#### `searchFiles(containerId, query)` → `useLazySearchFilesQuery`

**File**: `ide/hooks/useSearch.ts`

```ts
// Before (imperative, triggered by user input)
const results = await searchFiles(containerId, query);

// After (lazy RTK Query)
const [triggerSearch] = useLazySearchFilesQuery();
const results = await triggerSearch({ containerId, query }).unwrap();
```

---

## Part D: Cross-Feature Import Path Updates (C-02)

All 14 deep imports → feature barrel root. No symbol renames in this category (all symbols are already in their feature's `index.ts` or will be after Steps 5–6).

| # | File to edit | Old deep path | New barrel path |
|---|-------------|--------------|----------------|
| 1 | `register/components/RegisterForm.tsx` | `@/features/authorization/utils/profile-checker` | `@/features/authorization` |
| 2 | `onboarding/hooks/useOnboarding.ts` | `@/features/authorization/api/user.queries` | `@/features/authorization` *(handled in Part B above)* |
| 3 | `learning-paths/components/RoadmapNotificationListener.tsx` | `@/features/notifications/store/notifications.slice` | `@/features/notifications` |
| 4 | `learning-paths/components/CreateLearningPathPage.tsx` | `@/features/onboarding/constants` | `@/features/onboarding` |
| 5 | `ide/pages/IdePage.tsx` | `@/features/learning-paths/api/learningPathsApi` | `@/features/learning-paths` |
| 6 | `dashboard/pages/DashboardPage.tsx` | `@/features/progress/api/statisticsApi` | `@/features/progress` |
| 7 | `dashboard/components/ActivityCalendar.tsx` | `@/features/progress/api/statisticsApi` | `@/features/progress` |
| 8 | `dashboard/components/RecentActivity.tsx` | `@/features/learning-paths/services/type` | `@/features/learning-paths` |
| 9 | `dashboard/components/StatsGrid.tsx` (import 1) | `@/features/learning-paths/services/type` | `@/features/learning-paths` |
| 10 | `dashboard/components/StatsGrid.tsx` (import 2) | `@/features/progress/types` | `@/features/progress` |
| 11 | `dashboard/components/PathCard.tsx` | `@/features/learning-paths/services/type` | `@/features/learning-paths` |
| 12 | `dashboard/components/ActivePathCard.tsx` | `@/features/learning-paths/services/type` | `@/features/learning-paths` |
| 13 | `dashboard/api/learningPathApi.ts` | `@/features/learning-paths/services/type` | `@/features/learning-paths` |
| 14 | `home/components/StatisticsSection.tsx` | `@/features/dashboard/components/StatCard` | `@/features/dashboard` |
