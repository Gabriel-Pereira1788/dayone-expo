# Testing & Comments

> **MANDATORY RULE**: This file defines the testing and code-comment conventions for this
> project. Claude MUST follow these patterns in ALL code changes. Violations are NOT acceptable.
> This is NOT a suggestion — it is an enforced standard. Never deviate without explicit user
> approval.

## Test Runner

- `jest` + `jest-expo` (pinned to the Expo SDK's major version) is the test runner. Run with
  `yarn test` / `yarn test:watch`.
- `jest.config.js` at the repo root: `preset: "jest-expo"`, `@/*` mapped to `src/*`,
  `testMatch: ["**/__tests__/**/*.test.ts?(x)"]`.
- `tsconfig.json` `compilerOptions.types` MUST include `"jest"` so `describe`/`it`/`expect`
  type-check without per-file imports.

## Colocated `__tests__/`

MUST:
- Every function that carries real behavior (branching, calculation, formatting, a domain rule)
  gets a test, colocated in a `__tests__/` directory inside the same folder as the source file —
  never a parallel top-level `test/` tree.
- One test file per source file: `frequency.ts` → `__tests__/frequency.test.ts`,
  `streak-stats.ts` → `__tests__/streak-stats.test.ts`. Group every exported function from that
  source file into that one test file, using a `describe` block per function.
- `*.constants.ts` / `*.types.ts` files are data/shape only — they do not get their own test
  file. Test the functions that consume them instead.
- Applies everywhere: `domain/useCases/*/*.service.ts`, `utils/*/*.ts`, view models, adapters —
  not just the `habit`/`streak` utility modules where this pattern started.

```
frequency/
├── frequency.constants.ts
├── frequency.ts
├── index.ts
└── __tests__/
    └── frequency.test.ts
```

## Comments Live in Tests, Not in Source

MUST:
- Source files (`.ts`/`.tsx`) stay declarative: no JSDoc blocks, no inline "why" comments, no
  prose explaining behavior, edge cases, or rationale.
- That explanation belongs in the test file instead — as the `it("...")` description, or as a
  short comment directly above the assertion it justifies. A reader learns *why* the code
  behaves a certain way by reading its test, not its implementation.
- Exception: comments that are structurally necessary and would be lost outside the source file
  — e.g. a `// eslint-disable` / `// @ts-expect-error` directive, or a reference to an external
  constraint the reader needs at the call site (a third-party API quirk, a backend format
  requirement) that a test can't carry. Keep these minimal and only when the code alone can't
  express the constraint.
- Never leave a comment in source purely to describe *what* the next line does — the code
  already says that. Comments in source are a last resort, not a default.

### Before / after

```typescript
// ❌ Before — explanation lives in the source file
/**
 * Whether `habit` is scheduled to happen on `date`, per its frequency and
 * active window. Archived/deleted habits are never due — callers filter
 * those out before calling this.
 */
export function isHabitDueOn(habit: Habit, date: Date): boolean { ... }
```

```typescript
// ✅ After — source is declarative only
export function isHabitDueOn(habit: Habit, date: Date): boolean { ... }
```

```typescript
// ✅ After — explanation moved into the test as behavior specs
describe("isHabitDueOn", () => {
  it("is never due before its start date, even on an otherwise matching day", () => {
    const habit = makeHabit({ frequency: "daily", startDate: "2024-06-10" });
    expect(isHabitDueOn(habit, new Date(2024, 5, 9))).toBe(false);
  });
});
```

## Enforcement

When adding or changing a function with real behavior, you MUST add or update its colocated
`__tests__/*.test.ts` in the same change, and MUST NOT reintroduce explanatory comments into the
source file that the test file already documents.
