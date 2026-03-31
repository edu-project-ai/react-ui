# Contract: Audit Report Document Schema

**Phase**: 1 — Design  
**Date**: 2026-03-01  
**Deliverable**: `frontend-architecture-audit-report.md` (project root)

## Purpose

This contract defines the required structure and content of the audit report document. Any implementation producing `frontend-architecture-audit-report.md` MUST conform to this schema.

---

## Document Structure (Required Sections)

```
# Frontend Architecture Audit Report — Roadly React Frontend
[subtitle line with audit date and branch]

## Executive Summary
[summary table]
[compliance note]

## 🔴 Critical Violations
### C-01: [Category Name]  ([N] files / [N] occurrences)
[findings table]
**Recommendation**: [text]

### C-02: [Category Name]  ([N] files / [N] occurrences)
[findings table]
**Recommendation**: [text]

## 🟡 Medium Violations
### M-01: [Category Name]  ([N] files)
[findings table]
**Recommendation**: [text]

### M-02: [Category Name]  ([N] occurrences / [N] files)
[findings table]
**Recommendation**: [text]

## 🟢 Low Violations
### L-01: [Category Name]  ([N] files)
[findings table]
**Recommendation**: [text]

### L-02: [Category Name]  ([N] files — actionable)
[findings table — actionable subset]
**Recommendation**: [text]

### L-03: [Category Name]  ([N] files — justified/informational)
[findings table — justified subset with justification notes]

## ✅ Compliant Audit Areas
[prose + table]

## Appendix A: Constitution Reference
[per-section cross-reference]
```

---

## Section Contracts

### Executive Summary Table

| Column | Required | Description |
|--------|----------|-------------|
| Severity | ✅ | `🔴 Critical`, `🟡 Medium`, `🟢 Low` |
| Category | ✅ | Violation category name |
| Count | ✅ | Number of violations in this category |
| Status | ✅ | `❌ Violations Found` or `✅ Compliant` |

### Findings Table (per violation category)

Each violation row MUST contain:

| Column | Required | Description |
|--------|----------|-------------|
| File | ✅ | Relative path as a markdown link: `[src/path/file.tsx](src/path/file.tsx)` |
| Line | Optional | 1-based line number if applicable |
| Evidence | ✅ | Exact code snippet (inline code block) |
| Description | ✅ | One-sentence explanation of the violation |

### Recommendation Block

- MUST appear once per violation category
- MUST be prefixed with `**Recommendation:**`
- MUST reference a specific Constitution section (e.g., "per Constitution §II")
- MUST be actionable: describe the exact change required, not just the rule

### Compliant Areas Section

MUST list at minimum:

- Status of Zustand usage (compliant or not)
- Status of SWR / prohibited libraries (compliant or not)
- Confirmation that RTK Query infrastructure is present

---

## Invariants

1. The document MUST render without broken markdown (no unclosed code fences, no invalid link targets).
2. The sum of all violation counts in the Executive Summary MUST equal the total number of violation entries in all findings tables.
3. Every section heading MUST be present even if the finding count is zero (use "No violations found" as the table content).
4. The document MUST be self-contained — a reader with no other context must be able to understand each violation and its fix.
5. The document MUST NOT include any diff, patch, or modified source code — it is a discovery report only.
