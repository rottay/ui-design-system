---
title: "Design System Retire: dead code, legacy CSS, manifest and evidence quarantine, physical tree, showroom"
date: 2026-09-05
status: canonical (adopted 2026-09-05 from audit/70-plan/roadmap-draft; state lives in roadmap/registry.json)
audience: ai-agent
sources:
  - audit/README.md (verdict, guide for the executor)
  - audit/30-findings/** (closure criteria of every F-nn cited below)
  - audit/70-plan/index.md (blocks, waves, indicators)
  - audit/50-matrices/customization-inventory/index.md §5 (identity kit, approved as-is by the owner on 2026-09-05, D-27)
---

# Retire: dead code, legacy CSS, manifest and evidence quarantine, physical tree, showroom

Removal lots. Private capability deletion requires a consumer census proving zero productive consumers. An explicit D-07 target-major public boundary retirement may instead preserve the useful private implementation and document the real consumer migration, as specified in its amendment; it is never certified as a zero-consumer deletion.

Lane-wide rules (binding on every WO):

- Repo: `/Users/daniel/Developer/Rottay/ui-design-system` (macOS, pnpm). Paths are relative to the repo root unless prefixed; "logical path" means the target-tree grammar of `audit/40-architecture/target` §5. D-21 is decided (owner, 2026-09-05): grammar (b), first level — `packages/core/src/{contracts,kernel,tokens,graphics,compilers,runtime,components,entrypoints}`. A logical path written `.../src/infrastructure/compilers/theme/**` therefore materializes as `.../src/compilers/theme/**`, `.../src/foundation/contracts/theme/**` as `.../src/contracts/theme/**`, and `.../src/infrastructure/runtime/<x>/**` as `.../src/runtime/<x>/**`. New code is born with this grammar from WO-CAT-02; what is not rewritten is normalized in WO-RET-04. `packages/core/scripts/check/architecture/audits/structure/index.mjs` and `CLAUDE.md` still pin the four-tier grammar, so WO-CAT-02 — the first WO that materializes a new first-level root — also amends that gate, its test and the written law.
- Engines: Modern is the only admitted engine; Classic and Rustic stay in the package frozen and fail-closed; no WO in any lane adds content, tokens, tests or a11y work to them (owner decision 2026-09-05).
- Every WO names the audit findings it closes (`Closes`) and is done only when the closure criterion of each cited `F-nn` (`audit/30-findings`) passes on the working tree, in addition to its own acceptance gate and a green DS build/test.
- Uniqueness: a WO that leaves two files or two processes with the same responsibility is not done.
- Executors are edit-only; the coordinator certifies and commits one lot at a time; never push.
- Write sets are declared before claiming; two in-flight WOs never share a file; the coordinator integrates shared files (`package.json`, CI, gate manifests).


### WO-RET-01 Retire code without productive consumers and the legacy public API (changeset 3.0)
- **Outcome** — ~17K LOC without productive consumers (admin surfaces, dead data/list surfaces, `application/data`, `patterns/runtime/*`, 41 orphans, 95 dead barrels, `extensions`, `IconFrame`/`Meter` decision), 97/121 public subpaths, 75 `@deprecated`, dead transports (`DEFAULT_TENANT_CONFIG`, `createTenantConfig`, `useTenantBranding`) are removed behind a consumer-census gate; `icons/bithire`, vertical pictograms and marks move to presets; the legacy icon catalog moves to `./icons/legacy` with an end-of-life date; effects/spatial/application-runtime decided per D-19 (adopt with a real consumer or remove).
- **Why** — F-42/F-94: APIs nobody consumes are published and documented; F-109/F-113: product semantics inside shared corpora; F-111/F-115: governed capabilities re-implemented by the apps.
- **Closes** — F-42, F-94, F-91, F-88, F-109, F-110, F-111, F-113, F-115, F-84 (closure criteria in `audit/30-findings`).
- **Wave** — 5; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-EMI-02, WO-FAM-01, WO-FAM-02, WO-FAM-03, WO-FAM-04, WO-FAM-05, WO-FAM-06, WO-FAM-07, WO-FAM-08, WO-FAM-09, WO-FAM-10, WO-FAM-11.
- **Steps** —
  1. Consumer census gate (`entrypoint → consumers` across showroom + 3 apps) as a decrease-only anchor; then delete in lots with the 3.0 changeset and codemods.
  2. Icons: legacy subpath with EOL; `bithire` pack to a preset; marks/pictograms by preset.
  3. D-19 dispositions recorded per capability.
- **AMENDMENT (2026-10-02, current owner direction: DS canon before app adaptation)** —
  The measured `./icons/full` facade duplicates the renderer and complete role
  inventory already exposed by `./icons`; `./icons/corpus` is a pure metadata
  re-export. Consolidate the useful metadata at `./icons` and retire the duplicate
  doors rather than adding `./icons/legacy` solely for compatibility. Both mark
  facades remain at `./marks`. Preserve the six corpus roles consumed by the live
  BitHire preset and the generator's frozen prefix; a zero `pack: bithire` grep
  is not permission to delete them. Final domain ownership must be resolved through
  the preset/corpus producer, with content conservation and a generator check.
- **AMENDMENT (2026-10-02, resource-isolation review)** —
  Preserve `./marks/brand` and `./marks/cloud` alongside aggregate `./marks`.
  They are distinct resource boundaries over the same canonical implementations,
  not duplicate implementations: the aggregate CommonJS require closure executes
  both adapters even when a consumer selects one export. Removing the class doors
  would violate asset-isolation acceptance and synchronous SSR.
  RET-01-F therefore retires three icon doors (43 to 40 subpaths), not five.
  Keep the split ESM/CJS fixtures and original retention budgets; availability
  through the aggregate is not evidence of isolated execution.
  Their existing `retire-by` disposition is unchanged: preserving a necessary
  resource boundary does not grant a new `guaranteed` promise or waive the
  consumer-admission rule. Final admission/disposition remains part of RET-01.
- **AMENDMENT (2026-10-02, measured CommonJS cost and D-07 major retirement)** —
  The first consolidated candidate measured 319,099 B gzip in CommonJS against
  the unchanged 226,000 B full-corpus ceiling. The canonical door transitively
  executed the historical glyph catalog; ESM tree-shaking did not prove CJS
  isolation. Retire its 328 vendor-named public glyph bindings in the major
  changeset instead of widening that ceiling or adding a compatibility door.
  Keep the complete 282-role semantic inventory, metadata, runtime governance,
  explicit non-catalog helpers/types and privately consumed implementations.
  This is a deliberate public break with real consumers, not a zero-consumer
  deletion. The consumer fixture uses semantic `Icon` and must remain green;
  app adaptation is documented and remains read-only in this stage. Showroom
  migration and its certification are still DS work and must be resolved before
  RET-01 closes. The proposed one-minor compatibility promise is superseded only
  by this major target; no release or publication is implied.
- **D-19 disposition (2026-10-02, bounded application preferences)** —
  Retire the unadopted `useRouterState` and `useNotificationPreferences`
  implementations, their exclusive tests and their eight root/facade bindings.
  The current DS, Showroom and three app trees have no productive consumers of
  these bindings. URL routing and notification settings remain app-owned state
  passed through controlled component props, not a second DS authority.
  Preserve `useLayoutPreference`: command-palette productively uses it for
  frecency persistence. Verify that real callback/storage path alongside the
  retirement guards; deleting the exclusive tests is not acceptance evidence.
  This disposes of two capabilities only and does not close all D-19 or RET-01.
- **AMENDMENT (2026-10-03, owner-authorized DS-only acceptance reconciliation; scope per owner ruling R19; the original acceptance below stands verbatim and is NOT relaxed)** —
  Authority: owner ruling 2026-10-03 section 1 (progress 2026-10-03 07:35) and
  owner ruling R19 "Ratifico un encuadre mixto" (progress 2026-10-03 10:11),
  quoted verbatim below. Independent review of this text: `claude-fable-5-1`,
  ADOPT WITH CORRECTIONS, all applied. This is a reconciliation, not a lower
  bar, and adopting it closes nothing.
  ORIGINAL LINES, verbatim, measured at 5639cde7a. Each is NOT MET as written
  and is superseded for closing this work order by the criterion named; none
  is restated as met:
  L1 "Import graph: 0 unreachable modules" — NOT MET (2 unreachable, 6
     test-only). Superseded by R1.
  L2 "`exports` with a censused consumer per subpath" — NOT MET (10 of 40
     subpaths have no censused consumer). Superseded by R2.
  L3 "`grep -rn "@deprecated" src | wc -l` = 0" — NOT MET (55). Superseded by
     R3.
  L4 "`grep -c '"pack": "bithire"' corpus/manifest.json` = 0" — NOT MET (6).
     Superseded by R4; the six roles are conserved by the AMENDMENT of
     2026-10-02 above.
  R19, verbatim:
  "1. F-84: ampliar Files por rutas exactas para el rename y la unificación de
  DensityKey/DensityPosture, cuyos valores son idénticos. No colapsar los otros
  tipos de Density: representan ejes distintos. Registrar esa parte en un
  receptor abierto, con aceptación y dependencia explícitas; no declararla
  resuelta por transferirla.
  2. F-88: ampliar la ruta del error-boundary. Usar tokens y copy del catálogo,
  sin primitivas resueltas mediante engines que podrían volver a fallar dentro
  del fallback. Conservar IconFrame/Meter como capacidades canónicas si aportan
  funcionalidad propia; no eliminarlos solo porque hoy los consume Showroom.
  Cualquier cambio en engines congelados requiere autorización específica, no
  queda autorizado por esta ampliación.
  3. F-94: ampliar las tres rutas propuestas para retirar
  createTenantConfig/useCreateTenant de la fachada pública, con changeset y
  codemod. Conservar la implementación interna utilizada por tenant-preview. No
  incluir una reescritura de los engines de preview en este lote.
  4. BrandMotion: ampliar únicamente las rutas del DS necesarias para migrar el
  preset de evnto al contrato gobernado, conservando sus capacidades y
  verificando los tokens de movimiento antes/después. No tocar aplicaciones.
  Preservar compatibilidad con datos persistidos cuando corresponda, mediante
  disposición explícita.
  Registrar estas decisiones en roadmap y workflow. Las transferencias deben
  mantener visible el trabajo pendiente, sin cierres ficticios ni bajar
  criterios."
  FILES, ADDED BY EXACT PATH (the `Files` bullet below stands; these are added
  to it; a path in neither list is outside this work order):
  (a) Work the Outcome already names (`extensions`, 75 `@deprecated`, the
      census gate, codemods, the showroom migration):
      `packages/core/src/index.ts`;
      `packages/core/src/foundation/contracts/runtime/engine/index.ts`;
      `packages/core/src/foundation/contracts/kernel/tokens/extensions/index.ts`;
      `packages/core/src/foundation/contracts/kernel/common/index.ts`;
      `packages/core/contracts/package/deprecations/**`;
      `packages/core/scripts/check/boundaries/deprecations/**`;
      `packages/core/scripts/check/consumer-census/**`;
      `packages/core/scripts/maintain/codemods/**`;
      `packages/core/docs/consumer-contract/**`;
      `packages/showroom/src/**`; `evidence/ret-01-closure/**`.
  (b) R19 item 1, F-84 (unification and rename only):
      `packages/core/src/foundation/contracts/runtime/components/patterns/data/index.ts`;
      `packages/core/src/infrastructure/runtime/foundation/density/index.ts`.
      The rename's own files are already inside `packages/core/src/components/**`.
  (c) R19 item 2, F-88:
      `packages/core/src/infrastructure/runtime/engines/presentation/component-factory/error-boundary/**`.
      No catalog file is added: the fallback reads keys that already exist.
  (d) R19 item 3, F-94 (three owners, with their co-located tests):
      `packages/core/src/infrastructure/runtime/tenant/facade/index.ts`;
      `packages/core/src/infrastructure/runtime/tenant/composition/react/authoring/use-create-tenant/**`;
      `packages/core/src/infrastructure/runtime/tenant/runtime/authoring/configuration/**`.
  (e) R19 item 4, BrandMotion (the preset migration only):
      `packages/core/src/foundation/presets/policy/experience-baselines/evnto/**`;
      `packages/core/src/foundation/presets/product-profiles/index.ts`;
      `packages/core/src/foundation/contracts/composition/tenants/themes/index.ts`
      (the marker's text only). Narrowing the interface is NOT in this work
      order: it needs the theme-document types, the iso schema, the lowering,
      the tenant-theme compiler and the Brand Studio editor and file export,
      none of which is added here; it is a WO-RET-06 item.
  FROZEN ENGINES. Nothing under `**/engines/classic/**` or
  `**/engines/rustic/**` is authorized by this amendment. A frozen file moves
  only by one of two recorded routes, one engine-freeze `--authorize` entry
  per file per lot: (1) the freeze policy's own "minimal shared-contract
  compile fix" (a shared-contract member or type name is removed and the
  frozen file stops compiling; no emitted byte changes), which is the specific,
  content-pinned, reasoned authorization R19 asks for; (2) anything that
  changes behaviour needs an owner authorization naming the file. Route (1)
  was used for `components/patterns/data/list-toolbar/engines/classic/index.tsx`
  (02380773e) and covers
  `components/primitives/display/card/engines/{classic,rustic}/index.tsx`
  (the `extensions` discard). Route (2) is required for
  `components/primitives/inputs/color-picker/engines/rustic/index.tsx`
  (`#1677ff`, a behaviour default), for the Classic engine of
  `components/patterns/workflow/approval-inbox`, and for the Classic and
  Rustic engines of `components/patterns/customization/tenant-preview`.
  No file of an application and no file of `docs-engineering` is in scope.
  REPLACEMENT CRITERIA. Each command exits 0 on one frozen closure candidate.
  The outputs are written to `evidence/ret-01-closure/R1.txt` ... `R6.txt`,
  committed, and their sha256 quoted in `done --evidence`. After `done`, R1-R3
  are re-run without `--assume-done` and must still exit 0.
  R1 `node packages/core/scripts/check/consumer-census/index.mjs --check
     --assume-done=WO-RET-01` prints "0 unreachable outside named classes" and
     no `[module-class]` finding: every unreachable or test-only module is in a
     class the gate re-proves, with an open receiver, or is retired.
  R2 the same command prints no `[door-disposition]` finding: every
     consumerless subpath is attributed with verified evidence, `lab` with an
     open owner, or `retire-by` an open work order that carries, per door, its
     admitting consumer, its retiring changeset row and its dependency; no
     contract row names WO-RET-01 or a closed work order; and
     `git grep -nE "design-system/(icons/(foundation|identity|intelligence|operations)|patterns/charts|public-entrypoints-manifest)" -- packages/showroom/src`
     prints nothing.
  R3 `node packages/core/scripts/check/boundaries/deprecations/index.mjs --check
     --assume-done=WO-RET-01 --json` with the three sibling checkouts present
     (the closure run; its `--json` is kept beside the receipts audit record),
     AND the same command with `--siblings=absent` (the CI view): both print
     0 failures. That means: no `debt` row; no row names WO-RET-01; every
     remaining row names a receiver listed in `compatReceivers`, a codemod id
     the map confirms, a blocker other than `parity-unproven` carrying its
     fixture where the class needs one, and the evidence kind its class
     requires verified live or resting on an audited receipt. A receipt that is
     unaudited, stale or contradicted is a failure, not a report.
  R4 `pnpm --filter @rottay/design-system icons:check` and
     `node --test packages/core/scripts/generate/semantic-icons/index.test.mjs`:
     exactly the six `pack: bithire` rows, in order, each in the bithire preset.
  R5 `node packages/core/scripts/maintain/codemods/index.mjs --check
     packages/core/src packages/showroom/src`: zero findings; and
     `node --test packages/core/scripts/maintain/codemods/tests/*/index.test.mjs`
     green.
  R6 `node packages/core/scripts/check/contract-changeset/index.mjs
     --base=origin/main --head=HEAD`: every published removal or change in the
     range is covered by a changeset row.
  R19 ITEMS, each a closure condition of this work order, with its state at
  5639cde7a. "Landed" names a commit; it does not close the finding, which is
  measured on the closure candidate:
  I1 F-84. (i) LANDED 02380773e: `DensityPosture` is the one public name and
     the one declaration of the density-posture axis; `DensityKey` left the
     public surface and both source trees, no alias remains, and a test walks
     both trees to keep it so; the frozen Classic list-toolbar engine changed
     by six type identifiers under a written freeze exception with
     byte-identical emitted output; the codemod entry
     `symbol-removed/.#DensityKey` rewrites imports and turns a re-export into
     `DensityPosture as DensityKey`. (ii) NOT DONE: the two pattern-owned
     folders named `recipes` (`components/patterns/foundation/recipes`,
     `components/patterns/runtime/recipes`) are still to be renamed; proof:
     `find packages/core/src/components/patterns -type d -name recipes` prints
     nothing, a focal `structure:check` accepts the new names, and
     `RecipeVariantConfig` and `createRecipeVariant` are censused with one
     recorded decision each. (iii) NOT collapsed: the other density types,
     named one by one with the decision each is owed in the WO-RET-06 block.
     F-84's literal criteria ("`grep -rl "recipes" src/components/patterns |
     wc -l` = 0", "un solo `Density*` type") are NOT MET and are not declared
     met; the remainder is registered in WO-RET-06 with its own acceptance.
  I2 F-88. (i) and (ii) LANDED 09ef3e34b: the engine error-boundary fallback is
     plain elements with alert semantics and a native retry button, painted by
     design-system tokens and worded by the existing catalog keys
     `errors.generic` and `components.surfaces.states.retry` (with a provider
     mounted the catalog copy wins, proven in five locales; with none mounted
     the literal fallback renders), resolving nothing through the engine
     loader;
     `VoiceInputButton` without a `lang` follows the provider locale as a
     regional tag. Raw structural elements inside the fallback are the
     documented exception R19 itself requires. (iii) OWED: `IconFrame` and
     `Meter` are kept as canonical capabilities (owner decision R19); the
     record of what each provides that no other primitive does, with its
     tests, is still to be written into this work order's progress log; "the
     showroom is the only consumer today" is stated, not hidden. (iv) NOT MET:
     the Rustic colour-picker default `#1677ff`
     (`components/primitives/inputs/color-picker/engines/rustic/index.tsx:65`)
     is a behaviour default on a frozen engine. Unless the owner authorizes
     that one line, F-88's "sin hex" clause stays NOT MET, F-88 is NOT closed
     by this work order and its final authority is WO-RET-06. This work order
     may close without claiming F-88.
  I3 F-94. LANDED 1508f91de: `createTenantConfig` and `useCreateTenant` left
     the root entrypoint with their changeset rows and the two report-only
     codemod entries (no public replacement is invented toward a private
     module). `createTenantConfig` stays as the internal module the
     tenant-preview engines import; `TenantCreationConfig` stays public as the
     `TenantPreview` prop type. `useCreateTenant` had no importer off the
     facade and was deleted with its client-side artifact mount, which no
     other module provides; its exclusive test `artifact-mount-restore` died
     with it, and the law test `compile-door-census` was kept and now pins
     zero client compile doors. The tenant-preview engines were not edited.
  I4 BrandMotion. LANDED 2f3aa983d, the preset migration only: the evnto
     preset is checked against `AnimationPersonalityTokens`, which has exactly
     its thirteen fields; values and emitted motion tokens are unchanged; no
     bundled preset authors `BrandMotion`. THE MARKER SURVIVES: the
     theme-document iso schema still admits the twelve open-ended fields, the
     personality lowering still reads them, and the Brand Studio editor still
     authors six of them (`entrance`, `entranceDuration`, `hoverLift`,
     `hoverScale`, `pulseSpeed`, `skeletonStyle`) and its file export reads
     `entranceDuration`. PERSISTED-DATA DISPOSITION, explicit (independent
     audit ruling, disposition B): at this adoption the ledger row is
     classified `compat-persisted-data`, blocker `persisted-data-unproven`,
     two `persisted-reader` evidence entries the gate verifies (the iso schema
     admission and the personality lowering read), `removeIn` 4.0, codemod
     `member-changed/.#BrandMotion.entranceDuration`, receiver WO-RET-06. That
     is a classification by verified evidence, not a transfer of debt, and it
     retires nothing: retiring the six Brand Studio editor fields and the
     file-export read, proving stored documents clean or migrating them, and
     then narrowing the interface are WO-RET-06 work. Whether stored tenant
     documents carry the open-ended fields was not measured.
  DEBT. Five ledger rows are `debt` after this adoption; none transfers; this
  work order does not close while any is a `debt` row:
  D1 `PatternApprovalInbox` — RESOLVED by owner ruling Q1 (2026-10-06,
     `roadmap/owner-decisions-2026-10-06.md`): canonical at the patterns
     tier. The `@deprecated` marker, its ledger row and the
     `.changeset/major-canonical-tree.md` "succeeded by" bullet are removed;
     nothing retires and no migration is owed (no alias or duplicate
     exists). Consumers, stated: zero application consumers; the showroom
     pattern docs preview and the ds-reference behaviour probe (bithire,
     the-management). Contract: `ApprovalInbox.contract.test.tsx` through the
     public facade on Classic and Modern, with the Rustic absence refused by
     name. The surface question is recorded by dated AMENDMENT in WO-RET-06.
  D2 `ComponentExtensions`, `ExtensionHelpers`, `EngineAwareProps.extensions`
     — RECORD: no `docs-engineering` write permission exists for the two
     sha-pinned `component-extensions` blocks
     (`engineering/design-system/README.md`,
     `engineering/design-system/foundations/contracts/README.md`), and the
     claims allowlist fails closed on them. The extensions triple cannot
     retire, and this work order cannot close on R3 (nor F-91 on its second
     clause), until the owner permits those two block edits (Q2). This is
     recorded, not waived.
  D3 `LegacySizeAlias` — zero importers; it stays published only because the
     sizing gate draws the Ant spellings of Descriptions, List, Space,
     Segmented and Steps from it. It cannot cross this closure. Route inside
     this work order, one of two: the five components move to the canonical
     steps by facade normalisation and the alias is deleted, or the sizing
     gate states that vocabulary inline and the alias is deleted. `SizeType`
     itself is retired (fb03f7af1).
  NAMED OBLIGATIONS FOUND BY AUDIT (hidden debt: no marker and no ledger row
  today, so the gate cannot see them). `DescriptionsSize`
  (`default | small | middle`), `ListSize` (`default | small | large`) and the
  `Segmented` size default (`middle`) carry Ant size spellings. Each gets a
  `@deprecated` marker on the Ant spellings and a ledger row, class
  `compat-canon-pending` when the row is added, and is resolved by the same
  facade-normalisation route as D3. Until they are ledgered or resolved this
  work order does not claim that R3 covers every legacy size spelling.
  OWNER QUESTIONS OPEN (four, one choice each):
  Q1 Is a compact, embeddable, grouped approve/reject widget wanted product
     capability? YES: `PatternApprovalInbox` is canonical at the patterns
     tier; the marker and its false "superseded by" text are removed and the
     row deleted; "the surface's row-decision path composes it, or is declared
     out of scope" enters WO-RET-06 by dated AMENDMENT. NO: `groupBy`
     pass-through and inline row decisions are ported into
     `DecisionInboxSurface`, six showroom sites migrate, the pattern and its
     Classic engine retire (freeze route 2). Unanswered: a debt row remains.
     ANSWERED 2026-10-06: YES (`roadmap/owner-decisions-2026-10-06.md` §Q1);
     applied as D1 above.
  Q2 `docs-engineering`: A, permit replacing the two sha-pinned
     `component-extensions` blocks in a separate docs-engineering commit when
     the triple retires; B, the triple stays `reserved-deprecated` until
     docs-engineering opens. Unanswered: D2 stands.
  Q3 Rustic colour-picker `#1677ff`: A, authorize the one-line replacement by
     a token-derived default (F-88 then closes here); B, F-88's "sin hex"
     clause stays OPEN under WO-RET-06. Unanswered: B applies; the default
     path is lawful without an answer.
  Q4 Meaning of `surfaces.overlays`: A, modal and sheet scrim ladder; B, tint
     wash. Unanswered: the `backdrop` module cannot be retired, R1 stays red.
  EXCEPTIONS (name; reason; scope; proof; receiver). Nothing here is closed by
  being listed:
  E1 `surfaces/foundation/common/story-helpers` — story support, 31 stories;
     census class `story-support`, re-proven each run; WO-RET-04.
  E2 `foundation/contracts/kernel/adaptation/composition/families/registry` —
     read by path by the adapt-slot gate; class `tooling-path-read`; WO-RET-04.
  E3 `surfaces/foundation/common/test-utils`;
     `infrastructure/runtime/foundation/change-key` — test support; prepared
     cut; WO-RET-04.
  E4 `foundation/presets/candidates/bithire` (+ `documents`) — lab data;
     WO-DER-07.
  E5 Doors with no censused consumer, `retire-by WO-RET-06`, eleven, each with
     its admitting consumer, retiring changeset row and dependency in the
     WO-RET-06 block: `./marks/brand`, `./marks/cloud`, `./icons/roles/*`,
     `./icons/foundation`, `./icons/identity`, `./icons/intelligence`,
     `./icons/operations`, `./pictograms`, `./styles/rottay`,
     `./styles/modern`, `./dist/*.css`. The contract table still names
     WO-RET-01 on these rows; re-homing them is owed work of this work order.
  E6 Roles `bithire.candidate`, `bithire.interview`, `bithire.pipeline`,
     `bithire.evidence`, `bithire.job`, `bithire.offer` — conserved; domain
     ownership open; proof R4; WO-RET-06.
  E7 `./spatial` — `lab`, review at 4.0; WO-CRA-15 (phase 2C, locked; not
     actionable). Effects `Aurora`, `GlassCard`, `GradientBackground`,
     `GlowEffect`, `Spotlight`, `Magnetic`, `Parallax` — `candidate`, not
     productive, not certified; WO-GAT-10 (phase 2C, locked; not actionable).
  E8 Frozen sole-implementer markers, 24, by name in the WO-RET-06 block;
     proof: ledger needles re-verified each run; WO-RET-06. Each ends there by
     demonstrated equivalence and retirement, or by an owner disposition that
     the frozen engines keep the behaviour: then the `@deprecated` marker is
     removed, the row is deleted and the capability is documented as canonical
     for the engines that implement it. No alias survives as forgiven debt.
  E9 `AvatarVariant`, `AvatarProps.variant` — the canonical owner cannot
     express `secondary` and `gradient`; WO-RET-06, same two endings as E8.
  E10 `BrandSurfaces.materials` and `BrandMotion` (I4) — read and admission
     kept until stored payloads are proven absent or migrated; WO-RET-06. On
     proven absence the read is removed; on a "keep" disposition the marker
     goes, the row is deleted and the admission is documented.
  E11 Consumed compatibility markers. The ceiling is fixed at the adoption of
     this amendment: the 22 anchors of ledger class `compat-consumed` at
     5639cde7a, listed in the WO-RET-06 block. The subset that actually
     transfers is fixed by name at the closure commit: only rows whose parity
     verdict is recorded as failed with a fixture, each re-homed with
     `removeIn` 4.0. A row with proven parity is retired inside this work
     order. Nothing outside the ceiling may enter; WO-RET-06.
  NOT EXCEPTIONS: `./supplier-contract`, `./supplier-honesty-cli`,
  `./hooks-manifest`, `./icons/presets/bithire`,
  `./tenant-theme-canary-fixtures` are to be re-homed to `guaranteed` on
  measured or structural evidence. `./patterns/charts`,
  `./public-entrypoints-manifest` and
  `components/primitives/runtime/overlay/backdrop` are debt and are retired
  inside this work order. `grid-pattern`, `noise-texture` and `shimmer-text`
  are consumed capabilities with `candidate` admission. `useTableExport` is a
  governed capability with no DS consumer (X-08).
  FINDINGS. Closed by this work order only when each one's own criterion in
  `audit/30-findings` is measured green on the closure candidate: F-94 (I3),
  F-91, F-110. NOT closed by this work order; final authority WO-RET-06; they
  stay OPEN there, gate milestone C, and stay visible to any global
  certification: F-42, F-109, F-111, F-113, F-115, F-84 (remainder after I1),
  and F-88 for as long as its "sin hex" clause is unmet. A transfer completes
  nothing.
  CONSUMER NOTES (no application edited; no automatic upgrade claimed):
  X-07 3.0 no longer ships `supplier-contract.json`,
     `consumer/ds-supplier-honesty.mjs` or `hooks-manifest.json` at the package
     root. `scripts/ds-supplier-honesty.mjs` in the three applications fails
     first on the missing files and, once repointed, on the contract and CLI
     equality checks. Supported path: the `rottay-ds-supplier-honesty` bin and
     the `./supplier-contract` specifier.
  X-08 `useTableExport`: app-platform keeps a local hook; adoption not certified.
  X-09 per-application dry-run counts of every codemod class.
  X-10 app-platform `src/app/globals.css:14` imports `dist/platform.css`, which
     3.0 does not build or ship; replacement
     `@rottay/design-system/styles/rottay`.
  X-11 `DensityKey` is imported or re-exported by one file in each application
     (`app-bithire/src/ui/tables/listing/toolbar/index.tsx`,
     `app-evnto/src/ui/tables/list-toolbar/index.tsx`,
     `app-platform/src/ui/tables/entity-table-workspace/types.ts`) and fails
     at compile time on upgrade; the codemod rewrites the import and emits
     `DensityPosture as DensityKey` at a re-export so the application keeps
     its own exported name.
  CODEMODS: no general waiver. Every removal belongs to a codemod class with
  fixtures, or to a report-only entry carrying the census and the statement of
  what a codemod would resolve or why none is possible. CSS class and vendor
  glyph classes are report-only and the changeset says so. Of the 28 rows
  re-homed to WO-RET-06 at this adoption, 27 have no map entry yet and carry
  no codemod id; the map entries are owed before either work order's R3-class
  gate can pass on them.
- **AMENDMENT (2026-10-06, AM-1 v3. R5 relaxed by name to R5′; standing register; notice entries; transferred subset; the `Callout` route and E8 24 -> 25. R1–R4 and R6 of the 2026-10-03 amendment stand verbatim. Adopting this closes nothing)** —
  Authority: owner decision packet 2026-10-06, `roadmap/owner-decisions-2026-10-06.md`
  § "AM-1 — Ratified v3" (registered at a64aa0aea), quoted verbatim: "R5 becomes R5′
  with the exact initial registry: 18 rows / 25 reports / 17 files, the 3-carrier
  sub-ceiling, and the class/proof/path/count restrictions as described. Negatives and
  retired-name assertions preserved. Typecheck against the candidate's own constructed
  declarations. Callout is approved as row 25 of RET-06's frozen group plus the five
  parity-failed transfers, all Variant conditions kept, including "goes last". The
  current census is revalidated before adoption; any difference is explained, never a
  reason to raise the ceiling. A transfer is not a repair. R1–R4/R6 stand untouched."
  The ratification covers R5′ AND the `Callout` route with E8 at 25.
  Independent review of this text: `claude-opus-5-5`, separate session, HOLD on v2 with
  eight edits, all applied in v3; census revalidation of v3 at a64aa0aea by a separate
  read-only session, ADOPT WITH NAMED DIFFS, the three diffs applied here.
  MEASURED at ba22b704f (identical at 08a3edbd7, 66ae3a530 and a64aa0aea): `node
  packages/core/scripts/maintain/codemods/index.mjs --check --no-standing
  packages/core/src packages/showroom/src` exits 1 with 0 rewrites and 25 reports over
  seven ids, in 17 files.
  R5 "zero findings" is NOT MET as written. It is relaxed to R5′ below; it is not
  restated as met.
  The 25, by class:
  RA 13 reports in 6 design-system test files that spell a retired name in order to
     assert its absence or its refusal: `css-class-renamed/.#ActionDock` 1; the resolver
     report `subpath-removed/./does-not-exist#*` 1;
     `css-custom-property-renamed/./server#TENANT_THEME_REFERENCE_TOKENS` 7 (2 files);
     `css-custom-property-renamed/.#BrandPaletteAliases` 4 (2 files).
  N  12 reports of report-only `member-changed` entries on exports that stay published,
     in 11 showroom files: `.#TenantConfig` 7, `.#Callout` 4,
     `./server#censusRuntimeVisualPayload` 1. `.#TenantConfig` reports only what the kit
     cannot prove: four files that spell a removed member name, and three files that
     spell none but spread or assert a value they do not write. `.#Callout` and
     `./server#censusRuntimeVisualPayload` carry no member proof and report once per
     importing file.
  LANDED, no longer in the measurement: the 20 `spread` reports of
  `union-member-removed/.#BoxProps.left` / `.right` (65abdd45d, see N4); seven
  `TenantConfig` / `baselineFor` reports (06032f1a3 and 5c887859c together).
  `.#baselineFor` reports 0 and is not registered.
  RA cannot reach zero without deleting the proof of a retirement; N cannot reach zero
  while the showroom uses the export, because the kit proves spelling and arity inside
  one file and does not infer types.
  R5′ `node packages/core/scripts/maintain/codemods/index.mjs --check packages/core/src
     packages/showroom/src` exits 0 — the command exactly as printed here, run from the
     repository root, with neither `--map` nor `--standing`. `--check` reads the standing
     register `packages/core/scripts/maintain/codemods/standing-reports/index.json` and
     is red on: any rewrite; any report whose (id, file) has no register row; a file
     whose live count for an id exceeds its row; a row whose live count is lower than
     its pin or zero (the row is lowered or deleted in the same lot); a row whose live
     `proof` differs from its pin; a row of a class its id, path, reason or `proof` does
     not admit. The command prints `standing: <n> report(s) in <m> row(s), ceiling <c>`
     on every run, where <c> is the register header. A run with `--map` or `--standing`
     prints the non-default path on the `standing:` line and is not evidence for this
     criterion. `--check --no-standing` prints the raw findings and
     `standing: not read (--no-standing)`, and is the output kept as evidence beside
     R5.txt (exit 1 expected, 25 reports).
     AND `node --test packages/core/scripts/maintain/codemods/tests/*/index.test.mjs`
     green.
     AND `pnpm --filter @rottay/showroom typecheck` exits 0 against a design-system build
     of the same candidate: the showroom reads `@rottay/design-system` through the built
     declarations (`packages/core/dist/index.d.ts`), so the leg counts only when that
     build was produced from the candidate commit, and the evidence records the build
     beside the typecheck. This, not the kit, is the proof that no showroom file spells a
     read or a write of a removed member of an N export. It is not a proof for a value a
     file receives and relays; see `member-carrier`.
  THE REGISTER. Rows are `{ id, file, count, class, proof, why }`; no glob, no
     directory, no id wildcard; paths are relative to the repository root. The kit's
     `member-changed` finding carries the proof kind as data —
     `proof: "spelled" | "carrier" | "escapes" | "import"` (`import`: the entry declares
     no member proof; a failed arity proof or a site the kit does not follow carries no
     `proof` and is admitted by no class) — and the register pins it; `proof` is absent
     on a `retirement-assertion` row.
     Three classes, closed:
     `retirement-assertion` — admitted only for a file under
        `packages/core/src/**/tests/**`, and only for a report whose reason is
        `string-literal` or `unmapped-unpublished-subpath`.
     `member-report` — admitted only for an id of class `member-changed` whose map entry
        is `mode: report-only`, only for a file under `packages/showroom/src/**`, and only
        for `proof` `spelled` or `import`.
     `member-carrier` — same id and path admission, only for `proof: "carrier"`. These
        are the rows the typecheck does not prove. Sub-ceiling 3, a literal in the kit
        test. The guard that reports them is type-blind: it fires on any spread or
        assertion of a value the file does not write, in a file that names the type. Each
        row's `why` states what the reported lines are. At adoption:
        `components/visual-authority-probe/index.tsx` asserts a design-system value as
        `TenantConfig` (a carrier of the type); `app/probe/custom-component-pack/page.tsx`
        and `components/probe-ground/ground/index.tsx` spread style, stage and option
        objects and write their `TenantConfig` as a literal in the file (guard
        imprecision, not a relay). A `member-carrier` row leaves the register when the kit
        stops reporting the file — because the construct was removed, or because a
        precision proof landed in the kit — and by no other route.
     `proof: "escapes"` is admitted by no class.
     Disclosed limit: the kit decides `spelled` before it looks for carriers, so a
     `spelled` row is not evaluated for carrier lines; the `proof` pin detects a carrier
     that appears in an `import` row and does not detect one that appears in a `spelled`
     row.
     Initial content, fixed by name at adoption: 18 rows, 25 reports, 17 files —
     `retirement-assertion` 6 rows / 13 reports / 6 files; `member-report` 9 rows /
     9 reports; `member-carrier` 3 rows / 3 reports; the 12 showroom rows sit in 11 files
     (one file carries two ids) — exactly the (id, file) pairs of the measurement above.
     The kit test (`tests/cli/index.test.mjs`) pins the adoption roster: the 18 (id, file)
     keys by name, each with its adoption count, class and `proof`. It asserts that every
     register row is a roster key with `count <=` its adoption count and the roster's
     class and `proof`; that `sum(count) === ceiling` for the header; and that the
     `member-carrier` rows number at most 3. So the register moves down by editing the
     register alone, and a row can be added, swapped for another, raised above its
     adoption count or re-classed only by editing the roster in the kit test, in review.
     The header at adoption is `ceiling: 25`.
     A row is not a waiver of a migration: no `rewrite`-mode entry and no report of reason
     `spread`, `non-literal-value`, `unmapped-value`, `conflict`, `indirect` or `dynamic`
     may be registered.
  NOTICE ENTRIES (R3 "a codemod id the map confirms" for a row that survives 3.0).
     "Notice" names a map entry only; no register class bears that name.
  N1 A ledger row that survives this closure names a map entry of class
     `member-changed`, `mode: report-only`, carrying the census, carrying
     `notice: { removeIn: "<line>" }` equal to the row's `removeIn`, whose `change`
     states that nothing is removed in 3.0 and whose `guidance` states what the later
     line will ask. It migrates nothing and says so.
  N2 The correspondence is exact in both directions: every `notice` entry is named by at
     least one ledger row whose receiver is listed in `compatReceivers`, and under
     `--assume-done` every non-`debt` row names a `notice` entry. A notice entry with no
     row (the symbol was retired, or never ledgered) is red; a surviving row that names a
     rewrite entry is red. So a notice cannot stand in for a removal, and a removal
     cannot hide behind a notice. Law LANDED at 66ae3a530.
  N3 LANDED at 76eefe5d8: the 31 entries, by id (all `member-changed/.#…`):
     `BadgeProps.closable`; `CalendarProps.dateCellRender`, `.monthCellRender`;
     `CardProps.backgroundColor`; `TablePaginationConfig.size`; `TooltipPlacement.left`,
     `.left-start`, `.left-end`, `.right`, `.right-start`, `.right-end`;
     `ModalProps.closeOnOverlayClick`; `SliderProps.tooltip` (one id for the two slider
     rows); `BoxProps.paddingRight`, `.pr`, `.paddingLeft`, `.pl`, `.marginRight`, `.mr`,
     `.marginLeft`, `.ml`; `HoverCardSide.left`, `.right`; `AvatarVariant`;
     `AvatarProps.variant`; `BrandSurfaces.materials` (26 ids for the 27 rows without a
     codemod id); and `BadgeVariant`, `BadgeProps.variant`, `TagVariant`,
     `TagProps.variant`, `Variant` (5, the transferred rows). The two entries already
     named by a surviving row, `member-changed/.#Callout` and
     `member-changed/.#BrandMotion.entranceDuration`, gained `notice` in the same lot:
     33 notice entries, 647 + 31 = 678 map entries; the gate reports "notice entries: 33
     in the codemod map, 33 named by a row whose receiver is listed in compatReceivers".
     The 31 add 0 reports to R5′ (the census above is unchanged across 76eefe5d8).
  N4 LANDED at 65abdd45d. The kit proves an inline spread: a JSX spread whose operand is
     an object literal with only static property names, none of them the entry's prop
     nor the successor of a renamed prop, is not a use of that prop and is not reported.
     Any other spread stays `spread`. Fixture: `union-member-removed/inline-spread`.
     `union-member-removed` reports 0 on the measured roots. Nothing of this class is
     registered and nothing of it is owed.
  MEMBER PROOFS, LANDED at 06032f1a3, recorded because they define what an N row means.
     A `member-changed` entry may declare an arity proof (`.#baselineFor`) or a spelling
     proof (`.#TenantConfig`); the kit then reports only a file it cannot prove. A file
     that asserts, satisfies, spreads or `Object.assign`s a value it does not write stays
     reported. Accepted limit, pinned: an annotation relay of a value the file does not
     write is not reported (fixture `member-changed/member-spelling`, case
     `annotation-relay`); computed or imported keys, bindings that leave the file and JSX
     spread attributes are the other disclosed limits of that commit.
  TRANSFERRED SUBSET (E11, fixed by name; LANDED at 76eefe5d8). Of the ceiling of 22,
  exactly five rows transfer to WO-RET-06, each with a failed parity verdict backed by a
  fixture and `removeIn` 4.0: `BadgeVariant`, `BadgeBaseProps.variant`, `Variant`
  (`parity-failed:prop-renamed/badge-variant-secondary`), `TagVariant`,
  `TagProps.variant` (`parity-failed:prop-renamed/tag-variant-secondary`). The verdict
  law is the one hardened at 921a18f74 and again at 76ca8c60f: the fixture's own map
  entry names the row's anchor in `parity.anchors`, a report row locates the failing
  member and value, and the named backing test exists, is related, asserts and was
  executed (`lastRun`). The gate accepts all five.
  `Variant` transferred under its precondition, met at 76eefe5d8: `Variant` is in
  `parity.anchors` of `prop-renamed/badge-variant-secondary` only — no dedicated
  fixture, not the Tag fixture — under three conditions, all kept:
     (a) the `Variant` row keeps its consumer evidence with the needle
         `export type BadgeVariant = Variant;`, the only mechanical tie between the
         anchor and the fixture: if the alias changes, the row goes red;
     (b) the real-fixture pins of the gate test assert that `Variant` on the Badge
         fixture is accepted and that `Variant` on the Tag fixture is `NO SYMBOL`;
     (c) the fixture entry's `resolves` text and the row's `reason` state that `Variant`
         answers through the alias and has three dependents — Badge, Tag, and
         `AvatarVariant = Variant` — and that `Variant` leaves last: repairing Badge
         parity does not release it while Tag or Avatar still build on it. The re-home
         route is carried by the ledger, not by those two texts: the `AvatarVariant` row
         carries its own blocker (`replacement-capability-absent:gradient`, class
         `compat-canon-pending`), so when Badge parity is repaired the `Variant` row
         re-homes to the Tag fixture or to that blocker, and it does not leave the ledger
         while either holds.
  A transfer is not a repair. Of the other 17 names of the ceiling, sixteen are absent
  from the ledger and no marker of theirs remains (the gate counts 38 markers for 38
  rows).
  THE `Callout` ROUTE (a second route across the closure; ratified by name with this
  text). `Callout` was inside the ceiling of 22 and did not transfer on a failed parity
  verdict: at c04d6bab0 it was reclassified `compat-frozen-sole-implementer`, and the gate
  accepts the row in that class. It is the 25th row of the frozen group. E11's "only rows
  whose parity verdict is recorded as failed with a fixture" therefore reads, from this
  date, "and `Callout`, by reclassification to the frozen group"; E8 and step 1 of
  WO-RET-06 read 25, by name, from this date. No row enters from outside the ceiling of
  22: 5 + 16 + 1 = 22.
  The same lines are added to the WO-RET-06 block by its AMENDMENT of 2026-10-06.
  RECORDED, NOT AN ACCEPTANCE ITEM OF THIS WORK ORDER. The chart families' import cost
  through the package root is ungoverned since ab3b19712 (last measured 180 modules /
  1,217,767 bytes on the retired door). Receiver and form: the owner decision packet
  2026-10-06, § "Chart budget — option A as primary acceptance"; not a blocker of this
  work order.
  CHANGES, besides R5: E8's count, 24 -> 25; E11's transfer route, which gains `Callout`
  by reclassification. Nothing else of the 2026-10-03 amendment.
  DOES NOT: admit any report of the three applications; change R3's two views; let a
  register row survive the removal of its file or its id; touch a frozen engine.
- **Files** — `packages/core/src/components/**`; `packages/core/src/infrastructure/runtime/application/**`; `packages/core/src/entrypoints/**`; `packages/core/package.json`; `packages/core/src/graphics/**`; `.changeset/**`.
- **Acceptance gate** — Import graph: 0 unreachable modules; `exports` with a censused consumer per subpath; `grep -rn "@deprecated" src | wc -l` = 0; `grep -c '"pack": "bithire"' corpus/manifest.json` = 0.
- **Do NOT** — Do not delete a productively consumed implementation without migrating its consumers. The explicit target-major public glyph/door retirement above preserves useful private implementations and documents deferred app adaptation; its Showroom migration remains a prerequisite to closing this WO (consumer notes X-01…X-06).
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-RET-01 (Retire code without productive consumers and the legacy public API (changeset 3.0)) exactly as specified in `roadmap/retire.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-42, F-94, F-91, F-88, F-109, F-110, F-111, F-113, F-115, F-84 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-RET-02 Retire legacy CSS: DaisyUI projection, dead Daisy rules, framework bridge, emitter-less selectors, showroom Tailwind, engine bundle split
- **Outcome** — `framework-token-projection` deleted; the Daisy rules in `modern/theme` deleted (now visible thanks to the honest counter); the `framework-bridge` utilities and dead rules removed and the file ratcheted or deleted; `rustic/theme` and `personality` selectors without emitter deleted only where they are Modern-visible (Rustic content frozen: delete only what is provably unreachable); the showroom Tailwind toolchain removed; `styles.css` for Modern no longer pays for Classic/Rustic CSS (bundle split with the frozen engines behind their own subpath).
- **Why** — F-52: 100 % dead projection, ~150 dead Daisy lines certified alive by a fail-open counter, 462 bridge lines with literals; F-62: a Modern-only consumer downloads three engines.
- **Closes** — F-52, F-62 (closure criteria in `audit/30-findings`).
- **Wave** — 5; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-CAN-02, WO-CAN-03, WO-FAM-06.
- **Steps** —
  1. Delete/ratchet in that order; extend `themeCss.lineCount` to the bridge; selector-liveness gate; split the bundle.
- **Files** — `packages/core/src/foundation/tokens/css/runtime/engines/modern/{framework-token-projection,framework-bridge,theme}/**`; `packages/core/src/foundation/tokens/css/runtime/personality/**`; `packages/core/scripts/build/verticals/css-build/index.mjs`; `packages/showroom/{tailwind.config.ts,postcss.config.mjs,package.json}`.
- **Acceptance gate** — `ls runtime/engines/modern/framework-token-projection` does not exist; `themeCss.unreferencedSelectors` = 0 with the honest counter; `grep -c tailwindcss packages/showroom/package.json` = 0; the Modern bundle contains no Classic/Rustic bytes.
- **Do NOT** — Do not rewrite Rustic/Classic CSS; only remove what is unreachable.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-RET-02 (Retire legacy CSS: DaisyUI projection, dead Daisy rules, framework bridge, emitter-less selectors, showroom Tailwind, engine bundle split) exactly as specified in `roadmap/retire.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-52, F-62 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-RET-03 Quarantine the manifest and historical evidence; move agent orchestration out of the package
- **Outcome** — `governance/manifest/**` (42 MB, 5,355 UNKNOWN cells), `artifacts/quality/**` receipts, `test-artifacts/`, `docs/history/audits/repository-architecture/2026-08/` are moved to an archive location or a quarantine folder with a one-line README no gate reads as authority (D-05, D-08); `scripts/check/{modern-rescue,orchestration,evidence}` leave the published package (D-09); five token-population generators collapse into `ds:derive`; `CLAUDE.md` becomes an index that links `docs/architecture` and the roadmap instead of restating them; the documentation journal of WO-CRA-23 is archived.
- **Why** — F-04/F-53: the manifest simulates and five generators diverge; F-58: 240 MB of evidence vs 53 MB of code; F-87: three restatements of the architecture law and two competing laws.
- **Closes** — F-04, F-53, F-58, F-102, F-87 (closure criteria in `audit/30-findings`).
- **Wave** — 5; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-EVI-01.
- **Steps** —
  1. Quarantine moves with a verifiable README; delete generators superseded by `theme-graph`; scripts extraction; `CLAUDE.md` rewrite (< 200 lines) with the `RETIRED_OWNER_PATHS` check running over `CLAUDE.md`, `AGENTS.md`, `roadmap/README.md`.
- **Files** — `packages/core/governance/**`; `packages/core/artifacts/quality/**`; `test-artifacts/**`; `docs/history/**`; `packages/core/scripts/check/{modern-rescue,orchestration,evidence}/**`; `packages/core/scripts/generate/tokens/manifest/**`; `CLAUDE.md`; `AGENTS.md`.
- **Acceptance gate** — `du -sh packages/core/governance` < 1 MB; evidence/code ratio < 0.5; `grep -c "kernel/runtime/brand-theme" CLAUDE.md` = 0; `wc -l CLAUDE.md` < 200; no gate reads a receipt as authority.
- **Do NOT** — Do not delete the measured cascade graph (`artifacts/generated/manifest/cascade/*`) before `theme-graph` consumes it.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-RET-03 (Quarantine the manifest and historical evidence; move agent orchestration out of the package) exactly as specified in `roadmap/retire.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-04, F-53, F-58, F-102, F-87 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-RET-04 Physical tree normalization: D-21 grammar applied to what remains, monoliths split, repeated path words removed
- **Outcome** — The tree matches `audit/40-architecture/target` §5 in the grammar decided by D-21 (new code already uses it since WO-CAT-02; this WO moves what was not rewritten): no authored file > 800 lines (pipeline ≤ 250), 0 repeated words inside a path, no single-child folders or empty facades, `graphics → runtime` dependency law corrected, `structure:check` green in CI with a decreasing baseline; showroom with 0 loose files; kernel utilities adopted (`warnOnceInDev`, `changeKey`).
- **Why** — F-44: 141 files > 800 lines, 116 repeated-segment paths, 161 single-child folders, scripts at 42 % of the volume; the audit's position (vs. an up-front global move): move code when it is rewritten, normalize the remainder here.
- **Closes** — F-44, F-96, F-98, F-99, F-101, F-116, F-82 (closure criteria in `audit/30-findings`).
- **Wave** — 5; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-DER-06, WO-EMI-02, WO-RET-01.
- **Steps** —
  1. Codemod moves with `engine-audit:relocate-paths` dry-run; split the remaining monoliths (`provider` 1,339, `collection-workspace` 2,787, `tokens/audit` 2,866); repeated-word script = 0; `docs/architecture/index.md` §6 corrected.
- **Files** — `packages/core/src/**`; `packages/core/scripts/**`; `packages/showroom/src/**`; `docs/architecture/index.md`.
- **Acceptance gate** — Repeated-path-word script = 0; `wc -l` max in `compilers/theme/**` ≤ 250 and no authored file > 800; `structure:check` in the gate manifest, green; `find packages/core/src -type d -empty` empty.
- **AMENDMENT (R4, 2026-09-08; the original acceptance above stands, this is added to it)** — Cross-note from the derivation lane: this WO owns the **final** structure-gate and `CLAUDE.md` alignment for every owner the derivation and family-cut lanes leave outside the D-21 (b) first-level grammar. New code born after `WO-CAT-02` uses the grammar already, so what reaches this WO is the un-rewritten remainder plus any stray; neither a lane nor a cut may widen the `structure:check` identity baseline to absorb its own stray instead of leaving it here. The baseline stays decrease-only.
- **Owner amendment (2026-09-20, Fable-reviewed)** — The registered reusable-style WOs CAT-04 (`catalog-door.md`) and DER-09 (`derivation.md`) do not authorize a parallel tree rewrite. If WO-DER-09 introduces the bounded `foundation/presets/styles/` data exception, include it with the vertical preset data in this WO's single final move; agree the final data owner/dependency direction and preserve the one-authority/source-truth gates. New style contracts use the target `contracts/` grammar. Do not duplicate authored documents and family fragments, widen identity baselines, or leave permanent internal forwarding wrappers. Coordinate the style registry/generator reservation and follow the registered dependencies.
- **Prepared first cut (2026-10-02, not authorized to start before dependencies)** —
  The private `infrastructure/runtime/foundation/change-key` owner and its
  owning tests can move atomically to `kernel/change-key`: two files, unchanged
  implementation, no external import or path-keyed paint identities measured.
  Preserve the test's relative import and remove the old owner without a shim.
  Run its 11 focal cases, structure check and explicit relocation dry-run;
  update the architecture document's materialization statement. This is physical
  preparation, not evidence of productive adoption: no productive caller was
  found. RET-01 must finish first; do not claim this packet or widen a baseline
  while that prerequisite remains open.
- **AMENDMENT (2026-10-04, owner ruling R32 Q4; prerequisite ruled by the independent audit of the ownership gate lot 355a947c1; the acceptance above stands, this is added to it)** —
  The ownership gate (`packages/core/scripts/check/boundaries/surfaces/ownership/`)
  no longer has `--write-baseline` or `--allow-increase`: its only producer is
  the tighten-only `--update-baseline`, which refuses any new row and any
  increase. Its row ids are path-keyed, so a move or split of a file that holds
  rows (this work order's `collection-workspace` split is one) is refused as new
  rows plus stale rows, and no existing mode can express it. The flag stays
  removed. PREREQUISITE, verbatim from the audit (`audit-w17-ownership-gate.md`
  §3, independent session on `claude-opus-5-5`, owner ruling R30): "Before any
  move under `src/components/{patterns,surfaces}`: the ownership gate has a
  count-neutral `--relocate-paths` mode (dry-run default, `--write` explicit)
  that re-keys rows from the reviewed Git rename inventory, conserves the count
  per (category, rule, anchor) across the old path and the sum of its new paths,
  refuses any change of counter or owner class, refuses any new or raised row,
  and leaves the frozen id-set digest unchanged." The baseline does not store
  the anchor, so the mode re-runs the detector on the old blob at the old path
  and on the new files and pairs the findings. Precedent:
  `engine-audit:relocate-paths`
  (`packages/core/scripts/maintain/engine/baseline-relocation/index.mjs`): Git
  rename inventory, values never change, dry-run by default. The mode does not
  exist today; until it does, this work order moves nothing in that gate's
  scope. Drain packet OWN-7 of WO-EVI-02 (`scheduler`, `collection-workspace`)
  lands before that move and never concurrently with it. The frozen id-set
  digest the mode must conserve is
  `61df609c1c1c1d3cb4fb4367ef4e7e041fd11c657d91b11e8d36ec0f0f33b2f5`
  (1311 rows / 2005 occurrences at 355a947c1).
- **Do NOT** — Do not perform the global move before the derivation lane lands (it would move code that is about to be rewritten).
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-RET-04 (Physical tree normalization: D-21 grammar applied to what remains, monoliths split, repeated path words removed) exactly as specified in `roadmap/retire.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-44, F-96, F-98, F-99, F-101, F-116, F-82 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-RET-05 Showroom and Storybook through the mount law; probes as configurations
- **Outcome** — One `probe-ground` module over `mountTenantTheme` replaces the five showroom mechanisms and both Storybook decorators; the showroom chrome uses the DS; `DOC_COUNTS` and tenant catalogs are derived; profile is not coupled to the engine; Storybook builds in PRs; matrices stay Modern × bithire (D-24 decided 2026-09-05: evnto/rottay coverage deferred).
- **Why** — F-45: seven mechanisms to apply a tenant, Storybook bypasses the door, `(docs)` has no SSR/CSR parity, the DS showroom does not use the DS.
- **Closes** — F-45, F-92, F-93 (closure criteria in `audit/30-findings`).
- **Wave** — 5; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-EMI-02.
- **Steps** —
  1. `probe-ground`; migrate `ds-reference`, `torture-tenant`, `showroom-tenant`, `divergence-surface`, `visual-authority-probe`; Storybook `preview.tsx` via `getKnownTenantConfig`; `showroom-ui` deleted (17 consumers migrated); CI job for Storybook on PR.
- **Files** — `packages/showroom/src/**`; `packages/core/.storybook/**`; `packages/core/src/components/surfaces/foundation/common/story-helpers/**`; `.github/workflows/ci.yml`.
- **Acceptance gate** — `grep -rl "compileTenantThemeConfig\|compileTenantTheme(" packages/showroom/src | wc -l` = 1; `grep -rl "@/components/showroom-ui" packages/showroom/src | wc -l` = 0; Storybook `tenant=bithire` computed `--ds-color-primary` equals the bithire preset.
- **Do NOT** — Do not keep `torture-tenant` and `ds-reference/ground` as two stamp scripts.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-RET-05 (Showroom and Storybook through the mount law; probes as configurations) exactly as specified in `roadmap/retire.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-45, F-92, F-93 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-RET-06 Transitional compatibility and transferred closures of the 3.0 line
- **Outcome** — Every item WO-RET-01 could not lawfully retire is resolved by name, and nothing is left naming this work order: each ledgered compatibility marker is retired with demonstrated equivalence, or stops being a deprecation by a dated owner disposition (marker removed, row deleted, capability documented canonical); the eleven consumerless doors are admitted on a measured consumer or retired; the six BitHire roles have a domain owner; the remainders of F-84 and F-88 are resolved; F-42, F-109, F-111, F-113 and F-115 pass their own criteria or carry a dated owner disposition.
- **Why** — Owner ruling 2026-10-03 section 1: "Si no alcanzan, registrá un sucesor acotado mediante la maquinaria existente, sin segundo backlog ni denominador escondido. Una transferencia no completa el hallazgo: la autoridad final queda abierta y la certificación global la sigue viendo." WO-RET-04 covers the physical tree only and WO-CRA-20 icon weights only; WO-RET-05 and WO-CAN-03 are done.
- **Closes** — F-42, F-109, F-111, F-113, F-115, F-84 (remainder), F-88 (frozen-engine clause, only if still open when WO-RET-01 closes) (closure criteria in `audit/30-findings`).
- **Wave** — 5.
- **Depends on** — WO-RET-01.
- **Steps** —
  1. Frozen group (24 rows): per row, either demonstrate equivalence in the engine that today is the sole implementer and retire the alias with its codemod, or obtain the owner's dated disposition that the frozen engines keep the behaviour; in that case the `@deprecated` marker is removed, the row is deleted and the capability is documented as canonical for the engines that implement it. Either way the row stops naming this work order. A frozen edit takes one engine-freeze `--authorize` entry per file per lot.
  2. Canon-pending (2 rows): give `Avatar` a canonical expression of `secondary` and `gradient` and retire the alias, or obtain the dated disposition that `variant` stays canonical for those two values; then marker removed, row deleted, capability documented.
  3. Persisted data, `BrandSurfaces.materials`: prove absence in stored documents or migrate them, then remove read and admission; or obtain the dated disposition that the admission stays: marker removed, row deleted, admission documented.
  4. Persisted data, `BrandMotion`: retire the six Brand Studio motion editor fields (`entrance`, `entranceDuration`, `hoverLift`, `hoverScale`, `pulseSpeed`, `skeletonStyle`) and the file-export read of `entranceDuration` before the narrowing; prove stored theme documents carry none of the twelve open-ended fields or migrate them; then narrow the interface to its four governed fields (`intensity`, `durationScale`, `ambient`, `character`), remove the iso schema admission and the personality lowering read, and remove the marker and the row.
  5. Consumed markers with a failed parity verdict (subset fixed at the closure commit of WO-RET-01, inside its ceiling of 22): repair parity in the canonical owner, then retire.
  6. Doors: per door, admit on its named consumer or retire with its changeset row.
  7. Findings: measure each criterion; close, or record the dated owner disposition.
- **Files** — `packages/core/src/components/**`; `packages/core/src/entrypoints/**`; `packages/core/src/graphics/**`; `packages/core/package.json`; `packages/core/contracts/package/deprecations/**`; `packages/core/scripts/maintain/codemods/**`; `packages/core/docs/consumer-contract/**`; `packages/core/src/foundation/contracts/kernel/common/index.ts`; `packages/core/src/foundation/contracts/kernel/verticals/index.ts`; `packages/core/src/foundation/contracts/composition/tenants/themes/**`; `packages/core/src/infrastructure/compilers/composition/tenant-theme/index.ts`; `packages/core/src/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/personality/index.ts`; `packages/core/src/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/materials/index.ts`; `packages/core/src/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/surfaces/index.ts`; `packages/core/src/foundation/tokens/ts/foundation/base/density/index.ts`; `packages/core/src/contracts/theme/foundation/decisions/index.ts`; `packages/core/src/infrastructure/runtime/foundation/root-attributes/ssr/index.ts`; `packages/core/src/infrastructure/runtime/foundation/recipes/manifest/**`; `packages/showroom/src/**`; `.changeset/**`. Frozen-engine files only under one recorded authorization per file per lot.
- **Acceptance gate** — `node packages/core/scripts/check/boundaries/deprecations/index.mjs --check --assume-done=WO-RET-06 --json` with the siblings present, and the same with `--siblings=absent`: 0 failures and no row names WO-RET-06; `node packages/core/scripts/check/consumer-census/index.mjs --check --assume-done=WO-RET-06`: no `[door-disposition]` finding and no contract row names WO-RET-06; each of F-42, F-109, F-111, F-113, F-115, F-84, F-88 measured green by its own criterion in `audit/30-findings`, or carrying a dated owner disposition recorded in this block as an AMENDMENT; `pnpm roadmap:check` green. Evidence: the two gate outputs and one file per finding under `evidence/ret-06-closure/`, committed, sha256 quoted in `done --evidence`.
- **Do NOT** — Do not receive any ledger row of class `debt` (the ledger lists this work order in `noDebtReceivers`). Do not accept any row, door or finding that is not named in the scope below. Do not keep a row "by disposition": a disposition removes the marker and deletes the row. Do not edit applications. Do not remove a frozen-engine behaviour without demonstrated equivalence. Do not treat being listed here as resolution of anything.
- **Scope (closed list)** —
  Markers, frozen sole-implementer (24): `BoxProps.paddingRight`, `.pr`, `.paddingLeft`, `.pl`, `.marginRight`, `.mr`, `.marginLeft`, `.ml`; `TooltipPlacement.'left'`, `'left-start'`, `'left-end'`, `'right'`, `'right-start'`, `'right-end'`; `SliderProps.tooltip.placement.'left'`, `'right'`; `HoverCardSide.'left'`, `'right'`; `CalendarProps.dateCellRender`, `.monthCellRender`; `BadgeBaseProps.closable`; `CardProps.backgroundColor`; `ModalProps.closeOnOverlayClick`; `TablePaginationConfig.size`.
  Markers, canon-pending (2): `AvatarVariant`, `AvatarProps.variant`.
  Markers, persisted data (2): `BrandSurfaces.materials`; `BrandMotion`.
  Markers, consumed with failed parity: ceiling of 22 fixed at the adoption of the WO-RET-01 amendment (ledger at 5639cde7a) — `DataTablePatternProps.mobileBreakpoint`, `BadgeVariant`, `BadgeBaseProps.variant`, `BadgeBaseProps.overflowCount`, `CalloutVariant`, `CalloutProps.variant`, `Callout`, `TagVariant`, `TagProps.variant`, `AlertSharedProps.type`, `ButtonProps.asChild`, `ButtonProps.loading`, `ButtonProps.loadingText`, `Switch` (module), `SwitchSize`, `SwitchProps`, `LegacySpaceSize`, `Steps` (module), `ProgressDotInfo`, `StepsProps`, `SurfaceTabbedView.permissionId`, `Variant`. The subset that transfers is fixed by name at the closure commit of WO-RET-01 and recorded here; nothing outside the ceiling may enter.
  - **AMENDMENT (2026-10-07, the WO-RET-01 closure; the scope stays closed below the ceiling)** — the subset that transferred at the closure commit `2954afec1` is: `BadgeVariant`, `BadgeBaseProps.variant`, `Variant` (`parity-failed:prop-renamed/badge-variant-secondary`), `TagVariant`, `TagProps.variant` (`parity-failed:prop-renamed/tag-variant-secondary`), each `removeIn` 4.0 (per the AM-1 v3 registration) — PLUS, registered at the closure read as canon-pending transfers with zero measured consumers and the semantic replacement named where one exists: `RecipeVariantConfig`, `createRecipeVariant` (the recipes rename's root-published pair), `VerticalTheme` (= `FlatTheme`; the semantic path is the Theme document), and `AlertIcon` (the last legacy-catalog binding on `@rottay/design-system/icons`; the semantic replacement is `Icon name="status.warning"`; its two consumers are the showroom probe page and one app-platform file already broken by other causes). Four names, none outside the ceiling's class; a transfer is not a repair.
  Doors (11), each: admitted by / retired by / depends on —
  `./styles/rottay`: the first measured `@import` of `@rottay/design-system/styles/rottay` (app-platform, replacing `dist/platform.css`) / `subpath ./styles/rottay — removed` / consumer note X-10.
  `./styles/modern`: a measured import of the engine bundle by an application or the showroom / `subpath ./styles/modern — removed`, the file staying a build input / none.
  `./dist/*.css`: a measured import of a file the package still builds / `subpath ./dist/*.css — removed; use the named ./styles/* doors` / consumer note X-10.
  `./marks/brand`, `./marks/cloud`: a measured import that selects one mark class / `subpath — removed; use ./marks`, only with the asset-isolation proof re-pointed to the aggregate / the resource-isolation AMENDMENT of 2026-10-02 in WO-RET-01.
  `./icons/roles/*`: a measured per-role import / `subpath ./icons/roles/* — removed`, only with the retention proof re-pointed / WO-CRA-20's pruning decision.
  `./icons/foundation`, `./icons/identity`, `./icons/intelligence`, `./icons/operations`: a measured application import of the pack door / `subpath — removed; use Icon from ./icons` / the showroom migration of WO-RET-01 (its criterion R2).
  `./pictograms`: a measured application import / `subpath ./pictograms — removed`, only once another door exposes the pictogram facade or the showroom probe is retired / F-113.
  Capability: domain ownership of the six BitHire roles (mechanism: WO-CRA-17 when phase 2B opens).
  F-84 remainder, (a) density types other than `DensityPosture`, each with the decision owed; acceptance for the whole item: one type and one name per axis, and the fiche's "un solo `Density*` type" either met or restated by a dated owner disposition as "one type per axis":
  `Density` (`foundation/contracts/kernel/common/index.ts`: compact, normal, comfortable) — decide whether the component-prop axis is a distinct axis with a name that says so, or maps onto the posture axis.
  `DensityProfile` (`foundation/contracts/kernel/verticals/index.ts`: compact, comfortable, airy) — decide whether the vertical identity baseline keeps its own vocabulary (`airy`) or adopts the posture literals.
  `DensityMode` (`contracts/theme/foundation/decisions/index.ts`: compact, normal, spacious) and `DensityMode` with `DensityPreference` (`foundation/tokens/ts/foundation/base/density/index.ts`: comfortable, compact; plus normal, spacious) — two declarations share one name: decide which keeps it and rename the other; decide whether the authored theme decision and the token scale are one axis.
  `ActionDockDensity` (`components/structures/workspace/action-dock/contracts/index.ts`), `SurfaceDensity` (`components/structures/foundation/chrome/runtime/profile-defaults/index.ts`), `TooltipDensity` (`components/primitives/display/tooltip/contracts/index.ts`), `PopoverDensity` (`components/primitives/overlay/popover/contracts/index.ts`), `DocumentDensityPosture` (`infrastructure/runtime/foundation/root-attributes/ssr/index.ts`, published through `./server`) — each declares the same three literals as `DensityPosture` (compact, comfortable, spacious): decide per type whether it becomes `DensityPosture` (public removal with changeset and codemod) or is a component-local vocabulary with a written reason why it may diverge.
  `MarkdownDensity` (`components/primitives/display/markdown-view/contracts/index.ts`: compact, comfortable) — decide whether it is the posture axis restricted to two steps or its own axis.
  F-84 remainder, (b) the `recipes` word under `src/components/patterns` once WO-RET-01 has renamed the two pattern-owned folders: the matches that name the recipe engine's import path, the theme-draft family key and prose — acceptance: the fiche's grep is 0, or a dated owner disposition names the surviving concept. (c) `buildRecipeManifest`, public with no consumer — acceptance: a censused consumer, or a retirement with changeset and codemod. Dependency for (a)-(c): WO-RET-01 item I1 complete.
  F-88 remainder: the Rustic colour-picker default `#1677ff` — acceptance: replaced under an owner authorization naming the file, or a dated owner disposition that the frozen default stays. Dependency: that answer.
- **AMENDMENT (owner ruling R32 Q4, 2026-10-04; the acceptance above stands, this is added to it)** —
  Authority: owner ruling R32 Q4 (2026-10-04), quoted verbatim: "Ownership:
  Separar y atribuir la deuda. Drenar Modern y core compartido; transferir
  exclusivamente la deuda comprobada de engines congelados a un receptor abierto
  con aceptación propia. Enmendar explícitamente F-86: no afirmar que el total
  bajó de 1.000 si no ocurrió. No borrar entradas ni tocar engines congelados
  solo para mejorar el contador. La deuda transferida sigue visible en el cierre
  global." Independent review of this text: a separate session on
  `claude-opus-5-5` (owner ruling R30), ADOPT WITH CORRECTIONS, all applied.
  Nothing above is rewritten: each line below states what the named field of
  this block gains. The transfer commit is 355a947c1; the figures and the digest
  were re-read on it with
  `node packages/core/scripts/check/boundaries/surfaces/ownership/index.mjs --check`
  (exit 0; the gate prints the first 16 hex of the digest, `61df609c1c1c1d3c`).
  Adopting this text closes nothing.
  This work order receives the frozen-engine remainder of F-86 and nothing else of that finding.
  **Closes** gains: F-86 (frozen-engine clause).
  **Steps** gains: *8. F-86 frozen remainder: obtain the dated owner disposition (a) or (b) of the acceptance below; do not edit a frozen file to lower the counter.*
  **Files** gains: `packages/core/scripts/check/boundaries/surfaces/ownership/counters/**` (receiver string only, under disposition (b)).
  **Scope (closed list)** gains: *F-86 frozen remainder: the rows of `packages/core/scripts/check/boundaries/surfaces/ownership/baseline/index.json` whose path lies under `engines/classic/` or `engines/rustic/`, fixed by id and by count at the transfer commit: 1311 rows / 2005 occurrences (Classic 648 / 911, Rustic 663 / 1094), id-set sha256 `61df609c1c1c1d3cb4fb4367ef4e7e041fd11c657d91b11e8d36ec0f0f33b2f5` as printed by the gate on that commit. A row enters only under the five-point "proven frozen" standard: (1) path under the freeze law read from the freeze gate's export; (2) `engine-freeze-gate --check` OK on the same commit; (3) the finding is live in that file on that commit; (4) the engine is not productively selectable, cited from `node --test packages/core/scripts/libraries/engine/roster/index.test.mjs` on that commit; (5) the row was not created by moving code into a frozen path, proven by the id set. No row under `engines/modern/` or outside an `engines/` folder may enter. The `noDebtReceivers` rule of the deprecations ledger is unaffected: these are ownership-census rows, not ledger rows.*
  **Acceptance** gains: *`node packages/core/scripts/check/boundaries/surfaces/ownership/index.mjs --check` exits 0 and prints the counter `frozen-transferred (Classic + Rustic) → WO-RET-06`, and either (a) the counter reads 0 because the frozen engine files left the package under a dated owner decision, each frozen file edit carrying one engine-freeze `--authorize` entry per file per lot; or (b) a dated owner disposition, recorded in this block as an AMENDMENT, states that the frozen engines keep this debt for as long as they ship, in which case the counter stays published and decrease-only, the rows stop naming this work order, and the disposition names the final authority. No frozen file is edited to lower the counter. The counter is never merged into, or subtracted from, the productive counter. Evidence: the gate output and the id-set digest under `evidence/ret-06-closure/`, sha256 quoted in `done --evidence`.*
  **Do NOT** gains: *Do not treat this transfer as closure of F-86. Do not delete, allowlist or re-key a frozen row to lower the counter. Do not accept a row whose path is not under a frozen engine.*
  **Delegation prompt** gains F-86 in its list of fiches.
- **AMENDMENT (2026-10-12, DT execution record — route (b) of the R32 Q4 acceptance taken under the dated disposition D-A of 2026-10-07; the acceptance above stands, this is added to it)** —
  Reviewed lot `quality-f86-receiver` (writer session f5a9394c, independent review ACCEPT with mutants
  and a HEAD-archive before-state). For the avoidance of doubt for the next auditor: D-A's heading scopes
  the 25 frozen marker rows, and its body is the dated disposition route (b) requires for the 1311-row /
  2005-occurrence ownership remainder fixed at the transfer commit (id-set sha256
  `61df609c1c1c1d3cb4fb4367ef4e7e041fd11c657d91b11e8d36ec0f0f33b2f5`): "The counter stays published and
  decrease-only; the rows stop naming this work order; the final authority is this disposition." This
  amendment ties D-A to those rows by name.
  Executed: the rows stop naming this work order. The gate now prints
  `frozen-transferred (Classic + Rustic) → disposition D-A` with receiver
  `owner disposition D-A (2026-10-07, roadmap/retire.md)` and standing `final authority; kept while the
  frozen engines ship; published, decrease-only`; the R32 Q4 acceptance sentence above that pins the
  printed label `→ WO-RET-06` is superseded by its own route (b), which this lot executed. The counter
  stays published and decrease-only; counts 2005/1311 and the id-set digest are unchanged (recomputed
  independently by the reviewer); the gate still prints `F-86 < 1.000: NOT MET` — nothing is closed or
  netted. The Files line of the R32 Q4 block granted `ownership/counters/**` (receiver string only); the
  executed lot lawfully required six paths, recorded here so the record matches what merged:
  `ownership/counters/index.mjs` (label + receiver + standing + the BASELINE_PURPOSE clause the gate
  refuses to mismatch), `ownership/baseline/index.json` (its top-level `purpose` string only; no entry,
  id or count moved), `ownership/index.mjs` (header comment), `ownership/index.test.mjs` (re-pinned
  expectations + a negative assertion that no report names WO-RET-06),
  `automation/gates/baselines/tests/index.test.mjs` (one pinned expectation) and
  `automation/gates/baselines/index.mjs` (comment only). No frozen file was edited; no row was deleted,
  allowlisted or re-keyed to lower the counter. The closure evidence of the F-86 clause (gate output +
  digest under `evidence/ret-06-closure/`) is still owed at the WO's closure.
- **AMENDMENT (owner ruling Q1, 2026-10-06; the acceptance above stands, this is added to it)** —
  Authority: `roadmap/owner-decisions-2026-10-06.md` §Q1, quoted verbatim:
  "Canonical, reusable capability. No retirement to shrink a census, no
  duplicate implementation. Its real disposition gets consumers, contract and
  tests; a redundant alias retires only with migration." WO-RET-01 Q1 routes
  here: "the surface's row-decision path composes it, or is declared out of
  scope".
  Decision: DECLARED OUT OF SCOPE. `DecisionInboxSurface` does not compose
  `PatternApprovalInbox`, and neither is a duplicate of the other. The
  surface is a generic queue workspace: rows of any `T` in a `PatternDataTable`
  with columns, filters, an open set of keyed decisions (`requiresReason`,
  `confirm`, `loading`, `disabled`), batch decisions per action key and a
  review rail. The pattern is a compact, embeddable inbox with a fixed item
  shape (`ApprovalItem`: title, subtitle, amount, risk, submittedAt,
  slaDeadline), domain grouping, and exactly approve, reject and batch
  approve. Composing it would bind the surface's generic row to `ApprovalItem`
  and shrink its decisions to two, losing reason capture and confirmation.
  Both stay canonical at their own tiers.
  Acceptance for this amendment: `git grep -n "DecisionInboxSurface" --
  packages/core/src/components/patterns/workflow/approval-inbox
  packages/core/contracts/package/deprecations
  .changeset/major-canonical-tree.md` is empty; the deprecations ledger has
  no `PatternApprovalInbox` row; `ApprovalInbox.contract.test.tsx` passes.
  This amendment adds no row, door or finding to the closed scope above, and
  no ledger row names this work order because of it.
- **AMENDMENT (2026-10-06, AM-1 v3: the transferred subset and the `Callout` route of WO-RET-01; the acceptance above stands, this is added to it)** —
  Authority: owner decision packet 2026-10-06, § "AM-1 — Ratified v3" (registered at
  a64aa0aea), quoted in full in the WO-RET-01 AMENDMENT of the same date: "Callout is
  approved as row 25 of RET-06's frozen group plus the five parity-failed transfers, all
  Variant conditions kept, including "goes last". [...] A transfer is not a repair."
  Nothing above is rewritten: each line below states what the named field of this block
  gains. The ledger rows landed at 76eefe5d8 (parity law hardened at 76ca8c60f); the gate
  accepts every row named here. Adopting this text closes nothing.
  **Steps** gains: *step 1 reads "Frozen group (25 rows)", the 25th being `Callout` (by
  reclassification at c04d6bab0, not by a parity verdict). Step 5's subset is fixed:
  `BadgeVariant`, `BadgeBaseProps.variant`, `Variant`
  (`parity-failed:prop-renamed/badge-variant-secondary`), `TagVariant`,
  `TagProps.variant` (`parity-failed:prop-renamed/tag-variant-secondary`), each
  `removeIn` 4.0.*
  **Scope (closed list)** gains: *Markers, frozen sole-implementer: `Callout` (the 25th;
  blocker `frozen-equivalence-absent`, codemod `member-changed/.#Callout`, a notice entry
  with `removeIn` 4.0). Markers, consumed with failed parity — the subset that transferred
  from the ceiling of 22, fixed by name: the five rows above. Of the other 17 names of the
  ceiling, sixteen left the ledger inside WO-RET-01 and `Callout` entered the frozen
  group: 5 + 16 + 1 = 22; nothing outside the ceiling entered. `Variant` leaves last: it
  is the base of `BadgeVariant`, `TagVariant` and `AvatarVariant`, so repairing Badge
  parity does not release it while Tag or Avatar still build on it; at that point the row
  re-homes to the Tag fixture or to the `AvatarVariant` row's own blocker
  (`replacement-capability-absent:gradient`, class `compat-canon-pending`), and its
  conditions stay as written in WO-RET-01: (a) the consumer needle
  `export type BadgeVariant = Variant;` on the row, (b) the two real-fixture pins of the
  gate test (accepted on the Badge fixture, `NO SYMBOL` on the Tag fixture), (c) the
  dependents and "leaves last" stated in the row's `reason` and the fixture's `resolves`.*
  **Do NOT** gains: *Do not treat a transferred row as repaired: a transfer is not a
  repair. Do not release `Variant` before Tag and Avatar no longer build on it.*
- **AMENDMENT (2026-10-07, DT ruling on the W-1 companion surface; the acceptance above stands, this is added to it)** —
  The W-1 packet (doors `./styles/modern`, `./dist/*.css`, `./icons/{foundation,identity,intelligence,operations}` +
  the four §2 names) measured 13 companion files outside the Files list that the retirement cannot leave
  consistent without: the four `vite.config.ts` build entries that pointed at the deleted entrypoints; the
  icon-generator test fixture; the five tests that pinned the retired surface (including the public-API tests
  that named `AlertIcon` as the kept helper); the regenerated mirrors the retired surface feeds (the supplier
  contract, the hooks manifest, the taxonomy doc, the consumer-census baseline); and two prose lines that said
  `AlertIcon` stays public. **Files** gains for W-1 only: *the exact 13 paths named in the W-1 report
  (`w26-ret06-w1/report.md`), each carrying the retirement's consistency edit and nothing else.* Every other
  field is unchanged; nothing else may ride the amendment.
- **AMENDMENT (2026-10-07, DT ruling on the W-2 companion surface; the acceptance above stands, this is added to it)** —
  The W-2 packet (F-113: the two vertical pictograms retired + the shared-corpora law test; A1: the atlas
  probe drops its pictogram section) measured 4 companion files outside the Files list that the retirement
  cannot leave consistent without: `packages/core/THIRD_PARTY_NOTICES.md` (the licence pin),
  `packages/core/src/infrastructure/runtime/graphics/asset-governance/tests/asset-adapter-control.test.tsx`,
  and `packages/showroom/eslint.config.mjs` (the showroom no longer sanctions `./pictograms`), plus the
  one-line consumer-census baseline admission of `./pictograms` as a consumerless door HELD by owner question
  D-E (the door and the feature-pictogram asset class stay published; nothing here retires them).
  **Files** gains for W-2 only: *those exact 4 paths, each carrying the retirement's consistency edit and
  nothing else.*
- **AMENDMENT (2026-10-21, DT ruling on the missed W-2 license-summary companion; the acceptance above stands)** —
  The authorized W-2 / F-113 retirement in `965241fa6` left the graphics-license unit summary expecting eight
  feature pictograms although the catalog, artwork, provenance manifest and notice already contain the six
  retained names. **Files** gains for this consistency repair only:
  `packages/core/scripts/package/graphics/licenses/index.test.mjs`, changing only its `featurePictograms` summary
  literal from 8 to 6; the seven existing tests and all negative assertions remain. The repair carries its own
  patch changeset. It changes no source population, runtime, asset class, public door, acceptance criterion or
  owner disposition, and gives no publication, phase or work-order closure credit. Every other field stands.
- **AMENDMENT (2026-10-07, DT ruling on the W-3a companion surface; the acceptance above stands, this is added to it)** —
  The W-3a packet (the density axis: ten names retired into the two surviving axes) measured these companion
  paths outside the Files list: `packages/core/src/index.ts` (the DENSITY block), `packages/core/src/foundation/contracts/index.ts`
  (the DensityProfile barrel line), `packages/core/src/infrastructure/runtime/foundation/density/index.ts`,
  `packages/core/src/infrastructure/runtime/theming/composition/mount/index.ts`,
  `packages/core/src/infrastructure/compilers/runtime/theme/runtime/emission/css/index.ts`,
  `packages/core/src/infrastructure/runtime/foundation/root-attributes/ssr/tests/index.test.ts`,
  the new guard `packages/core/tests/architecture/density-one-type-per-axis/index.test.ts`, and the regenerated
  mirrors (`packages/core/contracts/runtime/suppliers/index.json`,
  `packages/core/scripts/check/modern-rescue/family-inventory/index.json`). **Files** gains for W-3a only:
  *those exact paths, each carrying the axis's retirement edit or the official regen and nothing else.*
  The `VerticalManifest.density` inline spelling (the structure law refuses the cross-layer import) is pinned
  identical to `DensityPosture` by the guard — the departure is registered, not hidden.
  The W-3b companions (the recipe-vocabulary guard + the manifest retirement), same dated ruling:
  `packages/core/src/index.ts` (the manifest block), `packages/core/src/infrastructure/compilers/runtime/theme/runtime/lowering/tests/family-deriver-contract.test.ts`,
  `packages/core/src/infrastructure/runtime/foundation/recipes/contracts/families/section-card/index.ts`
  (comment only), `packages/core/src/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/chrome/surface-chrome/index.ts`
  (comment only), the new guard `packages/core/tests/architecture/recipe-single-concept/index.test.ts`, and the
  regenerated mirror `packages/core/contracts/runtime/suppliers/index.json`. **Files** gains for W-3b only:
  *those exact paths, each carrying the retirement's edit or the official regen and nothing else.* The review's
  L1 is a registered follow-up: a generic loop over `RECIPE_PROFILES` against the recipe definitions restores
  the deleted manifest test's invariant (4 axes are checked by the types alone today).
- **AMENDMENT (2026-10-07, owner decision packet — dated dispositions D-A, D-B, D-C, D-E, D-F; the acceptance above stands, this is added to it)** —
  Ratified by the owner's packet of 2026-10-07 (prompt text; the audit it cites is
  `docs-engineering/archive/audits/2026-10-07/design-system/progress-and-owner-decisions-davila.md`). Each
  disposition below is scoped exactly as ratified; nothing else of the pending set is approved.
  - **D-A (the frozen group, 25 rows):** the frozen engines keep the enumerated behaviours for as long as they
    ship — route (b) of the R32 Q4 acceptance. The counter stays published and decrease-only; the rows stop
    naming this work order; the final authority is this disposition. The frozen behaviours are NOT made
    productive, and no improvements are added to retire markers. The disposition lot (delete the 25 rows +
    markers with documentation) follows in its own packet with the frozen-digest invariant intact.
  - **D-B (the `Variant` family, 7 rows):** `variant` stays the canonical expression of the `secondary`/`gradient`
    structural fills where the evidence demonstrates those fills. Scope documented; the parity tests stay.
    `Variant` keeps its "leaves last" condition from the AM-1 v3 amendment; nothing here releases it early.
  - **D-C (persisted data, 2 rows):** backward-compatible admission and reading of existing stored documents is
    preserved. BrandMotion/materials are NOT narrowed without an authorized census or migration outside the DS
    (step 4(ii) stays owner/ops). The editor's retirement (W-4) proves nothing about the DB. New authoring stays
    governed by the catalog and permissions.
  - **D-E (the `./pictograms` door + the feature-pictogram asset class):** the class is NOT retired to lower a
    counter. It stays as an explicitly bounded LAB capability: owner = the DS graphics lane; measured support =
    zero application consumers and the retired atlas-probe section (measured at W-2, `965241fa6`); review =
    re-evaluated when a measured application consumer appears or the graphics lane retires the class by a
    specific decision with its exact Files and the capability-preservation proof. The door's acceptance line
    ("`subpath ./pictograms — removed`, only once another door exposes the pictogram facade or the showroom probe
    is retired / F-113") is adapted by name: F-113 is met for the shared corpus (W-2); the door's retirement is
    suspended under this disposition, and the census row keeps naming the disposition. No productive consumption
    is invented; no app adoption is claimed.
  - **D-F (F-84's literal closure):** the fiche's "un solo `Density*` type" is restated as **one type per axis**,
    ratified: `DensityPosture` for the local posture axis, `DensityMode` for the persisted document decision,
    keeping `normal` and the existing data. The word `recipe` is ratified as exactly one concept: the governed
    presentation recipe. No persisted key is renamed and no data is migrated to reach a grep zero. The W-3a
    guard's identity pins get a typecheck sentinel of their own (green without mutation, red with it), because
    Vitest does not evaluate `expectTypeOf` — that sentinel is a named follow-up lot, and the pre-existing
    `typecheck:tests` TS2339 keeps its own receiver (never silenced).
  Explicitly NOT ratified by this packet: D-D and the remaining prior decisions, any phase opening, any
  capability retirement beyond the named ones, and any publication/CI step.
- **AMENDMENT (2026-10-08, owner ruling #3 — the generic `Variant`; the acceptance above stands, this is added to it)** —
  Authority: owner ruling of 2026-10-08, #3, as adopted by the DT on the same date: keep the shared type needed by
  `BadgeVariant`, `TagVariant` and `AvatarVariant` and its public compatibility; do not remove a useful
  dependency to empty the ledger (verbatim: "Conservá el tipo compartido necesario para BadgeVariant, TagVariant
  y AvatarVariant y su compatibilidad pública. No retires una dependencia útil para vaciar el ledger."). This
  resolves the open question D-B left on `Variant` and settles AM-1 v3's
  "leaves last": its retirement order is moot, because the dependents are canonical (D-B) and stay.
  **Supersedes, for `Variant` only:** the WO-RET-06 AM-1 v3 Do NOT 'Do not release `Variant` before Tag and Avatar
  no longer build on it' (:837) and its re-home route (:829-831); D-B's 'keeps its leaves-last condition; nothing
  here releases it early' (:891); and the WO-RET-01 AM-1 v3 re-home clause 'does not leave the ledger while either
  holds' (:596-598) with its conditions (a) (the row's consumer needle) and (c) (the row's `reason`), which leave
  with the row. **Survives unchanged:** condition (b), the two real-fixture pins of gate test H1.6, and the Badge
  fixture's `resolves` text, which now reads as the dependency statement and as an ordering constraint for any
  future retirement, not as a pending retirement.
  **Canonical owner:** `packages/core/src/foundation/contracts/kernel/common/index.ts` (`export type Variant`),
  published at the root subpath `.` through `foundation/contracts`. Lawful home: kernel/common is the shared
  low-level type owner (its file header lists `Variant`); a union consumed by three primitives' contracts is a
  shared dependency and must sit below them (`primitives` import kernel, never each other); its production
  importers are exactly the badge, tag and avatar contracts; three type-level tests (ToneAxis contract, Button
  and Toast variant-union) reference it as an unchanged reference union.
  **Support condition:** `Variant` is SUPPORTED as the shared variant contract of Badge, Tag and Avatar for as
  long as any of `BadgeVariant`, `TagVariant` or `AvatarVariant` is built on it — necessary public compat, not
  transitional. Its seven literals and their meaning do not change. `Tone` stays the recommended semantic-colour
  axis; that is guidance, not a deprecation.
  **Disposition (verifiable):** marker removed (the `@deprecated` JSDoc of `Variant`; the type line byte-
  identical), row deleted (the `Variant` row of `packages/core/contracts/package/deprecations/index.json`),
  capability documented (`packages/core/docs/consumer-contract/structural-variant-fills/index.md`, the section
  that replaces "Lo que D-B no decide"). The ledger is not the record (a ledger row is a deprecation with a
  removal line); the record is this AMENDMENT, the doc section and the changeset's contract-diff row. Its
  notice-only codemod entry `member-changed/.#Variant` leaves with the row (D-A24/D-B precedent). The parity
  fixture `prop-renamed/badge-variant-secondary` and the Badge/Tag parity tests stay unchanged. Proof: the
  deprecations gate green with no `Variant` row and no unledgered marker; the three aliases and `Variant` still
  exported from `.` (export chain unchanged); the contract-changeset surface shows exactly one signature row
  `.#Variant` (deprecation tag only); gate test H1.6 unchanged and green.
  **What may change it later:** only a dated owner decision approving a public-compat change to `Variant` or its
  three aliases, with its own debrief (consumers measured, migration and capability-preservation proof) and
  independent review. Named, not scheduled.
  **Boundaries:** values and behavior preserved; no app migration; no retirement deadline (`removeIn` is dropped
  with the row, not moved); the dependency is not removed; no genuinely transitional alias exists. Resolving this
  row does not close WO-RET-06 (the D-C rows, the doors/findings and its other obligations remain). The amendment
  and its implementation each require independent review.
- **AMENDMENT (2026-10-12, DT execution record — disposition D-C executed; the acceptance above stands)** —
  The D-C disposition of 2026-10-07 was executed as reviewed lot `quality-ret06-dc` (writer session
  90d0df80, independent review ACCEPT, receipts in `.tmp/ds-codex-2026-10-08/`): the `@deprecated` markers
  of `BrandSurfaces.materials` and `BrandMotion` removed (the field line and the interface type surface
  byte-identical, comment-stripped AST identical per the review), the two ledger rows deleted (the ledger
  now holds zero rows; the stale `removeIn: 4.0` assumption note removed with them), the notice-only
  codemod entries `member-changed/.#BrandSurfaces.materials` and `member-changed/.#BrandMotion.entranceDuration`
  left with the rows, the backward-compatible admission documented at
  `packages/core/docs/consumer-contract/persisted-theme-admission/index.md`, changeset
  `ret-06-d-c-persisted-theme-admission.md`. Admission and reading of stored documents are preserved
  exactly as D-C states; no narrowing; step 4(ii) stays owner/ops. The deprecations gate's residual red is
  exactly the 11 ARC-12 caller-part marker-without-row failures (owner queue DEPRECATIONS-RECEIVER), in
  both sibling modes, unchanged by this lot. This execution closes nothing else of WO-RET-06: the doors,
  the findings, D-D and the closure re-measurement remain.
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-RET-06 (Transitional compatibility and transferred closures of the 3.0 line) exactly as specified in `roadmap/retire.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-42, F-109, F-111, F-113, F-115, F-84, F-88 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-RET-07 Major 4.0 retirement of the eleven inert caller data-part/data-state props (ARC-12 / P-88) and the inert commandHomePanelBgStrong theme field
- **Outcome** — The twelve public symbols named in the closed scope below leave the package in the 4.0 major line, each with its ledger row deleted in the same lot, and nothing is left naming this work order: the eleven caller `data-part` / `data-state` props that no engine renders since ARC-12 step 3 (P-88), and the tenant-theme field `chrome.shell.commandHomePanelBgStrong`, admitted and inert (no DS or app part reads it, nothing emits it) after its emission retirement of 2026-10-14. Until then each symbol stays published, marked `@deprecated`, with one `debt` row naming this work order.
- **Why** — Owner decision 20 (2026-10-14, DEPRECATIONS-RECEIVER), quoted verbatim: "Primero verificar si hay un receptor retire-lane existente y autorizado cuyo alcance realmente cubra esas once obligaciones. Si no existe, **autorizo un único receptor acotado para el retiro major 4.0 de esos caller props inertes**, mediante la maquinaria existente y con review de alcance/dependencias. No usar RET-04 o RET-06 contra sus prohibiciones ni aflojar noDebtReceivers para verde. Las nueve consumerless y las consumidas se clasifican con el censo ACTUAL, no con el conteo viejo. Registrar explícitamente si este receptor aumenta el total de WOs; 168 no es un número que deba preservarse ocultando trabajo ya reconocido. No abre un backlog de mejoras nuevas ni autoriza publicación, romper la promesa de un release o editar apps. Receptor abierto no significa retiro realizado." The receiver scout of 2026-10-14 (`.tmp/ds-kimi-2026-10-14/deprecations-receiver-scout.txt`) measured that none exists: WO-RET-06 is listed in `noDebtReceivers` and its scope is closed by name; WO-RET-04 covers the physical tree only. Owner answer 34 (2026-10-14, DEAD-WRITER-command-home-panel-bg-strong), quoted verbatim: "El campo existe en contrato/schema admitido. No borrar a ciegas ni inventar lector sólo para verde. DT adjudica con el último consumidor/intención: reconectar la capacidad declarada al paint canónico correcto cuando la especificación la promete; si es realmente residuo interno sin promesa útil, retirar su emisión con disposición explícita de la superficie pública y compatibilidad vigente. Lote finito con probe que varíe la decisión y negativo del lector; cualquier ruptura pública conserva su puerta major. No volver a preguntarme por la preferencia técnica después de este debrief salvo expansión irreversible no autorizada." The DT adjudicated route (b) of the debrief (`.tmp/ds-kimi-2026-10-14/lane-b-commandhome-debrief.txt`): emission retired, public field conserved; the field's major-gated removal is admitted to this closed scope by name as that "disposición explícita de la superficie pública".
- **Closes** — No audit finding. It receives the twelve ledger rows named below and settles each by removing its symbol.
- **Wave** — 5.
- **Depends on** — WO-ARC-12 (the owner of the eleven markers keeps the pass-through ratchet until it closes).
- **Registration** — Registered 2026-10-14: the WO total rises **168 -> 169**. One bounded receiver, as decision 20 authorizes; no second new work order.
- **Steps** —
  1. Registration lot (2026-10-14): this block and the registry entry; the twelve `debt` rows naming this work order in `packages/core/contracts/package/deprecations/index.json`; their changeset; the comment-only correction of the four stale Button/Tag marker sentences (classic strips the caller part and state since ARC-12 step 3); the `commandHomePanelBgStrong` emission retirement (DS-default writer and compiler emission deleted; contract, schema admission and iso shape kept; `@deprecated` marker added). `noDebtReceivers` and `compatReceivers` stay `["WO-RET-06"]`.
  2. The 4.0 major lot (later, inside the 4.0 line only): remove the eleven prop declarations and delete their eleven rows; rewrite the two DS inertness pins (`packages/core/src/components/primitives/foundation/loading-indicator/tests/LoadingIndicator.test.tsx`, `packages/core/src/components/structures/workspace/selection-preview-rail/tests/SelectionPreviewRail.contract.test.tsx`) as "the prop does not exist" type pins; a major changeset with its contract-diff rows and a consumer note for app-bithire's three `<Button data-state>` production sites (the DS edits no application).
  3. The `commandHomePanelBgStrong` removal (4.0 line): only after the planned safe migration of the stored tenant document that authors it (The Management Miami, via the sanctioned CAS publish path; owner/ops, outside the DS; never a wipe) is recorded: remove the member from `BrandShellChrome`, the schema admission and the iso shape, delete its row, major changeset with its contract-diff row. Without that migration the row stays and this work order cannot close.
- **Files** — `packages/core/src/components/primitives/display/avatar/contracts/index.ts`; `packages/core/src/components/primitives/display/badge/contracts/index.ts`; `packages/core/src/components/primitives/display/tag/contracts/index.ts`; `packages/core/src/components/primitives/feedback/spinner/contracts/index.ts`; `packages/core/src/components/primitives/foundation/loading-indicator/contracts/index.ts`; `packages/core/src/components/primitives/inputs/button/contracts/index.ts`; `packages/core/src/components/primitives/inputs/input/contracts/index.ts`; the two test files of step 2; `packages/core/src/foundation/contracts/composition/tenants/themes/brand/chrome/frame/index.ts`; `packages/core/src/infrastructure/compilers/kernel/foundation/schemas/tenant-theme/chrome/frame/index.ts`; `packages/core/src/foundation/contracts/composition/tenants/themes/iso/shape/index.ts`; `packages/core/contracts/package/deprecations/index.json`; `.changeset/**`; `packages/core/docs/consumer-contract/**`; `roadmap/{retire.md,registry.json,STATUS.md}`. Step 1 additionally: `packages/core/src/foundation/tokens/css/presentation/components/patterns/index.css` and `packages/core/src/infrastructure/compilers/kernel/foundation/css/chrome-variables/sections/frame/index.ts` (the two deleted writers), and the official regenerations that follow them in the DT's producer window.
- **Acceptance gate** — `node packages/core/scripts/check/boundaries/deprecations/index.mjs --check --assume-done=WO-RET-07 --json` with the siblings present, and the same with `--siblings=absent`: 0 failures and no row names WO-RET-07 (under `--assume-done` a `debt` row is red whatever happens, so this passes only when the symbols are gone); `node packages/core/scripts/check/consumer-census/index.mjs --check --assume-done=WO-RET-07`: OK; `node packages/core/scripts/check/engine/skins/pass-through/index.mjs --check`: OK, counters non-increasing; the contract-changeset gate lists the twelve removals as major; `pnpm roadmap:check` green. Evidence: the gate outputs under `evidence/ret-07-closure/`, committed, sha256 quoted in `done --evidence`.
- **Do NOT** — Do not receive any row outside the closed scope. Do not transfer a row to another work order (a debt transfer settles nothing). Do not edit applications. Do not widen `noDebtReceivers` or `compatReceivers`. Do not reclassify a row as `compat-*` to avoid the debt rule. Do not remove `commandHomePanelBgStrong` from the contract, the schema or the iso shape before its stored-document migration is recorded. Do not fold in the other `chrome.shell.commandHome*` fields: that cohort is not in this scope. Do not treat being listed here as a retirement done.
- **Scope (closed list)** —
  Caller props, inert in every engine of the current source since ARC-12 step 3 (P-88); the published 2.19.37 still renders several of them, and that runtime break ships in the next major (owner 2026-10-15, `roadmap/owner-decisions-2026-10-15.md`) (11): `AvatarProps.data-part`, `AvatarProps.data-state`, `BadgeBaseProps.data-part`, `BadgeBaseProps.data-state`, `TagProps.data-part`, `TagProps.data-state`, `SpinnerProps.data-part`, `LoadingIndicatorProps.data-part`, `ButtonPublicProps.data-part`, `ButtonPublicProps.data-state`, `InputProps.data-part`. Census of 2026-10-14: ten consumerless; `ButtonPublicProps.data-state` consumed by app-bithire at three production sites (`ui/details/inline-editor/index.tsx:611`, `ui/upgrade/modal/index.tsx:297`, `:334`), inert in the current source; rendered by the installed 2.19.37.
  Tenant-theme field (1), admitted by DT ruling under owner answer 34: `chrome.shell.commandHomePanelBgStrong` (`BrandShellChrome.commandHomePanelBgStrong`, published through `./server`), authored by one live stored tenant document.
- **Size** — S.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-RET-07 (Major 4.0 retirement of the eleven inert caller data-part/data-state props (ARC-12 / P-88) and the inert commandHomePanelBgStrong theme field) exactly as specified in `roadmap/retire.md`: read first the receiver scout and the command-home debrief cited in the Why; work only inside the 4.0 major line; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate passes; report the commands you ran and their output.
