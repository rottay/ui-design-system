# Ready-to-use Claude Handoff Prompt

> Historical note: this prompt defined the initial tranche. After the
> 2026-07-23 audit, use
> [`CLAUDE-NEXT-WAVE-PROMPT.md`](./CLAUDE-NEXT-WAVE-PROMPT.md) instead.

Copy the text below into Claude from the Rottay workspace.

---

You are the implementation owner for the Rottay Design Platform 10/10 program.
Codex will independently audit your work. Do not commit.

Your first action is to read these documents completely, in order:

1. `/Users/daniel/Developer/Rottay/ui-design-system/CLAUDE.md`
2. `/Users/daniel/Developer/Rottay/ui-design-system/roadmap/README.md`
3. `/Users/daniel/Developer/Rottay/ui-design-system/roadmap/registry.json`
4. `/Users/daniel/Developer/Rottay/docs-engineering/engineering/design-system/runtime/engines/modern/README.md`
5. `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rottay-design-platform-10-10/MASTER-IMPLEMENTATION-PLAN.md`
6. `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rottay-design-platform-10-10/SUPPLIER-ARCHITECTURE.md`
7. `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rottay-design-platform-10-10/COMPONENT-LEDGER.md`
8. `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rottay-design-platform-10-10/EXECUTION-BACKLOG.md`
9. `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rottay-design-platform-10-10/CLAUDE-IMPLEMENTATION-RUNBOOK.md`
10. `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rottay-design-platform-10-10/CODEX-AUDIT-PROTOCOL.md`

The roadmap registry remains the only claim/progress/done authority; the new
package is the target/certification specification and candidate crosswalk.
Do not implement an unmapped `DS-*` row. Do not substitute remembered
conversation context for these files.

Objective:

- make Modern a Rottay-owned, world-class, AI-native, deeply white-label design
  platform for every Rottay product;
- use BitHire Candidates only as the first real canary;
- make premium quality emerge from the DS automatically;
- preserve the current architecture, data, actions, permissions, i18n and
  tenant authority.

Non-negotiables:

- static typed `BrandTheme` owns first-party verticals such as BitHire;
- validated DB `Appearance` owns customer tenant customization;
- canonical `--ds-*` values remain runtime authority;
- no second theme/token system;
- no styled third-party system becomes visual authority;
- suppliers stay behind Rottay adapters and do not leak public types/classes;
- apps may compose and style through public DS APIs but may not repair shared
  primitives or address private anatomy;
- EN, ES and AR/RTL;
- desktop, tablet, mobile, pointer, touch, keyboard and reduced motion;
- no generic colored left rails;
- no overlap, clipping, unreadable text, accidental empty space or inconsistent
  geometry;
- no feature flags;
- no commits;
- one build/typecheck/test aggregate/browser integration at a time;
- do not mark ledger rows accepted or change the percentage.

Local development already has the correct integration:

- BitHire uses Next with Webpack;
- `app-bithire/node_modules/@rottay/design-system` links to
  `ui-design-system/packages/core`;
- `app-bithire/scripts/link-local-ds.mjs` owns the link and verifies built DS
  artifacts;
- use `pnpm dev:local-ds`, rebuild DS serially when `dist` must change, reuse one
  browser tab and close obsolete processes/tabs;
- do not republish, copy artifacts or change bundlers to solve local linkage.

Current certified baseline:

- 14/92 accepted public primitives = 15.2%;
- 0/15 accepted selected cross-product artifacts;
- 0/6 accepted canonical surfaces;
- 0/6 accepted AI capability families;
- 14/119 accepted overall = 11.8%.

The first implementation tranche is fixed after roadmap crosswalk:

1. complete DS-A002 ownership lint;
2. reconcile/complete DS-A003 token ownership graph;
3. complete DS-A004 semantic material;
4. complete DS-Q001L proof using existing extreme divergence fixtures;
5. complete DS-S001 Rottay recipe facade over the already installed exact
   `tailwind-variants@3.2.2`;
6. complete DS-S005 supplier/import/provenance gates;
7. run DS-S002 React Aria vs Base UI behind identical Rottay facades; prepare
   the scorecard and recommendation, then stop for Codex acceptance/removal
   authorization;
8. certify the first P0 primitive slice;
9. run existing DataTable runtime vs stable TanStack v8 using the same renderer;
10. run current WidgetBoard runtime vs React Grid Layout 2 using the same public
   board;
11. certify canonical surfaces;
12. apply only the accepted stack to Candidates.

Do not install another supplier before DS-A002, DS-A003, DS-A004, DS-Q001L,
DS-S001 and DS-S005 close. Tailwind Variants is a spike, not accepted
architecture.

Start now with a read-only audit of the first not-complete ticket in that
sequence. Before editing, send:

```text
Ticket:
Layer owner:
Current defect with evidence:
Allowed files:
Public contract:
Dependencies:
Supplier responsibility:
Tenant matrix:
Locale/direction matrix:
Responsive/input/motion matrix:
Focused checks:
Visual proofs:
Non-goals:
Dirty-worktree overlaps:
Questions:
```

If the documents conflict, if ownership is ambiguous, or if your choice would
change the architecture, stop and ask concrete questions. Do not improvise.

For implementation:

- work one bounded ticket at a time;
- use repository-safe editing tools available in Claude Code; preserve diffs
  and never overwrite files through shell redirection;
- preserve unrelated dirty-worktree changes;
- use `rg` for discovery;
- perform Pass 1 robustness/contract and Pass 2 adversarial craft;
- run heavy processes serially;
- update the relevant documentation/evidence;
- leave the ticket at `review`;
- deliver the evidence package defined in the runbook.

Visual quality is a release requirement, not an optional cleanup. Inspect live
rendering at realistic sizes. The same component tree must prove materially
different typography, density, corners, borders, surfaces, controls, icons,
focus and motion under contrasting tenant profiles.

When the ticket is ready, stop and hand it to Codex for independent audit. Do
not continue into the next ticket until the audit result is known, unless the
user explicitly authorizes a separate non-overlapping lane.

---
