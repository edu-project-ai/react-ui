# Research: Architecture and Code Quality Audit — Roadly React Frontend

**Phase**: 0 — Pre-Design Research  
**Date**: 2026-03-01  
**Status**: Complete — all NEEDS CLARIFICATION resolved

---

## 1. Dependency Inventory — `package.json` Findings

**Decision**: Treat all four of the following as active audit targets  
**Rationale**: Static analysis of `package.json` reveals several libraries whose presence either violates or requires scrutiny against the Constitution  
**Alternatives considered**: Skipping `package.json` scan and only scanning source files — rejected because the Constitution states that *presence* in dependencies is itself non-compliant even if no source file imports the library yet

| Package | Version | Constitution Status |
|---------|---------|---------------------|
| `axios` | ^1.13.5 | **VIOLATION** — Constitution §II: deprecated; all calls must go through RTK Query |
| `@tanstack/react-query` | ^5.90.21 | **VIOLATION** — Constitution §II: prohibited alternative data-fetching library |
| `@reduxjs/toolkit` | ^2.9.0 | COMPLIANT — RTK Query is the mandated server-state solution |
| `react-redux` | ^9.2.0 | COMPLIANT — RTK setup dependency |
| `zustand` | ^5.0.11 | CONDITIONAL — permitted only within `src/features/ide/`; violations elsewhere are Medium severity |

---

## 2. Deprecated Axios / Raw HTTP Usage

**Decision**: Three files contain direct Axios imports — all are Critical violations  
**Rationale**: Constitution §II explicitly deprecates `src/lib/http.ts` and forbids raw `axios` usage outside RTK Query; `api-client.ts` is an undocumented second Axios wrapper that was not referenced in the deprecation notice but applies the same rule  
**Evidence**:

| File | Violation Detail |
|------|-----------------|
| `src/lib/http.ts` | Declares the deprecated `HttpClient` class; imports `axios` directly. The file itself is the canonical deprecated artefact. |
| `src/lib/api-client.ts` | A second Axios wrapper (`apiClient = axios.create(...)`) with auth interceptors — not referenced in the Constitution but equally non-compliant. |
| `src/features/ide/api/fsApi.ts` | Raw `import axios from 'axios'` inside a feature file; bypasses both RTK Query and the auth interceptors. |

---

## 3. Prohibited Data-Fetching Libraries

**Decision**: `@tanstack/react-query` is actively used in source files — Critical/Medium violation  
**Rationale**: Constitution §II: "Do not introduce alternative data-fetching libraries (e.g., React Query, SWR)." The library is both installed and imported in multiple source files, meaning this is an active architectural non-conformance, not merely a stale dependency.  
**Evidence**:

| File | Usage |
|------|-------|
| `src/App.tsx` | Bootstraps `QueryClient` and `QueryClientProvider` — React Query is wired into the app root |
| `src/features/learning-paths/api/learning-paths.queries.ts` | Uses `useQuery`, `useMutation`, `useQueryClient` from `@tanstack/react-query` |
| `src/features/authorization/api/user.queries.ts` | Uses `useQuery`, `useMutation`, `useQueryClient` from `@tanstack/react-query` |

---

## 4. Cross-Feature Architecture Leaks

**Decision**: Categorise into two sub-types: (A) imports that use another feature's `index.ts` public API (COMPLIANT), and (B) imports that deep-link into a feature's internal folders (VIOLATION)  
**Rationale**: Constitution §I: "If a feature needs to expose functionality to another, it MUST do so through an explicit public API (`src/features/[name]/index.ts`)." Deep imports bypass this contract regardless of whether the target is "the right type" (e.g., a type file or a query hook).  
**Compliant cross-feature imports (via `index.ts`)**:

- `src/features/register/index.tsx` → `@/features/authorization` ✅  
- `src/features/login/pages/LoginPage.tsx` → `@/features/authorization` ✅  
- `src/features/login/components/LoginForm.tsx` → `@/features/authorization` ✅  
- `src/features/callback/index.tsx` → `@/features/authorization` ✅  
- `src/features/email-confirmation/EmailConfirmationPage.tsx` → `@/features/authorization` ✅  
- `src/features/dashboard/pages/DashboardPage.tsx` → `@/features/learning-paths` ✅  

**Non-compliant deep imports (Critical violations)**:

| Importing File | Deep Import Path | Target Feature | Internal Layer Bypassed |
|----------------|-----------------|----------------|------------------------|
| `src/features/register/components/RegisterForm.tsx` | `@/features/authorization/utils/profile-checker` | `authorization` | `/utils/` |
| `src/features/onboarding/hooks/useOnboarding.ts` | `@/features/authorization/api/user.queries` | `authorization` | `/api/` |
| `src/features/learning-paths/components/RoadmapNotificationListener.tsx` | `@/features/notifications/store/notifications.slice` | `notifications` | `/store/` |
| `src/features/learning-paths/components/CreateLearningPathPage.tsx` | `@/features/onboarding/constants` | `onboarding` | `/constants` (root file, not via `index.ts`) |
| `src/features/ide/pages/IdePage.tsx` | `@/features/learning-paths/api/learningPathsApi` | `learning-paths` | `/api/` |
| `src/features/dashboard/pages/DashboardPage.tsx` | `@/features/progress/api/statisticsApi` | `progress` | `/api/` |
| `src/features/dashboard/components/ActivityCalendar.tsx` | `@/features/progress/api/statisticsApi` | `progress` | `/api/` |
| `src/features/dashboard/components/RecentActivity.tsx` | `@/features/learning-paths/services/type` | `learning-paths` | `/services/` |
| `src/features/dashboard/components/StatsGrid.tsx` | `@/features/learning-paths/services/type` | `learning-paths` | `/services/` |
| `src/features/dashboard/components/StatsGrid.tsx` | `@/features/progress/types` | `progress` | `/types` (root file) |
| `src/features/dashboard/components/PathCard.tsx` | `@/features/learning-paths/services/type` | `learning-paths` | `/services/` |
| `src/features/dashboard/components/ActivePathCard.tsx` | `@/features/learning-paths/services/type` | `learning-paths` | `/services/` |
| `src/features/dashboard/api/learningPathApi.ts` | `@/features/learning-paths/services/type` | `learning-paths` | `/services/` |
| `src/features/home/components/StatisticsSection.tsx` | `@/features/dashboard/components/StatCard` | `dashboard` | `/components/` |

---

## 5. Out-of-Scope Zustand Usage

**Decision**: Zustand is used only within `src/features/ide/` — no out-of-scope violations found  
**Rationale**: A single match was found: `src/features/ide/store/useIdeStore.ts` imports `create` from `zustand`. Constitution §II explicitly reserves Zustand for the Web IDE. No Zustand usage exists outside this feature.  
**Evidence**: `grep` across all `src/` files found exactly one match: `src/features/ide/store/useIdeStore.ts:1 — import { create } from 'zustand'`

---

## 6. TypeScript `any` Violations

**Decision**: Filter results to retain only genuine type-safety violations (`: any`, `as any` in type positions); exclude false positives from comments/strings  
**Rationale**: Constitution §V strictly prohibits `any`. The grep output contains some string-literal false positives ("any learning paths") which must be excluded from the report.  
**Confirmed violations**:

| File | Line | Pattern |
|------|------|---------|
| `src/main.tsx` | 19 | `getWorker(_: any, label: string)` — parameter typed as `any` |
| `src/features/notifications/store/notifications.slice.ts` | 10 | `data?: any` — payload field typed as `any` |
| `src/features/learning-paths/components/RoadmapNotificationListener.tsx` | 13 | `data?: any` — inline type declaration |
| `src/features/learning-paths/components/LearningPathDetailPage.tsx` | 324 | `checkpoints as any` — type cast to `any` |
| `src/features/ide/hooks/useDebouncedCallback.ts` | 11 | `(...args: any[]) => any` — generic constraint uses `any` |
| `src/features/authorization/api/user.queries.ts` | 27 | `error: any` — catch handler parameter |
| `src/features/authorization/api/user.queries.ts` | 77 | `(error as any).response` — unsafe cast |

**False positives excluded** (prose in JSX or variable names containing "any"):

- `LearningPathsPage.tsx:47`, `CreateLearningPathPage.tsx:213`, `EmptyState.tsx:32`, `dashboard` content strings

---

## 7. Custom CSS Files

**Decision**: Two CSS files outside the permitted `src/index.css` are violations; both belong to the `ide` feature  
**Rationale**: Constitution §III: "Avoid writing custom `.css` files unless absolutely necessary." The `ide` CSS files may represent the "absolutely necessary" exception for Monaco Editor / xterm.js integration, but must still be flagged as Low violations with a note about potential justification.  
**Evidence**:

| File | Assessment |
|------|-----------|
| `src/features/ide/styles/ide.css` | Low violation — likely Monaco Editor overrides; justify or convert to Tailwind arbitrary values |
| `src/features/ide/components/terminal/Terminal.css` | Low violation — likely xterm.js host styles; third-party integration may justify exception |

---

## 8. Default Export Violations

**Decision**: Classify Redux slice reducers as Low-Informational (conventional pattern), layout-level pages as Low-Justified (router requirement), and all other component default exports as Low-Actionable  
**Rationale**: Constitution §III: "Prefer named exports... Avoid default exports unless strictly required by a specific framework or library." Redux Toolkit's `createSlice().reducer` is conventionally consumed as a default export in `store/reducer` assemblies. Route-level page components may require default exports for `React.lazy`. Direct components serving non-routing purposes have no justification.  

**Low-Actionable (should be converted to named exports)**:

| File | Notes |
|------|-------|
| `src/features/register/components/RegisterForm.tsx` | Pure component, no routing requirement |
| `src/features/features-info/components/FeatureDetail.tsx` | Pure component |
| `src/features/features-info/components/AdditionalFeaturesGrid.tsx` | Pure component |
| `src/features/contact/components/ContactInfoItem.tsx` | Pure component |
| `src/features/contact/components/ContactInfo.tsx` | Pure component |
| `src/features/contact/components/ContactForm.tsx` | Pure component |
| `src/features/about/components/MissionItem.tsx` | Pure component |
| `src/features/about/components/MissionSection.tsx` | Pure component |
| `src/features/about/components/TechStackSection.tsx` | Pure component |
| `src/features/about/components/KeyFeaturesSection.tsx` | Pure component |
| `src/features/authorization/components/AuthLayout.tsx` | Layout component, could be named |
| `src/components/form/FormCheckbox.tsx` | Shared form component |
| `src/components/form/FormPasswordInput.tsx` | Shared form component |
| `src/components/form/FormSelect.tsx` | Shared form component |
| `src/components/form/FormInput.tsx` | Shared form component |
| `src/components/form/FormTextarea.tsx` | Shared form component |
| `src/components/form/FormArrayInput.tsx` | Shared form component |
| `src/components/ui/spinner.tsx` | UI primitive |
| `src/components/Root.tsx` | App root — no default export required |
| `src/components/layout/Navbar/Navbar.tsx` | Layout component |
| `src/components/layout/Header/Header.tsx` | Layout component |
| `src/components/layout/NotFound/NotFound.tsx` | Layout component |
| `src/components/layout/PrivateLayout/PrivateLayout.tsx` | Layout component |
| `src/components/layout/PublicLayout/PublicLayout.tsx` | Layout component |
| `src/components/shared/PageHero/PageHero.tsx` | Shared component |
| `src/components/shared/GoogleButton/GoogleButton.tsx` | Shared component |
| `src/components/shared/FormDivider/FormDivider.tsx` | Shared component |
| `src/components/shared/CTABanner/CTABanner.tsx` | Shared component |
| `src/components/shared/FeatureCard/FeatureCard.tsx` | Shared component |
| `src/features/ide/components/terminal/Terminal.tsx` | Feature component |
| `src/features/dashboard/components/StatCard.tsx` | Feature component |

**Low-Justified (router-driven default exports, flag as informational)**:

| File | Justification |
|------|--------------|
| `src/features/register/index.tsx` | Page-level entry used in router |
| `src/features/onboarding/TechnologiesPage.tsx` | Onboarding page |
| `src/features/onboarding/SkillLevelPage.tsx` | Onboarding page |
| `src/features/onboarding/ProfilePhotoPage.tsx` | Onboarding page |
| `src/features/onboarding/OnboardingWizard.tsx` | Wizard entry |
| `src/features/login/pages/LoginPage.tsx` | Page-level entry used in router |
| `src/features/home/HomePage.tsx` | Page-level entry |
| `src/features/email-confirmation/EmailConfirmationPage.tsx` | Page-level entry |
| `src/features/callback/index.tsx` | Page-level entry |
| `src/features/contact/index.tsx` | Page-level entry |
| `src/features/about/index.tsx` | Page-level entry |
| `src/features/features-info/index.tsx` | Page-level entry |
| `src/features/dashboard/pages/DashboardPage.tsx` | Page in router |
| `src/App.tsx` | Vite app root — default export required |
| `src/routes/BasicDataRouter.tsx` | Router root |

**Low-Informational (Redux slice reducers — conventional pattern)**:

| File |
|------|
| `src/features/onboarding/store/onboarding.slice.ts` |
| `src/features/notifications/store/notifications.slice.ts` |
| `src/features/learning-paths/store/learningPaths.slice.ts` |
| `src/features/authorization/store/user.slice.ts` |

---

## 9. Violation Summary (Pre-Report Count)

| Severity | Category | Count |
|----------|----------|-------|
| Critical | Deprecated Axios / Raw HTTP | 3 files |
| Critical | Cross-Feature Architecture Leaks | 14 import statements across 11 files |
| Medium | Prohibited Data-Fetching Library (`@tanstack/react-query`) | 3 files + `package.json` |
| Medium | TypeScript `any` Usage | 7 occurrences across 6 files |
| Low | Custom CSS Files | 2 files |
| Low | Default Exports (actionable) | 30 files |
| Low | Default Exports (informational/justified) | 19 files |
| ✅ None | Out-of-Scope Zustand | 0 violations |
| ✅ None | Prohibited SWR | 0 violations |

---

*All NEEDS CLARIFICATION items resolved. Research complete. Proceeding to Phase 1.*
