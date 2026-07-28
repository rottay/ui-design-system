# P1 state — Codex C6.1 closure: BrandTheme becomes the real author

## Checkpoint 0 — verify + measure (DONE)

### Starting facts (measured, not quoted)

| vertical | extension bytes | declarations | regions |
|---|---:|---:|---:|
| rottay | 84407 | 1354 | 2 (generic dark block + light block) |
| bithire | 39708 | 413 | 8 |
| evnto | 6591 | 81 | 2 |

Matches the Codex verdict (1,343/84,407 · 405/39,708 · 75) within the
declaration-counting convention (`grep -c ':'` counts a few comment lines; the
postcss parse in checkpoint 1 is authoritative).

### Porcelain (write scope)

`git status --porcelain` at start, my write scope:
```
 M packages/core/scripts/build-vertical-artifacts.mjs            (W-B, declared)
 M packages/core/scripts/tenant-channel-consumer-gate.baseline.json
 M packages/core/scripts/tenant-channel-consumer-gate.modern.baseline.json
 M packages/core/src/foundation/contracts/composition/tenants/themes/index.ts
 M packages/core/src/foundation/tokens/css/facade/artifacts/{bithire,evnto,rottay}/_source/extension.css
 M packages/core/src/foundation/tokens/css/facade/artifacts/{bithire,evnto,rottay}/index.css
 M packages/core/src/foundation/tokens/ts/presentation/brand-themes/{bithire,evnto,platform}/index.ts
 M packages/core/src/infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts
 M packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts + tests
 M packages/core/src/infrastructure/compilers/runtime/tenant-css/artifact-renderer/index.ts
```
All dirty from W-A/W-B/W-C of this same wave (my declared input), per
`wb-state.md` / `wc-state.md`. Total repo porcelain: 193 entries (the rest is
the concurrent visual WIP — not touched).

Task-4B skin target `modern/skin/menu.css` and `modern/theme.css`: **CLEAN**
(`git status --porcelain` empty for both). No strictly-necessary-repair
exemption needed.

### Tooling built

- `r1p/scripts/p1/contract-map.mjs` — re-probes the CURRENT contract (post-W-B
  dual-mode fields). Union of 947 leaf paths across 3 themes + 4 fixtures,
  sentinel-substituted per path. Result: **915 verbatim-reachable channels**
  (bithire 921 reachable / evnto 936 / rottay 937). Output
  `closure/remediation/p1-contract-map.json`.
- `r1p/scripts/p1/consumer-census.mjs` — repo-wide `var(--x)` reader census over
  DS core + showroom + the three apps, excluding the declaring artifacts and
  test files. 25,037 distinct referenced vars, 6,539 `--ds-`-prefixed. Output
  `closure/remediation/p1-consumer-census.json`.

### Orphan pre-finding (task 5) — the "orphans" are not orphans

The C6.8-4B orphan list was produced by `tenant-channel-consumer-gate.mjs`,
whose scanner is **DS-`src/`-only** (documented in its own header). Widening the
census to the consuming apps changes four of the six verdicts:

| channel | DS readers | app-bithire readers | reader site |
|---|---:|---:|---|
| `--ds-sidebar-group-margin-top` | 0 | 1 | `vertical/surface/shell/sidebar/styles/index.css:182` |
| `--ds-sidebar-group-padding-top` | 0 | 1 | same file `:183` |
| `--ds-sidebar-item-indent` | 0 | 1 | same file `:226` |
| `--ds-sidebar-group-margin-bottom` | 0 | 0 | — |
| `--ds-sidebar-group-border` | 0 | 0 | — |
| `--ds-duration-slow` | 0 | 10 | `styles/cards-surfaces.css:495,738,785,833-837`, `styles/surfaces.css:238`, 4 command-header CSS files |

`--ds-duration-slow` is additionally NOT uniquely dead: it is one tier of a
closed 5-tier foundation vocabulary declared together in
`foundation/tokens/css/foundation/animations/transitions.css:391-396`, and
**three** of the five tiers have zero DS readers:

| tier | DS readers |
|---|---:|
| `--ds-duration-instant` | 0 |
| `--ds-duration-fast` | 12 |
| `--ds-duration-normal` | 19 |
| `--ds-duration-slow` | **0** |
| `--ds-duration-gentle` | 0 |

Natural DS consumption points for the sidebar five DO exist, all in the clean
`modern/skin/menu.css` (the Modern sidebar IS the Menu — it already reads
`--ds-sidebar-item-height`, `-icon-column-size`, `-item-padding-inline`,
`-child-padding-inline`, `-group-font-size` through the idiomatic
`var(--ds-menu-X, var(--ds-sidebar-X, <literal>))` chain):

- `[data-part='group']` rule, `menu.css:51-56` (`margin-block: 0.5px`)
  → group margin-top / margin-bottom / border
- `[data-part='group-label']` rule, `menu.css:291-303` (`padding-block: 6px 3px`)
  → group padding-top
- child `padding-inline-start` calc, `menu.css:126-129`
  → item indent

Decisions recorded in checkpoint 5.

## Checkpoint 1-3 — classify every declaration (DONE)

`r1p/scripts/p1/classify.mjs` -> `closure/remediation/p1-ledger.{json,md}`.
Totals match the Codex verdict exactly: rottay 1343, bithire 405, evnto 75.

| class | bithire | evnto | rottay |
|---|---:|---:|---:|
| existing-BrandTheme-field | 38 | 11 | 58 |
| component-literal | 73 | 2 | 843 |
| semantic-vocabulary | 59 | 30 | 166 |
| unclassified-semantic (product vocabulary) | 55 | 16 | 2 |
| obsolete (zero readers repo-wide) | 177 | 16 | 273 |
| legitimate-media/reduced-motion | 3 | 0 | 0 |
| non-custom-property | 0 | 0 | 1 |

Five supporting measurements, each its own script + JSON:
`p1-contract-map` (capability), `p1-consumer-census` (reality),
`p1-value-twins` + `p1-alias-coherence` (is a channel an alias?),
`p1-slot-roles` + `p1-role-grammar` (is there a subcontract shape?),
`p1-ds-default-delta` + `p1-ds-declared` (who already owns this?),
`p1-fallback-redundancy` (is it deletable?).

**A state-detection defect was found and fixed mid-flight.** rottay's dark block
selector is `html[data-tenant='rottay']:not([data-theme='light']):not(.light)`,
whose literal text contains `data-theme='light'`. The first pass matched it as
LIGHT, so every rottay dark declaration was compared against the light effective
map. `scripts/p1/state-of.mjs` now strips `:not()` arguments before testing and
is shared by all four dependent scripts. The correction moved rottay's
governed-value-twin count from 912 to 1062 and its coherent-alias count from 34
to 422 — i.e. the first numbers were wrong in BOTH directions, which is why the
verdict is anchored on four independent measurements rather than one.

### Verdict on rottay's generic block (task 2)

Both previously-proposed remedies are measurably wrong, and the ledger says why:

* **Typing it** (Codex's rejected option) — 918 component-literal declarations
  span 253 roles over 54 slots; 138 roles are needed to cover 80%. A closed
  slot x role subcontract is 13,662 fields for 475 real channels: **3.48% dense**.
* **Deriving it** — of 671 distinct rottay props, only
  **89 resolve to exactly one** governed value-twin coherently across both
  modes (median 4 candidates). In a near-monochrome dark palette, value equality
  is collision, not semantics.
* **Deleting it** — **zero** rottay declarations are redundant against their
  consumer's own `var(--X, fallback)` chain.

What it actually is: **394 of its 425 component channels are already declared by
the DS**, 392 of them in `foundation/tokens/css/foundation/themes/default.css`,
whose `:root` block holds 1,429 declarations and whose `html.dark` block holds
**69**. The extension exists because the DS default component layer has no dark
counterpart. That is ONE gap owned by the Modern/foundation token layer (C6.3),
not 671 BrandTheme contract gaps.

`default.css` is outside P1's write scope AND dirty from the concurrent visual
WIP, so P1 does not edit it. P1 instead makes the debt unhideable (checkpoint 4).

## Checkpoint 4 — gate reinforcement (DONE)

`scripts/artifact-provenance-gate.mjs` gains three laws, each with the gate's
established grandfather pattern (current tree green, any NEW instance red):

* **L-G** — a `capability-gap` region declares at most
  `CAPABILITY_GAP_REGION_BUDGET = 10` channels. Regions over budget today are
  grandfathered AT THEIR CURRENT SIZE and may only shrink. This is the hole
  Codex named: layers 1-2 bounded the FILE, so one header could legalize a
  palette.
* **L-H** — no NEW compiler-emitted channel re-declared in an extension, keyed
  by channel NAME. The pre-existing `capabilityGaps` counter is a total, so a
  drained channel could fund a newly re-declared one at constant volume.
* **L-I** — a `capability-gap` region declares custom properties only. A real
  CSS property there is a raw CSS bag no channel name can retire.

Report line extended with `gap debt:` so the debt is printed, not just stored.

Drills in `scripts/artifact-provenance-gate.test.mjs`, **27/27 pass**:

| drill | property proven |
|---|---|
| L-G one-vs-two regions | 16 channels in ONE region is red; the SAME 16 in two is green — volume-neutral, so only the law can see it |
| L-G budget is a number | a region at 10 is green with no baseline; 11 is red |
| L-G grandfather | an over-budget region is recorded at its size, may shrink, may not grow; **splitting it is law-green but trips `ratchet:rules`/`ratchet:bytes`**, so atomization is pinned as a re-seed event |
| L-H channel swap | one emitted channel swapped for another is red at identical `capabilityGaps` |
| L-I raw CSS | `padding: 4px` in a gap is red where `--ds-drill-pad: 4px` is green; a mixed region is still red |
| re-anchored: "no baseline entry" | now also reports `law:redeclared-emitted-channel`, because with no baseline the grandfathered laws allow nothing |

Per-vertical-branch drill (C6.5):
`brand-theme/tests/no-vertical-branch.test.ts`, 3/3 pass. Behavioural first —
one theme compiled under 5 different tenant slugs must produce identical
channels, and bithire's theme under evnto's slug must reproduce bithire's output
exactly while still differing from evnto's own — then structural (no vertical
name in compiler code, comments stripped).

Baseline re-seeded. Gate GREEN, 18 items outstanding, now itemised:

| vertical | over-budget gap regions | re-declared channels | raw-CSS selectors |
|---|---|---:|---:|
| bithire | 4 `[178, 156, 30, 25]` | 2 | 0 |
| evnto | 2 `[63, 11]` | 0 | 0 |
| rottay | 2 `[717, 625]` | 7 | 1 |

## Checkpoint 5 — orphan decisions (DONE)

The premise was wrong: `tenant-channel-consumer-gate.mjs` scans DS `src/` only
(its own header says so), so a channel read by the reference adoption app reads
as dead. Widening the census changed four of six verdicts.

| channel | decision | evidence |
|---|---|---|
| `--ds-sidebar-group-margin-top` | **WIRE** | app-bithire reads it (`vertical/surface/shell/sidebar/styles/index.css:182`); natural point `menu.css [data-part='group']` |
| `--ds-sidebar-group-margin-bottom` | **WIRE** | symmetric half of the same `margin-block` shorthand; wiring one and not the other leaves an incoherent pair |
| `--ds-sidebar-group-padding-top` | **WIRE** | app-bithire `:183`; natural point `[data-part='group-label']` `padding-block` start |
| `--ds-sidebar-item-indent` | **WIRE** | app-bithire `:226` on `.rt-sidebar__group-items`; exact DOM analogue is `[data-part='panel']`, the items container inside `[data-part='group']` |
| `--ds-sidebar-group-border` | **RETIRE** | zero readers in DS, showroom, or any of the three apps. Retired on SHAPE, not taste: it is a compound CSS shorthand (`1px solid #1F1F23`) where every sibling sidebar channel is atomic, so no typed contract can validate it and the DB Appearance path cannot converge on it — the escape-hatch class the brief forbids. The group-separator role is already served by the atomic `--ds-sidebar-border`. |
| `--ds-duration-slow` | **KEEP** | not an orphan: 10 readers in app-bithire, and it is one tier of a CLOSED five-tier foundation vocabulary declared and reduced-motion-zeroed together in `transitions.css:391-411`. `instant` and `gentle` have zero DS readers too, so retiring only `slow` would leave an arbitrary contract behind. No artificial reader added. |

Wiring is in `modern/skin/menu.css` (verified CLEAN before the edit, so no
strictly-necessary-repair exemption was needed). Every fallback is the literal
the rule carried before, so a tenant that sets nothing keeps today's geometry:
`var(--ds-sidebar-group-margin-top, 0.5px)`, `…-margin-bottom, 0.5px)`,
`…-padding-top, 6px)`, `…-item-indent, 0px)`.

**SIGHTED_PENDING**: rottay/bithire/evnto DO author these, so their Modern menu
geometry moves — rottay group margins 0.5px→1px, group label padding-top 6px→3px,
panel indent 0→8px (per-vertical values in the brand themes). That is the point
of wiring a dial, and it is a deliberate, documented change.

Retirement executed end to end: contract field, emitter line, both authoring
brand themes, all three extensions, both consumer-gate baselines.

Causal tests: `brand-theme/tests/sidebar-group-channels.test.ts` (5/5) —
per channel, a typed edit reaches it AND the unedited theme does not contain the
sentinel AND the skin reads that exact channel with the pre-wiring fallback;
plus groupBorder proven absent from contract, emission and skin.
`personality/tests/duration-tiers.test.ts` (2/2) — the five-tier vocabulary is
closed and `transitions.slow` still reaches `--ds-duration-slow`.

**The consumer gate confirms the wiring independently**: after removing all five
baseline entries, its census reports exactly ONE new dead channel
(`--ds-sidebar-group-border`, still emitted by the STALE dist). The four wired
channels do not appear — the gate now sees them consumed.

## Checkpoint 6 — regenerate + acid test (DONE)

Artifacts regenerated with `r1p/scripts/build-artifacts-from-source.mjs`
(dist-backed builder unusable, see flag below); `--check` exit 0.

Effective before/after over all nine states
(`p1-before/effective-before.json` vs `p1-after-effective.json`):

```
bithire default +0 -1 ~0 | light +0 -1 ~0 | dark +0 -1 ~0
evnto   default +0 -1 ~0 | light +0 -1 ~0 | dark +0 -0 ~0
rottay  default +0 -1 ~0 | light +0 -1 ~0 | dark +0 -1 ~0
TOTAL   +0 -8 ~0
```

Every one of the 8 drops is `--ds-sidebar-group-border`. **Zero added, zero
changed, zero unexplained.**

## Verification (one command at a time, serially)

| command | result |
|---|---|
| `node --test scripts/artifact-provenance-gate.test.mjs` | **27/27** |
| `node scripts/artifact-provenance-gate.mjs --seed` | 0 (accepted the decrease) |
| `node scripts/artifact-provenance-gate.mjs --check` | **GREEN**, 18 outstanding |
| `vitest run brand-theme/tests/no-vertical-branch.test.ts` | 3/3 |
| `vitest run brand-theme/tests/sidebar-group-channels.test.ts` | 5/5 |
| `vitest run personality/tests/duration-tiers.test.ts` | 2/2 |
| `vitest run brand-theme/tests/` | **640 passed, 18 files** |
| `vitest run src/foundation/tokens/__tests__/` | 125 passed, 16 files |
| `vitest run artifact-renderer/tests/ + personality/tests/` | 18 passed, 4 files |
| `node r1p/scripts/build-artifacts-from-source.mjs --check` | 0 — 3/3 up to date |
| `node scripts/tenant-channel-consumer-gate.mjs --check` | 1 new dead = the retired channel, dist-stale (see flag) |

No builds, no typechecks, no full suites, no git operations.

## DIST-STALENESS FLAG (carried forward from W-B, now also mine)

`tenant-channel-consumer-gate.mjs` imports the emitter from `../dist`. dist still
contains the `groupBorder` emission I removed from source, so the gate reports
`--ds-sidebar-group-border` as a new dead channel. `pnpm -C packages/core build`
must run before any dist-backed gate in the serial chain; after it, the channel
leaves the inventory entirely. Source equivalence is proven: the source builder
reproduces all three artifacts and `--check` is green.

## Files written

DS (`ui-design-system/packages/core`):
- `scripts/artifact-provenance-gate.mjs` — L-G/L-H/L-I + `gap debt:` report line
- `scripts/artifact-provenance-gate.test.mjs` — 5 new drills, 2 re-anchored
- `scripts/artifact-provenance-gate.baseline.json` — re-seeded (decls down, new inventories)
- `scripts/tenant-channel-consumer-gate.baseline.json` + `.modern.baseline.json` — 5 entries removed each
- `src/foundation/contracts/composition/tenants/themes/index.ts` — `groupBorder` retired
- `src/infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts` — emission removed
- `src/foundation/tokens/ts/presentation/brand-themes/{platform,bithire}/index.ts` — value removed
- `src/foundation/tokens/css/facade/artifacts/{bithire,evnto,rottay}/_source/extension.css` — declaration removed
- `src/foundation/tokens/css/facade/artifacts/{bithire,evnto,rottay}/index.css` — regenerated
- `src/foundation/tokens/css/runtime/engines/modern/skin/menu.css` — 4 channels wired (file was CLEAN)
- NEW `src/infrastructure/compilers/kernel/runtime/brand-theme/tests/no-vertical-branch.test.ts`
- NEW `src/infrastructure/compilers/kernel/runtime/brand-theme/tests/sidebar-group-channels.test.ts`
- NEW `src/foundation/tokens/ts/runtime/personality/tests/duration-tiers.test.ts`

Evidence (`r1p/closure/remediation/`): `p1-state.md`, `p1-ledger.{json,md}`,
`p1-contract-map.json`, `p1-consumer-census.json`, `p1-value-twins.json`,
`p1-alias-coherence.json`, `p1-slot-roles.json`, `p1-role-grammar.json`,
`p1-ds-default-delta.json`, `p1-ds-declared.json`, `p1-fallback-redundancy.json`,
`p1-effective-delta.json`, `p1-after-effective.json`, `p1-before/`.
Scripts: `r1p/scripts/p1/`.

## NOT DONE — handed back with reasons

- **The 466 obsolete declarations are inventoried, not drained.** They are safe
  (zero readers, zero artifact refs, zero test refs) but retiring them is a
  volume drain over the same channels the dark-layer work must move anyway;
  doing it here would force a second acid test over the same surface.
- **Regions are not atomized to <=10.** The drill proves splitting is law-green
  but trips `ratchet:rules` and `ratchet:bytes` — atomization is a re-seed event,
  and re-seeding those two ratchets upward while the real fix (the DS dark
  component layer) has not landed would launder the debt the L-G grandfather now
  records precisely.
- **`foundation/themes/default.css` dark layer** — the actual owner of rottay's
  671 channels. Outside P1 write scope and dirty from the concurrent visual WIP.
