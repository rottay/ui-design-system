# Master Rubric (120 Angles)

This rubric uses 12 categories with 10 checks each.

## 1. Visual Direction - `4.6/10`

Checks:
- a clear product mood exists
- the interface has a memorable silhouette
- the UI is not reducible to a generic dark dashboard
- decorative effects support hierarchy
- surfaces have meaningful contrast separation
- accent usage creates focus
- typography carries authority
- empty space is intentional
- panel density is controlled
- one signature visual move is recognizable

## 2. Brand Differentiation - `4.2/10`

Checks:
- Rotate feels distinct from BitHire and Evnto
- brand tokens change product character, not only colors
- chrome expresses product identity
- typography feels chosen, not inherited
- navigation style supports product tone
- hero/header language is distinctive
- tables and dashboards inherit the same brand intent
- motion language matches the brand
- product voice feels consistent
- the experience feels first-party, not white-labeled

## 3. Shell Layout and Navigation - `4.4/10`

Checks:
- sidebar is a strong IA spine
- topbar creates useful context
- page shell spacing is coherent
- shell geometry is DS-owned
- route types feel visually distinct
- global actions are grouped well
- active nav states are decisive
- page chrome does not fight content
- shell scales well on dense pages
- shell feels premium, not placeholder

## 4. Dashboard and Overview Surfaces - `4.5/10`

Checks:
- dashboard hero prioritizes meaning over chrome
- cards support comparison
- card variants are meaningfully differentiated
- overview metrics scan quickly
- operator panels are legible
- live/status elements feel intentional
- dashboard storytelling is strong
- surface rhythm is consistent
- board-level hierarchy is obvious
- overview pages feel authored, not assembled

## 5. Data Workspaces and Tables - `5.8/10`

Checks:
- table rows are easy to scan
- headers express hierarchy
- filters reduce load instead of adding it
- search surfaces are clear and comfortable
- bulk actions are easy to understand
- row actions are discoverable
- sticky elements help, not distract
- dense data remains readable
- workspaces support task flow
- tables feel modern, not legacy admin

## 6. Modern Primitives and Patterns - `5.4/10`

Checks:
- cards are expressive enough
- menus are distinctive enough
- headers are not repetitive
- command/search patterns are premium
- page shell patterns create clear structure
- data table visuals are sufficiently authored
- overlays feel deliberate
- feedback states feel cohesive
- components read their canonical token surfaces
- components can differentiate by tenant/product

## 7. Customization and Tenant Fidelity - `6.0/10`

Checks:
- bundled tenants are file-first
- runtime tenants use a bounded contract
- `appearance.general` is truly authored
- advanced styling is intentionally bounded
- brandTheme remains the richest path
- host overrides are limited and explicit
- tenant changes affect real output
- vertical identity can be expressed strongly
- preview/runtime/static paths tell the same story
- customization does not collapse to color swapping

## 8. Accessibility and Interaction - `5.1/10`

Checks:
- command/search flows are screen-reader legible
- modals trap focus correctly
- focus return is reliable
- sortable tables are keyboard accessible
- row actions are keyboard accessible
- contrast is comfortable on dense dark surfaces
- control sizes meet comfort expectations
- interactive semantics are truthful
- status messaging is perceivable
- accessibility quality is systematic, not incidental

## 9. Content Hierarchy and UX Writing - `5.0/10`

Checks:
- headings earn their scale
- subtitles are concise and useful
- chips/badges are not overused
- operator copy avoids dashboard theater
- labels explain intent clearly
- supporting text helps scanning
- action labels are decisive
- microcopy does not sound generated
- sections answer user questions in order
- content density is editorially managed

## 10. Cross-App and Cross-Vertical Coherence - `6.1/10`

Checks:
- DS can serve all three first-party products coherently
- products can feel different without forking everything
- shared shells do not erase brand identity
- bundled vs DB stories are understandable
- product profiles are meaningful
- engine choice is intentional
- cross-app usage does not drift wildly
- vertical themes are richer than DB tenants by design
- coherence is architectural, not accidental
- teams can predict how to build a new product on this base

## 11. Performance, Maintainability, Architecture - `5.8/10`

Checks:
- shell code is not excessively app-owned
- layout math is centralized
- DS/host duplication is limited
- CSS layering is understandable
- runtime seams are not brittle
- visual quality is not built from many ad hoc mixes
- build/rebuild behavior is stable
- component contracts are honest
- the system is evolvable without chaos
- quality work can scale across many surfaces

## 12. Docs, Tests, Guardrails, Honesty - `6.2/10`

Checks:
- docs describe runtime truth
- tests prove behavior, not only strings
- guardrails catch overclaim
- contracts do not drift ahead of consumers
- design decisions are written down
- migration stories are explicit
- the quality bar is defined
- rubric dimensions are measurable
- failures are easy to detect
- the system tells one truthful story

## Aggregate Summary

- strongest area: bounded tenant model direction
- weakest area: authored visual quality of Rotate shell and dashboard composition
- highest leverage theme: move from technically tokenized to visually authored
