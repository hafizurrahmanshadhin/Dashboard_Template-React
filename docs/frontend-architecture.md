# Frontend Architecture

This project follows an FSD-inspired layered structure that is suitable for large management software.

## Layers

- `app`: app entry, router, providers, global wiring
- `pages`: route-level screens
- `widgets`: layout/navigation composites
- `features`: user actions/use-cases (auth, guards, workflows)
- `entities`: domain data/state for core business objects
- `shared`: reusable UI, API client, config, hooks, low-level utilities

## Dependency Rules

- `shared` imports from no upper layer
- `entities` can import only from `shared`
- `features` can import from `entities` and `shared`
- `widgets` can import from `features`, `entities`, and `shared`
- `pages` can import from `widgets`, `features`, `entities`, and `shared`
- `app` can import from all layers

## Domain Mapping

- `entities/user/model/usersStore.js`
- `entities/role/model/rolesStore.js`
- `entities/permission/model/permissions.js`

## Public API Rule

Each slice should expose an `index.js` and consumers should import from the slice root (not deep internal paths).

Examples:

- `@/app`
- `@/entities/user`
- `@/entities/role`
- `@/entities/permission`
- `@/features/auth/session`
- `@/pages`
- `@/pages/auth`
- `@/pages/rbac`
- `@/widgets/layouts`
- `@/widgets/navigation`
- `@/shared/config`
- `@/shared/api`
- `@/shared/hooks`
- `@/shared/lib`
- `@/shared/ui`

Prefer the slice root API and avoid deep imports such as `@/shared/config/paths`.

## Validation

Run `npm run arch:check` to detect forbidden cross-layer imports early in development.
