# Drain plan — emptying the three static extensions without building a dark layer

Five waves, ordered by dependency, not by size. Every wave ends with the extension
declaration count it must produce, so a wave that "finished" without moving the number
did not finish.

There is no generic dark layer anywhere in this plan and no `themes/default.css` dark
block at the end of it. Rottay looks dark because its palette is dark.

## The ladder

| after wave | rottay | bithire | evnto | total | declarations drained |
|---|---:|---:|---:|---:|---:|
| — (today) | 1342 | 404 | 74 | 1820 | — |
| i — retire | 1069 | 227 | 58 | 1354 | 466 |
| ii — tenant identity | 846 | 131 | 18 | 995 | 359 |
| iii — Modern derivation | 0 | 69 | 16 | 85 | 910 |
| iv — app hooks | 0 | 3 | 0 | 3 | 82 |
| v — residual exceptions | 0 | 0 | 0 | 0 | 3 |

The extensions reach **zero declarations**. That is the acid test in numeric form: after
wave v there is no manual layer left that could override the tenant, so changing tenant
config is the only thing that can change the product.

## Cross-cutting prerequisites (do these before wave i)

1. **Rebuild `dist`.** `tenant-channel-consumer-gate.mjs` imports the emitter from `../dist`,
   which is stale from P1. Every dist-backed gate lies until `pnpm -C packages/core build`
   runs. This is the flag P1 handed forward and it blocks the verification of every wave.
2. **Settle the engine-scope question.** `pc-kimi-skin-worklist.md` shows
   243 of the 491 owner-(b) channels have no Modern reader — they are read only
   by `engines/classic/theme.css` and `engines/rustic/skin/*.css`. If the Modern-only scope law
   holds, those channels are retired with the engines rather than re-derived, and wave iii is
   232 channels instead of 491. This changes wave iii by roughly half; deciding it
   afterwards means doing the work twice.
3. **Land the written-exception law for the gates.** Waves ii–v shrink `capabilityGaps`,
   `ratchet:rules` and `ratchet:bytes` monotonically, which the decrease-only ratchets accept
   without a re-seed. Wave i does too. Nothing in this plan needs an upward re-seed, and any
   proposal that does should be treated as a smell.

## Wave i — retire the no-reader set

**466 declarations, 285 distinct channels** (rottay 273, bithire 177, evnto 16).

* **Prerequisites**: dist rebuild only. This is the P1 obsolete inventory, unchanged: zero
  non-declarer non-test readers anywhere in DS core, showroom, app-bithire, app-evnto or
  app-platform, and P1 already cross-checked artifact references and test references clean.
* **Files**: the three `_source/extension.css`, then regenerate the three `index.css` with
  `pnpm -C packages/core build:vertical-css`.
* **Gates**: `lint:artifacts` (staleness), `artifact-provenance-gate --check` (`capabilityGaps`
  and both ratchets fall — accepted), `tenant-channel-consumer-gate --check` (the retired
  channels leave the inventory), `gate:styles-css`.
* **Risk**: none by construction. The death proof is that no reader exists; the effective-map
  diff across all nine states must show exactly these drops and nothing else, which is the
  same acid test P1 ran for its single retirement.
* **Why first**: it is the only wave with zero visual risk, and it removes a third of the
  volume before anything harder touches the same files.

## Wave ii — tenant identity moves to BrandTheme / Appearance

**359 declarations, 196 distinct channels** (rottay 223, bithire 96, evnto 40).

Split by how much contract work each row needs:

| sub-wave | decls (r/b/e) | channels | what it takes |
|---|---|---:|---|
| **ii-brandtheme-field** | 27 / 24 / 6 | 49 | author the existing typed leaf in the theme `.ts`, delete the extension line — no contract change |
| **ii-chrome-field** | 30 / 13 / 4 | 20 | author the existing chrome section in the theme `.ts`; the emitter already writes the channel |
| **ii-brandtheme-derived** | 78 / 21 / 15 | 54 | delete the extension line and let the compiler derive it (ramp step, alpha wash, tint ladder, type scale). If the derived value differs from the hand-authored one, that is a sighted delta, not a bug |
| **ii-contract-addition** | 88 / 38 / 15 | 73 | add the field to the common contract first, then author it |

* **Prerequisites**: wave i (so the theme author is not re-homing channels that are about to
  be deleted). `ii-contract-addition` needs the common-contract fields to exist, which is the
  73-channel list in `pc-reclassification.md` §3 — dominated by `--ds-color-bg-*`,
  `--ds-color-border-*`, `--ds-surface-*` and the interaction-state channels
  (`--ds-color-bg-hover` / `-active` / `-disabled`, `--ds-color-border-hover` / `-focus`), which no
  tenant can express today.
* **Files**: `foundation/tokens/ts/presentation/brand-themes/{platform,bithire,evnto}/index.ts`,
  `foundation/contracts/composition/tenants/themes/index.ts`,
  `infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts`, the three
  extensions, regenerated artifacts.
* **Gates**: `artifact-provenance-gate` L-H (a channel moving from extension to emitter must not
  read as a NEW re-declared channel), `tenant-channel-consumer-gate` + `.modern.baseline.json`,
  `lint:artifacts`, `build-vertical-artifacts.apca-baseline.json` (contrast, because moving a
  hand-tuned ink onto a derived ramp step can cross an APCA threshold), the brand-theme test
  suite including `no-vertical-branch.test.ts`.
* **Risk**: `brandtheme-derived` is where pixels move. The tenant hand-authored ramp steps
  because the derived ones did not match; accepting the derivation is the decision the
  correction implies, and it needs a sighted pass per tenant.

### ii-default — de-tenant `themes/default.css` (same wave, strictly after ii above)

`pc-default-css-audit.md` finds **112 channels in `:root` byte-identical to Rottay's own
authored values** (73 against Rottay's dark arm), including `--ds-color-text-muted: #96969E`
with 5,592 readers. Rule 9 is violated today.

* **Order matters**: the Rottay `BrandTheme` must carry those values BEFORE they leave `:root`,
  or Rottay repaints to whatever is left. So: author in the theme → delete from the extension →
  delete from `:root`, in that order, verified by an effective-map diff after each step.
* `html.dark` (70 declarations, Tailwind slate-navy, authored by no tenant) is deleted, not
  extended — but only after wave iii, because today it is the only thing standing between
  bithire's dark mode and the white `:root` defaults for 36 of its channels (evnto:
  53). Deleting it early makes those surfaces white; deleting it after the tenant
  palettes and the Modern derivations cover them makes it a no-op.
* 153 chromatic literals over 60 distinct values (the Tailwind status hues) become palette-contract
  fields in the same pass.

## Wave iii — component paint becomes a Modern derivation

**910 declarations, 467 distinct channels** (rottay 846, bithire 62, evnto 2).
The per-file worklist is `pc-kimi-skin-worklist.md`.

| confidence | channels | how it lands |
|---|---:|---|
| exact | 209 | batch; one sighted check for the whole batch, because by measurement nothing repaints |
| close | 269 | per-file sighted review; each one moves pixels deliberately |
| needs-design | 13 | blocked on a design call; listed individually in `pc-reclassification.md` §4 |

* **Prerequisites**: wave ii, and not negotiably. Of rottay's owner-(b) rows,
  **348 derive from a target that exists only because the extension declares it**
  (bithire 18). Writing those derivations before wave ii lands produces a var() chain
  pointing at a channel that is about to be deleted. A further
  18 rottay rows target a channel that is not reachable from the contract at all —
  those are gated on `ii-contract-addition` specifically.
* **Files**: 44 Modern/presentation files and 7 TS component token maps (see the worklist);
  9 of them are dirty from the concurrent visual wave and need a read-before-edit.
* **Gates**: `csspaint:check` (`css-layer-paint-gate`), `csssource:check`, `engine-audit:check`
  (path-keyed paint counters — a derivation added to a skin changes them), `container-query-gate`,
  `artifact-provenance-gate` L-G (the gap regions shrink toward and past their grandfathered
  sizes), the anatomy CSS budgets (decrease-only).
* **Risk**: highest of the five. This is where the product visibly becomes tenant-derived.
  The 7 `chained` bithire channels (`--ds-control-*`, `--ds-button-danger-bg`) must land after
  the channels they read, so order within the wave matters too.
* **The rule that makes it real**: the derivation goes into the skin and the extension line is
  deleted in the same change. A derivation added while the extension still declares the channel
  is invisible — the extension wins on specificity — and would pass every gate while changing
  nothing.

## Wave iv — app-specific rows leave the DS

**82 declarations, 77 distinct channels** (bithire 66, evnto 16; rottay has none).

* **Clean**: everything read only by the consuming app moves to an app-owned `--rt-*` name or a
  declared public hook. bithire's `--ds-list-preview-*`, `--ds-detail-*`, `--ds-action-rail-*`,
  `--ds-expanded-panel-*`, `--ds-insight-panel-*`, `--ds-breadcrumb-bar-*`, `--ds-cell-pill-*`.
* **Blocked**: product vocabulary that DS core still reads —
  bithire: 10 channels (`--ds-premium-*`), 135 DS readers.
  evnto: 16 channels (`--ds-ticket-*`, `--ds-event-*`), 16 DS readers.
  `--ds-premium-card-*` alone has 135 DS-core reads across the metrics-card skins. CLAUDE.md says
  this vocabulary belongs to the app; the DS readers have to be renamed to a domain-agnostic
  channel before the move, which is DS work, not app work.
* **Prerequisites**: none for the clean set — it can run in parallel with wave iii. The blocked
  set needs the DS-side rename first.
* **Files**: the two extensions, plus `app-bithire` / `app-evnto` (outside DS write scope; this
  wave is a hand-off, not a DS-only change).
* **Gates**: `app-ds-boundary-gate`, `app-ds-hook-contract-gate`, `lint:vertical`.

## Wave v — residual exceptions

**3 declarations** — bithire's three `@media (prefers-reduced-motion: reduce)` overrides.

* An at-rule context cannot be expressed as a channel value, so these are the only rows with a
  genuine claim to stay. The disposition is a decision, not a measurement:
  * **retire** if the Modern motion vocabulary already zeroes these tiers under reduced motion
    (`transitions.css` does zero the five duration tiers together, so this is likely), or
  * **keep** as a governed exception with a named owner and a written retirement condition, in a
    region of at most three declarations so L-G stays honest.
* **Gates**: `artifact-provenance-gate` L-I (a gap region declares custom properties only — these
  do), plus the reduced-motion tests.

## What each wave proves

| wave | the claim it must survive |
|---|---|
| i | effective-map diff over all nine states shows exactly the retired channels dropping and nothing else |
| ii | a tenant config edit reaches the channel, and the unedited theme does not contain the sentinel — the causal test shape P1 already used |
| ii-default | `:root` contains no colour literal that any tenant also authors for the same channel; the same-channel-same-value count goes to zero |
| iii | BitHire-static and The-Management-DB render radically differently on the same Modern tree, and no component file mentions a tenant slug |
| iv | the DS builds and renders with the app channels absent |
| v | reduced motion still zeroes what it zeroed, with at most a three-declaration governed region left |

The central acid test only becomes runnable after wave iii, and it is the one that matters:
changing only tenant config changes the whole product, no manual extension overrides it, no
Rottay colour is a global default, and no component knows a tenant slug.

