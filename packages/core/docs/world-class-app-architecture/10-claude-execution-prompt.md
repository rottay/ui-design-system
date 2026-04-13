# Claude Execution Prompt

Copy-paste prompt:

```text
Implement the world-class multi-app architecture described in:

- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/world-class-app-architecture/README.md
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/world-class-app-architecture/00-final-decision.md
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/world-class-app-architecture/01-root-semantics.md
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/world-class-app-architecture/02-final-src-template.md
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/world-class-app-architecture/03-no-duplication-rules.md
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/world-class-app-architecture/04-folder-index-and-grouping.md
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/world-class-app-architecture/05-app-platform-target-tree.md
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/world-class-app-architecture/06-app-bithire-target-tree.md
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/world-class-app-architecture/07-app-evnto-target-tree.md
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/world-class-app-architecture/08-current-to-target-mapping.md
- /Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/world-class-app-architecture/09-implementation-waves.md

Non-negotiable rules:

1. The final permanent roots are:
   - src/app
   - src/vertical
   - src/features
   - src/core
   - src/ui
   - src/styles
2. Do not delete backend integration. Rehome it.
3. `surfaces/` is transitional only. Screens belong in `features/*/*/screens`.
4. `actions/` is transitional only. Business actions belong in `features/*/*/actions`.
5. `components/` must stop being a domain forest. Domain UI belongs in features. Shared app-owned UI belongs in `ui/`.
6. `vertical/` owns app identity, not business logic.
7. `core/` owns app infrastructure, not product grammar.
8. Route entrypoints must converge onto `@/features/...` or `@/vertical/...`.
9. Every meaningful public boundary needs `index.ts`.
10. Group by real families, not arbitrary buckets.

Execution order:

1. Freeze the target family names for each app using the docs.
2. Create the permanent roots and public `index.ts` boundaries.
3. Rehome infra into `core/`.
4. Rehome screens into `features/*/*/screens`.
5. Rehome business server actions into `features/*/*/actions`.
6. Rehome domain components into `features/*/*/components`.
7. Converge app-owned shared presentation into `ui/`.
8. Delete transitional roots only when empty and imports are clean.
9. Add guardrails so the old roots cannot regrow.

Output expectations:

- execute in waves
- summarize each wave briefly
- list the files changed
- keep typecheck green
- if a move is too risky to finish in one wave, leave a compat re-export and state it explicitly

STOP format:

- STOP
- Blocker:
- What I found:
- Options:
- Recommendation:
```
