---
"@rottay/design-system": patch
---

Button reads the focus offset of its own tenant scope.

`--ds-button-focus-ring-offset` is the root alias
`var(--ds-focus-ring-offset, 2px)`. It was also restated under
`@media (prefers-contrast: more)` at `:root`, which kept it out of the root-alias
table, so a tenant scope on a nested `[data-ds-root]` never restated it and its
Buttons kept the DOCUMENT's offset. The restatement is retired: the alias is
tabled and every scope that states the focus signature restates it.

DECLARED VISUAL CHANGE, Button `outline-offset` in a nested `[data-ds-root]`
whose focus style differs from the document's, measured in Chromium after
keyboard focus in the three first-party verticals. The outline is transparent in
normal mode and is the visible indicator in forced colors.

| nested scope | document | before | after |
| --- | --- | --- | --- |
| `ring` | `glow` or `underline` | 0px | 2px |
| `underline` | `ring` | 2px | 0px |
| `glow` | `ring` | 2px | 0px |

The document scope is unchanged in every signature, increased contrast included:
the alias follows the root contrast floor on `--ds-focus-ring-offset` (3px before,
3px after). The box-shadow signature was already the nested scope's own. Every
compiled theme and tenant artifact gains one declaration in its base rule,
`--ds-button-focus-ring-offset: var(--ds-focus-ring-offset, 2px)`; a tenant that
authors the Button offset keeps its value.

DECLARED LOSS under increased contrast: a Button in a nested `[data-ds-root]`
no longer inherits the document's 3px offset under `prefers-contrast: more`; it
reads its own scope's offset (2px for `ring`, 0px for `underline` and `glow`).
The contrast floor is a document-root rule and does not reach a nested scope,
for this channel as for the signature itself.
