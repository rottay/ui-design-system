# Round 3 Methodology — Static Theme Provenance Audit

Date: 2026-07-27
Auditor: Claude (Fable 5) as principal architecture auditor, delegating searches to opus/sonnet subagents.
Trigger: Codex finding that the static vertical artifact is dual-authored (compiled BrandTheme block + hand-authored `_source/extension.css`) while the official audit treated it as a single-authority unit.

## Constraints honored

- READ-ONLY on `ui-design-system` and `app-bithire` (Kimi working concurrently on Modern + Candidates).
- No builds, typecheck, suites, gates, servers, artifact regeneration.
- No git state changes anywhere; no commit/push/publish/tag.
- Writes only to `docs-engineering` (documentation) and `/private/tmp` (evidence).

## Snapshot procedure (staleness guard)

Because artifacts were regenerated the same day (mtime 2026-07-27 06:12) and concurrent WIP
sessions are active, all analysis runs against snapshot copies taken at 2026-07-27 13:30 local,
NOT against the live repo files. Nothing was regenerated.

Snapshot location: `/private/tmp/rottay-design-platform-independent-audit-round-3/snapshots/`

SHA256 at capture:

| File | SHA256 |
| --- | --- |
| bithire/index.css | 35405a3baab81c2308e40bd93b725c8f2c10ab866c06a4f96c622d57429e86fe |
| evnto/index.css | f6d3ed7d81908a1b38bfaa2feba4a17e71aa559110b56ff5bb4d4a47a1dcd20f |
| rottay/index.css | 6616faef2eb0032d5b28d6647515534ac91c46fcb63b017df6b2648bbf4f36a1 |
| bithire/_source/extension.css | 580165730a758e8f255117161e170f52dbc8fc3bdb287de61382623768e2f664 |
| evnto/_source/extension.css | 3a6a943a3a2cb06976d506712f19374a96d900e98aa52aa9e3516358e004aa71 |
| rottay/_source/extension.css | 832e3da184c4a1ce7036907a17af4391ce23722a0b32fcc399e311e52ec048ea |

Live-repo mtimes at capture: all `index.css` 2026-07-27 06:12; all `_source/extension.css` 2026-07-25 13:48
(artifact newer than extension source → consistent regeneration plausible; BrandTheme TS mtimes
verified separately in `scripts/composition-map.md`).

Raw byte-size observation at capture (before any parsing): the BitHire hand-authored extension
(183,690 bytes) accounts for ~72% of the final "generated" artifact (256,690 bytes); Rottay ~82%
(107,137 / 130,885); Evnto ~41% (12,110 / 29,557). The word "artifact" materially overstates the
generated share for every vertical.

Official doc snapshot (pre-edit): `snapshots/official-doc-before-round3.md`
(copy of `docs-engineering/archive/audits/2026-07-26-ds-modern-whitelabel-independent-audit-davila.md`,
git-clean at commit ca53acf at time of capture).

## Measurement method

- Parser-based extraction (no flat regex as final evidence). Parser choice and script:
  `scripts/extract-declarations.*` (see `scripts/composition-map.md` for the composition rules
  and section markers used to delimit the compiled-from-BrandTheme block).
- Every declaration record preserves: custom property, value, selector, at-rule chain,
  mode/context label, extension banner section, file, line, document order.
- The compiled block is delimited by the marker containing
  `Compiled from BrandTheme via compileBrandTheme`; the extension is measured from the real
  `_source/extension.css`, not from the concatenated artifact.
- Correspondence validation: verified programmatically that each snapshot artifact embeds the
  corresponding snapshot extension source per the composition rule, before any overlap math.
- Overlaps are computed as name intersections FIRST, then classified per-declaration by
  selector + at-rule + reachability. A name intersection is never reported as "duplication"
  without that classification.
- Buckets (light / dark / clear-guard / production-guardrails) are non-disjoint and are
  never summed.

## Delegation map

| Agent | Model | Scope | Output |
| --- | --- | --- | --- |
| measure | opus | AST extraction + overlap JSONs, 3 verticals | `{bithire,evnto,rottay}-overlap.json`, `scripts/` |
| claims | opus | Verbatim claim extraction from official doc + prior evidence | `claims-extraction.md` |
| compilercap | sonnet | BrandTheme contract + compileBrandTheme capability surface | `compiler-capability-map.md` |
| sweep1 | opus | DB compiler/bridges, core styles, guardrails, app --rt-*/--ds-* | `sweep-1-compilers-artifacts-app-hooks.md` |
| sweep2 | sonnet | Recipes, typography, density, motion | `sweep-2-recipes-typography-density-motion.md` |
| sweep3 | sonnet | Root attrs SSR/client, i18n defaults, layer ownership | `sweep-3-root-attrs-i18n-layers.md` |

Classification (A–I), adjudication, postmortem, protocol, and the official-doc Round 3 section
are authored by the orchestrator from the agents' evidence.

## Anti-overclaim rules applied in this round

- No number is reported unless reconstructible from the JSON evidence files.
- UNKNOWN stays UNKNOWN; it is never converted into PASS.
- Deterministic cascade winners are treated as a cascade fact, not as proof of single authorship.
- Sampled sweeps publish their denominators.
