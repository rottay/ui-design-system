# Kimi K3 — Token Namespace Addendum (correction audit, advisory)

Date: 2026-08-14. Auditor: Kimi K3 (independent, read-only). Corrects the DT simplification
"only `--ds-*` is legal" per owner ruling: `--ds-*` is the public canon; `--_ds-*` are
private/provisional channels under evaluation for promotion, derivation or retirement — not
automatically illegal. Sources read in full: modern-rescue `README.md`, `program/index.json`,
`customization-model/index.json`, `manifest/schema.json`, `manifest/rules.mjs`, `evidence-contract/index.json`,
`quality-rubric/index.json`, `art-direction/index.json`, `visual-craft/index.json`,
`manifest/controls/*` (20 files), my 2026-08-14 massive audit, and the DT consensus of the same
date. This file is the only write.

VERDICT: ACCEPT the owner correction as architecture. It is not a relaxation — it is the reading
the active contracts already enforce. The two-namespace model below is finite and machine-checkable.

## 0. The correction is already machine law

- `manifest/rules.mjs:34`: `CHANNEL_PREFIXES = ['--ds-', '--_ds-', 'data-']` (frozen, enforced).
- `manifest/schema.json#vocabulary.channelPrefixes`: identical triad; `channelReplacementStates`:
  `LIVE | REQUIRED_ADDITION | RETIRED`; `internalChannelLaw`: a channel retired anywhere may not be
  LIVE elsewhere; a non-RETIRED channel needs a producer and ≥1 productive consumer.
- Live tree: 483 unique `--_ds-*` names in `packages/core/src` (e.g. `--_ds-gantt-milestone-fill`,
  `--_ds-heatmap-ramp-low/high`, `--_ds-ascii-diagram-grid-size`, `--_ds-chart-reveal-duration`) —
  family/instance sockets already in productive use.
- Fences never forbade `--_ds-*`: README forbids minting *public* `--ds-*` (`No family writer mints
  public --ds-* channels`); `creativeProposal.forbiddenInitialDestinations` bans `new-public-token`
  while `allowedInitialDestinations` explicitly allows `component-private` and
  `temporary-family-prototype`; art-direction: "A visual lane may create a private proposal but
  never a public --ds-* token."

## 1. Controls: 13 Standard + 7 Pro operational vs the proposed target

Operational (capability registry is the only authority; `customization-model/index.json#standard.current`,
`#pro.capabilities`): 13 Standard — palette.seeds, typography.pairing/families/scale,
shape.radius-scale, shape.button-style, density.mode, spacing.rhythm, motion.dial,
surfaces.elevation-posture, surfaces.effect-intensity, navigation.sidebar-tone, experience.profile —
plus 7 Pro capabilities — chrome.families, chrome.anatomy, token-overrides, recipe-profile,
profiles.expressive, profiles.icon, responsive.posture. Frontier candidate `palette.status-seeds`
gated by seven written conditions.

Target (`#targetControlModel`, `PROPOSED_NOT_IMPLEMENTED`): 9 Standard (brand.color-seeds,
shape.geometry, layout.density, spacing.rhythm, surface.edge, surface.depth, type.voice,
type.weight, focus.identity) + 7 Pro (motion.energy/character, type.foundations, iconography.style,
chrome.suite, surface.motif, control.size). Law: one model operational at a time; adoption is an
atomic migration with predecessor retirement (migrationOrder names spacing.rhythm
ACTIVE_CALIBRATION, surface.edge BLOCKED_ON_PRODUCT_ADJUDICATION, brand.color-seeds
PENDING_GLOBAL_CLOSURE, motion.character PROPOSED_ONLY). A proposed name never counts as coverage
and never coexists beside its operational equivalent. Caps without owner decision: 15 Standard /
12 Pro IDs; Pro editor projection 20–30 fields grouped from the 7 capabilities, not new IDs.

## 2. No thousand-token exposure: closed dials, many families

The public product surface is closed dials with stops and calibrations; internal channels are
unbounded in count but bounded in ownership. Evidence: `program/index.json#currentImpactTruth` counts
4,398 operational tokens (38 exact / 836 inferred / 3,524 unknown — a deficit baseline, not a
product surface); the Expert tier is a "searchable domain browser with preview, not 294 sliders"
(294-entry exact allowlist, ≤200 overrides per document, nine admission requirements per new
entry); Standard controls must move >1 property group across ≥3 UI layers with zero component
reading tenant/profile (`standardGlobalRequirements`); exemplar `controls/spacing.rhythm.json`:
closed enum {tight 0.85, normal 1, airy 1.2}, bounds 0.8–1.25 enforced in the derived channel so
the envelope binds artifact, BrandTheme lowering and raw tokenOverride alike. Cardinality law: one
control → one semantic lowering authority → many governed internal channels → many families; many
consumers per channel, never competing semantic owners.

## 3. Namespace law (corrected)

- `--ds-*` — public canon. Universal names only; no product/vertical dialects (event, ticket,
  dashboard, `--rt-*`, slug-derived) in contracts, keypaths or emitted channels. Minting requires
  contract authority; family/visual lanes may never mint here.
- `--_ds-*` — private/provisional. Legal landing zone for evaluation: component-private values,
  family prototypes, instance sockets. Lifecycle, fail-closed each way:
  PROMOTE → public `--ds-*` via the owning contract (control declaredOutputs or Advanced allowlist
  entry, with the nine new-entry requirements); DERIVE → folded into the compileTheme derivation
  law and re-emitted as a governed `--ds-*` channel with one semantic owner; RETIRE → death proof
  per `quality-rubric/index.json#cssOwnershipContract.retirementLaw` (attribution, consumer census,
  successor, source-to-generated reconciliation). A provisional channel that never exits the
  lifecycle is a defect (dormant), not a namespace violation.
- `data-*` — root-attribute axis, third governed prefix.
- What remains forbidden (unchanged): dialect vocabulary in the PUBLIC namespace; tenant selectors;
  a second authority. `--_ds-*` never appears in public contracts, control declaredOutputs, or
  Theme keypaths — it is not an escape hatch for vertical identity, which the mirror law reserves
  to Theme values/dispositions.

## 4. Five different mechanisms, kept distinct

1. Public controls (20 control files): semanticOwner registry + digest, domain/stops, dual ingress
   (`staticBrandThemePath` / `dbTenantThemePath`), declaredOutputs. Product dials.
2. Semantic Theme keypaths: the total nested Theme (palette/typography/surfaces/motion/chrome/…)
   each transport resolves to; authored intent, mirrored across the three first-party sources.
3. Derived component channels: deterministic `--ds-*` outputs of compileTheme from semantic roles
   and recipes (the DT's derivation ruling); one semantic owner per channel; the destination of the
   1,224-declaration drain.
4. Private sockets: `--_ds-*`, family/instance-scoped, per §3 lifecycle.
5. Instance/recipe APIs: typed props, slots, root attributes, and closed recipe/anatomy
   vocabularies owned by `manifest/groups/*`; structural choices (table vs cards, anatomy, rails)
   must not be encoded as CSS tokens (README mechanism law; cellMechanisms:
   THEME_CONTROL / RECIPE_OR_ANATOMY / INSTANCE_API).

## 5. Static/DDB: total transport equality, one model

DT laws 1–6 stand and match program invariants ("one static and DB normalization model";
binaryContracts `static-db-parity-for-controls-in-scope`; KPI `pathParity` roundExit = 1): both
transports resolve to the same total Theme; ThemePatch exists only at ingestion and never reaches
the compiler; one compileTheme lowers; equivalent values → identical inventory/keypaths/order/CSS/
digest; metadata never influences lowering. The subset/intersection parity test certifies the
wrong law and is replaced by total equality + round-trip (T0). The `--_ds-*` correction does not
weaken this: private sockets are downstream of lowering and must also resolve identically per
transport, since they read the same derived channels.

## 6. Manifest 255/5,100 reconciliation after drain/severance

Denominator stays fixed (255 families, 5,100 cells; T9). Reconciliation is by channel identity and
ownership, per family cell `internalChannels` fields (channelId, semanticOwner, producer,
fallbackAuthority, productiveConsumerFamilyIds, sourceBindings, replacementDisposition). The drain
changes producers (extension → compileTheme derivation) and dispositions (RETIRED entries die with
death proof; REQUIRED_ADDITION only through contract authority); it does not add families or cells
and awards no progress by itself (`skeletonsCountAsProgress: false`, UNKNOWN blocks certification).
Order: channel identities stabilize (T0–T8) → manifest regenerate (generator owns rollups;
`bootstrapNeverOverwrites`, `syncNeverDeletes`) → cells become provable per cohort with
COMPUTED_DELTA + EXACT_RESTORE + SIGHTED receipts. `--_ds-*` channels enter cells only as family
internalChannels with producer+consumer, never as public control outputs.

## 7. Corrections to my 2026-08-14 audit and to the DT consensus

- My §12 (SEV-RECEIPT-MODE as new taxonomy): WITHDRAWN. DT ruled it a misread of the atom name;
  Fable is authoritative for that microfix (ACCEPT, 0/0). No new SEV taxonomy proposed here.
- My §2 target phrasing "universal `--ds-*` only" and the DT's law 8 "the only token namespace is
  universal `--ds-*`": both corrected per owner — the public namespace is `--ds-*`-only; `--_ds-*`
  is the governed private/provisional namespace (schema-enforced), and `data-*` the attribute axis.
- My C6 verdict (event/ticket): aligned to DT T7 — delete dead, map live intent to universal
  status/badge roles, never retain or relocate dialect names. Unchanged in substance.
- My P0-1 stands, narrowed: the violation is dialect vocabulary in public channels
  (`--rt-*` reads, `--ds-event-*`, `--ds-ticket-*`), not the existence of non-`--ds-` channels.
- My §3 mapping of ThemePatch refined: it is an ingestion-only recursive partial that fails closed
  (unknown keys, missing base, bad schema version) and never reaches compileTheme.
- My cohort law clarified: family lanes may land evaluation channels as `--_ds-*`/component-private;
  only public minting is forbidden. This unblocks T2–T6 intermediate states without contract edits.

## 8. Open questions to the owner (real, finite)

1. Promotion authority: does a `--_ds-*` → `--ds-*` promotion route through the Expert exact
   allowlist (294) or does it require a control's declaredOutputs amendment? One named path is
   needed before T2 cohorts create provisional channels they intend to promote.
2. Intermediate state: is "extension declaration → `--_ds-*` provisional" a legal intermediate
   during T2–T6 (evaluate-then-exit), or must each channel's promote/derive/retire verdict be
   decided before its extension line is touched? My reading: legal only with a written lifecycle
   deadline per cohort, else provisionals accumulate as the next residue class.
3. Denominators: confirm `--_ds-*` is excluded from R7 exit `dormantPublicChannels: 0` (they are
   not public) and whether they count in provenance-gate volume ratchets during the transition.

— Kimi K3, independent advisory. Read-only; this file is the only write.
