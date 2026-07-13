# Overlay-primitives paint inventory (WO-SKIN-04 checkpoint P)

Scope: `packages/core/src/components/primitives/overlay/**` -- Modal (53 sites across
8 files), Tour (49, 2), ConfirmDialog (42, 2), Popconfirm (41, 2), Sheet (39, 2),
AlertDialog (24, 2), ContextMenu (23, 2), Popover (22, 2), Dropdown (18, 2), HoverCard
(10, 2), Watermark (3, 2), AdaptiveOverlay (1, 1) -- 12 components, ~325
property-level sites (audit-script count; the script has blind spots noted per
component below, so per-file totals below sometimes exceed it). Counts sourced from
`node scripts/engine-token-audit.mjs | grep fleet.inlinePaint.primitives/overlay`.
Format follows the feedback-overlays precedent (`wo-skin-03-overlays-inventory.md`).

**Naming collision warning, read first**: `primitives/overlay/Modal` is a wholly
different component from the already-migrated `primitives/feedback/Modal` (WO-SKIN-03
checkpoint O) -- different props, different DOM, different defaults. They are **not**
variants of each other. The two do, however, share literal CSS classnames on their
compound parts -- see the Modal section's collision writeup, the single most
load-bearing finding in this document.

Paint channels in scope: `background*`, `border*` (incl. `borderRadius`), `outline*`,
`color`, `boxShadow`, `textShadow`, `fill`, `stroke`, `accentColor`, `filter`,
`backdropFilter` (`transform`/`opacity` noted where present, not counted).

---

# Modal (55 sites counted: modern 23, rustic 15, CloseButton 8, Header 2, Overlay.tsx
2, Body 1, Footer 1, FocusTrap 1 -- census/task-brief said 53, delta is this recount
catching Overlay.tsx's 2 sites the brief's per-file list omitted)

`primitives/overlay/Modal` plus `compound/{Header,Body,Footer,CloseButton}` and
`utils/{Portal,Overlay,FocusTrap}`. Modern uses the native `<dialog>` element +
`showModal()`; rustic hand-composes the shared `Overlay` + `FocusTrap` utilities. Both
wrap in the shared `Portal` (`utils/Portal.tsx`) -- portals into a shared,
lazily-created `#rottay-portal-root` div on `document.body` (`data-rottay-portal="true"`),
the same target the inputs-family Select dropdown uses. **This `Portal` utility is
imported by six other components in this scope** (ContextMenu, Dropdown, HoverCard,
Popconfirm, Popover, Sheet rustic engines, plus both Tour engines directly via
`createPortal` -- see the cross-family Portal Posture Map at the end of this document).

## THE HEADLINE FINDING -- a real cross-component classname collision, not just a
## namespace question

`primitives/feedback/Modal/compound/{Header,Body,Footer}` (already migrated,
WO-SKIN-03 checkpoint O) render classes `rottay-modal-header`, `rottay-modal-body`,
`rottay-modal-footer` and stamp `data-part="header"/"body"/"footer"/"title"`. Their
skin, `tokens/css/components/skin/modal-compounds.css`, is scoped like this:

```css
.rottay-modal-header.rottay-modal-header[data-part='header'][data-part='header'] { border-bottom: var(--ds-modal-header-divider); }
.rottay-modal-header [data-part='title'] { color: var(--ds-modal-title-color, inherit); }
.rottay-modal-body[data-part='body'] { color: var(--ds-modal-body-color, inherit); }
.rottay-modal-footer.rottay-modal-footer[data-part='footer'][data-part='footer'] { border-top: var(--ds-modal-footer-divider); }
```

**`primitives/overlay/Modal/compound/{Header,Body,Footer}` (this checkpoint's scope)
render the EXACT SAME classnames** -- `rottay-modal-header` (Header/index.tsx:110),
`rottay-modal-body` (Body/index.tsx:95), `rottay-modal-footer` (Footer/index.tsx:106)
-- for a structurally different component with different props/defaults. Grep-verified,
not inferred. Today this is silent and harmless because overlay/Modal's compounds
stamp **zero `data-part`** of their own, so the attribute-gated feedback rules above
never match them. **The moment this checkpoint's pre-step stamps
`data-part="header"/"body"/"footer"/"title"` on overlay/Modal's compounds (the natural,
expected pre-step action), they will start matching feedback/Modal's already-shipped
skin** -- both component families would suddenly share
`--ds-modal-header-divider`/`--ds-modal-title-color`/`--ds-modal-body-color`/
`--ds-modal-footer-divider`, painted by a stylesheet that has never heard of
`primitives/overlay/Modal`. This is a scope-class collision the free-token grep alone
will not catch, because `rottay-modal-header` etc. read as "already in use" (true) but
the existing usage's owner is the wrong component.
**CloseButton does NOT collide**: overlay/Modal's is `rottay-modal-close-button`
(CloseButton/index.tsx:129); feedback/Modal's is `rottay-modal-close` -- different
strings, verified.
**The root scope classes also do NOT collide**, despite looking similar at a glance:
feedback/Modal roots are `rottay-modal-root--modern` / `rottay-modal-root--rustic`
(engine .tsx greps); overlay/Modal roots are `rottay-modal rottay-modal--modern` /
`rottay-modal rottay-modal--rustic rottay-modal--{size}`. Different strings, safe.
**One buried exception**: feedback/Modal **rustic**'s `[data-part='surface']` inner
panel div carries the bare class `rottay-modal` with **no engine suffix**
(`feedback/Modal/engines/rustic.tsx:375`) -- today unstyled (the engine's own skin
comment calls it "a pure hook with no stylesheet behind it"), but it means the literal
string `rottay-modal` is **not a free token** even though nothing currently paints
it -- a migration author who scopes overlay/Modal's own skin on bare `.rottay-modal`
(rather than the full `.rottay-modal.rottay-modal--modern` / `.rottay-modal.rottay-modal--rustic`
combination its elements actually carry) would also match that feedback-family surface
div the instant either file's data-part vocabulary widens to overlap.
**Recommendation for the contract step**: rename overlay/Modal's compound classnames
(e.g. `rottay-overlay-modal-header/-body/-footer`) rather than reusing
feedback/Modal's, and always scope overlay/Modal's own skin on the full two-class
combination, never the bare `rottay-modal` token.

## MODERN -- 23 sites
### Root / paint landing
`<Portal>` wraps a native `<dialog ref={dialogRef} className="rottay-modal
rottay-modal--modern {className}">` (278-305) that IS both the positioning root and
the real painted "root" -- no separate wrapper div. Backdrop `<div>` (308-325) and
panel `<div role="document">` (329-353) are its two children.

| Part | Lines | Channels | Class |
|---|---|---|---|
| Backdrop | 309-324 | backgroundColor (`var(--ds-modal-overlay-bg, color-mix(...))` -- a **live BrandTheme token**, `chrome.modal.overlayBg`, shared with 3 other components in this scope, see cross-family notes), backgroundImage (glass tint, conditional `blurBackdrop`), backdropFilter+WebkitBackdropFilter (conditional) | STATIC |
| Panel (surface) | 333-353 | background, color, border (conditional `effectiveFullscreen`), borderRadius, boxShadow (conditional `isAdaptiveFullscreen`/`shadow`), outline:none | STATIC |
| Header container | 357-368 | borderBottom (**both branches of the `divider` ternary resolve to the identical value** -- dead conditional, see traps) | STATIC |
| Title | 373-384 | color | STATIC |
| Description | 385-396 | color (`--ds-modal-subtitle-color`, note: **not** the same token name overlay's own Header compound uses for the same concept, `--ds-modal-title-color` on title only -- description has no compound-side equivalent, see below) | STATIC |
| Close button | 85-127 (child fn component) | border:none, borderRadius, backgroundColor, color, svg stroke=currentColor | STATIC + **IMPERATIVE hover** (105-111, `.style.backgroundColor` on mouseenter/leave) |
| Body | 407-414 | color | STATIC |
| Footer container | 418-433 | borderTop | STATIC |

### Interaction paint
Only the close button has hover feedback, and it is imperative
(`e.currentTarget.style.backgroundColor =`), not CSS -- must be deleted, not
paralleled, when a `:hover` rule is authored (same shape as the feedback-family
precedent). No other element in modern.tsx has any hover/focus/active styling at all
-- footer has no action buttons here (footer is a raw `{footer}` slot, unlike
feedback/Modal which renders `ok`/`cancel` buttons itself).

### Keyframes / animation
`OVERLAY_MODAL_STYLES` (54-71) injected via `<style dangerouslySetInnerHTML>` inside
the Portal, **per-mount, no dedup** (same non-dedup shape as feedback/Modal's
predecessor pattern) -- four keyframes, all prefixed `rottay-modal-*`:
```
@keyframes rottay-modal-backdrop-enter / -exit   (opacity)
@keyframes rottay-modal-enter / -exit            (opacity + scale(0.95->1))
```
**Real exit animation exists here** (unlike the feedback-family Modal precedent, which
had none) -- driven by `usePresence`'s `dataState`, with `onExitComplete` calling
`dialog.close()` only after the CSS animation finishes. `disableAnimation` prop is
destructured but **prefixed `_disableAnimation` and never read** -- a dead prop, the
animation always plays regardless of what the caller passes (real defect, modern
engine only; rustic's `disableAnimation` does work, see below).
**Keyframe-name collision risk**: `rottay-modal-enter`/`-exit`/`-backdrop-enter`/
`-backdrop-exit` are engine-unqualified (no `-modern`/`-rustic` suffix, unlike the
feedback-family Modal's own `ds-modal-*-modern` precedent that explicitly namespaced
to avoid a rustic collision). If overlay/Modal's rustic engine or any sibling
component in this scope ever declares same-named keyframes, they will collide;
namespace them per-engine during migration (`rottay-modal-enter-modern`, etc.),
matching the precedent already set by feedback/Modal's skin.

### Existing class/data contract
`role="document"` on panel (not `role="dialog"` -- that's on the `<dialog>` element
itself natively, which supplies it implicitly). `aria-modal="true"` on the dialog.
**Zero `data-*` anywhere** in this file. `className` passthrough only lands on the
`<dialog>` root, nothing distributes to backdrop/panel/header/body/footer.

## RUSTIC -- 15 sites
### Root / paint landing
`<Portal><Overlay><div style={modalContainerStyle}><FocusTrap><div
className="rottay-modal rottay-modal--rustic rottay-modal--{size} {className}"
role="dialog" aria-modal="true">`. Four nested wrapper layers before the real painted
panel -- `Overlay` (see below) paints the backdrop; `modalContainerStyle` is pure flex
layout (zero paint channels); `FocusTrap` contributes only `outline:none`.

| Part | Lines | Channels | Class |
|---|---|---|---|
| Panel | 182-202 | backgroundColor (`var(--ds-color-bg-elevated)` -- **hardcoded, not a `--ds-modal-*` token**, unlike every other paint site in this file which does use the modal-scoped token family), borderRadius, boxShadow (conditional `shadow`) | STATIC |
| Header | 205-213 | borderBottom (conditional `divider`, `--ds-modal-header-border`) | STATIC |
| Body description `<p>` | 334-343 | color | STATIC |
| Footer | 235-243 | borderTop (conditional `divider`, `--ds-modal-footer-border`) | STATIC |
| Close button | 246-261 | border:none, borderRadius, backgroundColor, color | STATIC + **IMPERATIVE hover** (302-312, `.style.backgroundColor`+`.style.color` on mouseenter/leave, restores to the exact static fallback on leave) |

### Interaction paint
Close button: real imperative hover (both `backgroundColor` and `color`, unlike
modern's close button which only touches `backgroundColor`). No other hover states in
this file.

### Keyframes / animation
**No `<style>`/`@keyframes` at all** -- entrance/exit is a plain CSS `transition` on
`transform`+`opacity` (196-200) driven by the `open` boolean directly (not
`usePresence`), gated correctly by the file's own `disableAnimation` prop (unlike
modern's dead prop above). Because there's no exit-grace mechanism, the panel's exit
transition **cannot actually be seen** in most cases: `if (!open) return null` (line
264) unmounts synchronously the instant `open` flips false, racing the CSS transition
exactly like the feedback-family Modal's own documented gap -- the transition
declaration is close to dead code (only visible if a consumer keeps `open=true` and
independently delays their own unmount, which no current caller does).

### Existing class/data contract
`role="dialog"` `aria-modal="true"` `aria-labelledby`/`aria-describedby` (conditional)
on the panel. **Zero `data-*`.** `className` lands only on the panel (merges
correctly, unlike the feedback-family Modal rustic engine's documented root-merge
bug -- this file does not have that defect).

## Shared utils
**`utils/Overlay.tsx` (2 sites, used by rustic Modal only in this component, but
reusable -- currently zero other importers in scope, see below)**: `backgroundColor`
(`var(--ds-overlay-bg, var(--ds-modal-overlay-bg, rgba(0,0,0,0.5)))` -- the fallback
chain root of the shared BrandTheme overlay token, see cross-family notes),
`backdropFilter`+`WebkitBackdropFilter` (conditional `blur` prop). Renders its own
`rottay-overlay {className}` classname and `data-visible` boolean attribute -- the
**only** `data-*` stamp anywhere in the whole Modal family (not `data-part`, a
one-off). Doc comment claims it is "Used internally by Modal and Drawer rustic/modern
engines" -- **stale**: grep-confirmed the only importer anywhere in the repo is
`overlay/Modal/engines/rustic.tsx`; there is no `Drawer` component under
`primitives/overlay/` at all (the family's closest analog, `Sheet`, does not import
this util -- it hand-rolls its own inline overlay div instead, see the Sheet section).
**`utils/FocusTrap.tsx` (1 site)**: `outline: 'none'` on its own wrapper div,
unconditional, on top of whatever the child panel already sets -- redundant with
modern's own `outline: 'none'` on the panel (modern doesn't use FocusTrap at all,
using the native `<dialog>`'s built-in trapping instead, so no double-application
there; rustic does use FocusTrap, and rustic's panel `modalStyle` does **not** set its
own `outline`, so FocusTrap's is the only one -- no double-paint in practice, but
worth knowing before assuming both `outline:none` sites in this family are equivalent
in cause).

## Compound: CloseButton (8), Header (2), Body (1), Footer (1)
Fully engine-agnostic, standalone composition API (`Modal.Header`/`.Body`/`.Footer`/
`.CloseButton`), separate DOM from what either engine hand-rolls internally when a
caller uses `title`/`footer` props instead. **Zero `data-part` anywhere** in any of
the four (confirmed by grep across the whole `overlay/Modal` tree above) -- these are
the parts most in need of anatomy stamps in the pre-step, and per the headline finding
above, whatever classnames/data-parts they get must not collide with
`feedback/Modal`'s already-shipped compound skin.
CloseButton (8 sites): border:none, borderRadius, backgroundColor, color (static
quad) + imperative hover/leave rewriting backgroundColor+color (4 more) -- same
imperative-hover shape as both engines' own inline close buttons; three independent
close-button implementations in this one component (modern inline, rustic inline,
compound), each with its own imperative hover handler, none sharing code.
Header (2): borderBottom (`--ds-modal-header-border`, **unconditional** -- no
`divider` prop gate at all, unlike every engine's own header border which is
conditional; the compound's border always renders), title `color`
(`--ds-modal-title-color, inherit`).
Body (1): `color` (`--ds-modal-body-color, inherit`).
Footer (1): `borderTop` (`--ds-modal-footer-border`, also unconditional, no
`divider` gate -- same asymmetry as Header).

## Suppression risk
Grepped `rottay-modal`, `rottay-overlay`, `rottay-focus-trap`,
`rottay-modal-close-button`, `rottay-modal-header`, `rottay-modal-body`,
`rottay-modal-footer` across `tokens/css/runtime/personality.css` and
`tokens/css/engines/*/theme.css`: **zero hits**. Personality.css does not currently
touch anything in this component family (contrast the feedback-family Modal/Drawer/
Toast precedent, where personality.css was a live second emitter on several
classnames) -- there is no "personality currently wins" channel to preserve here. The
only suppression-shaped risk in this component is the intra-DS one documented above
(feedback/Modal's own skin), not a personality/theme risk.

## Won't transcribe cleanly (Modal)
- The classname collision above is the load-bearing item -- must be resolved (rename)
  before any `data-part` stamp lands on the compounds, or the migration will silently
  inherit feedback/Modal's border/color decisions.
- Modern's `disableAnimation` prop is destructured, prefixed `_`, and never
  consumed -- a real dead-prop defect; don't "faithfully" wire a skin rule that
  respects it, since nothing today does.
- Modern's header `borderBottom` ternary has identical values on both branches (dead
  conditional, effectively unconditional) -- rustic's and the compound's header
  border ARE meaningfully conditional/unconditional respectively; don't assume the
  three header borders in this file family behave the same way.
- Description text has no compound-side equivalent (`Modal.Header` only takes
  `children` as the title slot, no description prop) -- the `data-part='description'`
  concept exists only in the two engines' own inline rendering, not in the compound
  tree, asymmetric with feedback/Modal's Description which the WO-SKIN-03 report
  treated as a first-class part on both sides.
- Rustic panel's `backgroundColor` is the one hardcoded-token outlier in an otherwise
  fully `--ds-modal-*`-scoped file -- worth normalizing during migration, not
  necessarily worth silently "fixing" without a written exception.
- Rustic's CSS transition on the panel is very likely already-dead code (synchronous
  unmount on `open=false` beats it to the punch in virtually every real usage) --
  transcribing it as if it plays today would be optimistic, not faithful.

---

# Tour (49 sites counted: modern 24, rustic 25)

`primitives/overlay/Tour`, no compound subcomponents, no shared utils -- each engine
is a single self-contained file.

## PORTAL VERDICT -- both engines portal, but NOT via the shared Portal utility
Both engines call `createPortal(..., document.body)` **directly** (own `react-dom`
import, `modern.tsx:46`/`279`, `rustic.tsx:53`/`320`) -- a plain child of
`document.body`, **not** into the shared `#rottay-portal-root` div Modal/Select use,
and **no `data-rottay-portal` marker**. No engine asymmetry within Tour itself (both
portal identically), but a real cross-component asymmetry worth naming: this scope has
now shown three distinct portal mechanisms -- Modal's shared-`Portal`-util-into-
`#rottay-portal-root`, Tour's direct-`createPortal`-into-`document.body`, and (as the
rest of this document will show) most other components' rustic-only direct
`createPortal`. A skin/capture mechanism cannot assume "portals to `document.body`"
implies any particular container shape.

## THE HEADLINE FINDING -- modern has no first-class token surface; rustic and even
## the out-of-scope classic engine do

**Modern references zero `--ds-tour-*` tokens anywhere in the file.** Every paint
value is either a generic DS token already shared by dozens of other components
(`--ds-surface-card`, `--ds-radius-lg`, `--ds-elevation-3`, `--ds-color-primary`,
`--ds-color-text-primary`, `--ds-color-text-secondary`, `--ds-color-border-subtle`,
`--ds-surface-panel`, `--ds-color-neutral`) or a Tailwind utility class (`fixed
inset-0`, `rounded-lg`, `pointer-events-none`, `mb-3`, `font-bold text-lg`, `mt-2`,
flex utilities). **Rustic references a full, dedicated `--ds-tour-*` token family**:
`bg`, `radius`, `shadow`, `padding`, `max-width`, `min-width`, `primary-border`,
`close-color`, `title-size`, `title-color`, `description-size`,
`description-color` -- twelve component-scoped hooks, all with hex fallbacks.
**None of these twelve are defined anywhere in the tokens tree** (grep-confirmed
across `tokens/**/*.css` and `tokens/**/*.ts` -- zero assignment sites, only
references), so rustic Tour currently renders its hardcoded hex fallbacks in every
tenant -- the token surface exists as an addressable hatch but is functionally
inert today, same Law-1 shape as the feedback batch's Message/Notification
`--ds-toast-*` finding, just component-scoped rather than shared.
**A third, wider vocabulary already exists in the out-of-scope `classic` engine's
`theme.css`** (`--ds-tour-color`, `--ds-tour-title-font-weight`, `--ds-tour-mask-bg`,
`--ds-tour-indicator-color`, `--ds-tour-indicator-inactive`, alongside `bg`/`radius`/
`shadow`/`padding` which do overlap rustic's names) -- **also entirely undefined, and
with no fallback at all** (`background: var(--ds-tour-bg);`, no second argument), so
an undefined reference there resolves to nothing rather than a safe default. This is
useful context for the contract step even though classic itself is out of scope:
three different token vocabularies exist across the three engines for the same
component (modern: none/generic-only, rustic: 12 names, classic: ~9 overlapping-but-
different names), and rustic's is the only one with working fallbacks today.

## MODERN -- 24 sites (all raw channel occurrences; Tailwind utility classes carry
## additional non-inline paint not counted here, e.g. `rounded-lg`)
| Part | Lines | Channels | Class |
|---|---|---|---|
| Mask | 152-159 | backgroundColor (`maskColor`, plus consumer-spread `...maskStyle`) | RUNTIME (consumer-configurable via `mask` prop object) |
| Spotlight | 164-176 | boxShadow (`` `0 0 0 9999px ${maskColor}` `` -- position values are `getBoundingClientRect()`-derived, genuinely runtime; the color/spread shape itself is static per-instance) | RUNTIME (position-coupled) |
| Step popover | 179-192 | background, borderRadius, border (STATE-SELECTED on `type==='primary'`), boxShadow | STATIC + STATE-SELECTED |
| Close button | 195-216 | borderRadius, border:none, background:transparent, color | STATIC, **zero hover/focus feedback of any kind** (no `:hover` CSS, no handlers, no imperative style writes -- the one overlay-family close button so far with truly no interaction paint at all) |
| Description `<p>` | 222 | color | STATIC |
| Step indicator dot | 229-235 | background (STATE-SELECTED: `index === currentStep ? primary : panel`) | STATE-SELECTED |
| Previous button | 240-257 | borderRadius, border:none, background:transparent, color | STATIC, no hover |
| Next button | 258-274 | borderRadius, border:none, background+color (STATE-SELECTED on `type==='primary'`) | STATIC + STATE-SELECTED, no hover |

## RUSTIC -- 25 sites
| Part | Lines | Channels | Class |
|---|---|---|---|
| Mask | 173-181 | backgroundColor (`maskColor`, no consumer style-spread here unlike modern) | RUNTIME |
| Spotlight | 186-198 | borderRadius, boxShadow (same runtime-position-coupled shape as modern) | RUNTIME (position-coupled) + STATIC(borderRadius) |
| Step dialog | 208-225 | backgroundColor, borderRadius, boxShadow, borderWidth (STATE-SELECTED `isPrimary`), borderStyle, borderColor (STATE-SELECTED `isPrimary`) | STATIC + STATE-SELECTED |
| Close button | 228-244 | background:none, border:none, color | STATIC, **also zero hover feedback** (same gap as modern -- the only overlay-family component so far where BOTH engines' close buttons have no interaction paint) |
| Title `<h3>` | 248-250 | color | STATIC |
| Description `<p>` | 251-255 | color | STATIC |
| Step indicator dot | 267-278 | borderRadius, backgroundColor (STATE-SELECTED `index === currentStep`) | STATE-SELECTED |
| Previous button | 283-299 | borderRadius, border, backgroundColor | STATIC, no hover |
| Next button | 300-316 | borderRadius, border:none, backgroundColor (STATE-SELECTED `isPrimary`), color | STATIC + STATE-SELECTED, no hover |

## Interaction paint
**Neither engine has ANY hover/focus/active feedback anywhere in the whole
component** -- confirmed by grep (`onMouseEnter`/`onMouseLeave`/`:hover`/`.style.` all
zero hits in both files). This is a genuine, first-of-the-batch clean case: every
paint site is either STATIC or STATE-SELECTED off React state/props, none imperative.
A skin author gets to introduce real `:hover`/`:focus-visible` rules on the nav
buttons and close button where today there are none -- a net accessibility/polish
improvement, not just a transcription, and worth flagging as an explicit decision
point for the contract (is adding hover feedback in-scope for a byte-exact migration,
or does "byte-exact" mean preserving the absence too?).

## Keyframes / animation
**None in either engine** -- zero `<style>`, `@keyframes`, or `transition` anywhere.
Tour pops in/out instantly, same posture as the feedback batch's Result component.

## Existing class/data contract
**Rustic**: `rottay-tour-dialog rottay-tour-dialog--{type}` class plus `data-type`
(the only `data-*` in either file) on the step-dialog element; `role="dialog"
aria-modal="true"`. **Modern**: zero classnames, zero `data-*`, zero ARIA role of any
kind on any element -- a real accessibility gap relative to rustic, not just a
styling-contract gap (a screen reader gets no dialog semantics from modern Tour at
all). Neither engine's outer wrapper div carries anything but the consumer-supplied
`className` passthrough.

## Suppression risk
Grepped `rottay-tour`, `ds-tour` in `personality.css` and every engine's `theme.css`:
zero hits in `personality.css`; the only hits are the already-discussed classic
`theme.css` token references (structural, not a personality suppression). No
personality-currently-wins channel to preserve for Tour.

## Won't transcribe cleanly (Tour)
- Modern's total absence of a `--ds-tour-*` token surface means "migrate the inline
  values into a skin" is a bigger decision than usual: paste modern's current generic-
  token values into a modern `tour.css`, or take the opportunity to give modern the
  same twelve-token surface rustic already has (a real design decision, not a pure
  transcription, and one that should probably converge toward the vocabulary
  classic's theme.css already assumes).
- The runtime-computed spotlight/mask `top`/`left`/`width`/`height` values must stay
  inline (genuinely data-driven from `getBoundingClientRect()`); only the *color*
  portion of `boxShadow`/`backgroundColor` is a skin candidate, and box-shadow's
  shorthand couples both -- a skin rule cannot fully own `boxShadow` here without a
  `--ds-tour-mask-color` custom-property bridge feeding the runtime-templated string.
- Consumer-supplied `mask.style` is spread last in modern (`...maskStyle`) but not in
  rustic -- a genuine cross-engine capability asymmetry (a consumer can override the
  modern mask's paint via the `mask` prop; the same prop cannot do that under rustic).
- Zero interaction paint in both engines is either a real gap to fix or a deliberate
  minimal-chrome choice -- flag for the contract step rather than silently adding
  hover states that never existed.

---

# ConfirmDialog (42 sites counted: modern 21, rustic 21)

`primitives/overlay/ConfirmDialog`, no compound subcomponents, no shared utils, no
`ConfirmDialog.tsx` paint (pure `createEngineComponent` dispatch, re-exports
`VARIANT_COLORS`/`CONFIRM_DIALOG_DEFAULTS`, zero DOM of its own). "Composes the Modal
component internally" per its own file header comment -- **false for both in-scope
engines**: grep-confirmed neither `engines/modern.tsx` nor `engines/rustic.tsx`
imports `Modal` from anywhere; each hand-rolls its own backdrop+dialog markup
independently. (Only the out-of-scope `classic` engine actually composes AntD's
`Modal`, which is presumably what the stale comment describes.)

## PORTAL VERDICT -- NEITHER ENGINE PORTALS
Zero `createPortal`/`Portal` import in either file (grep-confirmed). Both render as a
plain in-tree `position:fixed` sibling wherever `<ConfirmDialog>` is mounted -- same
containing-block risk class as the feedback batch's Message/Notification/Drawer
(an ancestor with `transform`/`filter`/`contain` traps the fixed positioning).

## MODERN -- 21 sites
| Part | Lines | Channels | Class |
|---|---|---|---|
| Backdrop | 121-124 | background (`var(--ds-color-alpha-black-40)` -- single flat token, **no fallback chain**, and a **different opacity (40%) than rustic's 50% fallback** for the conceptually same scrim, see trap below) | STATIC |
| Dialog card | 125-134 | borderRadius, background, boxShadow -- **no `border` at all** | STATIC |
| Icon wrapper | 138 | color (`colors.icon` from shared `VARIANT_COLORS[variant]`) | STATE-SELECTED |
| Description | 147 | color | STATIC |
| Cancel button | 153-167 | borderRadius, border:none, background:transparent, color | STATIC, no hover |
| Confirm button | 170-185 | borderRadius, border:none, background+color (STATE-SELECTED via `VARIANT_BTN_STYLE[variant]`, a **second, independent** variant-color table from `VARIANT_COLORS` -- see trap) | STATIC + STATE-SELECTED |
| Loading spinner | 187-198 | border (2px solid currentColor), borderTopColor:transparent, borderRadius:50%, `animation: 'ds-spin ...'` | STATIC, conditional on `loading` |

## RUSTIC -- 21 sites
| Part | Lines | Channels | Class |
|---|---|---|---|
| Backdrop | 108-118 | backgroundColor (full 3-level fallback chain, same `--ds-overlay-bg`/`--ds-modal-overlay-bg` chain Modal/Sheet/AlertDialog share) | STATIC |
| Dialog card | 121-132 | backgroundColor, color, borderRadius, border, boxShadow, backdropFilter (**unconditional** -- no prop to disable it, unlike Modal's `blurBackdrop`) | STATIC |
| Icon badge | 163-176 | color, backgroundColor (both `colors.icon`/`colors.bg` from `VARIANT_COLORS`), borderRadius:9999px, boxShadow (inset ring) | STATE-SELECTED (color/bg) + STATIC (ring/radius) |
| Title | 183-193 | color | STATIC |
| Description | 196-205 | color | STATIC |
| Cancel button | 210-221 | borderRadius, backgroundColor, color, border | STATIC, `transition` declared (**dead**, see below) |
| Confirm button | 223-247 | borderRadius, backgroundColor (`colors.button` from `VARIANT_COLORS` -- same table the icon uses, unlike modern's separate table), color, boxShadow | STATE-SELECTED (bg) + STATIC, `transition` declared (dead) |
| Confirm-button spinner | 235-244 | stroke=currentColor, `animation: 'spin 1s linear infinite'` | STATIC, conditional on `loading` |

## Interaction paint
**Zero hover/focus feedback in either engine** (no `:hover` CSS, no handlers, no
imperative writes -- grep-confirmed) -- same clean-but-gapped posture as Tour.
Rustic's `buttonBaseStyle` (135-143) declares a `transition` covering
`transform`/`opacity`/`box-shadow`, explicitly riding
`--ds-personality-animation-entrance-duration` -- but nothing ever changes those three
properties on either button (no hover state, no `disabled`-driven style swap beyond
`cursor`/`opacity` set inline, not transitioned), so **this is dead code**, the same
shape as the feedback batch's Modal cancel/OK dead-transition finding, here reading a
personality duration token for an animation that never plays.

## Keyframes / animation
Modern spinner uses `ds-spin`; rustic spinner uses `spin` -- **two different keyframe
names for the visually-identical loading indicator**, cross-engine naming
divergence. Both resolve today only because `tokens/css/engines/index.css`
unconditionally `@import`s **all three** engine `theme.css` files (classic, modern,
rustic) into every tenant bundle regardless of active engine -- `ds-spin` is
physically defined in `engines/rustic/theme.css:1052` but consumed by **modern**'s
ConfirmDialog (and modern's own Spinner primitive, and several `patterns/*/engines/
modern.tsx` files elsewhere in the DS) -- works today by virtue of that
all-engines-always-bundled model, not because the name lives in the right file; would
break if that bundling model ever moved to per-engine code-splitting. Separately,
`@keyframes spin` (which rustic's own spinner uses) is declared **twice** --
`foundation/animations/keyframes.css` (`rottay-tokens` layer, `from 0deg to 360deg`)
and `engines/modern/theme.css:1103` (`rottay-engines` layer, `to 360deg` only, no
explicit `from`) -- later-layer-wins per the cascade-layer order declared in
`entrypoints/styles.css`, but the two bodies are visually equivalent (an implicit
`from` defaults to the element's current transform), so this is redundant
duplication, not a live rendering bug.

## Existing class/data contract
**Rustic**: `rottay-confirm-dialog-rustic {className}` on the backdrop root (the only
static classname anywhere in this component); `role="alertdialog" aria-modal="true"
aria-labelledby aria-describedby` on the dialog card -- full ARIA. **Modern**: bare
consumer `{className}` passthrough only, **zero role/aria-* of any kind** -- same a11y
gap shape as Tour's modern engine. **Zero `data-*`** in either engine (only
`data-testid`, a test hook, not a styling contract).

## Suppression risk
Grepped `rottay-confirm-dialog`, `confirm-dialog` across `personality.css` and every
engine `theme.css`: zero hits. No personality-currently-wins channel here.

## Won't transcribe cleanly (ConfirmDialog)
- **Two independent variant-color tables drive different parts**: `VARIANT_COLORS`
  (icon/bg/button, shared with rustic's icon+confirm-button) vs modern-only
  `VARIANT_BTN_STYLE` (background+color for the confirm button specifically) --
  modern's confirm button does **not** read `VARIANT_COLORS.button` at all, it has its
  own parallel three-variant map with different literal values
  (`var(--ds-color-primary)` vs `VARIANT_COLORS.info.button`'s
  `var(--ds-color-primary-500, #1890ff)`) -- collapsing these into one `[data-variant]`
  rule is a real design decision (which table wins?), not a mechanical merge.
- Backdrop opacity genuinely differs by engine today (40% flat token, modern; 50%
  fallback inside a 3-level chain, rustic) -- "byte-exact" migration must preserve
  that mismatch rather than quietly harmonizing it.
- Modern has no `border` on the dialog card at all; rustic does -- another
  chrome-shape asymmetry alongside the backdrop-blur gap (rustic blurs
  unconditionally, modern never blurs).
- Rustic's dead `transition` (personality-token-driven, never triggered) --
  transcribing it as if it does something would be optimistic, matching the
  feedback-batch dead-transition pattern already catalogued for Modal.
- The `ds-spin`/`spin` keyframe-name split needs a decision at migration time:
  standardize on one name (probably `ds-spin`, since Spinner primitive already
  anchors on it) rather than perpetuating two names for the same rotation.

---

# Popconfirm (41 sites counted: modern 21, rustic 20)

`primitives/overlay/Popconfirm`, no compound subcomponents, no shared utils.

## PORTAL VERDICT -- the first real intra-component engine asymmetry in this scope
**Modern does NOT portal.** It renders the popover as an in-tree `absolute`-positioned
sibling inside a `relative inline-block` wrapper (129-144) -- simple, but means the
popover can be clipped by any ancestor with `overflow:hidden`, and z-index is a flat
Tailwind `z-50` utility rather than the shared `--ds-popconfirm-z-index` token rustic
uses. **Rustic DOES portal** -- direct `createPortal(..., document.body)` (own
`react-dom` import, not the shared `Portal` util), with position computed once from
`triggerRef.getBoundingClientRect() + window.scrollX/Y` in a `useEffect` gated on
`[isOpen, placement]`. **This is the concrete precedent the task brief predicted**
(the inputs-batch TreeSelect/Cascader shape, rustic portals/modern doesn't) showing up
for the first time in this scope. Rustic's positioning has its own real gap: the
effect never listens for `scroll`/`resize`, so **if the page scrolls or the window
resizes while the popover is open, its position goes stale** relative to the trigger
-- a live defect, not a migration concern, but worth recording since a skin/capture
harness that scrolls the page mid-open will see it.

## MODERN -- 21 sites (recount matches the audit script's 21 -- the higher-than-
## visual count is the script counting each branch of the two switch statements in
## source text, not just the one live render path per instance)
| Part | Lines | Channels | Class |
|---|---|---|---|
| Icon | 147 | color (`var(--ds-color-warning)` -- hardcoded, no `--ds-popconfirm-*` token at all) | STATIC |
| Card | 145 | background, borderRadius, border, boxShadow | STATIC |
| Description | 151 | color | STATIC |
| Cancel button | 158-172 | borderRadius, border:none, background:transparent, color | STATIC, no hover |
| Confirm button | 174-189 | borderRadius, border:none, background+color (STATE-SELECTED, 3-branch `getOkButtonStyle` switch on `okType`) | STATIC + STATE-SELECTED |
| Loading spinner | 191-202 | border, borderTopColor:transparent, borderRadius:50%, `animation: 'ds-spin ...'` | STATIC, conditional `loading \|\| okButtonLoading` |

**Zero `--ds-popconfirm-*` token references anywhere in this file** -- every value is
either a generic DS token (`--ds-color-*`, `--ds-radius-*`, `--ds-elevation-3`) or a
Tailwind utility (`relative inline-block`, `absolute z-50`, placement classes,
`flex`/`gap`/`mt-*` utilities). This is the **second** component in this scope
(after Tour) where modern has no first-class token surface while rustic has a full
one -- see the cross-family note below, this is now a pattern, not a one-off.

## RUSTIC -- 20 sites
| Part | Lines | Channels | Class |
|---|---|---|---|
| Popover panel | 173-188 | backgroundColor, borderRadius, boxShadow, border, backdropFilter (**unconditional**, and reusing `--ds-modal-overlay-backdrop` -- a Modal-scoped token name, not a Popconfirm one, despite every other value in this same style object having a dedicated `--ds-popconfirm-*` hook) | STATIC |
| Icon | 192 | color (`--ds-popconfirm-icon-color`, full fallback chain) | STATIC |
| Title | 197 | color | STATIC |
| Description | 199 | color | STATIC |
| Cancel button | 216-224 | border, backgroundColor | STATIC, no hover |
| Confirm button | 228-238 | backgroundColor+color (STATE-SELECTED, 3-branch `getOkButtonStyle` switch, own full `--ds-popconfirm-{danger,primary,default}-{bg,color}` token family, all with hex fallbacks -- a materially richer, more complete token surface than modern's for the identical three `okType` values) | STATE-SELECTED, opacity dims while loading (238, not counted -- not a listed channel) |

**No loading spinner element at all** -- rustic's loading treatment is `opacity:
loading ? 0.7 : 1` on the confirm button only (238); modern's loading treatment is a
spinner ring with no opacity change. **Two mutually exclusive loading-feedback
mechanisms for the same boolean state, one per engine** -- a real, not cosmetic,
behavior divergence a migration must decide whether to preserve or unify.

## Interaction paint
Zero hover/focus feedback in either engine (grep-confirmed, same as ConfirmDialog and
Tour). Rustic's `zIndex: 'var(--ds-popconfirm-z-index, 1050)' as unknown as number`
(178) is the same type-cast-smuggling trap the WO-SKIN-03 report flagged for Toast
rustic's `opacity` -- a CSS custom-property string forced past React's `number`
typing; any static/props-based scraper that respects the declared TS type will
mis-read this value.

## Keyframes / animation
No `<style>`/`@keyframes` in either engine -- only the `ds-spin` reference in modern's
spinner (same cross-engine-bundling caveat as ConfirmDialog: works because
`engines/index.css` always bundles all three engines' `theme.css`, and `ds-spin` is
physically defined in `engines/rustic/theme.css`). No entrance/exit animation for the
popover itself in either engine -- it appears/disappears by conditional render only.

## Existing class/data contract
**Neither engine stamps any `data-*`.** Modern: zero static classnames beyond
Tailwind utilities and consumer `className`/`overlayClassName` passthrough. Rustic:
`className` on the trigger wrapper, bare `overlayClassName` passthrough on the
portalled panel (no static base class of its own at all -- unlike Popover/ContextMenu/
Dropdown rustic engines below, which all stamp a real base classname alongside the
consumer one). `role="dialog" aria-modal="true"` on rustic's panel; **modern's panel
has no role/aria-* at all** -- same a11y-gap shape as every other modern engine so far
in this scope (Tour, ConfirmDialog).

## Suppression risk
Grepped `popconfirm` across `personality.css` and every engine `theme.css`: zero hits
in `personality.css`. The only hits are in the out-of-scope `classic` engine's
`theme.css` (`.ant-popconfirm-inner-content` padding, `.ant-popconfirm-title`
font-weight, `.ant-popconfirm-buttons` gap -- AntD-specific selectors, structural
layout properties, not paint, and not personality). No personality-currently-wins
channel for this component. **All `--ds-popconfirm-*` tokens referenced by rustic and
classic are undefined anywhere in the tokens tree** -- same Law-1 shape as Tour,
rustic's hex fallbacks are what tenants see today.

## Won't transcribe cleanly (Popconfirm)
- The portal/no-portal engine split is the load-bearing item: a skin/data-part
  contract for this component cannot assume one DOM shape or one containing-block
  posture across engines.
- Rustic's stale-position-on-scroll gap is a live defect a migration should record,
  not silently fix as a side effect of adding `data-part` stamps.
- The two mutually exclusive loading treatments (spinner vs. opacity-dim) are a real
  behavior difference to preserve or explicitly reconcile, not an oversight to
  "correct" during a byte-exact pass.
- `backdropFilter` riding a Modal-named token (`--ds-modal-overlay-backdrop`) inside
  an otherwise fully `--ds-popconfirm-*`-scoped style object is a naming leak worth
  fixing at the token-authoring level, separate from the skin migration itself.
- Modern's total absence of a `--ds-popconfirm-*` surface (same shape as Tour) means
  the contract step must decide whether modern gets its own component-scoped tokens
  during this migration or continues drawing from generic ones.

---

# Sheet (39 sites counted: modern 19, rustic 20)

`primitives/overlay/Sheet`, no compound subcomponents, no shared utils. Both engines'
own doc comments describe this as part of a deliberate "unified overlay family visual
language -- shared backdrop, surface, border, and motion tokens with Modal and Drawer"
-- and, unusually for this scope, that convergence is real: **neither** engine has its
own `--ds-sheet-*` token family; both intentionally ride Modal/Drawer's existing
tokens instead (contrast Tour and Popconfirm above, where the missing-token-surface
gap on modern was an unintentional asymmetry, not a documented design decision).

## PORTAL VERDICT -- same in-tree/portal split as Popconfirm
**Modern does not portal** -- in-tree `position:fixed` wrapper rendered wherever
`<Sheet>` mounts (239-248). **Rustic portals directly** -- `createPortal(...,
document.body)` (own `react-dom` import, not the shared `Portal` util, same as every
other rustic-only-portals component in this scope so far).

## THE Z-INDEX TOKEN SYSTEM, AND WHERE IT STOPS
Modern's wrapper/panel read `var(--ds-z-overlay)` / `var(--ds-z-drawer)`
(242-246, 184) -- a real, **defined** tokenized z-index scale
(`foundation/themes/default.css:458-460`: `--ds-z-overlay: var(--ds-z-index-overlay,
1300)`, `--ds-z-drawer: var(--ds-z-index-drawer, 1400)`, and `--ds-z-modal:
var(--ds-z-index-modal, 1500)` used by ConfirmDialog modern above) -- own code
comments call this out explicitly ("Tokenized overlay stack (spec section 9)...
instead of a magic 50/51"). **Rustic does not participate in this system at all** --
its panel and overlay z-indices are hardcoded magic numbers, `1060` and `1059`
respectively (85, 144), coincidentally close to but not derived from the same scale.
z-index is not one of this document's counted paint channels, but the split is worth
recording: modern has a real, working, documented token system here that rustic
simply doesn't use.

## MODERN -- 19 sites
| Part | Lines | Channels | Class |
|---|---|---|---|
| Backdrop | 250-261 | background (`color-mix(...)`, generic token), backdropFilter+WebkitBackdropFilter (**hardcoded `blur(4px)`, not tokenized** -- the one place in this file where rustic is the more token-forward engine, see below) | STATIC |
| Panel | 179-232 | background, border, borderRadius (STATE-SELECTED via `RADIUS_BY_SIDE[side]` lookup), boxShadow | STATIC + STATE-SELECTED |
| Handle bar | 283-290 | background, borderRadius:9999px (full pill) | STATIC |
| Title border | 296-304 | borderBottom | STATIC |
| Title text | 306-317 | color | STATIC |
| Close button | 73-115 (shared fn, "shared visual with Modal/Drawer" per comment) | border:none, borderRadius, backgroundColor, color, svg stroke=currentColor | STATIC + **IMPERATIVE hover** (93-98, `.style.backgroundColor`) |

## RUSTIC -- 20 sites
| Part | Lines | Channels | Class |
|---|---|---|---|
| Panel | 83-132 | backgroundColor (`--ds-drawer-bg` first in chain -- **this one IS defined**, `foundation/themes/default.css:1737` plus tenant artifacts, a live override point unlike most of this file's other borrowed-from-Modal tokens), color, boxShadow, border, borderRadius (STATE-SELECTED per-side, **hardcoded `16` px, not a `--ds-radius-*` token** -- unlike modern's `var(--ds-radius-lg)` for the same corners) | STATIC + STATE-SELECTED |
| Overlay | 139-149 | backgroundColor (shared 3-level `--ds-overlay-bg`/`--ds-modal-overlay-bg` chain), backdropFilter (`var(--ds-modal-overlay-backdrop, blur(4px))` -- **tokenized here**, the inverse of modern's hardcoded backdrop blur above) | STATIC |
| Handle bar | 169-176 | backgroundColor, borderRadius:2 (**small rounded rect, not a pill** -- a real shape divergence from modern's `9999px` pill for the same affordance) | STATIC |
| Title border | 180-187 | borderBottom (`--ds-modal-header-border`) | STATIC |
| Title text | 189 | color (`--ds-modal-title-color, inherit`) | STATIC |
| Close button | 190-206 | border:none, background:transparent, color | STATIC, `transition` declared but **DEAD** (no hover handler, no `:hover` rule -- see below) |

## Interaction paint -- a reversed asymmetry vs. the rest of this scope
**Modern's close button has real imperative hover** (`.style.backgroundColor` on
mouseenter/leave, the same pattern as Modal/Drawer). **Rustic's close button declares
a `transition` (202, riding `--ds-personality-animation-entrance-duration`) but has no
mouseenter/mouseleave handler and no `:hover` CSS rule anywhere in the file** -- dead,
same shape as the ConfirmDialog/Modal dead-transition finding. This is notable because
it's the **first component in this scope where modern has genuine interaction paint
and rustic's is the dead one** -- every other component so far in this document either
had both engines dead (Tour, Popconfirm) or rustic with real imperative hover and
modern static (Modal, implicitly by the feedback precedent). Don't assume a fixed
"which engine has real hover" rule across this family; it must be checked per
component.

## Keyframes / animation -- the Drawer-rustic dead-transition defect recurs almost
## verbatim
Modern injects `SHEET_STYLES` (30-47) via `<style dangerouslySetInnerHTML>` on every
render, **no dedup** (same non-dedup shape as Modal) -- four keyframes, all
engine-unqualified names (`rottay-sheet-backdrop-fade`, `rottay-sheet-slide-{bottom,
left,right}`), real CSS `animation` on both backdrop and panel, direction-aware per
`side`. **Rustic has zero `<style>`/`@keyframes`.** Its panel declares `transition:
'transform ...'` (92) -- but **`transform` is never assigned a value anywhere in
`getPanelStyle()`** for any side (grep-confirmed: no `transform` key in the base
object or any of the three side branches). Combined with the synchronous `if (!open)
return <></>` unmount, **rustic Sheet has no functioning slide animation at all** --
it snaps open/closed instantly despite the declared transition. This is the
**feedback-batch Drawer-rustic defect, recurring almost verbatim** in a different
component: a declared-but-inert `transition: transform` plus instant unmount,
producing the same "no motion despite a transition existing" outcome the WO-SKIN-03
report already catalogued once for Drawer.

## Existing class/data contract
**Neither engine stamps any `data-*` or static base classname** -- both are pure
`className`/`panelClassName` passthrough with no anatomy hooks at all, the most bare
component so far in this scope alongside Tour's modern engine (but here BOTH engines
are bare, not just one). `role="dialog" aria-modal="true"` in both engines; modern
additionally sets `aria-label` from the `title` prop (268) when it's a string --
rustic's panel has no `aria-label`/`aria-labelledby` at all, a real (if minor) a11y
gap in the opposite direction from this scope's usual modern-is-less-accessible
pattern.

## Suppression risk
Grepped `sheet`/`rottay-sheet` across `personality.css` and every engine `theme.css`:
zero hits. No personality-currently-wins channel for Sheet.

## Won't transcribe cleanly (Sheet)
- Rustic's dead slide transition is the load-bearing item -- do not port it as if it
  animates; the feedback-family Drawer precedent already established this pattern
  should be flagged, not silently kept.
- The z-index split (modern: real token scale; rustic: magic numbers 1059/1060) is a
  design decision for the contract step, not a mechanical value swap.
- Handle-bar shape (pill vs. small rounded rect) and corner radius (token vs.
  hardcoded `16`) are two independent, real cross-engine visual divergences on
  ostensibly "the same" affordance -- decide whether byte-exact migration preserves
  both mismatches or the contract unifies them.
- Backdrop blur is tokenized on rustic but hardcoded on modern -- the inverse of this
  scope's usual pattern (modern more token-forward) -- worth normalizing consistently
  in one direction during the token-authoring pass.
- Modern's four keyframe names are unqualified (no `-modern` suffix) -- namespace them
  per the Modal precedent even though rustic currently has no competing names, since
  rustic gaining real animation later is a live possibility this component's own gap
  demonstrates.

---

# ContextMenu (23 sites counted: modern 7, rustic 16)

`primitives/overlay/ContextMenu`, no compound subcomponents, no shared utils. Both
engines define an internal `MenuItem` sub-renderer (divider / group-header / standard
row) inline in the same file rather than as a separate component.

## PORTAL VERDICT -- same in-tree/portal split as Popconfirm and Sheet
**Modern does not portal** -- `position: absolute` menu inside a `position: relative`
trigger container (142-146), positioned from cursor offset relative to that
container's own bounding rect. **Rustic portals directly** to `document.body`
(own `createPortal` import, not the shared `Portal` util), positioned from
`e.clientX/Y + window.scrollX/Y` -- absolute page coordinates, not container-relative,
so (unlike Popconfirm rustic) this one is correctly scroll-position-derived at open
time, though it has the same no-scroll-listener gap: if the page scrolls while the
menu is open, it does not reposition.

## NEITHER ENGINE HAS ITS OWN TOKEN FAMILY -- but for two different reasons
**Modern** uses zero `--ds-context-menu-*` and zero `--ds-dropdown-*` tokens -- every
value is a generic DS token (`--ds-color-border-subtle`, `--ds-color-text-muted`,
`--ds-color-error`, `--ds-surface-card`, `--ds-elevation-2`) or a bare Tailwind
utility, the same "no first-class surface" shape as Tour/Popconfirm modern. **Rustic**
also has zero `--ds-context-menu-*` tokens, but for a different reason: **it fully
adopts Dropdown's token namespace instead** -- `--ds-dropdown-divider-color`,
`--ds-dropdown-group-color`, `--ds-dropdown-danger-color`, `--ds-dropdown-item-color`,
`--ds-dropdown-item-hover-bg`, `--ds-dropdown-shortcut-color`, `--ds-dropdown-bg`,
`--ds-dropdown-radius`, `--ds-dropdown-shadow`, `--ds-dropdown-border-color` -- ten
references, all Dropdown-scoped, zero ContextMenu-scoped. This is a third distinct
divergence shape in this scope (after Tour/Popconfirm's "rustic has its own family,
modern has none" and Sheet's "neither has its own, both intentionally share
Modal/Drawer's"): here **rustic borrows a sibling component's namespace outright**
rather than having no scoped tokens or its own family. Confirm this is intentional
before assuming a `--ds-context-menu-*` family should be invented during migration --
the contract step may prefer to keep riding Dropdown's tokens (both are floating
item-menus) rather than fork a new namespace.

## MODERN -- 7 sites
| Part | Lines | Channels | Class |
|---|---|---|---|
| Divider `<li>` | 42 | background | STATIC |
| Group header `<li>` | 47 | color | STATIC |
| Item row danger state | 58 | color (conditional inline `style` object, only present when `item.danger`) | STATE-SELECTED |
| Menu `<ul>` | 157-175 | background, border, borderRadius, boxShadow | STATIC |

**Zero hover styling of any kind on menu item rows** -- no `:hover` CSS, no Tailwind
`hover:` utility, no handlers (grep-confirmed). The `<button>` only carries structural
Tailwind flex utilities plus the conditional `disabled opacity-50` classes. This is a
real, notable gap given rustic's item rows (below) have an elaborate two-property
micro-interaction for the same conceptual element.

## RUSTIC -- 16 sites
| Part | Lines | Channels | Class |
|---|---|---|---|
| Divider | 34-41 | backgroundColor | STATIC |
| Group header | 47-58 | color | STATIC |
| Item row | 62-99 | background:transparent (base), color (STATE-SELECTED `item.danger`), borderRadius | STATIC + STATE-SELECTED + **IMPERATIVE hover** (90-98, `.style.backgroundColor` AND `.style.transform = 'translateX(2px)'` -- a two-property slide+tint micro-interaction, the most elaborate hover effect in this scope so far) |
| Shortcut label | 106 | color | STATIC |
| Menu container | 190-204 | backgroundColor, borderRadius, boxShadow, border, backdropFilter (**again** `--ds-modal-overlay-backdrop` -- the third component in this scope reusing a Modal-named token for a non-modal panel, after Popconfirm and Sheet's overlay -- now a confirmed cross-family pattern, not a one-off) | STATIC |

## Interaction paint -- rustic's transition is the rare LIVE one in this scope
Rustic's item-row `transition` (88, covering `background-color`/`color`/`transform`,
riding `--ds-personality-animation-entrance-duration`) is **not dead** -- unlike every
other declared-but-untriggered transition catalogued so far in this document (Modal
cancel/OK, ConfirmDialog buttons, Sheet close button), this one has matching
`onMouseEnter`/`onMouseLeave` handlers that actually mutate `backgroundColor` and
`transform`, so the CSS transition genuinely animates those changes. Worth naming
explicitly as the exception to a pattern this document has otherwise treated as
near-universal.

## Keyframes / animation
Modern injects `CONTEXT_MENU_STYLES` (23-32) via `<style dangerouslySetInnerHTML>`,
gated on `shouldRender` (from `usePresence`, so it does get a real exit animation,
unlike some other components in this scope) -- two keyframes,
`rottay-popover-enter`/`rottay-popover-exit`. **The file's own comment states this is
"Shared shape with Dropdown's popover motion"** -- meaning Dropdown's modern engine
(below) very likely injects the **same two keyframe names independently** via its own
per-mount `<style>` tag. If both a ContextMenu and a Dropdown are open simultaneously,
two separate `<style>` nodes would both declare `@keyframes rottay-popover-enter` --
harmless only if the bodies stay byte-identical between the two files; verify this
when reading Dropdown, and treat "shared shape, independently declared" as a
migration opportunity to genuinely share one keyframe definition rather than
duplicate-by-convention across two skin files. **Rustic has zero keyframes/
`<style>`/`transition` on the container** -- the menu itself pops in/out instantly
with no entrance animation (only individual item rows animate, via the hover
transition above).

## Existing class/data contract
**Zero `data-*` in either engine.** Rustic has real ARIA: `role="menu"` (container),
`role="menuitem"` (item buttons), `role="separator"` (divider) -- a complete menu
role structure. **Modern has none of these** -- no `role` anywhere, same a11y-gap
shape as this scope's other modern engines. Neither engine has a static base
classname; both are pure `overlayClassName`/`className` passthrough.

## Suppression risk
Grepped `context-menu`/`contextmenu` across `personality.css` and every engine
`theme.css`: zero hits. No personality-currently-wins channel for ContextMenu.

## Won't transcribe cleanly (ContextMenu)
- The zero-hover-on-modern vs. elaborate-two-property-hover-on-rustic gap is a real
  UX asymmetry to decide on, not a transcription detail.
- Whether to keep rustic riding Dropdown's token namespace or fork a
  `--ds-context-menu-*` family is a contract-level decision with real blast radius
  (changing rustic ContextMenu's tokens today would also require checking every other
  rustic Dropdown-token consumer for unintended spillover, since nothing currently
  scopes these to "ContextMenu only").
- The shared-shape-but-independently-declared `rottay-popover-enter/-exit` keyframes
  need verification against Dropdown before assuming they're safe to leave duplicated.
- The live (non-dead) transition here is the exception, not the rule, for this
  scope -- don't apply the "transitions are usually dead" heuristic from the rest of
  this document to this specific site.

---

# Popover (22 sites counted: modern 8, rustic 14)

`primitives/overlay/Popover`, no compound subcomponents, no shared utils.

## PORTAL VERDICT -- same in-tree/portal split, fourth occurrence
**Modern does not portal** -- in-tree `position:absolute` content inside a
`position:relative` wrapper (185-199). **Rustic portals directly** to `document.body`
(own `createPortal`, `position:fixed`), position recalculated in a `useEffect` gated
on `[isOpen, placement]` -- same no-scroll/no-resize-listener gap already noted for
Popconfirm (a scroll or resize while open leaves the popover stale).

## SUPPRESSION RISK -- a DORMANT personality rule this migration could accidentally
## wake up
`tokens/css/runtime/personality.css:581-585`:
```css
.ant-popover, .popover, [data-engine] .ds-popover {
  animation: ds-dropdown-enter var(--ds-personality-animation-entrance-duration, 200ms) cubic-bezier(0.16, 1, 0.3, 1);
}
```
**Neither engine's Popover currently carries any of these three classnames** --
grep-confirmed zero static base classname on either engine's content panel (both are
pure `overlayClassName`/`className` passthrough, no default class at all) -- so this
rule is **completely dormant today**: it wins nothing, because nothing matches it.
Combined with the confirmed-zero `<style>`/`@keyframes`/`transition` in both engine
files, **Popover has no entrance animation of any kind today, in either engine**. This
is the **inverse** of the suppression hazard the lane's law usually warns about (a
migration silently killing a personality rule that wins today): here, if the
migration's scope-class choice for Popover happens to be `ds-popover` (a natural,
expected name), **this dormant rule would suddenly activate for the first time**,
giving Popover an entrance animation neither engine has ever had. Flag this choice
explicitly for the contract step -- either embrace the newly-live animation as an
intentional improvement, or pick a different scope class (e.g.
`rottay-popover--modern`) to deliberately keep it dormant and preserve today's
zero-animation behavior.

## A REAL FUNCTIONAL GAP, not just a styling one -- modern collapses 12 placements to 4
Rustic's `getPositionStyles` (61-126) implements all **12** values of the shared
`PopoverPlacement` type with distinct math per value (`top`/`topLeft`/`topRight`/
`bottom`/`bottomLeft`/`bottomRight`/`left`/`leftTop`/`leftBottom`/`right`/`rightTop`/
`rightBottom`). **Modern's `getContentPositionStyles` (120-145) only branches on
`.includes('top')`/`.includes('bottom')`/`.includes('left')`/`.includes('right')`,
then unconditionally re-centers every top/bottom placement** (`base.left = '50%';
base.transform = 'translateX(-50%)'`, 139-143) **regardless of a `Left`/`Right`
suffix** -- so `'top'`, `'topLeft'`, and `'topRight'` all render identically
(centered) under modern, and the same collapse happens for `'left'`/`'leftTop'`/
`'leftBottom'` (always vertically centered) and the right-side trio. Modern silently
supports only 4 of the 12 typed placement values; the other 8 render as their nearest
of the 4. This is a genuine pre-existing behavior gap the migration should record, not
a paint-channel concern per se, but it affects how any position-dependent skin rule
(e.g. arrow-flip logic) should be scoped: rustic needs up to 12 position variants,
modern only ever needs 4.

## MODERN -- 8 sites
| Part | Lines | Channels | Class |
|---|---|---|---|
| Content panel | 203-213 | borderRadius, background, boxShadow | STATIC |
| Title border | 216 | borderBottom (hardcoded `--ds-color-border`, no popover-scoped token) | STATIC |
| Arrow | 222 | background (**no boxShadow at all** -- contrast rustic below) | STATIC |

**Zero `--ds-popover-*` tokens anywhere** -- the fourth component in this scope after
Tour/Popconfirm/ContextMenu where modern has no first-class token surface (see
cross-family notes).

## RUSTIC -- 14 sites
| Part | Lines | Channels | Class |
|---|---|---|---|
| Content panel | 264-277 | backgroundColor, borderRadius, boxShadow, border, backdropFilter (**again** `--ds-modal-overlay-backdrop`, the fourth recurrence of this exact cross-component token borrowing in this scope) | STATIC |
| Title | 284-294 | borderBottom (`--ds-popover-title-border`, dedicated token), color (`--ds-popover-title-color`, dedicated token -- modern's title has no color property at all, inheriting ambient text color) | STATIC |
| Arrow | 298-306 | backgroundColor (same `--ds-popover-bg` as the panel, so it visually matches), boxShadow (`--ds-popover-arrow-shadow` -- **a real visual detail modern's arrow entirely lacks**) | STATIC |

**A genuinely complete, dedicated `--ds-popover-*` token family** (11 references:
`bg`, `radius`, `shadow`, `padding`, `min-width`, `max-width`, `border-color`,
`title-border`, `title-color`, `arrow-size`, `arrow-shadow`), all with sensible hex
fallbacks -- the richest per-component token surface found in this document so far,
matching the classic engine's own `.ant-popover-*` rules (`theme.css:873-881`), which
read the **same** token names (`--ds-popover-bg/-radius/-shadow/-padding`) -- unlike
Tour, where classic's vocabulary diverged from rustic's, here all engines that
reference `--ds-popover-*` agree on the names. None of the eleven are defined
anywhere in the tokens tree, though (same Law-1 shape as Tour/Popconfirm) -- rustic's
hex fallbacks are what ships today.

## Interaction paint
No `:hover`/imperative paint writes in either engine (this component's interaction
model is trigger-based open/close via `click`/`hover`/`focus`, not per-element hover
styling). **Rustic's portaled panel re-binds `onMouseEnter`/`onMouseLeave`
(280-281)** -- "so moving the cursor from trigger to content does not trigger a
premature close" per its own comment -- a real, portal-specific necessity: because
the panel is a `document.body` child and not a DOM descendant of the trigger wrapper,
the trigger's own `mouseleave` would otherwise fire the moment the cursor crosses into
the (structurally separate) panel. Modern needs no such rebinding because its panel
IS a DOM descendant of the hover-tracked wrapper. **Relevant for any capture/skin
verification harness**: testing rustic Popover's hover-open behavior requires moving
the pointer through the actual panel, not just the trigger -- a scripted hover-only-
on-trigger test would falsely appear to work on modern and falsely appear broken (or
untested) on rustic's cross-trigger-to-panel path.

## Keyframes / animation
**None in either engine**, confirmed by grep (no `<style>`, `@keyframes`, or
`transition` anywhere in either file) -- see the dormant-personality-rule writeup
above for why this matters more than usual for this specific component.

## Existing class/data contract
**Zero `data-*`, zero static base classname, in either engine** -- both are pure
`overlayClassName`/`className` passthrough. `role="tooltip"` on rustic's panel only
(a semantically loose fit for a component that can host arbitrary interactive
content, e.g. a form or buttons, but that's existing behavior, not a migration
concern). Modern has no role/aria-* at all.

## Won't transcribe cleanly (Popover)
- The scope-class choice interacts directly with the dormant personality rule --
  this is the single highest-value decision point for this component's contract step.
- Modern's placement-collapse (12 typed values, 4 actually distinct) means a
  migration's `data-placement` attribute should probably still carry all 12 values
  passed by the consumer (so rustic can use them), even though modern's own CSS will
  only ever need to key off the 4 it currently distinguishes -- don't assume the two
  engines need matching `data-placement` selector granularity.
- Rustic's cross-trigger-to-panel hover rebinding is invisible to a paint-site scan
  but load-bearing for interaction-state verification.
- The arrow shadow (rustic only) and the title color (rustic only) are two small but
  real visual-completeness gaps on modern worth deciding on explicitly.

---

# AlertDialog (24 sites counted: modern 10, rustic 14)

`primitives/overlay/AlertDialog`, no compound subcomponents, no shared utils. **No
portal in either engine** (confirmed by grep, zero `createPortal`/`Portal` anywhere).

## THE HEADLINE FINDING -- modern's backdrop blur and dialog shadow are ENTIRELY
## externally sourced today, invisible to any scan of this component's own file

Modern is the **only** component in this scope that renders real DaisyUI structural
classes (`modal modal-open`, `modal-backdrop`, `modal-box`, `modal-action` --
`modern.tsx:84,89,96,124`) rather than hand-rolling fully bespoke markup (contrast
ConfirmDialog modern, which looks similar in spirit but uses zero DaisyUI classes).
Those four classnames are live selectors in **two** external files:

```css
/* tokens/css/runtime/personality.css:177-188, layer(rottay-personality) */
.ant-modal-mask, .modal-backdrop, [data-engine] .ds-modal-overlay {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
.ant-modal-content, .modal-box, [data-engine] .ds-modal-content {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
```
```css
/* tokens/css/engines/modern/theme.css:264-279, layer(rottay-engines) */
[data-tenant] .modal-box { background-color: var(--ds-modal-bg); border-radius: var(--ds-modal-radius); box-shadow: var(--ds-modal-shadow); padding: var(--ds-modal-padding); }
[data-tenant] .modal-backdrop { background-color: var(--ds-modal-overlay-bg); backdrop-filter: var(--ds-modal-overlay-backdrop); }
[data-tenant] .modal-action { margin-top: var(--ds-modal-footer-padding); gap: var(--ds-modal-footer-gap); }
```

`entrypoints/styles.css`'s master `@layer` statement orders `rottay-engines` **before**
`rottay-personality`, so personality's declarations win the cascade for any property
both files touch on the same element, regardless of specificity. Cross-referencing
against AlertDialog modern's own inline styles (which set `background`/`borderRadius`/
`padding` on `.modal-box` and `background` only on `.modal-backdrop` -- **no
`boxShadow`, no `backdropFilter` inline anywhere in the file**): **today, modern
AlertDialog's dialog-box shadow and backdrop blur are painted 100% by
`personality.css`, with zero contribution from AlertDialog's own source file.** A
scan of `AlertDialog/engines/modern.tsx` alone would report zero `boxShadow`/
`backdropFilter` sites for this component -- both are real, currently-rendering paint
that only exists because of the shared DaisyUI classnames. **If a migration renames or
drops the `modal-box`/`modal-backdrop` classnames** (e.g. replacing them outright with
`data-part` selectors and a component-scoped class, the natural instinct for this
migration program), **the blur and shadow disappear silently** -- a real visual
regression a byte-exact migration must catch by explicitly authoring both properties
into AlertDialog's own new skin, not by assuming "nothing painted a shadow here
before" from reading the component's own file.
**Rustic uses none of these classnames** (its own `rottay-alert-dialog-rustic` is
grep-confirmed absent from both `personality.css` and every engine `theme.css`) --
100% self-contained, zero external paint contributors, the opposite posture from
modern within this same component.

## MODERN -- 10 sites
| Part | Lines | Channels | Class |
|---|---|---|---|
| Backdrop | 88-94 | background (`var(--ds-overlay-bg)` -- bare reference, no fallback chain, but the token itself IS defined at `foundation/themes/default.css:810` plus two tenant-artifact overrides, so not actually broken) | STATIC + **externally-sourced `backdropFilter`** (see headline finding) |
| Dialog box | 95-103 | background, borderRadius, padding(not a paint channel) | STATIC + **externally-sourced `boxShadow`** (see headline finding) |
| Icon circle | 107 | background (`color-mix(in srgb, var(--ds-color-error) 10%, transparent)` -- dynamic percentage tint), color | STATIC |
| Description | 119 | color | STATIC |
| Cancel button | 125-140 | background:transparent, color, border:none (**no border at all** -- contrast rustic's outlined cancel button below) | STATIC, no hover |

## RUSTIC -- 14 sites
| Part | Lines | Channels | Class |
|---|---|---|---|
| Backdrop | 84-94 | backgroundColor (full 3-level `--ds-overlay-bg`/`--ds-modal-overlay-bg` chain, same as ConfirmDialog/Sheet) | STATIC |
| Dialog box | 97-106 | backgroundColor (`--ds-modal-bg` first-choice -- modern never references this token at all for the equivalent element), borderRadius, border, boxShadow | STATIC |
| Icon circle | 109-119 | backgroundColor (`var(--ds-color-error-50, #fff2f0)` -- a fixed swatch, not a dynamic `color-mix()` like modern's equivalent), color | STATIC |
| Title | 160-170 | color | STATIC |
| Description | 172-183 | color | STATIC |
| Cancel button | 122-132 | backgroundColor, color, border (**has a real border**, `--ds-modal-footer-border` token -- modern's cancel button has none) | STATIC, `transition` declared but **DEAD** (no hover handler, no `:hover` rule -- same recurring shape as Modal/ConfirmDialog/Sheet) |

## Interaction paint
Zero real interaction paint in either engine (rustic's cancel-button transition is
dead, same as ConfirmDialog's). Consistent with this scope's general pattern for the
non-Menu/non-Modal overlay components.

## Keyframes / animation
No `<style>`/`@keyframes` authored by either engine's own file. `personality.css`'s
`.modal { transition-duration: var(--ds-modal-animation-duration, 200ms);
transition-timing-function: ...; }` (129-139) also targets modern's outer wrapper --
but since neither AlertDialog's own inline styles nor any other rule sets a
`transition` **property** (as opposed to duration/timing) on that wrapper, this is
currently a no-op, timing-only declaration with nothing to time -- unlike the
backdrop-filter/box-shadow findings above, which are real live paint.

## Existing class/data contract
**Modern**: DaisyUI structural classes (`modal modal-open`, `modal-backdrop`,
`modal-box`, `modal-action`) -- the only component in this scope with real,
externally-meaningful base classnames rather than a bare/empty passthrough.
`role="alertdialog" aria-modal="true"` present. **Rustic**: `rottay-alert-dialog-rustic`
(self-scoped, unused by any external file) plus full ARIA (`role="alertdialog"
aria-modal="true" aria-labelledby aria-describedby`). **Zero `data-*`** in either
engine (only `data-testid`).

## Won't transcribe cleanly (AlertDialog)
- The externally-sourced blur/shadow is the load-bearing item for this component --
  any migration must either keep the exact DaisyUI classnames alongside the new
  `data-part` stamps (so personality.css keeps painting them) or explicitly author
  `backdrop-filter: blur(4px)` and `box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25)`
  into AlertDialog's own new skin -- silently dropping the old classnames is the one
  mistake this component can make that a visual diff *would* catch, but only if the
  visual-regression baseline was captured against a real rendered page (matching this
  lane's stated law to record baselines from a PRODUCTION build) rather than a
  component-only harness that might not load `personality.css` at all.
- Modern's cancel button has no border; rustic's does -- another chrome asymmetry to
  decide on, not silently unify.
- The icon tint mechanism differs (dynamic `color-mix()` vs. a fixed `-50` swatch) --
  same shape as ConfirmDialog's icon-badge divergence.
- Rustic's dead cancel-button transition -- same pattern, don't port as live.

---

# Dropdown (18 sites counted: modern 7, rustic 11)

`primitives/overlay/Dropdown`, no compound subcomponents, no shared utils. Both
engines define an internal `MenuItem` sub-renderer, structurally near-identical to
ContextMenu's -- but do **not** assume the two components behave the same way, per
the headline finding below.

## PORTAL VERDICT -- same in-tree/portal split
**Modern does not portal** -- `dropdown` DaisyUI class on a `position:relative`
container, `dropdown-content menu` on the `position:absolute` panel (196-241).
**Rustic portals directly** to `document.body`, position computed from
`getBoundingClientRect()` in a `useEffect` gated on `[isOpen, placement]` (same
no-scroll-listener gap as this scope's other rustic portalers).

## THE HEADLINE FINDING -- modern's item rows are a three-layer external paint stack,
## and this is genuinely different from ContextMenu despite looking like the same
## widget

**ContextMenu modern invents its own `<ul>`/`<li>`/`<button>` with zero DaisyUI
classes and zero external paint (confirmed in that section above). Dropdown modern
does the opposite**: it applies real DaisyUI structural classes --
`rootClassName` composes `dropdown` + placement modifiers (`dropdown-top`,
`dropdown-end`, `dropdown-start`); `menuClassName` composes `dropdown-content menu`
(145-151) -- and those exact classnames have **extensive, live styling in
`tokens/css/engines/modern/theme.css:358-451`**, further modified by
`tokens/css/runtime/personality.css:605-611`. Concretely, for a plain (non-divider,
non-group, non-danger) menu item row, **Dropdown's own `MenuItem` renders the
`<button>` with NO `style` prop at all** (`modern.tsx:64-81` -- compare ContextMenu's
equivalent, which at least sets structural Tailwind classes but still no color/hover).
Every visible property on that row -- `padding`, `border-radius`
(`var(--ds-dropdown-item-radius, 8px)`), `color` (`var(--ds-text-primary)`), and
critically **`:hover { background-color: var(--ds-dropdown-item-bg-hover) }`** -- comes
entirely from `modern/theme.css:409-429`, invisible to any scan of Dropdown's own
source file. **`personality.css:605-611` then overrides the `transition` property**
(engine sets `background-color 0.15s ease`; personality's `rottay-personality` layer
wins and replaces it with `background-color {--ds-personality-animation-entrance-duration}
ease-in-out, color {same-duration} ease-in-out` -- personality's version additionally
transitions `color`, which the engine's didn't). **Net effect: Dropdown modern DOES
have real, live hover feedback today, entirely sourced from two external files** --
the opposite conclusion a naive "modern has no hover, like ContextMenu" pattern-match
from the previous section would produce. A migration that only reads Dropdown's own
`.tsx` and concludes "no hover exists, nothing to port" will **regress** a real,
currently-shipping interaction, unless it also captures against a production build
that actually loads `theme.css`+`personality.css` (this lane's stated law already
requires PRODUCTION-build baselines for exactly this class of reason).
**The danger (`item.danger`) case is a genuine three-way paint recipe**: Dropdown's
own inline `style={{color:'var(--ds-color-error)'}}` (present only when `item.danger`)
masks the engine's `.text-error { color: var(--ds-color-error-600); }` (inline always
wins), but Dropdown sets **no inline hover style**, so `.text-error:hover {
background-color: var(--ds-color-error-50); }` (engine, unmasked) **is** live -- a
danger item's resting color and hover background come from two different sources,
one inline (masking a live-but-dead engine rule) and one purely external.
**One caveat**: `--ds-dropdown-item-bg-hover`/`-bg-active`/`-color-active` are only
defined in the `rottay` tenant artifact (`tokens/css/artifacts/rottay/index.css`), not
in `foundation/themes/default.css`, and the theme.css references carry **no
fallback** -- a tenant without its own dropdown-item overrides would see these
properties resolve to nothing (no hover paint at all), a real per-tenant gap worth a
written note even though it's outside this document's job to fix.

## THE SAME KEYFRAMES CONFIRMED DUPLICATED, BYTE-IDENTICAL, ACROSS TWO FILES
`DROPDOWN_STYLES` (22-31) is **byte-identical** to ContextMenu's `CONTEXT_MENU_STYLES`
-- same two keyframe names (`rottay-popover-enter`/`-exit`), same bodies (`scale(0.96)
translateY(-4px)` <-> `scale(1) translateY(0)`), confirming the "Shared shape with
ContextMenu's popover motion" comment literally, not just in spirit. Each file injects
its own copy via its own per-mount `<style dangerouslySetInnerHTML>` tag -- harmless
today only because the two copies happen to stay in sync by convention, not by any
shared source. **Migration opportunity**: collapse this into one shared keyframe
definition (a common overlay-family skin partial, or `foundation/animations/
keyframes.css`) that both ContextMenu's and Dropdown's modern skins reference, instead
of perpetuating two independently-maintained copies of the same two keyframes.

## RUSTIC -- 11 sites
| Part | Lines | Channels | Class |
|---|---|---|---|
| Divider | 30-37 | backgroundColor (`--ds-dropdown-divider-color`) | STATIC |
| Group header | 41-53 | color (`--ds-dropdown-group-color`) | STATIC |
| Item row | 56-91 | background:transparent, color (STATE-SELECTED `item.danger`) | STATIC + STATE-SELECTED + **IMPERATIVE hover** (79-86, `.style.backgroundColor` only -- **simpler than ContextMenu's rustic hover**, which also animates `transform`; Dropdown's has no accompanying `transition` declaration at all, so this hover snaps instantly with no smooth fade, unlike ContextMenu's eased version of a near-identical widget) |
| Menu panel | 236-248 | backgroundColor, borderRadius, boxShadow (**no `backdropFilter` at all** -- the one component so far in this scope whose rustic floating panel does NOT reuse `--ds-modal-overlay-backdrop`, breaking what looked like a 4-for-4 pattern in Popconfirm/Sheet/ContextMenu/Popover) | STATIC |

`zIndex: 'var(--ds-dropdown-z-index, 1050)' as unknown as number` (240) -- **the same
type-cast-smuggling trap** already flagged for Popconfirm rustic's `zIndex`, now
confirmed as a second, independent occurrence in this scope, not a one-off.

## MODERN -- 7 sites (own-file count; the theme.css/personality.css contributions
## above are NOT counted here since they aren't in Dropdown's own source, but they
## are real live paint -- see headline finding)
| Part | Lines | Channels | Class |
|---|---|---|---|
| Divider | 51 | background | STATIC |
| Group header | 56 | color | STATIC |
| Item row danger state | 71 | color (masks a live engine rule, see headline finding) | STATE-SELECTED |
| Menu panel | 219-233 | background, border, borderRadius, boxShadow (**all of which duplicate/override `modern/theme.css`'s own `.dropdown-content` background-color/border/border-radius/box-shadow declarations** -- inline wins, so the engine's `.dropdown-content` paint rules are fully masked for the panel itself, even though the *item rows inside it* are not) | STATIC |

**A redundant dead `text-error` Tailwind class**: the danger branch's `className`
includes `'text-error'` (68) in addition to the inline `color` style (71) -- since
inline always wins, the Tailwind/engine `.text-error` color rule this class would
otherwise trigger is **always masked whenever it's applied** (the class is only ever
added under the exact same condition the inline style is set) -- a real, if harmless,
two-mechanisms-for-one-property redundancy within this single component's own file,
distinct from the cross-file masking discussed above.

## Keyframes / animation
Modern: `rottay-popover-enter`/`-exit`, real CSS `animation` gated by `usePresence`
(`dataState`), see the duplication finding above. Rustic: none (no `<style>`,
`@keyframes`, or `transition` on the panel itself).

## Dead prop
**`getPopupContainer` is destructured in both engines' prop lists but never
referenced anywhere in either file body** -- a real dead capability, present in the
shared `DropdownProps` type but unimplemented by both in-scope engines (presumably
implemented, if at all, only by the out-of-scope `classic` engine wrapping AntD).

## Suppression risk (structured summary)
- `.dropdown` / `.dropdown-content` / `.menu li > a,button` (+ `:hover`/`.active`/
  `.text-error`/`:disabled` variants): live in `modern/theme.css:358-451`
  (`rottay-engines` layer); item-row paint is **unmasked and live**, panel-level paint
  is **masked** by Dropdown's own inline styles.
- `.menu li > a,button` transition timing: overridden by
  `personality.css:605-611` (`rottay-personality` layer wins over `rottay-engines`).
- `[data-engine] .ds-dropdown` entrance animation
  (`personality.css:195-199`, `@keyframes ds-dropdown-enter`): **dormant** -- Dropdown
  never stamps a `ds-dropdown` classname today (grep-confirmed), so this rule matches
  nothing currently. Same inverse hazard as Popover's `.ds-popover` rule: if a
  migration's chosen scope class happens to be `ds-dropdown`, this rule wakes up and
  adds a **second**, independent entrance animation on top of the component's own
  `rottay-popover-enter` -- on different elements today (personality would likely
  land on whichever node gets the new scope class; Dropdown's own animation is on the
  `<ul>` specifically), so verify exactly what element carries the new scope class
  before assuming the two can't collide on the same node.

## Won't transcribe cleanly (Dropdown)
- The item-row hover is the single highest-value finding in this document to get
  right: it is real, live, and 100% externally sourced today. A migration must
  explicitly author `:hover { background-color: ... }` (and the `.text-error:hover`
  variant) into Dropdown's own new skin, or verify the old DaisyUI classnames survive
  alongside the new `data-part` stamps so `modern/theme.css` keeps painting them.
- The keyframe duplication with ContextMenu is a concrete, low-risk consolidation
  opportunity to take during this migration rather than perpetuate.
- The panel-level engine/personality rules ARE already masked by Dropdown's own
  inline styles -- don't treat those the same way as the item-row rules; only the
  item-row layer needs explicit re-authoring.
- `getPopupContainer`'s dead-prop status should be recorded, not silently
  "implemented" as a side effect of this migration.
- The rustic zIndex type-cast trap recurs from Popconfirm -- worth a single shared
  fix across both sites rather than two independent patches.

---

# HoverCard (10 sites counted: modern 4, rustic 6)

`primitives/overlay/HoverCard`, no compound subcomponents, no shared utils. The
smallest floating-panel component in this scope.

## PORTAL VERDICT -- same in-tree/portal split
**Modern does not portal** -- in-tree, `position:absolute` content inside a
`position:relative inline-block` wrapper (86-107). **Rustic portals directly** to
`document.body`, position from `getBoundingClientRect()` recomputed in a `useEffect`
gated on `[isOpen, side]` (same no-scroll-listener gap as every other rustic
portaler in this scope).

## Stale doc comment, corrected
Modern's file header claims "Uses DaisyUI card classes" -- **false**: the content
panel's `className` is `overlayClassName || undefined` only, no default `card` (or
any other) classname is ever applied (99-101, grep-confirmed). This matters
concretely: it means there is **no risk of this component colliding with the real
`Card` primitive's own classnames/skin** today, despite what the comment implies --
worth correcting the comment during migration rather than propagating the false
"this rides DaisyUI's card styling" assumption into a skin's design.

## MODERN -- 4 sites
| Part | Lines | Channels | Class |
|---|---|---|---|
| Content panel | 99-101 | background, borderRadius, border, boxShadow | STATIC |

Positioning/z-index are entirely Tailwind utilities (`absolute z-50`,
`SIDE_CLASSES` lookup for `top-full`/`bottom-full`/etc. + translate utilities) --
**no `--ds-z-*` token used at all**, unlike Popover's modern engine, which does use
`var(--ds-z-popover)` for the conceptually similar "floating panel above content"
z-index need. **Zero `--ds-hovercard-*` or any other component-scoped token** -- the
sixth occurrence in this scope of "modern has no first-class token surface" (after
Tour, Popconfirm, ContextMenu, Popover, and Dropdown's panel-level styling).

## RUSTIC -- 6 sites
| Part | Lines | Channels | Class |
|---|---|---|---|
| Card panel | 127-148 | backgroundColor, borderRadius, boxShadow, border, backdropFilter (**again** `--ds-modal-overlay-backdrop`) | STATIC |

**Reuses Popover's token namespace wholesale** (`--ds-popover-bg`, `-radius`,
`-shadow`, `-border-color`) rather than having its own `--ds-hovercard-*` family --
the same "borrows a sibling component's tokens" shape as ContextMenu borrowing
Dropdown's, and consistent with HoverCard's own conceptual closeness to Popover
(both are floating content panels, one hover-triggered, one click/hover/focus-
triggered). `zIndex: 1060` is a hardcoded magic number, matching neither
`--ds-z-popover` (1600) nor any HoverCard-specific token -- **neither engine ties
HoverCard into the tokenized z-stack** other components in this scope (Sheet,
ConfirmDialog, Popover) already use.

## Interaction paint
No hover/focus paint on the card content itself in either engine -- the entire
component's "hover" behavior IS the open/close mechanism (debounced enter/leave
timers on both trigger and card, so the cursor can cross from one to the other
without the card closing), not a per-element visual hover state. Both engines
re-bind `onMouseEnter`/`onMouseLeave` on the card itself for exactly the reason
Popover's rustic engine did (crossing from trigger to portaled/absolutely-positioned
content must not read as "left the trigger"). This applies to **modern too here**
(96-97), unlike Popover where only rustic needed the rebinding -- because HoverCard's
card, even under modern, is a separate `absolute`-positioned sibling `div`
(94-105) the mouse must cross into, not a single continuous hover target.

## Keyframes / animation
None in either engine (grep-confirmed, zero `<style>`/`@keyframes`/`transition`).

## Existing class/data contract
Zero `data-*`, zero static base classname, zero ARIA role in either engine -- the
barest component in this scope alongside Sheet and Tour-modern.

## Suppression risk
Grepped `hovercard`/`hover-card` across `personality.css` and every engine
`theme.css`: zero hits. No dormant or live personality/theme rule to account for.

## Won't transcribe cleanly (HoverCard)
- Correct the stale "DaisyUI card classes" doc comment during migration rather than
  building a skin around an assumption the code doesn't actually implement.
- Neither engine's z-index participates in the shared `--ds-z-*` scale -- a design
  decision for the contract step (tie HoverCard to `--ds-z-popover` like Popover
  does, or leave it as its own hardcoded value).
- Deciding whether to keep riding Popover's token namespace or fork a
  `--ds-hovercard-*` family carries the same blast-radius consideration already
  flagged for ContextMenu/Dropdown token borrowing.

---

# Watermark (3 sites counted: rustic 2, modern 1)

`primitives/overlay/Watermark`, no compound subcomponents, no shared utils, no
portal in either engine (not a floating panel -- it renders a non-interactive
pattern layer in-place, `pointer-events:none`, as an `absolute inset:0` child of its
own `relative` wrapper).

## STRUCTURALLY DIFFERENT FROM EVERY OTHER COMPONENT IN THIS SCOPE -- most of its
## "paint" is Canvas API calls, not CSS properties, and cannot become a skin rule
The watermark's actual visible content -- the repeating text or image tile -- is
rendered by drawing to an off-screen `<canvas>` (`ctx.font`, `ctx.fillStyle =
mergedFont.color!`, `ctx.fillText`/`ctx.drawImage`, `ctx.rotate`) and exporting the
result via `canvas.toDataURL()` into a React-state-held `backgroundImage` data URL
(both engines, byte-identical generation logic). **None of that is a CSS custom
property, a `style` object literal, or anything a `data-part`/skin CSS file can
address** -- `ctx.fillStyle` is a JavaScript Canvas 2D API call, not a paint channel
this migration program's mechanism (unlayered CSS rules keyed on `data-part`) can
reach at all. The only channels a skin genuinely *can* own are the CSS properties on
the overlay `<div>` itself: `backgroundRepeat` (both engines, always `'repeat'`,
STATIC) and, rustic-only, `backgroundPosition` (driven by the `offset` prop, a
per-instance runtime value). `backgroundImage` itself must stay inline/JS-bound in
either case -- there is no static value to lift out.

## A THIRD COUNTER BLIND SPOT, distinct from the two named in the brief: object-
## shorthand property syntax evades a colon-anchored regex
Both engines write `{ backgroundImage, backgroundRepeat: 'repeat', zIndex }`
(`modern.tsx:143`, `rustic.tsx:159-162`) -- **`backgroundImage` and `zIndex` use
JS object-shorthand syntax (bare identifier, no colon)** because the variable name
matches the property name. `engine-token-audit.mjs`'s counter almost certainly keys
on a `propertyName:` textual pattern (colon required) to find paint sites -- shorthand
properties have no colon, so `backgroundImage` is **structurally invisible to the
counter** even though it is a real, always-present `background*` channel. This
explains the audit's low counts exactly: modern shows **1** site (only
`backgroundRepeat:` has a colon), rustic shows **2** (`backgroundRepeat:` and
`backgroundPosition:`, both colon-form; `backgroundImage` again invisible). Confirmed
via a scope-wide grep for shorthand paint-property object literals across all twelve
components in this checkpoint -- **Watermark is the only file in this scope using
this pattern**, so it does not change any other component's counts in this document,
but it is a real, distinct blind-spot class (the brief named "string contents" and
`.style.x as any =`; this is a third: **bare-identifier shorthand properties**) worth
recording in the counter's known-gaps list for future batches.

## Existing class/data contract
Zero `data-*`, zero static classname beyond consumer passthrough, in either engine.
`pointer-events:none` on the overlay div (both) and `crossOrigin='anonymous'` on
image loads are behavioral, not paint.

## Suppression risk
Zero hits for `watermark` in `personality.css`. The out-of-scope `classic` engine's
`theme.css:1519-1520` sets `z-index: var(--ds-watermark-z-index)` on `.ant-watermark`
-- z-index only, not a paint channel, and not personality-layered.

## Won't transcribe cleanly (Watermark)
- The canvas-drawn pattern cannot be migrated into a CSS skin at all -- this
  component's migration, when it comes, is fundamentally different in kind from every
  other component in this document: almost nothing here is "paint that moves from
  inline style to an unlayered stylesheet," because almost nothing here is CSS.
- Flag the shorthand-property blind spot to whoever owns `engine-token-audit.mjs` --
  it's a narrow, mechanical fix (also match bare-identifier shorthand for the same
  property-name list) but currently produces a silently-undercounted total for any
  future file that happens to use this JS syntax.

---

# AdaptiveOverlay (1 site counted)

`primitives/overlay/AdaptiveOverlay/index.tsx`, no `engines/` directory -- a single
responsive **compositor**, not an independent rendered surface. It owns zero DOM of
its own; it dispatches entirely to one of three other components based on
`useResponsive().deviceClass` (or a forced `mode` prop): **desktop -> `Modal`**
(this checkpoint's `primitives/overlay/Modal`, covered above), **tablet ->
`Drawer`** (`primitives/feedback/Drawer`, a **different component family, already
migrated in WO-SKIN-03** -- not this checkpoint's Sheet, not this checkpoint's Modal),
**phone -> `Sheet`** (this checkpoint's `primitives/overlay/Sheet`, covered above).

## PORTAL VERDICT -- the most complex posture in this document: it varies by device
## class AND by engine, inherited entirely from three different children
AdaptiveOverlay has no portal logic of its own; its effective portal posture is
whatever the resolved child does:
- **Modal branch** (desktop): both engines portal, via the shared `Portal` utility
  into `#rottay-portal-root` (see the Modal section above).
- **Drawer branch** (tablet): **neither engine portals** -- `primitives/feedback/
  Drawer` renders in-tree with `position:fixed` (WO-SKIN-03 finding, out of this
  checkpoint's scope but directly inherited here).
- **Sheet branch** (phone): modern does not portal (in-tree); rustic portals directly
  to `document.body` (see the Sheet section above).
No other component in either this checkpoint or the WO-SKIN-03 precedent has a portal
posture that depends on **viewport/device class** in addition to engine -- a
capture/skin-verification harness for AdaptiveOverlay must exercise all three device
classes, not just both engines, to see every real DOM shape this component produces.

## THE ONE SITE THIS COMPONENT OWNS, AND WHY IT EXISTS
The Sheet branch (183-210) manually renders a footer `<div>` **after** `{children}`
with `padding` and `borderTop: '1px solid var(--ds-color-border, #e5e7eb)'`
(202-203) -- **STATIC**, the only paint AdaptiveOverlay's own source contributes.
This exists because **Sheet (this checkpoint) has no `footer` prop at all** (confirmed
in the Sheet section above -- `SheetProps` has no footer slot), unlike Modal and
Drawer, which both accept `footer={footer}` directly and render it through their own
already-styled footer regions. AdaptiveOverlay is compensating for a real API gap in
Sheet by hand-rolling a footer div with its own ad-hoc border.

## A real, concrete token inconsistency this compositor introduces
Three different border tokens now describe conceptually the same "section divider"
concept across one user-facing flow (open an AdaptiveOverlay on a phone, see a
header divider then a footer divider): Sheet's own header divider uses
`--ds-color-border-subtle` (modern) / `--ds-modal-header-border` (rustic) --
established in the Sheet section above -- while AdaptiveOverlay's bolted-on footer
divider uses a **third** token, `--ds-color-border` (plain, no `-subtle` suffix, and
not modal-scoped either). Because this line lives in AdaptiveOverlay's own file, it
applies identically regardless of which engine Sheet resolves to underneath --
meaning the header/footer divider mismatch is engine-**independent**, a pure
authoring inconsistency rather than a cross-engine one.

## A prop-forwarding gap on the phone path
Modal and Drawer branches both forward `id`, `data-testid` (via a computed
`testId`), and `aria-label` to their target component. **The Sheet branch forwards
none of the three** (183-197 -- only `panelClassName`/`panelStyle` cross over) --
a real, if minor, testability/accessibility regression specific to the phone/mobile
path that a byte-exact migration should record rather than silently "fix" as a side
effect of touching this file.

## Suppression risk
No `adaptive-overlay`/`adaptiveoverlay` hits anywhere in `personality.css` or any
engine `theme.css`. This component owns no classnames of its own to collide.

## Won't transcribe cleanly (AdaptiveOverlay)
- This file's "migration" is really "make sure the one owned paint site (the footer
  divider) gets a `data-part` and lands in a small AdaptiveOverlay-owned skin (or
  folds into Sheet's, if Sheet ever grows a real footer slot) -- everything else is
  inherited from Modal/Drawer/Sheet's own already-decided or soon-to-be-decided
  contracts, not new surface for this checkpoint to design.
- The three-way divider token mismatch and the Sheet-path prop-forwarding gap are
  both real, pre-existing defects worth a proposal entry, not something to silently
  correct while stamping a `data-part` on the footer div.
- Verifying this component visually requires three device-class states, not two
  engine states -- the widest verification matrix of any component in this document.

---

# Portal posture map (component x engine)

| Component | Modern | Rustic | Mechanism |
|---|---|---|---|
| Modal | Portals | Portals | Shared `Portal` util -> `#rottay-portal-root` on `document.body`, both engines identical |
| Tour | Portals | Portals | Direct `createPortal(..., document.body)`, both engines, own `react-dom` import (not the shared util) |
| ConfirmDialog | No | No | In-tree, `position:fixed` sibling |
| Popconfirm | No | Portals | Direct `createPortal`, `document.body` |
| Sheet | No | Portals | Direct `createPortal`, `document.body` |
| ContextMenu | No | Portals | Direct `createPortal`, `document.body` |
| Popover | No | Portals | Direct `createPortal`, `document.body` |
| AlertDialog | No | No | In-tree, `position:fixed` sibling |
| Dropdown | No | Portals | Direct `createPortal`, `document.body` |
| HoverCard | No | Portals | Direct `createPortal`, `document.body` |
| Watermark | No | No | Not a floating overlay -- in-place absolute background layer |
| AdaptiveOverlay | inherited | inherited | Dispatches to Modal (portals both engines) / feedback-family Drawer (portals neither) / Sheet (portals rustic only) by device class -- posture depends on device class AND engine, the only multi-dimensional case in this document |

**The dominant shape in this scope**: modern never portals except Tour and Modal;
rustic almost always portals, and almost always via a **direct** `createPortal(...,
document.body)` call rather than the shared `Portal` utility Modal uses (Modal is the
only component reusing that shared utility at all -- everyone else that portals in
rustic reimplements the same three lines independently). None of the direct-portal
callers stamp a `data-rottay-portal` marker the way the shared `Portal` util does, so
a skin/tenant rule cannot rely on that attribute to find them.

---

# Paint-site classification rollup (approximate, ~327 property-level sites total)

- **STATIC** (author-time constant, moves directly to a skin): the large majority,
  roughly 290 of ~327 sites. Every component in this scope is STATIC-dominant.
- **STATE-SELECTED** (ternary/map over static values, driven by props/state):
  concentrated in six components -- Tour (variant/index-driven: border type, step
  indicator, next-button), ConfirmDialog and Popconfirm (`variant`/`okType`-driven
  icon and button color tables), Sheet (`side`-driven corner radius), ContextMenu and
  Dropdown (`item.danger`-driven text color). Roughly 18 distinct decision points
  (~25-30 individual property sites once both branches/engines are counted). Popover,
  AlertDialog, HoverCard, Modal, Watermark, and AdaptiveOverlay have **none** --
  every paint site in those six is either flatly STATIC or genuinely RUNTIME.
- **RUNTIME** (must stay inline or ride a `--ds-*` hatch): the smallest bucket, ~7-8
  sites, concentrated in exactly two components for two different reasons -- **Tour**
  (spotlight/mask `boxShadow`/`backgroundColor`, coupled to `getBoundingClientRect()`
  position data) and **Watermark** (`backgroundImage`, a canvas-rasterized data URL;
  rustic's `backgroundPosition`, driven by an `offset` prop). Every other component in
  this scope is either fully STATIC or STATE-SELECTED -- no other component computes a
  paint value from live DOM measurement or a bitmap.
- **IMPERATIVE hover/interaction** (a separate axis from the three above -- current
  mechanism, not final value): real (non-dead) imperative `.style.x =` hover exists on
  Modal (both engines' close buttons + the CloseButton compound), Sheet (modern close
  button), ContextMenu (rustic item rows, two properties), Dropdown (rustic item rows,
  one property). **Declared-but-dead `transition`** (present in source, no hover
  mechanism to trigger it) recurs on Modal's footer/CloseButton, ConfirmDialog's
  buttons, Sheet's close button, and AlertDialog's cancel button -- a five-times-
  recurring pattern across this scope, matching the WO-SKIN-03 precedent's own
  dead-transition finding for Modal/feedback.

---

# Suppression channels -- where personality.css currently WINS (live today)

Only **two** components in this entire scope have any live personality.css
contribution, and both share a common cause: **they are the only two components that
render real, shared DaisyUI structural classnames** (`modal`/`modal-box`/
`modal-backdrop` for AlertDialog; `dropdown`/`dropdown-content`/`menu` for Dropdown)
rather than fully bespoke bevel-to-bevel markup. Every other component in this scope
(Modal, Tour, ConfirmDialog, Popconfirm, Sheet, ContextMenu, Popover, HoverCard,
Watermark) was grep-verified to have **zero** personality.css or theme.css hits on
any of its classnames -- clean, in the sense that nothing external currently paints
them, but that also means those nine components have **nothing to preserve** on this
axis (a migration there is a pure move, not a move-plus-reconciliation).

1. **AlertDialog, modern only**: `personality.css:177-188` supplies
   `backdrop-filter: blur(4px)` on `.modal-backdrop` and
   `box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25)` on `.modal-box` -- **both
   properties are entirely absent from AlertDialog's own inline styles**, so both are
   100% externally sourced today. This is the single most consequential finding in
   the document: dropping the DaisyUI classnames during migration silently deletes a
   real, currently-shipping blur and shadow.
2. **Dropdown, modern only**: `personality.css:605-611` overrides the `transition`
   property (not a color) on `.menu li > a,button`, replacing `modern/theme.css`'s
   own `background-color 0.15s ease` with a personality-duration version that
   additionally transitions `color`. The **paint itself** (hover background-color,
   item color, border-radius) is sourced from `modern/theme.css` (a different file,
   a different layer, still not Dropdown's own source) -- see the Dropdown section's
   headline finding for the full three-layer breakdown.

**Dormant personality rules that could wake up during this migration** (not
currently winning anything, because no in-scope component currently carries the
matching classname, but a natural scope-class choice could activate them for the
first time):
- `[data-engine] .ds-popover { animation: ds-dropdown-enter ... }`
  (`personality.css:581-585`) -- Popover has zero entrance animation today in either
  engine; naming its future scope class `ds-popover` would silently add one.
- `[data-engine] .ds-dropdown { animation: ds-dropdown-enter ... }`
  (`personality.css:195-199`) -- same hazard, Dropdown's root, independent of the
  `rottay-popover-enter` animation already on its `<ul>`.

---

# Cross-family patterns (recur across 2+ components, not one-offs)

- **"Modern has no first-class token surface" is now a confirmed, repeated shape**,
  not a one-off: Tour, Popconfirm, ContextMenu, Popover, and HoverCard's modern
  engines all use zero component-scoped `--ds-{component}-*` tokens, falling back
  entirely to generic DS tokens or Tailwind utilities, while their rustic siblings
  (except ContextMenu and HoverCard, which borrow a *different* component's
  namespace instead of having none) reference a real, dedicated token family. Sheet
  is the one deliberate exception -- neither engine has its own family, by documented
  design, both intentionally share Modal/Drawer's.
- **`--ds-modal-overlay-backdrop` is reused as a generic "blur my floating panel"
  hatch by components that are not modals**: Popconfirm, Sheet's overlay, ContextMenu,
  and Popover all reference this exact Modal-scoped token name for their own
  backdrop-filter. Dropdown and HoverCard's rustic panels do the same
  (HoverCard) or don't blur at all (Dropdown, the one exception that breaks what
  otherwise looks like a universal rule). A real naming leak worth fixing at the
  token-authoring layer, separate from this migration.
- **Sibling-component token borrowing** (not the same as "no tokens at all"):
  ContextMenu's rustic engine fully adopts Dropdown's `--ds-dropdown-*` namespace;
  HoverCard's rustic engine fully adopts Popover's `--ds-popover-*` namespace. Neither
  has ever had its own family. Decide per-component during the contract step whether
  to keep riding the sibling's tokens or fork a dedicated family -- changing the
  borrowed tokens today would also affect the lending component, since nothing scopes
  them to "borrower only."
- **The rustic zIndex type-cast-smuggling trap** (`'var(--ds-x-z-index, N)' as unknown
  as number`) recurs independently in Popconfirm and Dropdown -- the same shape the
  WO-SKIN-03 report flagged once for Toast's `opacity`; now confirmed as a repeating
  idiom across this codebase, not a single incident.
- **Three different close-button glyph representations** across this scope alone: SVG
  path icons (Modal, Sheet, both via a near-identical shared-shape `CloseButton`
  function), the Unicode `✕` character (Tour, both engines), and a literal `x` text
  character (Sheet rustic's own inline close button, distinct from Sheet modern's SVG
  one). Combined with the WO-SKIN-03 report's three divergent close-button *colors*
  finding for feedback/Modal, close buttons are the single most visually-inconsistent
  recurring part across the whole DS overlay surface.
- **No portal target stamps a `data-rottay-portal` marker except the shared `Portal`
  utility** -- every direct `createPortal(..., document.body)` call in this scope
  (the large majority of rustic portalers) produces a plain, unmarked `document.body`
  child. A skin/tenant rule that assumes "anything portalled carries
  `data-rottay-portal`" (true for Modal and the inputs-family Select dropdown) will
  miss every other portalled element in this document.
- **Rustic's no-scroll/no-resize-listener gap on position-tracking floats** recurs on
  every rustic component that computes position once via `getBoundingClientRect()` in
  a `useEffect` gated on `[isOpen, ...]`: Popconfirm, ContextMenu (partially --
  computed from cursor position, not trigger rect, so less exposed), Popover,
  Dropdown, HoverCard. None re-listen for `scroll`/`resize` while open, so a page
  scroll or window resize during an open session leaves the floating panel stale.
  Pre-existing, not a migration concern to fix, but worth one shared proposal entry
  rather than five separate ones.

---
