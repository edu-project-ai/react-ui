# Frontend Architecture Audit Report — Roadly React Frontend

**Audit Date**: 2026-03-01 | **Branch**: `task/001-frontend-arch-audit` | **Constitution Version**: 1.1.0  
**Scanned Directories**: `src/features/` · `src/components/` · `src/store/` · `src/lib/`  
**Audit Type**: Read-only static analysis — no source files were modified

---

## Executive Summary

| Severity | Category | Count | Status |
|----------|----------|-------|--------|
| 🔴 Critical | Deprecated Axios / Raw HTTP Usage | 3 files | ❌ Violations Found |
| 🔴 Critical | Cross-Feature Architecture Leaks | 14 imports / 11 files | ❌ Violations Found |
| 🟡 Medium | Prohibited Data-Fetching Library (`@tanstack/react-query`) | 4 locations | ❌ Violations Found |
| 🟡 Medium | TypeScript `any` Usage | 7 occurrences / 6 files | ❌ Violations Found |
| 🟢 Low | Custom CSS Files | 2 files | ❌ Violations Found |
| 🟢 Low | Default Exports — Actionable | 43 files | ❌ Violations Found |
| 🟢 Low | Default Exports — Justified / Informational | 8 files | ℹ️ Noted |
| ✅ Compliant | Out-of-Scope Zustand Usage | 0 violations | ✅ Compliant |
| ✅ Compliant | Prohibited SWR Library | 0 violations | ✅ Compliant |

**Total actionable violations: 75 across 6 categories.**  
All Critical violations require immediate remediation before the next release. Medium violations should be addressed in the current sprint. Low violations are tracked as ongoing technical debt.

---

## 🔴 Critical Violations

### C-01: Deprecated Axios / Raw HTTP Usage (3 files)

The Constitution (§II) explicitly deprecates `src/lib/http.ts` and forbids direct `axios` imports in any new or existing feature code. All HTTP requests must be routed exclusively through RTK Query endpoints.

| # | File | Line | Evidence | Description |
|---|------|------|----------|-------------|
| 1 | [src/lib/http.ts](src/lib/http.ts) | 1 | `import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";` | The deprecated `HttpClient` class. Contains `@deprecated` JSDoc but remains in the codebase and importable. |
| 2 | [src/lib/api-client.ts](src/lib/api-client.ts) | 1 | `import axios from "axios";` | A second undocumented Axios wrapper (`apiClient = axios.create(...)`) with auth interceptors. Not referenced in the deprecation notice but equally non-compliant. |
| 3 | [src/features/ide/api/fsApi.ts](src/features/ide/api/fsApi.ts) | 1 | `import axios from 'axios';` | Raw Axios import directly inside a feature file, bypassing both RTK Query and the established auth interceptor pattern. |

**Recommendation** (per Constitution §II):

1. Create an `ideApi` RTK Query slice at `src/features/ide/api/ideApi.ts` using `fetchBaseQuery` (with the `tokenProvider` auth header injection pattern already established in the RTK store) to replace `fsApi.ts`.
2. Migrate all callers of `src/lib/api-client.ts` to the appropriate RTK Query endpoints in `src/store/api/` or feature-level API slices.
3. Once all callers of `src/lib/http.ts` are migrated, delete the file. Until then, prevent new imports by adding `no-restricted-imports` to `eslint.config.js` targeting `lib/http` and `axios`.

---

### C-02: Cross-Feature Architecture Leaks (14 imports / 11 files)

The Constitution (§I) requires that cross-feature dependencies be exposed exclusively through a feature's `index.ts` public API. Any import that reaches into an internal subfolder (`/api/`, `/components/`, `/store/`, `/services/`, `/utils/`, `/types`, `/constants`) of another feature is a direct violation of the encapsulation boundary.

| # | Importing File | Line | Deep Import Path | Target Feature | Bypassed Layer |
|---|----------------|------|-----------------|----------------|----------------|
| 1 | [src/features/register/components/RegisterForm.tsx](src/features/register/components/RegisterForm.tsx) | 13 | `@/features/authorization/utils/profile-checker` | `authorization` | `/utils/` |
| 2 | [src/features/onboarding/hooks/useOnboarding.ts](src/features/onboarding/hooks/useOnboarding.ts) | 6 | `@/features/authorization/api/user.queries` | `authorization` | `/api/` |
| 3 | [src/features/learning-paths/components/RoadmapNotificationListener.tsx](src/features/learning-paths/components/RoadmapNotificationListener.tsx) | 6 | `@/features/notifications/store/notifications.slice` | `notifications` | `/store/` |
| 4 | [src/features/learning-paths/components/CreateLearningPathPage.tsx](src/features/learning-paths/components/CreateLearningPathPage.tsx) | 11 | `@/features/onboarding/constants` | `onboarding` | root file (not via `index.ts`) |
| 5 | [src/features/ide/pages/IdePage.tsx](src/features/ide/pages/IdePage.tsx) | 6 | `@/features/learning-paths/api/learningPathsApi` | `learning-paths` | `/api/` |
| 6 | [src/features/dashboard/pages/DashboardPage.tsx](src/features/dashboard/pages/DashboardPage.tsx) | 6 | `@/features/progress/api/statisticsApi` | `progress` | `/api/` |
| 7 | [src/features/dashboard/components/ActivityCalendar.tsx](src/features/dashboard/components/ActivityCalendar.tsx) | 2 | `@/features/progress/api/statisticsApi` | `progress` | `/api/` |
| 8 | [src/features/dashboard/components/RecentActivity.tsx](src/features/dashboard/components/RecentActivity.tsx) | 2 | `@/features/learning-paths/services/type` | `learning-paths` | `/services/` |
| 9 | [src/features/dashboard/components/StatsGrid.tsx](src/features/dashboard/components/StatsGrid.tsx) | 2 | `@/features/learning-paths/services/type` | `learning-paths` | `/services/` |
| 10 | [src/features/dashboard/components/StatsGrid.tsx](src/features/dashboard/components/StatsGrid.tsx) | 3 | `@/features/progress/types` | `progress` | `/types` root file |
| 11 | [src/features/dashboard/components/PathCard.tsx](src/features/dashboard/components/PathCard.tsx) | 2 | `@/features/learning-paths/services/type` | `learning-paths` | `/services/` |
| 12 | [src/features/dashboard/components/ActivePathCard.tsx](src/features/dashboard/components/ActivePathCard.tsx) | 2 | `@/features/learning-paths/services/type` | `learning-paths` | `/services/` |
| 13 | [src/features/dashboard/api/learningPathApi.ts](src/features/dashboard/api/learningPathApi.ts) | 2 | `@/features/learning-paths/services/type` | `learning-paths` | `/services/` |
| 14 | [src/features/home/components/StatisticsSection.tsx](src/features/home/components/StatisticsSection.tsx) | 3 | `@/features/dashboard/components/StatCard` | `dashboard` | `/components/` |

**Feature boundary exposure gaps identified**:

| Feature | Missing Public Exports (should be in `index.ts`) |
|---------|--------------------------------------------------|
| `authorization` | `checkUserProfileExists` (from `utils/profile-checker`), user query hooks (from `api/user.queries`) |
| `notifications` | `addNotification` action (from `store/notifications.slice`) |
| `onboarding` | technology/skill constants (from `constants.ts`) |
| `learning-paths` | `LearningPath`, `Checkpoint`, `CheckpointDetail`, `CodeItem`, `TheoryItem`, `QuizItem` types; `useGetCodingTaskQuery`, `useGetAllLearningPathsQuery`, `learningPathsApi` hooks |
| `progress` | `useGetActivityCalendarQuery`, `useGetAllStatisticsQuery` hooks; `LearningPathProgress`, `UserStatistics` types |
| `dashboard` | `StatCard` component |

**Recommendation** (per Constitution §I):
For each target feature, add the needed re-exports to its `index.ts`. Examples:

```ts
// src/features/learning-paths/index.ts — add:
export type { LearningPath, Checkpoint, CheckpointDetail } from './services/type';
export { useGetCodingTaskQuery, useGetAllLearningPathsQuery } from './api/learningPathsApi';

// src/features/notifications/index.ts — add:
export { addNotification } from './store/notifications.slice';

// src/features/progress/index.ts — add:
export { useGetActivityCalendarQuery } from './api/statisticsApi';
export type { LearningPathProgress, UserStatistics } from './types';
```

Then update all importers to use `@/features/[feature-name]` without a subfolder path segment.

---

## 🟡 Medium Violations

### M-01: Prohibited Data-Fetching Library — `@tanstack/react-query` (4 locations)

The Constitution (§II) prohibits the introduction of alternative data-fetching libraries. `@tanstack/react-query` is both installed as a production dependency and actively used in feature code, making this an active non-conformance rather than a stale dependency.

| # | Location | Evidence | Description |
|---|----------|----------|-------------|
| 1 | [package.json](package.json) | `"@tanstack/react-query": "^5.90.21"` in `dependencies` | Library present as a production dependency. |
| 2 | [src/App.tsx](src/App.tsx) | `import { QueryClient, QueryClientProvider } from "@tanstack/react-query";` | React Query is bootstrapped at the application root — every component in the tree has access to it. |
| 3 | [src/features/learning-paths/api/learning-paths.queries.ts](src/features/learning-paths/api/learning-paths.queries.ts) | `import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";` | Learning paths server state fetched via React Query instead of RTK Query. |
| 4 | [src/features/authorization/api/user.queries.ts](src/features/authorization/api/user.queries.ts) | `import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";` | User / auth server state fetched via React Query instead of RTK Query. |

**Recommendation** (per Constitution §II):

1. Migrate `learning-paths.queries.ts` hooks to RTK Query endpoints in `src/features/learning-paths/api/learningPathsApi.ts` (this file is already referenced by other parts of the codebase — confirm it uses `createApi`/`fetchBaseQuery`).
2. Migrate `user.queries.ts` hooks to RTK Query endpoints in `src/features/authorization/api/userApi.ts`.
3. Remove `QueryClientProvider` from `src/App.tsx` once all hooks are migrated.
4. Run `npm uninstall @tanstack/react-query` to remove the dependency entirely.

---

### M-02: TypeScript `any` Usage (7 occurrences / 6 files)

The Constitution (§V) strictly prohibits the use of `any`. All types must be explicit.

| # | File | Line | Evidence | Description |
|---|------|------|----------|-------------|
| 1 | [src/main.tsx](src/main.tsx) | 19 | `getWorker(_: any, label: string)` | Monaco Worker factory parameter typed as `any`. |
| 2 | [src/features/notifications/store/notifications.slice.ts](src/features/notifications/store/notifications.slice.ts) | 10 | `data?: any;` | Notification payload `data` field has no type constraint. |
| 3 | [src/features/learning-paths/components/RoadmapNotificationListener.tsx](src/features/learning-paths/components/RoadmapNotificationListener.tsx) | 13 | `data?: any;` | Inline notification data type duplicates the untyped pattern from the slice. |
| 4 | [src/features/learning-paths/components/LearningPathDetailPage.tsx](src/features/learning-paths/components/LearningPathDetailPage.tsx) | 324 | `checkpoints={learningPath.checkpoints as any}` | Type cast used to suppress a type mismatch — the actual prop type is incompatible. |
| 5 | [src/features/ide/hooks/useDebouncedCallback.ts](src/features/ide/hooks/useDebouncedCallback.ts) | 11 | `<T extends (...args: any[]) => any>` | Generic constraint uses `any` instead of `unknown`. |
| 6 | [src/features/authorization/api/user.queries.ts](src/features/authorization/api/user.queries.ts) | 27 | `error: any` | React Query `retry` callback parameter is untyped. |
| 7 | [src/features/authorization/api/user.queries.ts](src/features/authorization/api/user.queries.ts) | 77 | `(error as any).response?.status` | Unsafe cast to read HTTP error response status. |

**Recommendation** (per Constitution §V):

- **Notification payload** (violations 2 & 3): Define a discriminated union in `src/features/notifications/types.ts`:

  ```ts
  export type NotificationPayload = { type: 'roadmap_ready'; roadmapId: string } | { type: 'error'; message: string };
  ```

- **Error handlers** (violations 6 & 7): Use `unknown` with a type guard:

  ```ts
  function isApiError(e: unknown): e is { response: { status: number } } {
    return typeof e === 'object' && e !== null && 'response' in e;
  }
  ```

- **Generic constraint** (violation 5): Replace `any[]` with `unknown[]` or a specific tuple type.
- **Monaco worker** (violation 1): Use the `MonacoEnvironment` type from `@monaco-editor/react` for the worker factory signature.
- **Type cast** (violation 4): Fix the underlying type mismatch in the `checkpoints` prop rather than casting.

---

## 🟢 Low Violations

### L-01: Custom CSS Files (2 files)

The Constitution (§III) requires Tailwind CSS as the mandatory styling engine and advises against custom `.css` files unless absolutely necessary. Two CSS files were found in `src/` outside the permitted global entry stylesheet (`src/index.css`). Both belong to the `ide` feature and likely exist to style third-party DOM targets (Monaco Editor / xterm.js) that cannot be styled via Tailwind props.

| # | File | Notes |
|---|------|-------|
| 1 | [src/features/ide/styles/ide.css](src/features/ide/styles/ide.css) | Likely Monaco Editor host/override styles. Third-party DOM target — potential justified exception. |
| 2 | [src/features/ide/components/terminal/Terminal.css](src/features/ide/components/terminal/Terminal.css) | Likely xterm.js container styles. Third-party DOM target — potential justified exception. |

**Recommendation** (per Constitution §III):

1. Review each rule in both files. Any rule targeting a first-party wrapper element (e.g., `div.ide-container`) should be replaced with Tailwind utility classes.
2. Any rule that must target a third-party DOM element injected by Monaco or xterm.js (where Tailwind `className` cannot reach) should be retained and annotated:

   ```css
   /* Constitution §III exception: third-party DOM injection target (xterm.js).
      Cannot be styled via Tailwind className prop. Approved 2026-03-01. */
   ```

3. If all remaining rules are justified exceptions, document this in a `/* eslint-disable … */`-style block comment at the top of each file.

---

### L-02: Default Exports — Actionable (43 files)

The Constitution (§III) requires named exports for all components and functions. The following files use `export default` where a named export is both possible and preferred. None of these files are consumed via a default import in the router; they are either re-exported as named symbols via `@/features/index.ts` or are pure shared components.

<details>
<summary>Feature Components (31 files) — click to expand</summary>

| File | Line | Evidence |
|------|------|----------|
| [src/features/register/index.tsx](src/features/register/index.tsx) | 16 | `export default RegisterPage;` |
| [src/features/register/components/RegisterForm.tsx](src/features/register/components/RegisterForm.tsx) | 26 | `export default function RegisterForm()` |
| [src/features/onboarding/TechnologiesPage.tsx](src/features/onboarding/TechnologiesPage.tsx) | 274 | `export default TechnologiesPage;` |
| [src/features/onboarding/SkillLevelPage.tsx](src/features/onboarding/SkillLevelPage.tsx) | 161 | `export default SkillLevelPage;` |
| [src/features/onboarding/ProfilePhotoPage.tsx](src/features/onboarding/ProfilePhotoPage.tsx) | 191 | `export default ProfilePhotoPage;` |
| [src/features/onboarding/OnboardingWizard.tsx](src/features/onboarding/OnboardingWizard.tsx) | 148 | `export default OnboardingWizard;` |
| [src/features/login/pages/LoginPage.tsx](src/features/login/pages/LoginPage.tsx) | 16 | `export default LoginPage;` |
| [src/features/login/components/LoginForm.tsx](src/features/login/components/LoginForm.tsx) | 19 | `export default function LoginForm()` |
| [src/features/ide/components/terminal/Terminal.tsx](src/features/ide/components/terminal/Terminal.tsx) | 109 | `export default Terminal;` |
| [src/features/home/HomePage.tsx](src/features/home/HomePage.tsx) | 66 | `export default HomePage;` |
| [src/features/features-info/index.tsx](src/features/features-info/index.tsx) | 155 | `export default FeaturesInfoPage;` |
| [src/features/features-info/components/FeatureDetail.tsx](src/features/features-info/components/FeatureDetail.tsx) | 45 | `export default function FeatureDetail(...)` |
| [src/features/features-info/components/AdditionalFeaturesGrid.tsx](src/features/features-info/components/AdditionalFeaturesGrid.tsx) | 7 | `export default function AdditionalFeaturesGrid()` |
| [src/features/email-confirmation/EmailConfirmationPage.tsx](src/features/email-confirmation/EmailConfirmationPage.tsx) | 286 | `export default EmailConfirmationPage;` |
| [src/features/dashboard/pages/DashboardPage.tsx](src/features/dashboard/pages/DashboardPage.tsx) | 98 | `export default DashboardPage;` |
| [src/features/dashboard/components/StatCard.tsx](src/features/dashboard/components/StatCard.tsx) | 56 | `export default StatCard;` |
| [src/features/contact/index.tsx](src/features/contact/index.tsx) | 32 | `export default ContactPage;` |
| [src/features/contact/components/ContactInfoItem.tsx](src/features/contact/components/ContactInfoItem.tsx) | 11 | `export default function ContactInfoItem(...)` |
| [src/features/contact/components/ContactInfo.tsx](src/features/contact/components/ContactInfo.tsx) | 4 | `export default function ContactInfo()` |
| [src/features/contact/components/ContactForm.tsx](src/features/contact/components/ContactForm.tsx) | 3 | `export default function ContactForm()` |
| [src/features/callback/index.tsx](src/features/callback/index.tsx) | 166 | `export default CallbackPage;` |
| [src/features/authorization/components/AuthLayout.tsx](src/features/authorization/components/AuthLayout.tsx) | 11 | `export default function AuthLayout(...)` |
| [src/features/about/index.tsx](src/features/about/index.tsx) | 30 | `export default AboutPage;` |
| [src/features/about/components/MissionSection.tsx](src/features/about/components/MissionSection.tsx) | 3 | `export default function MissionSection()` |
| [src/features/about/components/TechStackSection.tsx](src/features/about/components/TechStackSection.tsx) | 6 | `export default function TechStackSection()` |
| [src/features/about/components/MissionItem.tsx](src/features/about/components/MissionItem.tsx) | 6 | `export default function MissionItem(...)` |
| [src/features/about/components/KeyFeaturesSection.tsx](src/features/about/components/KeyFeaturesSection.tsx) | 3 | `export default function KeyFeaturesSection()` |
| [src/features/about/components/KeyFeaturesSection.tsx](src/features/about/components/KeyFeaturesSection.tsx) | 3 | `export default function KeyFeaturesSection()` |
| [src/features/home/HomePage.tsx](src/features/home/HomePage.tsx) | 66 | `export default HomePage;` |

</details>

<details>
<summary>Shared / Layout Components (12 files) — click to expand</summary>

| File | Line | Evidence |
|------|------|----------|
| [src/components/ui/spinner.tsx](src/components/ui/spinner.tsx) | 58 | `export default Spinner;` |
| [src/components/shared/GoogleButton/GoogleButton.tsx](src/components/shared/GoogleButton/GoogleButton.tsx) | 10 | `export default function GoogleButton(...)` |
| [src/components/shared/PageHero/PageHero.tsx](src/components/shared/PageHero/PageHero.tsx) | 7 | `export default function PageHero(...)` |
| [src/components/shared/FormDivider/FormDivider.tsx](src/components/shared/FormDivider/FormDivider.tsx) | 5 | `export default function FormDivider(...)` |
| [src/components/shared/FeatureCard/FeatureCard.tsx](src/components/shared/FeatureCard/FeatureCard.tsx) | 10 | `export default function FeatureCard(...)` |
| [src/components/shared/CTABanner/CTABanner.tsx](src/components/shared/CTABanner/CTABanner.tsx) | 12 | `export default function CTABanner(...)` |
| [src/components/form/FormTextarea.tsx](src/components/form/FormTextarea.tsx) | 54 | `export default FormTextarea;` |
| [src/components/form/FormSelect.tsx](src/components/form/FormSelect.tsx) | 76 | `export default FormSelect;` |
| [src/components/form/FormPasswordInput.tsx](src/components/form/FormPasswordInput.tsx) | 100 | `export default FormPasswordInput;` |
| [src/components/form/FormInput.tsx](src/components/form/FormInput.tsx) | 54 | `export default FormInput;` |
| [src/components/form/FormCheckbox.tsx](src/components/form/FormCheckbox.tsx) | 55 | `export default FormCheckbox;` |
| [src/components/form/FormArrayInput.tsx](src/components/form/FormArrayInput.tsx) | 70 | `export default FormArrayInput;` |
| [src/components/layout/PublicLayout/PublicLayout.tsx](src/components/layout/PublicLayout/PublicLayout.tsx) | 23 | `export default PublicLayout;` — router uses named import `{ PublicLayout }` |
| [src/components/layout/PrivateLayout/PrivateLayout.tsx](src/components/layout/PrivateLayout/PrivateLayout.tsx) | 134 | `export default PrivateLayout;` — router uses named import `{ PrivateLayout }` |
| [src/components/layout/Navbar/Navbar.tsx](src/components/layout/Navbar/Navbar.tsx) | 255 | `export default Navbar;` |
| [src/components/layout/Header/Header.tsx](src/components/layout/Header/Header.tsx) | 22 | `export default Header;` |

</details>

**Recommendation** (per Constitution §III):
Convert each file from default to named export. Pattern:

```tsx
// Before
const MyComponent = () => { ... };
export default MyComponent;

// After
export const MyComponent = () => { ... };
```

Or for function declarations:

```tsx
// Before
export default function MyComponent() { ... }

// After
export function MyComponent() { ... }
```

Then update all import sites from `import MyComponent from '...'` to `import { MyComponent } from '...'`. The `@/features/index.ts` barrel exports should already be using named re-exports — this change is purely within the individual files.

To enforce this going forward, add the following to `eslint.config.js`:

```js
'import/no-default-export': 'warn'
```

with overrides permitted only for files matching the justified patterns below.

---

### L-03: Default Exports — Justified / Informational (8 files)

These files use `export default` for reasons that align with framework or tooling conventions. No remediation is required, but they are documented for completeness.

| # | File | Justification |
|---|------|--------------|
| 1 | [src/App.tsx](src/App.tsx) | Vite application entry point — `export default App` is required by the Vite module system. |
| 2 | [src/routes/BasicDataRouter.tsx](src/routes/BasicDataRouter.tsx) | Router root component — consumed as a default import by `main.tsx`. |
| 3 | [src/components/Root.tsx](src/components/Root.tsx) | Consumed as `import Root from '../components/Root'` in `BasicDataRouter.tsx`. |
| 4 | [src/components/layout/NotFound/NotFound.tsx](src/components/layout/NotFound/NotFound.tsx) | Consumed as `import NotFound from` in `BasicDataRouter.tsx`. Convert to named export and update the router import to use `{ NotFound }` in a follow-up cleanup. |
| 5 | [src/features/onboarding/store/onboarding.slice.ts](src/features/onboarding/store/onboarding.slice.ts) | Redux Toolkit slice reducer — `export default onboardingSlice.reducer` is the canonical RTK store registration pattern. |
| 6 | [src/features/notifications/store/notifications.slice.ts](src/features/notifications/store/notifications.slice.ts) | Redux Toolkit slice reducer — RTK convention. |
| 7 | [src/features/learning-paths/store/learningPaths.slice.ts](src/features/learning-paths/store/learningPaths.slice.ts) | Redux Toolkit slice reducer — RTK convention. |
| 8 | [src/features/authorization/store/user.slice.ts](src/features/authorization/store/user.slice.ts) | Redux Toolkit slice reducer — RTK convention. |

> **Note on L-03 items 1–4**: While justified today, items 3 and 4 (`Root.tsx`, `NotFound.tsx`) could be converted to named exports with a minor update to `BasicDataRouter.tsx`. This is recommended as a low-effort cleanup in the same sprint as L-02 remediation.

---

## ✅ Compliant Audit Areas

| Area | Finding | Constitution Rule |
|------|---------|-------------------|
| **Zustand Scope** | Used only in `src/features/ide/store/useIdeStore.ts`. Zero out-of-scope usages. | §II — Zustand reserved for Web IDE only |
| **SWR** | Not installed in `package.json`. Not imported anywhere in `src/`. | §II — No alternative data-fetching libraries |
| **RTK Query Infrastructure** | `@reduxjs/toolkit` ^2.9 and `react-redux` ^9.2 are installed. RTK store present at `src/store/`. | §II — RTK Query is the mandated server-state solution |
| **AWS Cognito / Amplify** | `aws-amplify` present; `src/lib/amplify-config.ts` and `src/lib/token-provider.ts` exist and are in use. | §IV — AWS Cognito via aws-amplify |
| **Tailwind CSS** | `tailwindcss` ^4 and `@tailwindcss/vite` are installed. `tailwind.config.js` present. | §III — Tailwind CSS v4 mandatory |
| **shadcn/ui** | `src/components/ui/` directory present with shadcn component primitives. | §III — shadcn/ui for base components |
| **React Hook Form + Zod** | `react-hook-form` ^7.71 and `zod` ^3.25 installed. Form wrapper components present in `src/components/form/`. | §III — Form handling with RHF + Zod |
| **React Router** | `react-router-dom` ^7.9 installed. Router configured in `src/routes/BasicDataRouter.tsx`. | Stack constraint |
| **SignalR** | `@microsoft/signalr` ^10 installed. `src/context/SignalRContext.tsx` present. | Stack constraint |

---

## Appendix A: Constitution Section Cross-Reference

| Violation Category | Constitution Section |
|--------------------|---------------------|
| C-01 Deprecated Axios | §II — State Management & Data Fetching Strategy → DEPRECATION NOTICE |
| C-02 Cross-Feature Leaks | §I — Strict Feature-Based Architecture → Cross-Feature Coupling |
| M-01 Prohibited Library | §II — State Management & Data Fetching Strategy → Global/Server State |
| M-02 TypeScript `any` | §V — Strict Type Safety → "The use of `any` is strictly prohibited" |
| L-01 Custom CSS | §III — UI, Styling, and Component Standards → Styling |
| L-02 Default Exports | §III — UI, Styling, and Component Standards → Exports |

---

## Appendix B: Recommended Remediation Order

1. **Immediate** (this sprint): Address C-01 and C-02. These represent the highest architectural risk — the Axios deprecation prevents safe library upgrades and the cross-feature leaks make refactoring dangerous.
2. **Current sprint**: Address M-01 (`@tanstack/react-query` removal). This library duplication means server state is managed in two places simultaneously, leading to inconsistency and cache divergence.
3. **Current sprint**: Address M-02 (`any` types). These are concentrated in a small number of files and are straightforward to fix.
4. **Next sprint**: Address L-02 (default exports) as a systematic sweep — an automated codemod tool (`jscodeshift` or `ts-migrate`) can handle most of these conversions safely.
5. **Ongoing**: L-01 (CSS files) should be reviewed case-by-case when the IDE feature is next modified.

---

*This report was generated by a read-only static analysis pass. No source files were modified. Re-run the audit after remediation to verify closure of each violation category.*
