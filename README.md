# Dashboard Template React

## Setup

1. Install dependencies: `npm install`
2. Create local env file from template: copy `.env.example` to `.env`
3. Run development server: `npm run dev`

## Scripts

- `npm run dev`  
  Starts the Vite development server with hot-reload.  
  Use this while actively coding UI/features.

- `npm run build`  
  Creates a production build in `dist/`.  
  Use this before deployment or to verify production bundling.

- `npm run preview`  
  Runs a local server for the built `dist/` output.  
  Use this after `npm run build` to test production behavior locally.

- `npm run arch:check`  
  Validates layer import rules (FSD boundaries) using `scripts/check-layer-imports.mjs`.  
  Use this when moving files, changing imports, or refactoring architecture.

- `npm run lint`  
  Runs ESLint checks for code quality and common mistakes.  
  Use this before committing code.

- `npm run lint:fix`  
  Runs ESLint with auto-fix for fixable issues.  
  Use this when lint reports style/syntax issues that can be automatically corrected.

- `npm run format`  
  Formats files with Prettier.  
  Use this before commit or when code style looks inconsistent.

- `npm run format:check`  
  Checks formatting without modifying files.  
  Use this in CI or before pushing when you want a clean formatting validation.

- `npm run test`  
  Runs Vitest test suite once.  
  Use this before merge/push to ensure behavior is still correct.

- `npm run test:watch`  
  Runs tests in watch mode and re-runs on file changes.  
  Use this during development when writing/fixing tests.

- `npm run check`  
  Runs the full quality gate: format check + lint + tests + architecture check + build.  
  Use this before final push/PR to confirm the project is release-ready.

## Architecture

This project uses an FSD-inspired layered structure for scalable React development.

- `src/app`
- `src/pages`
- `src/widgets`
- `src/features`
- `src/entities`
- `src/shared`

Shared cross-page helpers live in:

- `src/shared/hooks/useDebouncedValue.js`
- `src/shared/lib/pagination.js`
- `src/shared/lib/text.js`
- `src/shared/ui/ModalPortal.jsx`

See `docs/frontend-architecture.md` for layer rules and import conventions.
