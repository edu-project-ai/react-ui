# Quickstart: Running the Frontend Architecture Audit

**Task**: `task/001-frontend-arch-audit`  
**Date**: 2026-03-01  
**Output**: `frontend-architecture-audit-report.md` at the project root

---

## Prerequisites

- Working directory: `D:\Projects\Project\ui`
- Active branch: `task/001-frontend-arch-audit`
- No build step required — this is a static analysis pass only
- The audit MUST NOT modify any file under `src/`

---

## Execution Steps (Single Agent Pass)

The audit is performed by an AI agent in a single sequential pass following [plan.md](plan.md). The agent uses only file-read and grep operations against `src/`, then writes one file at the end.

### Step 1 — Scope Validation

```
Verify src/features/, src/components/, src/store/, src/lib/ exist.
Read package.json → extract dependencies section.
Confirm src/index.css exists (CSS exemption).
Confirm src/features/ide/ exists (Zustand exemption scope).
```

### Step 2 — Critical: Axios Scan

```
Grep: src/**/*.{ts,tsx}
Patterns: from 'axios' | from "axios" | require('axios') | lib/http
Expected findings: 3 files (pre-identified in research.md)
```

### Step 3 — Critical: Cross-Feature Import Scan

```
Grep: src/features/**/*.{ts,tsx}
Pattern: from ['"]@/features/[a-z-]+/(api|components|hooks|store|utils|services|types|constants)
Expected findings: 14 deep imports across 11 files (pre-identified in research.md)
```

### Step 4 — Medium: Prohibited Library Scan

```
Check package.json for: @tanstack/react-query, swr
Grep: src/**/*.{ts,tsx} for: @tanstack/react-query | from 'swr' | from "swr"
Expected findings: 3 source files + package.json
```

### Step 5 — Medium: Zustand Scope Scan

```
Grep: src/**/*.{ts,tsx} for: from 'zustand' | from "zustand"
Filter: exclude paths containing /features/ide/
Expected: 0 violations
```

### Step 6 — Medium: TypeScript `any` Scan

```
Grep: src/**/*.{ts,tsx} for: : any\b | as any\b | any\[\]
Filter: exclude JSX string literals and comments
Expected: 7 occurrences across 6 files
```

### Step 7 — Low: CSS File Scan

```
File glob: src/**/*.css
Exclude: src/index.css
Expected: 2 files (both in src/features/ide/)
```

### Step 8 — Low: Default Export Scan

```
Grep: src/**/*.{ts,tsx} for: ^export default
Cross-reference against src/routes/BasicDataRouter.tsx for router-justified exceptions
Expected: 30 actionable + 15 justified + 4 informational
```

### Step 9 — Write Report

```
Aggregate all findings.
Create file: frontend-architecture-audit-report.md (project root).
Structure per contracts/audit-report-schema.md.
```

### Step 10 — Verify

```
Confirm file exists at project root.
Counts in executive summary match research.md §9 summary table.
Confirm zero git diff in src/.
```

---

## Expected Output

```
frontend-architecture-audit-report.md
```

Located at: `D:\Projects\Project\ui\frontend-architecture-audit-report.md`

### Expected Executive Summary (pre-verified totals)

| Severity | Category | Count |
|----------|----------|-------|
| 🔴 Critical | Deprecated Axios / Raw HTTP | 3 files |
| 🔴 Critical | Cross-Feature Architecture Leaks | 14 imports / 11 files |
| 🟡 Medium | Prohibited Library (@tanstack/react-query) | 4 locations |
| 🟡 Medium | TypeScript `any` Usage | 7 occurrences / 6 files |
| 🟢 Low | Custom CSS Files | 2 files |
| 🟢 Low | Default Exports (actionable) | 30 files |
| 🟢 Low | Default Exports (justified/informational) | 19 files |
| ✅ | Out-of-Scope Zustand | 0 violations |
| ✅ | SWR Usage | 0 violations |

---

## Important Constraints

- **DO NOT** modify any file in `src/`
- **DO NOT** run `npm install`, `npm build`, or any compilation step
- **DO NOT** lint or type-check the codebase — use grep/file-read only
- The report is discovery only; remediation is a separate task
