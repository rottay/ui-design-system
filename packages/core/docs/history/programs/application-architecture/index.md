# World-Class App Architecture

This folder is the implementation-ready architecture package for:

- `app-platform`
- `app-bithire`
- `app-evnto`

Date:

- `2026-04-11`

Goal:

- converge the three apps onto one stable architecture
- preserve vertical identity
- remove ambiguous roots
- reduce folder sprawl
- stop duplicating ownership between `surfaces`, `actions`, `components`, `features`, and `vertical`
- give Claude a single source of truth for the implementation waves

Bottom line:

- the recommended base is still Option B
- but the strongest version of Option B is:
  - `app/`
  - `vertical/`
  - `features/`
  - `core/`
  - `ui/`
  - `styles/`

Key moves:

- `surfaces/` stops being a permanent root and is rehomed into `features/*/*/screens`
- `actions/` stops being a permanent root and is rehomed into `features/*/*/actions` or `core/*`
- `components/` stops being a domain root and becomes `ui/` for app-owned cross-feature UI only
- `constants/`, `hooks/`, `providers/`, `stores`, `types`, and most `lib/` converge into `core/`

Primary files:

- `00-final-decision.md`
- `01-root-semantics.md`
- `02-final-src-template.md`
- `03-no-duplication-rules.md`
- `04-folder-index-and-grouping.md`
- `05-app-platform-target-tree.md`
- `06-app-bithire-target-tree.md`
- `07-app-evnto-target-tree.md`
- `08-current-to-target-mapping.md`
- `09-implementation-waves.md`
- `10-claude-execution-prompt.md`

Use this folder as the architecture source of truth for the next refactor wave.

If this package conflicts with older architecture notes in:

- `premium-final-audit/13-architecture-options.md`
- `premium-final-audit/14-recommended-app-template.md`
- `premium-final-audit/15-folder-map-by-app.md`
- `premium-final-audit/19-folder-organization-and-indexing.md`

this folder wins.
