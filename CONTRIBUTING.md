# Contributing

Thanks for taking the time. This guide covers what belongs here, how to set up, and what a
change has to satisfy to be merged.

## Before you start

The library is domain-agnostic on purpose. Before proposing a component, ask:

> Could another product use this without knowing what a customer, invoice, booking or
> campaign is?

If **yes**, it may belong here. If **no**, it belongs in the application that owns that
vocabulary — a widget that needs domain meaning will never be reusable, and adding it here
makes every other consumer carry it.

For anything non-trivial, open an issue first. A short discussion about which tier a piece
belongs to is cheaper than a rewritten pull request.

## Setup

Prerequisites: **Node >= 20** (CI runs 22) and **pnpm 9.15.9** — the version is pinned in
the root `packageManager` field, so `corepack enable` will select it for you.

```bash
pnpm install
pnpm build
```

**You do not need registry credentials to work on this repository.** The only `@rottay`
dependency is a `workspace:*` link that pnpm resolves locally. Authentication is required
only to *install the published package* into another project, which is a separate concern
covered in [docs/getting-started.md](docs/getting-started.md).

## Repository tour

```text
packages/core/src/        The library: foundation, infrastructure, graphics, components
packages/core/scripts/    Build, check, generate, maintain and package commands
packages/core/tests/      Cross-unit integration, system and architecture suites
packages/showroom/        Reference application and visual gallery
docs/                     The documentation set
```

Read [docs/architecture/index.md](docs/architecture/index.md) for how the parts depend on
each other, and [docs/ownership.md](docs/ownership.md) before editing anything — several
trees are generated, and an edit there is silently discarded on the next run.

## Where a change goes

| Change | Where |
|---|---|
| New engine-switched leaf component | `src/components/primitives/` |
| Reusable task widget (table, form, board) | `src/components/patterns/` |
| Page chrome around a task widget | `src/components/structures/` |
| Whole-screen declarative recipe | `src/components/surfaces/` |
| New public import path | `src/entrypoints/` plus the package exports map |
| Token or theme value | `src/foundation/tokens/` — never a component file |
| Anything needing domain vocabulary | Your application, not this repository |

## Conventions

- **Conventional commits**: `type(scope): description` — `feat`, `fix`, `docs`, `refactor`,
  `chore`, `test`.
- **No AI co-author trailers or generated-by signatures** in commits.
- **English only**, in code, comments, documentation and commit messages.
- **No emojis** anywhere. Text markers only.
- **`folder/index` everywhere.** Authored units are `folder/index.ts(x)` owners; loose
  files at a root are rejected. Generic segment names (`utils`, `shared`, `misc`,
  `internal`) are not allowed — name the capability.
- **Source comments default to zero.** Add one only for a non-obvious product invariant,
  an accessibility constraint, a browser quirk or a public API requirement. Never narrate
  history or process.
- **No hardcoded colors, no raw HTML elements, no supplier imports** in components. Shipped
  ESLint rules enforce all three.

## Adding a component

1. Pick the tier using the decision table in
   [docs/architecture/index.md](docs/architecture/index.md).
2. Give it a `folder/index.tsx` facade; add `contracts/`, `runtime/`, `engines/` and
   `tests/` branches only as needed.
3. An engine-switched primitive needs `classic`, `modern` and `rustic` implementations.
   Do not add an engine branch that merely forwards to another.
4. Export it deliberately — an owner exporting a symbol does not publish it; the root
   barrel carries the explicit API list.
5. Add tests inside the unit's own `tests/` folder.

## Running checks

Commands, what each gate proves, and which ones can be run outside the organization are in
[docs/testing.md](docs/testing.md). Run the relevant checks locally before opening a pull
request rather than relying on CI to find the problem.

**A note on CI for forks:** every CI job runs on self-hosted runners, so a pull request
from an external fork does not get automatic pipeline results. Maintainers run validation
and report back on the pull request. Please describe what you ran locally — it makes that
round trip much shorter.

## Pull requests

- [ ] Scope is one change; unrelated fixes go in their own pull request.
- [ ] **A changeset is included** if the published package is affected
      (`pnpm changeset`). CI rejects core changes without one. See
      [docs/releasing.md](docs/releasing.md).
- [ ] Tests cover the new behavior, and existing suites still pass.
- [ ] Documentation updated when the change alters a public surface.
- [ ] Commit messages follow the convention above.
- [ ] No generated file was hand-edited.

## What will not be merged

- Components that require domain vocabulary.
- Hardcoded colors, raw HTML elements, or direct icon-supplier imports.
- Hand edits to generated output instead of the source that produces it.
- New loose files at a root, or generic ownership segment names.
- A new stability guarantee without a declared entry point behind it.
- Changes that silence a gate rather than satisfy it — baselines are decrease-only, and a
  new finding is fixed, never absorbed.
