# Owner decision package — 2026-09-18 (Kimi DT)

## Adopted resolutions — 2026-09-19, owner-delegated adjudication

The owner explicitly asked Codex in this conversation to review progress and
**take these decisions**. The rulings below are adopted under that delegation,
not attributed to a separate human vote. This is a one-off owner-requested
decision: Codex stays outside the autonomous loop. Kimi and Claude implement,
review and report between themselves; do not contact Codex for approval.

Read this section before the historical questions below. A decision authorizes
the bounded implementation; it is NOT a test PASS, an automatic WO close, or
permission to widen unrelated acceptance. Base inspected: `85cc1085b` on
`ui-design-system/main`. Foreign in-flight table/material edits are preserved.
The original questions retain their historical measurements; remeasure only
the affected current input closure, never reimplement a fix already landed.

### R1 — Cross-repo migrations and canonical names: GO

Authorize the bounded consumer migrations in **app-bithire, app-platform,
app-evnto and the DS showroom** for the public changes in this decision package.
Inventory each touched consumer first; preserve unrelated edits. This is not
authority for other app features, deployment, database changes or an unreviewed
release. Start app-bithire, then the other measured consumers. Record DS and app
commit SHAs, package/contract versions and consumer checks together.

- **FAM-11:** migrate actual consumers of `rottay-app-shell` and
  `rottay-action-dock` to the existing canonical `ds-*` hooks, then stop emitting
  the old hooks. Authorize the `ds-collection-shell` / surface-section-card
  naming migration to the actual owning family namespace wherever the current
  one-namespace acceptance still requires it; do not rename already compliant
  owners or create a second implementation. All in-DS and app CSS/JS readers
  move together. Preserve geometry, keyboard behavior and skin import coverage.
- **D21 / FAM-08:** migrate `ds-table-density-*` app selectors/runtime reads to
  the existing governed density attribute/contract, not another app-only knob;
  prove density remains functional, then retire the class emission.
- Reuse an existing migration mechanism only if deployment/package skew requires
  it. Its end trigger is explicit: all named consumers migrated and validated.
  Remove the compatibility arm when that trigger passes; no permanent aliases.
  Declare public breaks with the proper major changeset and migration guide.
  Do not publish a removal while the named consumers still require the old API.

### R2 — Public retirements (C): GO

Authorize retirement of **`useSortableList`, `useChartTheme`, `ChartFamilyFrame`**
and the old categorical `colors` prop described in R3. Reconfirm productive
callers on the candidate, migrate any remaining caller to the already-landed
canonical kernel/resolver, then remove exports, obsolete implementations and
retired API tests together. Keep replacement behavior tests and a negative
consumer/type check proving the old API is gone. Major changesets and consumer
migration records are mandatory even if the final caller census is zero.
FAM-08 owns sortable retirement; FAM-09 owns chart retirements. No new kernel.

### R3 — Charts Q1 / Q2 / slot cap: decided

- **Q1: de-alias `default` from `accessible` (option a).** `default` uses its
  own governed scheme chain; `accessible` remains an explicit supported scheme.
  Isolate the visual change after the shared resolver is stable. Measure marks,
  legend and export across schemes and light/dark, including app consumers.
  `accessible` is not a paid-quality tier: every scheme still owes accessibility.
- **Q2: retire the arbitrary per-component `colors` bypass** consistently for
  categorical families. Migrate existing arrays to the governed palette/scheme
  input at its canonical owner; preserve intended category identity, not two
  competing paint authorities. User editing remains bounded by catalog choices
  and permissions. Do not replace the prop with another raw-array escape hatch.
- **B3: retain the existing 12-category capability through the governed chain.**
  Adopt one **12-slot categorical vocabulary**, declared once and consumed by
  the resolver, compiler, CSS, legends and exports. Extend the current 10-slot
  authority in one singleton-owned kernel lot; do not silently truncate a live
  12-color caller to 10, or leave a private 12-slot override beside it. This is
  a bounded extension, not an unlimited palette feature. Preserve the first ten
  slots where Q1 does not intentionally change them; slots 11/12 must be real
  governed outputs, not accidental repeats of 1/2. The resolver alone owns the
  deterministic mapping/cycling for series beyond 12. Semantic, sequential and
  single-color models are not converted into categorical slots. Test boundary
  indices 9/10/11/12 and invalid indices, all output paths and light/dark. Provide
  non-color identification (labels/legend and applicable mark distinctions);
  twelve colors alone do not prove accessible differentiation.

Land R3's shared contract before parallel per-family adoption. Keep FAM-09's
already-scoped geometry/RTL work; this approval does not declare all chart
accessibility or fleet customization complete.

### R4 — Error-boundary exception (F2.1): narrowly approved

Approve the **three-property crash-safe floor** already implemented in
`surface-lifecycle/error-boundary`: background, foreground and border, with
governed channel first and the documented light/dark fallback. Replace the old
eight-property allowance with this exact named three-property allowance, not a
blanket threshold exemption for the family. No other component may copy it.
The fallback must remain readable and keyboard-operable with stylesheet and/or
providers absent; prove both modes, retry/focus and a healthy-tree channel
override. Negative drill: adding a fourth unrelated paint property must fail.
Normal spacing/radius/type/motion remain governed. This resolves this exemption,
not FAM-10's other acceptance, ledger, adaptation, contrast or fan-out obligations.

### R5 — Instrument decisions A1/A2 and F2: exact dispositions

| Item | Adopted decision and implementation exit | Existing owner |
| --- | --- | --- |
| A1 false cascade pin | Authorize correction to a genuinely measured candidate, with source/artifact hashes, old/new named populations and provenance of the false historical number. If the correction already landed, link it; do not reset again to current debt. New regressions remain blocking. No unaudited scalar increase. | EVI-03 / EVI-02 |
| A2 frozen-only debt | Separate an exact measured frozen-only population from the productive Modern ceiling. Continue publishing both populations; a new Modern reader re-enters the live gate. Do not count frozen exemptions as fixed or as customizable coverage, and do not thaw those engines. | EVI-03 / INV-01 |
| F2.2 channel-parity buckets | No blanket adoption. Reuse landed sidebar repairs; wire remaining productive reads or retire unused emissions. Frozen-only collapse names use A2. Type-tier pair uses F2.9 below. Every residual gets a measured named disposition; no duplicate producer. | EVI-02 |
| F2.3 resolved literals | A literal in compiled output is not itself a forbidden source hardcode. Classify the current named set by provenance: derived output with actual decision effect is lawful; expressive source literals must derive; immutable structural values need a named invariant. Reject blanket acceptance of the historical 338. | EVI-02 / EVI-03 |
| F2.4 single-door coalescing | Admit the existing `target.baseline ?? baselineFor(...)` semantics if both arms enter the same governed compiler. Repair the instrument to measure the actual call/door, not a textual arity coincidence. Preserve source behavior; a planted second compiler/bypass must still fail. | EVI-02 |
| F2.5 engine-posture cell | Reclassify from measured capability: zero gap means no unaccounted debt; it does NOT prove the frozen engine supports the feature. Use supported/unsupported/N/A honestly with evidence. Remove the contradictory positive-debt assertion, not the coverage check. | INV-01 / EVI-03 |
| F2.6 motion pins | Measure only the canonical execution checkout and its declared inputs, never a detached historical sibling. Attribute any current increase by named keyframe/consumer and approved lot; repair actual duplication. Re-anchor only the explained set. | EVI-03 |
| F2.7 dead writers | Retain lawful exits; wire or retire the remaining named dead writers before moving the anchor. Previously landed corrections are reused, not repeated. No generic dead-writer waiver. | RET-03 / EVI-03 |
| F2.8 cascade vocabulary | Choose governed vocabulary extension for expressive spacing/tracking/motion/opacity/measure gaps, with one canonical owner and genuine decision-dependent family adoption. Add internal rungs only where a measured use needs them; no automatic new user knobs or entitlement change. Named structural constants are allowed only for invariant geometry/semantics independent of a brand choice, never as a blanket escape for the 85/136 historical counts. Preserve resting output unless an explicit visual change is reviewed. | EVI-02; singleton derivation owner |
| F2.9 elevation-6 | Keep the useful highest elevation rung; the box `2xl` path already reads it. Prove the existing transitive productive route and depth causality, repair the classifier if blind, and discharge the stale pin. Do not invent a second reader solely to green the census or mark the rung structural when it changes paint. | EVI-02 / EVI-03 |
| F2.9 xs/sm letter-spacing | Retire these two zero-only emissions if the current productive census confirms no reader: small headings already inherit the governed heading/role tracking. Prove that inherited route remains effective. If a real consumer is found, migrate it to the canonical role instead of adding an independent tracking authority. No permanent inert pin, no fake consumer to satisfy liveness. | EVI-02; typography owner |
| F2.10 dashboard-header naming | Approve a scoped admission for the actual `dashboard-header` family and its enumerated declared namespace. Here dashboard names a reusable UI family, not a tenant/business vertical. Keep the universal deny-list for all other names; no global removal of `dashboard`, no costly cosmetic namespace migration. The admission must require this family owner and fail for a planted unrelated/tenant-prefixed name. | EVI-03 / FAM-10 |
| F2.11 radius-field | The private framework adapter alone owns `--radius-field`, projected from the canonical field/input radius (not the button radius). Reuse the existing input/shape role; a required fallback belongs in that canonical owner so the adapter can read one governed reference. No extra user knob or new public legacy namespace. If census proves the adapter hook has no supported consumer, retire it instead of preserving an empty bridge. Verify input shape propagation and unrelated button stability; no blanket csspaint exemption. | EVI-02 / RET-03 |

These are implementation decisions, not a demand to widen or bypass gates.
Keep failed measurements visible until the relevant repair/proof lands. Never
claim a structural/frozen disposition is successful decision-to-family fan-out.

### Execution, finite closure and independence

1. Preserve active writers. Apply these decisions at their next bounded packet;
   do not interrupt the current data-table/material source edits.
2. Run the **FAM-11 consumer/hook migration** and **FAM-08 sortable/table consumer
   migration** in parallel only after checking their app file reservations.
   FAM-10 crash-floor/invariant work may run alongside disjoint packets.
3. The chart resolver/12-slot extension is one serial core owner; after its
   contract stabilizes, parallelize complete per-chart packets. Token root and
   instrument edits also have one owner where they share files. Keep a single
   heavy build/browser window and one Git integrator.
4. Record per-WO finite remaining criteria, source/app commits and focused
   red-to-green evidence in the existing registry via its CLI. Close immediately
   when the WO's own acceptance is satisfied. Do not require final tenant artwork
   or whole-fleet completion to close an individual family. Do not treat this
   decision package as blanket permission to close FAM-08/09/10/11.
5. No new WOs, lowered product thresholds, fabricated GO/signatures or rewritten
   history. Update the actual gates/contracts/acceptance notes needed to encode
   these explicit decisions in the corresponding implementation lot. Keep the
   161 denominator and DAG; if a real authority conflict remains, isolate that
   specific packet, state the conflict to the user and continue eligible work.
6. Kimi directs/integrates, normal `claude` on Daniel.Avila supplies real Opus
   writers and real Fable independent reviews. Only the human user requests
   independent Codex work; never message, invoke or wait for Codex. Continue
   autonomously without micro-audits or polling. Publish reviewed coherent DS
   checkpoints under the standing publication policy; do not deploy apps.

---

## Historical decision request — retained for provenance

Consolidated after reconciling the stale D1–D21 package: completed actions are marked done
(D1's backlog executed; D17's arithmetic corrected to 18), measured-stale entries dropped.
Each open item names the exact edit that follows a decision. Nothing here blocks the running
lanes unless it says so.

## A. Blocking the cascade ratchet's green (CI honesty)

**A1. Re-anchor the cascade-ratchet baseline.** The 2026-09-14 pin (2079/2114/5210) was never a
measurement — the write commit's own gate measures 2427 on its own tree (a hand enumeration was
substituted for the census; `evidence/r17-07-cascade-attribution/index.md`). The tree today
measures **5443 / 2342 / 2344** (honest, post-repair). Options:
- (a) Re-anchor to the measured values with the provenance note (recommended — it is a correction
  of a false record, not a widening; the decrease-only law binds measurements, and this never was
  one).
- (b) Pin the NAMED SET (the instrument learns to compare sets, not scalars — the attribution
  report's proposal; larger instrument lot, better long-term).
- (c) Leave it red and let it keep crying — not recommended: red-as-normal hides new violations.

**A2. The 330 frozen-only debt names.** They live only in Classic/Rustic skins; the freeze law
forbids repairing them, so no lot can ever drive the ratchet to zero while they count. Decide:
a declared frozen-only population excluded from the live ceiling (recommended), or an explicit
written exception standing.

## B. Blocking the chart lane's value half (WO-FAM-09)

**B1. (Q1) De-alias `default` from `accessible`.** Today `default` paints the accessible table.
De-aliasing repaints every default-scheme chart in the estate (the largest visual change
available). Recommendation: (a) de-alias, scheduled after the current wave so its diff is the
only change in its commit. Until then, five families' 20 scope rows stay honestly red.

**B2. (Q2) The `colors` prop.** Pie honours it, scatter declares-and-discards it. Recommendation:
retire it for all categorical families (the governed chain is the point); public-API break.

**B3. The 10-slot cap vs 12-colour overrides.** The resolver caps at 10 slots; five families
honour a 12-colour `colors` override today (pinned). Cap-or-keep changes public behaviour.

## C. Public-API retirements (one authorization covers all three, or pick per row)

- `useSortableList` (F-69 lot 9): zero consumers in repo and the three apps; replaced by the
  landed sortable kernel.
- `useChartTheme`: zero consumers anywhere (measured); 13 hardcoded hexes inside.
- `ChartFamilyFrame`: public, unused.
Each is a `major` changeset with the removal measured. Recommendation: authorize all three
(they are the retirement lot each wave already expects).

## D. App-side (cross-repo — nothing is written to apps without this)

**D21.** `ds-table-density-*` classes are LIVE in app-bithire (runtime reads) and app-evnto (CSS).
Authorize the consumer-migration lot (app-bithire first) before the DS retires the class.
Until then the class stays emitted and pinned.

## E. Answered by measurement this week (recorded, no decision needed)

- D15's DnD ownership: resolved by the handoff — FAM-08 owned the base kernel; landed.
- Q-B-DER07: milestone B no longer gates on the branding pick (machinery + test, `c4d5405b0`).
- The DnD kernel's shape: adopted after 4 Codex rounds + 5 revisions + my compile/probe
  verification (`evidence/dnd-kernel-debrief/`).
- The chart paint contract: adopted (`evidence/chart-paint-debrief/` + the root-or-read addendum).

## F2. New from the 2026-09-18 red-ledger attribution (post-FAM-10-wave gates sweep)

1. **Error-boundary exemption floor** — `SKIN-EXEMPT-CRASH-SAFE-FALLBACK=8` was pinned for the OLD
   error-boundary paint; the G lot measured the honest failure-mode floor at 3 properties
   (bb29b085b). Either re-declare the floor at 3 (the measured floor, recommended) or restore paint.
2. **theme-channel-parity new buckets** — `--ds-collapse-border`, `--ds-type-tier-{sm,xs}-letter-spacing`,
   5 sidebar channels: the gate law requires reviewed manual adoption (or consumers wired).
3. **tenant-reachability: 338 newly-resolved literals** — the drained skins resolved channel reads
   into literals in the regenerated artifacts; route per name-class or accept-with-reason.
4. **theme-lowering-single-door** — the door's `baseline: target.baseline ?? baselineFor(...)`
   (9d7294e33) trips the arity census law; admit the shape or restructure the call.
5. **engine-posture cell** — classic/surfaces.elevation-posture: measured gap is 0 but the pin
   asserts unaccounted=3 AND unaccounted>0; the "unsupported" cell needs reclassification.
6. **motion-contracts re-anchor** — the sibling worktree (ui-design-system) holds preserved
   historical changes; the gate's pins drifted (66>64 keyframes). Re-anchor once the sibling
   settles, or point the gate at the execution checkout only. Ratchet GREW: adjudication, never
   a blind re-pin.
7. **customization dead-writers anchor** — 5 lawful exits (Container ladder) + 9 new dead writers
   from 09-16/17 lots that must be wired-or-retired BEFORE the anchor moves.
8. **cascade-wiring doctrine** — the cut template's "produced value = the skin's literal fallback"
   collided with the ratchet's every-channel-roots law (298 new unwired). The wiring lot landed
   (7a67243d8): 164 channels re-chained to roots with deriver/skin lockstep parity, one pixel-move
   caught and reverted by audit. CONFIRM the doctrine going forward: derivers produce root-chained
   values by default. REMAINING, and it is yours: the gate reads 2215 against a decrease-only pin
   of 2079 (+136). 85 of them are measured genuinely rootless — the governed vocabularies lack the
   rungs (no 6/10/14/18px spacing steps, letter-spacing tops at 0.1em, motion canon lacks 400ms,
   no opacity rungs, no measure roots at 35/42.5rem). The law forbids raising the pin, so the gate
   stays honestly red until you pick: (a) DER-lane vocabulary widening (new rungs, then the
   channels wire), or (b) an explicit amendment admitting named structural constants into the pin
   (the pin's own debtNote already carries 64 such names from FAM-04). The other ~51 are
   pre-wave families' post-pin debt, routable to writer lots.
9. **channel-liveness STOP NO-GO tail** — `--ds-elevation-6`, `--ds-type-tier-{sm,xs}-letter-spacing`:
   the 748cdf85c packet's owner proposals still await a ruling.
10. **theme-iso universal-name law vs the dashboard-header family** — D2's 23
    `--ds-dashboard-header-*` channels trip THEME_NAME_DENY_LIST ("dashboard" is a
    banned word in universal channel names). The family was cut under that name
    (FAM-10 roster); the law predates it. Choose: rename the family namespace
    (expensive, artifact-moving) or amend the deny-list with a scoped admission.
    NOT pinned over — the writer refused and reported (correct).
11. **csspaint `--radius-field` ownership** — the pre-existing projection finding (12866efbd) needs
    an owner; the ceilings re-pin (157->123, 23->18) is queued behind it.

## G. New from the 2026-09-19 cascade-wiring attribution (post-R5 wave)

**G1. The rem-ramp question (gates ~40 channels and milestone B's rhythm axis).** Measured by the
shell-cluster wiring lot in a Chromium A/B: the spacing ramp is `rem` over a fluid root that
resolves **15px** at the probe width, while the shell families author chrome geometry in physical
`px`. Wiring `42px` to `var(--ds-spacing-…)` repaints ×0.9375 fleet-wide (36/50 measured sites
moved; the writer reverted all 41 ramp-dependent wires honestly). Choose: (a) adopt the rem ramp in
family chrome geometry — a one-time fleet-wide −6.25% chrome shift, after which rhythm/density
reach every wired family; (b) keep physical px and admit the named structural constants into the
pin (the FAM-04 precedent); (c) a per-family mix with the rule written down. F2.8 chose governed
vocabulary extension as the route, but did not see this measurement: the missing rungs are not the
blocker here, the rem/px mismatch is.

**G2. Recorded, no decision needed — the bithire corner reach.** The same lot's four corner wires
(`--ds-radius-lg`) give bithire's `shape.radius-scale: 0.8` reach it never had: bithire resting
corners move 15px → 12px and 18px → 14.4px (rottay/evnto unchanged). DT ruled KEEP — a corner
frozen against the tenant radius dial is exactly the debt the ratchet measures, and the change is
the declared cascade direction; Fable adjudicated independently (see
`2026-09-19-shell-wiring-review-davila.md`). Revert path if you disagree: `--ds-radius-lg` →
`--ds-radius-lg-base` (12px, dial-free, identical in all three verticals).

## F. Quota (RESOLVED 2026-09-18 — superseded by the owner)

RESOLVED: the owner moved the writer seat to the Kimi CLI (`kimi-code/kimi-for-coding`) on 2026-09-18;
the D/E drafts landed as e5c3a7334 and the queue has been running on the new seat since.
