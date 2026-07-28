# Drain plan v2 — Modern scope

Same five waves as v1, re-sized after the scope filter in `pc-scope-decision.md`. The
extension total is unchanged at 1,820 declarations; what changed is that **508 of them are
not Modern work** and are held out into a sixth wave that needs an owner decision before it
can be planned at all.

There is no generic dark layer anywhere in this plan and no `themes/default.css` dark block
at the end of it. Rottay looks dark because its palette is dark.

## The ladder — Modern scope

Waves i–v drain the 1312 in-scope declarations (rottay 844, bithire 395, evnto 73). The 508
Classic/Rustic-only declarations (rottay 498, bithire 9, evnto 1) are held out until wave vi, so
the last two columns — what is actually left in the files on disk — do not reach zero until
then.

| after wave | rottay | bithire | evnto | in scope | held out | **on disk** | drained |
|---|---:|---:|---:|---:|---:|---:|---:|
| — (today) | 844 | 395 | 73 | **1312** | 508 | **1820** | — |
| i — retire | 571 | 218 | 57 | **846** | 508 | **1354** | 466 |
| ii — tenant identity | 376 | 122 | 17 | **515** | 508 | **1023** | 331 |
| iii — Modern derivation | 0 | 69 | 16 | **85** | 508 | **593** | 430 |
| iv — app hooks | 0 | 3 | 0 | **3** | 508 | **511** | 82 |
| v — residual exceptions | 0 | 0 | 0 | **0** | 508 | **508** | 3 |
| vi — legacy disposition | 0 | 0 | 0 | **0** | 0 | **0** | 508 |

The in-scope extensions reach zero after wave v. The files on disk do not — 508 declarations
survive until wave vi is decided. Any acid test that asserts a zero byte count before wave vi
will fail, and that is correct behaviour, not a regression.

## What moved between v1 and v2

| wave | v1 declarations | v2 declarations | delta |
|---|---:|---:|---:|
| i — retire | 466 | 466 | 0 |
| ii — tenant identity | 359 | 331 | -28 |
| iii — Modern derivation | 910 | 430 | -480 |
| iv — app hooks | 82 | 82 | 0 |
| v — residual exceptions | 3 | 3 | 0 |
| vi — held out | — | 508 | +508 |

Wave iii loses 480 declarations — **53% of the Modern derivation work was never Modern
work**. Wave ii loses 28. Waves i, iv and v are untouched: nothing that retires, hooks into an
app, or sits behind an at-rule turned out to be legacy-engine-only.

## Cross-cutting prerequisites (do these before wave i)

1. **Rebuild `dist`.** `tenant-channel-consumer-gate.mjs` imports the emitter from `../dist`,
   which is stale from P1. Every dist-backed gate lies until `pnpm -C packages/core build`
   runs. Unchanged from v1, and still the flag P1 handed forward.
2. **The engine-scope question is now measured, not open.** v1 listed this as a prerequisite
   against a 243 figure. `pc-scope-decision.md` measures it: 508 declarations / 257 channels
   are Classic/Rustic-only. What remains open is their *disposition* (wave vi), which blocks
   nothing in waves i–v.
3. **Land the written-exception law for the gates.** Waves ii–v shrink `capabilityGaps`,
   `ratchet:rules` and `ratchet:bytes` monotonically, which the decrease-only ratchets accept
   without a re-seed. Wave i does too. Nothing in this plan needs an upward re-seed, and any
   proposal that does should be treated as a smell.

## Wave i — retire the no-reader set

**466 declarations, 285 distinct channels** (rottay 273, bithire 177, evnto 16). Unchanged from v1.

* **Prerequisites**: dist rebuild only. Re-verified live: all 285 channels still have zero
  non-declarer non-test readers across DS core, showroom, app-bithire, app-evnto and
  app-platform. Not one of them gained a reader since the census.
* **Files**: the three `_source/extension.css`, then regenerate the three `index.css` with
  `pnpm -C packages/core build:vertical-css`.
* **Gates**: `lint:artifacts`, `artifact-provenance-gate --check`,
  `tenant-channel-consumer-gate --check`, `gate:styles-css`.
* **Risk**: none by construction. The death proof is that no reader exists.
* **One correction to carry in**: `--ds-card-side-accent` (bithire) is classified owner (c)
  app-hook on the strength of six app-bithire readers that no longer exist. Live count is
  zero. It belongs in this wave, which would make it 467 declarations. Confirm before
  executing rather than assuming either way.

## Wave ii — tenant identity moves to BrandTheme / Appearance

**331 declarations, 182 distinct channels** (rottay 195, bithire 96, evnto 40) — 28 fewer than v1.

The 28 removed are rottay tenant-identity channels (14 distinct) that no Modern surface
reads. They are the part of the scope finding the Kimi worklist could not see, because the
worklist only ever covered owner (b).

| sub-wave | decls (r/b/e) | channels | what it takes |
|---|---|---:|---|
| **ii-brandtheme-field** | 27 / 24 / 6 | 49 | author the existing typed leaf in the theme `.ts`, delete the extension line — no contract change |
| **ii-chrome-field** | 30 / 13 / 4 | 20 | author the existing chrome section in the theme `.ts`; the emitter already writes the channel |
| **ii-brandtheme-derived** | 76 / 21 / 15 | 53 | delete the extension line and let the compiler derive it. If the derived value differs from the hand-authored one, that is a sighted delta, not a bug |
| **ii-contract-addition** | 62 / 38 / 15 | 60 | add the field to the common contract first, then author it |

* **Prerequisites**: wave i. `ii-contract-addition` needs the common-contract fields to exist
  — now 60 channels rather than v1's 73, dominated by `--ds-color-bg-*`,
  `--ds-color-border-*`, `--ds-surface-*` and the interaction-state channels
  (`--ds-color-bg-hover` / `-active` / `-disabled`, `--ds-color-border-hover` / `-focus`).
* **Files**: `foundation/tokens/ts/presentation/brand-themes/{platform,bithire,evnto}/index.ts`,
  `foundation/contracts/composition/tenants/themes/index.ts`,
  `infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts`, the three
  extensions.

## Wave iii — Modern semantic derivation

**430 declarations, 224 distinct channels** (rottay 376, bithire 53, evnto 1) — **less than half of v1's 910**.

This is the wave the scope filter reshapes. The worklist is
`pc-kimi-skin-worklist.v2.{json,md}`: 247 entries across 59 owning files, 115 exact /
127 close / 5 needs-design, 9 of the files dirty from the concurrent visual WIP.

* **Prerequisites**: waves i and ii — a derivation must resolve over channels the tenant
  actually governs, which is only true after wave ii lands the contract additions. 4
  entries are explicitly contract-blocked and cannot start earlier.
* **Risk**: this is the only wave that repaints. 55 entries carry a visible delta and
  19 are unknown (shadow and gradient expressions D3 cannot diff). Those need a sighted
  check, not a numeric one.
* **Do not** write derivations into files that do not read the channel. The 244 removed
  entries are exactly that mistake caught before it was made.

## Wave iv — app hooks

**82 declarations, 77 distinct channels** (rottay 0, bithire 66, evnto 16). Unchanged from v1.

Product vocabulary that belongs to the consuming app, republished as an app-owned `--rt-*`
hook or a documented public channel.

## Wave v — residual governed exceptions

**3 declarations** (bithire only), the reduced-motion at-rule block. Unchanged from v1.

## Wave vi — the legacy-engine disposition (BLOCKED on an owner decision)

**508 declarations, 257 distinct channels** (rottay 498, bithire 9, evnto 1).

Every live reader of these sits inside Classic or Rustic engine territory. Two dispositions
are coherent and they are not equivalent:

* **Retire with the engines.** If the Modern+BitHire scope law means Classic and Rustic are
  not shipped product, these are a tenant hand-painting engines nobody runs, and they delete
  alongside the engines. Wave vi collapses into wave i and the extensions reach zero.
* **Re-derive into the legacy skins.** If Classic and Rustic stay supported, the same
  derivation work has to be written a second time, into `classic/theme.css` and the
  33 Rustic skin files. `removedForScope` in `pc-kimi-skin-worklist.v2.json` already
  carries the proposals (94 exact / 142 close / 8 needs-design), so this is costed, not
  unknown.

The decision does not block waves i–v. It does block any claim that the extensions are empty.
