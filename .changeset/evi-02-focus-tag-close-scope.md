---
"@rottay/design-system": patch
---

The Tag close control wears the tenant focus signature in every scope.

The Modern tag skin painted the close control's keyboard focus as
`var(--ds-tag-close-focus-ring, <literal>)`, while the clickable shell beside it
painted `var(--ds-tag-focus-ring, var(--ds-focus-ring, <literal>))`. The tag
channels are facade channels: they exist only where a vertical or tenant block
matches, `html[data-tenant='<vertical>']` or a `[data-ds-root][data-vertical]`
root. On a document root that matches neither (a tenant slug other than the
vertical on an `html` with no `data-ds-root`), `--ds-focus-ring` still reaches
the close control from the root tokens but `--ds-tag-close-focus-ring` does
not, so the close fell straight to its literal: a 2px ring of the chip ink at
26 % alpha, under ring, underline and glow alike, while a nested
`[data-ds-root]` painted the signature.

The close now falls back through `--ds-focus-ring` before the literal, the same
chain the deriver states for the channel and the shell already used. Where the
channel reaches, nothing changes.

In forced colors both tag focus stops floor their outline at
`max(2px, var(--ds-focus-ring-width, 2px)) solid Highlight`; a glow signature
states a 1px ring width, which had thinned the outline to 1px.
