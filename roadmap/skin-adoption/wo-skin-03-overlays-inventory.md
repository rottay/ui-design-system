# Overlay-feedback paint inventory (WO-SKIN-03 feedback batch)

Scope: Modal (51 sites, 6 files), Drawer (42, 5), Toast (47, 4), Message (46, 2), Notification (34, 2),
Result (15, 2) — 6 components, ~21 files, all under
`packages/core/src/ui/primitives/feedback/{Component}/`. File lists/counts from
`roadmap/skin-census.json` batch WO-SKIN-03. Format follows the dropdowns checkpoint precedent
(`skin02-dropdowns-inventory.md`). Note the census also lists a **separate, unrelated**
`primitives/overlay/Modal` (batch WO-SKIN-04, 53 sites) — not in scope here; do not conflate.

Paint channels in scope: `background*`, `border*` (incl. `borderRadius`), `outline*`, `color`,
`boxShadow`, `textShadow`, `fill`, `stroke`, `accentColor`, `filter`, `backdropFilter`
(`transform`/`opacity` noted where present, not counted).

---

# Modal (55 property-level sites counted: modern 29, rustic 16, CloseButton 6, Header 2, Body 1, Footer 1 — census says 51, delta is counting granularity)

Both engines hand-roll their own header/body/footer/close-button markup inline — they do **not**
consume `compound/{Header,Body,Footer,CloseButton}`. The compound files are a fully parallel,
independently-styled implementation only exercised via explicit `<Modal.Header>` composition. **Two
paint systems for the same visual parts, using different token names** — a real cross-implementation
divergence, not just a naming difference (e.g. compound Header's `--ds-modal-header-border` vs.
modern engine's own inline header using the shared `--ds-modal-border-color`).

## MODERN — 29 sites

### Root / paint landing
`<Portal>` wraps everything (see Portal verdict below). Backdrop `<div style={{position:'fixed',
inset:0}}>` (203) has no paint; overlay `<div>` (220) and panel `<div role="dialog"
aria-modal="true">` (234) are the real painted roots. `className={className}` lands **only on the
panel** (consumer-supplied only, no default class) — nothing distributes to header/body/footer.

### Paint sites by part
| Part | Lines | Channels | Class |
|---|---|---|---|
| Overlay | 225-227 | backgroundColor (`color-mix(in srgb, var(--ds-color-black) N%, transparent)`, N runtime-computed from `overlayOpacity` prop — not a static token), backdropFilter+WebkitBackdropFilter | STATIC/CONDITIONAL(blurBackdrop) |
| Panel | 250-255 | backgroundColor, border, borderRadius, boxShadow(conditional `shadow`), outline:none | STATIC |
| Header container | 268 | borderBottom (`sectionBorder`, shared computed var also used by footer) | STATIC |
| Title span | 282 | color | STATIC |
| Description div | 294 | color (`--ds-modal-description-color` — **UNDEFINED token**, see laws) | STATIC |
| Close button (header) | 314-330 | border:none, borderRadius, backgroundColor, color, fill/stroke on icon svg | STATIC + **IMPERATIVE hover** (322-328, `.style.backgroundColor` on mouseenter/leave) |
| Body | 345 | color | STATIC |
| Footer container | 360 | borderTop (`sectionBorder`) | STATIC |
| Cancel button | 370-373 | borderRadius, border, background:transparent, color | STATIC — declares `transition` (377) but **no hover mechanism exists to trigger it (dead code)** |
| OK button | 388-391 | borderRadius, border, background, color | STATIC — same dead `transition` (396) |

### Interaction paint
Header close button: real imperative `.style.backgroundColor` on mouseenter/leave (322-328). Cancel/OK
footer buttons: `transition` declared but **no `:hover` CSS and no mouse handlers** — dead, zero hover
feedback in practice. Inconsistent mechanism across the same file.

### Style props into children / Text-Heading sites
No DS primitives anywhere (no Text/Heading/Button/Icon imports) — all raw div/span/h3/button/svg. No
`'muted'` literal anywhere; every color is a literal `var(--ds-modal-*, fallback)` string.

### Keyframes / animation
`MODAL_STYLES` (53-62) injected via `<style dangerouslySetInnerHTML>` **inside the Portal, per-mount,
no dedup** — duplicate identical `<style>` nodes accumulate under stacked modals.
```
@keyframes ds-modal-backdrop-fade { opacity 0→1 }
@keyframes ds-modal-panel-enter   { opacity 0→1, transform: scale(0.96)→scale(1) }
```
CSS-`animation`-driven entrance (228, 254), gated by `disableAnimation`. **No exit animation exists in
either engine** — `if (!isOpen) return <></>` unmounts synchronously the instant `open` flips false;
nothing defers unmount for a fade/scale-out to play.

### Existing class/data contract
`role="dialog"` `aria-modal="true"` on panel. `className` on panel only. **Zero `data-*` anywhere.**
No `.rottay-modal*` selector is styled by any CSS file (pure hooks, no paint today).

## RUSTIC — 16 sites

### Root / paint landing
Same Portal wrapping (see verdict below). Outer `<div className="rottay-modal-overlay">` (373) IS
the root+backdrop (no separate fixed wrapper, unlike modern). Panel `<div className="rottay-modal"
role="dialog" aria-modal="true">` (382) — **panel className does NOT merge consumer `className`**
(bug-adjacent inconsistency; every other element in the file does merge).

### Paint sites by part
| Part | Lines | Channels | Class |
|---|---|---|---|
| Overlay | 297 | backgroundColor — **hardcoded `rgba(0,0,0,${overlayOpacity})` literal, zero CSS var** | `rottay-modal-overlay` |
| Panel | 310-312 | backgroundColor, borderRadius, boxShadow | `rottay-modal` |
| Header | 324 | borderBottom (3-token fallback chain) | STATIC |
| Footer | 335 | borderTop (same chain) | STATIC |
| Cancel button | 347-351 | borderRadius, border, background, color | STATIC |
| OK button | 360-364 | borderRadius, background, color, border:none | STATIC |
| Close button | 400-401 | background:transparent, border:none | STATIC |

### Interaction paint
**None at all.** No hover handlers, no `:hover` CSS, no `.rottay-modal*` stylesheet rules exist
(grep-confirmed zero hits repo-wide). Buttons have zero visual hover state — a genuine, apparently
intentional gap ("Zero external dependencies" doc comment) vs. modern's close-button hover.

### Style props into children / Text-Heading sites
No DS primitives (same as modern). Title `<h3>` (393) has **no color property set at all** — inherits
ambient text color, unlike modern which sets `color: var(--ds-modal-title-color, inherit)`.

### Keyframes / animation
**None whatsoever** — no `<style>`, no `@keyframes`, no `transition`. Modal appears/disappears purely
via conditional render, instant mount/unmount, zero entrance or exit animation (confirms the doc
comment's "maximum control" framing extends to having no motion at all).

### Existing class/data contract
`rottay-modal-overlay` (merges consumer class), `rottay-modal` (does NOT merge, see above). No
`data-*`. `role="dialog"` `aria-modal="true"` present.

## compound/CloseButton (6), Header (2), Body (1), Footer (1)
All four correctly merge consumer `className` (`\`rottay-modal-{part} ${className}\`.trim()`) —
**unlike rustic engine's panel**, which is the one inconsistency in this family. CloseButton fallback
color is `rgba(0,0,0,0.45)` — a **third, different default** vs. modern-engine's inline close button
(`inherit`) and rustic-engine's (no color set at all) — three different appearances for "the same"
close button, all nominally sharing `--ds-modal-close-color` but three different hardcoded fallbacks.
CloseButton also declares a dead `transition: 'color 0.2s, background-color 0.2s'` with no hover
mechanism to trigger it — same pattern as the engines' footer buttons. Header/Body/Footer are the
cleanest files in the set (Body: single token, direct 1:1 mapping candidate).

## PORTAL VERDICT (Modal, both engines identical)
`grep -n "createPortal"` on modern.tsx and rustic.tsx → **0 direct matches in both**. Neither engine
calls `createPortal` itself; both wrap in the shared `<Portal>` utility
(`overlay/Modal/utils/Portal`), which internally calls `createPortal` into a lazily-created shared
`#rottay-portal-root` div on `document.body`. **Verdict: both engines portal, indirectly, through the
identical shared Portal utility and identical target container** — no engine divergence here (unlike
some other components in this program). `Modal.tsx` orchestrator adds no portal logic of its own.

## Proposed data-part map (Modal)
`root`, `backdrop`, `surface`, `header`, `body`, `footer`, `close-button` (direct overlay-vocabulary
reuse) plus two Modal-specific additions the vocabulary lacks: **`title`**, **`description`** (modern
has distinct paint sites/tokens for both; overlay vocabulary has no title/description parts).

## Won't transcribe cleanly (Modal)
- Dead `transition` declarations (cancel/OK buttons, CloseButton) — migration must implement real
  `:hover` or knowingly drop the inert declaration, not silently port a no-op.
- `getOverlayBackground()`'s `color-mix()` with a runtime-computed percentage (modern) and rustic's
  raw `rgba(0,0,0,${overlayOpacity})` — neither is a static token; both need a CSS custom-property
  bridge (`--ds-modal-overlay-opacity`) to become class-driven.
- Three divergent close-button fallback colors across modern/rustic/compound — unifying via
  `[data-part="close-button"]` is a visible behavior change, not pure transcription.
- Per-instance unde-duped `<style>` injection (modern) doesn't map onto a shared external stylesheet
  without dedup logic.

---

# Drawer (49 sites counted: modern 32, rustic 8, compound Header 5 + Body 2 + Footer 2 — census 42)

## MODERN — 32 sites

### Root / paint landing
No portal (see verdict) — `<>` Fragment with `<style>` (313), conditional backdrop `<div
className="rottay-drawer-overlay">` (316-334), panel `<div ref={presenceRef} role="dialog"
className={\`rottay-drawer rottay-drawer-${placement} ${className}\`} style={getPositionStyles()}>`
(337-344), mounted **in-place in the React tree** (not escaped to document.body), using `position:
fixed` for visual escape only.

### Paint sites by part
| Part | Lines | Channels | Class |
|---|---|---|---|
| Close button (base+hover) | 126-140 | border, borderRadius, background, color; icon fill/stroke (146-147) | STATIC + **IMPERATIVE hover** (134-140, `.style.backgroundColor`) |
| Panel base | 248-256 | background, border(4-side longhand), boxShadow, borderRadius | STATIC |
| Panel per-placement | 272,282,292,302 | zeroed border-width on flush edge | CONDITIONAL(placement) |
| Backdrop | 327-330 | backgroundColor, backgroundImage, backdropFilter+WebkitBackdropFilter | STATIC |
| Header | 354,365 | borderBottom, title color | STATIC |
| Body | — | none (layout only) | — |
| Footer | 396 | borderTop | STATIC |

### Interaction paint
Only the close button: imperative `.style.backgroundColor` on mouseenter/leave (134-140) — the ONLY
interactive paint site in modern Drawer, bypassing React state entirely via direct ref mutation.

### Style props into children / Text-Heading sites
**None** — zero DS primitive imports (verified). Title is raw `<div style={{color:
'var(--ds-color-text-primary)'}}>` (358-370) — literal string, not `'muted'`. Close icon is raw
inline `<svg>` (unlike compound Header's `✕` glyph — a rendering-technique divergence across the
Drawer family, see compound section).

### Keyframes / animation — real slide system
`DRAWER_STYLES` (31-72) injected via `<style>` on every render, 10 `@keyframes`, all unique repo-wide
(grep-confirmed, no collision):
```
rottay-drawer-backdrop-fade / -fade-out       (opacity)
rottay-drawer-slide-{left,right,top,bottom}   (translateX/Y enter)
rottay-drawer-slide-out-{left,right,top,bottom} (translateX/Y exit)
```
Real CSS `animation` (not transition), 4 distinct placement-paired enter/exit vectors. Driven by
`usePresence`'s `dataState` (open/closed, not raw `open` prop) — keeps the node mounted through
`dataState:'closed'` until its own `animationend` fires, so **exit is a genuine animation**, not an
instant unmount (contrast Modal, which has none).
**Cross-cutting collision**: `foundation/tokens/css/runtime/personality.css:473-478` applies a GLOBAL rule to the
exact static class `.rottay-drawer`: `transition: transform var(--ds-personality-animation-entrance-
duration, 300ms) cubic-bezier(...)` — runs in parallel with the inline `animation` shorthand, same
`transform` property, different mechanism (transition vs animation). Inline `animation` wins visually
but this is a live second-emitter on the exact classname any migration will touch.

### Existing class/data contract
Panel: `rottay-drawer rottay-drawer-{placement} + consumer className`. Backdrop: `rottay-drawer-
overlay`. `role="dialog" aria-modal="true" aria-label`. **No `data-state` stamped on DOM** even though
`usePresence` computes it — consumed in JS only (animation-name selection), never rendered as an
attribute (contrast the `usePresence` hook's own documented `data-state={dataState}` convention).
Header/body/footer wrapper divs are **fully unclassed**.

## RUSTIC — 8 sites

### Root / paint landing
Structurally identical shape to modern (Fragment, backdrop div, panel div, same class names, in-place
mount, `position:fixed` escape only). **No `usePresence`** — hard `if (!open) return <></>` (251),
instant unmount, no exit grace period.

### Paint sites by part
| Part | Lines | Channels | Class |
|---|---|---|---|
| Overlay | 278 | backgroundColor — **hardcoded `rgba(0,0,0,${maskOpacity})`, no CSS var** | STATIC |
| Panel | 290-291 | backgroundColor, boxShadow | STATIC |
| Header | 347 | borderBottom | STATIC |
| Footer | 370 | borderTop | STATIC |
| Close button | 379-389 | background, border, color | STATIC — **zero hover, no handlers** |

### Interaction paint
**None** — zero hover handlers anywhere.

### Keyframes / animation — dead transition, no real motion
**No `<style>`, no `@keyframes` at all.** `transition: 'var(--ds-drawer-transition, transform 0.3s
ease-in-out)'` (294) is declared but **`transform` is never actually assigned anywhere** —
positioning uses `top/left/right/bottom`, not `translateX/Y`. Combined with the instant `if (!open)
return <></>` unmount, **rustic Drawer has no functioning slide animation whatsoever** — it snaps
open/closed instantly despite the declared transition. A materially degraded mechanism vs. modern, not
a stylistic variant.
**Personality.css interaction, asymmetric with modern**: because rustic's overlay style never sets
`backdropFilter` inline, the global `.rottay-drawer-overlay { backdrop-filter: blur(4px); }` rule
(personality.css:480-486) **actively applies** and is invisible from reading rustic.tsx alone — modern
sets its own inline `backdropFilter` which wins, so the same global rule is dead for modern. **This
asymmetry must survive any migration** — dropping the shared classname in favor of `data-part` only
would silently remove rustic's blur unless personality.css is updated in lockstep.

### Existing class/data contract
Same static classes as modern (`rottay-drawer*`, `rottay-drawer-overlay`). No `data-*`. **Missing
`aria-label`** that modern's panel has (a11y gap, noted).

## compound/Header (5), Body (2), Footer (2)
Engine-agnostic, standalone composition API — separate from engines' own inline header/body/footer.
Header: borderBottom (conditional `divider`), title `color:'inherit'`, close button (background/
border/color) with a **stale doc comment** ("Hover state handled via CSS in production") describing
behavior that doesn't exist (`grep` confirms no `.rottay-drawer-close:hover` rule anywhere) — do not
transcribe the comment as real. Close button here uses a literal `✕` glyph (matches rustic engine, not
modern's SVG). Body: single `backgroundColor`+`color`, cleanest file, no defects. Footer: `borderTop`
(conditional `divider`) + `backgroundColor`. `rottay-drawer-close` is the **only** pre-existing
part-level class in the whole Drawer family (Header only) — keep it alongside a new `data-part` rather
than renaming.

## PORTAL VERDICT (Drawer, both engines identical)
`grep -n "createPortal"` on modern.tsx, rustic.tsx, compound/*, Drawer.tsx → **zero matches
everywhere.** **Drawer does NOT portal in either engine** — both mount fully in-place using
`position: fixed` for visual escape only. This is the **opposite** of Modal (which portals to
`document.body` via the shared Portal utility in both engines) — a genuine cross-component divergence
within the same feedback batch; do not assume Drawer behaves like Modal. Practical risk: an ancestor
with `transform`/`filter`/`contain`/`will-change` would break Drawer's fixed positioning (classic
containing-block gotcha) — a risk Modal doesn't have.

## Proposed data-part map (Drawer)
`root`/`surface` (panel doubles as both, no separate outer wrapper), `backdrop`, `header`, `body`,
`footer`, `close-button` — direct overlay-vocabulary reuse, DOM shape identical across both engines.

## Won't transcribe cleanly (Drawer)
- Imperative close-button hover (modern) must be deleted, not just re-tagged, or it'll race a new CSS
  `:hover` rule.
- Personality.css global `.rottay-drawer`/`.rottay-drawer-overlay` rules apply asymmetrically to
  rustic (blur active) vs modern (blur dead, inline wins) — must be reconciled explicitly.
- Rustic's declared-but-inert `transition: transform` — "faithfully transcribing" risks someone
  assuming it does something today (it doesn't); adding a real slide would be a behavior change.
- Stale "hover handled via CSS in production" comment in compound Header documents non-existent
  behavior.

---

# Toast (component total ~78 sites across all files: modern ~47, rustic ~25, Container 0, UndoToast 6 — census totals differ per-file; see per-file notes)

## THE THREE MOST LOAD-BEARING FACTS FOR TOAST

**1. Portal is at the stacking layer only, not per-engine.** `grep -n "createPortal"`: modern.tsx NO,
rustic.tsx NO, classic.tsx NO (delegates to AntD's own internal portal instead), **`compound/
Container/index.tsx` YES** (line 23 import, line 479 `createPortal(content, document.body)`,
SSR-guarded). `ToastProvider.tsx` renders no DOM at all (pure context/reducer state) — zero portal
surface. **A bare `<Toast visible />` used standalone never portals; only toasts driven through
`Toast.Container` get portaled to `document.body`.**

**2. Clock-dependent paint — two structurally different mechanisms, one risky, one safe.**
- **Engine `showProgress` bar (modern.tsx 243-275, rustic.tsx 199-231, byte-identical pattern)**: an
  imperative `requestAnimationFrame` loop recomputing React state `progress` every frame from
  `Date.now()` elapsed time, feeding `width: ${progress}%` inline style. **NOT deterministic/
  replayable** — needs a clock-pinning hatch (mock `Date.now`/rAF, or freeze `progress` state) for any
  static capture. Rustic hardcodes `transition: 'width 0.1s linear'` (literal, not `var(--ds-motion-
  fast)` like modern) — a cross-engine token divergence on the visually-equivalent bar.
- **`compound/UndoToast/index.tsx` countdown**: explicitly designed to avoid the above — file's own
  header comment states "depletion is driven by ONE CSS animation — never a requestAnimationFrame
  loop." Ring/bar use real `animationDuration: ${duration}ms` + `animationPlayState: paused?'paused':
  'running'` — **deterministic, replayable, scrubbable**, no clock hatch needed for the visual (the
  underlying dismissal deadline is still `setTimeout`/`Date.now()`, but that only governs *when* it
  closes, not what's painted).

**3. THREE stacked entrance-animation layers, only two are Toast's own.** `getToastAnimationStyle`
hardcodes `mode:'fade'` at both engine call sites (rustic.tsx:293, modern.tsx:337) — position argument
is always `'top-right'` but irrelevant since fade short-circuits position logic — so **every engine
root always plays `toast-fade-in/out`** regardless of actual position. Only `Container`'s
`ToastStackItem` inner div (line 251) uses real position-aware `toast-slide-in/out-{dir}` (mode
defaults `'slide'`). **A third, independent layer exists entirely outside this component's files**:
`foundation/tokens/css/runtime/personality.css:536-544` targets `.rottay-toast-container > *` (every direct child
of Container's outer div, i.e. each `ToastStackItem` outer wrapper) with `animation: ds-toast-enter
...` — a global BrandTheme rule the Toast source never references. **Net: a Container-rendered toast
can run 3 simultaneous entrance animations on 3 different nested nodes** (outer wrapper via
personality.css, inner wrapper via Container's inline slide, engine root via inline fade). None
collide by name but this is the "second emitter, ignored by its twin" shape — worth flagging as a
distinct root-cause class from the Select/dropdown precedent's version of the same bug.
Also: `toast-progress` keyframe is **defined but never referenced as an animation-name anywhere**
(dead code) — the rAF progress bars don't use it.

## Stacking container (`compound/Container/index.tsx`)
Mount target: **`document.body`** (hardcoded, no dedicated `#toast-root` element).
`getContainerPosition` (170-203): `position:fixed`, `zIndex:'var(--ds-toast-z-index,9999)'`, flex
column, `gap`, **zero paint channels** (no background/border/boxShadow/color on the container itself —
all visible paint comes from child toasts). `pointerEvents:'none'` on container,
`pointerEvents:'auto'` per-item so empty stack area doesn't block clicks. `ToastProvider.tsx` owns 0%
of visual chrome (pure state) — no divergence to reconcile between the two files.

## ENGINE: modern.tsx — ~47 property-level sites
`<div role="alert" className="alert {className}" style={{...alertStyles[type], boxShadow:
'var(--ds-elevation-2)', ...style}}>` (329-342). `getAlertStyle` 9 variant branches (default, success,
error, warning, info, primary, secondary, gradient, fallback) each set background+color+border via
`color-mix(in srgb, var(--ds-color-{type}) 10%, transparent)` — **not statically knowable, must render
not compute**. Action button (363-372) and close button (382-393) both STATIC, no hover mechanism at
all (no `:hover` CSS, no handlers — root has zero hover styling coded). Progress bar (404-409) is the
rAF-driven site above. No DS primitives anywhere (raw div/span/button/svg). Order-dependent spread:
`...alertStyle`, `...getToastAnimationStyle(...)`, `...style` (consumer) — consumer `style.border` can
silently override the variant's semantic border.

## ENGINE: rustic.tsx — ~25 property-level sites
`<div role="alert" aria-live="polite" data-variant={variant} ...>` (376-385) — **the only engine that
stamps `data-variant`**; no structural base class (unlike modern's `alert`). All colors sourced from
shared `VARIANT_COLORS` in `Toast.types.ts` (32 definition sites: 8 variants × {bg, color, borderColor,
iconColor}) — modern only partially draws from this (default/gradient branches only; color-mix
branches bypass bg/color but still use `colors.borderColor`). Same STATIC-only interaction posture as
modern (no hover CSS/handlers; mouseenter/leave only toggle `isPaused`, indirectly freezing the rAF
bar). `opacity: 'var(--ds-toast-close-opacity,0.5)' as unknown as number` — type-cast smuggling a CSS
var string past React's `number` typing, a real type-safety trap for faithful transcription.

## COMPOUND: UndoToast/index.tsx — 6 sites
Root wrapper `color:'var(--ds-color-text-primary)'`; ring track/progress `stroke` ×2 (`var(--ds-color-
border)` / `var(--ds-color-primary)`); bar fill `background:'var(--ds-color-primary)'`. Injects the
ring's `icon` prop into `BaseToast` directly (own paint, not engine-owned) and passes `duration={0}
showProgress={false}` to keep the engine's OWN rAF machinery dormant — the load-bearing reason
UndoToast avoids the non-deterministic progress bar. Per-instance `useId()`-scoped keyframe names
(`rottay-undo-ring-${uid}`/`rottay-undo-bar-${uid}`), collision-safe by construction, injected only
`{animate && ...}` (never when `prefersReducedMotion`/`duration<=0`/`countdown==='none'`).

## `engines/classic.tsx` — structural note
Returns `null`, drives AntD's `message`/`notification` imperative APIs which portal outside React's
tree entirely (own comment confirms this). Only real paint site: one inline-styled action `<button>`
(background:transparent, border:1px solid currentColor, borderRadius:4px).

## Existing class/data contract
`rottay-toast-container`, `rottay-toast-container--{position}` (Container root), `data-stack-depth`
per item (Container), `data-variant` (rustic engine only). **`rottay-toast-container` is already
targeted by the unrelated personality.css rule above** — a live cross-file dependency any migration
must preserve or knowingly break.

## Proposed data-part map (Toast)
`root`, `surface`(=root, no separate surface layer), `icon`, `body`, `action-button`, `close-button`,
`progress-bar`, plus **`stack-container`** for Container's portaled root (per brief's naming).

## Won't transcribe cleanly (Toast)
- Non-deterministic rAF progress bar needs a clock-pinning hatch — the single biggest capture-tooling
  risk in this whole batch.
- Three-layer entrance animation stack, one layer external to Toast's own files.
- `color-mix()` background values won't resolve statically without a CSS-color-mix-capable renderer.
- Dead `toast-progress` keyframe.
- Container's `renderedToasts` includes toasts mid-exit (kept alive until `onExitComplete`) — a
  snapshot mid-dismiss needs that transient state, not just the canonical toast list.

---

# Message (55 sites counted: modern 28, rustic 27 [25 static + 2 imperative] — census said modern 18/
rustic 28; modern recount corrects the precount, which likely missed SVG fill/stroke attributes)

## PORTAL VERDICT — NEITHER ENGINE PORTALS (real finding, corrects the pattern-match assumption)
`grep -n "createPortal"` on modern.tsx, rustic.tsx, classic.tsx, Message.tsx → **zero matches in all
four, no ReactDOM/react-dom import anywhere.** Both `MessageProvider`s render the stack container as a
**plain sibling `<div>` right after `{children}`** in the React tree — floating is achieved purely via
`position:fixed`+`z-index`, not DOM reparenting. **Practical implication**: if `<MessageProvider>` sits
inside an ancestor with `transform`/`filter`/`contain`, `position:fixed` gets trapped by that ancestor
(same risk class as Drawer, opposite of Modal/Toast's Container). `classic.tsx` delegates to AntD's own
`message`+`<App>` API, which does its own internal portaling outside DS-owned code.

## Stacking container
**Modern**: `<div className={placementClasses[placement]}>` where classes are DaisyUI `toast toast-
{top|bottom} toast-center` (254-265) — positioning/z-index comes **entirely from an external `.toast`
CSS class** in `theme.css:734-746`, none inline. **Rustic**: `<div style={styles.container(placement,
top)}>` fully inline — `position:fixed`, `zIndex`, flex column, `gap`, `pointerEvents:'none'`
(children `auto`). No `MessageProvider`-level container divergence — Provider owns 0% of chrome in
both engines (children+container are direct siblings).

## CLOCK-DEPENDENT PAINT
**Pure JS `setTimeout`, no CSS countdown, no progress visual in either engine** (confirmed empty grep
for progress/countdown/Date.now/requestAnimationFrame). Modern: single `setTimeout(duration*1000)`,
abrupt unmount, no exit phase. Rustic: **two-phase close** — `isExiting=true` immediately (triggers the
exit keyframe) then a second bare `setTimeout(...,220)` for actual removal, giving the animation time
to play. Both also have a second independent `setTimeout` for the `.then()` promise-callback chain.

## Entrance/exit ANIMATION — real cross-engine parity gap
**Rustic** self-injects `<style id="rustic-message-styles">` once (dedup-guarded via `getElementById`)
with 3 keyframes: `messageSlideIn`, `messageSlideOut`, `messageSpin` — applied unconditionally on
mount (`animation: messageSlideIn 220ms ...`) and conditionally on `isExiting`
(`messageSlideOut ... forwards`). **Modern has NO self-authored keyframe and NO entrance animation on
the message item at all** — its only `animation:` is the loading-spinner referencing the **global**
`@keyframes spin` (theme.css:1103, shared, not message-specific). Checked whether modern's `.alert`/
`.toast` classes match personality.css's `ds-toast-enter` selector list (`.ds-toast`/`.ds-message`/
`.ds-notification`/`ant-message-notice`) — **they do not** (confirmed via grep) — modern's classes are
DaisyUI names, not in that list. **Net: modern message items pop in/out instantly with zero animation,
rustic slides in over 220ms — a real, currently-shipping cross-engine asymmetry**, not a census
artifact. No keyframe name collision (rustic's `messageSpin` ≠ modern's global `spin`, different
names).

## IMPERATIVE PAINT in rustic — exact and complete
**Exactly 2 sites, both on the close button** (642-658): `onMouseEnter`/`onMouseLeave` writing
`e.currentTarget.style.color` directly (own comment: "Hover state is handled via JS events... because
all styling is inline, no stylesheet"). **Modern confirmed clean** — zero `onMouseEnter`/`onMouseLeave`
and zero `.style.` writes (grep-verified); modern's close button has no hover state at all, and no
`:hover` CSS rule exists for `.alert`/`.toast` anywhere.

## Style props into children / Text-Heading sites
**None** — zero DS primitive imports in either engine (verified via import block). Content is a bare
`<span>{content}</span>` colored via the parent's inline `color`. No literal `'muted'` anywhere — every
color is a `var(--ds-...)` string or a fallback chain.

## Existing class/data contract
Modern: `toast toast-{top|bottom} toast-center` (container), `alert {className}` (item), no `data-*`.
Rustic: **no static classes at all**, 100% inline-style-driven ("Zero Dependencies" doc comment),
`className` pass-through only. Stale comment in modern (467-469, "`btn-ghost` keeps the button
minimal") — the actual button has **no `className` at all**, doc/code mismatch.

## Proposed data-part map (Message)
`root` (per-message bubble — no separate `surface`, unlike Modal/Drawer; both engines paint
background/border/shadow directly on `root`), `icon`, `close-button`, `stack-container`. Recommend
**not** introducing a `surface` part for Message.

## Won't transcribe cleanly (Message)
- Imperative hover writes invisible to any static/props-based capture — needs a dispatched-event
  capture, not just a style-prop scrape.
- `styles.container` (rustic) is a **function**, not an object literal — AST-level scrapers expecting
  literals will miss the whole block.
- Two-phase close means the exit style only exists transiently between `handleClose()` and the 220ms
  follow-up timer.
- Modern's external `.toast` class (theme.css) references **6 UNDEFINED tokens** (see laws below) —
  the container is functionally unstyled (transparent bg, 0 radius, no shadow) outside one dark-tenant
  runtime override path.
- Adding a `.ds-message` class during migration would newly activate personality.css's dormant
  `ds-toast-enter` rule — a behavior change, not neutral.

---

# Notification (32 sites counted: modern 13 token-decisions / 23 raw-channel-occurrences, rustic 19 =
17 static + 2 imperative — census said modern 13/rustic 21, close but not exact on rustic)

`Notification.tsx` orchestrator contributes **zero** paint sites — pure `React.createElement(Provider,
props)` dispatch, no wrapper div, no `createPortal` call.

## PORTAL VERDICT — NEITHER ENGINE PORTALS (same pattern as Message, opposite of Modal/Toast-Container)
`grep -n "createPortal"` on modern.tsx, rustic.tsx, Notification.tsx, classic.tsx → **zero matches
everywhere.** Both render the stack container as an ordinary sibling inside `{children}{...
containers}` — wherever `<NotificationProvider>` mounts is where the DOM literally lives; visual
escape is `position:fixed` only. Same containing-block trap risk as Message/Drawer. `classic.tsx`
delegates to AntD's own `notification`+`App` API (own internal portal, outside DS code).

## Stacking container — real architecture asymmetry between engines
**Modern's container is NOT self-contained** — `placementClasses` (DaisyUI `toast toast-{top|bottom}
toast-{start|center|end}`) depend on the **external DaisyUI npm package** for actual positioning; DS
only patches paint on top via `theme.css:734-746`'s `.toast` rule, and **all 6 of those tokens
(`--ds-toast-bg/-radius-md/-shadow/-padding/-gap/-max-width`) are UNDEFINED anywhere in the codebase**
— the override is currently inert (transparent bg, 0 radius, no shadow) except one dark-tenant runtime
path that only defines `--ds-toast-bg`. **Rustic's container is fully self-authored inline** (`position
:fixed`, `zIndex:var(--ds-notification-z-index,1000)`, flex, `gap:var(--ds-notification-gap,12px)`,
zero external dependency) — architecturally stronger/more self-contained than modern's for this
component specifically.

## CLOCK-DEPENDENT PAINT
Both auto-dismiss via `setTimeout` on the `duration` prop (default 4.5s) — **no visual countdown/
progress-bar paint tied to the timer in either engine** (confirmed empty grep). Modern: single timer,
instant removal, no exit animation triggered. Rustic: two-phase — `isExiting=true` (swaps to exit
keyframe) then a **second, hardcoded `setTimeout(...,240)`** for actual unmount. **Real, currently-
shipping defect**: the JS removal timer is hardcoded `240`ms but the CSS exit-animation duration
fallback is `var(--ds-notification-exit-duration, 180ms)` — a 60ms mismatch (DOM lingers after the
animation visually finishes; grows further if a tenant overrides the CSS var down).

## Entrance/exit ANIMATION — same modern/rustic gap pattern as Message
**Modern: none** — no `<style>`, no `@keyframes`; its DaisyUI classes never match personality.css's
`ds-notification` hook (confirmed unreachable). **Rustic**: JS-injected `<style id="rustic-
notification-styles">` (dedup-guarded), `@keyframes notificationSlideIn/-Out` — but **direction is
always horizontal `translateX`, regardless of which of the 6 corner placements is active** — the file's
own comment claims "slide in from the nearest edge" but the code does not implement per-corner
direction-flip; a genuine, currently-shipping directional-inconsistency bug for left-anchored
placements, not something to port as correct. No keyframe name collision (modern has none).

## IMPERATIVE PAINT in rustic — exact and complete
**Exactly 2 sites, both on the close button** (726-733), same shape as Message: `.style.color =` on
`onMouseEnter`/`onMouseLeave`. **Modern confirmed clean** (zero matches, grep-verified).

## Style props into children / Text-Heading sites
**None** — zero DS primitive imports in either engine. Title/description are raw divs; rustic sets
exact literal `color:'var(--ds-notification-title-color, var(--ds-color-text-primary))'` /
`'var(--ds-notification-desc-color, var(--ds-color-text-secondary))'` — modern's title/description
inherit from the parent's `alertStyles[type].color`, no direct color prop of their own. No `'muted'`
literal anywhere.

## Existing class/data contract
Modern: DaisyUI `alert`/`toast*` + Tailwind utilities, no `data-*`. Rustic: **zero static classes**,
100% inline, `className` pure passthrough. Neither engine has any `data-*` attribute.

## Proposed data-part map (Notification)
`root`(=`surface`, single-element item), `icon`, `header`(title), `body`(description), `action-button`,
`close-button`, `stack-container`.

## Won't transcribe cleanly (Notification)
- Undefined `--ds-toast-*` tokens on modern's container is a live landmine — defining any one would
  suddenly paint a visible box around the whole stack, not per-item.
- Rustic's always-horizontal slide direction contradicts its own code comment — flag before porting
  "slide in" as correct per-corner behavior.
- 240ms/180ms timer-vs-animation-duration mismatch is a real defect to fix or explicitly preserve, not
  silently transcribe.
- `color-mix()` background values (modern) won't resolve statically.

---

# Result (17 sites counted: modern 9 [+8 uncounted SVG fill/stroke attrs], rustic 6 — census 15)

**Verified component-type assumption**: Result is genuinely static — no portal (`createPortal`: zero
matches, both engines + classic), no timer/wall-clock paint (zero `setTimeout`/`setInterval`/
`Date.now`), **zero animation of any kind including no icon pop-in** (zero `<style>`/`@keyframes`/
`transition` in both engines). Confirmed, not assumed — Result is a genuinely static "page/section
state" display, the true odd-one-out in this batch.

## MODERN — 9 sites (all `color` channel only)
Root `<div className="flex flex-col items-center justify-center text-center py-12 px-6 {className}">`
— **no `role`/`aria-*` at all** (accessibility gap vs. rustic). 7 status-icon color sites (success/
error/info/warning/404/403/500, all literal `var(--ds-color-{status})`) + title color + description
color. **8 additional uncounted channel occurrences**: `fill="none"`/`stroke="currentColor"` on the 4
non-HTTP-code SVG icons live as raw JSX attributes, not inside `style={}` — likely why the census
script (keyed on style-object literals) undercounts this file.

## RUSTIC — 6 sites
Root has `role="status" aria-live="polite"` (Modal-family-style ARIA, present here unlike modern).
Icon badge: `borderRadius:'50%'` (literal, not a token — the one non-token paint value in the file) +
`color`+`backgroundColor` via `STATUS_COLOR_VARS[status] || RESULT_COLORS[status]` — the `||` fallback
is **dead code** (`STATUS_COLOR_VARS` already covers every status key, so `RESULT_COLORS[status]`
never fires; only port the live half). HTTP-status-code color: same lookup. Title/description: proper
`var(--ds-result-title-color, var(--ds-color-text-primary))` / `-subtitle-color` tokens.

## `stylePropIntoChild` trap — investigated, not confirmed present
Census flags this trap for rustic, but **no literal instance exists**: zero DS primitive imports in
either engine (verified), all 6/9 paint sites apply directly to raw HTML elements via local `style=`,
never pushed into a child component. Consumer-supplied `icon`/`extra`/`children` slots are rendered
verbatim with only non-paint layout wrapping (margin/gap/max-width) — Result never injects a color
prop into them. Best explanation: the tagger likely conflated "style computed in a helper function,
applied to a nested element" (`styles.icon(status)`/`styles.statusCode(status)`) with "style pushed
into a child component" — flagging as an unconfirmed/likely-false-positive trap tag, not asserting a
cause. The real instance of this pattern exists only in **`classic.tsx`** (out of scope), which passes
`title`/`subTitle`/`icon` straight into AntD's own `Result` component.

## Text/Heading color sites
No `'muted'` literal anywhere — modern uses literal `var(--ds-color-text-{primary,secondary})`,
rustic uses proper component-tokens with generic fallback. Both clean on this specific axis.

## Existing class/data contract
**No real class/data-* contract in either engine** — only Tailwind utility classnames (modern) or a
bare `className` passthrough (rustic) plus rustic's `role="status" aria-live="polite"`. **Notable
non-contract artifact**: `tests/Result.test.tsx` mocks a fabricated BEM scheme (`rottay-result
rottay-result--{status}`, `__icon`, `__title`, `__subtitle`, `__content`, `__extra`) that **does not
exist in any real stylesheet or component file** (grep-confirmed zero hits) — useful as a naming
precedent but not a compatibility contract; don't treat it as if the shipped component produces this
shape today.

## Proposed data-part map (Result) — does NOT reuse the overlay vocabulary
Result has no backdrop/header/body/footer/dismiss — recommend **`root`, `icon`, `title`,
`description`, `extra`** (matching the actual `extra` prop name over generic `actions`), `content`
(children wrapper). **Explicit recommendation: give Result its own scoped stylesheet root rather than
folding it into a shared overlay vocabulary file** — sharing `header`/`body`/`footer`/`backdrop` names
with Modal/Drawer would be actively misleading since none of those regions or behaviors exist here.

## Won't transcribe cleanly (Result)
- Modern's 7-status color set is 7 independent hardcoded JSX literals (not table-driven); rustic's is
  one `STATUS_COLOR_VARS` lookup table — collapsing both into a shared `[data-status]` CSS contract
  means restructuring modern's shape, not just moving values into a stylesheet.
- Dead `RESULT_COLORS[status]` fallback branch (rustic) — don't port as live logic.
- SVG `fill`/`stroke` as raw attributes vs. inline style — a migration decision point the paint-site
  table alone doesn't surface.
- Cross-engine ARIA gap (only rustic has `role="status"`) — worth reconciling alongside any `data-part`
  work on root.

---

# CRITICAL LAWS — consolidated findings across all six components

## Law 1 — undefined-token shorthand references
Real violations found (component-scoped tokens referenced in a shorthand/paint property, with zero
declaration anywhere in `packages/core/src/foundation/tokens/`):
- **Modal**: `--ds-modal-description-color` (modern), `--ds-modal-cancel-border/-bg/-color`,
  `--ds-modal-ok-bg/-color`, `--ds-modal-btn-radius` (rustic) — all resolve safely via a defined
  fallback, but the modal-specific override point itself is dead (tenants can't target it).
- **Drawer**: `--ds-drawer-border-color`, `--ds-drawer-close-color`, `--ds-drawer-body-bg`,
  `--ds-drawer-footer-bg` — same "dead override point, working fallback" shape.
- **Message/Notification (shared root cause)**: `theme.css`'s `[data-tenant] .toast` rule references
  **6-7 `--ds-toast-*` tokens, ALL undefined anywhere in the codebase** except `--ds-toast-bg`, which
  is defined in exactly one place — a dark-tenant-only **runtime JS generator** block, not a static
  theme file. This makes Modern's Message/Notification stacking container functionally unstyled
  (transparent, 0 radius, no shadow) in the default/light theme — the single highest-severity Law-1
  finding in the whole batch, because it affects the shared container both components draw from.
- **Result**: zero violations — no `border`/`background` shorthand exists anywhere in either engine
  (all longhand), so the precondition for this law doesn't even arise.
- **Toast**: zero dedicated `toast.css` skin file exists at all (own code comment admits this); every
  `--ds-toast-*` reference is fallback-only by design, and every fallback target was verified defined
  — 0 broken shorthands, but the entire component has no first-class token surface.

## Law 2 — ReactDOM undefined-longhand-after-shorthand trap
**Zero true violations found in any of the six components.** Checked every style object across all ~21
files. The closest analogs are all **consumer-input risks, not authored bugs**: every component spreads
consumer-supplied `...style` last, after its own shorthand/longhand assignments (Modal panel, Drawer
panel, CloseButton, Header, Body, Footer all do this) — if a consumer passes `style={{borderColor:
undefined}}`, React's known stripping behavior could apply, but this is by design ("user styles take
precedence") and depends on external call sites, not a defect in the shipped source.

## Law 3 — free-token / scope-class collision check
**Every proposed `data-part` name across all six components is FREE** — exhaustive `grep -rn` across
`packages/core/src/**/*.css` (143+ files, including engine skin trees and tenant artifacts) found zero
unscoped collisions for `root`, `backdrop`, `surface`, `header`, `body`, `footer`, `close-button`,
`icon`, `action-button`, `progress-bar`, `stack-container`, `title`, `description`, `extra`. A few
generic values (`header`, `footer`, `action-button`, `close-button`, `progress-bar`) are already in use
elsewhere in the DS (TimePicker, DetailPanel, Upload, SelectionPreviewRail, Modal.CloseButton) but
**always scoped by an ancestor component class** — consistent with, not colliding with, established
convention. One **real class-name (not data-part) collision** worth flagging: `rottay-toast-container`
is already targeted by the unrelated `personality.css` global entrance-animation rule (see Toast
section) — a live cross-file dependency, not a namespace collision, but must be accounted for.

## Law 4 — wall-clock/timer-driven paint
- **Toast**: YES, two mechanisms — engine `showProgress` bar (risky, rAF+`Date.now()`, needs clock-
  pinning) vs `Toast.Undo` countdown (safe, pure CSS `animation-duration`). **The single most important
  clock-dependent finding in the batch.**
- **Message**: dismiss timer is `setTimeout`-only, **no visual countdown/progress paint tied to it** —
  the entrance/exit keyframes are real CSS animations (need a runtime hatch to freeze mid-animation,
  but aren't wall-clock-scaled themselves).
- **Notification**: same as Message — `setTimeout`-only dismissal, no progress visual, but rustic has
  a **real, shipping 240ms-vs-180ms timer/animation-duration mismatch** (JS removal timer hardcoded,
  doesn't read the same var as the CSS animation fallback).
- **Modal, Drawer, Result**: confirmed NO wall-clock/timer-driven paint anywhere (exhaustive grep, not
  assumed).

---

# Cross-family notes

- **Portal posture is genuinely inconsistent across this batch, not inferable from component type**:
  Modal portals in both engines (via a shared Portal utility). Drawer portals in NEITHER engine
  (position:fixed, in-tree). Toast portals only at the `Container` stacking layer, not per-engine — a
  standalone `<Toast>` never portals. Message and Notification portal in **neither** engine (contrary
  to what "global overlay" naming might suggest) — both rely purely on `position:fixed` sibling
  rendering. Result never portals (expected, confirmed). **Any shared skinning/capture mechanism must
  take portal-vs-in-tree as a literal per-file grep result, never an assumption from the component's
  category.**
- **Modern/rustic animation-completeness is inverted per component**: for Modal and Message/
  Notification, **modern has weaker or zero animation** relative to rustic (Modal: modern has real
  fade+scale, rustic has none — wait, actually Modal is the inverse: modern HAS keyframes, rustic has
  NONE; Message/Notification: rustic HAS keyframes via self-injected `<style>`, modern has NONE because
  its DaisyUI classes don't match the personality.css hook). Drawer is the clearest case: modern has a
  full 4-direction slide system, rustic's declared transition is dead code with no functioning
  animation at all. **No consistent "which engine animates more" rule holds across the batch** — must
  be checked per component, per engine.
- **The imperative-hover pattern is a recurring, consistent shape across Modal/Drawer/Message/
  Notification's rustic engines** (and Modal/Drawer's modern engines too, for their respective close
  buttons): `onMouseEnter`/`onMouseLeave` writing `e.currentTarget.style.<channel> =` directly, always
  justified by an own-code comment stating "no stylesheet exists for :hover." This is the single most
  common migration-blocking pattern in the batch — a class-based `:hover` rule can replace all of these
  1:1, but the imperative handlers must be *deleted*, not left alongside the new CSS, or they'll race.
- **`personality.css` is a recurring second-emitter across three components** (Drawer, Toast,
  Message/Notification-shared) — a single global BrandTheme stylesheet applying `animation`/
  `backdrop-filter` rules keyed on static class names (`.rottay-drawer`, `.rottay-drawer-overlay`,
  `.rottay-toast-container > *`, `[data-engine] .ds-toast/.ds-message/.ds-notification`) that none of
  the component source files reference or know about. Some rules are currently dead (inline styles
  win), some are currently live (rustic Drawer's blur, Toast's third animation layer) — **the liveness
  is asymmetric per engine within the same component**, and dropping/renaming the targeted classnames
  during a `data-part` migration will silently change this without the migration's own source files
  showing any evidence of it.
- **No `Text`/`Heading` DS primitive usage anywhere across all six components' modern/rustic engines**
  (only in the out-of-scope `classic.tsx` engines, which wrap AntD/antd-family components directly) —
  the specific "literal `'muted'` string on a Text color prop" trap named in the brief does not apply
  to any file in this batch; the analogous defect class is the handful of undefined-token references
  cataloged under Law 1, plus rustic's occasional hardcoded raw fallback values.
- **Two-phase close (`isExiting` state + a follow-up `setTimeout` to actually unmount) is a shared
  rustic-only pattern across Message and Notification** — both give the exit keyframe time to play
  before removal, unlike their modern siblings (instant unmount, no exit animation) and unlike Drawer's
  modern engine (which achieves the same effect via `usePresence` instead of a hand-rolled timer).
  Notification's version of this pattern has the 240/180ms mismatch bug; Message's does not (needs
  independent verification if that becomes in-scope for the fix).
