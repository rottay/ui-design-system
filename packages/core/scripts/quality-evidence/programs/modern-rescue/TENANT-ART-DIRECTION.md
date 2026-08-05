# Tenant art direction — deep same-tree divergence

The binding machine-readable contract is `tenant-art-direction.json`. This
document explains the product decision; it is not a second roadmap and owns no
progress state.

## Decision

The target is no longer “the same UI with different paint.” The same Modern
component tree must express two recognizable product systems:

- **BitHire — Professional Network Hiring OS.** A BitHire-original product with
  the familiarity of a leading professional network: cool neutral canvas,
  white work surfaces, confident blue actions, people-first hierarchy,
  approachable medium geometry, calm motion and dense-but-breathable data.
  This is inspiration, not permission to copy LinkedIn logos, assets, copy or
  exact trade dress.
- **The Management — Monochrome Executive Ledger.** Paper-white, black and
  grayscale; square, ruled, editorial and deliberately rustic. It uses
  dossier/ledger composition, hard keylines, restrained or absent shadows,
  subtle paper/grid motifs and crisp motion. Semantic success, warning, error
  and info remain accessible exceptions rather than being erased.

The distinction must survive grayscale and temporary primary-color
neutralization. R1 needs at least eight observable axes, six of them non-color.

Neither current palette is approved as the target. BitHire's existing
technical pale-blue/default-control treatment must be rebuilt into a restrained
cool near-neutral canvas, clean work surfaces, deep ink and one disciplined
professional-blue action hierarchy. The Management's teal, sandstone,
terracotta and soft SaaS treatment must be replaced by an independently
desirable paper/near-white, near-black, grayscale and ruled system with
accessible semantic exceptions. Neither tenant may be made intentionally ugly
to exaggerate contrast.

## Why this is architectural work as well as styling

The current canonical selections contradict the new direction:

| Tenant | Current recipe/profile | Conflict |
|---|---|---|
| BitHire | `technical-sharp` / `bithire-technical` | Too sharp, flat and instrument-like for the requested professional-network posture |
| The Management | `editorial-round` / `management-editorial` | Round, warm, soft-depth Art Deco is the opposite of square monochrome ledger |

Published profile identifiers are immutable. R0 therefore starts compose-first
for both tenants. Exact TMM radii and semantic status tones are already legal
through the existing allowlisted Advanced tier; the Standard radius envelope
does not block that route. Recipe and expressive experience profiles are two
independent registries and must remain so. A new versioned entry in either is
allowed only after a canary proves that existing axes, recipes, anatomy and
Advanced values cannot express a reusable posture. This must not create another
compiler, token language or combined profile registry.

The vertical and selected experience profile bound six Standard ranges:
density scale, effect intensity, motion intensity, motion duration scale, type
scale and radius scale. Exact allowlisted Advanced values use their own
governed route and are not silently clamped to those Standard dial ranges.

## Required depth

Every applicable family is evaluated across palette/ink, typography,
geometry, edge/divider grammar, material/depth, density/rhythm, icon posture,
motion, background motif, navigation chrome, responsive composition and
recipe/anatomy. A palette swap, a radius tweak or two isolated selectors do
not satisfy the contract.

Mobile is a product posture:

- BitHire prioritizes identity, status, next action, search and recent
  activity; data tables project into task-oriented list cards or sheets.
- The Management becomes a single-column working dossier with ruled sections,
  square sheets and explicit action priority.

Both remain the same public React tree. Differences come only from the
governed tenant/profile chain.

Integrated craft is governed by `VISUAL-CRAFT-CONTRACT.md` and its JSON mirror.
One semantic region owns one dominant boundary; connectors and motifs never
cross content; accidental native desktop controls, tiny generic typography,
nested full borders, detached peer panels and paint-only states are hard
vetoes. Optional semantic or assistive icons collapse cleanly when absent, and
AI marks require real assistive behavior.

The historical named icon catalog is not the target semantic system. Accepted
Modern families and reference fixtures use the role-based `Icon` facade or
focused generated semantic packs. Reusing one generic icon for unrelated
concepts, functional unicode/emoji/local SVGs, universal icon wells and silent
generic fallbacks are forbidden. Tenant icon profiles may alter optical weight,
fill and well posture without changing component markup or semantic role.

## Creative review flow

Kimi may inspect the repository and propose improvements only inside
`KIMI-ANNOTATIONS/inbox/`. Kimi cannot edit this direction, the roadmap,
product code or token contracts. Codex reviews every proposal and records
accepted ideas into the canonical program before Claude may implement them,
then deletes the raw advisory folder. Claude receives only canonical files.

The canonical mechanism is compose-first: exact premium radii and semantic
status tones use the existing Advanced allowlist; recipe and expressive
profiles remain independent registries; active edge, material, motif, icon and
motion axes are exhausted before any new public concept is proposed; and
product-specific table meaning remains app-owned.

This separation gives Kimi genuine creative room without leaving a second
documentation system or giving an advisory session authority to fork the
architecture.
