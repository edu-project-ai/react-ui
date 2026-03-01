# ui Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-01

## Active Technologies
- TypeScript 5.x / React 18 + `@reduxjs/toolkit` ^2.9 (RTK Query), `react-redux` ^9.2, `react-router-dom` ^7.9, `aws-amplify`, `tailwindcss` ^4, `react-hook-form` ^7.71, `zod` ^3.25, `@microsoft/signalr` ^10 (001-core-remediation)
- N/A (client-side only; server state via RTK Query cache) (001-core-remediation)

- TypeScript 5.x / React 18 (Vite project) + `@reduxjs/toolkit` ^2.9, `react-redux` ^9.2, `zustand` ^5.0 (IDE only), `axios` ^1.13 (deprecated — audit target), `@tanstack/react-query` ^5.90 (prohibited — audit target) (001-frontend-arch-audit)

## Project Structure

```text
src/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript 5.x / React 18 (Vite project): Follow standard conventions

## Recent Changes
- 001-core-remediation: Added TypeScript 5.x / React 18 + `@reduxjs/toolkit` ^2.9 (RTK Query), `react-redux` ^9.2, `react-router-dom` ^7.9, `aws-amplify`, `tailwindcss` ^4, `react-hook-form` ^7.71, `zod` ^3.25, `@microsoft/signalr` ^10

- 001-frontend-arch-audit: Added TypeScript 5.x / React 18 (Vite project) + `@reduxjs/toolkit` ^2.9, `react-redux` ^9.2, `zustand` ^5.0 (IDE only), `axios` ^1.13 (deprecated — audit target), `@tanstack/react-query` ^5.90 (prohibited — audit target)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
