---
"@rottay/design-system": patch
---

Button's disabled dimming follows the tenant's `states.emphasis` decision.

`presentation/components/button/index.css` declared
`--ds-button-disabled-opacity: 0.58` at `:root`: a literal no compile restated,
so the most common control ignored the dial every other disable-able family
already reads. It is now declared as `var(--ds-state-disabled-opacity)`, the
same `:root` alias input, select and some thirty other families carry, and the
root-alias law restates it in every scope that states the dial — the vertical
artifact, a tenant document's delta, a container scope. No deriver emits it:
there is one emission path. A `var()` in a custom property resolves on the
declaring element, so the restatement is what makes a nested `[data-ds-root]`
scope read ITS dial rather than the document root's.

DECLARED VISUAL CHANGE, measured in Chromium (computed `opacity` of a disabled
Modern Button), per scope:

| scope | `states.emphasis` | before | after |
| --- | --- | --- | --- |
| bithire | `strong` | 0.58 | 0.50 |
| evnto | `medium` | 0.58 | 0.60 |
| rottay | `medium` | 0.58 | 0.60 |
| no artifact (foundation floor) | — | 0.58 | 0.60 |
| a tenant authoring `subtle` | `subtle` | 0.58 | 0.68 |

Pagination, stepper and stepper-compounds follow through their own alias
chains (`--ds-pagination-disabled-opacity`, `--ds-stepper-disabled-opacity`),
and so does every family that composes Button. A palette-only tenant does not
move the value; a tenant differing only in `states.emphasis` does.

FROZEN-ENGINE EFFECT, named (owner ruling 2026-10-03): Classic
`.ant-btn:disabled` opacity moves with `states.emphasis` through the shared
channel (`html[data-tenant] .ant-btn:disabled` reads
`--ds-button-disabled-opacity`): 0.58 -> 0.50 under bithire, 0.58 -> 0.60 under
evnto and rottay. No Classic byte changed; the freeze gate stays green by
construction. Rustic is unchanged: its disabled Button dims by its own literal
`0.5` and never read the channel.

Consumer note: an application reading `--ds-button-disabled-opacity` now
receives the tenant's `states.emphasis` value instead of 0.58 (app-bithire's
legacy button selectors in `src/styles/forms.css` move 0.58 -> 0.50). To pin a
value, author `chrome.controls.disabled.opacity`: an explicit value still wins
over the dial in the compile and in every emitted scope, and a declaration on a
descendant scope still wins for its subtree.

Scope limit, named: a nested `[data-ds-root][data-vertical]` island without
`data-tenant` resolves its own vertical's dial rather than inheriting an outer
tenant's explicit value — the behaviour `--ds-input-disabled-opacity` already
has. An island that carries the tenant attribute keeps the tenant's value.

Known and unchanged in kind, each recorded as a separate packet:

- A disabled Button inside an ancestor that also dims by the dial (a disabled
  Form, FormField, Card, Dropdown trigger, Collapse panel or Tree row)
  multiplies the two opacities: 0.29 -> 0.25 on a `strong` tenant, 0.35 -> 0.36
  on `medium`. Button reads no disabled context, so this needs a consumer to
  disable both.
- Dark-mode disabled ink: `--ds-color-text-disabled` has no dark value, so a
  disabled Button's label measures 2.13:1 against its own fill before any
  dimming (1.44:1 at the former 0.58; 1.35:1 at 0.50, 1.50:1 at 0.60). Light
  canvases measure 2.42:1 at 0.50 and 3.06:1 at 0.60 from 8.4-8.6:1 undimmed.
