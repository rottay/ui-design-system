---
"@rottay/design-system": patch
---

The AppShell bottom bar pads its navigation strip `0 var(--ds-spacing-3)`.

The bar's navigation body read `--ds-app-shell-navigation-body-padding` with a
resting value of its own, but that channel is produced in every scope at the
sidebar track's four-sided padding, so the bar's resting value never painted:
the bar wore the track's block padding, including the 28px the track adds at
its block end, and grew past the 64px the shell reserves for it. The bar now
states its strip padding directly: no block padding, `--ds-spacing-3` inline.
The bottom bar has not shipped in a release.

AppShell is painted by a presentation skin that every engine shares, so its
Classic and Rustic renders change in the same way.

DECLARED VISUAL CHANGE, measured in Chromium on the real component (bithire,
390px wide), in the document scope and in a nested `[data-ds-root]`:

| bottom bar | before | after |
| --- | --- | --- |
| body padding | 8.99 / 8.99 / 36.99 / 8.99px | 0 / 8.99 / 0 / 8.99px |
| bar height, text link | 68.11px | 64px |
| bar height, 44px items | 90.97px | 64px |
| bar height, 44px items, 34px bottom safe area | 124.97px | 79px |

The sidebar track is unchanged.

Consumer notes:

- `--ds-app-shell-navigation-body-padding` and the superseded
  `--ds-shell-navigation-body-padding` keep governing the sidebar track and the
  drawer; they no longer reach the bottom bar. An application that authors
  either one for its track no longer pads the bar with it.
- While `collapsed` is true the bar body still wears
  `--ds-app-shell-navigation-body-padding-collapsed`, as before.
- This supersedes the consumer note of the AppShell focus-signature changeset:
  the default bar is no longer taller than the block-end space the shell
  reserves, so the `underline` signature is no longer hidden under it.
