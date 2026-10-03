---
"@rottay/design-system": minor
---

`Alert` now owns what the deprecated `Callout` renders on the Modern engine: a
callout can be written as an alert with the same markup and the same
announcement.
`<Callout tone title icon closable action>{body}</Callout>` is
`<Alert tone message={title} description={body} icon closable action emphasis="subtle" announce="tone" />`.
`Callout` itself is unchanged.

**Added to `AlertProps`**

- `emphasis?: 'standard' | 'subtle'` (default `'standard'`). `subtle` stamps
  `data-emphasis="subtle"` and the Modern alert skin washes one tint step
  lighter (step 4 instead of step 8) through the existing
  `--ds-alert-<tone>-wash-subtle` channels. No new token, channel or selector.
- `announce?: 'alert' | 'status' | 'tone'` (default `'alert'`). `status`
  renders `role="status"`; `tone` renders `role="alert"` for warning and danger
  and `role="status"` for info and success.
- `message` is required unless `description` is given. `AlertProps` is now a
  union over that content pair, so a body-only notice
  (`<Alert description="…" />`) type-checks and an alert with neither does
  not. Every usage that type-checked before still does. `AlertProps` is a type
  alias rather than an interface: `interface X extends AlertProps` no longer
  compiles and becomes `type X = AlertProps & { … }`.

An Alert that names neither `emphasis` nor `announce` renders the markup it
rendered before: `role="alert"`, no `data-emphasis`, the same attribute set.

**Behaviour change: Alert dismiss identity (Modern engine)**

- Before: a dismissed Alert re-opened when its primitive (string or number)
  `message` changed.
- After: it re-opens when its primitive `message` or its primitive
  `description` changes.
- Consequence: a mounted closable Alert now re-opens when its primitive
  description changes, under a static message or under no message.
- Nothing that used to re-open now stays shut.
- Non-primitive content still has no identity: when neither `message` nor
  `description` is primitive, a dismissal is permanent for the instance.

**Behaviour change: the empty Alert (Modern engine)**

An Alert with no `message`, `description`, `children` or `action` (reachable
only from untyped callers, or with an explicitly empty `message`) now renders
nothing. It used to render an empty assertive live region holding a bare icon.

**Callout to Alert: the dismiss delta**

The rewrite is not dismiss-equivalent. Callout keys a dismissal on its body
alone; Alert keys it on message and description together. Every change that
re-opens a Callout re-opens its Alert rewrite. In the other direction, a
Callout whose title changes over an unchanged body stays dismissed, and its
Alert rewrite re-opens.

**Classic and Rustic: what Callout's own renderers carry that Alert does not**

Both engines are frozen and are not changed here. On them Alert ignores
`emphasis`, `announce` and `action`. Retiring Callout would therefore lose, on
those two engines:

- the action tray: Callout renders `action` under the body, Alert drops it;
- the dedicated callout tint set (`CALLOUT_COLORS`: the 50 / 200 / 800 / 500
  steps of each status colour for background, border, text and icon);
- the title-above-body layout in Callout's own markup and class vocabulary
  (`rottay-callout-*`), including a body with no title; Rustic Alert always
  renders its message line, so a body-only notice gets an empty label;
- on Rustic, the `data-part="action"` tray anatomy. Rustic Alert stamps
  `data-part="action"` on its close button instead.

**Known defect, unchanged here**

Alert's default still announces every tone assertively (`role="alert"`),
including info and success, which interrupts the user for a status message
(WCAG 4.1.3 Status Messages). Callers can opt out today with
`announce="tone"` or `announce="status"`. Flipping the default changes what
existing alerts announce, so it belongs to the next major, with a consumer
note.

```contract-diff
signature .#AlertProps — gains optional `emphasis` (`'standard' | 'subtle'`) and `announce` (`'alert' | 'status' | 'tone'`); `message` is required unless `description` is given; now a union type alias, so an interface can no longer extend it
```
