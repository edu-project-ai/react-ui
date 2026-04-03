# Contributing to Roadly UI

## Branch Naming

| Pattern | Use case |
|---------|----------|
| `feature/<scope>` | New feature |
| `fix/<scope>` | Bug fix |
| `phase/<ver>/feature-<n>` | Phase-versioned feature (e.g. `phase/2.5/feature-3`) |
| `hotfix/<scope>` | Urgent production fix |
| `chore/<scope>` | Config, deps, tooling |
| `refactor/<scope>` | Code refactoring without behavior change |

## Protected Branches

| Branch | Protection |
|--------|------------|
| `master` | Production — no direct push. PRs from `dev` only. |
| `dev` | Integration — no direct push. PRs from feature branches. |

## Pull Requests

- Target branch: **`dev`**
- Require **1 approval** before merge
- Link an issue or reference a plan item in the PR description
- CI must pass before merge
- Use the PR template (summarize changes, test plan)

## Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add SSE streaming hook for AI chat
fix: resolve verification field missing from agent response
refactor: migrate AiMentorPage state to Zustand
chore: upgrade vite to 7.1
docs: update CONTRIBUTING with branch rules
test: add unit tests for useAgentStream hook
```

**No direct pushes to `master` or `dev`.**

## Code Style

- **TypeScript strict mode** — no `any` unless explicitly justified with a comment
- **Prettier** — run `npm run format` before committing
- **ESLint** — run `npm run lint`; fix all errors, warnings warrant a comment
- Component files: `PascalCase.tsx`
- Hooks: `camelCase.ts` prefixed with `use`
- Store files: `useXxxStore.ts` (Zustand), `xxxSlice.ts` (RTK)
- Feature folder structure: `features/<name>/{components,hooks,store,api,types,pages}/`

## Local Development

```bash
npm install
cp .env.example .env          # fill in Cognito + API URLs
npm run dev                   # http://localhost:5173
npm run lint
npm run build
```

## Testing

```bash
npm test                      # vitest
npm run test:coverage
```

## Dependency Policy

- Prefer existing dependencies before adding new ones
- New packages require a comment in the PR explaining why the existing stack doesn't suffice
- Do **not** add packages that duplicate existing functionality (e.g. another HTTP client when RTK Query is present)
