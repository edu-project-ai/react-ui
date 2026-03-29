# Data Model: Architecture and Code Quality Audit

**Phase**: 1 — Design  
**Date**: 2026-03-01

## Core Entities

### 1. `Violation`

Represents a single non-conformance finding.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier, e.g. `C-01-001` (severity prefix + category + index) |
| `severity` | `"Critical" \| "Medium" \| "Low"` | Severity level per Constitution priority |
| `category` | `ViolationCategory` | Named grouping (see below) |
| `filePath` | `string` | Workspace-relative path to the offending file, e.g. `src/features/register/components/RegisterForm.tsx` |
| `lineNumber` | `number \| null` | 1-based line number where the violation occurs; `null` if file-level only |
| `evidence` | `string` | Exact code snippet or description found (1–2 lines) |
| `description` | `string` | Human-readable explanation of why this is a violation |
| `recommendation` | `string` | Actionable remediation step aligned to the Constitution |
| `justified` | `boolean` | `true` for informational findings (e.g., router-required default exports) |
| `justificationNote` | `string \| null` | If `justified`, explains why the pattern is acceptable |

### 2. `ViolationCategory`

Enum of all audit dimensions:

| Value | Severity | Constitution Rule |
|-------|----------|-------------------|
| `DEPRECATED_AXIOS` | Critical | §II — Axios deprecated |
| `CROSS_FEATURE_LEAK` | Critical | §I — Feature boundary encapsulation |
| `PROHIBITED_LIBRARY` | Medium | §II — No React Query / SWR |
| `TYPESCRIPT_ANY` | Medium | §V — No `any` |
| `CUSTOM_CSS` | Low | §III — Tailwind only |
| `DEFAULT_EXPORT` | Low | §III — Named exports preferred |
| `OUT_OF_SCOPE_ZUSTAND` | Medium | §II — Zustand = IDE only |

### 3. `AuditReport`

Top-level document entity.

| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | Report heading |
| `auditDate` | `string` | ISO date |
| `branch` | `string` | Git branch name |
| `constitutionVersion` | `string` | Version string from `constitution.md` |
| `scannedDirectories` | `string[]` | `["src/features", "src/components", "src/store", "src/lib"]` |
| `violations` | `Violation[]` | All findings |
| `summary` | `ViolationSummary` | Aggregated counts |

### 4. `ViolationSummary`

| Field | Type |
|-------|------|
| `criticalCount` | `number` |
| `mediumCount` | `number` |
| `lowCount` | `number` |
| `compliantCategories` | `ViolationCategory[]` |

---

## State Transitions

The report progresses through these states during the audit execution:

```
PENDING → SCANNING → FINDINGS_COLLECTED → REPORT_WRITTEN → VERIFIED
```

- `PENDING`: Plan approved, audit not yet started
- `SCANNING`: Steps 1–8 in progress (file reads and grep operations)
- `FINDINGS_COLLECTED`: All violations identified; report not yet written
- `REPORT_WRITTEN`: `frontend-architecture-audit-report.md` created at project root
- `VERIFIED`: Executive summary counts confirmed; `src/` diff shows zero changes

---

## Validation Rules

- A `Violation` with `severity = "Critical"` MUST have a non-empty `recommendation`.
- A `Violation` with `justified = true` MUST have a non-null `justificationNote`.
- `filePath` MUST be a relative path starting with `src/` or `package.json`.
- `evidence` MUST contain the actual code string found, not a paraphrase.
- Every `ViolationCategory` MUST appear in the report, even if the count is zero.
