---
"@rottay/design-system": patch
---

A disabled Card's dimming follows the tenant's `states.emphasis` decision.

`presentation/components/card/index.css` declared
`--ds-card-disabled-opacity: 0.5` at `:root`. The Modern Card skin paints
`opacity: var(--ds-card-disabled-opacity, var(--ds-state-disabled-opacity))`,
so the literal answered first and the fallback to the dial never fired: every
unavailable Card dimmed to 0.5 whatever the tenant decided. The channel is now
declared as `var(--ds-state-disabled-opacity)`, the same `:root` alias Button,
Input, Select and some thirty other families carry. No deriver emits it and the
skin is unchanged; the root-alias law restates the alias in every scope that
states the dial, so a nested `[data-ds-root]` scope reads its own dial.

DECLARED VISUAL CHANGE, measured in Chromium on the real Modern Card under
`EngineProvider` (computed `opacity` of the root, `data-engine="modern"` on
`html` and on the nested root). It applies to a `disabled` Card and to a
`loading` Card, which stamps the same unavailable state:

| scope | `states.emphasis` | before | after |
| --- | --- | --- | --- |
| bithire | `strong` | 0.50 | 0.50 |
| evnto | `medium` | 0.50 | 0.60 |
| rottay | `medium` | 0.50 | 0.60 |
| a tenant authoring `subtle` | `subtle` | 0.50 | 0.68 |
| a tenant authoring `medium` | `medium` | 0.50 | 0.60 |
| a tenant authoring `strong` | `strong` | 0.50 | 0.50 |

A palette-only tenant does not move the value; a tenant differing only in
`states.emphasis` does. No shipped scope dims further than before: 0.5 is the
`strong` stop and the former literal, so the legibility of disabled card text
only rises (evnto light, body ink against the dimmed card: 2.46:1 to 3.06:1;
title 3.40:1 to 4.67:1). No accessibility floor read the literal.

An explicit value still wins. `chrome.cardComponent.disabledOpacity` compiles
to an outright `--ds-card-disabled-opacity` in the tenant scope (0.3 authored
over a `subtle` dial measures 0.3), and a declaration on a descendant scope
still wins for its subtree.

Frozen engines: none reads the channel. The Classic and Rustic Card have no
disabled state and their computed style is byte-identical before and after.

Scope limit, named: a nested `[data-ds-root][data-vertical]` island without
`data-tenant` resolves its own vertical's dial rather than inheriting an outer
tenant's explicit `chrome.cardComponent.disabledOpacity`, the behaviour
`--ds-button-disabled-opacity` and `--ds-input-disabled-opacity` already have.
Before, such an island inherited the outer explicit value.

Consumer note: an application reading `--ds-card-disabled-opacity` receives the
tenant's dial instead of 0.5.

Known and unchanged in kind: on rottay's dark canvas the disabled card body ink
(`--ds-color-text-disabled`, which has no dark value) measures 1.81:1 against
the card before any dimming; the dimmed pair moves 1.28:1 to 1.37:1.
