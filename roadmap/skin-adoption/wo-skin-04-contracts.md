# WO-SKIN-04 — overlay + navigation — design contracts

Two pipelined checkpoints. ALL standing laws apply (see `README.md` in this folder, and the
data-part contract doc). Inventories: `wo-skin-04-navigation-inventory.md`,
`wo-skin-04-overlay-inventory.md` — code over inventory on any disagreement.

---

## Checkpoint N — navigation (280 sites, 15 components, 34 files)

The family is greenfield: not one `data-part` exists today. Runtime paint is effectively
nil — the only true continuous-data value is Tabs' sliding-indicator `transform` (measured
from `getBoundingClientRect`), which stays inline. Everything else that looks dynamic is a
finite enum or boolean and becomes a `:hover` / `[data-status]` / `[aria-selected]` rule.

### N1. Steps and Stepper: FREEZE the DaisyUI outcome (P-73)

Adjudicated in a real browser with CDP `CSS.getMatchedStylesForNode`, not by reading:

- `.steps .step::before` (the connector): `theme.css`'s bridge rule outranks DaisyUI (0,3,1
  vs 0,2,1) but its value is `var(--ds-steps-line-color)` and **that token is defined
  nowhere** — the declaration is invalid-at-computed-value and is dropped. DaisyUI's
  `var(--step-bg)` paints.
- `.steps .step::after` (the circle): the two rules **tie at (0,3,1)** — DaisyUI's
  `:not(:has(.step-icon))` contributes a class's worth of specificity — so source order
  decides and DaisyUI, emitted later, wins. Measured: `--ds-steps-item-bg` resolves to
  `#2a2a2f` on rottay and the circle still paints white.

**Therefore: DaisyUI paints both channels today, and the migration must keep it that way.**
The skin MUST NOT declare `background-color` on those pseudo-elements at any specificity, and
MUST NOT define `--ds-steps-line-color`. Either would change the shipped color under the guise
of a cleanup. The component's inline `--step-color` / `--step-neutral` / `accent-color` move
into the skin verbatim, keyed on the status attribute the pre-step stamps. Fixing the bridge
is P-73's job: a VISUAL change, with its own baselines, in its own work order.

### N2. FloatButton: paint that has no inline footprint

FloatButton modern's hover/active SCALE transform is delivered entirely by a layered
`.btn:hover` / `.btn:active` rule in `theme.css`. There is nothing inline to diff, so a
migration cannot see it and will silently drop it if it removes or renames the DaisyUI `btn`
classes. **Keep the `btn` class list exactly as `getFloatButtonClassName()` builds it.** The
skin adds its own paint alongside; it does not replace the class. The pre-step's spec must pin
a hovered FloatButton in both engines so the interaction is photographed BEFORE the migration.

### N3. Breadcrumb: the separator's live color runs opposite to file order

`theme.css` carries two independent `.breadcrumbs` blocks with different token vocabularies.
The separator's live color comes from the block that appears FIRST (it has the higher
specificity), not the one that appears last. Reading top-to-bottom gives the wrong token.
Measure the computed value in the browser before writing any rule that touches that channel.

### N4. Standing decisions

- Skin homes: engine files → `tokens/css/engines/{modern,rustic}/skin/<component>.css`; the
  compounds (Menu's 4, Stepper's 2, Breadcrumb's Item) → `tokens/css/components/skin/
  <component>-compounds.css`.
- The DaisyUI structural classes stay (`daisy.classConsumers` is a decrease-only ratchet, not
  a target of this batch). Where a DaisyUI class is a personality/theme hook, the same law as
  the feedback batch applies: a border must stay a SHORTHAND, never split into longhands.
- Almost every first-party compound BEM class in this family is a dead CSS hook (zero
  references in `tokens/css/`). They may be kept as scope classes — but every scope class must
  be grep-verified free across CSS **and** CSS-in-JS (`.ts`/`.tsx`), per the `ds-select` and
  `rottay-progress` collisions.
- Anchor's engines carry the retired `Hermes`/`Apollo`/`Titan` names in runtime `displayName`
  strings — a live violation of the canonical-engine-names law. Record it; do not fix it
  inside a byte-exact migration (it is a rename, and renames belong in their own commit).
- `Stepper.Content`'s 200ms duration is hardcoded in four places (two CSS strings, two
  `setTimeout` literals). Preserve all four; do not unify them here.

### N5. Pre-step coverage

- Torture section `?nav=1`, `data-testid="probe-nav"`, per-component Stack testids.
- Deterministic fixtures: every status/state a rule will key on must be rendered (Steps: wait/
  process/finish/error; Stepper: same; Menu: selected/disabled/submenu-open; Tabs: active +
  the sliding indicator at rest; Pagination: current/disabled; Segmented: selected; Breadcrumb:
  with separators; FloatButton: default + primary).
- Spec `navigation-batch.spec.ts`: 4 rest shots ({rottay,bithire} × {modern,rustic} × w1280) +
  interaction pins where the paint reacts — **FloatButton hovered (both engines, mandatory:
  N2)**, Menu item hovered, Tabs hovered, Pagination hovered, Segmented hovered.
- Contract test `NavigationBatch.contract.test.tsx`: it.each components × engines; every part
  and state attribute reaches the DOM.

---

## Checkpoint P — overlay (327 sites, 12 components)

Paint is overwhelmingly STATIC (~290). Only two components compute paint from live data and
both keep it inline: Tour's spotlight/mask (position-coupled, from `getBoundingClientRect`)
and Watermark's `backgroundImage` (a canvas-rasterized data URL).

### P1. overlay/Modal's compound classnames are RENAMED — they collide with a shipped skin

`primitives/overlay/Modal/compound/{Header,Body,Footer}` render the SAME classnames
(`rottay-modal-header` / `-body` / `-footer`) as `primitives/feedback/Modal`'s compounds, which
WO-SKIN-03 already migrated and shipped. Today this is harmless only because overlay/Modal
stamps no `data-part`. The pre-step's natural action — stamping `data-part="header"` — makes
overlay/Modal's compounds start matching feedback/Modal's SHIPPED skin
(`components/skin/modal-compounds.css`), silently inheriting another component's paint.
Verified, and worse than the inventory reported: line 25 of that skin is a DESCENDANT selector
(`.rottay-modal-header [data-part='title']`), so a stamped `title` anywhere inside overlay
Modal's header matches too.

**Decision: rename overlay/Modal's compound classnames** to `rottay-overlay-modal-{header,
body,footer}` (all three grep-verified free; zero hits in `src/` or the showroom). This is
safe: those classnames are referenced by NO stylesheet except feedback's skin, so renaming
them changes no pixel today. Do not rename feedback/Modal's — it is published.
The scope class for overlay/Modal's own skin must also avoid the bare `rottay-modal`, which
feedback/Modal rustic carries on its surface (`engines/rustic.tsx:375`). Use
`rottay-overlay-modal-shell--{modern,rustic}` (grep-verified free).

**This is the shared-vocabulary law biting a second time**: `data-part` is a vocabulary, not
an identifier. Anchor every rule to a scope class that is unique to the component.

### P2. Paint that is invisible from the component's own file

Two components' shipping paint is entirely externally sourced. A migration that reads only the
`.tsx` will conclude "nothing to port" and REGRESS a live interaction, with no inline diff to
catch it:

- **AlertDialog modern**: `personality.css` supplies `backdrop-filter: blur(4px)` on
  `.modal-backdrop` and `box-shadow: 0 25px 50px …` on `.modal-box`. Neither property appears
  anywhere in AlertDialog's own inline styles. Dropping or renaming the DaisyUI classnames
  deletes a shipping blur + shadow. KEEP the DaisyUI class list.
- **Dropdown modern**: the item-row hover background comes from `modern/theme.css`
  (`.menu li>button:hover`), and `personality.css` overrides only its transition timing — a
  THIRD source. Note the trap: ContextMenu LOOKS like the same widget and is genuinely
  hover-less on modern (it uses zero DaisyUI classes). The two must not be treated alike.
  Capture Dropdown's hover against a PRODUCTION build that loads theme.css + personality.css —
  a component-only harness cannot see it.

### P3. Two DORMANT personality rules — do not wake them

`[data-engine] .ds-popover` and `[data-engine] .ds-dropdown` carry entrance-animation rules
that currently match nothing. Popover and Dropdown have NO entrance animation in either engine
today. Naming a new scope class `ds-popover` or `ds-dropdown` would give them one for the first
time — a visual change disguised as a naming choice. Both names are BANNED for this batch.

### P4. Portal posture (grep-verified by the inventory; re-verify per engine)

- Modal: portals BOTH engines (the shared Portal util → `#rottay-portal-root`).
- Tour: portals BOTH engines, via a direct `createPortal(…, document.body)`.
- Popconfirm, Sheet, ContextMenu, Popover, Dropdown, HoverCard: **modern does NOT portal;
  rustic DOES** (direct `createPortal`). The per-engine split is the norm here, not the
  exception — a skin selector that assumes descendant-of-root is wrong for half of them.
- ConfirmDialog, AlertDialog, Watermark: portal in NEITHER engine.
- AdaptiveOverlay owns no DOM: it dispatches to Modal / feedback-Drawer / Sheet by device
  class, so its posture depends on device class AND engine. It gets no skin of its own.

Portaled trees get standalone free-token scope classes (grep-verified across CSS **and**
CSS-in-JS). Precedent: the Select dropdown skin from WO-SKIN-02.

### P5. A third counter blind spot

Watermark uses JS object shorthand (`{ backgroundImage, zIndex }` — no colon), which evades the
counter's colon-anchored regex. Scope-wide grep says it is the only file in this checkpoint
doing it. The inventory, not the counter, is the coverage checklist.

### P6. Pre-step coverage

- Torture section `?overlay=1`, `data-testid="probe-overlay"`, per-component Stack testids.
- Modal/Tour/ConfirmDialog/AlertDialog/Sheet/Popconfirm/ContextMenu/Popover/Dropdown/HoverCard
  open via the spec (click trigger, wait for the surface, element-shoot). Watermark renders
  statically.
- Spec `overlay-batch.spec.ts`: 4 rest shots + open shots for every floating component in BOTH
  engines (the portal split means the two engines mount in different places — shoot both) +
  **Dropdown modern item hovered (mandatory: P2)** and **AlertDialog modern open (mandatory:
  P2 — the blur and shadow must be photographed before the migration can drop them)**.
- Contract test `OverlayBatch.contract.test.tsx`: parts + state attributes reach the DOM, plus
  PORTAL-POSTURE pins per engine (the P4 map, asserted, so a future refactor cannot move a
  tree out from under its skin unnoticed).
