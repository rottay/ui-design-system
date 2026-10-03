---
"@rottay/design-system": patch
---

Five tenant theme fields that could be authored but reached no paint are
connected again.

A tenant document or a static theme could state each of these fields, the
schema admitted it, and nothing read the result. Each now reaches the node it
names on the Modern engine. A tenant that authors none of them sees no change:
every channel keeps its resting value as the fallback of the same chain, and no
first-party vertical states any of the five.

| field | emitted as | read by | resting value (unchanged) |
| --- | --- | --- | --- |
| `chrome.sidebar.itemHeight` | `--ds-sidebar-item-height` | `--ds-menu-item-height`: block size of a top-level menu row | `var(--ds-spacing-12)` |
| `chrome.sidebar.iconSize` | `--ds-sidebar-icon-size` | `--ds-menu-icon-size`: glyph size of a menu icon | `var(--ds-icon-sm-size)` |
| `chrome.sidebar.iconColumnSize` | `--ds-sidebar-icon-column-size` | `--ds-menu-icon-column-size`: inline and block size of the icon plate | `var(--ds-spacing-6)` |
| `chrome.sidebar.childPaddingInline` | `--ds-sidebar-child-padding-inline` | `--ds-menu-child-padding-inline`: inline padding of a nested menu row | `var(--ds-sidebar-item-indent, var(--ds-spacing-2))` |
| `chrome.collapse.border` | `--ds-collapse-border-color` | the border colour of a bordered Collapse panel | `var(--ds-collapse-root-default-idle-border-color, var(--ds-color-border))` |

The four sidebar fields follow the fields beside them (`itemGap`,
`itemPaddingInline`, `itemChildHeight`, `itemFontSize`): the tenant value is
emitted at a `--ds-sidebar-*` root and the menu family chains its own channel
off that root. `childPaddingInline` is read ahead of `itemIndent`, which used
to be the only field that reached the nested-row padding; a tenant that authors
`itemIndent` alone keeps what it has today.

`chrome.collapse.border` is a COLOUR, not a border shorthand. It is emitted
under the name the engines read as a colour; the panel keeps its own width and
style. A value such as `1px solid #ccc` is not a colour and leaves the panel
without a border.

DECLARED VISUAL CHANGE for a tenant that already authored one of these fields. One known document authors `sidebar.iconSize`: the `themanagementmiami` seed (`platform/packages/platform/tenancy/seeds/tenant-themes/themanagementmiami`, the input of its DB migration script) and the DS fixtures `themanagementmiami` (18px) and `torture` (30px). On Modern a Menu rendered under such a document shows glyphs at the authored, density-fixed size instead of the resting `--ds-icon-sm-size` (16px nominal, density-scaled; 14.1px measured at the bithire root). Whether a deployed tenant row carries this value is not known from the repositories.
Measured in Chromium on the bithire vertical, under the document root and under
a nested `[data-ds-root]`, with the same result in both:

| authored | before | after |
| --- | --- | --- |
| `sidebar.itemHeight: 56px` | top-level row at its resting height | top-level row 56px high |
| `sidebar.iconSize: 20px` | glyph at its resting size | glyph 20px |
| `sidebar.iconColumnSize: 32px` | icon plate at its resting size | icon plate 32px by 32px |
| `sidebar.childPaddingInline: 12px` | nested row at its resting padding | nested row padded 12px, plus the level indent at the start |
| `collapse.border: #ff00aa` | `rgb(229, 229, 229)` panel border | `rgb(255, 0, 170)` panel border, 1px solid as before |

Nested rows keep `itemChildHeight`: `itemHeight` sizes top-level rows only. An
authored length is used as written and does not scale with the density dial;
the resting values still do.

Classic and Rustic are unchanged in source. Both already read
`--ds-collapse-border-color` as the Collapse border colour, so a tenant that
authors `chrome.collapse.border` now gets that colour on those engines too.
They do not read the four sidebar roots.

Each compiled first-party vertical restates the four menu channels with the
chained text; no channel is added or removed and their computed values are the
same.
