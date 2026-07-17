# WO-SKIN-06 CK-C (workspace-chrome family) — migration contract

## ORCHESTRATOR ADJUDICATION (settled — migration agents treat these as final)

This contract was drafted by a peer agent and adjudicated by the orchestrator. The four
load-bearing NEW findings were DRILLED against source and all four hold:
- **Trap 5** — `searchInputStyle()` is called by BOTH `list-toolbar/engines/modern/index.tsx:1039,1140`
  (in scope) AND `classic.tsx:531,768` (out of scope). Confirmed shared. `tokens.ts` stays out of
  scope; its counter floor stays at 5 permanently. RULING: ACCEPTED.
- **Scope-class convention** — `ds-structure ds-<comp>` is the LIVE SHIPPED convention (verified in
  `foundation/tokens/css/presentation/components/skin/field-filters-panel.css:30,34` and the `className=` sites on
  `field-filters-panel/index.tsx:79`, `headers/collection/index.tsx:167`). The shipped CSS already
  uses `[data-part='root'][data-part='root']` (data-part ×2) for the border floor — the exact P-48
  mechanic §4 asserts. RULING: ACCEPTED, not invented.
- **Trap 4** — three `createPortal(..., document.body)` confirmed at column-menu:496,
  saved-views-menu:373, export-button:282. Standalone `ds-<comp>-panel` scope classes required.
  RULING: ACCEPTED.
- **Trap 1** — column-menu's row IS a 3-way gradient (isDragTarget 14%/16%, plain-active 7%/12%,
  rest 94%white/88%+bg-primary) at :610/:612/:613. RULING: ACCEPTED — transcribe all three.

Judgment calls (DRAFTER NOTE 8) — RULINGS:
1. **Keyframes**: `ds-views-spin` + `ds-export-toast-fade` are namespaced + fleet-unique → LEAVE
   as-is (the CK-F stated rule: only NON-namespaced keyframes get renamed). `workspaceCommandPulse`/
   `workspaceCommandSpin` are NOT namespaced → RENAME to `ds-search-command-bar-{pulse,spin}`. This
   is the consistent application of the rule; ACCEPTED as drafted.
2. **view-mode-switcher `data-selected` not `aria-checked`**: ACCEPTED — key CSS off a dedicated
   `data-*`, leave the ARIA attribute untouched. Program convention; do not couple CSS to a11y state.
3. **4 units / 12 skin files**: ACCEPTED. The plan doc's "~9 skins" was a pre-inventory rough
   estimate; the file-exact inventory (11 components, saved-views engine-split → 12 skin files)
   supersedes it. The mismatch is expected, not a ceiling breach.
4. **`tokens.ts` out of scope**: ACCEPTED (see Trap 5 drill above).

One clarification the migration must honor: the two portal-panel standalone classes and the toast
under `export-button` all sit OUTSIDE their trigger's DOM tree — every panel/toast rule is anchored
to its own standalone class, never nested under the trigger's (Trap 4). This is the single most
common way this checkpoint's skins will silently no-op if written wrong.

---

## PRE-STEP FINDINGS ADDENDUM (drilled + committed `8e363eb6`; these SUPERSEDE the contract body where noted)

The anatomy pre-step proved both invariants (counter 466/delta-0, DOM unchanged via AST-diff drilled
on 6 shapes incl. portal + IIFE-in-JSX; WorkspaceChrome contract test 36/36 with portal containment
asserted; existing suites 118/118) and surfaced findings the migration MUST honor:

1. **HEADLINE — `<Input>` replaces the 4 caller search-input parts and lands caller style/class on
   different nodes by engine.** Both engines own `data-part='root'`, so `data-part='search-input'`
   (table-toolbar, list-toolbar mobile+desktop) and `data-part='input'` (search-command-bar) NEVER land.
   A rule anchored to those parts silently never matches (it manifested as a 15s test HANG, not a
   fail). Caller `className` and `style` do survive: modern puts both on an outer wrapper while rustic
   puts both on its painted shell. **ORCHESTRATOR DECISION (anchor strategy, as corrected by the
   migration section below):**
   - **list-toolbar search inputs**: their paint is `searchInputStyle()` in `tokens.ts`, which is Trap 5
     (OUT OF SCOPE, stays inline). There is NOTHING to migrate there; the inert `data-part='search-input'`
     stamps stay harmless. Do not touch.
   - **table-toolbar + search-command-bar search inputs**: pass a private BEM class to Input and target
     the node where that class and caller style co-land: the wrapper in modern, the shell in rustic.
     The rustic selector must exceed the Input skin's maximum state specificity. Never use one generic
     `.rottay-input` descendant for both engines; that moves modern paint to a different element.
   - **FORBIDDEN**: do NOT wrap the Input in an extra Box (a DOM change → not byte-exact), and do NOT
     "fix" the Input primitive (large blast-radius, out of scope). See P-88 for the broader DS issue.
2. **saved-views `unsaved-dot` is modern-ONLY** — rustic never implements `isDirty` (grep-confirmed zero
   refs). Not in the contract's §0/Trap-2 asymmetry list. The rustic skin gets NO unsaved-dot rule; the
   contract test pins rustic's `unsaved-dot` count at 0.
3. **The `menu-divider` (modern) vs `divider` (rustic) name in saved-views's context menu is a REAL
   per-engine asymmetry, not a typo** (§2.2 already has it; confirmed). Do not "harmonize" it.
4. **Pre-existing HTML defect, record only**: `saved-views-menu`'s `ViewItem` nests `<Box as="button">`
   inside `<Box as="button">` (a button-in-button, invalid HTML, React logs a hydration warning). NOT
   caused by the stamps; out of scope to fix — flag for the team.
5. **Migration-test gotcha**: `list-toolbar`'s desktop layout (SegmentedControl in a `<Tooltip>`) does not
   render within the 15s test timeout unless `mockMatchMedia(1280)` is called first (the Tooltip lazy
   engine chunk needs an explicit viewport mock). The existing `ListToolbar.integration.test.tsx` only
   ever tested the 390px mobile path. Whoever writes Unit C1's migration test needs this.

### MIGRATION CORRECTIONS (2026-07-14; supersede addendum item 1 where stated)

The migration's adversarial cascade review found that addendum item 1 was only half right. The
custom `data-part` is indeed replaced by Input's own `data-part="root"`, but caller `className` does
**not** disappear from the DOM. It lands on the exact node that receives caller `style`:

- modern simple Input: the outer wrapper `<div className={className} style={style}>`;
- rustic Input: the painted `.rottay-input.rottay-input--rustic` shell.

Painting `.rottay-input` in both engines would therefore transpose modern's paint from the wrapper
onto the native input. The byte-exact ruling is: table-toolbar and search-command-bar pass a private
BEM class to Input, then use two selector shapes — modern targets the BEM wrapper guarded by
`:has(> .rottay-input--modern[data-part='root'])`; rustic targets the BEM class compounded with the
rustic shell. Rustic's selector exceeds the maximum competing Input-state specificity, because the
old caller inline style beat every Input state. The contract test pins both landing shapes.

Additional migration rulings:

- C1 retains exactly three counted sites: two `searchInputStyle()` call-site `borderRadius` keys and
  one primary Button `borderRadius`. Input/Button do not land those caller paint keys on a stable,
  common painted node across engines; broad descendant selectors would violate ownership. These are
  deliberate P-88 residuals, not an incomplete migration. `list-toolbar/tokens.ts` remains 5.
- Rustic saved-views adds `data-loading=true|false` because its loading and normal roots share the
  same scope/part but intentionally have different paint.
- Slot-bearing C4 components use private BEM ownership classes on every painted internal node.
  Generic descendant `[data-part]` selectors are forbidden here: TableToolbar exposes three
  arbitrary ReactNode slots; SearchCommandBar exposes two; ViewModeSwitcher accepts arbitrary icon
  nodes. A consumer's homonymous part must never receive parent chrome.
- SearchCommandBar state rules retain the same ownership chain as their base rules. Omitting the
  `voice-controls`/`search-shell` ancestor lowers state specificity and causes the base rule to win.

---

## DRAFTER NOTES FOR THE ORCHESTRATOR

This draft was produced by re-reading the inventory in full, the CK-F contract (template),
`migration-kit.md`, `migration-kit-addendum.md` (the only prior doc with a real portal-scoping
precedent — CK-F had none), `wo-skin-06-plan.md`, and by independently re-running the counter and
grepping every file this contract assigns work in, rather than trusting the inventory's prose alone.
Flagging everything adversarially per instructions.

**1. Confirmed correct (spot-checked, no note needed elsewhere):** the counter output for all 13
counted files matches the inventory exactly (89/5/56/35/69/61/54/26/22/20/12/9/8, sum 466); the
imperative-write line counts for all 5 in-scope files match exactly (see item 3); zero
`@keyframes` in the 9 files the inventory claims have none; zero `data-part`/first-party classnames
anywhere in all 12 files (every `className=` hit is a consumer passthrough prop, never a scope
class); all 3 portal files (`column-menu`, `saved-views-menu`, `export-button`) have exactly one
`createPortal` call each; column-menu's "row: 7%/12%" gradient in inventory §1's table (which my
first, truncated grep couldn't locate and I briefly suspected was wrong) is real, at
`column-menu/index.tsx:612,927` — inventory is correct, my early suspicion was my own tooling
error, not a defect. I did **not** re-verify every color-mix percentage cited in inventory §1's
headline table cell-by-cell (that table summarizes; the files carry more distinct values than the
table's single representative cell per row — see item 5). Treat the inventory's per-component
paint-site tables, which I did read in full, as the transcription source; treat §1's summary table
as directional, not exhaustive.

**2. A real trap the inventory never mentions — `list-toolbar/tokens.ts`'s `searchInputStyle()`
crosses the classic/modern boundary.** I grepped every call site of the exported helper:
`list-toolbar/engines/modern/index.tsx:1039,1140` (in scope) **and** `list-toolbar/engines/classic/index.tsx:531,768`
(out of scope, AntD wrapper, must not be touched). The function is shared. Its 5 counted sites in
`tokens.ts` (the STATIC `background/borderColor/color/boxShadow/borderRadius` object, lines ~63-67)
cannot be deleted or hollowed out — classic still calls it at runtime and needs a real inline style
object back, not a CSS class it doesn't carry. I resolved this in §1/Unit C1 below by declaring
`tokens.ts` itself **out of this checkpoint's migration scope** (its counter floor stays at 5,
permanently, by design — same shape as classic.tsx's permanent non-zero) and having only modern's
2 call sites stop consuming the function's paint keys. **This is my own finding, not the
inventory's — please scrutinize it specifically; if I've misjudged the blast radius of touching
`tokens.ts`, the whole Unit C1 design changes.**

**3. Exact imperative-write counts I extracted (grep `\.style\.` per file), for your spot-check:**
- `patterns/data/saved-views/engines/rustic/index.tsx` — 10, all `(e.currentTarget as HTMLButtonElement).style.background =`, lines 339, 343, 369, 373, 405, 410, 446, 450, 521, 525. Matches inventory.
- `patterns/data/saved-views/engines/modern/index.tsx` — 4, `e.currentTarget.style.borderColor =` / `.style.boxShadow =` (no cast), lines 54, 55, 60, 61. Matches inventory's channel description. **Does not cleanly matter to the inventory's own site-count arithmetic — see item 4.**
- `patterns/data/list-toolbar/engines/modern/index.tsx` — 2, `event.currentTarget.style.boxShadow =` (no cast), lines 407, 410. Matches inventory; reconciles cleanly (87+2=89=counter).
- `structures/workspace/export-button/index.tsx` — 4, `(e.currentTarget as HTMLElement).style.background =` (cast), lines 331, 335, 338, 342. Matches inventory; counter does **not** credit these (22+4=26 real, per inventory's own flag).
- `patterns/data/status-filter-pills/index.tsx` — 6, `event.currentTarget.style.background/borderColor/boxShadow =` (no cast), lines 108, 109, 114, 115, 119, 122. Matches inventory; reconciles cleanly (14+6=20=counter).
- `patterns/data/saved-views/engines/classic/index.tsx` — 2, not verified by me (out of scope, inventory doesn't detail it either). 10+4+2+4+6+2 = 28, matching the inventory's checkpoint-wide total exactly.

**4. A counter-unreliability instance the inventory's §0 doesn't name.** §0 names exactly one
inconsistent pair (rustic's 10 cast writes credited, export-button's 4 cast writes not credited).
I found a **third, non-cast case**: `saved-views/engines/modern/index.tsx` is reported as "35 sites —
reconciled 32 object-literal keys + a residual gap of ~3 not fully attributed" — that arithmetic
(32+~3=35) never mentions where the file's 4 imperative writes (item 3 above) land in it. Either
they're inside the unattributed "~3" (meaning ~1 of 4 got silently absorbed and the file is really
missing full credit), or they're outside it entirely (meaning the real total is closer to 39, same
"counter doesn't credit them" shape as export-button). I could not resolve this by reading — it
needs either a careful by-hand line-by-line key count of `modern.tsx`, or is a legitimate
STOP-AND-VERIFY for whichever agent owns Unit C2. I've written §3 Trap 3 to cover it, but flag it
here because it means **the counter-reliability problem in this checkpoint is broader than "type
casts" — plain, uncast imperative writes have at least one unreconciled case too.**

**5. Values needing a live-browser or careful-reread STOP-AND-VERIFY, beyond what §3 already
requires:** `column-menu`'s "Column row" part is not a 2-way ternary as the per-component table's
class annotation implies ("STATE-SELECTED (isDragTarget/isVisible, two-level)") — I found **three**
distinct gradient recipes feeding it (`index.tsx:610` 14%/16% against surface-card,
`:612` 7%/12%, `:613` a neutral 94%white-6%/88%+12% rest state), and the same 3-way shape repeats
at the "Action row" (`:927,928` mirrors `:612,613` almost exactly but I did not diff them
byte-for-byte). Unit C3's agent must transcribe all three branches, not two — flagged in §3 Trap 1.
Separately: `saved-views/engines/rustic/index.tsx:317` references
`boxShadow: 'var(--ds-saved-views-menu-shadow, var(--ds-shadow-lg))'` — a custom property that is
**never set anywhere in the codebase** (grep-confirmed), so it always resolves to the fallback
today. Two readings: a copy-paste naming mistake (this file is `saved-views`, not
`saved-views-menu`) or a dead forward-looking hook. Either way, byte-exact transcription means
carrying the **full fallback expression verbatim** into the rustic skin, not simplifying it to
`var(--ds-shadow-lg)` — simplifying would remove a (currently inert but real) external override
seam. Flagged as a footnote in §3 Trap 1; not blocking.

**6. Anatomy/specificity conventions this contract asserts as law were NOT stated by the inventory
or by CK-F — I derived them from live, already-shipped skin precedent**, because CK-C is unlike
CK-F/CK-B/CK-D in one important way: **CK-C is 100% greenfield on scope classes too**, not just
`data-part` (every `className=` hit in all 12 files is a consumer passthrough, never a first-party
scope class — CK-F had 5 partial pre-existing `ds-pattern-<comp> ds-engine-<engine>` classes to
build on; CK-C has zero). I grepped already-shipped `structures/` skins
(`foundation/tokens/css/presentation/components/skin/field-filters-panel.css`, and the shipped `className=` sites in
`structures/headers/{collection,detail}/index.tsx`, `structures/workspace/{field-filters-panel,
selection-preview-rail}/index.tsx`) and confirmed the **live, shipped** convention for the
`structures/` tier is a **two-class root**, `ds-structure ds-<comp>` (e.g. `.ds-structure
.ds-field-filters-panel[data-part='root']` in the shipped CSS) — the SAME (0,2,0) shape as
`patterns/`'s `ds-pattern-<comp> ds-engine-<engine>`, not the single-class
`ds-data-terminal-card` shape the kit explicitly calls out as a mistake to avoid repeating. I
applied `ds-structure ds-<comp>` to all 8 `structures/workspace/` components below. **If the
orchestrator has a newer or different ruling on the structures-tier convention than what's
currently shipped, this whole anatomy section needs a find-replace, not a rethink** — the mechanism
(two classes, (0,2,0)) is confirmed live; only the exact prefix could be wrong.

**7. Scope-class name freedom — grep-verified, not guessed.** I grepped the full `components/` +
`foundation/tokens/css/` tree for every class name this contract proposes to mint
(`ds-column-menu`, `ds-column-menu-panel`, `ds-saved-views-menu`, `ds-saved-views-menu-panel`,
`ds-export-button`, `ds-export-button-panel`, `ds-search-command-bar`, `ds-active-filters-bar`,
`ds-scope-switcher`, `ds-view-mode-switcher`, `ds-table-toolbar`, `ds-pattern-list-toolbar`,
`ds-pattern-saved-views`, `ds-pattern-status-filter-pills`). All are free. Two near-hits were false
alarms: `ds-saved-views-menu` appears once as a substring of the dead custom-property name in item
5 above (not a class); `ds-scope-switcher` appears once as a substring of the existing inert
`data-ds-scope-switcher-row="true"` marker attribute (also not a class, and not proposed to be
removed — see §2).

**8. Judgment calls I made that the orchestrator should explicitly bless or override:**
- `saved-views/modern.tsx`'s `ds-views-spin` keyframe is already `ds-`-prefixed and fleet-unique but
  doesn't literally spell "saved-views" (it's `ds-views-spin`, not `ds-saved-views-spin`). I
  followed CK-F's lenient precedent (already-namespaced+unique keyframes are left as-is) rather
  than force a rename. This is a closer call than CK-F's `ds-activity-shimmer` example (which did
  fully spell the component name) — could go either way.
- `view-mode-switcher`'s `aria-checked` vs a dedicated `data-selected` for the active-button state:
  I ruled for a dedicated `data-*` state attribute (consistent with every other component in this
  checkpoint and the program's established convention) rather than keying CSS off `aria-checked`,
  even though the inventory flags the ARIA option as legitimate. See §2.
- I split the 11 components into 4 units (not 3, matching CK-F's count) because CK-C is ~470 sites
  vs. CK-F's 272 and has categorically more distinct risk types (portals, which CK-F had zero of).
  Unit boundaries are mine, not the inventory's or the plan's (the plan's "~9 skins" estimate for
  CK-C, written before or alongside the detailed inventory, doesn't match the 12-file count this
  contract derives — I believe the inventory, which is later and file-exact, supersedes the plan's
  rough estimate, but flagging the mismatch in case the "~9" was actually a deliberate ceiling).

---

Reads on top of `wo-skin-06-ck-c-inventory.md` (the site-by-site truth) and `migration-kit.md` +
`migration-kit-addendum.md` (the mechanics — the addendum is the only prior doc in this program
with a real portal-scoping precedent). The inventory is normative for *what* paint exists; this
contract is normative for *how* it moves. Where they disagree, the inventory's site tables win on
facts and this contract wins on method.

Scope: `packages/core/src/ui/structures/workspace/` (8 components, 8 files) +
`packages/core/src/ui/patterns/data/{list-toolbar,saved-views,status-filter-pills}/`
(3 components, 5 files including `list-toolbar/tokens.ts`) — **466 counted sites, ~470 real once
the counter-blind imperative writes are added, 11 components, 18 files.** `list-toolbar/engines/
classic.tsx` and `saved-views/engines/classic/index.tsx` (both AntD-wrapped, 0 counted sites) are **out
of scope and must not be touched.** `list-toolbar/engines/rustic/index.tsx` is a 9-line re-export of
`classic` — there is no distinct rustic implementation to migrate for that component.

---

## 0. The one law that governs this checkpoint: eleven skins, not one — and the shared vocabulary is opt-in, not ambient

`patterns/data/list-toolbar/tokens.ts` exports a full `FILTER_PILL_*`/`TOOLBAR_*`/`SEARCH_*`
vocabulary. **Exactly two of this checkpoint's 11 components import it**: `list-toolbar` itself
(the file that defines it) and `status-filter-pills` (a clean, complete adopter — all 17 names,
zero divergence). **The other nine hand-roll their own `color-mix()` recipes from scratch, and do
not agree with each other either.** A migration that assumes "apply `FILTER_PILL_*` everywhere
this checkpoint has a pill or an active state" will silently move pixels on 9 of 11 components.

**Every divergence catalogued in inventory §1 is a value this migration must PRESERVE per-component
(and, for `saved-views`, per-engine).** Do not flatten a near-miss onto the canonical token because
"it's obviously the same 8%." Concretely, the following stay as distinct, non-unified recipes:

- `saved-views-menu`'s active-view-card: `color-mix(...primary 8%, var(--ds-surface-card))` — same
  8% as canonical `FILTER_PILL_ACTIVE_BG`, different composite base (`--ds-surface-card`, not
  `transparent`). A near-miss, not a match.
- `saved-views-menu`'s own `StatusPill` (same file, a few hundred lines later): 12% — internally
  inconsistent with its own active-view-card's 8%. Both stay exactly as written; do not converge
  them to each other either.
- `active-filters-bar`'s chip: a two-stop `linear-gradient(180deg, ...primary 8%..., ...primary
  5%...)` — canonical has no gradient variant; this is a shape divergence, not just a number.
- `column-menu`'s row: a **three-way** gradient split (drag-target-active 14%/16% against
  surface-card, plain-active 7%/12%, rest a neutral 94%white-6%/88%white-6%+12%bg-primary recipe —
  see DRAFTER NOTE 5 for exact line numbers; the per-component table's "two-level" annotation
  undersells this to two branches, transcribe all three).
- `scope-switcher`'s active pill: `linear-gradient(180deg, ...primary 14%..., ...primary 9%...)`
  against `surface-card`.
- `view-mode-switcher`'s active button: flat `color-mix(...primary 14%, var(--ds-surface-card))` —
  **the same 14%/`surface-card` figure as scope-switcher's gradient dark stop.** This is this
  checkpoint's one clear sign of copy-paste lineage between two independent files (both literally
  named "switcher," same folder). Preserve both as their own rules; do not point them at a shared
  token unless the migration explicitly wants to name `SWITCHER_ACTIVE_BG` (optional, not required
  — a naming convenience, not a value change, so it's allowed but not mandated by this contract).
- `export-button`'s dropdown-item hover: flat `var(--ds-color-bg-hover, color-mix(...primary 5%,
  transparent))` — closest in SHAPE to canonical (flat, `transparent` base) of any non-adopter, but
  a different custom-property name and a different percentage (5% vs. canonical's own hover
  figure). Not a match.
- `saved-views/modern.tsx`'s active pill: a **solid** `background: var(--ds-color-primary)` fill
  with `color: var(--ds-color-primary-foreground)` — architecturally different from every
  translucent-tint recipe above, not reconcilable by adjusting a percentage.
- `saved-views/rustic.tsx`'s active tab: a `border-bottom: 2px solid var(--ds-color-primary)`
  underline, with only the label `color` swapping — not a pill shape at all. See Trap 2.

`table-toolbar` and `search-command-bar` have no pill/active-state vocabulary to diverge on at all
(the former has none; the latter's voice-badge `color-mix()` recipes are their own closed set, tied
to `voiceStatus`, not to the pill concept). Neither needs an adjudication decision.

**Recommend the migration record this divergence map as a team flag (product question: converge or
preserve) before any skin CSS is written** — same shape as CK-F's classifier-divergence flag and
CK-C's own §1 recommendation. This contract's default, absent a product ruling, is **preserve
everything byte-exact**, per RULE ZERO.

---

## 1. Migration units — four parallel agents, split by risk concentration

11 components / ~470 sites split so each unit owns a coherent risk profile rather than an even site
count. `tokens.ts` (list-toolbar's vocabulary source) is **not assigned to any unit** — see §0
DRAFTER NOTE 2 and the Unit C1 note below; its 5 sites are out of this checkpoint's scope.

- **Unit C1 — the vocabulary core: `list-toolbar` + `status-filter-pills`** (94 + 20 = 114 sites,
  3 files: `list-toolbar/engines/modern/index.tsx`, `list-toolbar/tokens.ts` [**read-only reference, not
  migrated** — see below], `status-filter-pills/index.tsx`). Skins: `engines/modern/skin/
  list-toolbar.css`, `components/skin/status-filter-pills.css` (2 files). This is the lowest
  divergence-risk unit — both components already agree with the canonical vocabulary — but it owns
  the checkpoint's one cross-engine-boundary trap (Trap 5: `searchInputStyle()` is shared with
  out-of-scope `classic.tsx`) and 8 of the 26 in-scope imperative writes (2 + 6). Because both
  components fully honor `tokens.ts`'s values, this unit's skins are the closest thing to a
  reference for how the vocabulary should render in CSS — worth a look by the other three units,
  though there is no file dependency between them (they touch disjoint files) and no ordering
  requirement.
  - **`tokens.ts` itself is NOT touched.** Its `searchInputStyle()` helper is called by both
    in-scope `modern.tsx` (2 call sites) and out-of-scope `classic.tsx` (2 call sites) — see §3
    Trap 5. `tokens.ts`'s counter floor stays at 5 by design; do not chase it to 0.
- **Unit C2 — `saved-views` (both engines)** (91 sites, 2 files: `engines/{modern,rustic}.tsx`).
  Skins: `engines/modern/skin/saved-views.css`, `engines/rustic/skin/saved-views.css` (2 files).
  This is the checkpoint's sharpest single-component finding — modern renders a filled pill,
  rustic renders a tab-underline, and neither touches the shared vocabulary (§0, Trap 2). Owns 14
  of the 26 imperative writes (10 rustic + 4 modern — the densest single file in the whole
  program), the `ds-views-spin` keyframe, and the unresolved counter-arithmetic question on modern
  (Trap 3 / DRAFTER NOTE 4). Give this unit an agent that will read both engine files fully before
  writing either skin — the two metaphors must be judged together, not discovered mid-migration.
- **Unit C3 — the portal trio: `column-menu` + `saved-views-menu` + `export-button`** (69 + 61 + 26
  = 156 sites, 3 files, all `structures/workspace/`, all engine-agnostic single files). Skins:
  `components/skin/column-menu.css`, `components/skin/saved-views-menu.css`, `components/skin/
  export-button.css` (3 files). **The highest-complexity unit** — owns all three of this
  checkpoint's portal-scoping instances (Trap 4; grouped together deliberately so one agent applies
  the standalone-class mechanic consistently instead of three agents inventing three conventions),
  `export-button`'s 4 imperative writes + `ds-export-toast-fade` keyframe, `saved-views-menu`'s
  internal `StatusPill`-vs-active-card 12%-vs-8% self-inconsistency, and `column-menu`'s 3-way
  drag-state gradient (§0, DRAFTER NOTE 5). Give it the most careful agent.
- **Unit C4 — the standalone bars: `active-filters-bar` + `scope-switcher` + `view-mode-switcher` +
  `table-toolbar` + `search-command-bar`** (26 + 12 + 9 + 8 + 54 = 109 sites, 5 files). Skins:
  `components/skin/{active-filters-bar,scope-switcher,view-mode-switcher,table-toolbar,
  search-command-bar}.css` (5 files). The mechanically cleanest unit — **zero imperative writes,
  zero portals** — but owns the scope-switcher/view-mode-switcher shared-formula finding (§0,
  optional `SWITCHER_ACTIVE_BG` naming), `search-command-bar`'s two keyframes (the only ones in
  this checkpoint that are **not** already `ds`-prefixed — real renames required, not the
  "already-namespaced, just move it" case), and the `aria-checked`-vs-`data-*` adjudication for
  `view-mode-switcher` (§2).

Agents run in parallel; each stages ONLY its own files by explicit path (never `git add -A` —
shared tree). **Entrypoint wiring is reserved for the orchestrator** — agents create skin files but
do NOT edit `foundation/base.css` or `entrypoints/styles.css`.

---

## 2. Anatomy pre-step (inert, runs BEFORE any migration; orchestrator-owned)

**CK-C is greenfield on BOTH axes** — zero `data-part` anywhere (confirmed) AND zero first-party
scope classes anywhere (confirmed; every `className=` hit in all 12 files is a consumer-passthrough
prop, never a self-authored class). Unlike CK-F, there is no partial head start to build on: the
pre-step mints the scope class from nothing, per component.

### 2.1 Scope-class convention (see DRAFTER NOTE 6 for how this was derived)

| Component | Tier | Scope class | Shape |
|---|---|---|---|
| `list-toolbar` (modern only) | patterns/data, engine-split | `ds-pattern-list-toolbar ds-engine-modern` | (0,2,0) |
| `saved-views` (modern) | patterns/data, engine-split | `ds-pattern-saved-views ds-engine-modern` | (0,2,0) |
| `saved-views` (rustic) | patterns/data, engine-split | `ds-pattern-saved-views ds-engine-rustic` | (0,2,0) |
| `status-filter-pills` | patterns/data, engine-agnostic, single root | `ds-pattern-status-filter-pills` | (0,1,0) — single class, mirrors CK-F's `assistant`/`presence` precedent |
| `column-menu` | structures/workspace, engine-agnostic | `ds-structure ds-column-menu` (trigger); `ds-structure ds-column-menu-panel` (portaled panel, standalone) | (0,2,0) each |
| `saved-views-menu` | structures/workspace, engine-agnostic | `ds-structure ds-saved-views-menu` (trigger); `ds-structure ds-saved-views-menu-panel` (portaled panel, standalone) | (0,2,0) each |
| `export-button` | structures/workspace, engine-agnostic | `ds-structure ds-export-button` (trigger + toast); `ds-structure ds-export-button-panel` (portaled dropdown, standalone) | (0,2,0) each |
| `active-filters-bar` | structures/workspace, engine-agnostic | `ds-structure ds-active-filters-bar` | (0,2,0) |
| `scope-switcher` | structures/workspace, engine-agnostic | `ds-structure ds-scope-switcher` | (0,2,0) |
| `view-mode-switcher` | structures/workspace, engine-agnostic | `ds-structure ds-view-mode-switcher` | (0,2,0) |
| `table-toolbar` | structures/workspace, engine-agnostic | `ds-structure ds-table-toolbar` | (0,2,0) |
| `search-command-bar` | structures/workspace, engine-agnostic | `ds-structure ds-search-command-bar` | (0,2,0) |

All 14 names above are grep-verified free across `components/` and `foundation/tokens/css/` (DRAFTER NOTE 7).
`ds-structure ds-<comp>` is the **live, shipped** convention for the `structures/` tier (confirmed
in `foundation/tokens/css/presentation/components/skin/field-filters-panel.css` and the `className=` sites on
`structures/headers/{collection,detail}/index.tsx`) — not invented for this checkpoint. `list-toolbar`'s
rustic is **not stamped** (no distinct file exists); if a real rustic implementation is ever added,
it must carry `ds-pattern-list-toolbar ds-engine-rustic` to match its siblings.

### 2.2 `data-part` stamps

Stamp every painted element, named by role. Representative vocabulary by unit (not exhaustive —
read each component's paint-site table in the inventory for the full part list; name unlisted parts
by the same convention):

- **C1**: `icon-button`, `segmented-control`, `segment`, `segment-indicator`, `divider`,
  `filter-trigger`, `filter-badge`, `filter-dropdown-item`, `filter-checkmark`, `density-option`,
  `density-checkmark`, `mobile-overflow-item`, `root`, `title`, `search-icon`, `filter-chips-strip`,
  `clear-all`, `count-badge` (list-toolbar); `pill`, `pill-icon`, `pill-label`, `count-badge`,
  `count-badge-text` (status-filter-pills).
- **C2**: `input`, `menu-item`, `spinner`, `pill`, `unsaved-dot`, `default-star`, `menu-trigger`,
  `menu-panel`, `menu-divider`, `create-input`, `create-button` (modern); `root`, `tab`,
  `drag-handle`, `rename-input`, `tab-label`, `default-star`, `menu-trigger`, `menu-panel`,
  `menu-item`, `divider`, `create-input`, `create-button` (rustic).
- **C3**: `trigger`, `trigger-icon`, `backdrop`, `panel`, `header`, `reset`, `row`, `drag-handle`,
  `title`, `pin-badge`, `description`, `width-badge`, `width-input`, `group-toggle`, `action-row`,
  `footer`, `apply` (column-menu — `backdrop` carries no paint rule, `inset:0` only, per inventory);
  `trigger`, `trigger-icon`, `backdrop`, `panel`, `header`, `count-pill`, `active-card`,
  `status-pill`, `action-button`, `section-header`, `view-item`, `checkmark`, `delete`, `glyph`,
  `empty-state` (saved-views-menu); `toast`, `panel`, `menu-item`, `menu-icon`, `menu-label`
  (export-button).
- **C4**: `root`, `pill`, `chip`, `chip-label`, `chip-remove`, `clear-all`, `add-filter`
  (active-filters-bar); `root`, `pill`, `pill-label`, `count-badge` (scope-switcher); `root`,
  `button` (view-mode-switcher); `divider`, `root`, `search-icon`, `search-input` (table-toolbar);
  `suggestion-chip`, `root`, `search-shell`, `search-icon`, `input`, `clear`, `voice-badge`,
  `voice-toggle`, `voice-help`, `close`, `status`, `suggestions`, `actions-slot`, `divider`
  (search-command-bar).

Never a bare `[data-part]` — always anchor to the scope class (the law that drew blood seven
times). For the two portaled components' panel parts, the panel's OWN `data-part='panel'` sits
under its OWN standalone class (§4), not under the trigger's class — it cannot, it is not a DOM
descendant of it.

### 2.3 State attributes

- `list-toolbar`: `data-active` (Segment, FilterButton, DensityOptionRow), `data-selected`
  (FilterDropdownItem — inventory calls it `selected`), `data-hovered` only where hover cannot
  become a real `:hover` (none found here — every "hovered" ternary in this file is driven by a
  raw DOM hover interaction, so migrate to `:hover` directly, no attribute needed).
- `saved-views` modern: `data-active`, `data-hovered`→`:hover`, `data-dragging`, `data-drop-target`
  on the pill (four-way — the richest single ternary in the checkpoint, transcribe all
  combinations); `data-dirty` on the unsaved-dot; `data-default` existence-gate; `data-open` on the
  menu trigger/panel; rustic: `data-active`, `data-drop-target` on the tab row (two independent
  border edges — do not collapse to one attribute).
- `column-menu`: `data-open` (trigger), `data-drag-target`/`data-visible`/`data-dragging`
  (column row — three independent axes per DRAFTER NOTE 5, `data-dragging` currently drives only
  `opacity`, an uncounted channel — stamp it anyway for completeness even though no skin rule needs
  it yet), `data-pinned` existence-gate.
- `saved-views-menu`: `data-open` (trigger), `data-active` (ViewItem row, checkmark, glyph),
  `data-tone` (StatusPill: `primary`/`neutral`, "the cleanest single STATE-SELECTED site in this
  file" per inventory).
- `search-command-bar`: `data-embedded`, `data-voice-status` (mirrors the `voiceStatus` enum:
  `error`/`needs-permission`/`listening`/`transcribing`/idle — up to 5-way on some channels),
  `data-voice-active`, `data-editorial-tech`, `data-permission-blocked`.
- `active-filters-bar`: `data-embedded` (root only; every other part is unconditional STATIC).
- `scope-switcher`: `data-inline` (root), `data-active` (pill, count badge).
- `view-mode-switcher`: `data-selected` (see DRAFTER NOTE 8 — deliberately NOT `aria-checked`;
  `aria-checked` stays as the accessibility attribute it already correctly is, unmodified, but the
  skin keys off a separate `data-selected` for consistency with the rest of the program), plus
  `data-disabled`.
- `export-button`: `data-copied` existence-gate (toast); the existing `data-export-item` boolean
  attribute on menu items is **functional** (consumed by `querySelectorAll('[data-export-item]')`
  for keyboard nav, `index.tsx:186,211,310`) — do NOT remove or rename it; add `data-part='menu-item'`
  alongside it, do not replace it.
- `status-filter-pills`: `data-selected` (every part in this file keys off the same `isSelected`
  boolean — reuse one attribute name across all 5 parts, do not invent per-part variants).

### 2.4 The two invariants (inert until proven — kit + README law)

The pre-step must prove BOTH before any paint moves: (a) the counter is byte-identical to HEAD for
all 18 files in scope (`tokens.ts` included — it must show its pre-existing 5, untouched, even
though it will never move to 0 in this checkpoint), confirming stamping attributes moved no paint;
(b) the element tree is unchanged, proven by a TS-compiler AST diff with attributes stripped,
DRILLED (counter-identity alone proves no paint moved, not that the DOM is unchanged). Record visual
baselines for all 11 components (both engines for `saved-views`; `list-toolbar` modern only) after
stamping, and stability-pass them before any unit starts writing CSS.

---

## 3. The five traps — each is a STOP-AND-VERIFY, not a footnote

**Trap 1 — `column-menu`'s "Column row" and "Action row" are three-way, not two-way, and one file
carries a dead-but-real custom-property fallback that must not be simplified away.** The
per-component table's `STATE-SELECTED (isDragTarget/isVisible, two-level)` annotation undersells
the actual branch count: `index.tsx:610` (drag-target-active, 14%/16% against surface-card),
`:612` (plain-active, 7%/12%), `:613` (rest, a neutral white/bg-primary recipe) are three distinct
`linear-gradient` values feeding the same background channel; `:927-928` repeats a near-identical
shape for the Action row. Unit C3 must transcribe all three branches verbatim, verified against the
live file, not against the summary table. Separately (same unit, different file):
`saved-views/engines/rustic/index.tsx:317` sets `boxShadow: 'var(--ds-saved-views-menu-shadow,
var(--ds-shadow-lg))'` — a custom property that is **never set anywhere in this codebase** (its
name doesn't even match its own component; it says "saved-views-menu," not "saved-views"). Carry
the **full fallback expression verbatim** into the skin (`var(--ds-saved-views-menu-shadow,
var(--ds-shadow-lg))`), not the simplified `var(--ds-shadow-lg)` — removing the unfed variable is a
real (if currently inert) behavior change: it deletes an external override seam that technically
exists today. Do not "fix" the confusing name; flag it, don't touch it.

**Trap 2 — `saved-views` renders two genuinely different UI metaphors per engine, not two skins of
one design.** Modern's active-view indicator (`engines/modern.tsx:303-321`) is a **filled pill**
(`background: isActive ? var(--ds-color-primary) : ...`, high-contrast). Rustic's
(`engines/rustic.tsx:204-211`) is a **tab underline** (`borderBottom: isActive ? '2px solid
var(--ds-color-primary)' : '2px solid transparent'`, only the label color swaps). Each matches its
own file's header comment ("premium pill/chip strip" vs. "horizontal tab strip") — this is
deliberate, not a color drifted apart. Unify is out of scope for a byte-exact migration; Unit C2
preserves both shapes as two unrelated rule sets in two unrelated skin files. Note for the team
flag: `classic.tsx` (out of scope) mirrors rustic's tab metaphor, not modern's pill — 2 of 3 engines
agree on "tab," only modern diverges, worth recording since most of this program's asymmetries run
the opposite direction (modern as the premium outlier is usually the ADDED richness, not here).

**Trap 3 — 28 imperative `.style.x =` writes across 6 files (26 in scope + 2 in out-of-scope
`saved-views/classic.tsx`), and the counter's relationship to them is proven unreliable in at least
two distinct ways — hand-count, do not trust `: 0`.** Confirmed shapes (DRAFTER NOTE 3):
`saved-views/rustic.tsx`'s 10 cast writes (`(x as HTMLButtonElement).style.background =`) ARE
credited by the counter (46+10=56 matches exactly); `export-button`'s 4 cast writes
(`(x as HTMLElement).style.background =`) are NOT credited (22+4=26 real, counter shows 22) — same
cast shape, opposite outcome, per inventory §0. **A third, uncast case the inventory doesn't name:**
`saved-views/modern.tsx`'s 4 plain (uncast) writes on `borderColor`/`boxShadow`
(`engines/modern.tsx:54,55,60,61`) don't cleanly reconcile against the file's reported "32
object-literal keys + ~3 unattributed" = 35 total — it is not clear whether any of the 4 imperative
writes are inside that "~3," meaning Unit C2's real floor for this file could be 35, could be closer
to 39. **Unit C2 must hand-count this file specifically and report the delta explicitly**, the same
way CK-F's assistant unit reported its 1-site phantom instead of chasing the counter to a number
that doesn't mean what it looks like it means. For all 6 files, delete the handler's paint write,
keep any non-paint work it does, and transcribe to a real `:hover`/`:focus`/`:focus-visible` CSS
rule — every one of these exists because the element is a bare unstyled `<button>`/`<div>` with no
classname to hang a real pseudo-class rule on until this migration gives it one.

**Trap 4 — three portaled components, three standalone scope classes, zero shared trigger-to-panel
DOM ancestry.** `column-menu` (`index.tsx:496`), `saved-views-menu` (`:373`), and `export-button`
(`:282`) each `createPortal(..., document.body)` their dropdown/panel content — verified: each
file's `getBoundingClientRect`-driven measurement (`updatePanelPosition` in the first two) feeds
only `top`/`left`/`width` positioning, never a paint channel, so this is not a WO-06-style
measurement exemption; it is purely a DOM-ancestry problem. **The portaled node is not a descendant
of the trigger's scope class** (or of any tenant-scoped root the trigger inherits from), so panel
rules cannot be written as `.ds-structure.ds-column-menu [data-part='panel'] {...}` — that selector
will never match anything, because the panel renders as a sibling of `<body>`'s other children, not
inside the trigger's tree. Per the WO-SKIN-02 checkpoint-C precedent (DatePicker/TimePicker/
ColorPicker rustic panels, `migration-kit-addendum.md`): stamp the portaled root with its OWN
self-sufficient scope class (`ds-structure ds-<comp>-panel`, §2.1) + `data-part='panel'`, and write
every panel-content rule scoped to THAT class, standalone — never nested under the trigger's class.
The trigger (and, for `export-button`, the toast) stays root-scoped as usual under the normal
`ds-structure ds-<comp>` class. All three components get this treatment identically — Unit C3 must
apply the SAME mechanic to all three, not improvise per-file.

**Trap 5 — `list-toolbar/tokens.ts`'s `searchInputStyle()` is a shared helper consumed by both the
in-scope modern engine and the out-of-scope classic engine; it must not be edited.** Grep-confirmed
call sites: `list-toolbar/engines/modern/index.tsx:1039,1140` (in scope) and `list-toolbar/engines/
classic.tsx:531,768` (out of scope, AntD-wrapped, "must not be touched" per this checkpoint's own
scope line). The function's 5 sites (`tokens.ts:63-67`) return a fully STATIC style object
(`background`/`borderColor`/`color`/`boxShadow`/`borderRadius`) that classic still needs as real
inline paint at runtime — it will never get a scope-class-driven skin in this or any adjacent
checkpoint's current plan. **Do not delete, gut, or "migrate" `searchInputStyle()` itself.** Instead:
at modern's 2 call sites only, stop applying the function's return value as this element's paint
(the element gets its background/border/color/boxShadow/borderRadius from the new
`ds-pattern-list-toolbar ds-engine-modern [data-part='search-input']` skin rule instead); if `extra`
carries any genuine non-paint value at either call site, preserve it inline exactly as today.
`tokens.ts`'s counter reading stays at 5 permanently — this is by design, not a residual to chase
(§1, Unit C1 note).

---

## 4. Runtime, exemptions, specificity

**Zero RUNTIME sites in this checkpoint (inventory §2, confirmed) — no `SKIN-EXEMPT-RUNTIME-VALUE`
exemption entry needed for CK-C, and no C-category custom-property hatch required.** Every value in
every file resolves from an author-time-static token/`color-mix()`/literal selected by a bounded
enum or boolean. This is simpler than CK-F (which had presence's per-user colors) — do not add a
`skin-exemptions.json` entry for anything in this checkpoint.

**Specificity (P-48).**
- Engine-split roots (`list-toolbar` modern, `saved-views` both engines) get the standard two-class
  root `.ds-pattern-<comp>.ds-engine-<engine>` — (0,2,0). Border-COLOR rules need the target's
  `data-part` REPEATED ×2 to reach (0,4,0) and beat the tenant floor `html[data-tenant]…*` at
  (0,3,1). Non-border paint wins unlayered at (0,3,0) with a single `data-part`. **EXCEPTION:
  `color` on a composed `<Text>`/`Typography.Text` needs (0,5,0)** — the Typography engine skin paints
  every `<Text>` at (0,4,0) via `[data-color]`, so a (0,3,0) color rule loses once the inline color is
  stripped (text renders the data-color default) — data-part ×3 on these two-class roots; raw-element/
  icon color stays (0,3,0). See the migration-kit specificity law; check `<Text>` vs raw at each site.
- `structures/workspace` roots (all 8 components, plus the 3 standalone portal-panel classes) get
  the shipped two-class `.ds-structure.ds-<comp>` — (0,2,0), same math as above: data-part ×2 for
  border color, ×1 for everything else. This is the live convention (`field-filters-panel.css`),
  not a new invention for this checkpoint.
- `status-filter-pills` is the one **single-class** root in this checkpoint (0,1,0) — mirrors
  CK-F's `assistant`/`presence` precedent, not the `data-terminal-card` mistake the kit warns
  against (this is a deliberate, aware choice here, matching the file having no engine split and no
  natural second class to pair with). Border-color rules there need `data-part` REPEATED **×3** to
  reach (0,4,0) — count the actual root classes (kit law), do not assume the ×2 recipe applies.
  Status-filter-pills' `Pill button` and `Count badge` parts both carry border-color — both need
  the ×3 repeat.

**All skins are UNLAYERED** (P-76/P-47: layered rules lose to Tailwind's unnamed `base` preflight
layer on `border-width`/`margin`/`padding`, and every tenant ships an unlayered border-color floor).
State the reason in each skin's header comment, don't re-derive it inline per rule. **Never write
`*/` inside a skin comment** — it closes the block comment early and voids every rule after it in
the file (caught twice already in this program). Write "background and filter," never
"background*/filter."

---

## 5. Keyframes disposition (the counter-blind work item)

| File | Keyframe(s) | Action |
|---|---|---|
| `saved-views/engines/modern/index.tsx:259` | `ds-views-spin` | Already `ds`-prefixed and fleet-unique (grep-confirmed zero other references). Move verbatim into `engines/modern/skin/saved-views.css`, drop the unguarded per-render `<style>` tag, update the `animation` reference. No rename — but see DRAFTER NOTE 8 (borderline case, doesn't fully spell the component name). |
| `structures/workspace/export-button/index.tsx:376` | `ds-export-toast-fade` | Already correctly namespaced, fleet-unique. Move into `components/skin/export-button.css`; drop the `<style>` tag, unconditionally injected today regardless of `copiedFeedback` state — this checkpoint's clearest example of that pattern, not gated on the state that needs it, same disposition regardless. |
| `structures/workspace/search-command-bar/index.tsx:397,402` | `workspaceCommandPulse`, `workspaceCommandSpin` | **NOT `ds`-prefixed — real rename required**, unlike every other keyframe in this checkpoint. Rename to `ds-search-command-bar-pulse` and `ds-search-command-bar-spin`; update both the `<style>` block's `@keyframes` names AND the two `animation:` references (`:629` for the pulse, `:113` for the spin) to match. Move into `components/skin/search-command-bar.css`; drop the `<style>` tag (currently injected unconditionally on every render, not gated on any voice state). |

No other file in this checkpoint injects a `<style>` tag or defines a `@keyframes` block
(grep-confirmed against all 18 files).

---

## 6. Certification

### Final evidence — 2026-07-14

CK-C is **CERTIFIED byte-exact** at migration commit `f0046708`:

- 12 ownership-scoped skins are wired through both canonical entrypoints and all five generated
  vertical bundles. `skins.parseErrors`, `skins.unwired`, `skins.exemptionsBreached` and
  `skins.deadParts` are all exactly 0.
- Counted paint moved from 466 to 8: `list-toolbar/engines/modern/index.tsx` retains the three adjudicated
  P-88 sites and `list-toolbar/tokens.ts` retains five shared classic/modern sites; every other CK-C
  source file is exactly 0. All 26 in-scope imperative paint writes were removed. The two classic
  saved-views writes remain out of scope.
- `WorkspaceChromeBatch.contract.test.tsx` is 36/36 green and pins private BEM ownership, both Input
  landing shapes, both engines and all three standalone portal roots. The focused ListToolbar and
  SavedViews suites bring the checkpoint run to 93/93 green. The pre-existing nested-button warning
  in `saved-views-menu` remains record-only.
- Core and showroom production builds pass. The seven committed pre-step screenshots pass at
  `maxDiffPixelRatio: 0.0005` twice consecutively without updating snapshots: four tenant/engine
  rest matrices plus the three open portal panels.
- The only global `engine-token-audit --check` failure observed during this certification is the
  pre-existing `effects.glowConsumers: 0 < 1` measurement defect introduced when CK-F moved the
  sanctioned LiveFeed glow consumer from TSX into its skin. All CK-C/skin gates are green; that audit
  ownership defect is repaired separately rather than weakening this checkpoint's floor.

Per unit, in order: (1) **byte-exact** = the component's visual spec passes against the committed
pre-step baselines (both engines for `saved-views`), 0 pixels over `maxDiffPixelRatio: 0.0005`,
stability-re-run; (2) **counter delta reconciled BY HAND, not read off `: 0`** — this checkpoint has
at least three confirmed counter-unreliability shapes (Trap 3) plus `tokens.ts`'s permanent
non-zero (Trap 5), so a raw `fleet.inlinePaint` read is not sufficient evidence for any unit;
report each file's hand-count next to the counter's number and explain every mismatch; (3) **no
cross-component bleed** = every rule scope-anchored (zero bare `[data-part]`), portal-panel rules
anchored to their own standalone class (Trap 4), wiring append-only; (4) **no core regression** =
the `structures/workspace` + `patterns/data` (list-toolbar, saved-views, status-filter-pills) vitest
suites green. The full visual + full core suites are the belt-and-suspenders pass when the
environment has headroom; if resource pressure kills them (precedent: CK-A), certify byte-exact via
the per-component spec + no-bleed-by-construction and record the owed confirmatory pass. Only after
a unit certifies does the orchestrator append its `@import` lines to both `foundation/base.css` and
`entrypoints/styles.css` and commit that unit — units may certify and land in any order, there is no
cross-unit file dependency.

---

## 7. What this checkpoint does NOT do

- Does not touch `list-toolbar/engines/classic/index.tsx` or `saved-views/engines/classic/index.tsx` (0 sites
  each, AntD-wrapped, out of scope).
- Does not edit `list-toolbar/tokens.ts` — its `searchInputStyle()` stays intact for classic's
  sake; its counter floor stays at 5 permanently, by design (Trap 5).
- Does not unify any of the cross-component vocabulary divergences catalogued in §0.
- Does not reconcile `saved-views`' two active-state metaphors (Trap 2 — record only, team flag).
- Does not collapse `column-menu`'s three-way row gradient to two branches, and does not "clean up"
  `saved-views/rustic.tsx`'s misnamed `--ds-saved-views-menu-shadow` custom property — transcribe
  both exactly as written (Trap 1).
- Does not add any `skin-exemptions.json` entry (§4 — zero runtime sites, nothing to exempt).
- Does not key `view-mode-switcher`'s CSS off `aria-checked` (uses a dedicated `data-selected`
  instead — DRAFTER NOTE 8); does not touch the ARIA attributes themselves either way.
- Does not remove or rename `export-button`'s functional `data-export-item` keyboard-nav attribute.
- Does not let agents wire entrypoints (`foundation/base.css`/`entrypoints/styles.css` — orchestrator-owned).
