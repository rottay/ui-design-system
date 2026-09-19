# Owner decision package — 2026-09-18 (Kimi DT)

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

## F. Quota (RESOLVED 2026-09-18 — superseded by the owner)

RESOLVED: the owner moved the writer seat to the Kimi CLI (`kimi-code/kimi-for-coding`) on 2026-09-18;
the D/E drafts landed as e5c3a7334 and the queue has been running on the new seat since.
