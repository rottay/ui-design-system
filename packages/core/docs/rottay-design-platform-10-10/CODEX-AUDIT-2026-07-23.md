# Codex Audit — Claude Delivery 2026-07-23

Status: **returned for completion — partial implementation, not accepted**

This audit evaluates Claude's overnight delivery against the repository
contracts, not against its handoff narrative. The authoritative status remains
`roadmap/registry.json`; this audit does not change ticket status, `ownerGo`,
ledger acceptance or certified percentages.

## 1. Executive verdict

Claude delivered useful infrastructure and moved the platform forward, but the
tranche does not meet the documented exit criteria.

- The ownership and token-consumer gates are operational ratchets.
- The recipe facade exists and Button, Card and Tabs use it.
- Static BitHire and DB-owned The Management produce materially different
  branding from the same showroom tree.
- EN, ES and AR/RTL render successfully on desktop and mobile.
- The Modern production build and showroom production build pass.
- However, 4,074 application-ownership findings remain baselined rather than
  remediated.
- 119 newly introduced semantic-material channels still have no public rendered
  consumer.
- Tag, SectionCard and DataTable have not migrated to the recipe facade.
- No typed, namespaced and migration-safe `recipeProfile` is present in both
  static `BrandTheme` and DB `Appearance`.
- The required same-tree extreme-recipe proof for the migrated component set is
  absent.

The work is therefore a **foundation tranche**, not a completed or certifiable
wave.

## 2. Certified progress

No new artifact was accepted by the roadmap authority during this audit.

| Basket | Accepted | Total | Certified |
| --- | ---: | ---: | ---: |
| Public primitives | 14 | 92 | 15.2% |
| Full platform basket | 14 | 119 | 11.8% |

Those figures intentionally do not rise because code exists or tests pass. An
artifact only counts after its ticket exit criteria, two-pass review and
evidence package are accepted.

## 3. Ticket-by-ticket assessment

| Ticket | Audit result | Evidence and remaining work |
| --- | --- | --- |
| DS-A002 | **Operational ratchet; not closed** | The ownership scanner is useful and fails on regressions, but its baseline contains 4,074 active findings across 477 files: 49 local SVGs, 296 native interactive elements, 94 primitive reconstructions, 3,308 shared-chrome literals and 327 utility findings. Four explicit exceptions are allowlisted. The gate prevents growth; it does not mean the ownership debt is resolved. |
| DS-A003 | **Material progress; not certified** | Declared/emitted/consumed checks now expose dead channels and supplier leakage more reliably. The tenant-channel gate passes with 1,615 inventoried channels, 355 acknowledged dead channels, zero new and zero revived relative to the audited baseline. Closure still requires an accepted ownership graph and removal or consumption of acknowledged debt. |
| DS-A004 | **Compiler/contracts partial; not closed** | Semantic material declarations compile, but 119 material state channels have no public DS component or surface consumer. They were acknowledged with explicit reasons so the ratchet is honest; they were not hidden or counted as complete. The next wave must attach them to governed public material behavior and shrink the baseline. |
| DS-Q001L | **Generic white-label proof passes; ticket proof missing** | The production matrix proves static BitHire vs DB The Management across desktop/mobile EN/ES/AR and RTL. It does not yet prove the exact required Button/Card/Tabs/Tag/SectionCard/DataTable tree under opposing recipe profiles, including reduced motion and state anatomy. |
| DS-S001 | **Approximately 35% of the exit contract** | The facade and typed recipe axes exist; Button, Card and Tabs migrated (3/6 target families). Tag, SectionCard and DataTable remain. Static and DB theme contracts do not expose a governed `recipeProfile`; compiler, schema, fallback and migration behavior are therefore incomplete. |
| DS-S005 | **Useful partial supplier governance; not closed** | Tailwind Variants provenance and import isolation are guarded. DaisyUI remains a Modern implementation supplier, but obsolete projection names and direct supplier identity still exist in bridge/runtime/artifact paths. The Rottay adapter boundary is not yet exact enough to certify. |

## 4. Corrections applied by Codex

The audit fixed confirmed defects rather than merely reporting them:

- corrected JSX conditional-literal handling in the dead-part scanner;
- removed a dead DataTable sort-direction selector and its unused tenant
  channel;
- repaired viewport/container-query ownership in responsive CSS;
- fixed Tooltip and Popover raw `0s` motion fallbacks;
- removed a false positive from Brand Studio's export preview;
- moved Typography contrast state to a public data contract and completed the
  semantic typography consumption that had real component ownership;
- strengthened recipe typing for boolean/string axes, compound variants,
  unknown-axis rejection and literal-preserving helpers;
- corrected canonical fallback parity;
- replaced dynamic physical Box spacing with explicit logical properties;
- introduced a shared portal-theme transporter for Tooltip and Popover;
- narrowed `ButtonSize` to the actual public size contract;
- wired the search-icon channel to the Modern Input consumer;
- regenerated canonical and vertical CSS artifacts;
- kept the 119 unconsumed material channels visible as explicit debt instead of
  manufacturing no-op aliases.

These fixes preserve the existing authority chain:

```text
static BrandTheme or validated DB Appearance
  -> compiler
    -> canonical --ds-* runtime values
      -> Modern adapter and public DS contracts
        -> application composition and documented local styling
```

No second theme system was introduced.

## 5. Verification record

All heavy commands were run serially.

| Check | Result |
| --- | --- |
| `pnpm --filter @rottay/design-system pretest` | PASS |
| `pnpm --filter @rottay/design-system typecheck` | PASS |
| focused recipe tests | PASS — 6/6 |
| focused governance-gate aggregate | PASS — 24/24 |
| focused component aggregate | PASS — 77/77; existing Card `act()` warnings only |
| `pnpm --filter @rottay/design-system build` | PASS |
| `pnpm --filter @rottay/showroom build` | PASS — 301 static pages |
| production Playwright brand/locale matrix | PASS — 7/7 |

The production browser matrix verified:

- BitHire static theme: Public Sans / Space Grotesk, blue primary, distinct
  radii and shadows;
- The Management DB theme: Optima / Fraunces, beige canvas, teal primary,
  smaller radii and different shadows;
- Arabic mobile at 390 × 844: `dir="rtl"`, Arabic locale, no horizontal
  overflow or clipping.

This is proof that authority, white-label divergence, i18n and RTL are alive.
It is not visual-quality acceptance: the canonical specimen remains too sparse
to demonstrate the intended 10/10 component craft.

## 6. Required next closure

The next implementation wave must:

1. finish DS-S001 end-to-end, including `recipeProfile` in static and DB theme
   contracts, compiler/schema/fallback behavior and all six target families;
2. turn the 119 material channels into observable, governed public behavior and
   reduce the dead-channel baseline accordingly;
3. make the DaisyUI 5 bridge exact and adapter-only without replacing canonical
   `--ds-*` authority;
4. produce the exact DS-Q001L same-tree tenant/locale/direction/motion proof;
5. prevent new private DS-anatomy access from applications while documenting a
   public styling/slot manifest;
6. only then consider the React Aria vs Base UI behavior bake-off.

BitHire Candidates remains a canary. It must not become the place where shared
primitive defects are repaired with page CSS.

## 7. Repository safety

- No commit, push, PR or publication was made.
- Existing dirty-worktree changes and the pre-existing stash were preserved.
- Roadmap status, acceptance counters and owner authorization were not changed.
