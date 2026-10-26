---
"@rottay/design-system": patch
---

`SearchCommandBar` voice help gains owner class hooks on its copy, steps, footer and actions
(`ds-search-command-bar__voice-help-copy`, `__voice-help-step`, `__voice-help-footer`,
`__voice-help-actions`), beside the existing `data-part` attributes; the voice badge, voice help and
voice help list already carried theirs. In the `search-command-bar` skin, the voice badge, voice help
drawer and the search shell's error, badge-ladder and permission-blocked rules now also reach their
elements by class, as a second selector next to the part one, at the same specificity; every
`[data-part]` selector stays. The four vertical CSS bundles carry the same selectors. Rendered markup
changes only by the new class tokens.
