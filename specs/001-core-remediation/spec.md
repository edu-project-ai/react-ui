# Feature Specification: Frontend Core Remediation — Critical & Medium Violation Fix

**Feature Branch**: `fix/001-core-remediation`  
**Created**: 2026-03-01  
**Status**: Draft  
**Reference**: [`frontend-architecture-audit-report.md`](../../frontend-architecture-audit-report.md) — violations C-01, C-02, M-01, M-02

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Eliminate Deprecated HTTP Clients (Priority: P1)

The codebase contains two undocumented Axios wrappers (`src/lib/http.ts` and `src/lib/api-client.ts`) and one direct Axios usage inside a feature (`src/features/ide/api/fsApi.ts`). These prevent safe library upgrades and bypass the established auth pattern. As a developer maintaining this codebase, I need all HTTP communication to go through the single, authorized data-fetching layer so that auth headers, error handling, and caching are consistent everywhere.

**Why this priority**: Highest architectural risk. The deprecated files remain importable, and any new code could accidentally depend on them. `src/lib/api-client.ts` has an auth interceptor that is a parallel, undocumented copy of the RTK Query auth integration.

**Independent Test**: Can be fully tested by verifying `tsc --noEmit` passes after deleting `src/lib/http.ts` and `src/lib/api-client.ts`, with `axios` absent from `package.json` and zero `import axios` strings remaining in `src/`.

**Acceptance Scenarios**:

1. **Given** the project compiles cleanly, **When** `src/lib/http.ts` is deleted, **Then** no other file fails to compile because no file imports it.
2. **Given** `src/lib/api-client.ts` is deleted, **When** the project is built, **Then** all previous callers of `apiClient` have been redirected to RTK Query endpoints and the build succeeds.
3. **Given** `src/features/ide/api/fsApi.ts` previously used a direct Axios call, **When** the feature is used at runtime, **Then** the same file-system API calls succeed via an RTK Query endpoint with the same auth token injection.
4. **Given** `axios` is uninstalled from `package.json`, **When** `npm install` is run, **Then** `axios` does not appear in `node_modules`.
5. **Given** the codebase after this story is complete, **When** a developer searches for `import axios`, **Then** zero results are found in `src/`.

---

### User Story 2 — Fix Cross-Feature Encapsulation Leaks (Priority: P2)

Eleven files reach directly into internal subfolders of other features, bypassing those features' `index.ts` public APIs, causing 14 illegal import paths. As a developer, I need every cross-feature dependency to flow through the owning feature's public `index.ts` so that internal refactors of a feature cannot silently break unrelated parts of the application.

**Why this priority**: Leaky boundaries make future refactoring dangerous — any rename or restructure inside a target feature immediately breaks unrelated importers without a compile error at the boundary.

**Independent Test**: Can be fully tested by verifying that a search for cross-feature deep imports (paths containing another feature's internal subfolder such as `/api/`, `/store/`, `/components/`, `/services/`, `/types`, `/utils/`, `/constants`) targeting a different feature returns zero results, and the project still compiles.

**Acceptance Scenarios**:

1. **Given** `src/features/authorization/index.ts` does not export `checkUserProfileExists` or user query hooks, **When** those symbols are added as named re-exports, **Then** `RegisterForm.tsx` and `useOnboarding.ts` import them via `@/features/authorization` without a subfolder path.
2. **Given** `src/features/notifications/index.ts` does not export the `addNotification` action, **When** it is added as a named re-export, **Then** `RoadmapNotificationListener.tsx` imports it from `@/features/notifications`.
3. **Given** `src/features/onboarding/index.ts` does not export the technology/skill constants, **When** they are surfaced through `index.ts`, **Then** `CreateLearningPathPage.tsx` imports from `@/features/onboarding`.
4. **Given** `learning-paths`, `progress`, and `dashboard` expose required types and hooks through their `index.ts`, **When** the seven `dashboard` component importers are updated, **Then** all deep imports to internal subfolders of those features are eliminated.
5. **Given** the changes above are applied, **When** `tsc --noEmit` is run, **Then** zero type errors are introduced.
6. **Given** the feature boundaries are sealed, **When** a developer searches for any path matching `@/features/<name>/(api|store|services|types|components|utils|constants)/` from a file in a different feature, **Then** zero results remain.

---

### User Story 3 — Remove Prohibited Data-Fetching Library (Priority: P3)

`@tanstack/react-query` is installed and bootstrapped at the application root (`App.tsx`), and two feature files (`learning-paths.queries.ts`, `user.queries.ts`) use its hooks for server state. This creates dual cache management alongside RTK Query. As a developer, I need all server state managed by a single library so there is one source of truth for cache invalidation, loading states, and error handling.

**Why this priority**: React Query is a production dependency affecting the entire component tree, but removal is bounded to two query files and the app bootstrap.

**Independent Test**: Can be fully tested by confirming `@tanstack/react-query` is absent from `package.json` and `node_modules`, `QueryClientProvider` is removed from `App.tsx`, and the two migrated files use RTK Query hooks — all while `npm run build` succeeds and the learning-paths and auth features behave identically.

**Acceptance Scenarios**:

1. **Given** `learning-paths.queries.ts` uses `useQuery`/`useMutation` from React Query, **When** its logic is rewritten using RTK Query endpoints in `learningPathsApi.ts`, **Then** all components consuming those hooks continue to receive the same data shape.
2. **Given** `user.queries.ts` uses `useQuery`/`useMutation`/`useQueryClient` from React Query, **When** its logic is rewritten using RTK Query endpoints in a `userApi.ts` slice, **Then** all components consuming those hooks continue to work correctly.
3. **Given** both query files are migrated, **When** `QueryClientProvider` is removed from `App.tsx`, **Then** the app renders without errors.
4. **Given** `npm uninstall @tanstack/react-query` has been run, **When** the project is built, **Then** no import of `@tanstack/react-query` exists anywhere in `src/`.

---

### User Story 4 — Eliminate TypeScript `any` Usages (Priority: P4)

Six files contain seven occurrences of `: any` or `as any`. As a developer, I need all types to be explicit so the TypeScript compiler catches mismatches at compile time rather than at runtime.

**Why this priority**: Violations are concentrated in a small number of files and are mostly straightforward substitutions. They are lower risk than structural violations above but required by the Constitution.

**Independent Test**: Can be fully tested by running `tsc --noEmit` with strict mode and confirming zero `any`-related suppressions remain, and by searching for `: any` and `as any` patterns in the affected files and finding zero matches.

**Acceptance Scenarios**:

1. **Given** `src/main.tsx` has `getWorker(_: any, label: string)`, **When** the parameter is typed using the `MonacoEnvironment` worker factory signature, **Then** the function still compiles and Monaco loads workers correctly.
2. **Given** `notifications.slice.ts` has `data?: any`, **When** a `NotificationPayload` discriminated union type is defined and applied, **Then** all consumers of the notification payload receive type-safe access to its fields.
3. **Given** `RoadmapNotificationListener.tsx` duplicates the untyped `data?: any` pattern, **When** it is updated to reference the same `NotificationPayload` type, **Then** the local inline type is removed.
4. **Given** `LearningPathDetailPage.tsx` uses `checkpoints={learningPath.checkpoints as any}`, **When** the underlying type mismatch is resolved at the type definition level, **Then** the `as any` cast is removed and the code compiles.
5. **Given** `useDebouncedCallback.ts` uses `<T extends (...args: any[]) => any>`, **When** the `any` constraints are replaced with `unknown`, **Then** the generic still works correctly for all calling sites.
6. **Given** `user.queries.ts` has `error: any` and `(error as any).response?.status`, **When** the error parameter is typed as `unknown` with a type guard, **Then** the retry callback and status access compile without casts.

---

### Edge Cases

- What happens if a caller of `src/lib/api-client.ts` relies on response-transformation logic in the Axios interceptor? The equivalent logic must be replicated in the RTK Query `baseQuery` or `transformResponse` before the file is deleted.
- What happens if `learningPathsApi.ts` is not yet an RTK Query slice? It must be verified as `createApi`-based before targeting it as the M-01 migration destination; if not, a new slice must be created.
- What happens if removing `QueryClientProvider` from `App.tsx` causes a runtime error because a component in the tree still calls `useQueryClient`? A full-text search for React Query hook usage must be completed before the provider is removed.
- What happens if the `checkpoints` type mismatch in `LearningPathDetailPage.tsx` stems from the `Checkpoint` type living in `learning-paths/services/type` (a C-02 violation file)? The C-02 fix (exporting `Checkpoint` through `index.ts`) must be completed before the `as any` cast can be safely removed.

---

## Requirements *(mandatory)*

### Functional Requirements

#### C-01: Axios / HTTP Client Removal

- **FR-001**: The codebase MUST contain zero `import axios` or `import { ... } from "axios"` statements anywhere in `src/` after remediation.
- **FR-002**: `src/lib/http.ts` MUST be deleted from the repository. No file in `src/` may import from it.
- **FR-003**: `src/lib/api-client.ts` MUST be deleted from the repository. All previous callers MUST be redirected to RTK Query endpoints.
- **FR-004**: `src/features/ide/api/fsApi.ts` MUST replace its Axios-based HTTP calls with an RTK Query slice endpoint that injects the same authentication headers.
- **FR-005**: The `axios` package MUST be removed from `package.json` (both `dependencies` and `devDependencies`).

#### C-02: Cross-Feature Encapsulation

- **FR-006**: Each of the six target features (`authorization`, `notifications`, `onboarding`, `learning-paths`, `progress`, `dashboard`) MUST expose all symbols currently imported by other features through its `index.ts` as named exports.
- **FR-007**: All 14 cross-feature deep import paths listed in the audit report MUST be replaced with paths pointing to the owning feature's root `@/features/<name>` (no subfolder segment).
- **FR-008**: No new cross-feature deep imports MAY be introduced as part of this remediation work.

#### M-01: React Query Removal

- **FR-009**: `@tanstack/react-query` MUST be removed from `package.json` `dependencies` and from `node_modules`.
- **FR-010**: `src/features/learning-paths/api/learning-paths.queries.ts` MUST be rewritten to use RTK Query hooks from `learningPathsApi.ts`. All public hook names and return data shapes consumed by other components MUST be preserved.
- **FR-011**: `src/features/authorization/api/user.queries.ts` MUST be rewritten to use RTK Query hooks. All public hook names and return data shapes MUST be preserved.
- **FR-012**: `QueryClientProvider` and `QueryClient` MUST be removed from `src/App.tsx`. The application MUST render without errors after removal.

#### M-02: TypeScript `any` Removal

- **FR-013**: The seven `any` occurrences listed in the audit report (M-02 table, rows 1–7) MUST each be replaced with a specific type, `unknown`, or a properly-constrained generic.
- **FR-014**: A `NotificationPayload` discriminated union type MUST be defined and used for the `data` field in `notifications.slice.ts` and `RoadmapNotificationListener.tsx`, eliminating the duplicated `data?: any` pattern in both files simultaneously.
- **FR-015**: The type mismatch driving the `as any` cast in `LearningPathDetailPage.tsx` MUST be resolved at the type definition level, not suppressed.

#### General Constraints

- **FR-016**: `tsc --noEmit` MUST pass with zero errors after all changes are applied.
- **FR-017**: `npm run build` MUST succeed after all changes are applied.
- **FR-018**: All changes MUST adhere to the Frontend Constitution v1.1.0 (`.specify/memory/constitution.md`). No new violations of any category MAY be introduced.
- **FR-019**: No functionality visible to the end user MAY be altered. Data fetching behaviour, UI rendering, and auth flows MUST remain identical.

### Key Entities

- **RTK Query Slice**: An API slice created with `createApi` / `fetchBaseQuery` — the sole permitted mechanism for server-state fetching after remediation.
- **Feature Public API** (`index.ts`): The single barrel-export file at the root of each feature folder — the only file that cross-feature importers may target.
- **NotificationPayload**: A discriminated union type to be defined in `src/features/notifications/types.ts` representing all possible notification data payloads.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero occurrences of `import axios` or `from "axios"` in `src/` — verified by full-text search returning no results.
- **SC-002**: Zero cross-feature deep imports — verified by a path-pattern search for `@/features/<name>/(api|store|services|types|components|utils|constants)/` from outside the owning feature returning no results.
- **SC-003**: `@tanstack/react-query` absent from `package.json` — verified by `grep react-query package.json` returning no output.
- **SC-004**: Zero `: any` or `as any` occurrences in the six files identified in the audit report — verified by targeted search returning no results.
- **SC-005**: Project build completes without errors — verified by `tsc --noEmit` and `npm run build` both exiting with code 0.
- **SC-006**: No regression in functional behaviour — verified by the application loading in a browser, users being able to log in, learning paths rendering, and the IDE loading without console errors.

---

## Assumptions

- `src/features/ide/api/learningPathsApi.ts` (referenced as migration target for the IDE Axios calls) is an existing RTK Query slice using `createApi`. If it is not, a new RTK Query slice must be created for the IDE's HTTP calls as part of FR-004.
- `src/features/authorization/api/userApi.ts` either already exists as an RTK Query slice or will be created during FR-011; it is distinct from `user.queries.ts`.
- The auth header injection in `src/lib/api-client.ts`'s Axios interceptor (`Authorization: Bearer <token>`) can be replicated via `prepareHeaders` in RTK Query `fetchBaseQuery`, using the existing `tokenProvider` utility at `src/lib/token-provider.ts`.
- The hooks in `learning-paths.queries.ts` (`useGetCodingTaskQuery`, `useGetAllLearningPathsQuery`, etc.) are already present as RTK Query endpoints in `learningPathsApi.ts` — migration is a redirect of callers, not a net-new endpoint implementation. This must be verified during planning.
- Only `@tanstack/react-query` (v5, scoped package) is installed. The non-scoped `react-query` (v3) is not present and does not require uninstalling.

---

## Out of Scope

- **L-01 (Custom CSS)**: The two `ide/` CSS files are not addressed. They are tracked as ongoing technical debt.
- **L-02 / L-03 (Default Exports)**: Converting 43+ files from default to named exports is a separate systematic sweep outside this remediation.
- **Runtime / integration testing**: This spec covers source-level correctness (compilation + static analysis). End-to-end testing against a live backend is outside scope.
- **New feature development**: No new user-facing functionality is introduced. This is purely a structural and compliance fix.
- **Low-severity violations**: L-01, L-02, and L-03 audit categories are excluded.
