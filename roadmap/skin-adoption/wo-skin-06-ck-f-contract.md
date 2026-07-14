# WO-SKIN-06 CK-F (communication family) — migration contract

Reads on top of `wo-skin-06-ck-f-inventory.md` (the site-by-site truth) and
`migration-kit.md` (the mechanics). The inventory is normative for *what* paint
exists; this contract is normative for *how* it moves. Where they disagree, the
inventory's site table wins on facts and this contract wins on method.

Scope: `packages/core/src/components/patterns/communication/` — **271 counted
sites** (was 272; the counter's return-type-annotation blind spot at assistant:157
was fixed in `inline-paint-counter.mjs` between the inventory and the pre-step, so
assistant's floor is 15, not 16 — a counter fix, not lost paint) across six
components. `classic.tsx` (AntD wrapper, 0 counted sites in every engine-split
component) is **out of scope** and must not be touched.

---

## ORCHESTRATOR ADDENDUM — CK-F pre-step findings (drilled + committed `8ebf56bc`; these SUPERSEDE the inventory where noted)

The anatomy pre-step (both invariants proven and independently re-verified by the
orchestrator: counter 271/delta-0, DOM unchanged via attribute-only diff + AST probe;
contract test 42/42, family suites 114/114) surfaced six facts the migration MUST honor.
The stamped attributes referenced below are already in the tree — migration keys off them.

1. **Count is 271, assistant floor is 15** (see scope line). Do not chase assistant to a
   number the counter can't express; hand-count and report the delta as always.
2. **`typeBgStyles` (notification-center/modern.tsx:31) is DEAD CODE — never referenced in
   JSX (grep-confirmed).** The §0 divergence "notification-center icon container tint:
   modern has a color-mix background; rustic has none" is FALSE at runtime — BOTH engines
   lack the tint today, because modern's is defined-but-never-applied. **There is no
   modern-only tint value to preserve.** Do NOT write a skin rule for it; there is no DOM
   element to anchor one to. Leave the dead const in place (removing dead code is out of a
   byte-exact pre-step/migration's scope) and flag it for a possible future cleanup.
   Strike this divergence from §0's non-unifiable list — it was never real.
3. **Rustic activity-log's `data-action-category` holds a raw color-token string**
   (e.g. `data-action-category="var(--ds-color-success)"`), NOT a semantic enum like
   modern's (`"create"`). `getActionColor()` returns the token directly, so the two engines'
   attribute vocabularies differ by construction. The rustic skin keys on the literal token
   string (valid CSS attribute-value match) or leaves the resolved color where the classifier
   put it; either way, do not assume rustic's attribute mirrors modern's enum.
4. **Rustic activity-log's loading state is a plain "Loading…" text row — NO skeleton, NO
   shimmer** (only modern has `LoadingSkeleton`/`ds-activity-shimmer`). Do not go looking for
   a rustic skeleton to migrate; there is none. The pre-step stamped `data-part="loading"` on
   the rustic branch and `skeleton` parts only on modern.
5. **PreviewDiffCard needed `data-diff-side="before"|"after"` beyond `data-change`.** Modern
   maps the SAME `change` value to DIFFERENT colors per side (e.g. `removed` → before=error,
   after=muted), so `data-change` alone can't distinguish the two cells. The pre-step stamped
   `data-diff-side` on both cells; the skin MUST key on `[data-part='preview-cell'][data-change=…][data-diff-side=…]`.
6. **Card forces its own `data-part="root"` and does NOT forward a custom one** (it merges
   `className` correctly, though). assistant's three Card-rooted exports (ToolCallCard,
   PreviewDiffCard, ConfirmActionCard) carry their scope class via `className` (works) and rely
   on Card's forced `data-part="root"`; their INNER paint elements (Box/Text) carry their own
   forwarded data-parts. The migration must anchor Card-rooted skin rules to the scope-class +
   Card's forced `root`, and never expect a custom data-part to land on a `<Card>`/`<Card.Body>`
   root. (P-79 precision — verified empirically in the pre-step, documented in the contract test.)

---

## 0. The one law that governs this checkpoint: six skins, not one

The inventory's §0/§2 proved there is **no shared styling vocabulary** in this
family — zero cross-component style imports (live-feed modern's use of the
DS-wide `_internal/engines/modern/styles.ts` helper is the sole exception and is
not communication-specific). Three components (comment-thread,
notification-center, activity-log) have their **modern and rustic engines
independently reinvent the same concept with different values**, and
activity-log's divergence is in *classification logic*, not just color.

**Every divergence catalogued in inventory §2 is a value the migration must
PRESERVE per-engine, per-component.** Do not flatten two engine values onto one
selector. Do not point modern and rustic at a shared token because "it's
obviously the same idea." A moved pixel is a bug; CK-D's correction settled this
and it is not reopened here. Concretely, the following pairs stay as two
selectors with two values and MUST NOT be unified:

- comment-thread text-on-primary: modern `--ds-color-text-on-primary` vs rustic
  `--ds-color-primary-foreground, #fff` (two real, non-alias tokens).
- notification-center `info` type: modern `--ds-color-info` vs rustic
  `--ds-color-primary`.
- notification-center unread-row tint: modern `color-mix(... 10% ...)` vs rustic
  `--ds-color-primary-50, var(--ds-color-bg-muted)`.
- notification-center icon container tint: modern has a `color-mix` background;
  rustic has **no container tint** — preserve the structural absence.
- activity-log action→color: modern 5-category switch (incl. `system` catch-all)
  vs rustic 4-branch if-chain (no catch-all). See §3 trap 2 — the LOGIC stays in
  TSX; only the resolved-category→color values move.
- live-feed theming hatch: rustic consumes all 11 `--ds-live-feed-*` tokens;
  modern uses generic tokens through the shared helper. Rustic's skin keeps
  consuming `--ds-live-feed-*`; modern's skin has no such hatch to invent.

---

## 1. Migration units — split by risk into three parallel agents

The family is 240 engine-split sites + 32 primitive-composed sites. Split so the
riskiest work (live-feed's keyframe trap, the divergent classifiers) is isolated
and the two structurally-alien components (assistant, presence) are their own
unit, exactly as the inventory's §0 architectural note recommends.

- **Agent F1 — comment-thread + notification-center** (81 + 62 = 143 sites, 4
  files: `{comment-thread,notification-center}/engines/{modern,rustic}.tsx`).
  Skins land in `engines/{modern,rustic}/skin/comment-thread.css` and
  `.../notification-center.css` (one per engine per component — **four** skin
  files). The heaviest STATE-SELECTED load (notification-center's 4-way type map
  ×2 channels + unread tint) lives here. No keyframes, no runtime.
- **Agent F2 — activity-log + live-feed** (53 + 44 = 97 sites, 4 files). Skins in
  `engines/{modern,rustic}/skin/activity-log.css` and `.../live-feed.css`. This
  unit owns BOTH keyframe traps (activity-log modern `ds-activity-shimmer`;
  live-feed rustic `pulse`/`feedPulse` — the STOP-AND-VERIFY, §3 trap 1) and the
  divergent-classifier trap (§3 trap 2). Give it the most careful agent.
- **Agent F3 — assistant + presence** (15 + 13 real sites, 2 files:
  `assistant/index.tsx`, `presence/index.tsx`, both engine-agnostic). Skins land
  in **`components/skin/assistant.css`** and **`components/skin/presence.css`**
  (engine-agnostic → the `components/skin/` bucket, like CK-A's widgets, NOT the
  per-engine bucket). This unit owns the RUNTIME-stays-inline rule, the false
  positive, and the SVG blind spot (§3 trap 3).

Agents run in parallel; each stages ONLY its own files by explicit path (never
`git add -A` — shared tree). **Entrypoint wiring is reserved for the
orchestrator** — agents create skin files but do NOT edit `foundation/base.css`.

---

## 2. Anatomy pre-step (inert, runs BEFORE any migration; orchestrator-owned)

Every component in this family is greenfield for `data-part` (grep-confirmed zero
in all 10 files). The 5 pre-existing `ds-pattern-<name> ds-engine-<engine>` scope
classes are inert (zero `tokens/css/` references) — a partial head start, not a
live coupling. The pre-step must, per component:

1. **Stamp/complete the scope class.** Engine-split components carry
   `ds-pattern-<comp> ds-engine-<modern|classic|rustic>` on the root of EACH
   engine file. comment-thread + notification-center already have it on
   modern+classic; **add it to their rustic roots** and to activity-log's
   modern+rustic roots and live-feed's all-three roots. For the two
   engine-agnostic components, mint a single family scope class on each exported
   sub-component's own root: `ds-assistant-<export>` (8 exports) and
   `ds-presence-<export>` (3 exports) — there is no single root to anchor, so
   each export is its own scope island (this mirrors CK-A's per-widget classes).
2. **Stamp `data-part` on every painted element**, named by role
   (`avatar`, `edit-textarea`, `save`, `cancel`, `reaction`, `reply`, `delete`,
   `nested-line`, `spinner`, `composer`, `submit`, `trigger`, `badge`, `panel`,
   `header`, `row`, `unread-dot`, `dismiss`, `dot`, `line`, `diff-cell`,
   `skeleton`, `caret`, `typing-dot`, `tool-card`, `preview-cell`, `timestamp`,
   `cursor-badge`, `overflow-badge`, …). Anchor rules to the SCOPE CLASS + part;
   never a bare `[data-part]` (that bleeds — the law that drew blood seven times).
3. **Stamp state attributes** where a ternary/map selects paint, so the skin can
   key off DOM instead of a JS branch:
   - comment-thread reaction pill (both engines): `data-active={r.active}`.
   - notification-center: `data-type={item.type}` on the icon (drives the 4-way
     color+bg map), `data-unread={!item.read}` on the row, `data-unread` on the
     title dot.
   - activity-log: **`data-action-category`** on the badge AND the timeline dot,
     set to the value each engine's OWN classifier returns (see §3 trap 2 — the
     stamp captures the resolved category so the divergent logic stays in TSX).
   - notification-center dismiss (modern): a `data-part='dismiss'` is enough; the
     skin converts the imperative opacity-hover to `:hover { opacity: 1 }` (§3
     trap 4).
   - assistant: `data-status` (agentStatusVisual 5-way + AssistantStatusIndicator
     dot), `data-tone` (ToolCallCard duration text), `data-change`
     (PreviewDiffCard 3-way added/updated/removed/unchanged).
4. **The pre-step is ININERT and must prove BOTH invariants** before any paint
   moves (kit + README law): (a) the counter is byte-identical to HEAD for all 10
   files (no paint moved — stamping attributes is not paint), and (b) the element
   tree is unchanged, proven by a TS-compiler AST diff with attributes stripped,
   DRILLED (counter-identity proves no PAINT moved, not that the DOM is
   unchanged). Record visual baselines for all six components (both engines where
   split) after stamping and stability-pass them.

---

## 3. The four traps — each is a STOP-AND-VERIFY, not a footnote

**Trap 1 — live-feed rustic `@keyframes pulse` is 1→0.4→1, the global is
1→0.5→1. They are deliberately different.** Before F2 moves live-feed rustic's
keyframes into `engines/rustic/skin/live-feed.css`, empirically confirm (CDP
computed-style / animation inspection on the production build, matching the
Steps/Divider precedent) WHICH opacity floor renders today — the local `<style>`
is injected after the global bundle, so the local 0.4 almost certainly wins, but
this MUST be measured, not assumed. Then rename to `ds-live-feed-pulse` (and
`ds-live-feed-feed-pulse` for the second keyframe, which has NO global equivalent)
and carry the measured value verbatim. Do NOT delete-and-rely-on-global.
Precedent for the correct fix is `detail-panel`'s own test
(`patterns/data/detail-panel/tests/PatternDetailPanel.real-engines.test.tsx:196`).
activity-log modern's `ds-activity-shimmer` is the easy half of this trap:
already `ds-`-namespaced and fleet-unique, so just move it into the skin and drop
the unguarded per-render `<style>` — no rename, no value question.

**Trap 2 — activity-log's action classifier diverges in LOGIC between engines,
not just color.** Modern's `classifyAction` is a 5-category switch (incl. a
`system`/warning catch-all, verb sets with `changed`/`archived`/`read`); rustic's
`getActionColor` is a 4-branch if-chain with NO catch-all and narrower verb sets.
The SAME activity string can bucket differently per engine. This is NOT
skin-migratable and MUST NOT be reconciled. The migration keeps each engine's
classifier in TSX; the pre-step stamps `data-action-category` = whatever THAT
engine's classifier returned; the skin maps category→color per engine with the
inventory's exact values. Record the logic divergence as a team flag (product
question, same shape as CK-C saved-views) — do not flatten it.

**Trap 3 — three counter blind spots hide/misreport real paint; a migration that
trusts `fleet.inlinePaint` instead of reading each function will silently leave
or misreport work.**
- activity-log modern:74 — bare `color,` (JS object shorthand, no colon) is a
  REAL STATE-SELECTED site inside `getActionBadgeStyle`, invisible to the counter.
  F2 MUST migrate it (the badge text color, keyed on `data-action-category`).
- assistant:157 — `function agentStatusVisual(status): { color: string; … } {`
  is an inline return-type annotation, a FALSE POSITIVE. The counter reports 16
  sites for assistant; only 15 are paint. F3 must NOT try to "migrate" line 157 —
  there is nothing there. Post-migration assistant's counter floor is whatever
  the 15 real sites + this 1 phantom resolve to; do not chase it to 0 by touching
  the type annotation.
- presence:358,362 — `fill={cursorColor}` / `stroke="var(--ds-color-surface,#fff)"`
  are SVG presentation attributes as bare JSX props, counter-invisible.
  `fill={cursorColor}` is genuine RUNTIME (per-user) → **stays inline** (§ runtime
  rule below). `stroke="..."` is STATIC but is an SVG attribute, not a style key —
  leave it as the JSX attribute it is (moving a static SVG presentation attr into
  a CSS `stroke:` rule is a channel change, not byte-exact; keep it inline).
  Neither shows in the counter, so presence reaching `fleet.inlinePaint: 0` does
  NOT mean presence is fully migrated — F3 reports the delta by hand.

**Trap 4 — notification-center modern's dismiss hover is imperative
`.style.opacity =` (uncounted).** Real behavior, invisible to the counter. F1
converts it to a `:hover { opacity: 1 }` rule on the `[data-part='dismiss']`
scope selector and removes the `onMouseEnter/onMouseLeave` pair. Rustic's dismiss
is a static `opacity: 0.5` with NO hover — preserve that asymmetry (rustic gets
no `:hover` rule). Because opacity is uncounted, this changes no counter total;
verify by reading, and note it in the delta report.

---

## 4. Runtime, exemptions, specificity

**RUNTIME stays inline — no exemption file needed for CK-F.** The inventory's
final report is explicit: this checkpoint needs "no B-category exemption and no
C-category custom-property hatch beyond what presence already uses." Presence's
per-user identity colors (`ringColor`/`cursorColor = user.color || DEFAULT_COLOR`
at lines 148 border, 181 color, 373 background, + the SVG fill at 358) are
genuine per-user runtime — they stay inline exactly as written. Their STATIC
siblings on the same elements (borderRadius, the overflow-badge's neutral tokens,
LiveCursor's hardcoded `#fff` color and `boxShadow` — preserve the hardcode
byte-exact, flag it, do not "fix" it) move to the skin. Do NOT add any
`skin-exemptions.json` entry for this checkpoint.

**Specificity (P-48).**
- Engine-split components (comment-thread, notification-center, activity-log,
  live-feed) get a **two-class root** `.ds-pattern-<comp>.ds-engine-<engine>`
  (0,2,0). A border-COLOR rule must reach (0,4,0) to beat the tenant floor
  `html[data-tenant]…*` at (0,3,1): two root classes + `data-part` REPEATED ×2.
  Non-border paint wins unlayered at (0,3,0) with data-part ×1. A `border: none`
  reset carries no color → exempt from the floor.
- Engine-agnostic components (assistant, presence) have a **single scope class**
  per export (0,1,0). A border-color rule there needs `data-part` REPEATED ×3 to
  reach (0,4,0) — this is the data-terminal-card lesson: on a single root class,
  ×2 is only (0,3,0) and LOSES to the tenant floor. assistant's
  `PreviewDiffCard` divider `borderTop` and presence's overflow-badge border are
  the border-color sites here → data-part ×3.

**All skins are UNLAYERED** (P-76: layered rules lose to Tailwind preflight on
border-width/margin/padding). Never write `*/` inside a skin comment — it closes
the block comment early and voids every rule after it (caught twice already;
write "background and filter", not "background*/filter*").

---

## 5. Keyframes disposition (the counter-blind work item)

| File | Keyframe | Action |
|---|---|---|
| comment-thread/modern | consumes global `ds-spin` | nothing to move (no local injection) |
| live-feed/modern | consumes global `spin` + `.ds-pulse-changed` | nothing to move |
| activity-log/modern | local `ds-activity-shimmer` | move to skin, drop the per-render `<style>`; namespaced+unique, no rename |
| live-feed/rustic | local `pulse` (1→0.4→1) + `feedPulse` | **TRAP 1** — measure, rename to `ds-live-feed-pulse`/`ds-live-feed-feed-pulse`, carry measured value |
| assistant/index.tsx | `ds-assistant-caret`, `ds-assistant-dot` | move to skin; namespaced+unique |
| presence/index.tsx | `ds-presence-dot` | move to skin; namespaced+unique |

Keyframe `@keyframes` live in the same unlayered skin file as the component that
uses them (a keyframe is global-by-name regardless of where declared, so
namespacing is what prevents collision — the naming is already correct for all
but live-feed rustic's two bare names).

---

## 6. Certification

Per unit, in order: (1) **byte-exact** = the component's visual spec passes
against the committed pre-step baselines (both engines where split), 0 pixels
over `maxDiffPixelRatio: 0.0005`, stability-re-run; (2) **counter delta
reconciled by hand** — each agent counts its migrated sites manually and reports
the delta vs `fleet.inlinePaint.patterns/communication` (remember: shorthand,
false-positive, and SVG sites do NOT move the counter, so a hand count is the
only truth — report them explicitly); (3) **no cross-component bleed** = every
rule scope-anchored (zero bare `[data-part]`), wiring append-only; (4) **no core
regression** = the communication vitest suite green. The full visual + full core
suites are the belt-and-suspenders pass when the environment has headroom; if
resource pressure kills them (as it did in CK-A), certify byte-exact via the
per-component spec + no-bleed-by-construction and record the owed confirmatory
pass. Only after a unit certifies does the orchestrator append its `@import`
lines to `foundation/base.css` and commit that unit.

---

## 7. What this checkpoint does NOT do

- Does not touch `classic.tsx` (0 sites, AntD-wrapped, out of scope).
- Does not unify any cross-engine divergence (§0).
- Does not reconcile activity-log's classifier logic (trap 2 — record only).
- Does not "fix" LiveCursor's hardcoded `#fff`/`boxShadow` (preserve byte-exact,
  flag only).
- Does not add exemption entries (§4 — no runtime hatch needed).
- Does not chase assistant's counter to 0 through the line-157 type annotation.
- Does not let agents wire entrypoints (orchestrator-owned).
