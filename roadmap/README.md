# Design System Roadmap — Modern Engine Premium Uplift

## Owner scope correction — 2026-11-04: published V1 and meaningful personalization

**Approved delivery boundary; implementation and release evidence remain pending.**
This latest explicit owner decision supersedes the V1/V2/V3 boundary prose below
where it assigns application adoption to this roadmap. This epic ends with a
working, independently accepted and **published** Modern V1 library. Its release
must identify the approved source/commit, exact package version and integrity,
registry publication, useful Docs/changelog and an installed-package verification
in a DS-owned consumer fixture. A build, branch, prepared archive or source-only
verdict is not publication. Existing W0/V1 quality gates remain required.

BitHire creation, actual application adoption, app branding choices, host wiring,
application DB installation/history/migrations and rollout belong to a **separate
future application epic owned by Dani**, not to this epic or its release critical
path. DS-owned reference fixtures still prove the public library contract without
editing applications. Existing historical reference evidence stays valid by input
and impact; an application release is not needed to certify the library.

### Personalization deliverable

Ship complete editable starting presets using the current Modern typed catalog,
shared components and admitted customization mechanisms. Target five distinct
profiles; four are sufficient if the fifth is demonstrably redundant, as the owner
explicitly allowed four or five. The following names and industry examples are a
proposed selection, not already implemented features or proven market demand:

| Proposed preset | Distinct visual treatment | Illustrative fit, not an industry restriction |
| --- | --- | --- |
| Geométrico | Restrained radius, clear hierarchy, sober surfaces and subtle motion | Finance, legal, professional services |
| Redondeado | Softer corners, comfortable spacing, approachable typography and states | Recruiting, education, wellbeing |
| Artesanal | Warm palette, characterful headings, deliberate rhythm and restrained material depth | Hospitality, culture, craft; the owner's rustic aesthetic |
| Compacto | Dense but readable layout, clear table/form hierarchy and efficient interactions | Logistics, administration, data-heavy work |
| Minimalista | Generous spacing, refined typography, quiet elevation and measured emphasis | Premium services, events, hospitality |

The existing catalog has 29 controls: 19 Standard and 10 Pro. Its five registered
style IDs do not establish five distinct proposed looks. Compose the vertical
baseline, inherited style reference and tenant brand decisions; retain plan
inheritance and let explicitly authorized overrides take precedence. Standard
authors Standard controls; Pro also authors Pro controls. Inherited preset quality
is preserved across plans. Display names do not rename persisted IDs, versions or
digests.

These are presets over **Modern**, not new engines, copied component families,
industry forks or a reactivation of the frozen Rustic engine. Reuse the existing
four-theme proof and admitted controls wherever they satisfy the selected styles;
add only a demonstrated missing delta. Preserve shape, typography, rhythm/density,
depth, motion and states as meaningful non-palette dimensions under existing
catalog rules. Light/dark, keyboard/focus, contrast, reduced motion, responsive
behavior, supported SSR/hydration and static/serialized-document parity keep their
existing acceptance obligations. Verify comparable content/composition and the
current required component/vertical fixtures; do not add a new Cartesian-product
campaign, certifier, registry or optional test programme.

Design references inspected on 2026-11-04: [Radix theme composition](https://www.radix-ui.com/themes/docs/theme/overview),
[Radix density scaling](https://www.radix-ui.com/themes/docs/theme/spacing) and
[Carbon productive/expressive motion](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview).
They support the customization axes; the five-profile selection is our proposal,
not a claim that those systems validate these industry segments.

Advanced spatial/WebGPU or AI capabilities and any later DS extensions require
an explicit future selection; they do not postpone V1 publication. Preserve the
170-WO registry/history and every original FAIL/acceptance record. Mixed WOs may
remain open for out-of-epic obligations without making an accepted, published V1
incomplete or falsely claiming full-programme completion. Continue W0 and
independent V1 work in parallel, with one serial integrator and existing resource
admission. Current All-Sol staffing and DISK-SCOPE-01 are unchanged.


> **Staffing succession recorded on 2026-11-02 (historical; later owner orders prevail):** Codex is sole technical DT, coordinator and serial
> integrator; Claude Admin Opus writers and distinct Claude Admin reviewers operate in parallel.
> Read [Owner succession — 2026-11-02](#owner-succession--2026-11-02-codex-technical-dt), then
> start at [Owner-approved V1 scope and parallel delivery](#owner-approved-v1-scope-and-parallel-delivery--2026-10-27).
> Earlier records remain historical where the named supersession applies.

## Owner succession — 2026-11-02: Codex technical DT

**Status: owner-appointed technical succession only. Scope, phases, acceptance and release authority are unchanged.**

- **Seat.** On 2026-11-02 at 15:34 UTC the human owner explicitly appointed Codex (`davila@rottay.com`, `gpt-6.1-sol`, high reasoning) as sole technical DT, coordinator and serial integrator, succeeding Kimi Developer after its monthly quota was exhausted. Barrier at checkpoint `c9c335c216457cb1e64e006d64c090e478e24b6a` on main: Kimi's native goal was paused by a non-retryable quota error, its process exited natively, no old-owner actor remained live, and the controller released only the DT authority. There is exactly one DT and one integrator.
- **Exact supersession.** This replaces only the clauses naming Kimi Developer as DT/integrator and the Sol Admin writer/reviewer staffing in the 2026-10-27 and 2026-10-28 sections below, and the 2026-09-19 Codex exclusion for the DT seat. Every other clause of those sections, including dynamic parallelism and the delivery checklist, stays binding.
- **Source and review.** Codex never authors product source and never supplies independent acceptance for any candidate or for what it produces while integrating. Source writers and distinct independent peer reviewers are real Claude Admin sessions (`admin@rottay.com`, `claude-opus-5-5`, high effort). Verify account, model and effort by receipt on every dispatch; never relabel or silently fall back. The DT integrates a candidate only after a distinct peer accepts it.
- **Continuity.** The Codex native session and goal carry new runtime identifiers (recorded in `SUCCESSOR-OWN.json`); they continue the existing objective and lineage `d331693a-9c7d-4040-8865-e9226d2588b6`. No new objective, programme, roadmap, registry, controller or framework. All WOs, the full W0 and V1 path, original receipts, candidates, FAILs, sealed WIP, freezes, Q01–Q12, DS gates and the sealed Modern Rescue programme are preserved. Delivered candidates are consumed, not re-authored.
- **Parallelism.** At each delivery event, refill every genuinely ready disjoint packet under the existing admission, reservations and locks (one integrator, one heavy chain). No cap of one, no fixed agent count and no periodic model polling.
- **Release.** This succession grants no new push or publication authority; release permission remains separate. SCM, push and package publication follow only the existing owner-authorized gate sequence once the real W0/V1 gates pass. Documentation, tarballs, branches or registry state never imply certification.

Record: `/Users/daniel/Developer/Rottay/.local/normalization/platform-parallel/supervision/audit-20261102T1534Z-ds-codex-dt/design-system/HANDOFF.json` (sha256 `a9f5b1d2d111e20cc6de09cc2bc583ec57de569e16d5240933704dfcdfc81373`).

## Owner-approved V1 scope and parallel delivery — 2026-10-27

**Status: scope and execution policy APPROVED by the human owner in this chat. Technical mapping/certifier implementation and V1 acceptance remain PENDING.** The owner explicitly requested incorporation into this roadmap and delivery to Kimi through tmux, with ARC-12 and independent corrections progressing concurrently. This is the single operative plan, not a new registry, roadmap or audit programme. V1/V2/V3 are delivery boundaries, not package SemVer or renamed phase states. A V1 near 8–9/10 is a planning aspiration, never a substitute for acceptance.

### Authority, roles and exact supersession

- Kimi **Developer (`davila@rottay.com`), K3.1 Pro, thinking high** is sole DT/integrator after the verified account-only handoff of 2026-10-28, in `ds-codex-admin-20261020:1.0`; **Codex Sol Admin** finite writers and separate reviewers remain the effective worker arrangement. Verify real model/account/effort receipts; use high reasoning for contract, architecture, source correction and semantic review. Do not relabel a worker or silently fall back. Preserve active sessions and their permissions; no re-login/restart is required by this order. Fable means the downloaded historical Cloud audit, **not a new model dispatch**. No Cloud promotion/weekly spend is authorized here.
- Codex in this owner-requested conversation edits this policy and delivers it, then leaves; it is not another DT, standing reviewer or a dependency for progress. Do not call/message it for approval. Existing independent worker reviewers satisfy the execution role.
- This section supersedes older role/scheduling statements (including the 2026-10-20 sole-Codex wording) where they conflict. It supersedes M-DS1 **(b), (c), (e), (h)** and M-DS2's **phase-completion and exclusion-list/design-only clauses**, only for the V1 scope below. All other substantive safety/quality obligations remain. Older milestone prose is historical for these named clauses, not a competing direction.
- The owner approves bounded implementation of the mapping/staged-claim/scoped-certifier design below, with independent review before integration. Approval is **not** a claim that these mechanisms exist, a phase GO, a release receipt, permission to ignore an active reservation, or a green gate. Preserve structured phase controls. Do not keep asking whether to adopt the selected V1 scope; resolve technical implementation questions through finite debrief/review.
- Preserve all 170 WOs, full-WO acceptance, dependencies and history. Mixed WOs can remain open after V1. No new WO is needed by default; if a reproduced obligation has no lawful owner, propose only that bounded missing WO under the existing process. Never insert unrelated debt into closed-scope RET/CON receivers. Audit ACT IDs are lookup keys, not new WOs.
- Apps and final branding remain downstream. No new authority for push, publish, deployment, branches/worktrees or deletion of active artifacts. Relevant owning documentation ships with source corrections. Do not preempt other modules' agents/resources; “close ARC-12” is a front, not an exclusive serial priority.

### Binding V1 / V2 / V3 boundaries

**V1:** a stable Modern DS public package from which productive applications can start. Retain complete meaningful bounded customization, styles that admit/compile/verify/emit/mount, immutable descriptor/identity, static/serialized-DB parity, coherent family cascade beyond palette, useful public components, adaptive Card/Grid/collections, supported SSR/hydration/first interactions, request/portal isolation, accessibility, RTL/i18n and tested public entrypoints. Standard/Pro are editing permissions, never different quality. Four or five complete editable presets with the same content/composition prove differentiation, targeting five under the 2026-11-04 owner correction above; no final app identity choice is needed.

**Outside this epic (formerly labelled V2):** real app adoption/DB installation, history/actor/CAS/restore operations, downstream stored-data migrations and final app identity belong to a separate application epic owned by Dani. Any later DS normalization needs its own selected scope. Retained DS unsafe behavior, broken public V1 promises and ineffective release predicates cannot be deferred here.

**V3:** currently unconsumed live spatial/WebGPU and AI state-motion capabilities, plus subsequently selected new features, and full-programme certification when all original obligations are satisfied. No premature final GAT-09 or claim of all-170 completion.

Full required V1 product/proof detail: [approved release-contract scope](../../docs-engineering/archive/audits/2026-10-27/design-system-cloud/reconciliation/v1-release-contract.md). The linked archive retains its historical “proposed” status; this dated canonical section records the adoption. Its implementation constraints and evidence limits remain applicable; its earlier no-implementation authorization is superseded only by this section.

### Assignment of all 29 open WOs

The original V2/V3 labels below preserve the historical full-programme mapping.
They do not activate application work or make its completion a V1 release gate;
the 2026-11-04 owner boundary above governs this epic.

| WO | Entrega propuesta | Alcance |
|---|---|---|
| WO-GAT-09 | V1 + cierre total V3 | Certificación acotada real V1; certificación de todo el programa al completar las obligaciones V2/V3. |
| WO-CRA-15 | V1 seguridad / V3 capacidad | Fallback estático seguro ahora; ParticleField/WebGL/WebGPU vivo después, fuera de selección productiva V1. |
| WO-CRA-17 | V1 | Iconos semánticos, facades, licencias y calidad óptica; reutilizar proveedor ya decidido. |
| WO-ARC-12 | V1 | Terminar atributos honestos, cadena activa, limpieza única y certificación; no reiniciar LX4. |
| WO-ARC-21 | V1 DS / V2 adopción | Paridad de documento estático/DB serializado y primera pintura DS; instalación DB/app real después. |
| WO-ARC-17 | V1 | Variantes/anatomía tipadas reales y rechazo de variantes desconocidas. |
| WO-ARC-16 | V1 | Retiro de extensiones ya ejecutado, consumidores cero y guardia de reintroducción. |
| WO-ARC-20 | V1 | Multiselección y botones de presets correctos; prueba del receiver existente. |
| WO-TOK-11 | V1 prueba / V2 cierre condicionado | Contraste APCA corregido antes de V1; DONE completo conserva dependencia de EVI-02. |
| WO-ARC-18 | V1 | Shells y colecciones adaptativos, sin contenido/control invisible ni desborde ordinario. |
| WO-ENG-25 | V1 motion / V3 kit AI | Motion semántico, presencia y reduced-motion ahora; kit AI no consumido después. |
| WO-CRA-19 | V1 | Overlays: Escape, foco, capas y scroll-lock correctos en composición. |
| WO-CRA-18 | V1 | Sistema de charts actual, accesibilidad y comportamiento prometido; sin nuevos tipos por iniciativa. |
| WO-ENG-24 | V1 | Frontera Classic/Rustic congelada y segura; no campaña de mejora de esos motores. |
| WO-GAT-10 | V1 | Licencias/provenance de efectos distribuidos y control negativo efectivo. |
| WO-CRA-20 | V1 | Poda de pesos de iconos, consumidores resueltos y medida del resultado. |
| WO-CRA-21 | V1 | Contraste BrandMark según fondo real; no diseño de identidad final. |
| WO-CRA-22 | V1 | Entry público sin proveedor concreto indebidamente alcanzable. |
| WO-ARC-19 | V1 prueba / V2 cierre condicionado | Cuatro o cinco presets editables distintos, objetivo cinco, misma composición y seis ejes; DONE completo conserva EVI-02. |
| WO-GAT-11 | V1 prueba / V2 cierre condicionado | RTL, zoom, forced-colors, contenido largo, teclado/foco; no diferir robustez por dependencia administrativa. |
| WO-GAT-12 | V1 | Censo de capacidades con SHAs reales, sin fingir apps instaladas. |
| WO-SKIN-08 | V1 prueba / V2 cierre condicionado | Resolver residuos productivos de skin/cascada; DONE completo conserva EVI-02. |
| WO-RET-04 | V1 límites / V2 limpieza | Corregir límites/responsabilidades que afecten al producto; normalización física sin cambio de comportamiento después. |
| WO-RET-06 | V1 DS / V2 consumidores | Compatibilidad, API, licencias y seguridad DS ahora; obligaciones de consumidor/operación reales después. |
| WO-RET-07 | V1 API / V2 datos | Retiro versionado de once props inertes tras ARC-12; migración de campo persistido por dueño de datos después. |
| WO-EVI-02 | V1 prueba DS / V2 operación | Cascada causal completa, controles, paridad y evidencia DS ahora; F-72 B-ops/Stage C con dueño real después. |
| WO-DER-10 | V2 | Identidad BitHire definitiva y goldens tras elección del owner; V1 usa temas técnicos provisionales. |
| WO-CON-08 | V1 descriptor / V2 historia | Identidades inmutables, reconstrucción y validación DS ahora; historial, CAS y restauración transaccional en apps después. |
| WO-CON-09 | V1 contrato / V2 adopción | Helper SSR/guía y prueba de paquete instalado ahora; migración de consumidores y puerta garantizada después. |


### V1 milestone mechanics: one finite singleton packet, not a new programme

Use GAT-09/existing phase-control ownership. The [integration design](../../docs-engineering/archive/audits/2026-10-27/design-system-cloud/reconciliation/roadmap-integration-review.md) supplies exact code entrypoints, graph read and negative cases. Revalidate current reservations and source; the audited status script has foreign WIP. The DT must coordinate its owner and compose the approved change without overwriting it. Read-only design may overlap source work; shared script/registry/fingerprint writes wait for that reservation.

1. Keep full `done` and final GAT-09 barriers intact. Proposed mapping now approved for reviewed implementation: TOK-11 2A→6 / DS-IMP-048; ARC-19 3→6 / DS-IMP-028/029; ENG-25 2B→6 / DS-IMP-086/087/088/089; CRA-15 2C→6 / DS-IMP-106/107/108. Change both exact WO and item mapping through the sanctioned mechanism, independently review graph/fingerprint and reseal lawfully. No phase opens automatically. Do not manually forge registry progress.
2. CON-08 step1 staged claim: only CAT-04, EMI-02, CON-06 may form its `claimDependsOn`; full dependency ARC-21 and full `done` refusal remain. Resolve G-1 q1–q3 with explicit DS-step1 dispatch restriction, strict subset/acyclic/allowlist/decision-reference validation and consumer steps still blocked by ARC-21. Independent CON-05 shared-contract review before descriptor source work.
3. Implement a **real scoped mode in the existing certifier**, with executed clause evidence, exact candidate/input/harness/population hashes, full-programme blockers and `completionEligible=false`. No final certification artifact; `claim-integrity:structural` is not its replacement. Do not invent a CLI flag before implementation/review.
4. Closed clause-level exclusions: ARC-21 app half; CON-08 steps2–4; CON-09 step3; RET-06 only its named actual app/owner-ops obligations; RET-07 step3; DER-10; GAT-09 final closure; EVI-02 **only** F-72 B-ops and migration-dependent Stage C, with DS stored-row safety/restrictions/consumer proof retained; RET-04 only enumerated behavior-neutral normalization; CRA-15 unavailable live spatial functionality; ENG-25 paused unconsumed AI kit. TOK-11/ARC-19/GAT-11/SKIN-08 may have dependency-status holds **only after all their substantive V1 proof passes**. Every other missing retained clause blocks V1. Never exclude whole categories using a regex.
5. Required negative cases: wrong mapping, missing ownerGo, illegal staged dependency, CON-08 premature done, final GAT-09 with open authority, missing clause, artifact/harness/population mismatch, unlisted exclusion, unsafe legacy data, exposed excluded spatial path, diluted APCA/axis floor or false completed WO. Positive yields scoped evidence only. If review fails, repair this packet; the original mechanics remain binding in the meantime.
6. M-DS1 now requires ARC-12 done; EVI-02 complete **V1 DS clauses** rather than downstream operations; RET-04 runtime/boundary correctness rather than global cosmetic normalization; all RET-06 DS clauses; RET-07 step2; CON-08 step1; CON-09 step2; ARC-21 DS proof; every other retained V1 clause from the table. M-DS2 adds four-theme evidence, robustness, independent review and two matching scoped-certifier runs. Both stay NOT REACHED until the mechanics and proof actually exist. Publication is separate.

### Evidence lookup: do not ingest or redo the whole Cloud audit

Read the [decision brief](../../docs-engineering/archive/audits/2026-10-27/design-system-cloud/reconciliation/decision-brief.md) and [technical review](../../docs-engineering/archive/audits/2026-10-27/design-system-cloud/reconciliation/technical-review.md) once. Resolve each assigned ACT/finding using [17 finite action groups](../../docs-engineering/archive/audits/2026-10-27/design-system-cloud/reconciliation/action-items.jsonl) and [211 debrief records](../../docs-engineering/archive/audits/2026-10-27/design-system-cloud/reconciliation/debrief.jsonl). For past closure use [141 historical WO records](../../docs-engineering/archive/audits/2026-10-27/design-system-cloud/reconciliation/historical-wos.jsonl), not a blanket reopen. [Rubric](../../docs-engineering/archive/audits/2026-10-27/design-system-cloud/reconciliation/rubric.jsonl), [scoring policy](../../docs-engineering/archive/audits/2026-10-27/design-system-cloud/reconciliation/scoring-policy.md) and [scorecard](../../docs-engineering/archive/audits/2026-10-27/design-system-cloud/reconciliation/scorecard.json) distinguish quality, readiness and coverage. Original Fable evidence is [checkpoint12](../../docs-engineering/archive/audits/2026-10-27/design-system-cloud/checkpoint-12/audit-output/); immutable original receipts remain there. Look up a finding ID/row/path, not all 614 files per worker.

Audit source is `f3b6d910a6dbbc31651971dd9b2deddb09570fd4`; bind each new dispatch to current HEAD and compare only relevant later changes/held patches. Fable read 690 files fully and 282 partly of 8746; 22 of 211 active findings received independent deep checking, 189 triage. Hash inventories do not certify semantics; scratch CSS/DOM does not certify React/public-package behavior. Reproduce inherited claims before writing fixes; record disproved/already-fixed findings and move on. Neither 141 DONE nor a global historical 3 score is a product-quality percentage.

### Correction packets: concrete next actions and stop conditions

Each bullet has an existing receiver proposal in its ACT row, exact finding IDs, candidate write-set and acceptance. The DT resolves it against the original WO contract, current source and reservations before assigning a writer. The following refinements override unsafe shorthand in historical Fable recommendations.

- **ACT-01 — Style-reference mount: reproduce the valid v3 style document rejection; admit the closed legitimate provenance form. Keep no-style v2/v3 controls valid and reject unknown kind/bad id/version/inconsistent provenance. The old C3 injects a VALID style-reference: do not preserve it as an invalid negative.**
  Evidence keys: DSA-FP-001. See that ACT row for receiver candidates and exact controls.
- **ACT-02 — Card collapse in Space/Flex/intrinsic composition: fix the demonstrated family, preserve block/sibling/nested controls. Do not apply width:100% to all 46 roots. Other roots need individual counterexamples. Same writer owns ACT-14 Card overlap.**
  Evidence keys: DSA-AC-002, DSA-FF-002, DSA-FK-005, DSA-RD-001, DSA-AC-003, DSA-DL-001. See that ACT row for receiver candidates and exact controls.
- **ACT-03 — Gate/CI honesty: inspect actual producers, case-exact paths, manifest execution, artifact stamp and biting drills. Never rerecord all baselines or widen normalization merely to turn green; use existing governed dispositions and independently review each affected baseline.**
  Evidence keys: DSA-PE-006, DSA-FD-003, DSA-PE-004, DSA-GT-002, DSA-GT-003, DSA-DI-001, DSA-GS-002, DSA-GS-001, DSA-FD-007, DSA-PE-001, DSA-GT-001. See that ACT row for receiver candidates and exact controls.
- **ACT-04 — Route genuine defects and budget reds to one exact authority. Reuse decided D1/family floors, do not restart nine broad questions. Adopt the selected scope through the singleton packet above. A missing decision blocks only its dependent packet.**
  Evidence keys: DSA-RE-005, DSA-RE-001, DSA-PE-010, DSA-PE-007, DSA-FC-002b, DSA-FC-005, DSA-PE-002, DSA-PE-011. See that ACT row for receiver candidates and exact controls.
- **ACT-05 — Admission parity/value bounds: bounded traversal and own-property lookup; valid static/DB/preview equivalence; typed refusals for malformed/deep/oversized documents. Unknown customer must not become Rottay or another customer. Deliberate bundled-default semantics are distinct. Parse mixed CSS references; never blindly strip var().**
  Evidence keys: DSA-FT-001, DSA-SF-001, DSA-SF-002, DSA-FT-005, DSA-SF-004, DSA-AA-001, DSA-FP-004, DSA-AA-003, DSA-TC-007, DSA-SF-006, DSA-SF-003, DSA-SF-008. See that ACT row for receiver candidates and exact controls.
- **ACT-06 — Ambient legacy header race was reproduced under interleaved tenants; explicit server resolver is a good control. Repair/version the affected supported route. Static root reach does not prove a secret in a built browser bundle: inspect actual public artifact before export changes. No arbitrary zero-overlap metric or unsafe public removal.**
  Evidence keys: DSA-AA-002, DSA-RE-004, DSA-TC-005, DSA-AA-009, DSA-FT-007, DSA-FT-008, DSA-AD-001, DSA-AA-004. See that ACT row for receiver candidates and exact controls.
- **ACT-07 — Family cascade: title-weight consumers, picker material masking, height/density, table padding, sidebar active pair and emphasis. Freeze applicable anatomy/catalog first; split by complete disjoint family, not by CSS versus runtime. Every relevant property gets a falsifying probe and must-not-move control. Existing floor rulings apply; not every anatomy consumes every decision.**
  Evidence keys: DSA-FC-001, DSA-CT-001, DSA-CT-003, DSA-PI-007, DSA-FF-004, DSA-FF-005, DSA-FC-003, DSA-CS-006, DSA-CS-001, DSA-FC-002a, DSA-FC-002b, DSA-CS-003, DSA-CS-004, DSA-CS-002, DSA-FC-006, DSA-FK-004, DSA-TC-004, DSA-TC-003, DSA-FC-004, DSA-CT-004, DSA-PT-009, DSA-FT-004, DSA-DL-004, DSA-DL-006, DSA-PS-004, DSA-PS-002. See that ACT row for receiver candidates and exact controls.
- **ACT-08 — Cascade instruments: weight must fail independently even when font-size moves; material hover must fail when palette-first fallback masks it. statesHalves already gets allProperties: do not repair a nonexistent transform-only branch. Preserve six-axis >=80% applicable population, negative controls and decided D1 20-family floor where applicable.**
  Evidence keys: DSA-CT-005, DSA-CS-007, DSA-GS-004, DSA-CT-002, DSA-FC-009, DSA-DA-002. See that ACT row for receiver candidates and exact controls.
- **ACT-09 — SSR/provider/hydration: reuse current cold-chunk and owner click/Q2 evidence. Test supported compositions, attempted/handled first events, cold/warm/native defaults, siblings, concurrent tenants/portals, chosen mode, fallback and actual paint separately. Do not infer universal click loss, enable naive warming or call deliberate unsupported-route rejection a general bug. No overlap with ARC-12 active factory/provider/portal paths.**
  Evidence keys: DSA-FR-007, DSA-TR-001, DSA-RE-002, DSA-RE-003, DSA-TR-002, DSA-FR-008, DSA-FR-002, DSA-RE-001. See that ACT row for receiver candidates and exact controls.
- **ACT-10 — Styles/history: immutable pin must survive co-editing the current manifest; preserve baseline/style/build/assets/font identity and authored values needed for diffs. Preview rescoping must preserve real emitted CSS including multiline/media. DS descriptor/reconstruction is V1, not a claim of app CAS/history/restore. Admission/provenance contract singleton with ACT-01/05.**
  Evidence keys: DSA-TC-006, DSA-TC-002, DSA-FP-003, DSA-FP-002, DSA-FD-005, DSA-RD-005, DSA-RD-006, DSA-RE-007. See that ACT row for receiver candidates and exact controls.
- **ACT-11 — A11y: reproduce label binding, Upload roles, nested interactive Card, dark contrast, focus visibility and cumulative sticky offsets in ordinary routes. Use real DOM/keyboard and appropriate AT evidence. Repair same-family behavior together; no conflicting Card writer. Hypothesized portal Tab/popup-role fixes require their relevant proof first.**
  Evidence keys: DSA-FL-001, DSA-AC-006, DSA-RA-001, DSA-PI-001, DSA-PI-002, DSA-AC-007, DSA-FS-006, DSA-FS-007, DSA-PI-006, DSA-AD-005, DSA-PT-011, DSA-AC-005, DSA-DL-007, DSA-PS-006, DSA-PS-009. See that ACT row for receiver candidates and exact controls.
- **ACT-12 — Public API/docs: bind declared props/ref/events/members to actual behavior and public package exports. ARC-12 retains its exact pass-through scope. Implement or formally version/retire unsupported behavior with migration; no deletion just to pass. Cosmetic names are not release blockers. Do not treat historical grep-all-names-zero advice as a demand to erase archived evidence.**
  Evidence keys: DSA-FR-006, DSA-FR-001, DSA-FS-008, DSA-FS-004, DSA-PI-003, DSA-PT-012, DSA-AD-003, DSA-AC-010, DSA-AA-006, DSA-PT-016, DSA-AA-007, DSA-AD-006. See that ACT row for receiver candidates and exact controls.
- **ACT-13 — Integrated proof: actual built public package with four same-composition themes, per-property longhands, positive/negative controls, container scenes, concurrent tenant SSR/portals, hydration, a11y, bundle/budget/freshness. Follow real inherited matrices; freeze inputs once. No app business proof claimed by a neutral consumer fixture.**
  Evidence keys: REQ-FAB-001..003, REQ-AD-001, REQ-AD-002, REQ-FF-002, REQ-RD-001, REQ-CS-001, REQ-CT-002, REQ-SF-001, REQ-FP-001, REQ-RE-004, REQ-TR-001, REQ-RE-001, REQ-RE-007, REQ-PT-001, REQ-PT-002, REQ-DL-001, REQ-DL-002, REQ-DL-003, REQ-PS-001, REQ-PS-003. See that ACT row for receiver candidates and exact controls.
- **ACT-14 — Adaptive layout: auto-fit + span2 can hide content in a zero implicit track or overflow one gap; test 320/360px and wide spans. Keep XL Card supported size/spacing/type meaningful. Reproduce collection/virtual-row clipping before fix. Preserve intrinsic sizing and override precedence; do not remove advertised size or claim automatic app information architecture.**
  Evidence keys: DSA-AC-001, DSA-FB-001, DSA-AC-004, DSA-PT-014, DSA-AC-009, DSA-AC-008, DSA-FR-004, DSA-FR-003, DSA-FF-001, DSA-RD-002, DSA-PT-003, DSA-DL-005, DSA-PS-010. See that ACT row for receiver candidates and exact controls.
- **ACT-15 — Productive patterns: real inline-edit lifecycle, neutral FilterPanel labels/metadata (no recruiting regex inference), visible form errors, safe CSV and preserved calendar views. Trusted host identity/permissions for UI actions, never display-name authorization or claimed backend security. Existing promised behavior first; unrequested refactors later.**
  Evidence keys: DSA-PT-001, DSA-PT-002, DSA-PT-008, DSA-PT-013, DSA-PT-004, DSA-PT-005, DSA-FD-004, DSA-PI-008, DSA-PT-007, DSA-PS-008, DSA-PS-007. See that ACT row for receiver candidates and exact controls.
- **ACT-16 — Evidence quality: realistic mutant makes each relied-on predicate fail; real factory rather than mocked-away behavior; actual computed styles rather than stylesheet-text stand-ins; valid tracked durable receipts bound to candidate. V1 instruments first, no wholesale test rewrite/census campaign.**
  Evidence keys: DSA-FF-006, DSA-PT-015, DSA-FS-005, DSA-FT-003, DSA-FT-006, DSA-PE-013, DSA-GS-005, DSA-GS-006, DSA-PE-009, DSA-RE-010. See that ACT row for receiver candidates and exact controls.
- **ACT-17 — Architecture: repair actual ownership/public-boundary/refusal defects; preserve one catalog/compiler/derivation chain. Retain budgets and valid acceptance. Behavior-neutral folder/size cleanup is V2, unused mechanisms V3. Do not reword contracts or baseline defects to make the source compliant.**
  Evidence keys: DSA-AA-010, DSA-AD-002, DSA-AD-004, DSA-DA-001, DSA-GS-003, DSA-SF-007, DSA-SF-005, DSA-RE-008, DSA-RE-009, DSA-RE-011, DSA-AA-008, DSA-PE-005, DSA-PE-008, DSA-FC-008, DSA-FF-003, DSA-PT-017, DSA-PI-004, DSA-PI-005, DSA-DL-002, DSA-DL-003, DSA-PS-001, DSA-PS-003, DSA-PS-005, DSA-PS-011. See that ACT row for receiver candidates and exact controls.

### Parallel execution, resource policy and autonomous continuation

1. **Do not stop/migrate existing actors.** At delivery, ARC-12 F11C R3 INPUT review and F11K R5 CODE review were active. Latest operational receipt governs; no timeout is termination, no duplicate dispatch. LX4, LC1B, PM, LC8A, FU9A/B, F11V, FU8A already integrated are not fresh work. Preserve H-P3: unreached member-only evidence never authorizes strip.
2. **ARC-12 front:** delivered review → necessary correction/recapture → caller-data-state mapping → strip/D5 once → dead-arm/freeze → full acceptance. Current physical index drift and RESOURCE HOLD require attribution/protocol repair, not another loop of unexamined reruns or acceptance without evidence. No new ACT scope smuggled into ARC-12.
3. **While those reviews run, dispatch useful independent work now where legal:** choose ACT-01 style admission if its full read/write closure is free; otherwise an unreserved family such as neutral FilterPanel/inline-edit or Card/Grid, with that family's complete owner. Pick at least one source-fix front independent of ARC-12 if a lawful packet exists. Mere waiting on two ARC-12 reviewers is not exploitation of parallel product work.
4. **Dynamic concurrency across the entire roadmap; no fixed two-, three- or four-agent cap.** ARC-12/runtime, styles/admission/descriptor, family cascade, adaptive layout, behavior/accessibility and evidence tooling are candidate streams, not a limit or guaranteed disjoint sets. Admit every useful eligible packet with actual ownership, independent review and resource capacity. Use more Sol Admin writers/reviewers when those conditions permit, fewer only for a named real constraint. Follow the dated dynamic-concurrency policy below. Keep one heavy validation slot and one integrator on this host; never cancel other teams' agents to create capacity.
5. **Before each dispatch record in the existing WO progress/packet record:** current source/hash, finding and ACT IDs, original acceptance, proof depth, selected correction, exact read/write set, writer, separate reviewer, shared contract reservation, focal positive/negative tests, needed browser slot, expected finite deliverable and next receiver. Todo phase-locked WOs get existing permitted read-only preparation, not forbidden progress/claims. No parallel registry or per-step status system.
6. **Resolve shared ownership before edits:** catalogue/admission/provenance; root/package contracts; gate manifest/CI/population; generators/dist; browser/goldens; moves/reverse importers; registry/status/fingerprint/Git index all have one owner. A test author cannot invent contract semantics while a source author changes them. Family runtime/skin/a11y/layout overlap stays with the same family owner.
7. **Review and integrate continuously:** named source/focal evidence, independent verdict, functional commit with HEAD/index/pathspec/hash proof and no foreign staging. Do not wait for all streams to finish before integrating a safe accepted packet. Full batteries run at the relevant combined candidate milestone, not for every tiny patch. Keep required focused checks; carry accepted evidence only if its inputs are unchanged.
8. **Recovery:** quota/auth unknown → preserve and report, no silent account fallback; resource hold → lightweight fronts continue while heavy slot is corrected; reviewer HOLD → finite correction, unrelated fronts continue; missing owner decision → queue exact bounded question and continue independent work; no legal source packet → report concrete reservation/phase blockers, not “waiting” or broad “continue?”. Do not repeat inventories/reviews without a changed input or new question. No autonomous migration/restart required.
9. **Cleanup:** after integration and no active/future consumer, retire only redundant derived copies with recoverable commit/hash receipt; retain source patches, held candidates and original proof. No copying whole repos for each lot and no blanket deletion. No new recurrent supervisor or call back to this Codex conversation.
10. **Quality/closure:** no floors reduced, budgets widened, unsafe fallback, feature amputation, missing mandatory tests, fake visual proof or self-review. Proposed 8–9 score never averages away an isolation/a11y/cascade failure. Four test themes are not final branding. Confirm all retained V1 clauses, not just a good screenshot.
11. **Report outcomes:** integrated fixes/commits, WOs actually closed, M-DS1/M-DS2 clause progress, active independent streams, specific blockers and next finite dispatch. After three effective workdays, recalibrate from accepted work and time lost to resources; if no source fix or blocking proof progressed, change scheduling/resource diagnosis rather than repeat preparation. Planning ranges (not promises): first fixes 2–4 workdays, audit V1 corrections 8–15 workdays with parallel flows, complete candidate 20–30 workdays with major uncertainty. Do not use estimates as deadlines that waive gates.

### Owner order — dynamic parallelism for the whole roadmap, 2026-10-28

The owner explicitly rejects treating the currently observed two Sol workers, the initial three-stream sketch, or any arbitrary agent count as a staffing ceiling. This scheduling rule applies through all remaining V1, V2 and V3 work in this same roadmap, including reproduced defects in previously DONE WOs. Delivery scope and owning acceptance still apply; future V2/V3 work does not displace a ready V1 blocker or authorize app edits now. Kimi Developer remains the only DT; Sol Admin high finite writers and independent reviewers scale to the real work. This supersedes any reading of “start with three” as a cap.

**Admission is work-driven.** When a packet delivers, a review starts, an integration slot releases, or a prerequisite changes, the DT reuses the existing WO/progress inventory to identify other ready corrections. For each plausible unassigned front, establish one of: admitted with writer/reviewer and finite deliverable; queued behind a named read/write or contract reservation and its release event; phase/dependency/owner-decision blocked with the exact clause; or deferred by the approved release scope. Do this at dispatch/delivery boundaries, not as a recurring census/report or new scheduler. Two busy reviewers do not imply that all source work must wait. A generic “more could pile up” or “heavy is reserved” without a demonstrated resource/input constraint is insufficient to refuse an otherwise eligible independent correction.

**Complete-family ownership.** Distinct title/picker/material/control consumers, field label binding, a neutral pattern behavior, style admission, adaptive layout and causal instruments can supply parallel packets when their actual contracts and input closures are stable. ACT IDs alone never prove disjointness. Keep runtime/skin/a11y/layout of the same component with one owner; shared compiler/catalog/provenance, public contracts, gates/populations/CI, generators/dist, registry and Git integration remain singleton. A writer never supplies its own independent acceptance. No new broad audit, duplicate discovery or fake preparation just to fill agent slots. Reproduce inherited hypotheses once; preserve negative results and prior accepted work.

**Testing pipeline and batching.** Writers run relevant cheap focused controls under their reserved inputs; independent reviewers may overlap other writers. Classify validation by its actual CPU/RAM, artifact and input effects, not the actor's label. The DT queues and batches heavy build/package/browser/fleet/full-suite work on a pinned combined candidate, with a named owner and finite start/release conditions. Reuse valid unchanged accepted evidence; rerun changed dependency closures. Isolated source/test authoring outside the frozen closure may proceed if the heavy admission contract and measured resource headroom allow it. During a legitimately exclusive heavy window, conflicting CPU work waits and existing actors finish naturally; unrelated safe work is not globally serialized. Never remove positive/negative controls or claim source/unit evidence as visual/package proof.

**Integration pipeline.** Integrate accepted related packets at the next safe bounded checkpoint, batch compatible corrections before the next capture/freeze, then rebind affected successors once. Coordinate source/docs/changelog and independent combined-candidate review where packets interact. Avoid both extremes: committing during a reserved input window and indefinitely holding every accepted fix until the whole ARC-12 closes. A temporarily reduced worker count is valid only with the exact active reservation or resource bottleneck and the next event that reopens admissions. Integration backlog is a reason to reserve an actual integration slot, not permanently limit independent authors to two.

**Useful throughput and continuity.** Prioritize repaired V1 public behavior and shortest complete WO acceptance paths. Report actual active product fronts separately from reviewers, protocol repair, heavy runs, and integrated results. An Alert weight patch is not all ACT-07; an instrument patch is not its consumer corrections; a commit is not a WO closure. Keep queued precise decisions and unaddressed V1 findings visible in the existing owning records. No arbitrary two/four-agent quota, no requirement to launch all findings at once, no second roadmap or supervisory agent. Quality, reviewed contracts, phase controls, truthful receipts, machine headroom and available quota are the real limits. Continue autonomously at delivery events; ask the owner only for genuine new authority, while unaffected work proceeds.

### Delivery checklist and bounded integration windows

Follow-up clarification, owner-requested verification of the approved plan, 2026-10-27. These are completion predicates in the existing packet/progress records, not a new tracker or new WO states. The dated snapshot/terminal may use 2026-10-28 UTC.

- [ ] **Admission:** named WO/ACT/finding, current source and full read/write closure, phase eligibility, effective writer/model/effort, separate reviewer, declared shared reservations. An inherited hypothesis has a discriminating reproduction before repair.
- [ ] **Implementation:** smallest complete correction, relevant positive/negative controls, retained public behavior, owning documentation and version/migration implications. No synthetic PASS by deleting capability or changing floors.
- [ ] **Review:** independently accepted exact candidate plus evidence; unresolved findings remain HOLD. A CODE ACCEPT is neither integration, browser PASS nor WO DONE.
- [ ] **Integration:** name the next concrete safe HEAD/index checkpoint and blocked input closure for each accepted patch. Do not defer ACT-01/ACT-15 or future accepted corrections merely until the whole ARC-12 closes. If changing HEAD would invalidate a reserved ARC-12 run, complete that bounded run/restoration first, integrate in the next safe slot, then rebind only affected successors under the existing protocol.
- [ ] **Heavy scheduling:** book the next finite heavy job and entry conditions. If its legitimate admission requires other CPU work to drain, stop admitting new conflicting CPU jobs until that job starts/completes; do not continuously refill the queue and starve PROOFS. Existing actors finish naturally. Read-only/lightweight work can continue only when its resource and input footprint is permitted. A reviewer label does not make CPU-heavy tests lightweight.
- [ ] **Commit:** exact reviewed pathspec, HEAD/index/hash guards, foreign WIP preserved, focal verification and functional commit; documentation changes have their own explicit scope. Commit the approved roadmap policy at the safe documentation/integration slot. No blanket staging or premature source application.
- [ ] **Accounting and cleanup:** source accepted / integrated / verified / WO closed remain separate. Record remaining prerequisite and next receiver. Retire only redundant derived copies without present/future consumers; preserve original receipts and recoverability.
- [ ] **V1 exit:** all retained clauses in the 29-WO table plus confirmed historical-contract corrections, real package/four-theme/SSR/browser/a11y/isolation proof, budgets/freshness, independent review and two identical scoped-certifier outcomes. No app fixture impersonates installed adoption. Release permission is separate.
- [ ] **V2 exit per retained obligation:** named app/data owner, real installed-consumer or migration/history/CAS/restore evidence as applicable; exact full-WO acceptance, identity decision and behavior-neutral normalization evidence. No automatic promotion from V1 proof or authority to edit apps now.
- [ ] **V3 exit per selected capability:** actual live capability lifecycle/device/performance/accessibility evidence and real receiver where the existing contract requires it. Full GAT-09 remains blocked until its complete original programme barrier passes. Unselected new features need their own owner scope; no perpetual expansion before release.

If all independent source packets are blocked, name their exact reservations/phase refusals and the terminal event that frees one. Do not invent extra preparation to keep agents busy. If accepted patches pile up, prioritize the safe integration window over opening further writers. Queue genuine owner questions; never ask again whether the approved V1 cut or parallel execution is wanted. Keep the live goal's compact state and next packets current before compaction, with immutable receipt paths; no restart or context-driven re-audit of accepted work.

### Admission and completion of this owner instruction

At the next safe instruction boundary, acknowledge the new scope in the existing operational record, identify the current active reservations, and name the first independent correction and its writer/reviewer. Proceed autonomously; no need to ask the owner to reapprove this V1 scope. Keep active ARC-12 proofs running. Implement the reviewed machinery packet when its singleton reservation is safe; no manual bypass if it is blocked. All phase/WO/full-programme state changes remain evidence-based and use their sanctioned controls. V1 completion means accepted M-DS2 under the adopted mode, followed by a separate authorized package release; downstream and optional obligations remain visible in the same roadmap.


## Prior temporary owner succession — 2026-10-08 (superseded by 2026-10-20)

The human owner appointed Codex as the temporary sole DT, auditor and local
integrator on 2026-10-08 after Kimi Admin exhausted its quota. Claude Admin
(`admin@rottay.com`, effective model `claude-opus-5-5`) remains the source writer;
independent code review uses a distinct verified session. Codex does not become
a continuous source writer. This narrow assignment supersedes the Codex
exclusion only for this owner-requested continuation.

Starting checkpoint: `47a0aac05`, main, 138/168 DONE. Preserve delivered
`w26-ret06-da` and `w26-f54-gate-l1` packets and foreign documentation WIP.
Shared index, registry, generators and heavy verification remain singleton.
No apps, branches/worktrees, push, publication or deployment are authorized.
The existing DAG, acceptance and proportional-validation policy stand.

At 13:00 America/New_York on 2026-10-08, stop opening new implementation lots.
Do not interrupt running writers: finish and independently review their finite
packets, preserve any HOLD, and reach the next integration checkpoint. Transfer
the DT seat to Kimi only after that barrier is met and recorded. There must
never be two active integrators. Until then Codex supervises at ten-minute
intervals, without intermediate polling; afterwards the Codex exclusion resumes.

## Prior owner succession — 2026-10-04 (superseded by 2026-10-20)

The owner appointed Kimi as the sole active DT, coordinator, auditor and
integrator of the current programme, directly on main in
`/Users/daniel/Developer/Rottay/ui-design-system`, replacing the Claude
assignment of 2026-10-03 below. Every ownership statement in the execution
policy (registry, shared generators, validation windows, index, functional
commits) now reads "Kimi DT"; its execution order and product invariants
stand verbatim.

- **Handoff barrier met:** checkpoint `bb663f566` (134/165 done, 3
  in-progress); the outgoing DT declared `READY_FOR_KIMI` with no active
  writers or integrators, and HEAD/branch/index/worktree were verified
  against the handoff before any write.
- **Writer:** real Claude Opus on the owner-authorized account
  `admin@rottay.com` (profile `claude-admin`), model `claude-opus-5-5`; the
  effective account and model receipt are verified on every dispatch, never an
  alias. (Until 2026-10-04 evening the writer used `daniel.avila@rottay.com`;
  its weekly quota exhausted and the owner ordered claude-admin.)
- **Review:** the DT never approves its own product code. Independent review
  uses a separate Opus session with a real receipt.
- **Codex:** the 2026-09-19 restriction applies in full. No CLI/API/MCP call,
  message, hook or monitor targets it; only the owner asks it for independent
  audits.
- **Scope:** DS repo only, on main; no branches or worktrees; applications are
  read-only consumers; **no push**, package publication or deployment.

The sealed Modern Rescue programme, registry, DAG, phase controls,
denominators and acceptance criteria are unchanged.

## Prior owner succession — 2026-10-03 (superseded by 2026-10-04)

The owner appointed Claude as the sole active DT, integrator and audit
coordinator of the current programme, directly on main in
`/Users/daniel/Developer/Rottay/ui-design-system`, replacing the temporary
Codex assignment of 2026-10-02 below for this continuation only. Every
ownership statement in the 2026-10-02 section (registry, shared generators,
validation windows, index, functional commits) now reads "Claude DT"; its
execution order and product invariants stand verbatim.

- **Handoff barrier met:** checkpoint `e74bf6e31` (134/164 done, 3 in-progress);
  the last delegated Kimi packet, the read-only RET-01 compat-display census,
  was terminal with its receipt before any successor writer was dispatched.
- **Effective account by receipt:** normal `claude` on
  `daniel.avila@rottay.com`, model `claude-opus-5-5`. The intended
  `claude-admin` profile failed authentication twice on 2026-10-03; the owner
  explicitly authorized this account instead.
- **Review:** real Opus writers; the DT never approves its own product code.
  Independent review uses real Fable when its model receipt is verified,
  otherwise a separate Opus session with a real receipt. No model is relabelled.
- **Codex:** its goal stays paused; the 2026-09-19 restriction applies in full.
  No CLI/API/MCP call, message or monitor targets it; only the owner asks it
  for independent audits.
- **Scope:** DS repo only, on main; no branches or worktrees; applications are
  read-only consumers; **no push**, package publication or deployment in this
  continuation. A lot that needs `docs-engineering` writes records the need and
  asks the owner for that write set.

The sealed Modern Rescue programme, registry, DAG, phase controls, denominators
and acceptance criteria are unchanged.

## Prior owner succession — 2026-10-02 (superseded by 2026-10-03)

The owner appointed Codex as the autonomous DT, implementation owner, reviewer
and integrator of the current programme, directly on main in
`/Users/daniel/Developer/Rottay/ui-design-system`. This supersedes older Codex
exclusions, coordinator assignments and checkout paths for this continuation;
the sealed Modern Rescue programme is not reopened. Kimi 2.8 may assist with
bounded research, mechanical edits and other suitable independent packets.
Claude Opus may join after the owner-confirmed quota reset on 2026-10-03 at
03:00 America/New_York. Verify each executable, account and provider model;
never label a Kimi process Opus or Fable.

Codex owns the registry, shared generators, validation windows, index and
functional commits on main. Product code written by Codex receives an
independent review before integration. Preserve delivered WIP, follow the
existing dependencies, close complete outcomes and keep all acceptance
thresholds. Parallelize useful packets with disjoint write sets and stable
contracts. Use focal checks per lot and complete verification at milestones.
Applications are read-only consumers now; their adaptation follows the DS.
Existing authorization for audited publication is unchanged; no force-push,
package publication or deployment is inferred from this succession.

### Autonomous goal — execution order and product invariants

This is an execution policy for the existing registry, not a second backlog.
Live dispositions and recovery receipts are appended to each WO's `progressLog`;
never replace its original findings, supersedes, dependencies or evidence history.

1. Preserve and integrate delivered work. Complete INV-06 on real surfaces,
   including loading/empty/error states, SSR, actual primary actions and accessible
   names. The pilot is not acceptance for all recipes. Correct a falsified closure
   with `reopen`, retaining its old evidence; do not erase or reimplement it.
2. Complete RET-01's remaining public-door and capability dispositions. Preserve
   useful renderers, metadata, live preset roles and isolation contracts while
   removing duplicates. Refresh supplier/census/package evidence with their real
   producers on the integrated candidate; no hand-edited measurement or widened
   budget to make a regression green. Then execute RET-04's physical normalization
   with atomic family modules, folder indexes and declared ownership.
3. Complete EVI-02 and the remaining derivation/family dependencies. A tenant
   decision must have a measured, anatomically appropriate fan-out through family
   derivers to real consumers. One compiler and one catalogue own the flow; neither
   the old manifest nor the count of tokens proves customization. Measure tenant
   differences beyond palette using rendered output, not only emitted variables.
4. Follow `dependsOn` through remaining product contracts, reusable styles,
   traceability, accessibility, RTL/i18n, responsive/mobile and release work.
   Vertical defaults and database-sourced tenant decisions use the same admission
   and compilation path. Standard/Pro control editing permissions, not whether a
   tenant receives complete tokens or a premium-quality interface. Internal
   branding controls remain developer-owned; user choices are bounded options.
5. Certify milestones on a frozen candidate and close WOs only with their full
   acceptance evidence. Applications remain read-only during DS implementation;
   document public breaks for later app adaptation rather than blocking this
   programme on app migration. Keep the existing engines; prioritize the custom
   engine without inventing legacy compatibility paths.

Within a dependency level, dispatch as many useful, disjoint packets as capacity
and quality allow. Each writer owns its files and focal regressions; only the DT
owns shared-contract changes, generated authorities, heavy validation, staging
and commits. Review deliveries independently, return precise corrections, then
commit by functionality on main. Run package/build/browser/full-suite checks for
relevant milestones or artifact changes, not for each spacing edit. Wait for
delivery events; no recurring status polling, duplicated censuses or repeated
microaudits. A finished packet triggers the next unblocked packet, not an idle
handoff. Escalate only genuine new authority or product ambiguity, preserving
work and continuing independent unblocked lanes.

- **Status**: canonical operative backlog. Takes the `modern` engine from its audited state
  ("hand-made, mid-tier; near-indistinguishable from `rustic`") to the Quiet Premium target.
- **Normative law** (read FIRST, it is the spec every WO implements): the modern-engine
  specification at
  [`../../docs-engineering/engineering/design-system/runtime/engines/modern/README.md`](../../docs-engineering/engineering/design-system/runtime/engines/modern/README.md).
  Its evidence base is the visual audit at
  [`../../docs-engineering/archive/audits/2026-07-06-modern-engine-visual-audit-davila.md`](../../docs-engineering/archive/audits/2026-07-06-modern-engine-visual-audit-davila.md).
- **The work** lives in the registry-linked lanes below. Counts and live state are derived in
  [`STATUS.md`](./STATUS.md) and are deliberately not duplicated here:
  - [`engine-modern.md`](./engine-modern.md) — modern-engine and release/theme-source work;
  - [`craft.md`](./craft.md) — interaction, adaptive/mobile, motion, charts, AI and spatial craft;
  - [`gates.md`](./gates.md) — visual, package, whitelabel, accessibility and program-truth gates;
  - [`tokens.md`](./tokens.md) — generated artifacts, color/token governance and legacy cleanup;
  - [`architecture.md`](./architecture.md) — behavior, ownership, package and access architecture;
  - [`skin-adoption.md`](./skin-adoption.md) — Stage-1 extraction and retroactive conformance evidence.

- **Dispatch first:** [DS-only parallel execution — owner amendment 2026-09-17](#ds-only-parallel-execution--owner-amendment-2026-09-17)
  classifies the remaining WOs, shared-file conflicts, serial boundaries and verification windows.
  It is scheduling policy inside this roadmap, not a second backlog or a change to acceptance.

  > The commercial-surfaces program (the showroom Monochrome Signature relaunch of `showroom.rottay.com`
  > + the shared `@rottay/design-system/commercial` kit, WO-SHW-01..05) lives in `roadmap/commercial/` —
  > isolated by owner decision 2026-07-07, own machinery `pnpm roadmap:commercial`.
- **Proposals inbox**: [`proposals.md`](./proposals.md) — ALL rounds approved by the owner
  2026-07-07 and converted to WO blocks, except P-07 (withdrawn). The inbox is EMPTY pending new
  proposals; new items still follow the same law (owner approves 1:1, then a `### WO-` block +
  registry entry).

## Seventeen rules learned the hard way (2026-07-09 … 2026-07-10)

Each of these was paid for. They are not style preferences.

1. **A work order is a HYPOTHESIS, not a law. The code is the law.** A survey of
   13 work orders on 2026-07-09 found 7 whose premise the code contradicts.
   Three had already been caught mid-execution: WO-ENG-08 assumed DaisyUI was
   dead (1,675 lines had real consumers), WO-GAT-03 specified side-by-side tenant
   columns (tenant, theme and `dir` are all `<html>`-anchored, so they are
   impossible), WO-ENG-12 blamed the Table primitive for an overflow that lived
   in the gallery cell above it. **The first step of every WO is to try to
   falsify itself.** `roadmap:check` proves a WO is consistent; nothing proves it
   is true. When a premise falls, amend the WO in place with an `AMENDMENT` block
   citing `file:line` — leave the original claim standing so the correction is
   auditable.
2. **A gate authored before the code was read is a trap.** WO-ENG-11's gate
   ("all section-12 counters at target") is unsatisfiable — `--check` does not
   verify those targets, and two of them are documented as unreachable.
   WO-TOK-03's gate (`grep -ri daisyui == 0`) contradicts `pnpm test`. A gate
   that cannot go green forces either a lie or an amendment. Write the gate after
   the survey.
3. **Every new gate ships with a DRILL that proves it bites.** Introduce the
   defect the gate exists to catch, watch it go red, revert, watch it go green,
   and record both in `done --evidence`. WO-GAT-03 did this and found that its
   own derivation probe was circular; the circular version reported 1 violation,
   the corrected one reported 7. A counter that has never been red is not a
   counter.
4. **Executors are edit-only; the orchestrator holds the build AND the status.**
   Build, test, and Playwright are one shared resource over one working tree. Two
   agents building concurrently produced a `.next` compiled against a half-written
   `dist`, a 500 on the probe route, and 43 spurious visual failures. And on the
   same day an executor marked its own WO `done` — no build, no `--check`, no
   sighted review. Both fences are structural, not advisory.

5. **A harness that watches for errors is not a harness that watches for
   content.** The first sighted capture of `themanagementmiami` wrote a
   plausible-looking, entirely blank PNG, and the capture script called the run
   clean: it asserted no page errors and no 4xx, and a dev-server rebuild had
   blown the React tree away between the readiness check and the shutter. Assert
   what you came to photograph is on the page **at the moment of the shot**, not
   that nothing threw on the way there. This is the same shape as the circular
   probe and the single-emitter audit: the check ran, the check was green, and
   the check was not looking where the defect was.

6. **A check that cannot see new files is a check looking where the defect is not.**
   Three times this program's own verification missed something because of *how*
   it looked, not because it did not look. `git diff` does not show untracked
   files, so an escape-hatch grep over the diff reported "none" while two
   `@ts-expect-error` sat in a new test file. `git show HEAD:` was never run
   before blaming an executor for a placeholder change that a prior commit had
   made. And an assertion that read `background-image` for the word "gradient"
   passed with the effect dial at zero, because the string survives when every
   alpha inside it does not. **Verify with the instrument that can see the thing
   you are looking for**, and prefer measuring the artifact over reading its name.

7. **`git add <paths>` does not un-stage what is already in the index.** `git mv`
   stages its rename immediately. An agent moved five files while the
   orchestrator committed an unrelated work order by explicit path, and the
   commit swept the renames in **without their import fixes** — a commit that
   does not build on its own, named after a work order that had nothing to do
   with it. Before committing during a parallel wave, `git status --porcelain`
   and look for `R`/`A` entries you did not stage. Explicit paths protect the
   *contents* of a commit, not its *index*.

8. **A parity test that regenerates an output and compares it to the committed
   copy cannot see a lie the two share.** The generator baked
   `brand-themes/<slug>.ts` into every artifact header. After the themes moved,
   that line named a file that does not exist — and `first-party-artifacts-generated`
   stayed green, because the generator and the artifact were stale *in unison*.
   Regenerate-and-diff proves the artifact is a build product. It proves nothing
   about whether the build product is true.

9. **`dist` drops an export no entry reaches.** A build script imported
   `APCA_BODY_TEXT_MIN_LC` from a private dist path. The constant is exported in
   the source and Vite tree-shook it out of the bundle, because `_internal` is
   not a package entry. The script failed at run time with a correct source tree
   and a green typecheck. If a script must read a value the library owns, that
   value has to be reachable from a real entry — re-export it from the module
   whose concern it is, and the bundler will keep it.

10. **No design-system cascade layer can paint a component.** `foundation/base.css`
   declares seven layers (`rottay-reset` … `rottay-responsive`) and then imports
   Tailwind, whose own `theme` / `base` / `utilities` layers are absent from that
   statement and therefore sort AFTER all seven. Layer order beats specificity, so
   a rule in `@layer rottay-engines` at (0,2,0) loses to preflight's
   `button { background-color: transparent }` at (0,0,1). Measured on the shipped
   bundle: the layered rule changed nothing; the identical rule, unlayered, painted.
   That is why both interactive engines painted inline. A skin must be **unlayered**.
   (P-47.)

11. **Two classes is the floor for any rule that sets `border-color`.** Every tenant
   ships an unlayered `html[data-tenant]:not([data-theme]):not(.light) * { border-color: … }`
   at (0,3,1). Every single-class component rule loses its border to it. A component
   that names its own border must reach (0,4,0) — two classes plus the anatomy part
   plus the variant. (P-48.)

12. **A baseline that never hovers certifies nothing about hover.** The 48 visual
   baselines photograph pages at rest. A skin could lose its entire hover rule, its
   press transform and its focus ring with all of them green. `states.spec.ts`
   records 216 computed cells across the current tenant × engine × variant ×
   state matrix (the older Button-only subset contains 132), and it found
   a real bug the moment it existed: the modern Button's hover set `borderColor` as a
   longhand over a `border` shorthand, and once the pointer left, the colour fell
   through to the cascade. Settle by THREE agreeing samples, not two — a spring
   approaches its target asymptotically and two samples can agree on a plateau it
   has not left.

13. **Fix a rule in every emitter, then look for the third.** `token-consumption-ratio`
   read a component's `.tsx` alone, so a skin consuming 169 `--ds-button-*` tokens
   measured zero. Fixing `scripts/audit-integration.mjs` left its twin,
   `token-fidelity.test.ts`, red — and the suite, not the reasoning, is what caught
   it. Grep for the rule's *sentence*, not its file.

14. **Look at it.** On rottay, the classic engine painted a white primary-button
   label on a white primary button — 1.00:1, an invisible label on the platform's
   own brand. It shipped. 118 gate assertions were green, because none of them
   selects an engine and the antd button does not carry the class the contrast
   gate looks for. It was found by opening a screenshot of a page nobody had
   photographed and seeing an empty white rectangle. A sighted check is not a
   formality at the end of a WO; it is the only instrument that has no schema.
   (P-52.)

15. **A token whose name says `shadow` is not a colour.** The modern Input's focus
   ring was written `outline: var(--ds-focus-ring-width, 2px) solid
   var(--ds-input-shadow-focus, var(--ds-focus-ring-color))`. That variable holds
   `0 0 0 3px rgba(255,255,255,0.10)`. Substituted, the declaration is invalid at
   computed-value time and the browser drops the whole thing — the `var()` fallback
   never runs, because the property IS defined. The outline has never painted on
   any tenant, and the ring the user sees comes from somewhere else entirely. An
   invalid CSS declaration fails silently, in every direction. (P-54.)

16. **A flaky test is a race with a name — and a RATE, not an anecdote.** "17
   failures on one run, 21 on the next" was treated as noise for months. Two files,
   run together, expose it: a `findByRole` with a 1000ms default racing a
   `React.lazy` engine chunk that needs longer under CPU contention. Two failures
   out of two observations got this written down as "deterministic"; measured, it
   is 3 in 11. The distinction is load-bearing, because a candidate fix passed that
   reproducer 15 times in a row while breaking 498 of 795 tests in a subset nobody
   had run. Measure the class, never the instance. And the fix is determinism,
   never a wider timeout — a widened window still closes on a slower machine.
   (P-49.)

17. **A counter the baseline has never heard of gates nothing.** `--check` compared
   an unbaselined counter against `Infinity`, so it could not rise and could not
   fail. It measured, printed a number, and guarded air. Every new counter must be
   seeded in the same commit that adds it, and `--check` now refuses one that is
   not.

## The current failure baseline (measured, not assumed)

> **AMENDMENT (2026-07-14, 2.19.0 release candidate):** the 17-test ledger
> measured on 2026-07-09 was correct for that checkout, but it is not the current
> allow-list. After the Stage-1 migrations and explicit root/core version sync,
> a single combined run of the exact remaining files reports **10 failed files,
> 13 failed tests and 82 passed tests**. This supersedes 17 as the release
> threshold; it does not rewrite the historical measurement.

The current set is exact:

| Count | Tests | Observed failure |
| --- | --- | --- |
| 6 | `TimePicker.integration` (×3), `TimePicker.modern-engine-advanced` (×2), `TimePicker.real-engines` (×1) | Modern's expected time inputs/handlers are absent; rustic returns the no-seconds value `09:30` where the test expects `09:30:00`. |
| 4 | `List.rustic`, `Statistic.rustic`, `Typography.modern`, `Popover.modern` advanced coverage | Assertions still require prior inline paint, utility classes or DOM/class shapes instead of the rendered skin contract. These tests remain red; the release does not weaken them. |
| 1 | `source-governance` public token mirror | Six runtime files still import or export the public token mirror. Root/core version parity is now green. |
| 1 | `whitelabel-field-coverage` | BitHire's tenant CSS still contains 25 `.ant-` selectors. |
| 1 | `PatternCommandPalette` modern advanced coverage | The modern case hits the 30-second timeout under the combined run; classic and rustic pass. |

The full suite immediately before the two release corrections reported
`502/513` passing files, `7690` passed tests, `21` skipped tests and `15` failed
tests across 11 files. The stale Card token-fidelity assertion was corrected to
read the engine together with its skin and proved 9/9; root/core version parity
was fixed and proved in the source-governance
focal. Those two corrections produce the 13-test set above, which was rerun as a
single ledger command.

The earlier **17** remains historical evidence from `9d59a97a`; it must not be
quoted as the current threshold. Conversely, the current allow-list is not a
waiver: no test outside these ten files may go red, and each listed defect must
be fixed or deliberately respecified in its own work order.

## State model (this plan cannot rot silently)

- **The spec** lives in the lane files: the six original lanes (`engine-modern.md`, `craft.md`,
  `gates.md`, `tokens.md`, `architecture.md`, `skin-adoption.md`) plus the nine post-C4 audit lanes
  adopted on 2026-09-05 (`canon-close.md`, `consumer-contract.md`, `catalog-door.md`,
  `derivation.md`, `family-cuts.md`, `emission-mount.md`, `platform-invariants.md`, `retire.md`,
  `evidence-graph.md`). **State** lives
  in [`registry.json`](./registry.json) — the ONLY place a WO status exists. **[`STATUS.md`](./STATUS.md)
  is generated** (`pnpm roadmap:status`); never hand-edit either.
- Statuses change ONLY through `scripts/maintain/roadmap/status/index.mjs` (`claim` / `progress` / `done` / `reopen`), which
  mechanically enforces the dependency graph, the `mustLandWith` sequencing hazards, and mandatory
  evidence on `done`. Do not fight refusals — they encode the sequencing law.
- `pnpm roadmap:check` (registry and lane file must agree: every WO heading registered, titles/lanes/
  deps valid, no cycles, no done-without-evidence) is the consistency gate. Run it before handing off.
- Anti-sprawl law: new work = a new `### WO-` block in its lane file + a registry entry
  (`roadmap:check` forces the pairing). **No new plan documents** — not here, not in docs-engineering.
  If a doc is not the lane, the registry, generated STATUS, or the spec, it does not exist. The ONE
  sanctioned exception is [`proposals.md`](./proposals.md) — the owner-review inbox (owner request
  2026-07-07): items there are NOT work until the owner approves them 1:1 and they become WO blocks.
- Dispositions of superseded WOs live in `notes` (`ABSORBED by`, `REFORMULATED by`, `REPLACED by`,
  `PAUSED until`) and in `dependsOn`; they are not statuses. `STATUSES` stays `todo | in-progress | done`.
  A superseded WO is closed when its replacement lands: `claim WO-old`, then
  `done WO-old --evidence "closed by WO-XXX-nn <commit>"`, in the same certified lot.
- `new_work` exception (owner-ordered spec/contract artifacts, 2026-09-05): `roadmap/kit-2026-09.md`
  (WO-CAT-01), `roadmap/family-cut-template.md` (WO-FAM-00), and the consumer contract —
  `packages/core/docs/consumer-contract/index.md` (WO-CON-01) with its
  [`protocol/index.md`](../packages/core/docs/consumer-contract/protocol/index.md) (WO-CON-05, the
  two-track operating protocol: release discipline, version pinning, and the ONE path by which an
  application asks for a capability — a `### WO-` block in its lane file, never a `_shared/` bridge)
  — are specifications and a consumed contract, not plan documents. Nothing else may be added
  outside a lane file.

### Execution and review policy — owner amendment 2026-09-12

<!-- execution-policy:start -->
**Mandatory execution policy (roadmap/README.md, owner 2026-09-12).**
This amendment supersedes older blanket instructions to run the full suite or
full certification for every lot; it does not waive a WO's substantive acceptance
criteria or final certification. State and dependencies remain in the existing
registry; denominator definitions and authorities are unchanged.

- **Writer and auditor (succession-aware):** real Opus is the primary writer;
  exactly one owner-authorized DT is the coordinator, independent code auditor
  and local integrator. Kimi is the requested successor; preserve the outgoing
  coordinator's in-flight packets until the explicit checkpoint handoff, never
  start a competing DT. The fixed admin-account assignment of 2026-09-14 is
  historical, superseded by later owner account changes; use the latest explicit
  authorization and record the effective profile/account, not an old prompt's
  label. Available quota is not permission to switch billing accounts silently.
  Nobody approves their own implementation: if the DT exceptionally writes
  product code under an explicit write-set, that code
  requires another independent auditor before integration. The ordinary
  implement/audit/integrate cycle does not wait for Fable or Codex, and no ACCEPT
  may be fabricated in their name; the shared-core review rule below is unchanged
  and still binds where it applies. Verify the executable, profile, effective
  account and real model identifier before each dispatch, never a terminal label.
  Record any succession once in the existing WO progress trail.
- **Before shared-core design is adopted:** Kimi and independent Fable review the SAME
  debrief: WO, base, proposed contract, owners/write set, invariants, alternatives
  and executable acceptance. Core means catalog/permissions, precedence, derivation
  and channel ownership, compilation/emission, artifact identity/persistence,
  SSR/hydration/public boundaries, shared family kernels and acceptance instruments.
  Each records ACCEPT or HOLD with evidence and authorship conflicts. Resolve
  disagreements before integrating the affected core change. A writer's agreement
  is not an independent audit. Missing reviewers mean pending, not implicit consent.
- **Current core checkpoints:** apply that review to the changed shared contracts
  in WO-CON-07, WO-EMI-02, WO-DER-06, WO-INV-04/07 and WO-EVI-01/02/04, and to any
  other WO changing the core defined above. Completed contracts are not reopened
  just to collect retrospective signatures; reopen only for a concrete finding.
  WO-FAM-01 consumes the agreed contract as the pilot. Later family cuts reuse it;
  only a proposed contract delta returns to the active reviewers. Codex is excluded
  by the owner's 2026-09-19 restriction below, not an absent pending reviewer.
- **Before each lot is integrated:** independently review the exact candidate diff
  and run focal tests of new/changed behavior and directly affected consumers,
  appropriate type checks and the applicable contract gates. Record commands,
  scope and results. New regressions cannot be hidden by widening baselines.
  Browser/first-paint claims require browser evidence from the lot's own package.
  Design approval does not approve unseen code. Preserve active drafts/checkpoints;
  never reset or overwrite another writer's work.
- **At important milestones:** run the complete suite on a pinned integration
  commit for the first end-to-end pilot, relevant family/shared-core wave closures,
  and final certification/release. Reuse that result for the lots it covers, not
  one full run per writer. Expand a focal regression scope when a concrete
  cross-cutting failure warrants it. Never represent focal evidence as a full pass.
- **Parallelism and cost:** one complete component per writer (deriver, skin,
  runtime and tests) within the same block, only with disjoint files and stable
  shared contracts. Shared compiler/catalog/registries have one owner. Serialize
  integration/commits and heavy builds/suites/browser runs on this host; wait for
  completion events instead of continuously polling.
- **DS-only focus and mandatory safe parallelism (owner 2026-09-17):** read
  `roadmap/README.md` section **DS-only parallel execution — owner amendment 2026-09-17**
  before dispatch, and include its applicable WO row and conflicts in the bounded brief.
  There is NO fixed agent-count ceiling: dispatch every useful independent packet
  that has satisfied dependencies/phase permissions, a stable consumed contract,
  an exclusive write set, an independent reviewer and a scheduled validation slot.
  If any condition is unknown, do not guess or dispatch overlapping writers.
  Route that dependency to its owner and dispatch another ready packet instead.
  Work on the owner's active execution checkout on main (currently
  `/Users/daniel/Developer/Rottay/r4-recon-opus`); historical prompts naming
  `/Users/daniel/Developer/Rottay/ui-design-system` are not a checkout-switch order.
  Do not create coordination branches/worktrees or restart completed work.
  No new unrelated programme work; preserve any already-running foreign work.
- **Evidence and landing:** record debrief version/hash, each review and the tested
  candidate; link them from the existing WO progress/done evidence via the roadmap
  script. No shadow backlog or new status. The sole DT lands audited functional commits
  locally on main; never push, never restore directories, never sweep foreign
  staging. No emojis or AI attribution; keep applicable product documentation
  current. The required independent agreement
  is NOT yet obtained merely because this policy is documented.
## Owner continuation amendment — 2026-09-19: closure-first execution

This owner instruction changes execution and publication policy, **not the 161-WO
denominator, source authorities, dependencies, phases or acceptance thresholds**.
It supersedes older role/account/worktree/no-push prose for the current continuation;
it does not reopen the sealed Modern Rescue programme.

- **Roles:** Kimi is the low-overhead DT/integrator; real Claude Opus is the product
  writer using normal `claude` on Daniel.Avila, not `claude-admin`; real Fable is
  the independent functional-lot auditor. Verify effective model receipts, not
  terminal names. Writers never stage/commit; no self-audit or fabricated verdict.
- **Codex is completely outside the loop (explicit owner restriction):** only
  the human owner may ask Codex to work. Kimi, Claude, Fable and their agents must
  not invoke Codex as DT, writer, auditor, consultant, checkpoint approver or
  quota fallback. No Codex CLI/API/MCP calls, task messages, callbacks, hooks,
  watchers, scheduled checks or notifications. Do not wait for its signature.
  Remove any such routing from future dispatches; reuse historical findings as
  static evidence only. This supersedes every older Codex/three-reviewer rule,
  including copied briefs and sealed historical role descriptions. Independent
  audit remains required through Fable; do not replace it with self-approval.
- **Checkpoint first:** preserve the already-landed FAM-11 A and any active B
  writer. Stop new dispatches only for the bounded checkout transfer, not by
  killing a writer or discarding its draft. Then resume autonomously.
- **Canonical checkout:** restore `/Users/daniel/Developer/Rottay/ui-design-system`
  on `main`. The current execution worktree `r4-recon-opus` is on main; the original
  path is detached with preserved staged/unstaged/untracked work and holds the
  shared `.git`. Follow the verified preservation/transfer protocol linked below;
  no reset/clean/forced checkout, blind reintegration of old changes, or deletion
  of a directory that still owns Git data, processes or unique work. Do not create
  further branches/worktrees without an explicit owner instruction.
- **Closure before WIP growth:** each active WO gets a finite checklist of its
  existing acceptance, valid evidence/input hashes, remaining source/proof/owner
  decisions and one responsible actor. Close immediately when earned; do not wait
  for every active WO or invent additional scope. Debt-ratchet PASS is not final
  acceptance. Superseded WOs close with their actual replacement receipt through
  the existing phase/authority machinery, never by duplicate implementation.
- **Parallel complete packets:** use as many Opus writers as safely useful on
  disjoint complete family packets (component + deriver + skin + tests). Do not
  split one capability across competing writers. Shared catalog/registration,
  direction/keyboard/adaptation seams, generated artifacts, roadmap and Git index
  have single owners. Serialize heavy host validation. Fable reviews coherent
  lots; reuse unchanged valid evidence and run focused tests per lot, broader
  build/suite/browser certification at important combined checkpoints.
- **Publication:** after the independent audit and applicable checks, commit the
  complete reviewed functional packet on main and publish to `origin/main` under
  this newer owner instruction. Reconcile existing outgoing history and remote
  ancestry before the first push; never force-push. Report local and remote SHAs
  separately. This is not authority to publish an unreviewed or incoherent tree.
- **Autonomy:** wait for writer/reviewer completion events, not repeated terminal
  polling. Continue eligible work after each closed lot. A concrete owner decision
  blocks only its affected packet. Notify meaningful closures, milestones, material
  failures or required decisions; do not spend tokens on empty progress reports.

The independent audit, corrections and exact reproduction limits live in
`../docs-engineering/archive/audits/2026-09-19-ds-4267a2904-davila.md` and its companion
directory. Read `closure-plan.md`, `git-topology.md` and `HANDOFF-KIMI.md`; technical
agents read only the relevant `architecture-cascade.md`, `families-quality.md` or
`instruments-and-integration.md` sections. The pin is `4267a2904`; preserve and compare
later deltas before repeating a correction. This is an evidence packet, not a second
roadmap. Existing in-progress WOs carry source-specific continuation entries so
`show`/`delegate` expose the necessary next actions without this conversation.

The product outcome remains: equal inherited quality across Standard/Pro, bounded
authoring permissions, meaningful non-color tenant differentiation, one owner per
capability, static/DB/preview/publication parity, accessibility, RTL/i18n and responsive
mobile-web contracts. Final branding and native applications are not silently added
to a family's closure. Milestone C still requires its WOs, findings and indicators.

### Owner-approved styles and tenant history — 2026-09-20

The owner requested reusable cross-vertical styles, family-grouped folder/index
ownership and persistent tenant change history, with real Fable review before
incorporation. The corrected specification received **ACCEPT** from
`claude-fable-5-1`; the durable review is
[`evidence/style-history-roadmap-review/index.md`](../evidence/style-history-roadmap-review/index.md).
**Registered on 2026-09-20 in commit `3084dc0d5`:** the executable specifications
are WO-CAT-04 in [`catalog-door.md`](./catalog-door.md), WO-DER-09 in
[`derivation.md`](./derivation.md), and WO-CON-08 in
[`consumer-contract.md`](./consumer-contract.md). Matching entries are in
`registry.json`, and generated STATUS includes them. The addition changed the
WO denominator **161 -> 164**, preserving prior completion evidence, source IDs,
the 82-item authority denominator, phase controls and their fingerprint.
They belong to `audit-2026-09-05` and therefore gate programme C. The
[`proposals.md` record](./proposals.md#owner-approved-styles-and-tenant-history--2026-09-20)
is historical: do not register duplicates or wait for another owner GO. Use
`show`/`delegate`/`next` and the registry dependencies to schedule the work;
registration is not permission to skip prerequisites or file reservations.

**Registered on 2026-10-03:** the executable specification of WO-RET-06
(Transitional compatibility and transferred closures of the 3.0 line) is in
[`retire.md`](./retire.md#wo-ret-06-transitional-compatibility-and-transferred-closures-of-the-30-line),
with its entry in `registry.json` and generated STATUS. The addition changed the
WO denominator **164 -> 165** (done stays 134; milestone C 64 -> 65), preserving
prior completion evidence, source IDs, the 82-item authority denominator, phase
controls and their fingerprint. It belongs to `audit-2026-09-05` and therefore
gates programme C. Authority: owner ruling 2026-10-03 section 1 and R19; the
WO-RET-01 AMENDMENT of 2026-10-03 in `retire.md` is the adoption record. The
134/164 figure near the top of this file is the historical handoff checkpoint
and is not refreshed.

**Registered on 2026-10-14:** the executable specification of WO-RET-07 (Major
4.0 retirement of the eleven inert caller data-part/data-state props (ARC-12 /
P-88) and the inert commandHomePanelBgStrong theme field) is in
[`retire.md`](./retire.md#wo-ret-07-major-40-retirement-of-the-eleven-inert-caller-data-partdata-state-props-arc-12--p-88-and-the-inert-commandhomepanelbgstrong-theme-field),
with its entry in `registry.json` and generated STATUS. The addition changed the
WO denominator **168 -> 169** (done stays 140), preserving prior completion
evidence, source IDs, phase controls and their fingerprint. It belongs to
`audit-2026-09-05`. Authority: owner decision 20 of 2026-10-14
(DEPRECATIONS-RECEIVER: the scout measured that no existing retire-lane work
order lawfully covers the eleven markers) and owner answer 34 of 2026-10-14
(chrome.shell.commandHomePanelBgStrong admitted to the closed scope by name
under its "disposición explícita de la superficie pública"); an open receiver is
not a retirement done.

**Registered on 2026-10-15:** the executable specification of WO-CON-09 (4.0
adoption: consumers migrate legacy sync SSR to renderResolvedStaticMarkup) is in
[`consumer-contract.md`](./consumer-contract.md#wo-con-09-40-adoption-consumers-migrate-legacy-sync-ssr-to-renderresolvedstaticmarkup),
with its entry in `registry.json` and generated STATUS. The addition changed the
WO denominator **169 -> 170**, preserving prior completion evidence, source IDs,
phase controls and their fingerprint. It is the open receiver of the `lab`
disposition of `./server/static-markup`: admitted with controlled adoption
during the 4.0 interregnum, not experimental. Its programme is
`owner-2026-10-15`, so it does not gate milestone C. Authority: owner decision 6
of 2026-10-15 (`owner-decisions-2026-10-15.md`) and the DT ruling of FIX-W1-CC
part 3; the growth is registered under owner decision 20's allowance. Open
receiver is not adoption done.

Finish current packets without interruption. CAT-04 must acquire the shared
Theme/catalog/ingress reservation; scope approval is not shared-core design
approval: Kimi and Fable must review its implementation debrief under the
existing policy. CON-08 includes the necessary app-bithire persistence/reference
integration under D-31 and is an explicit cross-repo exception to DS-only focus;
other apps receive the contract/recipe, not an unsolicited migration. Existing
ARC-21/CON-06 closures are not expanded retroactively. Keep Codex out of the
execution loop, including these work orders: no callback, consultation or approval
request to Codex. Preserve current main/account/audit/publication rules.

**Owner reaffirmation — completion priority (2026-09-20):** finishing the Design
System is the execution priority. Safe useful parallelism is mandatory, not an
optional optimization: do not leave an eligible complete packet idle solely
because an unrelated WO is still running. Apply the six dispatch checks below,
including real review, memory and validation capacity; increase writers only
while those conditions hold. Prefer finishing near-complete accepted scope and
unblocking shared contracts over growing the number of drafts. Reassign released
capacity at delivery events, not through recurring polling. The new style/history
WOs follow the scheduling rows below and must not interrupt current packets or
skip prerequisites. Never trade away acceptance, independent audit or source
ownership to improve elapsed time; do not repeat unchanged censuses or full
suites where valid focused evidence suffices. No standing Codex supervision.

### Owner-delegated decisions adopted — 2026-09-19

The owner explicitly delegated resolution of the pending owner questions in this
conversation. Execute the **Adopted resolutions** at the top of
[`evidence/owner-decisions-2026-09-18/index.md`](../evidence/owner-decisions-2026-09-18/index.md)
before treating its historical questions as blocked: app-side migrations and
canonical hook retirement; measured public retirements; chart default de-aliasing,
governed 12-slot categorical capacity and removal of the raw colors bypass; the
exact crash-safe error-boundary exception; and the named A1/A2/F2 dispositions.
These decisions authorize bounded implementation, not automatic WO completion
or blanket baseline increases. Existing affected WOs carry a progress reference.
Preserve active writers, respect app/source file reservations, and continue the
remaining DAG autonomously. No Codex consultation or approval is part of execution.

### Owner order — 2026-10-20 (binding summary)

Binding for this DS continuation. The full record is
[Owner order — 2026-10-20: canonical record](#owner-order--2026-10-20-canonical-record).

- **Roles:** Codex ADMIN Sol (`admin@rottay.com`, `gpt-6.1-sol`) is the sole DT,
  coordinator, auditor and local integrator. Real Claude NORMAL
  (`daniel.avila@rottay.com`, exact `claude-opus-5-5`) writes source. Each review
  is a distinct NORMAL Opus session. Verify the account, model and receipt on every
  dispatch.
- **Sequence:** first complete the DS (Modern productive, full cascade;
  Classic/Rustic frozen compatibility). Then four or five test themes that differ
  beyond palette, plus a full DS audit. Only then applications and final branding.
  The current divergence, isolation, a11y, state, responsive, SSR and cascade tests
  on contrasting test configurations stay mandatory now.
- **Supersession for this continuation only:** this order replaces the following,
  and nothing else changes:
  - the 2026-09-19 Codex exclusion ("Codex is completely outside the loop" above);
  - "Kimi is the requested successor";
  - the `r4-recon-opus` checkout line (the checkout is
    `/Users/daniel/Developer/Rottay/ui-design-system` on main);
  - "Do not contact Codex" in the WO-CON-08 delegation prompt;
  - the DS succession prose in `AGENTS.md`, `CLAUDE.md` and `KIMI.md`.

  Product invariants, dependencies, phases, fingerprint, acceptance and
  denominators stay unchanged. No GO, freeze exception or app write is granted.

<!-- execution-policy:end -->

## Owner order — 2026-10-20: canonical record

This is the single full record of the owner order of 2026-10-20. Other locations
point here; the binding summary inside the execution-policy block repeats only
roles, sequence and supersession. Earlier succession sections and owner decisions
stay as written; this record governs only where they conflict on roles or
scheduling.

- **Provenance (observed):**
  - Owner order: `.tmp/ds-codex-admin-2026-10-20/OWNER-PRIORITY-DS-FIRST-20261020.txt`
    (sha256 `e73654cc28360765ad0da2ff7ebd797927d3cddcd96ef71579a16386fd12ce9e`,
    written 2026-10-20 10:40 America/New_York).
  - Succession order of the same day: `.tmp/ds-codex-admin-2026-10-20/START-PROMPT.txt`
    (sha256 `fc18652d23014f6c35a9a1152a9e497515eee0b810fd6e81b041c418efda3bd9`).
  - Barrier: `migration-state.json` status `CODEX_ADMIN_READY`. The quota-blocked
    Kimi ADMIN coordinator was retired at 2026-10-20T12:09Z and is not resumed.
  - Operational record: the section "HANDOFF DT 2026-10-20" of
    `.tmp/ds-kimi-2026-10-14/REGISTRY.md`.
- **Roles:**
  - Exactly one DT and integrator exists.
  - Nobody approves their own implementation.
  - The DTs of other modules are not affected.
  - The `AGENTS.md`, `CLAUDE.md` and `KIMI.md` files carry foreign WIP and are not
    edited by this record.
- **Not postponed:** contrasting configurations are admitted through the normal
  `TenantThemeDocument` door as test configurations. They never become a tenant's
  final design. No tenant component fork and no application identity is chosen now.
- **Closure, not activity:**
  - A lot, a commit or a test count is not a closed work order.
  - Prioritize the shortest complete path to WO-ARC-12 acceptance and the other
    fronts that actually close or unblock work orders.
  - Register an out-of-scope finding with its severity, impact and receiver.
  - Repair at once what blocks or regresses a candidate.
- **Counter honesty:**
  - The DS-only end (milestones M-DS1 and M-DS2) and the downstream application
    obligations stay visible side by side.
  - No work order is deleted, no denominator shrinks, and no DS fixture is offered
    as proof of a database or application installation.
  - The 170 total and programme C stay intact.
- **Phase barrier:**
  - The order authorizes preparing and processing the DS-first framing. It grants
    no GO, no freeze exception and no removal of a technical precondition.
  - Authority and phase changes go only through structured phase controls and a
    reviewed code-and-registry wave-mapping update approved by the owner.
  - Uncovered decisions are queued in [`proposals.md` §G](./proposals.md#g-ds-first-framing-decisions-queued-2026-10-20-pending-owner-review).
- **Execution and quality:**
  - Parallelize finite packets with disjoint write sets. The registry, generators,
    heavy runs, browser runs, index and integration stay singleton.
  - Commit only an accepted current candidate, with independent review, the
    relevant tests and HEAD, index, pathspec and hash guards.
  - No habitual worktrees, copies or branches. No new publication or push
    authority.
  - Do not lower floors or ceilings, disable controls or amputate capability.
    Standard and Pro are permissions, not quality tiers.
  - Invalid historical evidence stays invalid: the old library-path token-audit
    rows were vacuous.
  - Theme-graph 9.74 MB over its 9.68 MB pin is a real red. No fresh-dist claim
    without measurement.
  - Run proportional focal validation per packet and full batteries at real
    milestones.
- **Reporting:**
  - At milestones, report the work orders actually closed, the integrated commits,
    the remaining critical-path acceptance, the effective parallelism and the
    pending decisions.
  - No date is derived from the work-order percentage.
  - Do not ask the owner a broad "continue?".

## DS-only parallel execution — owner amendment 2026-09-17

### Authority and dispatch decision

Owner direction: focus available execution capacity on completing the Design System;
parallelize as much as is safe, with no arbitrary limit of two, three, five or any
other number of agents. Quality and substantive acceptance do not decrease.
This section supersedes conservative *scheduling* defaults, not dependency edges,
phase locks, public-contract approvals, account authorization or WO closure criteria.
It does not authorize terminating other processes, editing other repos, publishing
or pushing. Already-running work is preserved and reconciled at handoff.

Use `registry.json` through `next`/`show`/`claim` to determine current eligibility.
The following tables are conflict/scheduling rules, NOT another status register.
They cover the 47 open WOs observed when this amendment was drafted; a completed
row is not an instruction to reopen it. New scope must enter the existing machinery.
The registry DAG is necessary but insufficient: disjoint files can still conflict
through a changing contract, generated output or shared test/build environment.

**Dispatch only if all six answers are yes:**

1. Is the WO claimable under actual dependencies, phase controls and authority?
2. Is this packet useful now, with no unresolved assumption about its consumed contract?
3. Does one named writer exclusively own its exact files, including tests and skin?
4. Are shared registrations, exports, generated files and read-dependency conflicts assigned?
5. Is a reviewer independent of the implementation assigned, with capacity to review it?
6. Is there an agreed validation/integration window on a stable candidate?

Otherwise record the specific wait in the existing WO progress and choose another
ready packet. Preparation may inspect a future WO read-only, but is not a claim,
implementation permission, speculative contract or proof of completion. A real
block affects its dependency closure, not all unrelated work.

The DT reads the current handoff once, preserves active file reservations, dispatches
bounded packets and waits for completion events. It does not run minute-by-minute
status loops or restart repository-wide audits after every delivery. No worker
commits, stages, claims completion, changes shared contracts unilaterally or borrows
another worker's draft. Exactly one DT owns integration on main.

### Capacity, priority and first dispatch

- **No fixed concurrency cap.** Add writers while there are non-conflicting ready
  packets and real review/validation capacity. More available quota removes a
  billing bottleneck; it does not add RAM, test isolation or reviewer throughput.
  If integration, reviews or host memory become the bottleneck, drain that queue
  before opening more drafts. Do not create idle scouts merely to fill seats.
- **Prioritize unblockers:** first preserve/finish the active R17 correction packets
  under WO-FAM-08 / WO-INV-01 / WO-EVI-02, then the shared contracts that unlock
  several family packets, then complete families rather than isolated token edits.
  The R17 evidence is in
  [`2026-09-17 checkpoint audit`](../../docs-engineering/archive/audits/2026-09-17-ds-814927519-davila.md).
  Reproduce only unresolved findings; never duplicate a repair already landed.
- **Do not wait for all of FAM-08 to start FAM-09/10/11.** These are same-wave
  peers. After checking their consumed contracts against the active correction,
  dispatch their disjoint work alongside the FAM-08 closer and evidence owners.
  One root fix may block its consumers without blocking unrelated family behavior.
- **Illustrative initial allocation, not a quota:** independent FAM-08 residue
  packets; chart contract/families; form/record families; shell/workspace families;
  verification instruments. Add INV-02, INV-03, INV-08, EMI-03 or CON-06 packets
  whenever the reservations below permit. Split further only across complete,
  genuinely independent families, never deriver vs skin vs tests for one family.
- **Do not defer every shared capability until the end:** reserve the DnD/export,
  chart paint, header, i18n, motion and verification owners early. Their short
  reviewed contracts let later family adoption proceed without divergent APIs.

### Remaining programme WOs: parallel work and serial boundaries

All starts require the six-answer check. “Serial” concerns the named boundary,
not a blanket instruction to idle all other agents. Logical paths in lane specs
must be resolved to actual files before dispatch; an entire `components/**` glob
is not an exclusive file reservation for one small packet.

| WO | Work that can run concurrently | Boundary / completion rule |
| --- | --- | --- |
| WO-CAT-04 | Once CAT-03 and CON-06 are done, a bounded shared-contract packet may run alongside unrelated family closers on disjoint inputs. Prioritize the CON-06 prerequisite when it is eligible and its source reservation is free. | One owner for document/provenance/admission/schema. Kimi+Fable approve the core debrief; acquire or wait for EVI-02's ingress reservation. No competing core writers or consumers implementing against an unsettled contract. |
| WO-DER-09 | After CAT-04 and DER-06, separate complete style-data/fixture packets can run together; they can overlap CON-08 when all of CON-08's dependencies are also satisfied and files/read dependencies are disjoint. | Style registry, vertical composition and official generators have one owner. Keep each style's tests with its writer; batch shared registration and serialize artifact generation. Reserve paths against RET-04 before any moves. |
| WO-CON-08 | After its registered prerequisites, use separate DS-descriptor and app-bithire persistence packets once their consumed contract is adopted. The history work need not wait for all DER-09 style data when it consumes the stable CAT-04 contract and controlled fixtures. | One publication/provenance contract owner; no simultaneous edits to a shared app module or generated authority. Adopt the descriptor before dependent adapters, then verify the combined DB/preview/publish/restore path. Serialize browser/integration validation; do not expand into other app migrations. |
| WO-FAM-08 | Complete disjoint data families and named residues; export-kernel work separate from table ARIA work when their files and contracts do not overlap. | One DnD owner, one export owner. Family kernel contracts land before dependent adoption. Own tests stay with the family writer. Keep the WO open until the real family/finding acceptance passes. |
| WO-FAM-09 | Chart cohorts after the shared series-paint/geometry contract is reviewed and stable; alongside FAM-08/10/11. | One owner for chart theme/series resolver, shared geometry utilities and registration. No 18 competing paint implementations; do not split one chart's behavior from its skin/tests. |
| WO-FAM-10 | Form/record, header and lifecycle cohorts on exact disjoint files after common contracts settle. | One header/SurfaceRegion contract owner. FAM-11 reads the settled contract; shared surface builders cannot be co-edited. |
| WO-FAM-11 | Independent shell, search/command and workspace cohorts after common contracts settle. | One keyboard/provider owner; reserve shared headers against FAM-10 and collection/render-dispatch files against FAM-08. |
| WO-INV-01 | Direction/physical-property instrument repairs and disjoint family adoption. | One shared direction/overlay boundary owner; never change frozen-engine behavior indirectly. Family writers apply local RTL changes while they own those files. |
| WO-INV-02 | Catalog/formatter/font work separate from family cuts with the agreed message/locale API. | One catalog/calendar/IME contract owner. Send adoption requirements to the active family writer, not a second repository-wide edit sweep. |
| WO-INV-03 | Global accessibility floor and independent test authoring outside reserved family files. | Coordinate root CSS with EVI/root owners; gate manifest and axe harness have one owner. Component repairs go through their family writer. Actual browser runs use the host validation slot. |
| WO-INV-08 | Reviewed motion kernel and its isolated tests alongside family work. | Adoption in grid, grid-view, kanban or overlays waits for that family's reservation release; a disjoint kernel directory does NOT make its whole WO disjoint. Align FAM-12's API before integration. |
| WO-FAM-12 | Card/auto-fit work on released families, with a stable motion/adaptation contract. | FAM-08 also touches grid/gallery/widget-board. Hand off each shared directory explicitly; no simultaneous writes. Required registry deps still apply. |
| WO-FAM-13 | After FAM-08, FAM-12 and INV-08 are done (and all other declared deps). Independent of unrelated completed-family cleanup. | Sole widget-board/DnD adoption window. Never overlap RET-01 on drag-and-drop; shared DnD is owed by FAM-08, not deferred to this dependent WO. |
| WO-INV-06 | After FAM-10/11 and its responsive dependency are done; independent of unrelated chart work. | Own SurfaceRegion/posture/app-shell adoption window, with CON-06 reservation on shared consumer fixtures. SSR first-paint proof, not client-only simulation. |
| WO-DER-08 | Bounded Studio/draft transport residue independent of settled family skins. | One ingress/Theme/public-callback owner; coordinate compile and migration fixtures with CON-06, EMI-03 and EVI-02. Do not reimplement already landed migration. |
| WO-EMI-03 | Non-CSS emission over a stable ThemeCompilation; independent family skins may progress. | Core review before changing compilation/contracts; never create a second compiler. Resolve overlap with DER-08 and root fixes first; serialize shared artifacts. |
| WO-CON-06 | Migration documentation and exclusive consumer-fixture cases over the stable published seam. | Singleton ownership with DER-08 / INV-06 / EVI-02 for migration code and shared fixtures. DS fixture work is not permission to write consuming apps or release. |
| WO-DER-07 | Technical candidate/probe preparation using governed decisions; may accompany evidence work. | Technical acceptance T1-T6 per the 2026-10-03 AMENDMENT (owner ruling R29); T6, the rendered probe-ground, is owed at the next integration build. D-30 stays NOT CHOSEN (`kit-2026-09.md` §5d); no invented pick. Reserve probe-ground with RET-05/EVI. |
| WO-EVI-02 | Separate instruments on disjoint files; read-only evaluation of landed families. | One owner for populations, floors, runner/gate manifest and shared fixtures. Root source repair is assigned to its source owner. Fleet certification waits for actual eligible population/evidence, never substitutes a pilot. |
| WO-EVI-03 | Harness/door-parity conversion outside active family test files. | Family-local test migration travels with its cut. Coordinate liveness harness with EVI-02; identity-dependent golden regeneration waits for the approved identity. Never bless current output blindly. |
| WO-RET-01 | In wave 5, independent retirement cohorts after all declared family prerequisites and a fresh consumer census. | Shared exports/package metadata/changeset have one integrator; no removal of active app consumers before authorized migration. Never overlap FAM-13 on DnD. |
| WO-RET-02 | In wave 5, scoped dead CSS/bundle retirement after consumer evidence. | No active skin/root rewrite on the same inputs. Serialize CSS-build, package and showroom/Tailwind changes with RET-05 and artifact generation. Frozen engine content stays frozen. |
| WO-RET-03 | In wave 5, evidence quarantine separate from settled runtime source work. | Transfer every live consumer/gate to its authorized authority before moving it. Serialize gate-manifest/docs/script ownership with EVI and RET-04; preserve measured graphs/history. |
| WO-RET-04 | After RET-01 and its declared deps: disjoint internal monolith splits on released directories. | Global moves/import rewrites are a serial window across BOTH source and its importers, including tests/docs/generated path keys. No moves under active family writers; APIs preserved, no compatibility duplicates. |
| WO-RET-05 | In wave 5, probe-ground/Storybook adoption over the settled mount and family contracts. | One showroom owner; coordinate RET-02 tooling, RET-04 paths, DER-07 references and EVI browser harness. Pause shared showroom edits during captures. |

Retirement rows do not become early execution merely because `next` lists them:
the existing wave-5 consumer-census/start-order law still applies. Read-only
inventory/preparation can run earlier without deleting or moving anything.

### Remaining legacy WOs: avoid duplicate implementation

These rows retain their registry dependencies, phase permissions and source
authorities. The replacement may already be done: verify its actual evidence,
then close the old obligation through the script when claimable. Do not redo the
old recipe, automatically close a partial replacement, or count support as final
source completion. If the phase is locked, keep the closure receipt ready in the
existing progress trail and surface the precise phase-control decision early;
this scheduling amendment does not open a phase or alter its fingerprint.

| Remaining WO(s) | Scheduling / closure route |
| --- | --- |
| WO-ARC-12, WO-ARC-13, WO-ARC-14, WO-ARC-17 | Reconcile the recorded FAM-00 / EVI-01 / EMI-02 / CAT-02 replacement evidence and required old-WO ordering; no duplicate anatomy/compiler programme. |
| WO-ENG-25, WO-CRA-19 | Reconcile DER-04 + INV-05 and CAN-05 respectively; do not rebuild motion or overlay kernels. |
| WO-ARC-15 | INV-03 plus actual family adoption; do not treat a global floor as every family's accessibility proof. |
| WO-ARC-20, WO-ARC-18 | FAM-11 plus the recorded responsive contract; avoid a second workspace rewrite. |
| WO-TOK-11, WO-ARC-19 | DER-03/EVI-02 contrast and six-axis divergence evidence respectively; no palette-only shortcut. |
| WO-CRA-18 | FAM-09 chart convergence; no second chart programme. |
| WO-CRA-15, WO-CRA-17, WO-ARC-16, WO-CRA-21 | RET-01's capability, legacy-icon, extensions and marks dispositions; paused scope is not permission to add new effects. |
| WO-ENG-24 | CAN-06's frozen-engine decision; do not reopen Classic/Rustic development to consume quota. |
| WO-GAT-12 | EVI-01 + RET-03's measured graph/quarantine evidence; no historical receipt as runtime authority. |
| WO-SKIN-08 | All replacing cuts and EVI-02 must substantively satisfy its recorded closure; no second broad skin sweep. |
| WO-ARC-21 | Conserved: DB-to-first-paint proof in consuming apps, after actual phase permission and stable DS contract. DS-side preparation can proceed; app-side implementation requires an explicit authorized cross-repo packet. DS-only focus neither cancels this obligation nor silently grants those writes. |
| WO-CRA-20 | Conserved: icon weight pruning after RET-01; one generator owner, consumer proof, serialized generated corpus. |
| WO-CRA-22 | Conserved: supplier-pure root imports after RET-02; coordinate entrypoints/importers with RET-01/04 and CRA-20. |
| WO-GAT-10 | Conserved: license/provenance for retained effects after RET-01; disjoint checker work can accompany icon cleanup, but shared manifest changes are integrated once. |
| WO-GAT-11 | INV-01 + INV-03 + EVI-02's actual robustness matrix; one shared browser window, no duplicate fleet harness. |
| WO-GAT-09 | Final claim-integrity barrier, including its own certifier residuals; cannot close while another executable authority remains open or required review is overdue. |

### DS-first reconciliation of the 29 open work orders — 2026-10-20

This is the one reconciliation requested by the
[owner order of 2026-10-20](#owner-order--2026-10-20-canonical-record). It is not a
second backlog and not a new audit, and it changes no status, dependency, phase,
fingerprint, acceptance or denominator. The basis is the registry at `c54ec1777`
(sha256 `6bcd92ce099f4543a728edc3b45c5f532ad6376fcee389eb9762565ccdde47a1`):
170 work orders, 141 done, 5 in progress, 24 todo.

It was re-verified read-only at HEAD `5aa9f59df` (registry sha256
`b4a32350d82036b95627d970575891d97f5975d89b896a9101d6dcdb84a28adc`):
- the same 29 open IDs with the same status, phase, `dependsOn` and size;
- the same fingerprint-relevant projection;
- WO-ARC-12 `progressLog` grown to 53 entries (LC6).

Commit lists and ratios cited below are labelled as historical cuts.

**Classes.**
- **N:** genuine work still to be built.
- **R:** receiver reconciliation. The capability was delivered by the named done
  WO; closure needs that receiver's evidence re-read against *this* WO's acceptance
  and a reviewed `done`. It is never closed by absorption.
- **M:** mixed DS and downstream portions. It closes only when the whole acceptance
  passes.
- **D:** downstream only.

**Closure for every row** needs four things:
- the lane acceptance gate named in the row, evidenced on a pinned candidate;
- every `dependsOn` done;
- for DS-improvements WOs, its phase open under a structured `ownerGo`
  (`phaseClaimBlocker` runs on `claim` *and* `done`);
- `done --evidence` through `scripts/maintain/roadmap/status/index.mjs` after
  independent review.

"Unverified" stays unknown until the named bounded verification runs.

**Effort.**
- A *lot* is one finite writer packet plus an independent review plus DT
  integration.
- Ranges are forecasts, not dates. Only the WO-ARC-12 range rests on cited counts;
  the others are scope judgments marked as such.
- Proposed receivers are named but never claimed here.

| WO (status · phase/wave · size) | Class | Reusable evidence (source) | Exact remaining gap | Dependency and phase (necessary ≠ sufficient) | Accountable / proposed receiver | Next finite package | Closure condition | Remaining effort |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WO-ARC-12 (in progress · P1 open · S, stale) | N | `progressLog` 1–53 (entry 53 records LC6 at bookkeeping `5aa9f59df`). Wave C commits `aff0d8f60`, `f7addb797`, `fe9f8db10`, `5d3ded564`, `47a56535a`, `a3976004f`, `7df07c9a8`, `0d13356be`, `cf6d65635`, `62cb281f5`, `6a2f501b5`, `06713a4c9`, `22444327d`/`9de2b26d1`/`e7258423a`, LC6 `f85e7531b`; PM-T `a0463e436`. Each is valid only for its input closure. | 16 named packets (LC6 is integrated and its roots are cleaned): FU-F11R, PM-P14, LC14, LC12, LX1, LX2, LX3, LX4, FU-LC1B, FU-LC8A, FU-F11V, FU-9A, FU-9B, FU-8A, FU-F11C, FU-F11K. Then the caller data-state mapping before the strip (Oct-17), the strip, dead-arm certification and final pinned suite, browser and sighted certification. 2026-10-20 state (operational record, 16:12Z): PM-P14 design r2 ACCEPT and admitted to real paired validation only (no source ACCEPT yet); FU-F11R rekey design r2 ACCEPT, mapper in LIGHT authoring. | Dependencies met; phase 1 open; claimed. | Claim `kimi-dt`; accountable: sole DT; writers: NORMAL Opus. | PM-P14 real paired validation (admitted), then its independent source review; FU-F11R paired-rekey mapper and its output review, then G1. | `architecture.md` WO-ARC-12 acceptance gate (attribute-honesty gate green across engines, no unforwarded advertised attribute, classic byte-identical), plus the recorded strip/dead-arm certification, on the final pinned candidate. `done` while phase 1 is open. | **At least 16 lots, or 14 if Oct-17 D5 merges LX1/LX3/LX4 into one pass; up to about 24.** Basis, historical cut through `f85e7531b`: 7 of the 14 integrated Wave C lots spawned an extra reader or pin migration or a follow-up (LC1, LC2, LC5, LC6, LC7, LC8, LC10). Add the data-state mapping, strip, dead-arm and certification windows. Further discoveries are uncounted. XL. |
| WO-ARC-21 (in progress · P6 · L) | M | DS preparation `00a86aab0`: row-bytes DB leg, mutants and a fixed point; showroom probe at 0 px; frozen probe contract at `packages/core/docs/consumer-contract/migration/db-first-paint-probe/`. | App-side DB-write-to-SSR first paint (app-bithire, D-31) plus the W4 exit cert. Downstream, deferred by the binding sequence. | Claimed. Phase 6 under the G-1 route-1 mapping (with DS-IMP-061), so it no longer blocks phase 2A; it still blocks the GAT-09 barrier. | DT; the app half has no authorized receiver. | None before the application stage; the G-1 route-1 mapping (2026-10-20, [owner decision](./proposals.md#owner-decision-on-g-1-and-g-7--2026-10-20-approved-bounded)) is the reviewed lot carrying this row. No app work. | `architecture.md` WO-ARC-21 acceptance unchanged. `done` only while ARC-21's phase is open, so under G-1 route 1 it happens in the phase-6 window, before WO-GAT-09. | DS: re-verify only. App: unknown (app not inspected), after the application stage opens. |
| WO-EVI-02 (in progress · wave 4 · L) | N | `cf2851e56` (6/6 axes, both negative controls 0, review `32ac5e41`); `a56cb7907`/`8edbf2ca8` (PL234); F-86 split `355a947c1`. | Per the independently reviewed closure read of 2026-10-20 (`.tmp/ds-codex-admin-2026-10-20/evi02-closure-read-20261020/REPORT-fix-r3.txt`, sha256 `b1a5d23c…`, review r2 ACCEPT): a fresh fleet run (the `cf2851e56` reading predates instrument wave `939cc02a9` and the carrier lots, so it is historical); **typography population floor red 185 > 184 (BLOCKING)**, no population touching for green (Oct-17 cut-1154 §2); theme-graph 9.74 > 9.68 MB (cause to be measured, then repaired, with the pin unchanged); **F-72 NOT MET until Stage C**, traced by the WO-EVI-02 AMENDMENT of 2026-10-20 in `evidence-graph.md` (B-DS, the DS-owned `packages/core` portion of PL225's owner + app-platform Stage B; the PL225 L1 rendering-consumer item, status UNKNOWN, its DS/app split decided by the B-DS debrief; B-ops downstream record; then C); the F-86 clause-2 statement on a live re-read; the full blocking battery and CI verification at the milestone. | Dependencies met; claimed. Gates milestone B. | Claim `claude-dt`; sole DT; population owner for the red. | The closure read's §4 read-only packets P-A/P-B/P-C. The F-72 B-DS design debrief only after that amendment is recorded and before any source; it also decides the DS/app split of the L1 rendering-consumer item. | `evidence-graph.md` WO-EVI-02 acceptance (J.1–J.7/J.12/J.22/J.23 gates with drills; six axes at least 80 % with both negative controls) plus its F-closure criteria and amendment 6 wording. | Now: the finite read-only packets P-A/P-B/P-C, then the fleet, battery and review windows. The F-72 B-DS source work and the B-ops record are UNKNOWN until the bounded reuse and design read. The earlier "3–8 lots plus the battery" was a dated judgment at this reconciliation's original cut; it is not an upper bound on the unknown B-DS scope. |
| WO-RET-04 (in progress · wave 5 · L) | N | W-1..W-10 (for example `4f0e09cdd`, `7941ed050`, `d922d5b0b`; PL30). | 203 authored files over 800 lines and 19 repeated-word owners (PL30). Skin residue reserved until M-P3 drains. The single D-21 move. `docs/architecture` §6. **Oct-17 D3/D4: the size law and F-44 are not changed. If D4 has no substantive solution, the impediment is recorded with two alternatives and RET-04 is not DONE.** | Dependencies met; claimed. Not phase-locked. | Claim `kimi-dt`; sole DT. | `scripts/**` split lots outside the M-P3 write sets. | `retire.md` WO-RET-04 acceptance gate plus its amendments, measured on the post-move tree. | Judgment: 10–25 lots. May stay unclosable under D4 (reported, not waived). |
| WO-RET-06 (in progress · wave 5 · L) | M | D-A..D-F, Q2 `Variant` and D-C executed (`quality-ret06-dc`); F-86 route (b) executed (`quality-f86-receiver`); W-1/W-2/W-3a/W-3b. | 11 doors (`./icons/roles/*` waits on CRA-20; `./styles/rottay` needs an app consumer: downstream). Six BitHire roles via CRA-17 (phase 2B). F-42/109/111/113/115/84/88 (F-88: Q3 unanswered). D-D. `evidence/ret-06-closure/`. | Dependencies met; claimed. Prose dependencies on phase-locked CRA-17 and CRA-20. | Claim `kimi`; sole DT. | Closure read separating DS-closable from phase-locked and app-dependent items. | `retire.md` WO-RET-06 acceptance gate (deprecations and census gates in both sibling modes, each finding measured or under a dated disposition, `roadmap:check`). | Judgment: 3–8 lots plus dispositions. |
| WO-RET-07 (todo · wave 5 · S) | M | Step-1 registration (landing commit unverified). | Step 2: the 4.0 major removal of 11 props. **Oct-17 Major version: present the version calculation before publishing; no release authority.** Step 3: removal of `commandHomePanelBgStrong` after the owner/ops stored-document migration (downstream; Oct-17: do not touch DB/apps). | `dependsOn` ARC-12 is unmet. | Unclaimed; proposed: sole DT plus a NORMAL writer in the 4.0 line. | Step 2 after ARC-12 is done. | `retire.md` WO-RET-07 acceptance gate (gates with `--assume-done`, pass-through non-increasing, major changeset rows). Cannot close without step 3. | Step 2: 1–2 lots. Step 3: downstream. |
| WO-CON-08 (todo · wave 4 · L) | M | CAT-04, EMI-02, CON-06 done. Building blocks exist but are **not verified** against step 1: `TenantThemeArtifact` (`compilerVersion`, `verticalEnvelopeDigest`, `digest`, `rowVersion`, `provenance`) in `foundation/contracts/composition/tenants/themes/tenant-theme/index.ts:764–790`, and the `DecisionProvenanceLedger`. | DS step 1: a revision/provenance descriptor (four identities; style, preset, catalog and envelope digests; build; assets/fonts; secret and billing rejection) under the CON-05 protocol with core review. Consumer steps 2–4: app-bithire history, CAS, restore and re-certification (downstream). | `dependsOn` ARC-21 makes it **not claimable**. G-1 item 5 (conditional on a reviewed debrief resolving q1–q3; no claim, step-1 implementation or adoption until that lot lands and the CON-05 core review accepts). No implementation or claim while the edge persists. | Unclaimed; proposed: a DS descriptor writer, and later an app-bithire writer. | Read-only mapping of the existing blocks against the step-1 clauses (preparation only). | `consumer-contract.md` WO-CON-08 full acceptance gate, including the app clauses, after ARC-21 is done. | DS: judgment 3–5 lots. App: downstream. |
| WO-CON-09 (todo · wave 5 · S; not programme C) | M | Step-1 registration (2026-10-15). | Step 2: the DS migration guide. Step 3: the flip after a measured app consumer (downstream). | No dependencies; claimable. | Unclaimed; proposed: sole DT plus a NORMAL writer. | Step-2 guide lot. | `consumer-contract.md` WO-CON-09 gate (`consumer-census --check --assume-done=WO-CON-09` OK with a measured consumer). | Step 2: 1 lot. Step 3: downstream. |
| WO-DER-10 (todo · branding · S; not programme C) | D | None. | The owner's D-30 pick (Oct-17: do not choose the personality, do not design the apps). | Prose-gated until the pick. | Owner, then DT. | None before M-DS2. | `derivation.md` WO-DER-10 gate. | Downstream. |
| WO-GAT-09 (todo · P6 · L) | N | GAT-07 (phase-0 milestone only). `claim-integrity:structural`. | Final gate. Routed certifier residuals (a)/(b). Public-target gap (RET-06 PL15). **`validateGat09CompletionBarrier` requires every other execute authority done, ARC-21 included: this is the downstream 170 barrier.** | CRA-15 and EVI-02 unmet; phase 6 locked. | `design-system-release`; unclaimed. | None. M-DS2 uses a proposed DS-scoped certifier mode (G-1 item 6: design debrief only), never this closure. | `gates.md` WO-GAT-09 final gate plus the barrier. | Judgment 3–6 lots; after ARC-21. |
| WO-CRA-15 (todo · P2C · L) | N | Spatial v1 kernel 51/51 unit (lane); CRA-14 Stage A; RET-01 E7 routed `./spatial` here. | DS-IMP-106/107/108 real-browser, performance and context-loss work. The lane continuation lists "the five quarantined Platform routes": route re-exposure is app-platform scope (downstream; execution control keeps the routes on the Stage-A fallback). **Unresolved:** whether DS-IMP-106 closure needs app-side route evidence. DS-IMP-107 WebGPU has no consumer (G-5). | Dependencies met; phase 2C locked. It is a 2C authority, so it must be done before phase 3 opens. | `visualization-runtime`; unclaimed. | Read-only check of whether the DS-IMP-106/107/108 acceptance needs app-platform evidence, before 2C. If it does, only an explicit owner decision may trace that portion downstream; otherwise M-DS1 is NOT REACHED. | `craft.md` WO-CRA-15 acceptance gate. | Judgment 4–8 lots plus browser. |
| WO-CRA-17 (todo · P2B · L) | M | Phosphor 2.1.10 settled; CRA-16 canary; RET-01. | Final integral gate including `sightedReview`; the six BitHire roles' domain owner (shared with RET-06). The registry lists app-bithire in `touchedRepos`: whether that needs app-side evidence is unverified. | Dependencies met; phase 2B locked. | `iconography-system`; unclaimed. | Read-only app-scope check before 2B (same rule as CRA-15), then a read-only run of the final integral gate when 2B opens. | `craft.md` WO-CRA-17 acceptance plus `cra-17-integral-gate.mjs` final mode. | Judgment 2–5 lots. |
| WO-ARC-17 (todo · P2A · XL) | R | CAT-02 `14c0499cb`, FAM-00 `c295af9bb`, ARC-14 `e36f2df24`; pilots dropped by D-19 (notes). | Typed, manifest-declared variants on the pilots plus compile-time rejection (unverified). | Dependencies met; phase 2A locked. | Unclaimed. | Read-only receiver verification. | `architecture.md` WO-ARC-17 gate, re-read against the receivers, plus a reviewed `done` in the 2A window. | 1 lot (+1–3). |
| WO-ARC-16 (todo · P2A · M) | R | `eaeb1448b` (RET-01) retired the `ComponentExtensions` triple: 0 files in `packages/core/src` at `c54ec1777`. | Reintroduction guard (unverified). Oct-17 punctual-authorization text (G-3). | Dependencies met; phase 2A locked. | Unclaimed. | Verification. | `architecture.md` WO-ARC-16 gate (zero consumers, channel removed, guard, build/unit). | 0–1 lot. |
| WO-ARC-20 (todo · P2A · S) | R | FAM-11 done. | Multi-select round-trip and preset chip `type=button` unit proof (unverified). | Phase 2A locked. | Unclaimed. | Verification. | `architecture.md` WO-ARC-20 gate. | 0–1 lot. |
| WO-TOK-11 (todo · P2A · S) | R | DER-03 done. | APCA gate zero failed or unjustified-skipped pairs (EVI-02 artifact). | EVI-02 unmet; phase 2A locked. | Unclaimed. | After EVI-02. | `tokens.md` WO-TOK-11 gate. | 0–1 lot. |
| WO-ARC-18 (todo · P2B · XL) | R | INV-04 `16777a249`, FAM-11. | Container adaptation, CollectionProjection and breakpoint governance, visual under both palettes (unverified). | Phase 2B locked. | Unclaimed. | Verification. | `architecture.md` WO-ARC-18 gate. | 1 lot (+1–4). |
| WO-ENG-25 (todo · P2B · L) | R | DER-04, INV-05; the AI kit paused (D-19). | Semantic recipes, presence, reduced motion (unverified). AI kit disposition (G-5). | Phase 2B locked. | Unclaimed. | Verification. | `engine-modern.md` WO-ENG-25 gate. | 1 lot plus a disposition. |
| WO-CRA-19 (todo · P2B · M) | R | CAN-05 `b1134dded`, `5d189f9fe`, `188b38e75`. | z-authority, Escape router, focus restore, scroll-lock refcount (unverified). Oct-17 punctual text (G-3). | Phase 2B locked. | Unclaimed. | Verification. | `craft.md` WO-CRA-19 gate. | 0–1 lot. |
| WO-CRA-18 (todo · P2C · XL) | R | FAM-09 `76799ef74`, `604afa147`. | CSV/a11y, annotation/streaming, census gate, budgets (option A; unverified). | Phase 2C locked. | Unclaimed. | Verification. | `craft.md` WO-CRA-18 gate. | 1 lot (+1–4). |
| WO-ENG-24 (todo · P2C · L) | R | `SizeType` retired `fb03f7af1`; CAN-06 freeze. | The certified-minimum boundary is superseded by the freeze: needs a reviewed replacement receipt or an owner disposition. | Phase 2C locked. | Unclaimed. | Verification. | `engine-modern.md` WO-ENG-24 gate, read through its reformulation. | 0–1 lot. |
| WO-GAT-10 (todo · P2C · S) | N | RET-01 E7: effects `candidate` here. | Effect-registry license/provenance gate, or a disposition if the effects retire. | Phase 2C locked. | Unclaimed. | When 2C opens. | `gates.md` WO-GAT-10 gate. | 1–2 lots. |
| WO-CRA-20 (todo · P2C · M · support) | N | None. | Preset-used weights only; unblocks the RET-06 `./icons/roles/*` door. | Phase 2C locked. | Unclaimed. | When 2C opens. | `craft.md` WO-CRA-20 gate (support milestone, no source completion). | 1–2 lots. |
| WO-CRA-21 (todo · P2C · M · support) | N | Pause lifted (RET-01 done). | Ground-keyed BrandMark plus sighted review. | Phase 2C locked. | Unclaimed. | When 2C opens. | `craft.md` WO-CRA-21 gate. | 1–2 lots. |
| WO-CRA-22 (todo · P2C · M · support) | R | RET-02 done; `AlertIcon` retired (RET-06 W-1). | Zero root-reachable catalog-name imports plus a guard (unverified). | Phase 2C locked. | Unclaimed. | Verification. | `craft.md` WO-CRA-22 gate. | 0–2 lots. |
| WO-ARC-19 (todo · P3 · M) | R | EVI-02 by-axis probe `cf2851e56`. | EVI-02 done; captures reviewed. | EVI-02 unmet; phase 3 locked. | Unclaimed. | After EVI-02. | `architecture.md` WO-ARC-19 gate read through its reformulation. | 0–1 lot. |
| WO-GAT-11 (todo · P6 · L) | M | INV-01, INV-03; Modern × bithire matrix. | Forced-colors, RTL, zoom and long-content browser matrix and its review. | EVI-02 unmet; phase 6 locked. | Unclaimed. | After EVI-02, in the browser window. | `gates.md` WO-GAT-11 gate. | 2–4 lots plus browser. |
| WO-GAT-12 (todo · P6 · S · support) | R | EVI-01 `2f5ac2d6e`, RET-03. | Test 253 disposition (unverified). | Phase 6 locked. | Unclaimed. | Verification. | `gates.md` WO-GAT-12 gate. | 0–1 lot. |
| WO-SKIN-08 (todo · P6 · L) | R | FAM-01..11, hardcode census. | MD-DEF-04/05 terminal; residue gate; EVI-02 done. | EVI-02 unmet; phase 6 locked. | Unclaimed. | After EVI-02. | `skin-adoption.md` WO-SKIN-08 gate. | 1 lot (+1–3). |

#### Phase barrier (measured at `c54ec1777`; read from `scripts/maintain/roadmap/status/index.mjs` at HEAD)

- **Mechanics.**
  - `claim` and `done` both call `phaseClaimBlocker` (`validateDoneTransition`).
    A phase opens for claims and completions only if all of these hold:
    - it is the sole open phase and every earlier phase is locked;
    - every execute authority of an earlier phase is done;
    - no deferred item targets it or an earlier phase;
    - a structured `ownerGo` exists.
  - An in-progress WO can sit in a locked phase: no validator forbids it, and
    `progress` does not consult phases. It simply cannot reach `done` until its
    phase is open.
  - The DS-IMP-061 pin (`:2201–2210`) accepts exactly two forms: the legacy
    phase-1 form (execute in phase 1, or deferred to phase 1) and execute in phase 6
    through authority WO-ARC-21 (G-1 route 1). Every other phase, authority,
    deferred target or disposition fails. A deferred route to phase 1 still blocks
    every phase from 2A onward.
  - The plan fingerprint (`DS_IMPROVEMENTS_PLAN_SHA256`) covers items, mapped-WO
    phase and dependencies, phase controls and the ledger. This bounded G-1 mapping
    re-seals it in the same lot; the sealed value lives in the script, not here.
  - `validateGat09CompletionBarrier` requires every other execute authority to be
    done.
- **Phases.** 0 is locked, 1 is open (GO 2026-10-08), 2A–6 are locked. Phases 4
  and 5 map no items.
- **Count.** 29 open. 22 are dependency-satisfied: 17 DS-improvements WOs, plus
  RET-04, RET-06, EVI-02, DER-10 and CON-09. 15 of those are phase-locked todo
  WOs:
  - 2A: ARC-16, ARC-17, ARC-20;
  - 2B: ARC-18, CRA-17, CRA-19, ENG-25;
  - 2C: CRA-15, CRA-18, CRA-20, CRA-21, CRA-22, ENG-24, GAT-10;
  - 6: GAT-12.

  7 are dependency-blocked: GAT-09, TOK-11, ARC-19, GAT-11 and SKIN-08 on
  EVI-02; RET-07 on ARC-12; CON-08 on ARC-21.
- **Deadlock (resolved by the G-1 route-1 mapping).** Before the mapping, phase 2A
  needed WO-ARC-12 **and WO-ARC-21** done, and WO-ARC-21's acceptance is
  application-side. The owner approved the framing decision G-1 in
  [`proposals.md`](./proposals.md) on 2026-10-20, bounded to route 1
  ([owner decision](./proposals.md#owner-decision-on-g-1-and-g-7--2026-10-20-approved-bounded)),
  and the reviewed code-and-registry lot carrying this text maps DS-IMP-061 and
  WO-ARC-21 to phase 6. Phase 2A now needs WO-ARC-12 done **and** its own
  structured `ownerGo`; the mapping opens no phase. WO-ARC-21 keeps its full
  application-side acceptance, its dependencies and its place in the GAT-09
  barrier, and reaches `done` only in the phase-6 window under phase 6's own
  `ownerGo`. The phases still open serially, so the 2A–6 WOs, RET-06's role and
  icon-role items and every DS-only milestone stay locked until their phases
  open, and CON-08 stays dependency-blocked on WO-ARC-21. Until 2A opens:
  - WO-ARC-12 and the other lawful fronts continue;
  - phase-locked **R** rows may only be verified read-only;
  - prepared receipts are evidence files, not `progressLog` entries, because
    `progress` refuses todo WOs.

#### DS-only milestones (documentation-defined; `status` does not publish them)

> **2026-10-27 amendment:** M-DS1 (b)/(c)/(e)/(h) and M-DS2 phase/exclusion/design-only clauses below are historical where superseded by [the approved V1 scope](#owner-approved-v1-scope-and-parallel-delivery--2026-10-27). Other substantive quality clauses remain; neither milestone is reached by this edit.

`PROGRAM_MILESTONES`, programme C and the 170 total are unchanged, and nothing
here is claimable by prose.

**Status: both milestones are NOT REACHED.** G-1 is approved
([owner decision](./proposals.md#owner-decision-on-g-1-and-g-7--2026-10-20-approved-bounded)),
and the reviewed lot carrying this text reflects its basic mapping (DS-IMP-061 and
WO-ARC-21 in phase 6); the mapping opens no phase. Until each phase opens under its
own `ownerGo`, the report lists the phase-gated DS obligations by name
(the 15 phase-locked WOs plus TOK-11, ARC-19, GAT-11 and SKIN-08). They are never
dropped and never shown as done.

- **M-DS1 · DS ready for multitheme validation.** Every item below on one pinned
  integrated candidate:
  - (a) WO-ARC-12 done.
  - (b) WO-EVI-02 done. It includes F-72 Stage C, which follows all of Stage B: the DS-owned B-DS, the L1
    rendering-consumer item (status UNKNOWN) and a recorded downstream B-ops (WO-EVI-02 AMENDMENT of 2026-10-20 in
    `evidence-graph.md`). Until then (b) is blocking, unless the owner records a
    dated framing decision.
  - (c) The DS-owned acceptance of WO-RET-04 and WO-RET-06. If the Oct-17 D4
    impediment stands, M-DS1 is reported NOT REACHED with that impediment. There
    is no size-law change.
  - (d) WO-RET-07 step 2 landed in the 4.0 line, after the Oct-17 version
    calculation. No publication authority is added.
  - (e) WO-CON-08 step 1 adopted. This is possible only if all of the following
    happen:
    - the G-1 item-5 resequencing is approved;
    - its independently reviewed debrief resolves q1–q3;
    - the future lot lands;
    - the CON-05 core review accepts.

    Until then the registry edge to WO-ARC-21 stays, and (e) is a named, blocking
    gap.
  - (f) WO-CON-09 step 2.
  - (g) WO-ARC-21's DS preparation re-verified at HEAD.
  - (h) Every DS-improvements WO of phases 2A, 2B, 2C and 3 done through its own
    phase `ownerGo` (requires G-1). The WO-CRA-15 and WO-CRA-17 app-scope checks run
    before 2B/2C. If either acceptance needs app-side evidence, that portion can be
    traced downstream only by an explicit owner decision. Otherwise (h) is unmet and
    M-DS1 is NOT REACHED; there is no silent cut.
  - (i) **Every mandatory gate GREEN on the pinned candidate against unchanged
    laws, or covered by an explicit dated disposition that an EXISTING contract
    already permits, naming its clause, scope, authority and gaps.** Attribution
    alone never satisfies (i), and neither does an inherited or baseline green.
    - Theme-graph (9.74 > 9.68 MB) and the typography population floor (185 > 184)
      **stay M-DS1-blocking** until legitimately resolved. A re-anchor or re-pin
      counts only with its proper authority's reviewed decision, never inside a lot.
    - The old library-path token-audit rows are invalid.
    - Dist freshness counts only if measured.
  - (j) A full suite, the official token audit, a real browser run and a sighted
    check on that candidate.

  **Mandatory robustness scope** (now and at M-DS1, on contrasting test
  configurations):
  - divergence: by-axis probe and both negative controls;
  - isolation: two roots, cross-root and portal;
  - accessibility: critical axe 0 and APCA;
  - states: the `states.spec` matrix;
  - responsive and container behavior, plus SSR first paint (`ssrViewport`);
  - RTL and i18n;
  - cascade transport parity: static, row bytes, preview and publish at DS level;
  - equal Standard/Pro quality.
- **M-DS2 · DS multitheme certification.** M-DS1 plus all of the following:
  - **Themes:** four or five provisional test themes admitted through the
    `TenantThemeDocument` door, Modern × bithire, same vertical, under D-24. This
    is a DT test-configuration determination, not an owner block. There is no
    fork, no new compiler and no final identity. Each pair is distinct beyond
    palette by the WO-EVI-02 by-axis probe at its declared threshold, with both
    negative controls. Existing three-vertical conformance (CSS build, theme-graph
    runs) continues untouched.
  - **Coverage:** the robustness scope across every theme, plus the WO-GAT-11
    matrix and the audit/20-rubric re-audit.
  - **Phase 6:** WO-GAT-11, WO-GAT-12 and WO-SKIN-08 done under phase 6's own
    `ownerGo`. That is reachable without app work only under G-1 route 1.
  - **DS-scoped certification:** two clean runs of the GAT-09 certifier in a
    DS-scoped mode, with real static and executable evidence.
    - **Closed exclusion list.** The list is fixed by name in its reviewed design:
      WO-ARC-21's application half, WO-CON-08 steps 2–4, WO-CON-09 step 3, WO-RET-06
      `./styles/rottay`, WO-RET-07 step 3, WO-CRA-15's app-platform route exposure,
      WO-DER-10 and WO-GAT-09 itself.
    - **No other exclusion.** Any other open execute authority fails the run.
    - **Partial exclusion of a mixed WO.** Excluding a mixed WO's downstream
      portion never waives that WO's DS clauses.
    - **Never a closure.** `completionEligible` stays false and no final GAT-09
      artifact is written.
    - **That mode does not exist today.** `claim-integrity:structural` runs no
      executable evidence, and the final mode executes evidence only after the
      registry barrier clears.
    - It is G-1 item 6, which authorizes a design debrief and independent review
      only. Its implementation is a separate future reviewed lot. It is never
      WO-GAT-09 completion and never a 170 certification.
- **Downstream, traced; their full acceptances are kept:**
  - WO-ARC-21's application half;
  - WO-CON-08 steps 2–4;
  - WO-CON-09 step 3;
  - WO-RET-06's `./styles/rottay` consumer;
  - WO-RET-07 step 3 (owner/ops migration);
  - WO-EVI-02 F-72 Stage B-ops: the documented, idempotent migration record of the stored The Management Miami row
    (owner/ops; a record only). WO-EVI-02 itself stays a DS authority with its whole acceptance and M-DS1 (b)
    blocking; this trace is not an exclusion of the DS-scoped certifier;
  - WO-CRA-15's quarantined app-platform route exposure;
  - WO-DER-10;
  - WO-GAT-09 closure, which is the final 170 barrier.

  Mixed WOs are never shown as done by milestone prose. A DS fixture never proves
  a database or application installation.

#### Eligible close and unblock packets now (phase locks preserved)

1. **WO-ARC-12.** LC6 is integrated (`f85e7531b`; bookkeeping `5aa9f59df`). Follow the
   existing DAG: FU-F11R rekey and implementation, PM-P14, LC14, LC12, the EXT/FU lots, the data-state mapping,
   strip, dead-arm and certification. No new scope.
2. **WO-EVI-02.** The read-only closure read is DELIVERED and accepted
   (`REPORT-fix-r3.txt`, independent review r2 ACCEPT). Next, bounded: its
   read-only packets P-A/P-B/P-C (the typography red stays routed to its
   population owner, no repin), then the F-72 B-DS design debrief only after the
   WO-EVI-02 AMENDMENT of 2026-10-20 is recorded.
3. **WO-RET-06 and WO-RET-04.** Closure reads, plus `scripts/**` splits outside
   the M-P3 write sets (under D3/D4 as decided).
4. **WO-CON-09.** Step 2.
5. **WO-CON-08.** Read-only mapping of the existing descriptor blocks against
   step 1 (no claim).
6. **Phase-locked R rows.** One read-only receiver-verification packet, with
   evidence files only.
7. **Theme-graph.** A repair attempt in the ARC-12 strip window (pin unchanged).
8. **WO-CRA-15.** The read-only app-scope check.

### Conflict reservations and serial integration

Keep reservations in the owning WO's existing `progress` trail and the DT's
bounded dispatch, not a second registry or task graph. Release a reservation on
an explicit delivery/integration event, not elapsed time or silence. Independent
WOs that share any of the following require a named singleton owner:

| Shared resource | Competing work to coordinate |
| --- | --- |
| Theme, catalog, roots, ingress, compilation/emission and public contract | DER-08, EMI-03, CON-06, EVI-02 and any root repair. Review contract first; then disjoint consumers. |
| DnD / export / widget-board / grid-gallery | FAM-08, FAM-12, FAM-13, INV-08, RET-01. API owner first, consumer-directory handoff second. |
| Headers / SurfaceRegion / shell / keyboard provider | FAM-10, FAM-11, INV-06 and any INV-02 adoption in those files. |
| Family TSX, deriver, skin and its tests | A single complete-family writer; INV-01/02/03 and EVI-03 request changes through that owner, or await release. |
| Gate/roster/fan-out registries, shared fixtures and `.github/workflows/ci.yml` | EVI-02/03, INV-03, CON-06, RET-03/05 and family registrations. Writers provide exact registration deltas; the assigned owner integrates them once. |
| Build inputs, generators, dist, CSS artifacts, graph, supplier snapshots, package exports/lockfiles | One integration/generation owner; no concurrent regeneration or installation. |
| Showroom source/dev server, browser matrix, screenshot/golden paths | One stable capture window; DER-07, INV-03/06, EVI-02/03, FAM-13 and RET-02/04/05 reserve it. |
| Filesystem moves and reverse importers | RET-04 reserves the whole affected source/importer closure, not just the destination folder. |
| Git index, roadmap registry/STATUS and commits | The sole DT. Writers never use `git add`, `git mv` or whole-tree formatting. |

**Land coherent functional packets, not hundreds of loose edits.** Review the
exact candidate, verify HEAD/index/pathspec and new/untracked files, then use the
serialized test/commit window. A pass that depended on another writer's
uncommitted dependency does not certify the candidate commit. If the relevant
source/test dependency closure cannot be held equal to the reviewed candidate,
wait for its owners' checkpoint; never reset, hide or sweep their drafts.

One heavy build, full suite or browser/visual run uses this host at a time, with
bounded test workers and no automatic retries. Disjoint source authoring and
read-only review may continue outside its input closure. Lightweight focal tests
may run only in DT-granted non-conflicting slots; writers do not compete for
ports, caches, global fixtures or mutable artifacts. Whole-wave certification
uses a pinned integrated checkpoint after relevant writers have yielded.

### Verification that protects the product without repeating work

| Delivery | Required proof |
| --- | --- |
| Ordinary family packet | Independent diff review; changed behavior + direct-consumer tests; production/test types as applicable; family anatomy/RWP/paint/causality gates; RTL/i18n/a11y/adaptation cases appropriate to the change; actual sighted evidence for visual changes. |
| Shared contract / root / instrument | Same-debrief core review under the existing policy; producer/consumer and transport parity; rejection/negative cases. Instruments need realistic planted failures. Reuse the approved contract, not a new architecture meeting per consuming file. |
| Artifact / migration / package boundary | Reproducible official generation, freshness and public-consumer evidence against the real candidate; server/preview/publish/mount identity where affected. Never hand-edit generated output. |
| Meaningful family/shared-core milestone | One combined full suite on the pinned checkpoint, applicable browser/visual matrix, integrated gate inventory and named red attribution; reuse it for covered lots whose relevant inputs are unchanged. |
| Final certification | All WO/finding acceptance, indicators at target, fleet evidence and required robustness/consumer proofs. Registry completion, a package build or a nonzero-debt ratchet alone is insufficient. |

Reuse evidence only with the same source/input closure, contract, harness and
population revision. When one changes, rerun the affected checks and dependent
consumers, not blindly the whole repository. Report measured PASS, FAIL,
historically attributed red and NOT RUN separately. Pre-existing debt is not
silently forgiven; new failures cannot be hidden in a baseline or skip list.

Product invariants remain: bounded meaningful customization; one canonical
compiler/owner; full inherited quality for Standard and Pro with different
editing permissions; same-vertical tenant difference beyond palette with all
six required axes, absolute minima and negative controls; responsive first paint,
interaction, accessibility and RTL/i18n; no new hardcoded paint or duplicate path.
Use provisional admitted identities to prove capability, without spending the
critical path on deferred final branding. Preserve the distinct later approval
for identity-dependent goldens. Shared/frozen engine boundaries remain protected.

### Minimal packet and event-driven handoff

Every dispatch carries this compact record in the existing WO progress/brief:

```text
WO / packet / acceptance or finding covered:
Base HEAD + verified checkout/main + writer account/model + independent reviewer:
Exact write set (including tests/skin) / shared-registration owner:
Consumed contract revision + source owners that must not change during validation:
Dependencies and phase permission checked / explicit file reservations:
Focal tests, negative cases, applicable gates, visual proof / validation slot:
Deliverable: candidate hashes/diff, evidence, unresolved items, completion event:
```

On delivery: audit once, return concrete corrections to that writer if needed,
land the reviewed functional lot locally, record its evidence, release files and
dispatch the next safe ready packet. Do not globally stop because one packet
completed. Only a genuine missing authority/contract, failing acceptance or
unavailable capacity blocks its affected work; the DT continues independent work.

Report actual completed families, removed blocking defects, current indicators,
critical-path dependency and next packages at material landings. Re-estimate time
from observed accepted throughput, not agent count, lines changed or the raw WO
percentage. No periodic empty progress messages. This plan guarantees a process
for verification, not an assertion that unseen output is already excellent.

### DS-improvements authority, milestones and wave locks

- The adjudicated modern program is pinned through `traceability.ds-improvements`. Its requirements
  live in `docs-engineering/engineering/audits/ds-improvements`; its only live status remains this
  registry. The validator proves that the pinned commit exists and contains the source, roadmap and
  adjudication files, resolves terminal Markdown anchors, rejects a shadow `statusAuthority`, and
  fingerprints the adjudicated trace plan, the mapped WOs' phases/dependencies/`mustLandWith`/
  source/support/milestone topology, and all phase-control/structured-owner-GO records. A later wave
  changes that fingerprint only in the same reviewed code-plus-registry update that maps the new WOs.
- `sourceIds` are final completion authorities. `supportsSourceIds` are bounded milestones only:
  completing a support WO never completes or increments the linked DS-IMP source ID. Every support
  milestone names its distinct final authority and final phase.
- The DS-improvements burn-down is derived only from each trace item's final authority. Support WOs,
  deferred items, absorbed tombstones and routed work are reported separately instead of being
  presented as completed scope.
- Every phase control carries a mechanical `claimState`. At most one phase is open; every later phase
  stays locked until every earlier authority is done, prior controls are locked, deferred items
  targeted through the phase are adjudicated, and a structured `ownerGo` record carries the explicit
  owner decision, date and evidence. Negative approval prose cannot open a phase. A green dependency
  graph cannot override a locked phase, and a WO cannot depend on a later phase. Dates use the fixed
  `America/New_York` program calendar even when CI runs in UTC.
- Registry and generated STATUS writes use temporary-file rename. The registry schema is closed at
  root, traceability, work-order, execution, milestone and progress-entry boundaries. Duplicate WO
  IDs, incoherent todo/in-progress/done metadata, blank evidence, parallel status/state aliases and
  removal of the activated DS program fail before any state mutation reaches disk.
- `WO-GAT-09` is the final claim-integrity barrier: it cannot close while another executable authority
  is open or a deferred review is overdue. Phase-0 claim checks are deliberately not system
  certification.

## Bootstrap prompt for a fresh agent (copy-paste verbatim)

> You are continuing the Modern Engine Premium Uplift in the Rottay `ui-design-system` repo
> (`/Users/daniel/Developer/Rottay/ui-design-system`; macOS; docs-engineering and app-bithire are
> sibling repos under the same root). NORMATIVE LAW is the spec at
> `../../docs-engineering/engineering/design-system/runtime/engines/modern/README.md` (Quiet Premium,
> sections 1-13) — READ IT FULLY FIRST; every WO implements a numbered section. THE OPERATIVE BACKLOG
> is `ui-design-system/roadmap/` — start with `pnpm roadmap:status`, then read `roadmap/README.md`
> (this file) and `roadmap/engine-modern.md` in full. If your WO belongs to one of the nine
> post-C4 audit lanes (`WO-CAN/CON/CAT/DER/FAM/EMI/INV/RET/EVI-*`), read `audit/README.md` FIRST —
> it fixes the order of authority inside `audit/**` and the rule that every change cites the `F-nn`
> it closes and is done only by the closure criterion of that fiche in `audit/30-findings`.
>
> HOW TO PERFORM: (1) WO statuses change ONLY via `node scripts/maintain/roadmap/status/index.mjs` (claim/progress/done/reopen;
> deps, mustLandWith hazards, and evidence are enforced). `node scripts/maintain/roadmap/status/index.mjs delegate
> WO-ENG-NN` prints the ready-to-paste executor prompt. (2) Gates are truth: a WO is done only when its
> applicable acceptance evidence is green under the owner-approved Execution and review policy above:
> focal tests and applicable gates per lot, full suite at important milestones, independent audit
> before integration and three-way agreement for shared-core contract changes.
> (3) For EVERY visual WO the SIGHTED CHECK is mandatory: run the showroom
> (`pnpm --filter @rottay/design-system-showroom run dev`, http://localhost:7001), capture the affected
> flagship components before/after under both tenant palettes (a dark-surface and a light-surface tenant) to `test-artifacts/engine-modern/<wo>/`, then
> actually LOOK at the PNGs and score them against the spec (sections 1 + 11). The metrics ratchet is
> the spec section 12 table; the owner approves signature moments from a before/after gallery — never
> self-approve visuals. (4) The DS is a PUBLISHED package: editing `packages/core/src` does not change
> what any app renders until a release + repin; no WO publishes or repins (WO-ENG-11 records the release
> note; the uplift ships via the normal release train). (5) Anti-sprawl: NEVER create a new plan/doc
> file; new work = a `### WO-ENG-NN` block in the lane + a registry entry.
>
> FENCES: executors are EDIT-ONLY (no commits — the orchestrator certifies and commits behind a green
> gate); NEVER `git checkout/restore/reset` directories; touch `packages/` source ONLY as the claimed
> WO's Files list allows; the showroom dev server is allowed; `app-bithire` is READ-ONLY (its Playwright
> module is the documented reference-harness exception — do not write to it); no emojis anywhere; repo
> docs in English; conventional commits (author davila23 <daniel.avila@rottay.com>, no AI attribution).
>
> Report: lead with what changed and the before/after evidence; update `pnpm roadmap:status` and cite
> WO ids.

## External co-editors (no-conflict rule)

- app-evnto WO-IDN-06 (`app-evnto/roadmap/identity.md`) edits `packages/core` in this repo:
  `foundation/tokens/ts/presentation/brand-themes/evnto/index.ts`, `foundation/tokens/css/facade/artifacts/evnto/**`,
  `runtime/tenant/storage/static/generator/index.ts`, `scripts/build-vertical-artifacts.mjs`,
  `src/foundation/contracts/kernel/verticals/index.ts`. That file set is DISJOINT from every WO-ENG Files list
  and must stay disjoint — a WO-ENG executor that needs one of those files stops and escalates.
  Because both programs certify with `pnpm test`/`build` in `packages/core`, orchestrators must
  not run a WO-ENG executor and the evnto WO-IDN-06 executor concurrently in the same working
  tree; coordinate windows before claiming.
- **Commercial `roadmap/commercial/` WO-SHW-03 ↔ engine-lane WO-ENG-02 (cross-roadmap Files-overlap
  ordering law).** The commercial-surfaces program is isolated in `roadmap/commercial/` (owner decision
  2026-07-07); its WO-SHW-03 and this roadmap's WO-ENG-02 both edit `packages/showroom` (the browse/preview
  surfaces and the component registries), and the commercial kit lives in `packages/core`. Because the two
  roadmaps are now separate graphs, WO-SHW-03's dependency on WO-ENG-02 is external prose (BLOCKED-ON-EXTERNAL
  in `roadmap/commercial/showroom.md`; `coordinatesWith: ["WO-ENG-02"]` in its registry), not a registry
  edge — the two must **never execute concurrently in the same working tree**, and whichever lands second
  re-verifies the other's galleries still render. Do not run a WO-SHW-03 executor and a WO-ENG-02 executor
  at the same time.

## Downstream waiters

- app-evnto WO-EXP-10 and app-platform WO-EXP-07 (modern-engine adoption checkpoints) are
  BLOCKED-ON-EXTERNAL on this lane's release. When the release train ships the uplift (post
  WO-ENG-11), the orchestrator records the released version in this README and notifies the
  app orchestrators so they can mark the external dependency released.
- app-platform WO-COM-01 (commercial-kit adoption) is BLOCKED-ON-EXTERNAL on **WO-SHW-01's release** —
  the `@rottay/design-system/commercial` kit — but WO-SHW-01 now lives in the isolated
  `roadmap/commercial/` program (owner decision 2026-07-07), which owns that cross-repo unblock and its
  release note; see `roadmap/commercial/README.md`. (The showroom consumes the kit via `workspace:*` and
  needs no release.)

## Handoff protocol (any fresh agent session starts here)

1. `pnpm roadmap:status` — regenerates STATUS.md: burn-down, what is in progress (and by whom), what is
   actionable NOW, what is blocked and on what, the sequencing hazards, and the north-star metrics.
2. Pick from **Next up** (respect the start order below on the first pass). `node scripts/maintain/roadmap/status/index.mjs
   show WO-ENG-NN` prints the full spec; `delegate WO-ENG-NN` prints the ready-to-paste executor prompt.
3. `node scripts/maintain/roadmap/status/index.mjs claim WO-ENG-NN --by <session/agent name>`.
4. Execute the Steps exactly; respect the Do-NOT fences. After EVERY completed step (and on any blocker) log it: `node scripts/maintain/roadmap/status/index.mjs progress
   WO-ENG-NN --note "<what landed / what is next / blockers>"` — the trail lets a successor resume mid-WO.
5. Run the WO's **Acceptance gate** — a WO is done when its gate is green, never on code landing. Every
   visual WO additionally REQUIRES a sighted before/after gallery scored against the spec (sections 1 +
   11); the `done --evidence` must reference the screenshots and the verdict. The owner approves signature
   moments (WO-ENG-11).

   > **Owner decision 2026-07-09 — approval delegated to the orchestrator** ("auto aprobate. pedí calidad
   > máxima pero auto aprobate"). The orchestrator may mark owner-gated work orders done without waiting
   > for a signature, and may promote an approved proposal into a WO block itself. The bar does not move:
   > the sighted gallery is still captured, still reviewed by eye, and the verdict is still recorded in
   > `done --evidence`. Delegated approval means no waiting, not no review — and every WO closed under this
   > delegation must say so in its evidence, so the trail explains itself without this README.
6. `node scripts/maintain/roadmap/status/index.mjs done WO-ENG-NN --evidence "<gate command + result>"` — refused if
   deps/hazards/evidence are not satisfied.
7. If interrupted mid-WO: leave it `in-progress` — the successor runs `node scripts/maintain/roadmap/status/index.mjs
   show WO-ENG-NN`, reads the `[progress]` trail, and resumes from the last logged step without redoing
   completed ones. Use `reopen --note "<context>"` only when abandoning.

Everything needed to resume from ANY machine or session lives in-repo: this README (protocol + start
order), `registry.json` (who claimed what, evidence on done), generated `STATUS.md`, the lane spec, the
normative spec in docs-engineering, and the gate (`scripts/check/engine-token-audit.mjs`). A fresh session's
first command is always `pnpm roadmap:status`.

## Start order (first working window)

1. **WO-ENG-01** (motion canon + the `engine-token-audit.mjs` ratchet) and **WO-ENG-02** (real showroom
   evidence surfaces + tenant-palette axis) — the two foundations. ENG-01 mints the token discipline and the
   mechanical gate every later token WO extends; ENG-02 makes sighted checks trustworthy for every visual WO.
2. **WO-ENG-03..07** in parallel where deps allow: ENG-03 (dark elevation) needs ENG-01; ENG-04 (state
   contract) needs ENG-01 + ENG-03; ENG-05 (gradient/glass/glow) needs ENG-03; ENG-06 (color purity) and
   ENG-07 (scale hygiene) need only ENG-01.
3. **WO-ENG-08** (theme.css drain, 4,563 → <800) after the token WOs re-home their blocks (deps ENG-01/03/04;
   coordinate with ENG-05/06/07 whose edits also land in `modern/theme.css`).
4. **WO-ENG-09** (content integrity) and **WO-ENG-10** (cross-engine layout) anytime after ENG-02;
   **WO-ENG-12** (full-responsive conformance, spec section 13 — owner-ratified 2026-07-07) after ENG-01 + ENG-02.
5. **WO-ENG-11** (premium signature pass + owner gallery) LAST — depends on ENG-01..10 + ENG-12; the owner approves
   the signature moments and the release note is recorded (no publish inside the WO).

Parallelism: the WOs are independent except through the dependency graph above (see the Dependency summary
at the bottom of [`engine-modern.md`](./engine-modern.md)). ENG-01 and ENG-02 have no dependencies and can
run concurrently from the start.

### Craft lane start order

The `craft` lane ([`craft.md`](./craft.md), WO-CRA-01..10) is mostly disjoint from the engine lane by
Files; coordinate windows only where both touch `packages/core` (per the External co-editors rule above).
Craft WOs can start ANYTIME their dependencies are satisfied — no ordering relative to the other lanes.

1. **WO-CRA-01** (micro-typography) — anytime; the cheapest, highest-signal item, no dependencies.
2. **WO-CRA-02** (async-state law) and **WO-CRA-03** (keyboard model) — anytime, honoring the engine-lane
   coordination notes (CRA-02's Button pending posture pairs WO-ENG-04; CRA-03 is disjoint).
3. **WO-CRA-04** (data-viz + flagship primitives) — after WO-ENG-01 + WO-ENG-02.
4. **WO-CRA-05** (Tenant Brand Studio) — after WO-ENG-02.
5. **WO-CRA-10** (promotion pass) — anytime, no dependencies; highest leverage BEFORE the evnto/platform
   detail/listing anatomy WOs execute (the WO records the app-orchestrator notification step).
6. **WO-CRA-06** (motion choreography) and **WO-CRA-08** (View Transitions + scroll motion) — after
   WO-ENG-01; **WO-CRA-07** (micro-interactions) after WO-ENG-01 + WO-ENG-04; **WO-CRA-09** (AI-surface
   kit) after WO-ENG-02.

### Gates lane start order (first among the new lanes — it protects everything)

The `gates` lane ([`gates.md`](./gates.md), WO-GAT-01..04) is the proof wall: pure additive CI/probe
machinery, zero rendered-pixel change. **WO-GAT-02** first (cheapest; only needs WO-ENG-01).
**WO-GAT-01** (visual-regression CI) as soon as WO-ENG-02 certifies — it is the declared precondition of
the architecture lane's WO-ARC-01, so it must land before any fleet-wide sweep. **WO-GAT-03** right after
(reuses the GAT-01 Playwright harness; fine before WO-ENG-06 — its violation baseline ratchets down).
**WO-GAT-04** once WO-ENG-02 + WO-ENG-04 certify.

### Tokens lane start order (next after gates)

The `tokens` lane ([`tokens.md`](./tokens.md), WO-TOK-01..03) re-engineers the token pipeline and values.
**WO-TOK-01** first and anytime — no dependencies, and it is the regeneration pipeline every later token
change ships through; honor the written cross-repo window with app-evnto WO-IDN-06 (same
`build-vertical-artifacts.mjs`; whichever program lands second re-verifies parity). **WO-TOK-02** (OKLCH)
after WO-ENG-06 + WO-TOK-01. **WO-TOK-03** (DaisyUI retirement) after WO-ENG-08.

### Architecture lane start order (LAST — owner sequencing law)

The `architecture` lane ([`architecture.md`](./architecture.md), WO-ARC-01..05) is the restructure
program and runs LAST: **modern goes premium FIRST, the restructure comes later** (owner decision
2026-07-07). The law is encoded as a HARD dependency edge — **WO-ARC-03 (fleet migration) depends on
WO-ENG-11 (premium signature pass)** — never weaken it. **WO-ARC-01** after WO-GAT-01 (pixel net before
any fleet-wide prop sweep). **WO-ARC-02** (headless pilot) after WO-ENG-04 + WO-GAT-01 + WO-ARC-01, and
recommended to claim only after WO-ENG-11 certifies unless the orchestrator coordinates disjoint Files
windows. **WO-ARC-03** only after WO-ARC-02 AND WO-ENG-11 are done. **WO-ARC-04** (skin pack API) and
**WO-ARC-05** (container queries + fluid scales) after WO-ARC-03.

### Post-C4 program start order (2026-09-05)

The nine lanes adopted from `audit/70-plan/roadmap-draft` on 2026-09-05 (55 WOs) run on their own
wave order. **No WO of these nine lanes may be claimed before `WO-CAN-01` is `done`, with one
exception: `WO-CAT-01`** (owner decision — the identity kit and the vertical envelope are already
approved as D-27/D-28 and WO-CON-03 needs them). The registry enforces this: every new WO except
`WO-CAT-01` depends transitively on `WO-CAN-01`, so `next` offers exactly those two today.

| Wave | Work orders | Parallelism |
| --- | --- | --- |
| 0 | `WO-CAN-01` | sequential; closes the C4 residuals on the committed tree |
| 1 | `WO-CAN-02..06`, `WO-EVI-04` in parallel with `WO-CON-01/02/03` -> `WO-CON-04` -> `WO-CON-05`; `WO-CAT-01` beside them | up to 9 disjoint write sets + 1 auditor |
| 2 | `WO-CAT-02` -> `WO-CAT-03` | sequential (shared contracts, singleton owners) |
| 3 | `WO-DER-01` -> {`WO-DER-02`, `WO-DER-03`, `WO-DER-04`}, in parallel with `WO-EMI-01`, `WO-FAM-00`, `WO-EVI-01`, `WO-EVI-03` | `WO-DER-01` first: it is the contract |
| 4 | `WO-FAM-01..13`, `WO-INV-01..08`, `WO-DER-05` -> `WO-DER-06`, `WO-EMI-02/03`, `WO-EVI-02` | one write set per family directory; the coordinator serialises `WO-FAM-13` against `WO-RET-01` (both touch the shared DnD kernel, `components/primitives/runtime/collection/sortable/**` — re-pointed 2026-09-26 from the non-existent interaction/drag-and-drop path) |
| 5 | `WO-RET-01..05` | after the consumer census |

Order rules that may not be reordered: the engine policy (`WO-CAN-06`) lands before the door
(`WO-CAT-03`); derivation (`WO-DER-01`) lands before any family cut; the theme-graph (`WO-EVI-01`)
comes after `WO-DER-01`; retirement is last. The dated facades of `WO-CON-02/03` are explicit
exceptions to the uniqueness rule and are deleted by `WO-EMI-02`, `WO-CAT-02` and `WO-DER-06`
without changing a signature.

### Programme milestones (published by `status`, never stored)

`pnpm roadmap:status` derives each milestone from its gate work orders; there is no milestone field
in the registry, so a milestone cannot be claimed without the work that proves it.

| Milestone | Gate | What it enables |
| --- | --- | --- |
| A · the apps can build | `WO-CON-04` + `WO-CON-05` | BitHire builds against `packages/core/docs/consumer-contract/index.md` while the DS continues behind the contract |
| A2-pilot · architecture validated in one vertical cut (pilot population) | `WO-CAT-02`, `WO-CAT-03`, `WO-DER-01`, `WO-FAM-00`, `WO-FAM-01`, `WO-EVI-05` | the cascade is proven end to end on one family, on the pilot population only; the autonomous APP and DS lanes start (D-29) |
| B · real cascade in Modern | `WO-DER-05`, `WO-EVI-02`, `WO-FAM-01`, `WO-FAM-02`, `WO-FAM-06`. `WO-DER-07` does **not** gate B: its D-30 BitHire identity pick is deferred to the branding stage (owner decision 2026-09-10, `kit-2026-09.md` §5c), and its technical acceptance was separated from the pick by owner ruling R29 (2026-10-03, the WO-DER-07 AMENDMENT in `derivation.md`): D-30 is a future branding obligation, NOT CHOSEN, registered in `kit-2026-09.md` §5d | two tenants of the same vertical differ in shape, rhythm, states and mode, not only colour; the fleet six-axis threshold is reached |
| C · 116/116 | every `audit-2026-09-05` work order done | re-audit with `audit/20-rubric`; the off-registry conditions (every `audit/30-findings` closure criterion green, every indicator at target) are stated in the STATUS row and are not derivable from WO status alone. D-30 (the BitHire identity pick) is NOT a condition of C: it is a branding-stage obligation, NOT CHOSEN (`roadmap/kit-2026-09.md` §5d) |

**AMENDMENT (R4, 2026-09-08) — the pilot/fleet split, and what it may not certify.**
The 2026-09-08 re-audit found that A2 required `WO-EVI-02`, whose acceptance
(`evidence-graph.md`, read with `kit-2026-09.md` §5 rule 4) is a **fleet** obligation:
each of six non-chromatic axes must move at least 80 % of the families that declare
they consume it, with both negative controls. A one-family pilot cannot discharge a
fleet threshold. The split is therefore executable, not prose: `PROGRAM_MILESTONES`
in `scripts/maintain/roadmap/status/index.mjs` now carries `A2-pilot` gated on the new
`WO-EVI-05` (the pilot instrument), and `WO-EVI-02` moved onto milestone B, which is
where the fleet threshold now gates. This table restates that code; the code is the
authority.

**Milestone A is WITHDRAWN, not merely open (R4, 2026-09-08).** It was reported
reached; both of its gates — `WO-CON-04` and `WO-CON-05` — were reopened by this lot
against DEL-03 and DEL-02/DEL-04, so the reached claim is retracted. Downstream waiters
on the two-track protocol are notified through this line and the handoff protocol above:
track APP's frozen-contract guarantee rests on a shipping consumer proof that is
demonstrably blind to missing capitalized runtime exports, and A may not be re-reached
until `WO-CON-04`'s amended acceptance repairs it. The work-order burn-down moved 92 -> 83
for the same reason; no obligation was deleted, and every reopened work order carries its
prior evidence verbatim in its `progressLog` reopen record.

**Fan-out floors — DECIDED 2026-09-10 (`roadmap/kit-2026-09.md` §5b).** The
consolidated absolute fan-out floors are no longer owner-pending: D1 fixes **20 real
families per `states` control** with the applicable population fixed and justified per
control (no synthetic probe or best-of-vertical reading; D1 gates the family-cut wave
and fleet certification that consume it, not the close of a root WO whose family
adoption was formally assigned to the cuts); D2 keeps the material-arm `ratioFloor`
0.85 as **transitory regression protection, not final certification** (the gate trips
on a drop of six or more governed channels); D3 **rejects** the ≥4/6-axis pilot
shortcut — `WO-EVI-05` keeps all applicable axes and both negative controls, and
`WO-EVI-02` keeps the six non-chromatic axes and its standing threshold. Existing
explicit minima (the D-27 kit rows, the catalog-fixed broad-scope minima and
`WO-DER-02`'s `states.emphasis ≥ 10 families` lane gate) stand verbatim. With the
minima decided, `WO-EVI-02`'s fleet by-axis acceptance and milestone B are **no longer
blocked by unfixed minima; they remain blocked on their evidence**, which the decision
does not supply. A gate may still not be reported green by choosing a friendlier floor.

### Dispositions of the 26 pre-existing open work orders (2026-09-05)

None was deleted; none changed status except `WO-CRA-23`, sealed with `done --evidence "SEALED: …"`.
The other 25 received a `notes` disposition prefix and `dependsOn` edges to the new WO that unblocks
them. Their DS-improvements authorities, `sourceIds`, `programs` and phases are unchanged (A/A
resolution, 2026-09-05), so the burn-down denominator of 82 execute items is intact and advances only
when a superseded WO is closed with real evidence.

| Disposition | Count | Work orders |
| --- | --- | --- |
| absorbed | 9 | `WO-ARC-12/13/15/16/20`, `WO-TOK-11`, `WO-CRA-18/19`, `WO-GAT-12` |
| reformulated | 8 | `WO-GAT-09/11`, `WO-CRA-17`, `WO-ARC-14/17/18/19`, `WO-ENG-25` |
| conserved | 4 | `WO-ARC-21`, `WO-CRA-20/22`, `WO-GAT-10` |
| paused | 3 | `WO-CRA-15/21`, `WO-ENG-24` |
| replaced | 1 | `WO-SKIN-08` |
| sealed | 1 | `WO-CRA-23` |

`AGENTS.md`, `CLAUDE.md` and `packages/core/scripts/check/modern-rescue/program/index.json` still
describe `WO-CRA-23` as the active Modern Rescue programme; `WO-RET-03` retires those documents.
Until it lands, `roadmap/registry.json` is the authority on its status.

## Commands

```bash
pnpm roadmap:status                              # regenerate STATUS.md + summary
pnpm roadmap:check                               # registry <-> lane consistency gate (exit 1 on drift)
node scripts/maintain/roadmap/status/index.mjs next             # actionable WOs (deps satisfied)
node scripts/maintain/roadmap/status/index.mjs show WO-ENG-01   # full spec block
node scripts/maintain/roadmap/status/index.mjs delegate WO-ENG-01   # ready-to-paste executor prompt
node scripts/maintain/roadmap/status/index.mjs claim WO-ENG-01 --by <name>
node scripts/maintain/roadmap/status/index.mjs done WO-ENG-01 --evidence "<gate + result>"
```
