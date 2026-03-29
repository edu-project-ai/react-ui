# Feature Specification: Architecture and Code Quality Audit — Roadly React Frontend

**Feature Branch**: `task/001-frontend-arch-audit`  
**Created**: 2026-02-28  
**Status**: Draft  
**Input**: User description: "Architecture and Code Quality Audit of the Roadly React Frontend"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Reviews Critical Violations (Priority: P1)

A developer or tech lead runs the audit tool against the `src/` directory and receives a report listing all **Critical** violations — specifically any direct usage of the deprecated `src/lib/http.ts` module or raw `axios` imports anywhere in the codebase, and any cross-feature deep imports that bypass a feature's `index.ts` public API boundary.

**Why this priority**: Critical violations represent active architectural debt that can cause cascading failures during refactoring or dependency upgrades. Identifying them first ensures the team can prioritise the highest-risk remediation work.

**Independent Test**: Can be fully tested by running the audit scan against the `src/` directory and verifying the output report contains a "Critical" section with file references for Axios and cross-feature import violations.

**Acceptance Scenarios**:

1. **Given** the `src/` directory contains at least one file importing from `src/lib/http.ts` or using `import axios`, **When** the audit completes, **Then** the report lists those files under the "Critical — Deprecated Axios / Raw HTTP" category with file paths.
2. **Given** a feature file imports directly from an internal subfolder of another feature (e.g., `import { X } from '../other-feature/components/SomeComponent'`), **When** the audit completes, **Then** the report lists that import as a Critical encapsulation leak.
3. **Given** no Axios or cross-feature violations exist, **When** the audit completes, **Then** the "Critical" section states "No critical violations found."

---

### User Story 2 - Developer Reviews State Management Compliance (Priority: P2)

A developer receives a report section that identifies whether `zustand` is used outside the permitted `ide` feature scope, and whether any forbidden data-fetching libraries (`react-query`, `swr`, or similar) are present in the codebase or `package.json`.

**Why this priority**: Incorrect state management usage creates inconsistency across the codebase and defeats the enforced RTK Query / Zustand separation defined in the Constitution.

**Independent Test**: Can be tested independently by inspecting the "State Management" section of the report and verifying it lists any out-of-scope Zustand usage or prohibited libraries.

**Acceptance Scenarios**:

1. **Given** a Zustand store or `useStore` import appears in a feature other than `ide/`, **When** the audit completes, **Then** the report flags it as a Medium/Critical violation under "State Management Compliance."
2. **Given** `react-query` or `swr` is listed in `package.json` or imported in any source file, **When** the audit completes, **Then** the report flags its presence under "Prohibited Data-Fetching Libraries."
3. **Given** Zustand is used only within `src/features/ide/`, **When** the audit completes, **Then** no state management violations are reported for that feature.

---

### User Story 3 - Developer Reviews Medium and Low Violations (Priority: P3)

A developer browses the Medium and Low sections of the report to find TypeScript `any` usages, custom `.css` files that should be replaced with Tailwind utility classes, and components or functions using default exports instead of named exports.

**Why this priority**: These violations do not break functionality immediately but accumulate as technical debt and undermine type safety, styling consistency, and code discoverability.

**Independent Test**: Can be tested independently by scanning for `any`, `.css` files outside the allowed exceptions, and `export default` statements, then verifying the report lists them with file links.

**Acceptance Scenarios**:

1. **Given** any TypeScript file contains the token `: any` or `as any`, **When** the audit completes, **Then** the report lists each occurrence under "Medium — TypeScript `any` Usage."
2. **Given** a custom `.css` file exists outside `src/index.css` (the global entry stylesheet), **When** the audit completes, **Then** the report flags it under "Low — Custom CSS Files."
3. **Given** a component or utility function uses `export default`, **When** the audit completes, **Then** the report flags it under "Low — Default Exports."

---

### User Story 4 - Developer Receives Actionable Recommendations (Priority: P2)

For every violation category, the developer reads concrete, Constitution-aligned remediation guidance explaining how to fix the issue — not just what the issue is.

**Why this priority**: A report listing violations without guidance provides limited value. Actionable recommendations allow developers to self-serve fixes without requiring additional discovery work.

**Independent Test**: Can be verified by checking that each violation category in the report is followed by a "Recommendation" sub-section with specific corrective steps.

**Acceptance Scenarios**:

1. **Given** an Axios violation is reported, **When** the developer reads the recommendation, **Then** it explains how to migrate the call to RTK Query following the project's established pattern.
2. **Given** a cross-feature import violation is reported, **When** the developer reads the recommendation, **Then** it explains how to expose the needed functionality via the feature's `index.ts` public API.
3. **Given** a `default export` violation is reported, **When** the developer reads the recommendation, **Then** it explains how to convert to a named export.

---

### Edge Cases

- What happens when the same file violates multiple categories (e.g., uses `axios` AND `any`)? The file MUST appear under each applicable violation category independently.
- What if `src/lib/http.ts` itself is the only reference to Axios (not imported elsewhere)? It MUST still be flagged as a Critical violation since the deprecated file's existence is itself a risk.
- What if a `.css` file is required by a third-party integration? It should be noted in the Low section with a comment that it may be a justified exception, but still listed.
- What if no violations are found in a category? The section MUST still appear in the report with a "No violations found" statement to confirm coverage.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The audit process MUST scan all files within `src/features/`, `src/components/`, `src/store/`, and `src/lib/` recursively.
- **FR-002**: The audit MUST identify every file that imports from `src/lib/http.ts` or contains a direct `import axios` or `require('axios')` statement, and classify these as **Critical** violations.
- **FR-003**: The audit MUST identify any import where a file inside one feature folder (`src/features/[feature-a]/`) imports directly from an internal subfolder of a different feature (`src/features/[feature-b]/[subfolder]/`), bypassing that feature's `index.ts`, and classify these as **Critical** violations.
- **FR-004**: The audit MUST check `package.json` and all source imports for the presence of prohibited data-fetching libraries (`react-query`, `@tanstack/react-query`, `swr`), and report any findings as Medium violations.
- **FR-005**: The audit MUST identify any usage of `zustand` or Zustand stores (`useStore`, `create(`) outside the `src/features/ide/` directory and classify these as Medium violations.
- **FR-006**: The audit MUST detect occurrences of `: any` and `as any` in TypeScript source files and report each as a **Medium** violation with the file path.
- **FR-007**: The audit MUST identify `.css` files present anywhere in `src/` other than `src/index.css` and classify them as **Low** violations.
- **FR-008**: The audit MUST detect `export default` statements in component and utility files, excluding files where a default export is required by the framework (e.g., `React.lazy` targets, route-level pages explicitly configured in the router), and classify them as **Low** violations.
- **FR-009**: The audit result MUST be written to a markdown file named `frontend-architecture-audit-report.md` in the project root directory, structured with violation categories (Critical, Medium, Low) each containing file links and actionable recommendations.
- **FR-010**: The audit MUST NOT modify any source file; it is strictly a read-only discovery process.
- **FR-011**: Each violation entry in the report MUST include: the file path (as a relative link), the violation type, a brief description of what was found, and a recommendation aligned with the Frontend Constitution.
- **FR-012**: The report MUST include an executive summary section at the top with a count of violations per severity level.

### Key Entities

- **Violation**: A single non-conformance finding consisting of a severity level (Critical / Medium / Low), a violation type, the affected file path, a description of the non-conformance, and an actionable recommendation.
- **Audit Report**: A structured markdown document grouping Violations by severity, with an executive summary, per-category violation lists, and a recommendations section. Delivered as `frontend-architecture-audit-report.md` at the project root.
- **Violation Category**: A named grouping of related violations (e.g., "Deprecated Axios Usage", "Cross-Feature Import Leaks", "Prohibited Libraries", "Out-of-Scope Zustand", "TypeScript `any` Usage", "Custom CSS Files", "Default Exports").

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The audit covers 100% of files within the four specified directories (`features/`, `components/`, `store/`, `lib/`) — no subdirectory is skipped.
- **SC-002**: Every Critical violation includes a file path and a Constitution-aligned recommendation; zero Critical violation entries are left without a remediation note.
- **SC-003**: The generated `frontend-architecture-audit-report.md` is present at the project root and is readable without any rendering errors.
- **SC-004**: The audit completes without modifying any file under `src/` — a diff of the working tree after the audit shows zero changes to source files.
- **SC-005**: The report's executive summary accurately reflects the total count of violations per severity level, matching the sum of individual entries in each section.
- **SC-006**: A developer unfamiliar with the codebase can read the report and understand what each violation means and how to fix it, without needing to consult additional documentation.

## Assumptions

- `src/index.css` is the single permitted global stylesheet and is excluded from the "Custom CSS Files" violation check.
- Files in `src/features/ide/` that use Zustand are compliant with the Constitution; Zustand usage in that feature is not a violation.
- `export default` used in files that are direct targets of `React.lazy(() => import(...))` or that are explicitly required as default exports by the router configuration are considered justified and may be noted as informational rather than violations.
- The audit covers `.ts` and `.tsx` files; non-TypeScript assets (images, fonts, JSON) are excluded from TypeScript and export checks.
- `package.json` is included in the prohibited-library scan even if no source file imports the library (presence in dependencies is itself non-compliant).

## Out of Scope

- Fixing any violations discovered — this task is read-only discovery only.
- Adding or modifying tests.
- Auditing files outside the `src/` directory (e.g., `vite.config.ts`, `tailwind.config.js`, CI configuration).
