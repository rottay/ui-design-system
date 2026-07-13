# WO-SKIN-03 status-family paint inventory (read-only)

All paths relative to `packages/core/src/components/primitives/feedback/`. Same
channel scope and class legend as the WO-SKIN-02 precedent (`skin02-fields-inventory.md`):
STATIC / CONDITIONAL / IMPERATIVE / REACT-STATE-HOVER. No component in this batch
carries `data-part` anywhere (grep-confirmed) and no skin CSS file exists yet for any
of the five — all five are "no prior skin," proposed classes below are grep-confirmed
FREE (no existing skin selector targets `rottay-skeleton*`, `rottay-rate`,
`rottay-progress-line/circle`, or any Alert/Spinner class).

---

## Skeleton (48 sites, 10 files) — THREE competing animation mechanisms + one orphaned fourth

Root landing: `engines/modern.tsx` (DaisyUI `skeleton` class, no local keyframe),
`engines/rustic.tsx` (locally injects its own pulse/wave keyframes per mount), plus
8 structurally-independent compound files that never touch the engine system at all.

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| root shape variants (circular/rect/rounded) | modern 161-178 | background,radius | STATIC (radius CONDITIONAL on variant) |
| avatar / title / paragraph lines | modern 187-218 | background | STATIC/CONDITIONAL (width by index) |
| root shape variants (rustic) | rustic 198-214 | background,radius,width,height | CONDITIONAL (pulse vs wave animation branch) |
| wrapper avatar/title/paragraph (rustic) | rustic 225-247 | background,radius | STATIC/CONDITIONAL |
| Table header/body cells | compound/Table 184-229 | background(shimmer),radius,border | STATIC (border divider CONDITIONAL on last-row) |
| Card image/title/body lines | compound/Card 170-213 | background(shimmer),radius,border | STATIC (image block CONDITIONAL on `hasImage`) |
| FormSkeleton label/input/submit | compound/FormSkeleton 161-193 | background(shimmer),radius | STATIC (label width CONDITIONAL by index formula) |
| ListItem avatar/lines | compound/ListItem 173-199 | background(shimmer),radius | STATIC (line width/height CONDITIONAL by position) |
| Avatar | compound/Avatar 181-190 | background(shimmer),radius | STATIC |
| Paragraph lines | compound/Paragraph 172-183 | background(shimmer),radius | STATIC (last-line width CONDITIONAL) |
| Text lines | compound/Text 163-186 | background(shimmer),radius | STATIC (last-line width CONDITIONAL) |
| Button | compound/Button 200-210 | background(shimmer),radius | CONDITIONAL (shape→radius, circle→square dims) |

**Animation mechanisms — three live, mutually inconsistent, plus one dead:**
1. **Modern engine**: no keyframe at all. Relies entirely on DaisyUI's external `.skeleton`
   class animation; component only sets `animationDuration`/`animationTimingFunction`
   (no `animation-name`) — those two properties are inert without the DaisyUI class present.
2. **Rustic engine**: injects its OWN `<style>` tag every mount (`rustic.tsx:187-190`,
   census `keyframesTag`-shaped even though not flagged) defining `rottay-skeleton-pulse`
   (opacity `1 → 0.4 → 1`) and `rottay-skeleton-wave` (background-position slide).
3. **All 8 compound files**: share one `shimmerStyle` object (`animation:
   'skeleton-loading var(--ds-skeleton-animation-duration, 1.5s) infinite'`) that
   references the GLOBAL keyframe `@keyframes skeleton-loading` in
   `tokens/css/foundation/animations/keyframes.css:395` (background-position
   `-200% → 200%`) — no local injection, correctly reuses the shared definition.
4. **Orphaned**: `tokens/css/engines/rustic/theme.css:1013-1020` defines `.ds-skeleton
   { animation: ds-skeleton-pulse ... }` with its own `@keyframes ds-skeleton-pulse`
   bottoming at opacity **0.5** — but neither `engines/rustic.tsx` nor any compound file
   ever applies the `ds-skeleton` (or `.ds-skeleton--*`) class. **This is the exact
   "detail-panel pulse .4/.5" pattern already solved once**: `rustic/skin/detail-panel.css`
   explicitly renamed its own pulse to `ds-detail-panel-pulse` (bottoming at 0.4, matching
   the component's inline value verbatim) specifically so it would not collide with the
   shared 0.5 `ds-skeleton-pulse`/`pulse`. Skeleton's rustic engine needs the identical
   treatment — its real inline keyframe (`rottay-skeleton-pulse`, 0.4 floor) has never been
   reconciled with the dead `ds-skeleton-pulse` (0.5 floor) sitting unused in the engine
   skin file. Any new skin work must not assume `.ds-skeleton` covers anything real.

**RUNTIME-DRIVEN paint**: none — Skeleton has no value/percent prop; only structural
props (rows, lines, avatar size/shape) that are STATIC-per-render, not per-frame.

**Token gaps (shorthand references undefined token, fallback silently wins)**:
`--ds-skeleton-border` (Table, falls to hardcoded `#e5e7eb`) and
`--ds-skeleton-header-bg` (Table, falls to `var(--ds-color-bg-secondary)`, itself
defined so effectively fine) — neither is defined anywhere in `tokens/`.
`--ds-card-body-padding` (Card) IS defined — false alarm, not a gap.

**Style prop**: root-level only in all 10 files (`...style` spread last on the
outermost element) — the census `stylePropIntoChild` tag on Table/Paragraph did not
reproduce on inspection; both merge `style` onto their own root div, not a child.

**No Text primitive used anywhere in this component** — every text-adjacent node is a
raw shimmer `<div>`; there is no label/caption rendering, so no Text color-prop mapping
applies to this file.

**Won't transcribe cleanly**: modern's DaisyUI-class-only animation has no equivalent
CSS the DS controls directly — a modern skin file would need to either keep depending
on DaisyUI's `.skeleton` keyframe or introduce a first-party replacement, which is new
behavior, not a residual fix.

---

## Alert (28 sites, 2 files) — cleanest file in the batch, zero animation

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| root container | modern 270-274 | background,color | STATIC (per-type lookup table) |
| close button | modern 286 | background,color,radius | STATIC |
| root container (rustic) | rustic 269-279 | background,border,radius,padding,fontSize | CONDITIONAL (compact ternary + per-type lookup) |
| message/description text | rustic 298-308 | fontWeight/opacity only, no color channel (inherits root) | STATIC |
| close button (rustic) | rustic 313-318 | background(none),opacity | STATIC |

No hover state, no imperative writes, no keyframes, no runtime-driven paint (dismiss
is boolean visibility, not a paint channel). Responsive `compact` prop generates a
scoped `<style>` block for padding/font-size media queries — layout only, not paint.

**Token layering split, not a gap**: modern's `TYPE_STYLES` use `color-mix(in srgb,
var(--ds-color-info) 10%, transparent)` — always resolves (base color tokens are
DS-foundational). Rustic's `TYPE_STYLES` use a THREE-level fallback
(`--ds-alert-info-bg → --ds-color-info-bg → `, no third literal) where
`--ds-alert-info-*` is defined ONLY inside the `rottay` vertical's generated artifacts
(`tokens/css/artifacts/rottay/index.css`), not in `foundation/themes/default.css`. Any
tenant not on the rottay artifact silently falls to `--ds-color-info-bg`/`-border`/
`-700`, which ARE grep-confirmed defined at the artifact layer too but NOT in the base
default theme — meaning Alert's rustic engine has no first-party-default color at all
below the two `--ds-alert-*`/`--ds-color-info-*` artifact layers. Worth flagging to the
team, not a rendering bug (chain still resolves for any tenant on a real artifact).

**Won't transcribe cleanly**: modern and rustic use genuinely different token strategies
(`color-mix()` off base color vs a dedicated `--ds-alert-*` layer) — a shared skin file
has to pick one convention, not merge both.

---

## Progress (18 sites, 4 files) — riskiest token-naming mismatch in the batch

Root landing: `engines/modern.tsx` (native `<progress>` + DaisyUI `radial-progress`),
`engines/rustic.tsx` (SVG circle + div/div line, conditional stripe keyframe),
`compound/Line`, `compound/Circle` (both engine-independent, transition-only).

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| circle (modern, DaisyUI) | modern 169-174 | `--value`(custom prop),color | STATIC/CONDITIONAL(status) |
| line `<progress>` (modern) | modern 195-205 | accentColor,background,radius,height | STATIC — plus native `value=` HTML attribute (not a style channel) |
| circle track+arc (rustic) | rustic 196-224 | stroke,strokeWidth | STATIC track / RUNTIME strokeDashoffset |
| line track+bar (rustic) | rustic 254-287 | background,radius | STATIC track / RUNTIME width% + CONDITIONAL stripe (status='active') |
| compound Line track+bar | compound/Line 254-273 | background,radius | STATIC track / RUNTIME width% |
| compound Circle track+arc | compound/Circle 250-271 | stroke,strokeWidth | STATIC track / RUNTIME strokeDashoffset |

**RUNTIME-DRIVEN paint — enumerate exactly which (the brief's specific ask)**:
1. Modern circle: `percent` rides a CSS **custom-property hatch** — `'--value': percent`
   consumed by DaisyUI's conic-gradient CSS, never touches a style channel directly.
2. Modern line: `percent` rides the native **`value` HTML attribute** on `<progress>` —
   not a style/paint channel at all, browser-native rendering.
3. Rustic circle + compound Circle (2 sites): `percent` → `strokeDashoffset` **SVG
   attribute** (not `style`), computed from circumference each render.
4. Rustic line + compound Line (2 sites): `percent` → inline **`width: ${percent}%`**
   directly in `style`.
   Four distinct mechanisms for the same concept, no two identical.

**ANIMATION**: only rustic's line type, only when `status === 'active'` — conditionally
injects `<style>@keyframes rustic-progress-active{...}` (background-position stripe
slide), matching the census `keyframesTag` trap. Compound Line/Circle have zero
keyframes, only a `transition` (width / stroke-dashoffset, 0.3s ease) — not
infinite-loop paint, lowest risk of the four Progress files.

**Token gaps — the riskiest finding in this batch**: rustic's entire `STATUS_COLORS`
map (`--ds-progress-normal-color`, `-success-color`, `-error-color`, `-active-color`)
and its `--ds-progress-track-color` are **undefined everywhere in `tokens/`** — zero
grep hits. The tokens that DO exist for Progress (`foundation/themes/default.css`,
engine `theme.css` files) use a completely different vocabulary:
`--ds-progress-fill-primary/-success/-error` and no track-color token at all (track
color is hardcoded via `--ds-color-bg-secondary`/`--ds-color-neutral-100` fallback
chains, not a dedicated progress token). Rustic's engine has silently run on
literal-fallback colors (`var(--ds-color-primary-500, ...)` etc., which DO resolve)
since day one — functionally fine, but it means **no tenant has ever been able to
theme rustic Progress's status colors via a dedicated Progress token**, unlike modern
(`STATUS_TOKEN_COLORS`, all four correctly point at real `--ds-color-*` tokens) and
unlike classic/modern's shared `--ds-progress-fill-*` layer. `--ds-progress-circle-size`
(modern circle sizing) is also undefined, falls to a hardcoded `6rem`.

**Won't transcribe cleanly**: reconciling rustic's dead `-normal/-success/-error/
-active-color` names against the real `-fill-primary/-success/-error` names is a
naming decision the team needs to make explicitly (rename rustic to match, or wire the
existing fallback-only names into the theme) — not a mechanical residual fix.

---

## Spinner (13 sites, 2 files) — two more per-mount keyframe injections, joins a large existing family

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| spinner ring (modern) | modern 101-113 | border,borderTopColor,radius | STATIC |
| label text (modern) | modern 114-116 | color | STATIC(conditional render) |
| spinner ring (rustic) | rustic 80-87 | border,borderTopColor,radius | STATIC |
| label text (rustic) | rustic 113 | color | STATIC(conditional render) |

**ANIMATION**: both engines inject their own `<style>` per mount (census `keyframesTag`
on both) — modern's `rottay-ds-spin` (`rotate(0→360deg)`) and rustic's `rustic-spin`
(`to{rotate(360deg)}`), different names, functionally identical content. Neither reuses
the two GLOBAL spin keyframes that already exist (`foundation/animations/keyframes.css
@keyframes spin`, `rustic/theme.css @keyframes ds-spin`) — and this is not unique to
Spinner: the codebase already has at least 9 other independently-named spin keyframes
across rustic skin files (cascader, select, switch, tree-select, form, table, filter-panel,
voice-input-button, command-home) plus the modern `theme.css @keyframes spin`. Spinner —
the one component whose entire purpose IS spinning — is simply the newest entrant into
an already-large duplicate-keyframe family, not a novel defect.

**Token gaps**: `--ds-spinner-duration` (rustic, bare name) is undefined — the real
token is `--ds-spinner-animation-duration` (`tokens/css/components/spinner.css:40`);
falls to hardcoded `0.8s`. `--ds-spinner-label-size`/`-label-color` (rustic) are also
undefined, fall to `0.875rem`/`inherit`. Separately (not a gap, a **value conflict**):
`--ds-spinner-{sm,md,lg,xl}-size` is defined TWICE with different values —
`foundation/themes/default.css` (sm=1.25rem) vs `components/spinner.css` (sm=1rem) —
both resolve, but disagree, a second-emitter-shaped risk worth a team flag even though
it's outside this batch's direct scope.

**Odd token reuse, not a bug**: modern's rotation duration reads `--ds-motion-slow`
(320ms) — a token semantically scoped for state-transition durations elsewhere in the
theme, repurposed here as a full-rotation duration (≈3 rotations/sec), rather than the
dedicated `--ds-spinner-animation-duration` (0.75s) that already exists for this exact
purpose.

**RUNTIME-DRIVEN paint**: none — Spinner has no value prop, animation is
indeterminate/infinite by design.

---

## Rate (9 sites, 2 files) — the batch's one genuine hover-interaction component

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| star (rustic) | rustic 422-429 | color,transform(hover),outline(focus) | CONDITIONAL priority chain: base→active/inactive→disabled→readOnly→hover→focus |
| half-star overlay (rustic) | rustic 465-475 | color(×2 layered spans) | RUNTIME (isHalfFilled) |
| star (modern) | modern 332-343 | color,`--tw-ring-color`(custom prop) | CONDITIONAL (isFilled/isHalfFilled ternary) |
| half-star overlay (modern) | modern 380-399 | color(×2 layered spans) | RUNTIME (isHalfFilled) |

**RUNTIME-DRIVEN paint — the fractional-star case the brief called out**: in BOTH
engines, every star's active/inactive color is recomputed each render from
`displayValue` (hover value if hovering, else committed value) compared against that
star's index — effectively N runtime-driven paint decisions per render (N = `count`,
default 5), not a fixed count of "sites." Half-filled stars additionally render TWO
stacked spans (inactive background + active foreground clipped to 50% width via
`overflow:hidden` + `width:50%`) — the overlay TECHNIQUE is identical in both engines,
but rustic clips with an absolutely-positioned `halfStar` wrapper while modern clips
with `width:'50%'` + `overflow-hidden` directly on the foreground span. All of this
paint rides plain inline `style.color`, no custom-property hatch, no CSS class
switching.

**Interaction paint asymmetry (the brief's "hover stars!" flag) — genuinely two
different mechanisms per engine, not just a value difference**:
- **Rustic**: 100% REACT-STATE. `onMouseEnter`/`onMouseLeave` set `hoverValue` state;
  the hover **transform: scale(1.1)** and focus **outline** are both plain conditional
  style-object merges (`styles.star.hover`/`.focus`), no CSS pseudo-class anywhere.
- **Modern**: SPLIT mechanism. The scale effect (`hover:scale-110`) is a genuine
  Tailwind **CSS `:hover` pseudo-class** — the one real CSS-driven hover in this whole
  five-component batch. But the focus ring (`ring-2 ring-offset-2`, conditionally
  applied via template string on `isFocused` state) is still REACT-STATE, and the
  active/inactive star COLOR itself is REACT-STATE regardless of engine. So modern is
  hover-CSS + focus-react-state + color-react-state, three different mechanisms
  layered on one element — the only component in the batch mixing real CSS interaction
  with React-state interaction on the same node.

**Token layering (not a gap — a dead-vocabulary layer, matching the Rate second-emitter
pattern)**: both engines correctly read `--ds-rate-active-color`/`-inactive-color`/
`-focus-ring-color`, all defined in `tokens/css/components/rate.css`. But a SEPARATE,
never-consumed vocabulary also exists — `foundation/themes/default.css` and the rottay
artifacts define `--ds-rate-color`/`-color-active`/`-color-hover` (note the inverted
word order vs `-active-color`) — neither engine file ever reads these three. Same shape
as the DS's known second-emitter pattern (one layer defines tokens under a name the
consuming component never reads); low risk since the component's real tokens do
resolve, but worth flagging so nobody "fixes" the wrong layer later.

**No imperative writes, no keyframes, no wall-clock/timer paint** in either file —
confirmed clean on both remaining CRITICAL LAWS.

---

## Cross-batch notes

- **Zero `data-part`/skin CSS anywhere in this batch** — same greenfield-anatomy state
  as the WO-SKIN-02 non-Input/Button components; all five need anatomy added AND
  skinned, and all proposed scope classes below are grep-confirmed free.
- **No shorthand-then-`undefined`-longhand clobber pattern found anywhere** (the
  ReactDOM-removal trap) — checked every conditional `undefined` (e.g. Skeleton/Table's
  `borderBottom: ... : undefined`) and each is a single standalone longhand, never
  preceded by a full shorthand assignment on the same style object.
- **No `<Text>` primitive usage anywhere in the batch** — every text node is a raw
  span/div with inline `color`; no `subtle`/`muted` prop-mapping surface exists to check.
- **No `style` prop forwarded into a child primitive anywhere** — all five components
  are either leaf divs/spans or spread `style` once onto their own root.
- Proposed one-vocabulary `data-part` map per the brief (root, indicator, track, fill,
  icon, label, description, action) maps cleanly onto: Alert (root, icon, label,
  description, action=close-button); Spinner (root, indicator, label); Progress
  (root, track, fill, label=info-text); Rate (root, indicator×N=star, per this needs an
  extra repeatable part the shared vocabulary doesn't name); Skeleton doesn't fit the
  vocabulary at all — it has no "fill" concept, its parts are structural
  (avatar/title/line/cell), which is expected since Skeleton is a placeholder shape
  generator, not a status/value indicator like the other four.

---

## Summary (12 lines)

- Skeleton: 48 sites / 10 files (Table 9, rustic-engine 7, Card 6, modern-engine 6, FormSkeleton 5, ListItem 4, Avatar 3, Paragraph 3, Text 3, Button 2).
- Alert: 28 sites / 2 files (rustic 16, modern 12) — cleanest file in the batch, zero animation, zero hover, zero runtime paint.
- Progress: 18 sites / 4 files (rustic-engine 7, modern-engine 5, compound/Line 4, compound/Circle 2).
- Spinner: 13 sites / 2 files (modern 9, rustic 4).
- Rate: 9 sites / 2 files (rustic 6, modern 3) — sites undercount the real per-star fan-out (N stars × runtime color decision each).
- Biggest animation risk: Skeleton has FOUR competing pulse/shimmer mechanisms for one concept — modern (no keyframe, DaisyUI-owned), rustic (local inline 0.4-floor pulse), 8 compounds (shared global `skeleton-loading` shimmer keyframe, correctly reused), and a dead `ds-skeleton-pulse` (0.5-floor) sitting unused in the rustic engine skin — the exact "detail-panel pulse .4/.5" precedent replaying inside Skeleton itself, unresolved.
- Biggest token risk: Progress rustic's whole `STATUS_COLORS` map (`-normal/-success/-error/-active-color`) plus `-track-color` reference tokens that are undefined anywhere in `tokens/`; the real theme layer uses `-fill-primary/-success/-error` instead — functioning only because of hardcoded hex fallbacks.
- Third risk: Rate's hover mechanism is split per engine — rustic 100% react-state, modern mixes real CSS `:hover` (scale) with react-state (focus ring, color) on the same star element; both also read a live `-active-color`/`-inactive-color` token pair while a separate, never-consumed `-color-active`/`-color-hover` vocabulary sits dead in default.css/artifacts.
- Riskiest three overall: (1) Skeleton's 4-way animation mechanism split, (2) Progress rustic's undefined status-color token map, (3) Rate's per-engine hover-mechanism asymmetry plus dead token vocabulary.
- All CRITICAL LAWS checked: no undefined-shorthand-token surprises beyond those listed above; no shorthand-then-undefined-longhand clobber; all five proposed class namespaces are grep-confirmed free; no wall-clock/timer-driven paint anywhere in the batch.
