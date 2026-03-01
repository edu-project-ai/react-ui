# Tasks: Architecture and Code Quality Audit — Roadly React Frontend

**Input**: Design documents from `/specs/001-frontend-arch-audit/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Tests**: Not requested — this is a read-only audit task; no test files are created.

**Organization**: Tasks are grouped by user story. Each scan phase is independently executable and produces independently verifiable findings.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different scan targets, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- All grep and file-read operations target `src/` — zero writes to source files

---

## Phase 1: Setup (Scope Validation)

**Purpose**: Confirm all scan targets exist and establish the audit baseline before any scan begins.

- [x] T001 Verify all four scan directories exist (`src/features/`, `src/components/`, `src/store/`, `src/lib/`) and enumerate the total count of `.ts` / `.tsx` files in each
- [x] T002 [P] Read `package.json` and extract the full `dependencies` and `devDependencies` sections for the dependency audit

---

## Phase 2: Foundational (Baseline File Reads)

**Purpose**: Read the three specific files needed as reference points by multiple later scan phases. Must complete before Phase 3+.

**⚠️ CRITICAL**: Cross-feature classification (Phase 3) and default-export classification (Phase 5) depend on the baselines established here.

- [x] T003 Read `src/lib/http.ts` in full — confirm the `@deprecated` JSDoc marker and the `import axios` statement on line 1; record as evidence anchor for C-01
- [x] T004 [P] Read `src/lib/api-client.ts` in full — confirm `axios.create()` usage and auth interceptor; record as evidence anchor for C-01
- [x] T005 [P] Read `src/routes/BasicDataRouter.tsx` in full — extract all page-component entries registered in the router to build the justified-default-export exemption list for Phase 5

**Checkpoint**: Baseline files read — scan phases can now begin

---

## Phase 3: User Story 1 — Critical Violations (Priority: P1) 🎯 MVP

**Goal**: Identify every instance of deprecated Axios / raw HTTP usage and every cross-feature deep import that bypasses a feature's `index.ts` public API.

**Independent Test**: Run Phase 3 tasks only; verify the findings match `research.md §2` (3 Axios files) and `research.md §4` (14 deep imports). If counts match, US1 is complete and independently verifiable.

- [x] T006 [US1] Grep `src/**/*.{ts,tsx}` for `from 'axios'`, `from "axios"`, `require('axios')` — record every match with file path and line number for C-01
- [x] T007 [P] [US1] Grep `src/**/*.{ts,tsx}` for `lib/http` — record all files importing the deprecated `HttpClient` for C-01
- [x] T008 [US1] Grep `src/features/**/*.{ts,tsx}` for cross-feature deep imports matching the pattern `@/features/[a-z-]+/(api|components|hooks|store|utils|services|types|constants)` — record all matches with importing file, import path, target feature, and bypassed layer for C-02
- [x] T009 [US1] For each match found in T008, read the importing file at the matched line to confirm the exact import string and verify it is not importing through an `index` re-export — finalise the C-02 findings table

**Checkpoint**: US1 complete — Critical violation findings independently verifiable against `research.md §2` and `§4`

---

## Phase 4: User Story 2 — State Management Compliance (Priority: P2)

**Goal**: Confirm whether prohibited data-fetching libraries are present/used and whether Zustand is used outside the permitted `src/features/ide/` scope.

**Independent Test**: Run Phase 4 tasks only; verify M-01 finds `@tanstack/react-query` in `package.json` and 3 source files, and verify M-02 (Zustand) finds zero out-of-scope usages. Matches `research.md §3` and `§5`.

- [x] T010 [US2] Inspect `package.json` `dependencies` and `devDependencies` for `@tanstack/react-query`, `react-query`, and `swr` — record presence/absence and exact version strings for M-01
- [x] T011 [P] [US2] Grep `src/**/*.{ts,tsx}` for `@tanstack/react-query` and `from 'swr'` / `from "swr"` — record all source-file matches for M-01
- [x] T012 [P] [US2] Grep `src/**/*.{ts,tsx}` for `from 'zustand'` and `from "zustand"` — filter results to exclude paths containing `/features/ide/` — record any remaining matches as out-of-scope Zustand violations for M-02; if none, record "No violations found"

**Checkpoint**: US2 complete — State management compliance independently verifiable against `research.md §3` and `§5`

---

## Phase 5: User Story 3 — Medium and Low Violations (Priority: P3)

**Goal**: Find all TypeScript `any` occurrences, non-permitted custom CSS files, and default exports that should be named exports.

**Independent Test**: Run Phase 5 tasks only; verify 7 `any` occurrences across 6 files (Medium), 2 CSS files (Low), and ~49 default exports split into actionable/justified/informational buckets. Matches `research.md §6`, `§7`, `§8`.

- [x] T013 [US3] Grep `src/**/*.{ts,tsx}` for `: any`, `as any`, and `any[]` — manually filter out false positives inside JSX string literals and inline comments — record each confirmed violation with file path and line number for M-03
- [x] T014 [P] [US3] Find all `.css` files under `src/` using a recursive glob — exclude `src/index.css` — record remaining files as L-01 violations; note that `ide/` CSS files may be third-party integration exceptions
- [x] T015 [P] [US3] Grep `src/**/*.{ts,tsx}` for `export default` — cross-reference each match against the router entries captured in T005 and against Redux slice files (`*.slice.ts`) — classify each as: **Actionable** (pure component, convert to named export), **Justified** (router page, keep with note), or **Informational** (Redux slice reducer, RTK convention) — record all three buckets for L-02 and L-03

**Checkpoint**: US3 complete — Medium and Low violation findings independently verifiable against `research.md §6`, `§7`, `§8`

---

## Phase 6: User Story 4 — Compile Report with Actionable Recommendations (Priority: P2)

**Goal**: Aggregate all findings from Phases 3–5 into a single, self-contained `frontend-architecture-audit-report.md` at the project root. Every violation category must include a concrete Constitution-aligned remediation note.

**Independent Test**: Report file exists at project root; executive summary violation counts match the sum of entries in each section; every Critical violation entry has a non-empty recommendation; a developer with no prior context can understand each finding.

- [x] T016 [US4] Aggregate findings from T006–T015 into the executive summary table — compute total counts per severity (Critical / Medium / Low) matching the `ViolationSummary` schema from `data-model.md`
- [x] T017 [US4] Write the **Critical violations** sections of `frontend-architecture-audit-report.md` — C-01 (Deprecated Axios / Raw HTTP: 3 files) and C-02 (Cross-Feature Architecture Leaks: 14 imports / 11 files) — each with a per-entry findings table (file link, line, evidence, description) and a `**Recommendation:**` block per Constitution §II and §I respectively
- [x] T018 [P] [US4] Write the **Medium violations** sections — M-01 (`@tanstack/react-query` prohibited library: 4 locations) and M-02 (TypeScript `any`: 7 occurrences / 6 files) — each with findings table and `**Recommendation:**` block per Constitution §II and §V
- [x] T019 [P] [US4] Write the **Low violations** sections — L-01 (Custom CSS Files: 2 files with potential justification notes) and L-02/L-03 (Default Exports: 30 actionable + 19 justified/informational) — each with findings table and `**Recommendation:**` block per Constitution §III
- [x] T020 [US4] Assemble the complete `frontend-architecture-audit-report.md` at project root — prepend executive summary (T016) + title + audit metadata, append Critical (T017) + Medium (T018) + Low (T019) sections + Compliant Areas section (Zustand ✅, SWR ✅, RTK Query infrastructure ✅) + Appendix A (Constitution section cross-reference) — structure per `contracts/audit-report-schema.md`

**Checkpoint**: US4 complete — `frontend-architecture-audit-report.md` exists at project root with all sections populated

---

## Phase 7: Polish & Verification

**Purpose**: Confirm report integrity and that zero source files were modified.

- [x] T021 Open `frontend-architecture-audit-report.md` and verify it renders without broken markdown (no unclosed code fences, no dead relative links, no malformed tables)
- [x] T022 [P] Count violation entries per section in the report — confirm each severity-level total in the executive summary matches the sum of individual entries in that severity's sections (SC-005)
- [x] T023 [P] Run `git diff src/` — confirm the output is empty, verifying that zero files under `src/` were modified during the audit (SC-004 / FR-010)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — confirms scan targets exist before reading specific files
- **US1 – Critical (Phase 3)**: Depends on Phase 2 completion
- **US2 – State Management (Phase 4)**: Depends on Phase 2 completion — can run in parallel with Phase 3
- **US3 – Medium/Low (Phase 5)**: Depends on T005 (Phase 2) for default export classification — can run in parallel with Phases 3 and 4
- **US4 – Report (Phase 6)**: Depends on Phases 3, 4, and 5 all complete
- **Polish (Phase 7)**: Depends on Phase 6 (T020) completion

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — independent of US2/US3
- **US2 (P2)**: Can start after Foundational — independent of US1/US3
- **US3 (P3)**: Can start after T005 (Foundational) — independent of US1/US2
- **US4 (P2)**: Depends on US1 + US2 + US3 complete (needs all scan findings to write report)

### Parallel Opportunities Per Phase

**Phase 1**: T001 and T002 can run in parallel (different targets)

**Phase 2**: T004 and T005 can run in parallel with T003 (independent files)

**Phase 3**: T006 and T007 can run in parallel (different grep patterns, same target set)

**Phase 4**: T011 and T012 can run in parallel (different grep patterns)

**Phase 5**: T014 and T015 can run in parallel (T013 completes first but T014/T015 are independent of T013)

**Phase 6**: T017, T018, and T019 can run in parallel (write different sections); T016 must precede them; T020 must follow all three

**Phase 7**: T022 and T023 can run in parallel (different checks)

---

## Parallel Example: Phase 3 (US1 Critical Scans)

```
# Launch simultaneously:
T006: Grep src/**/*.{ts,tsx} for axios imports
T007: Grep src/**/*.{ts,tsx} for lib/http imports

# Then sequentially:
T008: Grep src/features/**/*.{ts,tsx} for cross-feature deep imports  (depends on T006/T007 context)
T009: Read each flagged importing file to confirm exact evidence  (depends on T008)
```

## Parallel Example: Phase 6 (Report Assembly)

```
# T016 first (executive summary counts)
T016: Aggregate all findings into summary table

# Then simultaneously:
T017: Write Critical sections (C-01, C-02)
T018: Write Medium sections (M-01, M-02)
T019: Write Low sections (L-01, L-02, L-03)

# Then T020 assembles all sections into the final file
T020: Assemble complete frontend-architecture-audit-report.md
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Scope validation
2. Complete Phase 2: Foundational baseline reads
3. Complete Phase 3: US1 — Critical violation scans
4. Write C-01 and C-02 sections of report (partial T017 + T020)
5. **STOP and VALIDATE**: Developer can review Critical findings without waiting for Medium/Low

### Full Audit Delivery (All Stories)

1. Setup + Foundational → baseline confirmed
2. Phases 3 + 4 + 5 in parallel → all scan findings collected
3. Phase 6 → full report written in one pass
4. Phase 7 → integrity verified, task closed

---

## Task Summary

| Phase | Tasks | User Story | Parallelisable |
|-------|-------|------------|----------------|
| Phase 1: Setup | T001–T002 | — | T002 ‖ T001 |
| Phase 2: Foundational | T003–T005 | — | T004 ‖ T005 ‖ T003 |
| Phase 3: Critical Violations | T006–T009 | US1 (P1) | T006 ‖ T007 |
| Phase 4: State Management | T010–T012 | US2 (P2) | T011 ‖ T012 |
| Phase 5: Medium/Low | T013–T015 | US3 (P3) | T014 ‖ T015 |
| Phase 6: Report | T016–T020 | US4 (P2) | T017 ‖ T018 ‖ T019 |
| Phase 7: Polish | T021–T023 | — | T022 ‖ T023 |
| **Total** | **23 tasks** | **4 user stories** | **9 parallel pairs** |
