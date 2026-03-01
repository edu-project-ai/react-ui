# Implementation Plan: Architecture and Code Quality Audit — Roadly React Frontend

**Branch**: `task/001-frontend-arch-audit` | **Date**: 2026-03-01 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-frontend-arch-audit/spec.md`

## Summary

Perform a read-only static analysis of the Roadly React `src/` directory — specifically `features/`, `components/`, `store/`, and `lib/` — measuring conformance against the Frontend Constitution (v1.1.0). Findings are aggregated into a single `frontend-architecture-audit-report.md` file at the project root, categorised by severity (Critical / Medium / Low), each with file-level evidence and actionable remediation guidance. No source files are modified.

Research has already identified violations across all seven audit dimensions. See [research.md](research.md) for the full pre-scan findings.

## Technical Context

**Language/Version**: TypeScript 5.x / React 18 (Vite project)  
**Primary Dependencies**: `@reduxjs/toolkit` ^2.9, `react-redux` ^9.2, `zustand` ^5.0 (IDE only), `axios` ^1.13 (deprecated — audit target), `@tanstack/react-query` ^5.90 (prohibited — audit target)  
**Storage**: N/A — read-only audit; output is one markdown file  
**Testing**: N/A — this task is discovery only; no test files are created or modified  
**Target Platform**: VS Code / AI agent execution environment (PowerShell, file-system read access)  
**Project Type**: Internal tooling — read-only static analysis pass  
**Performance Goals**: Audit must complete in a single agent pass; no performance threshold required  
**Constraints**: Zero writes to `src/**`; all findings derived from grep/file-read operations; output written only to `frontend-architecture-audit-report.md` at the project root  
**Scale/Scope**: ~50+ feature/component files scanned across 4 directories; ~75 total violations identified in pre-scan research

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

This task is itself an audit of Constitution compliance; the audit workflow produces a read-only report and no source code. It does not introduce new features, libraries, state managers, or API calls, so the standard conformance gates apply to the audit deliverable only.

| Gate | Rule (Constitution Reference) | Status |
|------|-------------------------------|--------|
| Branch naming | `task/` prefix required for audits (§ Workflow §1) | ✅ PASS — branch is `task/001-frontend-arch-audit` |
| No new HTTP library introduced | §II — RTK Query only | ✅ PASS — no API calls made by audit itself |
| No new Zustand usage | §II — IDE only | ✅ PASS — audit uses no state management |
| No custom CSS introduced | §III — Tailwind only | ✅ PASS — no UI produced |
| Named exports | §III — prefer named exports | ✅ PASS — no new components exported |
| TypeScript `any` | §V — prohibited | ✅ PASS — no TypeScript authored by this task |
| Spec-first delivery | §Workflow §2 | ✅ PASS — spec.md authored and reviewed before plan |
| Read-only constraint (FR-010) | Spec FR-010 | ✅ PASS — plan contains zero writes to `src/**` |

**Post-Design Re-Check**: All gates confirmed passing. The audit plan introduces a single new file at the project root (`frontend-architecture-audit-report.md`), which is outside the `src/` subtree and does not violate any Constitution rule.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-frontend-arch-audit/
├── plan.md              ← this file
├── research.md          ← Phase 0 complete: all violations pre-identified
├── data-model.md        ← Phase 1: violation schema and report structure
├── contracts/
│   └── audit-report-schema.md   ← report document contract
├── quickstart.md        ← Phase 1: how to run the audit
└── tasks.md             ← Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root — audit outputs only)

```text
# This task writes exactly ONE file outside src/
frontend-architecture-audit-report.md    ← audit deliverable (project root)

# No files inside src/ are created, modified, or deleted
```

**Structure Decision**: Single-output task. The audit is a read-only pass over `src/features/`, `src/components/`, `src/store/`, and `src/lib/`. The only write operation is creating `frontend-architecture-audit-report.md` at the project root. The `specs/001-frontend-arch-audit/` directory contains all planning artifacts.

---

## Step-by-Step Execution Plan

### Step 1 — Validate Audit Scope and Pre-Conditions

**Goal**: Confirm directory structure and identify all files to be scanned before writing any output.

**Actions**:

1. List all `.ts` and `.tsx` files recursively within `src/features/`, `src/components/`, `src/store/`, and `src/lib/`.
2. Confirm `src/index.css` exists (exempted CSS file).  
3. Confirm `src/features/ide/` exists (exempted Zustand scope).
4. Read `package.json` and extract the `dependencies` and `devDependencies` sections for the dependency audit.
5. Verify that `frontend-architecture-audit-report.md` does NOT already exist at the project root (or note if it does, to be overwritten).

**Read targets**:

- `package.json` (full file)
- `src/lib/http.ts` (confirm deprecated marker)
- `src/lib/api-client.ts` (confirm Axios usage)

**Validation gate**: If any of the four scan directories do not exist, halt and report missing scope.

---

### Step 2 — Audit: Critical Category A — Deprecated Axios / Raw HTTP (FR-002)

**Goal**: Identify every file importing from `src/lib/http.ts` or containing a raw `import axios` / `require('axios')` statement.

**Grep patterns** (applied to `src/**/*.ts`, `src/**/*.tsx`):

- `from 'axios'` or `from "axios"` — direct Axios package import
- `require('axios')` or `require("axios")` — CJS-style Axios import
- `from.*lib/http` or `@/lib/http` — reference to the deprecated HttpClient

**Pre-scan findings** (confirmed in `research.md §2`):

| File | Line | Evidence | Severity |
|------|------|----------|----------|
| `src/lib/http.ts` | 1 | `import axios, { type AxiosInstance, ... } from "axios"` — the deprecated HttpClient itself | **Critical** |
| `src/lib/api-client.ts` | 1 | `import axios from "axios"` — second undocumented Axios wrapper | **Critical** |
| `src/features/ide/api/fsApi.ts` | 1 | `import axios from 'axios'` — raw Axios in a feature file | **Critical** |

**Remediation template** (to appear in report):
> Replace with an RTK Query endpoint defined in `src/store/api/`. For the IDE's `fsApi.ts`, create an `ideApi` RTK Query slice under `src/features/ide/api/ideApi.ts` using `fetchBaseQuery` with the existing auth token interceptor from `token-provider.ts`. Delete `src/lib/http.ts` once all callers are migrated.

---

### Step 3 — Audit: Critical Category B — Cross-Feature Architecture Leaks (FR-003)

**Goal**: Identify every import inside a feature that references an internal subfolder of a different feature, bypassing that feature's `index.ts`.

**Detection logic**:

- A file at `src/features/[feature-a]/...` imports from `@/features/[feature-b]/[anything-other-than-index]`.
- The violation is the path segment *after* the feature name: if it contains `/api/`, `/components/`, `/hooks/`, `/store/`, `/utils/`, `/services/`, `/types`, `/constants`, it is a deep import.
- Imports ending exactly at `@/features/[feature-b]` or `@/features/[feature-b]/index` are COMPLIANT.

**Grep pattern**: `from ['"]@/features/[a-z-]+/(api|components|hooks|store|utils|services|types|constants)`

**Pre-scan findings** (confirmed in `research.md §4`):

| Importing File | Deep Import | Target Feature | Internal Layer | Severity |
|----------------|-------------|----------------|----------------|----------|
| `src/features/register/components/RegisterForm.tsx` | `@/features/authorization/utils/profile-checker` | `authorization` | `/utils/` | **Critical** |
| `src/features/onboarding/hooks/useOnboarding.ts` | `@/features/authorization/api/user.queries` | `authorization` | `/api/` | **Critical** |
| `src/features/learning-paths/components/RoadmapNotificationListener.tsx` | `@/features/notifications/store/notifications.slice` | `notifications` | `/store/` | **Critical** |
| `src/features/learning-paths/components/CreateLearningPathPage.tsx` | `@/features/onboarding/constants` | `onboarding` | root file (not via `index.ts`) | **Critical** |
| `src/features/ide/pages/IdePage.tsx` | `@/features/learning-paths/api/learningPathsApi` | `learning-paths` | `/api/` | **Critical** |
| `src/features/dashboard/pages/DashboardPage.tsx` | `@/features/progress/api/statisticsApi` | `progress` | `/api/` | **Critical** |
| `src/features/dashboard/components/ActivityCalendar.tsx` | `@/features/progress/api/statisticsApi` | `progress` | `/api/` | **Critical** |
| `src/features/dashboard/components/RecentActivity.tsx` | `@/features/learning-paths/services/type` | `learning-paths` | `/services/` | **Critical** |
| `src/features/dashboard/components/StatsGrid.tsx` | `@/features/learning-paths/services/type` | `learning-paths` | `/services/` | **Critical** |
| `src/features/dashboard/components/StatsGrid.tsx` | `@/features/progress/types` | `progress` | `/types` root | **Critical** |
| `src/features/dashboard/components/PathCard.tsx` | `@/features/learning-paths/services/type` | `learning-paths` | `/services/` | **Critical** |
| `src/features/dashboard/components/ActivePathCard.tsx` | `@/features/learning-paths/services/type` | `learning-paths` | `/services/` | **Critical** |
| `src/features/dashboard/api/learningPathApi.ts` | `@/features/learning-paths/services/type` | `learning-paths` | `/services/` | **Critical** |
| `src/features/home/components/StatisticsSection.tsx` | `@/features/dashboard/components/StatCard` | `dashboard` | `/components/` | **Critical** |

**Remediation template** (to appear in report):
> Each target feature must re-export the leaked symbol from its `index.ts`. Example: add `export type { LearningPath } from './services/type'` to `src/features/learning-paths/index.ts`, then update all importers to use `@/features/learning-paths`. For `notifications` store actions dispatched across features, expose a typed dispatch helper or action creator via the `notifications` index.

---

### Step 4 — Audit: Medium Category A — Prohibited Data-Fetching Library (FR-004)

**Goal**: Confirm `@tanstack/react-query` is present in `package.json` and actively used in source files; flag as Medium (active use elevates to near-Critical in practice).

**Detection**:

1. Read `package.json` → confirm `"@tanstack/react-query"` in `dependencies`.
2. Grep `src/**/*.{ts,tsx}` for `@tanstack/react-query`.

**Pre-scan findings** (confirmed in `research.md §3`):

| Location | Evidence | Severity |
|----------|----------|----------|
| `package.json` | `"@tanstack/react-query": "^5.90.21"` in `dependencies` | **Medium** |
| `src/App.tsx` | `import { QueryClient, QueryClientProvider } from "@tanstack/react-query"` | **Medium** |
| `src/features/learning-paths/api/learning-paths.queries.ts` | `import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"` | **Medium** |
| `src/features/authorization/api/user.queries.ts` | `import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"` | **Medium** |

**Remediation template**:
> Migrate React Query usage to RTK Query endpoints. Replace `useQuery` calls with RTK Query `useGet…Query` hooks defined in `src/store/api/` or `src/features/[name]/api/[name]Api.ts`. Remove `QueryClientProvider` from `src/App.tsx` and uninstall `@tanstack/react-query` once all hooks are migrated.

---

### Step 5 — Audit: Medium Category B — Out-of-Scope Zustand (FR-005)

**Goal**: Confirm no Zustand usage exists outside `src/features/ide/`.

**Grep pattern**: `from 'zustand'` or `from "zustand"` across all `src/**/*.{ts,tsx}`, filtering to exclude paths containing `/features/ide/`.

**Pre-scan findings** (confirmed in `research.md §5`):
> **No violations.** Only `src/features/ide/store/useIdeStore.ts` uses Zustand. This is the permitted scope per Constitution §II.

**Report output**: Section present with "No violations found" statement (per spec edge case rule).

---

### Step 6 — Audit: Medium Category C — TypeScript `any` Usage (FR-006)

**Goal**: Find `: any` and `as any` in type positions across all `.ts` and `.tsx` files.

**Grep patterns**: `: any\b`, `as any\b`, `any\[\]` — applied to `src/**/*.{ts,tsx}`.  
**False-positive filter**: Exclude matches inside JSX string literals, template literals, and inline comments (e.g., "any learning paths", "// any step").

**Pre-scan findings** (confirmed in `research.md §6`):

| File | Line | Pattern | Severity |
|------|------|---------|----------|
| `src/main.tsx` | 19 | `getWorker(_: any, label: string)` | **Medium** |
| `src/features/notifications/store/notifications.slice.ts` | 10 | `data?: any` | **Medium** |
| `src/features/learning-paths/components/RoadmapNotificationListener.tsx` | 13 | `data?: any` | **Medium** |
| `src/features/learning-paths/components/LearningPathDetailPage.tsx` | 324 | `checkpoints as any` | **Medium** |
| `src/features/ide/hooks/useDebouncedCallback.ts` | 11 | `(...args: any[]) => any` | **Medium** |
| `src/features/authorization/api/user.queries.ts` | 27 | `error: any` | **Medium** |
| `src/features/authorization/api/user.queries.ts` | 77 | `(error as any).response` | **Medium** |

**Remediation template**:
> Replace `: any` with a specific type or `unknown`. For error handlers, use the pattern `catch (err) { if (err instanceof AxiosError) ... }` or define a typed error union. For `data?: any` in notification payloads, define a discriminated union type in `src/features/notifications/types.ts`.

---

### Step 7 — Audit: Low Category A — Custom CSS Files (FR-007)

**Goal**: Find all `.css` files under `src/` other than `src/index.css`.

**File glob**: `src/**/*.css` — then exclude `src/index.css`.

**Pre-scan findings** (confirmed in `research.md §7`):

| File | Severity | Notes |
|------|----------|-------|
| `src/features/ide/styles/ide.css` | **Low** | Likely Monaco Editor host/override styles |
| `src/features/ide/components/terminal/Terminal.css` | **Low** | Likely xterm.js container styles |

**Remediation template**:
> Evaluate whether each rule can be expressed as a Tailwind arbitrary value or utility class. For third-party DOM targets (Monaco, xterm.js) that cannot be styled via Tailwind props, document the exception inline and annotate with `/* Constitution exception: third-party DOM target, cannot use Tailwind */`. If convertible, replace with `className` Tailwind strings.

---

### Step 8 — Audit: Low Category B — Default Exports (FR-008)

**Goal**: Find all `export default` statements in `.ts` and `.tsx` files. Classify each as:

- **Actionable** — pure components or utilities with no routing requirement
- **Justified** — page-level components consumed via `React.lazy` or explicit router entries
- **Informational** — Redux slice `.reducer` exports (conventional RTK pattern)

**Grep pattern**: `^export default` across `src/**/*.{ts,tsx}`.

**Classification source**: Cross-reference against `src/routes/BasicDataRouter.tsx` to identify which files are router entry points.

**Pre-scan findings** (confirmed in `research.md §8`):

- **30 actionable default exports** — pure components that should use named exports  
  (form components, layout components, shared UI, feature sub-components)
- **15 justified default exports** — router-level pages and `src/App.tsx`  
- **4 informational default exports** — Redux slice reducers (`.slice.ts` files)

*See `research.md §8` for the complete per-file breakdown.*

**Remediation template**:
> Convert actionable default exports to named exports: change `export default function MyComponent` to `export function MyComponent`, or add `export { MyComponent }` alongside removing the `default`. Ensure all importers update from `import MyComponent from '...'` to `import { MyComponent } from '...'`. Redux slice files may retain `export default reducer` per RTK conventions; annotate with `// RTK convention — default export permitted`.

---

### Step 9 — Compile and Write `frontend-architecture-audit-report.md`

**Goal**: Aggregate all findings from Steps 2–8 into a single coherent markdown file at the project root.

**Report structure**:

```
# Frontend Architecture Audit Report — Roadly React Frontend

## Executive Summary
[Table: severity | category | violation count]
[Audit date, branch, Constitution version audited against]

## 🔴 Critical Violations

### C-01: Deprecated Axios / Raw HTTP Usage  (3 files)
[per-file table: file | line | evidence | recommendation]

### C-02: Cross-Feature Architecture Leaks  (14 imports / 11 files)
[per-import table: importing file | deep import | target feature | recommendation]

## 🟡 Medium Violations

### M-01: Prohibited Data-Fetching Library (@tanstack/react-query)  (4 locations)
### M-02: TypeScript `any` Usage  (7 occurrences / 6 files)

## 🟢 Low Violations

### L-01: Custom CSS Files  (2 files)
### L-02: Default Exports — Actionable  (30 files)
### L-03: Default Exports — Justified / Informational  (19 files, noted for awareness)

## ✅ Compliant Areas
- Zustand usage: compliant (restricted to src/features/ide/ only)
- SWR: not installed, not used
- RTK Query: installed and used in store/api/

## Appendix: Constitution Reference
[Links to each relevant Constitution section per violation category]
```

**Write operation**: Single `create_file` call to `D:\Projects\Project\ui\frontend-architecture-audit-report.md`.  
**Zero writes** to any file under `src/` — verified by the absence of `src/` paths in any `replace_string_in_file` or `create_file` call during execution.

---

### Step 10 — Verify Report and Self-Audit

**Goal**: Confirm the report is correct and complete before closing the task.

**Checks**:

1. Confirm `frontend-architecture-audit-report.md` exists at project root.
2. Count violations per severity in the report; verify they match `research.md §9` summary table.
3. Confirm every Critical violation entry contains a file path and a remediation note (SC-002).
4. Run a diff check: confirm zero changes in `src/` directory since the start of the audit.
5. Confirm `frontend-architecture-audit-report.md` renders without broken markdown.

---

## Complexity Tracking

No Constitution violations introduced by this plan. The table is not required.

---

## Data Model

See [data-model.md](data-model.md) for the Violation and AuditReport entity definitions.

## Contracts

See [contracts/audit-report-schema.md](contracts/audit-report-schema.md) for the report document contract.

## Quickstart

See [quickstart.md](quickstart.md) for how to execute this audit in a single agent pass.
