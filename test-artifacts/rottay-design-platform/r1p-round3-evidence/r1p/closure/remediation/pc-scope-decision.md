# Scope decision — which channels are Modern work and which are not

The Modern+BitHire scope law says the audit covers the Modern engine and app-bithire.
It does not say what to do with a tenant channel that only the Classic or Rustic engine
reads. `pc-kimi-skin-worklist.md` raised that as an open question against a **243** figure
and stopped. This measures it and closes it.

The answer is not a single number, because "243" and "the channels that are out of Modern
scope" turn out to be two different sets. Both are reported below.

Row identity changed at the same time. `pc-reclassification.v2.json` keys every row on
`vertical | normalized selector | property | occurrence-index`; line and column survive as
informational columns only. They had to: **951 of the 1,820 v1 rows carry a line number that
is off by one against the file they describe**, because v1 inherited its lines from
`p1-ledger.json` (measured 19:49) while the three sources were edited at 20:03 to delete
`--ds-sidebar-group-border` from each. Every row after that deletion point in each file
shifted. All 1,820 rows re-matched to the re-parse with zero unmatched.

## 1. Method

A channel is **out of Modern scope** when *every* live reader of it sits inside
Classic/Rustic territory. Territory is both halves of those two engines:

| counts as Classic/Rustic territory | why |
|---|---|
| `foundation/tokens/css/runtime/engines/classic/**` | the Classic engine's CSS layer |
| `foundation/tokens/css/runtime/engines/rustic/**` | the Rustic engine's CSS layer |
| `ui/**/engines/classic/**` | the React implementations that CSS layer dresses |
| `ui/**/engines/rustic/**` | same, for Rustic |

Excluding the React half would be arbitrary: a channel whose only reader is
`ui/primitives/display/Badge/engines/classic/index.tsx` is no more Modern work than one
read by `classic/theme.css`. Everything else is in scope — the Modern CSS engine,
`ui/**/engines/modern/**`, engine-agnostic DS source (`ds-shared`: primitives, patterns,
`presentation/components/**`), the showroom, and the three apps.

Measurement re-ran the P1 census scan (same five roots, same file filter, same
`var\(\s*(--[A-Za-z0-9_-]+)` regex, same declarer and test exclusions) but recorded the
**full** reader file list per channel. `p1-consumer-census.json` caps `files` at eight
samples per channel, so it cannot answer a location question on its own; it was used as the
cross-check instead. Over the 1,028 channels in the reclassification the re-scan reproduces
the census `real` count and `byRoot` split for **1,023**. The five that differ are real tree
movement since the census ran at 19:45, verified one by one:

| channel | census | live | what changed |
|---|---:|---:|---|
| `--ds-sidebar-group-margin-top` | 1 | 2 | `modern/skin/menu.css:63` now reads it (P1 checkpoint 5 wired the sidebar five) |
| `--ds-sidebar-group-margin-bottom` | 0 | 1 | `modern/skin/menu.css:64` |
| `--ds-sidebar-group-padding-top` | 1 | 2 | `modern/skin/menu.css:303` |
| `--ds-sidebar-item-indent` | 1 | 2 | `modern/skin/menu.css:295` |
| `--ds-card-side-accent` | 6 | **0** | the six app-bithire readers are gone; the only surviving near-match is `--ds-card-side-accent-soft`, a different channel |

None of the five changes a scope verdict. The last one changes an *ownership* verdict and is
flagged in §5.

## 2. The measured count

Every channel lands in exactly one of three states:

| state | channels | declaration rows | disposition |
|---|---:|---:|---|
| `classic-rustic-only` — every live reader is in Classic/Rustic territory | **257** | **508** | out of Modern scope |
| — of those, readers only in the two engines' **CSS** layers | 239 | — | |
| — of those, readers also include a Classic/Rustic **React** engine file | 18 | — | |
| `modern-scope` — at least one reader outside that territory | 482 | 842 | Modern work |
| `no-reader` — zero live readers repo-wide | 289 | 470 | already owner (d) retire |
| **total** | **1028** | **1820** | |

The Modern worklist in §3 and §4 is everything that is **not** `classic-rustic-only` —
`modern-scope` plus `no-reader`, 1,312 rows. The zero-reader set stays in the drain plan
because retiring it is Modern-scope work even though nothing reads it.

**The 243 in `pc-kimi-skin-worklist.md` does not survive re-measurement as stated.**
It is not "channels whose only readers are Classic/Rustic". It is the count of worklist
entries whose *highest-tier reader* is a Classic/Rustic file — a weaker test that says
nothing about the lower-tier readers. Reconciled:

| | |
|---|---:|
| worklist `legacy-engine-only` entries | 243 |
| — distinct channels behind them (two appear in two verticals) | 241 |
| — that still have **no Modern reader** on re-measurement | 241 (all) |
| — that pass the territory test above | **237** |
| — that fail it, because a live reader sits outside both engines | **4** |
| entries in *other* worklist buckets that pass the territory test | 6 |
| **entries actually removed from the Modern worklist** | **244** (243 distinct channels) |

The 243 → 244 near-match is two offsetting corrections landing one apart, not agreement:
five entries leave the legacy bucket and six enter it, and both moves trace to the same
flaw — a bucket assigned from the single highest-tier reader cannot see the others.

### The 4 that must stay

These have no Modern *engine* reader, but they are read outside both engines, so a
Modern-scope derivation still has to exist for them:

| channel | non-legacy reader | root |
|---|---|---|
| `--ds-drawer-header-border` | `ui/primitives/feedback/Drawer/compound/Header/index.tsx` | engine-agnostic DS compound |
| `--ds-drawer-footer-border` | `ui/primitives/feedback/Drawer/compound/Footer/index.tsx` | engine-agnostic DS compound |
| `--ds-button-secondary-hover-bg` | `app-bithire/src/styles/detail-chrome.css` | app-bithire — in scope by the scope law itself |
| `--ds-button-default-hover-bg` | `app-bithire/src/styles/detail-chrome.css` | app-bithire |

They account for 5 worklist entries (`--ds-button-secondary-hover-bg` is declared by both
bithire and evnto). Their worklist owning file is still a Classic/Rustic file, which is now
wrong — recorded as `retainedReason` + `suggestedOwningFile` on each entry in
`pc-kimi-skin-worklist.v2.json`, not silently reassigned.

### The 6 the worklist put in the wrong bucket

Six entries the worklist filed as `react-component` (tier 8) have a Classic/Rustic React
engine file as their *only* reader, so they are legacy work by the same rule that removed the
other 237: `--ds-page-shell-subtitle-color`, `--ds-badge-text-color`, `--ds-badge-height`,
`--ds-tooltip-z-index`, `--ds-toggle-track-bg-checked`, `--ds-upload-progress-bar`.

## 3. Owner table, Modern scope only

Declaration rows. A channel declared in both a dark and a light arm counts twice; the
channel column is what the work is actually sized in.

| new owner | rottay | bithire | evnto | total | distinct channels |
|---|---:|---:|---:|---:|---:|
| (a) BrandTheme / Appearance | 195 | 96 | 40 | **331** | 182 |
| (b) Modern semantic derivation | 376 | 53 | 1 | **430** | 224 |
| (c) app `--rt-*` / public hook | 0 | 66 | 16 | **82** | 77 |
| (d) retire | 273 | 177 | 16 | **466** | 285 |
| (e) governed small exception | 0 | 3 | 0 | **3** | 3 |
| **total** | **844** | **395** | **73** | **1312** | |

Removed from that table by the scope filter:

| new owner | rottay | bithire | evnto | total | distinct channels |
|---|---:|---:|---:|---:|---:|
| (a) BrandTheme / Appearance | 28 | 0 | 0 | **28** | 14 |
| (b) Modern semantic derivation | 470 | 9 | 1 | **480** | 243 |
| **total** | **498** | **9** | **1** | **508** | **257** |

Two things worth reading off that second table. The scope filter is **almost entirely a
rottay finding** (498 of 508 rows) — rottay is the tenant that hand-painted the legacy
engines. And it is not purely owner-(b) work: **28 owner-(a) rows** (14 channels) are tenant
*identity* channels no Modern surface reads. Those were never in the Kimi worklist, so the
worklist question and the drain-plan question do not have the same answer.

## 4. Before / after

| | before | after | delta |
|---|---:|---:|---:|
| worklist owning files | 93 | 59 | -34 |
| worklist entries | 491 | 247 | -244 |
| distinct channels | 467 | 224 | — |
| exact-confidence entries | 209 | 115 | -94 |
| close-confidence entries | 269 | 127 | -142 |
| needs-design entries | 13 | 5 | -8 |
| dirty (WIP) files to rebase | 9 | 9 | 0 |

The Modern derivation wave halves: **910 → 430 declaration rows**. Every removed file is a
Rustic skin or a Classic/Rustic React engine file; **not one Modern file loses a channel**,
which is the check that the filter did not cut into the work it was meant to keep.

## 5. What this does not decide

* **The disposition of the 508 out-of-scope rows is an owner call, not mine.** Removing them
  from the *Modern* worklist says only that they are not Modern derivation work. Whether
  they retire with the engines or get re-derived if Classic/Rustic stay supported is the
  open question `pc-drain-plan.md` §2 raised, and it is still open. `pc-drain-plan.v2.md`
  holds them out as a sixth wave rather than assuming either answer.
* **`--ds-card-side-accent` needs re-classification.** It is owner (c) app-hook on the
  strength of six app-bithire readers that no longer exist. On live measurement it has zero
  readers, which is owner (d) retire. One row, bithire. Not changed here — the v2 file
  carries the v1 verdict plus `readersFresh: 0` and `readerDriftFromCensus: -6` so the
  correction is visible rather than silent.
* Three further rows read `no-reader` in the v2 scope column while carrying a non-(d)
  owner (`--ds-signal-card-top-line-display`, `--ds-card-shadow-elevated`, and the one
  `color` non-custom-property row). Those are not drift: all three had zero readers in the
  census too, and v1 classified them by capability rather than by reader count.

## 6. Provenance

Inputs: the three `_source/extension.css` (mtime 2026-07-27 20:03), `pc-reclassification.json`,
`pc-kimi-skin-worklist.json`, `p1-consumer-census.json`. No source file was read for anything
but measurement and no file outside this directory was written.
