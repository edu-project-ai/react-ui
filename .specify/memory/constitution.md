# Roadly Frontend Constitution (React / TypeScript)

## Core Principles

### I. Strict Feature-Based Architecture (Clean Frontend)
The project strictly follows a Feature-Sliced/Feature-Based design pattern.

* All business logic MUST be encapsulated within `src/features/[feature-name]`.
* A feature module should contain its own `api`, `components`, `hooks`, `store`, and `utils`.
* **Cross-Feature Coupling**: Features should be as independent as possible. If a feature needs to expose functionality to another, it MUST do so through an explicit public API (e.g., `src/features/[name]/index.ts`).
* Shared UI primitives live in `src/components/`, while feature-specific components stay inside their respective feature folder.

### II. State Management & Data Fetching Strategy
State management is strictly categorized by its scope and purpose:

* **Global/Server State**: Use Redux Toolkit's RTK Query (`src/store/api/apiSlice.ts`) exclusively for all HTTP requests and server state caching. Do not introduce alternative data-fetching libraries (e.g., React Query, SWR).
* **DEPRECATION NOTICE**: The custom Axios implementation (`src/lib/http.ts`) is DEPRECATED. The AI agent MUST NOT use it for new features. All new API calls must be routed through RTK Query.
* **Web IDE / Complex Local State**: Zustand is strictly reserved for highly interactive, complex local state management, specifically for the Web IDE component. Do not use Zustand for simple form state or global server data.

### III. UI, Styling, and Component Standards
* **Styling**: Tailwind CSS (v4) is the mandatory styling engine. Avoid writing custom `.css` files unless absolutely necessary.
* **Component Library**: Use `shadcn/ui`. All base UI components (buttons, inputs, modals) MUST be placed in `src/components/ui` and built using Tailwind utility classes.
* **Form Handling**: Use consistent form wrappers (e.g., existing `FormInput`, `FormSelect` from `src/components/form/`) combined with React Hook Form and Zod for validation.
* **Exports**: Prefer named exports for all components and functions (e.g., `export const MyComponent = () => ...`). Avoid default exports unless strictly required by a specific framework or library (e.g., dynamic imports via `React.lazy` or specific router configurations).

### IV. Authentication & Authorization Flow
* **Provider**: AWS Cognito via `aws-amplify` (`src/lib/amplify-config.ts`).
* **Routing & Layouts**: The application uses specific layouts (`PublicLayout`, `PrivateLayout`, `OnboardingLayout`, `AuthLayout`). The agent must ensure that new pages are registered under the correct layout based on their authentication requirements.
* **Tokens**: Use `token-provider.ts` and standard Amplify utilities for session management.

### V. Strict Type Safety (TypeScript)
* The use of `any` is strictly prohibited.
* All API requests/responses, component props, and Redux/Zustand states MUST have explicit, strongly-typed interfaces or types defined.
* **Type Placement**: Feature-specific types belong inside `src/features/[feature-name]/types.ts`. Types that are shared across multiple features (e.g., generic API response wrappers, common domain models) MUST be placed in a global `src/types/` or `src/store/types.ts` directory to prevent circular dependencies.

---

## Technology Stack & Infrastructure Constraints

* **Core**: React + Vite + TypeScript.
* **Routing**: React Router (`src/routes/`).
* **Real-time**: SignalR is used for WebSocket communications (`src/context/SignalRContext.tsx`). New real-time features must integrate with this existing service.
* **Icons & Assets**: Keep assets in `src/assets` or `public/` and use consistent icon libraries (e.g., Lucide React).

---

## Development Workflow & Spec-Driven Rules

1. **Git Branching Strategy (CRITICAL)**: All new Git branches MUST follow a strict prefix naming convention based on the type of work:
   * `feature/` — for new features and capabilities (e.g., `feature/003-add-ide-panel`).
   * `fix/` — for bug fixes and remediation tasks (e.g., `fix/004-auth-token-refresh`).
   * `task/` — for technical debt, refactoring, or audits (e.g., `task/005-remove-axios`).
   *When the AI agent creates a new branch via `/specify`, it MUST strictly apply one of these prefixes.*
2. **Specification First**: No code is written without a clear business requirement defined via `/specify`.
3. **Mandatory Planning**: The AI must generate a detailed architectural plan (`plan.md`) demonstrating how the feature fits into the Feature-Based structure and State Management strategy before writing code.
4. **Human Review Gate**: The developer must explicitly approve the plan before the AI proceeds to break it down into tasks (`tasks.md`) and begins implementation.

---

## Governance

This Constitution supersedes all default AI agent behaviors and standard coding suggestions. It serves as the ultimate set of rules for the Claude agent during Spec-Driven Development on the React Frontend.

Any deviation from these architectural patterns (Feature-Based design, RTK Query/Zustand separation, Tailwind/shadcn usage) requires explicit human approval and a documented amendment to this file.

**Version**: 1.1.0 | **Ratified**: 2026-02-28 | **Last Amended**: 2026-02-28