# WO-SKIN-05 — display + layout — design contracts

Three pipelined checkpoints, 23 components, 624 sites. ALL standing laws apply (see
`README.md` in this folder + the data-part contract doc). Inventory:
`wo-skin-05-display-layout-inventory.md` — code over inventory on any disagreement.

Zero sites in this batch are true RUNTIME paint. Everything that looked continuous
(QRCode's canvas `fillStyle`, Tree/Calendar/Splitter's drag math, Tooltip's portal
`top`/`left`) lands outside the counted paint channels entirely. What remains is STATIC or
STATE-SELECTED, and STATE-SELECTED becomes a `:hover` / `[data-x]` rule.

## Checkpoint decomposition

| ckpt | components | sites |
| --- | --- | --- |
| **D1 — surfaces + media** | Card, Image, Carousel, QRCode, Avatar, Badge, Tag, Kbd, Empty | ~256 |
| **D2 — data display** | Tree, Calendar, List, Timeline, Descriptions, Statistic, Typography, Tooltip, Callout | ~302 |
| **L — layout** | Box, Layout, Collapse, Divider, Splitter | ~66 |

---

## The law this batch is written under (P-76)

Tailwind's preflight sits in the unnamed `base` layer, which sorts AFTER every `rottay-*`
layer. It zeroes `border-width` (and forces `border-style: solid`), `margin` and `padding`
on every element. **So every `theme.css` and `personality.css` bridge rule on those channels
is DEAD** — 144 padding/margin declarations across the three engines, plus the border-width
family. `border-color`, `color`, `background`, `box-shadow` and `border-radius` are
unaffected and DO paint.

Consequences that bind every agent on this batch:

1. **Do not revive a dead bridge.** If a `theme.css` rule declares a border width or a
   padding on a component you migrate, it is not painting today. Reproducing its VALUE in
   an unlayered skin would make it paint for the first time — a visual change, not a
   migration. Reproduce what the browser RENDERS, not what the CSS says.
2. **An unlayered skin outranks preflight.** That is the whole reason this program works.
   When you move an inline border into a skin, the skin wins — same pixels. When you move a
   border that was NEVER inline, you have invented one.
3. **When in doubt, measure.** The instruments: `page.evaluate` + `getComputedStyle` for the
   rendered value, CDP `CSS.getMatchedStylesForNode` for which rule wins (matches come back
   in INCREASING precedence — the last one wins). Hand-reading a stylesheet is how the
   WO-SKIN-03 accent-bar law ended up right about the outcome and wrong about the cause.

---

## Checkpoint D1 — surfaces + media

### D1.1 Avatar: FREEZE the clip (P-75)

`[data-tenant] .avatar` (theme.css:1069) forces `width: 40px; height: 40px; overflow: hidden`
on the container, which carries DaisyUI's structural `avatar` class. The real size lives
INLINE ON A CHILD (`width: var(--ds-avatar-${size}-size)`). Nothing contests the container,
so **the size prop does not work in modern**: children above 40px are clipped, children below
it are haloed by the container's painted disc. Measured; filed as P-75.

The migration must PRESERVE this. The skin must NOT size the container, must NOT remove
`overflow: hidden`, and must NOT drop the `avatar` class. Fixing it is P-75's job — a visual
change with its own baselines. A skin that "helpfully" sizes the container is a regression
wearing a migration's clothes.

### D1.2 Card and Badge already have skins

Card's root was migrated by WO-ARC-07; Badge has a narrow transform-only skin. Both are
PARTIAL. Extend the existing skin files — do not create a second file for the same
component, and do not restate rules that already exist there. Read them first.

### D1.3 Standing

Image, Carousel, QRCode, Tag, Kbd, Empty are straight transcription. QRCode's canvas
`fillStyle` is not CSS and stays where it is. Empty's bridge rule sets a root `color`
uncontested in BOTH engines — that channel is preflight-SAFE, so it paints today: preserve
it, and note the token-name mismatch between the bridge var and the component's own var in
the migration report.

---

## Checkpoint D2 — data display

### D2.1 Callout must mint a fresh scope class

Callout carries DaisyUI's bare `alert` class, exactly as Alert/Toast/Message/Notification
do — and Alert is ALREADY MIGRATED AND SHIPPED. Alert's skin deliberately avoided the bare
`rottay-alert` (it is a live personality selector) and uses `rottay-alert-shell`. Callout has
NO first-party classname at all today.

Mint a brand-new scope class (`rottay-callout-shell` or similar), grep-verified free across
CSS **and** CSS-in-JS. **Never reuse `rottay-alert` or `rottay-alert-shell`** — a rule
anchored to a classname another component renders repaints that component. This is the same
trap that forced overlay/Modal's compounds to be renamed in WO-SKIN-04.

On the border channel, follow the CORRECTED Alert law: DaisyUI's own
`.alert { border-width: var(--border) }` (a layer above preflight) is what paints the border
on these roots. `personality.css`'s accent-bar rule is DEAD (preflight kills it). So a skin
border must be the `border` SHORTHAND — not to suppress an accent bar (it cannot
materialize), but because a longhand setting only `border-color` leaves DaisyUI's
`var(--border)` in charge of the WIDTH.

### D2.2 Tree's two-layer hover is REAL — preserve both mechanisms

CSS paints the outer wrapper on `:hover`, and JS paints the inner row imperatively. Both are
visible at once, and together they define the hover AREA. Collapsing them into one mechanism
shrinks the hover target — a behavior change the pixel gate may not even catch (the diff is
in what happens when the mouse is somewhere the baseline never photographed). Move the
imperative write to a `:hover` rule on the SAME element it wrote to, and leave the outer
wrapper's rule alone.

### D2.3 Typography rustic's Link

Its rustic engine stamps the bare `rottay-link`, which navigation's SHIPPED Link skin
reserved. There is no live collision today (navigation's rules require the `-shell` suffix),
but the bare name is now BANNED for Typography's own scope class. Also note: this file's
internal implementation is named "Apollo" throughout — a retired engine name, deeper than
Anchor's WO-04 finding. Record it; do not rename inside a byte-exact migration.

### D2.4 Standing

Timeline's `.timeline-start/-middle/-end { color }` bridge is LIVE (color is a preflight-safe
channel) and genuinely paints item text today — preserve it. Statistic modern's title color
is likewise a live uncontested win. Calendar's own header comment claims DaisyUI classes it
does not have (7 buttons, zero DaisyUI classes) — the comment is wrong; the code is the
truth.

---

## Checkpoint L — layout

### L.1 Box's pass-through channels are NOT debt

Box exposes 8 of 9 unbounded style channels per engine BY DESIGN: it is the style-injection
escape hatch every other component's `style` prop flows through. Treating them as migration
debt is a category error — they have no fixed value to move. Only `borderRadius` and
`boxShadow` (enum-lookup-backed) are even theoretically migratable, and only if the enum is
closed. Everything else stays, and the counter's residual for Box is EXPECTED — say so in the
report, with the number.

### L.2 Divider's "extra line" was REFUTED

The with-text divider root carries `divider-horizontal`/`-vertical` and a theme.css bridge
declares `border-top`/`border-left` on it — but preflight zeroes the width, so it renders
nothing. Measured live (computed `border-top-width: 0px`, with a plain-divider control to
prove the harness). There is no extra line, nothing to preserve on that channel, and no trap.
Do NOT reproduce that bridge's border in the skin: it would paint a line that does not exist
today.

### L.3 Layout has zero anatomy

Not one first-party classname on any element in either engine — the widest greenfield in the
batch. It gets a full stamp pass in the pre-step.

---

## Pre-step coverage (all three checkpoints)

- Torture sections `?display1=1`, `?display2=1`, `?layout=1`, each with its own
  `data-testid` root and per-component Stack testids.
- Deterministic fixtures rendering every state a rule will key on. Calendar is DATE-DRIVEN:
  its spec MUST pin `page.clock.setFixedTime` to the recording day, or the baselines expire
  at midnight (the DatePicker lesson from WO-SKIN-02).
- Specs `display1-batch.spec.ts`, `display2-batch.spec.ts`, `layout-batch.spec.ts`: 4 rest
  shots each ({rottay,bithire} × {modern,rustic} × w1280) + interaction pins wherever hover
  paint exists — Tree's two-layer hover is MANDATORY (D2.2), and so is an Avatar row at
  three sizes (D1.1: the clip must be photographed before anyone touches it).
- Contract tests per checkpoint: every part + state attribute reaches the DOM.
- Each pre-step also GREPS the family's unit tests for assertions on inline paint
  (`toHaveStyle`, `.style.`, `getAttribute('style')`) and REPORTS them file:line without
  editing — the orchestrator adjudicates them while the migration runs.

---

## Orchestrator adjudications (settled during the pre-steps — binding on the migrations)

### A1. Collapse rustic must NOT reuse the `rottay-collapse` classname

The L pre-step asked whether rustic's root could take modern's `rottay-collapse` class. **No.**
`engines/modern/theme.css:655` declares `[data-tenant] .rottay-collapse { border-color;
border-radius }`, the selector carries no `[data-engine]` gate, and both engines' theme.css land
in the same `rottay-engines` layer. `border-radius` is a **preflight-SAFE channel** — it paints
(measured: 14px on modern's collapse). So giving rustic that classname would hand it a 14px radius
it does not have today: pixels moved, disguised as a naming choice. Rustic mints its own scope
class, grep-verified free.

The general rule, now that P-76 is understood: **before reusing any existing classname, check
whether a bridge rule targets it on a LIVE channel** (`color`, `background-color`, `box-shadow`,
`border-radius`, `border-color`). A dead channel (`border-width`, `margin`, `padding`) is harmless;
a live one is a silent repaint.

### A2. Tooltip's portaled bubble is scoped (done in the pre-step)

Tooltip modern carried NO first-party classname, and its bubble portals out of the tenant-scoped
tree — so its skin could only have anchored on a bare `[data-part='bubble']`, which is the
shared-vocabulary trap that has now bitten this program four times. Minted
`rottay-tooltip-bubble--{modern,rustic}` (grep-verified free, inert: a class with no rules).

### A3. Box stamps NO `data-part` of its own

The L pre-step defaulted Box to `data-part="root"`. Reverted. Box is the style-injection escape
hatch every other component composes with, so a default part puts `data-part='root'` on every
nested Box in the fleet: a skin rule of the form `.rottay-x [data-part='root']` would reach into
X's Boxes, and any query for X's own root matches them too. Box's skin anchors on its class.
(This one was caught by the ARC-09 real-engines suite, which is exactly what that suite is for.)

### A4. The ARC-09 real-engines tests now decide ownership STRUCTURALLY

`data-part` is a shared vocabulary, so as this program stamps more components, a query of the form
`container [data-part='x']` inside a composing component starts matching the anatomy of the
components it is BUILT FROM — which paint inline legitimately until their own batch migrates them.
The SelectionPreviewRail suite went red this way when Badge got stamped (the rail composes Badges).
All five ARC-09 suites now resolve ownership structurally: a node belongs to the component under
test iff no other `data-part='root'` sits between it and that component's own root. Any new
real-engines suite must do the same.

### A5. Two contract items were WRONG (code over contract)

List has no `selected`/`clickable` state anywhere in its source, and Calendar renders no
outside-month cells (its leading blanks are true placeholder divs, not adjacent-month dates). Both
were in the pre-step brief's state lists; neither exists. The pre-step correctly refused to invent
component API to satisfy a contract. Do not reintroduce them in the migration.
