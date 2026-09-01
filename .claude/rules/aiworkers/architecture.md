# Project Architecture

> **MANDATORY RULE**: This file defines the architectural constraints for this project.
> Claude MUST follow these patterns in ALL code changes. Violations are NOT acceptable.
> This is NOT a suggestion — it is an enforced standard. Never deviate without explicit user approval.

## Framework & Stack

- React Native 0.81.5 + React 19 + TypeScript (strict)
- Expo ~54 with expo-router ~6 for file-based routing
- @shopify/restyle for theming; StyleSheet + style hooks for component styles
- react-native-reanimated for animations; @shopify/react-native-skia for graphics
- react-hook-form + zod for forms and validation
- i18next + react-i18next for internationalization

## Module Structure

MUST:
- Place all new feature code under `src/modules/{feature}/`
- Separate domain logic from UI: `domain/` and `ui/` subdirectories
- Use `domain/useCases/{use-case-name}/` for each use case (3-file pattern)
- Use `ui/screens/{screen-name}/` for screens
- Use `ui/components/{component-name}/` for module-scoped components
- Cross-module shared code goes in `src/shared/` only
- Infrastructure code (API, adapters, DI, config) goes in `src/infra/` only
- Never import from one module's internals into another — use `src/shared/` for cross-cutting concerns

## Naming Conventions

### Files

MUST:
- Use `kebab-case` for all file names: `diet-list-screen.tsx`, `badge.styles.ts`
- Suffix style files with `.styles.ts`: `component-name.styles.ts`
- Suffix service files with `.service.ts`: `generate-diet.service.ts`
- Prefix React Query hook files with `use`: `useGetDietPlanList.ts`
- Always include `index.ts` barrel in every component/use-case directory

### Components and Functions

MUST:
- Export components with PascalCase matching the directory name: `Badge`, `DietListScreen`
- Name style hooks `use[ComponentName]Styles`: `useBadgeStyles`, `useDietListScreenStyles`
- Name React Query hooks `use[Action][Resource]`: `useGetDietPlanList`, `useCreateDietPlan`
- Name service functions `[action][Resource]Service`: `generateDietService`, `getDietPlanService`
- Name constants SCREAMING_SNAKE_CASE: `WEEKS`, `ITEM_WIDTH`
- Prefix custom hooks with `use`: `useTheme`, `useAppSafeArea`

### Directories

MUST:
- Shared UI component directories: PascalCase (`src/shared/ui/Badge/`)
- Module component and screen directories: kebab-case (`diet-list-screen/`, `meal-card/`)

## Component Architecture (3-File Pattern)

Every UI component MUST follow this structure:

```
ComponentName/
├── component-name.tsx        ← Named export of PascalCase component function
├── component-name.styles.ts  ← Named export of useComponentNameStyles hook
└── index.ts                  ← export * from './component-name'
```

MUST:
- Component file exports the component function with PascalCase name
- Style file exports a `use[ComponentName]Styles` hook returning `StyleSheet.create({...})`
- Style hook receives props when styles depend on them
- Index file re-exports everything from the component file(s)
- Never put styles inline in the component beyond one-offs — use the styles file

For complex components, additional files are allowed:
- `component-name.animated.ts` — Reanimated shared values and animations
- `component-name.viewmodel.ts` — Local state hook for business logic
- `library/` subdirectory — Internal sub-components not exported publicly

## Use Case Architecture (3-File Pattern)

Every use case MUST follow this structure:

```
use-case-name/
├── use-case-name.service.ts  ← Pure async function, no React, no hooks
├── useUseCaseName.ts         ← useQuery or useMutation wrapping the service
└── index.ts                  ← Barrel export
```

MUST:
- Service file contains pure async logic, injectable dependencies as parameters
- Hook file wraps service in TanStack Query (`useQuery` / `useMutation`)
- Never call hooks inside service files
- Never call service functions directly from components — always via the hook

## Code Style

### Imports

MUST:
- Use `@/` alias for all non-relative imports: `import { Badge } from '@/shared/ui/Badge'`
- Order: external libraries → `@/` alias imports → relative imports
- Never use wildcard imports (`import *`)
- Never import from internal paths of another module (always go through its `index.ts`)

### Exports

MUST:
- Use named exports only — never `export default`
- Every directory with public components MUST have an `index.ts` barrel
- Export types alongside their implementation in the same file

### Types

MUST:
- Use `interface` for object shapes, props, and API contracts
- Use `enum` or `const enum` for fixed value sets
- Use `type` for unions, intersections, and utility types
- Suffix prop interfaces with `Props`: `BadgeProps`, `DietListScreenProps`
- Suffix DTO types with `DTO`: `DietPlanDTO`, `ProfileDTO`
- Co-locate types with their implementation unless shared across multiple modules
- Shared types go in `{module}/domain/types.ts` or `src/infra/types/`

## State Management

MUST:
- Use TanStack Query (`useQuery` / `useMutation`) for ALL server state
- Inject services via `DIContainerRef.current?.getService(DIKeys.X)` or DI hook
- Use `useState` / `useReducer` for component-local state
- Use `react-native-mmkv` for persistent local key-value storage
- Never introduce Redux, Zustand, MobX, or any other global state library without explicit approval
- Never call APIs directly from components — always via use case hooks

## Sanctioned Exception: Salve DB for `habit`/`streak` data

This project exists to validate `@salve-software/react-native-salve-db`, an offline-first SQLite
library with a 100% native sync engine. For the `habit` module's data (habits and streaks),
this is an **explicit, approved exception** to the "TanStack Query for ALL server state" rule
above:

MUST (for `habit`/`streak` domain only):
- Define local tables as `ISchemaDefinition` in `src/infra/db/schemas/` (`habit.schema.ts`,
  `streak.schema.ts`), with `sync.endpoint = { basePath, sinceParam, limitParam }` pointing at
  the existing REST resources (`/habits`, `/streaks`) — no custom sync endpoint on the backend.
- Read via Salve DB's own `useQuery`/`useInfiniteQuery` hooks, not `useQuery` from
  `@tanstack/react-query`.
- Write via `Database.insert/update/delete(schema).execute()` — synchronous, local-first; the
  native engine pushes to the REST API and reconciles client-generated ids automatically. Do
  not call the REST endpoints for habits/streaks CRUD directly from the app.
- Declare `relations` on child schemas (e.g. `StreakSchema` → `habits`) so FK columns get
  rewritten when a parent's local id is replaced by the server-assigned one after sync.

Every other module (starting with `auth`) still follows the standard rule: TanStack Query +
the Axios client in `src/infra/api/` for all server state. Do not extend the Salve DB exception
to new modules without the same explicit approval.

## API Layer

MUST:
- Use the Axios client from `src/infra/api/` for REST API calls
- Use Supabase SDK from `src/infra/config/supabase/` for database/auth operations
- Abstract API calls behind adapter interfaces in `src/infra/adapters/`
- Use repository pattern via `IBaseRepositoryBuilder` for data persistence
- Never instantiate Axios or Supabase directly in modules — use infra layer

MUST:
- Use `useTheme()` from `@/styles` to access design tokens (colors, spacing, typography)
- Use `@shopify/restyle` theme types for type-safe theme access
- Define styles via `StyleSheet.create({})` inside a `use[Component]Styles` hook
- Never hardcode color values — always reference `theme.colors.*`
- Never hardcode spacing values — always reference `theme.spacing.*`

## Routing

MUST:
- Use expo-router file-based routing — all routes live in `app/`
- Navigate programmatically via `router.push()` / `router.replace()` from `expo-router`
- Pass navigation params via `params` object: `router.push({ pathname: '...', params: { id } })`
- Never use React Navigation directly — always expo-router

## Testing

No test suite is required. Do NOT add test files unless explicitly requested by the user.

## Enforcement

When writing or modifying code, you MUST:

1. **ALWAYS follow the patterns defined above** — mandatory, not suggestions
2. **NEVER introduce new libraries, patterns, or abstractions without explicit user approval** — ask first
3. **When in doubt, search for existing examples**:
   - Find similar components: `src/modules/*/ui/components/` or `src/shared/ui/`
   - Find existing use cases: `src/modules/*/domain/useCases/`
   - Find adapter patterns: `src/infra/adapters/`
4. **If deviation is necessary**:
   - Explain WHY it is necessary
   - Get explicit user approval FIRST
   - Document the exception in the commit message

Violations of these architectural rules will require rework.
