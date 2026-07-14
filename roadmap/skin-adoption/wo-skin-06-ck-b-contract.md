# WO-SKIN-06 · CK-B — the header family — design contract

334 sites, 9 files, **six token sets** (not one, and not four). Inventory:
`wo-skin-06-ck-b-inventory.md` — read it fully; it is the best in the program. Code over inventory
on any disagreement, and this contract already overrides it in one place (§4).

## The shape of this cluster

Zero RUNTIME paint. Zero imperative `.style.x =` writes — every hover/focus in the cluster is
React state, already expressible as `:hover` / `:focus-visible` / `[data-active]`. Zero
`theme.css`/`personality.css` rules target any of these components' markup, so there is no P-76
bridge to dispose of. On paper the cleanest cluster since CK-D.

What makes it expensive is the opposite of what the triage claimed: **the header family is not one
vocabulary typed once, it is the same idea typed six times by hand.** `structures/headers` has zero
shared identifiers across its five files — no shared helper, no shared constants module. Every
similarity is a human having typed the same numbers twice. A grep for imports cannot find that,
which is why the inventory had to read all nine files end to end. Trust its per-file tables.

## Skin count and what may be unified

| skin | files | why it is its own token set |
| --- | --- | --- |
| `headers/edit` + `headers/form` | 2 | **The one sanctioned unification.** `getVariantTone`/`VARIANT_TOKEN_MAP` and the 41-line `buildPatternStyle` are **byte-for-byte identical** between them — every ternary branch, every percentage, every `color-mix()`. |
| `headers/detail` | 1 | Same 8-layer archetype SHAPE, **every numeric value diverges**, and Detail alone varies `heroBackground`/`fadeMask` per archetype. It also has a `tabActiveBackground` the others have no equivalent for. |
| `headers/collection` | 1 | The dotted-title text-clip recipe and `editorialTech` exist nowhere else. |
| `headers/dashboard` | 1 | Its own tiny `STATUS_COLORS` map, unrelated to anything. |
| `cockpit-header` | 1 | `STATUS_PILL_STYLES`; the outlier BackButton (has a border, `neutral-50`). |
| `page-shell` + `workbench-header` | 2 | Share breadcrumb-hover and tab-strip VALUES; diverge elsewhere. See §5. |

**Before collapsing edit+form, prove it.** `diff` the two function bodies and paste the empty diff in
the report. The inventory says byte-identical; it has been right and the triage has been wrong, but
this is the one place a migration is allowed to make two components share a rule, and a claim of
identity is exactly the kind of thing that should be shown rather than asserted. If the diff is not
empty, they get two token sets and you say so.

**Detail's archetype numbers may not be flattened onto Edit/Form's, or vice versa.** It is the single
biggest temptation in this cluster and it is a visual change. Refused inside a byte-exact pass.

## 1. The law from CK-D that binds here (P-79)

`BaseComponentProps` declares `'data-part'?: string` on **every** component, so `tsc` accepts a stamp
anywhere. The engines do not honour it. Measured, both engines:

| primitive | modern | rustic |
| --- | --- | --- |
| Box, Stack, Flex, Text | forwards | forwards |
| **Grid, Card** | **DROPS** | **DROPS** |
| **Button** | **DROPS** | **forwards** |

A stamp on a composed `Grid`/`Card` is a **lie in the source**: it reads as anatomy and emits
nothing. Nothing in the chain notices — tsc passes, the counter does not read attributes, and a skin
rule anchored on it would simply never match.

- Stamp `data-part` only on raw DOM or on Box/Stack/Flex/Text.
- Use a **className** for anatomy carried by any other primitive. className forwards everywhere.
- **Never add a wrapper element to obtain a stampable node.** That changes the tree, which changes
  layout, which moves pixels.
- **The contract test must assert that EVERY stamp reached the DOM.** It is the only thing in the
  chain that can catch this. In CK-D it was the only thing that did.

## 2. Anatomy: five files are greenfield, four already have anchors

- `patterns/misc` — `ds-pattern-cockpit-header`, `ds-pattern-page-shell` (+ `--loading`,
  `__loading-skeleton`), `ds-pattern-workbench-header`, each paired with `ds-engine-modern`. All
  grep-confirmed FREE. Key the skins off these; do not mint new ones.
- `structures/headers` (all 5) — **no first-party className anywhere.** Mint scope classes.
  Grep-verify each is a free token across CSS **and** CSS-in-JS before using it — a modern scope
  class `ds-<comp>` has collided with a legacy `.ds-<x>` rule before and shrank a component by 8px
  through an inherited font-size.
- `collection/index.tsx:384` already carries `data-ds-collection-title-accent="true"` — decorative,
  `aria-hidden`, consumed by nothing. It is a precedent shape, not a hook. Leave it or replace it
  with a real part; do not build on it as if a stylesheet reads it.

## 3. Preserve every engine asymmetry. Do not "fix" one.

- **`page-shell/rustic` has ZERO interactive paint** — no hover on its back button, breadcrumb links,
  or inactive tabs, while `page-shell/modern` has hover/focus on all three. Widest engine gap in the
  cluster. **Do not invent a rustic hover.**
- **Three independent BackButtons**, no two identical: cockpit (34×34, has a visible border on
  hover, `neutral-50`), page-shell (padding-sized, border always `none`, `neutral-100`, optional
  text label), workbench (32×32, border `none`, `neutral-100`). **Three token sets.** Converging them
  is a product decision with its own baselines, not this migration's business.
- **The tab strip**: `page-shell`'s `TabButton` and `workbench-header`'s `SavedViewTab` share every
  colour and border value, so one rule set is correct for colour. But `SavedViewTab` tracks
  `onFocus`/`onBlur` and `TabButton` does not. A shared `:hover` rule is fine; **do not silently give
  page-shell's tabs a keyboard-focus affordance, and do not take workbench's away.** The
  accessibility surface is part of the behaviour being preserved.
- `classic.tsx` exists and PAINTS for all three `patterns/misc` components, and is outside the WO-06
  census **by construction** — it reads as 0 sites because it was never asked, not because it is
  clean. Do not certify "classic has no paint."

## 4. The `<style>` tag in `headers/edit` is DEAD. Do not transcribe it. (This contract overrides the inventory.)

`edit/index.tsx:474-485` emits, per instance, an un-namespaced global stylesheet:

```css
.back-button { transition: all 0.2s ease; }
.back-button:hover { border-color: var(--ds-color-border); background: color-mix(in srgb, var(--ds-color-bg-secondary) 90%, transparent); }
.breadcrumb-link:hover { color: var(--ds-color-text-secondary) !important; }
```

The inventory calls this "the one real transcribe-CSS-in-a-template-literal-to-the-skin mechanism in
this checkpoint" and calls the `!important` "inert". **Both readings are wrong, and the correction
matters more than the finding.** Measured against the code:

- The back-button chip (`edit:279-284`) carries **inline** `background: 'transparent'` and
  `border: '1px solid var(--ds-color-border-secondary)'`. An inline declaration beats any author
  stylesheet rule that is not `!important`. So **both declarations in `.back-button:hover` lose, and
  that button has never had a hover state.** The rule is dead.
- The breadcrumb link (`edit:307`) carries **inline** `color: 'var(--ds-color-text-secondary)'`. The
  `!important` DOES beat it — but it sets **the identical value**. The rule is live and is a no-op.

**So the entire block paints nothing today.** And it is a landmine: the moment the migration lifts
the chip's inline `background`/`border` into the skin, `.back-button:hover` **starts winning**, and
the back button gains a hover effect it has never had. Every value byte-identical; the cascade is
not. That is precisely P-78's shape, and no rest baseline photographs a hover.

**Therefore:**

1. The **pre-step** pins the EditHeader back-button hover and the breadcrumb-link hover in
   `headers-batch.spec.ts`, in both engines, using the `waitForSettled` idiom. **Recorded before any
   paint moves, this baseline is the photographic proof of deadness** — it should be identical to the
   rest shot. The baseline becomes the thing that makes the landmine impossible to step on: if the
   migration revives the hover, the gate goes red.
2. The **migration** deletes the `<style>` tag and does NOT transcribe its rules. Deleting a dead
   rule changes nothing — and the pinned baseline is what proves that claim rather than asserting it.
3. It also removes `className="back-button"` / `className="breadcrumb-link"`, which are **global,
   unscoped** names emitted into the document by every EditHeader instance.
4. File the product question as a proposal: **EditHeader's back button and breadcrumb were written to
   have hover affordances, and neither has ever had one.** They probably should. That is a deliberate
   VISUAL change with re-recorded baselines, in its own work order — not a side effect of a
   byte-exact migration.

## 5. Standing decisions (the ones every batch re-learns)

1. **The discriminator.** Ask WHERE the runtime identifier LANDS, not whether one is mentioned. A
   4-way ternary over `archetype` whose leaves are static tokens is **STATE-SELECTED** → it becomes a
   `[data-archetype='…']` rule. `isCompact` derived from `window.scrollY > 60` is STATE-SELECTED too:
   the scroll position never reaches a paint value, it only picks between two fixed ones. This cluster
   has **zero** genuine RUNTIME paint.
2. **Anchor every rule to the component's own scope class.** Never a bare `[data-part='x']`. Prefer a
   direct-child (`>`) chain. Never require a part on a component a parent may re-stamp.
3. **Before moving a paint key out of a style object, grep the object for a spread that also sets
   it.** A later key silently overwrites an earlier spread (P-78). `workbench-header`'s
   `QuickActionButton` spreads a hover sub-object over a base object (`variantStyles`, lines 48-116)
   — this is exactly that shape. Read it before you touch it.
4. A numeric literal glued to a colour is an **ALPHA BYTE**, not a percentage.
5. Border shorthands over maybe-undefined tokens are ATOMIC — do not split them into longhands.
6. **The counter is not the coverage checklist — the INVENTORY is.** It is blind to string contents
   (which is exactly why the `<style>` tag in §4 carries real CSS the counter reports as zero), to
   `.style.x as any =`, and to SVG presentation attributes. Reconcile your hand count against it and
   REPORT THE DELTA.
7. **A known counter bug lives in this cluster**: `edit/index.tsx:104` declares
   `status: { label: string; color: 'success' | … }` — a **type-position** object body. The counter's
   lexer flags its `color:` key as a paint site. It is a phantom, the fifth of its kind, and the fix
   belongs in the counter, not in an exemption. Expect `headers/edit` to drop 48 → 47 when it lands.
   Do not chase that site; you cannot migrate a type.

## 6. Pre-step coverage

- Torture section `?headers=1`, its own `data-testid` root, per-component Stack testids.
- Deterministic fixtures rendering **every state a rule will key on**: all four `archetype` values
  (× Detail AND × Edit/Form, since their values diverge), every `colorVariant`, every
  `status.variant`, `embedded` × `editorialTech` × `compactLayout`, active/inactive tabs, the
  loading-skeleton branches, and `isCompact`.
- `headers-batch.spec.ts`: 4 rest shots ({rottay,bithire} × {modern,rustic} × w1280), plus
  **interaction pins wherever hover or focus paint exists** — the three BackButtons, both breadcrumb
  hover-links, both tab strips (including workbench's keyboard **focus**, which page-shell does not
  have), and the two dead rules from §4. **Never `waitForTimeout` after a hover** — use
  `waitForSettled`. A baseline recorded mid-transition is inherited forever.
- Contract test: every part and every state attribute reaches the DOM — **including proof that each
  stamp survived the primitive it sits on** (§1).
- GREP the family's unit tests for assertions on inline paint (`toHaveStyle`, `.style.`,
  `getAttribute('style')`) and REPORT them file:line without editing. The orchestrator adjudicates
  while the migration runs.
