# W-E state — R1-P Phase 5, Modern structural debt (Codex C5)

Status: **COMPLETE**. Ledger delivered, 1 fix executed and verified, gate GREEN.

## Deliverables

- `closure/phase5-ledger.json` — all 3,980 rows (path, line, category, rule, evidence,
  criticalPath, porcelain, owner, skinPainted, action)
- `closure/phase5-ledger.md` — narrative ledger, census identification, precision defects
- Scratch analyses: `reachability-modern.py`, `paint-coupling.py`, `a11y-triage3.py`,
  `final-ledger.py` under the session scratchpad

## Census source

`packages/core/scripts/pattern-surface-ownership-gate.mjs` (**DS-A002**), baseline
`pattern-surface-ownership-gate.baseline.json`. Reproduced C5 exactly at entry:
3,980 findings / 478 files; 3,233 / 293 / 92 / 314 / 48.

## Batch log

| batch | action | result |
|---|---|---|
| B1 | locate census, reproduce baseline | 3,980 / 478 exact match to C5 |
| B2 | build critical-path axis | 1,974 critical / 2,006 not; classic+rustic pruned as runtime-dispatched |
| B3 | porcelain cross-check vs phase0 | all 15 dirty census-scope files were dirty at phase0 → all foreign |
| B4 | paint-coupling analysis | 143/174 clean critical candidates are skin-coupled |
| B5 | a11y triage (3 anchoring corrections) | 15 real keyboard defects, 5 verified false positives |
| B6 | fix notification-center trigger + tests | gate exit 0; 18/18 focal tests pass |

## Commands run (all exits recorded)

```
node scripts/pattern-surface-ownership-gate.mjs --check --quiet          -> 0 (GREEN, after fix)
node <scratch>/dump-ownership.mjs  (pre)                                 -> 3980 findings / 478 files
node <scratch>/dump-ownership.mjs  (post)                                -> 3979 findings / 478 files
npx vitest run src/ui/patterns/communication/notification-center/tests/NotificationCenter.test.tsx
                                                                         -> 18 passed (18)
git status --porcelain <file>   (per file, before every edit)            -> empty = clean
```

No builds, no typecheck, no full suites, no git operations, no baseline re-seed.

## Files touched (2) with porcelain proof

Both were **clean** and **absent from phase0** immediately before editing:

```
 M packages/core/src/ui/patterns/communication/notification-center/engines/modern/index.tsx
 M packages/core/src/ui/patterns/communication/notification-center/tests/NotificationCenter.test.tsx
```

Every other dirty file under `src/ui/{patterns,surfaces}` is FOREIGN (present in
`phase0-uids-porcelain.txt`) and was never opened for write.

Cap not reached: 2 of 15 files. The limiter was **not** WIP blocking and **not** clean-file
supply — it was paint coupling (see below).

## Headline for the audit

`BLOCKED-by-WIP` is only 38 findings. The real blocker is that **143 of the 174 clean,
critical-path, Claude-owned findings (82%) are already painted by an authored Modern skin
keyed on the element's own `data-part`**. Replacing those elements with DS primitives moves
the skin's target and layers primitive chrome underneath, so it cannot be certified
value-preserving without the sighted check this phase forbids.

**Those 143 need a joint Claude-structural + Kimi-visual wave. That is a scheduling
dependency C5 does not currently express.**

## Open items handed to the owner

1. Sequence the 143 paint-coupled findings as a joint wave (structural swap + skin rewrite
   + sighted check together). Largest clusters: `filter-builder` 17, `comment-thread` 12,
   `file-manager` 11, `filter-panel` 10, `saved-views` 9, `collection-workspace/render-dispatch` 8.
2. Allowlist the 8 `create-element-*` imperative-DOM false positives and the 6
   `branding-preview-sandbox` swatch findings, or refine the rules.
3. Adjudicate the 15 genuine keyboard defects (WCAG 2.1.1) — most are not mechanical swaps
   because the clickable hosts contain nested interactives.
4. Sighted check on the one shipped delta: ghost hover tint + focus ring on the
   notification-center bell trigger.
5. DS-A002 does not cover `src/ui/structures` or `src/ui/primitives` — if C5's "patterns and
   structures" framing is meant literally, the census scope must be widened before R1-P closes.
