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
     `node --test packages/core/scripts/maintain/codemods/tests/*.test.mjs`
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
  D1 `PatternApprovalInbox` — waits on owner question Q1.
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
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-RET-06 (Transitional compatibility and transferred closures of the 3.0 line) exactly as specified in `roadmap/retire.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-42, F-109, F-111, F-113, F-115, F-84, F-88 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.
