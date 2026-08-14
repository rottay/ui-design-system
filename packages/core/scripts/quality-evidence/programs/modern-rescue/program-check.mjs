import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validateCustomizationManifest } from "./manifest/generator.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(HERE, "../../../../../..");

const CONTRACT_FILES = Object.freeze({
  program: "program.json",
  checkpoint: "checkpoint.intent.json",
  inventory: "family-inventory.json",
  rubric: "quality-rubric.json",
  customization: "customization-model.json",
  artDirection: "tenant-art-direction.json",
  visualCraft: "visual-craft-contract.json",
  rounds: "rounds.json",
  orchestration: "agent-orchestration.json",
  evidence: "evidence-contract.json"
});

// The five canonical family layers (CLAUDE.md). `surface-composition` and
// `commercial` were carried here as expected layers, which made this gate
// require the two forbidden layers it exists to police: any correct fix broke
// the check, so the check kept the defect alive.
//
// The four former `surface-composition` rows were adjudicated INDIVIDUALLY
// (owner ruling 2026-08-12) rather than relabelled as a block -- sharing one
// `sourceOwner` does not make four components one layer:
//   PageShellSurface -> structure/shell         (page-chrome foundation)
//   HeaderSurface    -> structure/headers       (a header, beside the other 6)
//   SidebarSurface   -> structure/shell/navigation
//   WorkspaceShell   -> structure/shell         (a layout shell, so it is chrome)
//
// WorkspaceShell was first landed as `surface/workspace/workspace-shell` on the
// reading that a continuous page surface is a surface. It is not: CLAUDE.md puts
// a layout shell in `structure/shell/*` and reserves `surface/<group>/*` for a
// complete declarative page recipe, and the component's own contract agrees --
// it frames whatever children a workspace hands it and names no screen. Moving
// it also closed the last `local-layer-inversion`, because the collection
// workspace surface was importing upward into a peer surface family.
//
// The eleven `commercial` rows were split the same way -- by what each component
// does, never by where it was sold. Nine relocated into canonical owners,
// ProductWindow left for the Showroom (a browser-chrome mock is showcase
// furniture, not a DS capability), and TreeView collapsed into the one canonical
// tree family it had been duplicating.
//
// Two further rows were retired rather than moved: `table-checkbox-styles`, a
// global-CSS injector whose own source declared MERGE/RETIRE and which had zero
// productive consumers; and `record-content`, which was never a component at all
// -- it is one file exporting five public families, so it became those five.
//
// Net: 252 - 11 - 1 - 1 + 9 + 5 = 253. Every number below is a census of
// `family-inventory.json`, re-derived after each move, never a hand-carried
// total.
//
// The 2026-08-12 owner rulings then moved it again, in both directions, which
// is why these numbers were left deliberately stale between the first ruling
// and the last one -- locking a total mid-adjudication is how this file drifted
// before. Applied:
//   - `pattern/data/cell-renderers` retired (-1): its declared component was a
//     TYPE (`typeof cellRenderers`), so the row never named anything a consumer
//     could render. The render functions stay as data-table support;
//   - the lifecycle converged into ONE `structure/feedback/surface-lifecycle`
//     row (+1) over one owner, absorbing the duplicate Loading/Empty/Error
//     anatomy, `useSurfaceState` and `SurfaceErrorBoundary`;
//   - `structure/feedback/capability-anatomy` became its own row (+1): its
//     contract and consumers prove it is independent public chrome beside the
//     lifecycle, not an internal part of it;
//   - `SurfaceActionBar`/`SurfaceTabbedLabel`/`SurfaceSectionCard` became ONE
//     `structure/shell/surface-chrome` row (+1) over one owner, not three rows.
//
// Net: 253 - 1 + 1 + 1 + 1 = 255. Re-derived from `family-inventory.json` only
// after `public-component-row-projection.test.mjs` reported zero unowned public
// components, so the total certifies a finished adjudication rather than a
// half-applied one. Every number below is that census, never a hand-carried
// total.
// The WorkspaceShell reclassification above moves one row between two layers,
// so the total is untouched and only the split changes: structure 38 -> 39,
// surface 37 -> 36.
const EXPECTED_COUNTS = Object.freeze({
  primitive: 105,
  pattern: 57,
  chart: 18,
  structure: 39,
  surface: 36
});

const EXPECTED_FAMILY_TOTAL = Object.values(EXPECTED_COUNTS).reduce((sum, n) => sum + n, 0);

const SHADOW_STATE_KEYS = new Set([
  "status",
  "progress",
  "percentage",
  "percentComplete",
  "accepted",
  "completed",
  "done"
]);

export function readModernRescueContracts(root = HERE) {
  return Object.fromEntries(
    Object.entries(CONTRACT_FILES).map(([key, filename]) => [
      key,
      JSON.parse(fs.readFileSync(path.join(root, filename), "utf8"))
    ])
  );
}

function collectShadowStateKeys(value, label, errors) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      collectShadowStateKeys(entry, `${label}[${index}]`, errors)
    );
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, entry] of Object.entries(value)) {
    if (SHADOW_STATE_KEYS.has(key)) {
      errors.push(`${label} contains forbidden shadow-state key ${key}`);
    }
    collectShadowStateKeys(entry, `${label}.${key}`, errors);
  }
}

export function validateModernRescueContracts(contracts) {
  const errors = [];
  for (const [key, value] of Object.entries(contracts)) {
    collectShadowStateKeys(value, key, errors);
  }

  const {
    program,
    checkpoint,
    inventory,
    rubric,
    customization,
    artDirection,
    visualCraft,
    rounds,
    orchestration,
    evidence
  } =
    contracts;

  if (program?.workOrderId !== "WO-CRA-23") {
    errors.push("program.workOrderId must be WO-CRA-23");
  }
  if (program?.statusAuthority !== "roadmap/registry.json") {
    errors.push("program.statusAuthority must remain roadmap/registry.json");
  }
  if (program?.denominators?.visibleFamilies !== EXPECTED_FAMILY_TOTAL) {
    errors.push(`program visible family denominator must be ${EXPECTED_FAMILY_TOTAL}`);
  }
  for (const [key, expected] of Object.entries({
    primitives: EXPECTED_COUNTS.primitive,
    patternsExcludingCharts: EXPECTED_COUNTS.pattern,
    charts: EXPECTED_COUNTS.chart,
    structures: EXPECTED_COUNTS.structure,
    pageSurfaces: EXPECTED_COUNTS.surface
  })) {
    if (program?.denominators?.[key] !== expected) {
      errors.push(`program denominator ${key} must be ${expected}`);
    }
  }
  // The per-layer denominators used to be free-floating numbers that nobody
  // reconciled against the layer census, which is how `structures: 27` survived
  // beside a ledger that said 30. They are now pinned to EXPECTED_COUNTS, so a
  // layer can only move in both places at once.
  for (const forbidden of ["surfaceCompositions", "commercialKit"]) {
    if (program?.denominators?.[forbidden] !== undefined) {
      errors.push(`program denominator ${forbidden} names a forbidden layer and must be removed`);
    }
  }
  if (checkpoint?.schemaVersion !== 1 || !checkpoint?.currentWave) {
    errors.push("checkpoint intent must be a versioned non-empty machine contract");
  }
  if (!(checkpoint?.lanes ?? []).some((lane) => lane.id === "authority")) {
    errors.push("checkpoint intent must retain the authority reconciliation lane");
  }
  if (!(checkpoint?.refused ?? []).includes("R7 execution")) {
    errors.push("checkpoint intent must explicitly refuse R7 execution");
  }
  for (const contractPath of [
    program?.humanEntry,
    program?.checkpointIntent,
    program?.customizationManifest,
    program?.artDirectionContract,
    program?.visualCraftContract,
    program?.r7CustomizationContract,
    program?.referenceLab?.page,
    program?.referenceLab?.substrate
  ]) {
    if (!contractPath || !fs.existsSync(path.join(REPOSITORY_ROOT, contractPath))) {
      errors.push(`program contract path does not exist: ${contractPath ?? "missing"}`);
    }
  }
  if (program?.referenceLab?.route !== "/probe/ds-reference") {
    errors.push("R1 reference lab route must remain /probe/ds-reference");
  }
  if (program?.referenceLab?.sameTree !== true) {
    errors.push("R1 reference lab must render the same tree");
  }
  if (program?.referenceLab?.hardcodedDataOnly !== true) {
    errors.push("R1 reference lab must use hardcoded deterministic data only");
  }
  if (program?.referenceLab?.applicationImportsAllowed !== false) {
    errors.push("R1 reference lab must forbid product application imports");
  }
  if ((program?.referenceLab?.scenes ?? []).join(",") !== "primitives,forms,data,workflow,dashboard,shell,surfaces,all") {
    errors.push("R1 reference lab must retain all eight governed scenes");
  }
  // R0 split the lab behind scene-owned import boundaries, so the scene vocabulary now lives
  // in its own registry module while the page keeps tenant resolution. Both are lab source and
  // both are scanned; the required markers are unchanged.
  const referenceLabPageSource = fs.readFileSync(
    path.join(REPOSITORY_ROOT, program?.referenceLab?.page ?? ""),
    "utf8"
  );
  const sceneRegistryPath = program?.referenceLab?.sceneRegistry;
  if (!sceneRegistryPath || !fs.existsSync(path.join(REPOSITORY_ROOT, sceneRegistryPath))) {
    errors.push("R1 reference lab must declare an existing scene registry");
  }
  const sceneRegistrySource = sceneRegistryPath && fs.existsSync(path.join(REPOSITORY_ROOT, sceneRegistryPath))
    ? fs.readFileSync(path.join(REPOSITORY_ROOT, sceneRegistryPath), "utf8")
    : "";
  const substratePath = program?.referenceLab?.substrate;
  if (!substratePath || !fs.existsSync(path.join(REPOSITORY_ROOT, substratePath))) {
    errors.push("R1 reference lab must declare an existing substrate");
  }
  const substrateSource = substratePath && fs.existsSync(path.join(REPOSITORY_ROOT, substratePath))
    ? fs.readFileSync(path.join(REPOSITORY_ROOT, substratePath), "utf8")
    : "";
  const referenceLabSource = `${referenceLabPageSource}\n${sceneRegistrySource}\n${substrateSource}`;
  for (const forbidden of ["app-bithire", "src/features/candidates", "src/app/(dashboard)"]) {
    if (referenceLabSource.includes(forbidden)) {
      errors.push(`R1 reference lab contains forbidden product dependency ${forbidden}`);
    }
  }
  for (const required of ["bithire", "themanagementmiami", "canonical-db", "Coverage atlas"]) {
    if (!referenceLabSource.includes(required)) {
      errors.push(`R1 reference lab is missing required source marker ${required}`);
    }
  }
  // A component import here would pull every section into each scene route's graph and
  // dissolve the per-scene boundary the round exists to create.
  if (/from ['"]@\/components\/torture-sections\/(?!registry)/.test(sceneRegistrySource)) {
    errors.push("R1 scene registry must not import section components");
  }
  const sceneRoutesRoot = program?.referenceLab?.sceneRoutes;
  if (sceneRoutesRoot) {
    const absoluteRoutes = path.join(REPOSITORY_ROOT, sceneRoutesRoot);
    const routed = fs.existsSync(absoluteRoutes)
      ? fs
          .readdirSync(absoluteRoutes, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => entry.name)
          .sort()
      : [];
    const declared = [...(program?.referenceLab?.scenes ?? [])].sort();
    if (routed.join(",") !== declared.join(",")) {
      errors.push(
        `R1 scene routes ${routed.join("|") || "<none>"} do not match the declared scenes ${declared.join("|")}`
      );
    }
  } else {
    errors.push("R1 reference lab must declare its scene-route root");
  }
  for (const [name, authorityPath] of Object.entries(
    program?.inventoryAuthorities ?? {}
  )) {
    if (!fs.existsSync(path.join(REPOSITORY_ROOT, authorityPath))) {
      errors.push(`program inventory authority ${name} does not exist`);
    }
  }

  if (
    inventory?.denominator !== EXPECTED_FAMILY_TOTAL ||
    inventory?.rows?.length !== EXPECTED_FAMILY_TOTAL
  ) {
    errors.push(`family inventory must contain exactly ${EXPECTED_FAMILY_TOTAL} rows`);
  }
  const ids = inventory?.rows?.map((row) => row.id) ?? [];
  if (new Set(ids).size !== ids.length) {
    errors.push("family inventory ids must be unique");
  }
  for (const row of inventory?.rows ?? []) {
    if (!Object.hasOwn(EXPECTED_COUNTS, row.layer)) {
      errors.push(
        `family inventory ${row.id} declares forbidden layer '${row.layer}'; allowed layers are ${Object.keys(EXPECTED_COUNTS).join("|")}`
      );
    }
  }
  for (const [layer, expected] of Object.entries(EXPECTED_COUNTS)) {
    const actual = inventory?.rows?.filter((row) => row.layer === layer).length ?? 0;
    if (actual !== expected) {
      errors.push(`family inventory ${layer} count ${actual} != ${expected}`);
    }
    if (inventory?.counts?.[layer] !== expected) {
      errors.push(`family inventory declared ${layer} count must be ${expected}`);
    }
  }
  // Declared counts are checked in both directions. Reading only the five keys we
  // expect would let `"commercial": 11` sit in the counts block unread -- present
  // in the authority, invisible to the gate.
  for (const layer of Object.keys(inventory?.counts ?? {})) {
    if (!Object.hasOwn(EXPECTED_COUNTS, layer)) {
      errors.push(`family inventory declares a count for forbidden layer '${layer}'`);
    }
  }
  for (const row of inventory?.rows ?? []) {
    if (!fs.existsSync(path.join(REPOSITORY_ROOT, row.sourceRoot ?? ""))) {
      errors.push(`family inventory ${row.id} sourceRoot does not exist`);
    }
  }
  const familyNames = inventory?.rows?.map((row) => row.family) ?? [];
  if (!familyNames.includes("SemanticSurface")) {
    errors.push("canonical primitive inventory must include SemanticSurface");
  }
  // Retirement regression guards, adjudicated 2026-08-12. Each name was removed
  // from source, not merely from the count, so re-appearance here means someone
  // resurrected a family the owner struck out.
  for (const [retired, why] of Object.entries({
    OverlayModal: "a forwarding alias for feedback/Modal",
    TableCheckboxStyles: "a global-CSS injector with no productive consumer",
    RecordContent: "never a component; split into five real record families"
  })) {
    if (familyNames.includes(retired)) {
      errors.push(`retired ${retired} must not count as an independent family (${why})`);
    }
  }

  if (program?.r7Enabled !== false) {
    errors.push("program R7 execution must remain disabled");
  }
  const workOrderPath = path.join(
    REPOSITORY_ROOT,
    program?.workOrderAuthority ?? "",
  );
  const workOrderSource = fs.readFileSync(workOrderPath, "utf8");
  if (!workOrderSource.includes("# Modern Rescue — START HERE")) {
    errors.push("workOrderAuthority must be the Modern Rescue START HERE contract");
  }
  const registry = JSON.parse(
    fs.readFileSync(path.join(REPOSITORY_ROOT, "roadmap/registry.json"), "utf8")
  );
  const registeredWorkOrder = registry?.workOrders?.find(
    (workOrder) => workOrder.id === "WO-CRA-23"
  );
  if (!registeredWorkOrder?.programs?.includes("modern-rescue")) {
    errors.push("WO-CRA-23 must register the modern-rescue program");
  }
  if (!registeredWorkOrder?.notes?.includes("Owner-authorized standalone")) {
    errors.push("WO-CRA-23 registry authority must remain explicitly standalone");
  }

  const weight = rubric?.dimensions?.reduce(
    (total, dimension) => total + dimension.weight,
    0
  );
  if (rubric?.schemaVersion !== 3) {
    errors.push("quality rubric schema must remain v3 with family completion depth");
  }
  if (weight !== 100) errors.push(`quality rubric weight must equal 100, got ${weight}`);
  if (rubric?.eligibility?.testsAwardCraftPoints !== false) {
    errors.push("tests must not award craft points");
  }
  if (rubric?.eligibility?.finalSightedAuthority !== "Codex") {
    errors.push("Codex must remain final sighted authority");
  }
  if (
    rubric?.dimensions?.some((dimension) => dimension.evidenceRequired !== true)
  ) {
    errors.push("every scored quality dimension must require observable evidence");
  }
  if (!rubric?.eligibility?.resilienceCaseFloor?.includes("stressMatrix")) {
    errors.push("resilience declarations must inherit the applicable stressMatrix floor");
  }
  if (
    !rubric?.binaryContracts?.includes(
      "motif-texture-never-crosses-text-or-controls"
    )
  ) {
    errors.push("motif content-safe behavior must remain a binary contract");
  }
  for (const lifecycle of ["restricted", "redacted"]) {
    if (!rubric?.stressMatrix?.lifecycle?.includes(lifecycle)) {
      errors.push(`stressMatrix lifecycle must include ${lifecycle}`);
    }
  }
  if ((rubric?.hardVetoes?.length ?? 0) < 20) {
    errors.push("quality rubric must retain at least 20 hard vetoes");
  }
  if (rubric?.layerThresholds?.["reference-canary"] !== 95) {
    errors.push("reference canary threshold must remain 95");
  }
  const familyCompletion = rubric?.familyCompletionContract;
  if (
    familyCompletion?.writerMaximumStatus !==
    "ELEVATED_PENDING_CODEX_AUDIT"
  ) {
    errors.push("family writers must remain pending Codex audit");
  }
  for (const status of [
    "ELEVATED_PENDING_CODEX_AUDIT",
    "ALREADY_REFERENCE_GRADE_PENDING_CODEX_AUDIT",
    "ASSESSED_NOT_ELEVATED",
    "BLOCKED_OWNER_DECISION"
  ]) {
    if (!familyCompletion?.statuses?.includes(status)) {
      errors.push(`family completion status ${status} must remain representable`);
    }
  }
  if (!familyCompletion?.countingLaw?.includes("Only Codex")) {
    errors.push("only Codex-accepted families may count as progress");
  }
  if (!familyCompletion?.sourceChangeLaw?.includes("productive source change")) {
    errors.push("family elevation must require a productive source change");
  }
  if (!familyCompletion?.partialLaw?.includes("ASSESSED_NOT_ELEVATED")) {
    errors.push("partial family work must remain explicitly not elevated");
  }
  if (!familyCompletion?.twoChangeLaw?.includes("every named deficit")) {
    errors.push("small diffs must close every named family deficit");
  }
  const improvementFloors =
    familyCompletion?.materialImprovement
      ?.minimumImprovedDimensionsUnlessEveryOtherApplicableDimensionAlreadyMeetsFloor;
  // Keyed by layerProfile. `surface-composition` is now plainly `surface` -- the
  // floor was always about how much a page-level composition has to move, never
  // about a layer by that name -- and the `commercial` floor is gone with the
  // layer: its nine survivors inherit whichever profile their new owner carries.
  const expectedImprovementFloors = {
    "reference-canary": 6,
    "primitive-static-layout": 4,
    "primitive-interactive-control-data-overlay": 4,
    pattern: 5,
    chart: 5,
    structure: 6,
    surface: 7
  };
  for (const [layer, floor] of Object.entries(expectedImprovementFloors)) {
    if (improvementFloors?.[layer] !== floor) {
      errors.push(`material improvement floor ${layer} must remain ${floor}`);
    }
  }
  for (const declared of Object.keys(improvementFloors ?? {})) {
    if (!Object.hasOwn(expectedImprovementFloors, declared)) {
      errors.push(`material improvement floor declares retired profile '${declared}'`);
    }
  }
  if (familyCompletion?.materialImprovement?.premiumDimensionFloor !== 4) {
    errors.push("unchanged family dimensions must prove the 4/5 premium floor");
  }
  if (
    familyCompletion?.materialImprovement
      ?.testsDocsCommentsGeneratedOutputAwardCraft !== false
  ) {
    errors.push("tests/docs/comments/generated output must award zero craft");
  }
  for (const field of [
    "beforeDimensionScores",
    "afterDimensionScores",
    "materialDeltaTable",
    "unchangedDimensionPremiumProof",
    "remainingP0P1Defects"
  ]) {
    if (!familyCompletion?.requiredFamilyReceiptFields?.includes(field)) {
      errors.push(`family receipt must require ${field}`);
    }
  }
  const cssOwnership = rubric?.cssOwnershipContract;
  const expectedCssClassifications = [
    "FAMILY_STRUCTURAL_INVARIANT",
    "FOUNDATION_OR_RUNTIME_INVARIANT",
    "TENANT_DIRECT_CANONICAL",
    "TENANT_DERIVED_CANONICAL",
    "STATE_PREFERENCE_ACCESSIBILITY",
    "RETIRE_WITH_DEATH_PROOF"
  ];
  if (
    cssOwnership?.allowedClassifications?.join(",") !==
    expectedCssClassifications.join(",")
  ) {
    errors.push("CSS ownership classifications must remain closed and exact");
  }
  if (!cssOwnership?.roundScopeExit?.includes("zero dead")) {
    errors.push("accepted round scope must require zero dead CSS");
  }
  if (
    !cssOwnership?.fullProgramExit?.includes("R5/R6") ||
    !cssOwnership?.fullProgramExit?.includes("R7")
  ) {
    errors.push("R5/R6 must establish and R7 must replay the full productive Modern CSS audit");
  }
  if (
    !cssOwnership?.tenantAuthorityLaw?.includes("static BrandTheme and DB TenantTheme")
  ) {
    errors.push("tenant-variable CSS must retain static and DB canonical authority");
  }
  if ((cssOwnership?.deadCssDefinition?.length ?? 0) < 7) {
    errors.push("dead CSS definition must cover every governed failure mode");
  }
  if (
    !rubric?.binaryContracts?.includes("zero-dead-or-unowned-css-in-round-scope") ||
    !rubric?.binaryContracts?.includes(
      "customizable-css-has-static-db-canonical-authority"
    )
  ) {
    errors.push("CSS ownership and tenant authority must remain binary contracts");
  }

  if (customization?.standard?.current?.length !== 13) {
    errors.push("customization Standard baseline must contain 13 controls");
  }
  if (customization?.pro?.capabilities?.length !== 7) {
    errors.push("customization Pro baseline must contain 7 capabilities");
  }
  if (customization?.expert?.exactAllowlistBaseline !== 294) {
    errors.push("customization Expert baseline must remain 294");
  }
  if (customization?.expert?.maximumOverridesPerDocument !== 200) {
    errors.push("Expert document maximum must remain 200");
  }
  for (const metric of ["coverage", "resilience", "canonClosure", "pathParity"]) {
    if (customization?.kpis?.[metric]?.roundExit !== 1) {
      errors.push(`customization KPI ${metric} must exit at 1`);
    }
  }
  if (customization?.kpis?.unknownTargetedImpact?.roundExit !== 0) {
    errors.push("unknown targeted impact must exit at zero");
  }
  const r7Customization = customization?.r7Execution;
  if (r7Customization?.familyDispositionDenominator !== EXPECTED_FAMILY_TOTAL) {
    errors.push(`R7 customization model must disposition ${EXPECTED_FAMILY_TOTAL} families`);
  }
  if (r7Customization?.targetRecipeGroups !== 14) {
    errors.push("R7 customization model must target fourteen recipe groups");
  }
  if (!r7Customization?.benchmarkLaw?.includes("no wholesale")) {
    errors.push("R7 customization benchmark must prohibit wholesale copying");
  }
  if ((r7Customization?.familyAnatomyDispositionRequiredFields?.length ?? 0) < 18) {
    errors.push("R7 family anatomy disposition contract is incomplete");
  }
  if (
    r7Customization?.referencePostures?.count !== 5 ||
    r7Customization?.referencePostures?.pairCount !== 10 ||
    r7Customization?.referencePostures?.minimumNonColorAxesPerPair !== 6
  ) {
    errors.push("R7 must retain five postures, ten pairs and six non-color axes");
  }
  for (const [metric, expected] of Object.entries({
    deadOrUnownedModernCss: 0,
    dormantPublicChannels: 0,
    unknownTargetedImpact: 0,
    coverage: 1,
    resilience: 1,
    canonClosure: 1,
    pathParity: 1,
    staticDbAndExactRestore: 1
  })) {
    if (r7Customization?.exit?.[metric] !== expected) {
      errors.push(`R7 customization exit ${metric} must equal ${expected}`);
    }
  }
  for (const binary of [
    `r7-${EXPECTED_FAMILY_TOTAL}-family-anatomy-disposition-complete`,
    "r7-reference-parity-without-copy",
    "r7-fourteen-recipe-groups-productive",
    "r7-zero-dormant-public-customization-channels",
    "r7-five-posture-pairwise-distinctiveness"
  ]) {
    if (!rubric?.binaryContracts?.includes(binary)) {
      errors.push(`R7 binary contract missing: ${binary}`);
    }
  }
  if (!rubric?.tenantDivergenceAxes?.includes("navigation-chrome")) {
    errors.push("tenant divergence axes must include navigation chrome");
  }

  const directionIds = artDirection?.targets?.map((target) => target.tenantId) ?? [];
  if (directionIds.join(",") !== "bithire-static,themanagement-db") {
    errors.push("tenant art direction must cover BitHire static and The Management DB in order");
  }
  if (artDirection?.authority?.sameTree !== true) {
    errors.push("tenant art direction must require the same React tree");
  }
  if ((artDirection?.divergenceContract?.r1MinimumObservableAxes ?? 0) < 8) {
    errors.push("R1 tenant art direction must require at least eight observable axes");
  }
  if ((artDirection?.divergenceContract?.r1MinimumNonColorAxes ?? 0) < 6) {
    errors.push("R1 tenant art direction must require at least six non-color axes");
  }
  if (
    artDirection?.targets?.some((target) => target.currentPaletteIsTarget !== false)
  ) {
    errors.push("both current tenant palettes must remain rejected as R1 targets");
  }
  if (
    artDirection?.targets?.some(
      (target) => !target.paletteRebuildLaw?.includes("Replace")
    )
  ) {
    errors.push("both tenant targets must retain an explicit palette rebuild law");
  }
  if (
    artDirection?.kimiProposalBoundary?.allowedWrites !==
    "new proposal files under the inbox only"
  ) {
    errors.push("Kimi proposal boundary must remain new-files-only");
  }
  if (
    artDirection?.kimiProposalBoundary?.retentionLaw !==
    "delete each raw submission after Codex reproduces and incorporates accepted observations into canonical contracts"
  ) {
    errors.push("Kimi submissions must remain temporary and deletion-bound");
  }
  if (Object.hasOwn(artDirection?.kimiProposalBoundary ?? {}, "adjudicationRecord")) {
    errors.push("Kimi advisory records must not become a parallel retained authority");
  }
  if (
    artDirection?.kimiProposalBoundary?.claudeMayConsume !==
    "canonical parent program files only; never raw or retained Kimi submissions"
  ) {
    errors.push("Claude must consume only the reconciled canonical program");
  }
  const mechanism = artDirection?.r0MechanismDecisions;
  if (
    mechanism?.boundedEnvelopeRanges?.join(",") !==
    "densityScale,effectIntensity,motionIntensity,motionDurationScale,typeScale,radiusScale"
  ) {
    errors.push("tenant direction must record all six bounded envelope ranges");
  }
  if (mechanism?.exactRadius?.verticalEnvelopeChangeRequired !== false) {
    errors.push("exact premium radius must not require widening the Standard envelope");
  }
  if (mechanism?.semanticToneSeeds?.frontierRequiredForR1 !== false) {
    errors.push("status-seeds frontier must not be treated as an R1 prerequisite");
  }
  if (mechanism?.profileRegistries?.mustRemainIndependent !== true) {
    errors.push("recipe and expressive profile registries must remain independent");
  }

  if (visualCraft?.schemaVersion !== 1) {
    errors.push("visual craft contract schema must remain v1");
  }
  if (visualCraft?.referenceIncidents?.length !== 12) {
    errors.push("visual craft contract must retain the twelve reproduced incidents");
  }
  if ((visualCraft?.bindingCraftLaws?.length ?? 0) < 15) {
    errors.push("visual craft contract must retain at least fifteen binding laws");
  }
  if ((visualCraft?.hardVisualVetoes?.length ?? 0) < 15) {
    errors.push("visual craft contract must retain at least fifteen hard vetoes");
  }
  for (const veto of visualCraft?.hardVisualVetoes ?? []) {
    if (!rubric?.hardVetoes?.includes(veto)) {
      errors.push(`visual craft veto must also bind rubric eligibility: ${veto}`);
    }
  }
  const failureTaxonomy = visualCraft?.failureTaxonomy;
  const taxonomyCategories = Object.values(failureTaxonomy?.categories ?? {});
  const taxonomyCheckCount = taxonomyCategories.reduce(
    (sum, checks) => sum + (Array.isArray(checks) ? checks.length : 0),
    0
  );
  if (taxonomyCategories.length !== 20) {
    errors.push("visual failure taxonomy must retain exactly twenty categories");
  }
  if (taxonomyCheckCount !== 120) {
    errors.push("visual failure taxonomy must retain exactly 120 checks");
  }
  if (
    failureTaxonomy?.outcomes?.join(",") !==
    "PASS,FAIL,NOT_APPLICABLE_WITH_REASON"
  ) {
    errors.push("visual failure taxonomy outcomes must remain closed and exact");
  }
  if (!failureTaxonomy?.elevationLaw?.includes("any FAIL")) {
    errors.push("any applicable visual taxonomy failure must block elevation");
  }
  if (!failureTaxonomy?.notApplicableLaw?.includes("rejected")) {
    errors.push("visual taxonomy N/A claims must require a falsifiable reason");
  }
  for (const [floor, expected] of Object.entries({
    contentBoundaryIntersectionPx: 0,
    dominantBoundariesPerSemanticRegion: 1,
    emptyOptionalIconSlotPx: 0,
    unintentionalNativeDesktopControls: 0,
    supportedStressContentOverlaps: 0,
    supportedStressClippedRequiredContent: 0,
    unexplainedEmptyPlotRegions: 0,
    rawGeometryOnlyChartsClaimedComplete: 0,
    coarsePointerTargetPx: 44,
    compactControlVisibleHeightPx: 32,
    balancedControlVisibleHeightPx: 36,
    expansiveControlVisibleHeightPx: 44
  })) {
    if (visualCraft?.mechanicalFloors?.[floor] !== expected) {
      errors.push(`visual craft mechanical floor ${floor} must remain ${expected}`);
    }
  }
  if (
    visualCraft?.optionalIconAndAssistiveContract?.modes?.join(",") !==
    "none,semantic-leading,semantic-trailing,assistive-ai"
  ) {
    errors.push("optional icon and assistive modes must remain closed and exact");
  }
  const iconGovernance = visualCraft?.iconGovernanceContract;
  if (!iconGovernance?.canonicalFacade?.includes("semantic Icon role facade")) {
    errors.push("icons must resolve through the semantic role facade or packs");
  }
  if ((iconGovernance?.forbidden?.length ?? 0) < 7) {
    errors.push("icon governance must retain the complete forbidden-path census");
  }
  if (!iconGovernance?.exceptionBoundaryLaw?.includes("chart toolbar actions")) {
    errors.push("chart geometry exceptions must not exempt functional chart icons");
  }
  if (
    !iconGovernance?.r0LabExit?.includes("zero generic TagIcon placeholders") ||
    !iconGovernance?.r0LabExit?.includes("zero functional unicode")
  ) {
    errors.push("R0 must drain generic and unicode icon fixtures before visual evidence");
  }
  if (
    !iconGovernance?.fullProgramExit?.includes("full Modern-reachable") ||
    !iconGovernance?.fullProgramExit?.includes("R7")
  ) {
    errors.push("R5/R6 must close and R7 must replay icon governance across Modern and active fixtures");
  }
  const checkpointPolicy = visualCraft?.checkpointPolicy;
  if (checkpointPolicy?.calibrationFamilyCount !== 3) {
    errors.push("every new grammar must calibrate exactly three families");
  }
  if (checkpointPolicy?.maximumFamiliesBetweenCodexCheckpoints !== 25) {
    errors.push("no visual cohort may exceed twenty-five families");
  }
  if (!checkpointPolicy?.calibrationLaw?.includes("explicit Codex GO")) {
    errors.push("calibration must stop for explicit Codex GO");
  }
  if (!checkpointPolicy?.restartLaw?.includes("restarts")) {
    errors.push("shared grammar changes must restart dependent checkpoints");
  }
  // R1 is the reference-canary cohort and stands outside the family census. R2/R3/R4
  // partition the catalog by layer and must therefore add up to it exactly; R7 covers
  // it whole. Deriving them from EXPECTED_COUNTS means a family cannot enter the
  // inventory without landing in exactly one round's cohorts.
  const expectedCheckpointTotals = {
    R1: 12,
    R2: EXPECTED_COUNTS.primitive,
    R3: EXPECTED_COUNTS.pattern + EXPECTED_COUNTS.chart,
    R4: EXPECTED_COUNTS.structure + EXPECTED_COUNTS.surface,
    R7: EXPECTED_FAMILY_TOTAL
  };
  // The key set is CLOSED. `expectedCheckpointTotals` iterates its own keys, so an
  // extra `roundCohorts.R5` block was read by nothing and bound by nothing -- not
  // the denominator law, not the twenty-five cap, not the replay. An unread cohort
  // block is worse than a missing one: it looks like governed plan and is not.
  const declaredCohortRounds = Object.keys(checkpointPolicy?.roundCohorts ?? {});
  const governedCohortRounds = Object.keys(expectedCheckpointTotals);
  if ([...declaredCohortRounds].sort().join(",") !== [...governedCohortRounds].sort().join(",")) {
    errors.push(
      `checkpoint roundCohorts must declare exactly ${governedCohortRounds.join(",")} but declares ${declaredCohortRounds.join(",") || "nothing"}`
    );
  }
  const roundPartitionTotal =
    expectedCheckpointTotals.R2 + expectedCheckpointTotals.R3 + expectedCheckpointTotals.R4;
  if (roundPartitionTotal !== EXPECTED_FAMILY_TOTAL) {
    errors.push(
      `R2+R3+R4 cover ${roundPartitionTotal} families but the catalog holds ${EXPECTED_FAMILY_TOTAL}`
    );
  }
  for (const [roundId, expectedTotal] of Object.entries(expectedCheckpointTotals)) {
    const cohorts = checkpointPolicy?.roundCohorts?.[roundId] ?? [];
    let total = 0;
    for (const cohort of cohorts) {
      const cohortCount = cohort.reduce((sum, label) => {
        const suffix = label.match(/-(\d+)$/)?.[1];
        return sum + (suffix ? Number(suffix) : 1);
      }, 0);
      if (cohortCount > 25) {
        errors.push(`${roundId} visual cohort exceeds twenty-five families`);
      }
      total += cohortCount;
    }
    if (total !== expectedTotal) {
      errors.push(`${roundId} checkpoint denominator ${total} != ${expectedTotal}`);
    }
  }
  // The totals above are necessary but not sufficient: they are sums, and a sum
  // survives a +1/-1 trade between two categories. `structure-shell-5` beside
  // `surface-workspace-5` still adds to 75 while both labels misdescribe the
  // catalog, and the R7 replay compares label SETS, so mutating both rounds
  // keeps replay equal too. Only the inventory can settle it.
  //
  // GOVERNED_COHORT_CATEGORIES maps a label STEM -- the label with its numeric
  // suffix stripped -- to {layer, category}. Keying on the whole label would
  // smuggle the count back in as a map key, so `structure-shell-5` would be
  // rejected merely for being an unknown name; keying on the stem means both
  // spellings resolve to the same category and the NUMBER comes only from
  // `inventory.rows`, counted at check time. A family that moves category is
  // then a finding rather than a second place to edit.
  //
  // R2 was previously left ungoverned on the grounds that its cohorts partition
  // primitives "on a different axis". The axis really is different -- but different
  // is not underivable, and unbound meant 105 families, 41% of the catalog, whose
  // declared split answered to nothing. `primitive-display-24` could read `-20`
  // beside `primitive-navigation-16`, summing to 105 under the twenty-five cap,
  // with an inventory holding 26 and 12; and a primitive genuinely moving category
  // produced no finding at all, while the identical move in a pattern did.
  //
  // The axis is exactly one carve-out: `foundation-visual` is the primitives whose
  // source still sits under the pre-split `primitives/foundation/` owner, and every
  // `primitive-<category>` is that category MINUS the carve-out. Deriving it that
  // way reproduces all seven declared R2 labels exactly (5/18/24/25/12/11/10), so
  // R2 joins the same law with no second count table and no contract edit.
  const isFoundationCarveOut = (row) =>
    typeof row.sourceOwner === "string" &&
    row.sourceOwner.includes("/ui/primitives/foundation/");
  const outsideCarveOut = (row) => !isFoundationCarveOut(row);
  const GOVERNED_COHORT_CATEGORIES = {
    "foundation-visual": {
      layer: "primitive",
      rowFilter: isFoundationCarveOut,
      describe: "primitive/foundation-visual carve-out"
    },
    "primitive-display": { layer: "primitive", category: "display", rowFilter: outsideCarveOut },
    "primitive-inputs": { layer: "primitive", category: "inputs", rowFilter: outsideCarveOut },
    "primitive-navigation": {
      layer: "primitive",
      category: "navigation",
      rowFilter: outsideCarveOut
    },
    "primitive-feedback": { layer: "primitive", category: "feedback", rowFilter: outsideCarveOut },
    "primitive-overlay": { layer: "primitive", category: "overlay", rowFilter: outsideCarveOut },
    "primitive-layout-responsive": {
      layer: "primitive",
      category: "layout",
      rowFilter: outsideCarveOut
    },
    "pattern-data": { layer: "pattern", category: "data" },
    "pattern-forms": { layer: "pattern", category: "forms" },
    "pattern-visualization-non-chart": { layer: "pattern", category: "visualization" },
    "pattern-commerce": { layer: "pattern", category: "commerce" },
    "pattern-feedback": { layer: "pattern", category: "feedback" },
    "pattern-identity": { layer: "pattern", category: "identity" },
    "pattern-communication": { layer: "pattern", category: "communication" },
    "pattern-workflow": { layer: "pattern", category: "workflow" },
    "pattern-navigation": { layer: "pattern", category: "navigation" },
    "pattern-customization": { layer: "pattern", category: "customization" },
    "pattern-shell": { layer: "pattern", category: "shell" },
    charts: { layer: "chart" },
    "structure-headers": { layer: "structure", category: "headers" },
    "structure-workspace": { layer: "structure", category: "workspace" },
    "structure-record": { layer: "structure", category: "record" },
    "structure-dashboard": { layer: "structure", category: "dashboard" },
    "structure-feedback": { layer: "structure", category: "feedback" },
    "structure-shell": { layer: "structure", category: "shell" },
    "surface-admin": { layer: "surface", category: "admin" },
    "surface-data": { layer: "surface", category: "data" },
    "surface-experience": { layer: "surface", category: "experience" },
    "surface-forms": { layer: "surface", category: "forms" },
    "surface-operations": { layer: "surface", category: "operations" },
    "surface-workspace": { layer: "surface", category: "workspace" }
  };
  const cohortStem = (label) => label.replace(/-\d+$/, "");
  const countRows = ({ layer, category, rowFilter }) =>
    (inventory?.rows ?? []).filter(
      (row) =>
        row.layer === layer &&
        (category === undefined || row.category === category) &&
        (rowFilter === undefined || rowFilter(row))
    ).length;
  const describeBinding = (binding) =>
    binding.describe ?? `${binding.layer}/${binding.category ?? "*"}`;
  // R3 and R4 must be FULLY governed: an unrecognized stem there would silently
  // opt out of the category law, which is the hole this closes rather than opens.
  //
  // Stem plus count is still not sufficient, because both are round-blind. Every
  // governed label already carries its own correct count, so SWAPPING two equally
  // sized labels across the round boundary -- `pattern-feedback-3` out of R3 for
  // `structure-dashboard-3` out of R4 -- leaves both suffix totals at 75, leaves
  // every count agreeing with the inventory, and leaves the R7 label SET
  // byte-identical, so neither the denominator law, the category law nor the
  // replay law can see it. Yet R3 would then certify a structure family and R4 a
  // pattern family, and the round scopes those cohorts are supposed to enumerate
  // (`patterns`/`charts` vs `structures`/`pageSurfaces`) would be describing rows
  // that live in the other round.
  //
  // Round membership is therefore its own law: R3 owns pattern+chart, R4 owns
  // structure+surface. The layer is read from the SAME binding that supplies the
  // count, so this adds no second hand-maintained label catalog -- a relabelled
  // or reclassified family moves both facts at once. R7 is the global replay
  // round and legitimately carries every layer, so it is deliberately excluded.
  // R2 joins R3 and R4 here now that its axis is derived rather than exempt.
  const ROUND_COHORT_LAYERS = {
    R2: ["primitive"],
    R3: ["pattern", "chart"],
    R4: ["structure", "surface"]
  };
  for (const [roundId, allowedLayers] of Object.entries(ROUND_COHORT_LAYERS)) {
    for (const label of (checkpointPolicy?.roundCohorts?.[roundId] ?? []).flat()) {
      const binding = GOVERNED_COHORT_CATEGORIES[cohortStem(label)];
      if (!binding) {
        errors.push(
          `${roundId} cohort label ${label} has no inventory category binding; every R2/R3/R4 label must be governed`
        );
        continue;
      }
      if (!allowedLayers.includes(binding.layer)) {
        errors.push(
          `${roundId} cohort label ${label} is a ${binding.layer} family but ${roundId} may only carry ${allowedLayers.join("+")} families`
        );
      }
    }
  }
  // With R2 bound, every stem R7 replays is governed too, so R7's `continue` is no
  // longer an escape hatch for a whole layer -- it now only guards a label that the
  // loop above has already reported as unbound.
  for (const roundId of ["R2", "R3", "R4", "R7"]) {
    for (const label of (checkpointPolicy?.roundCohorts?.[roundId] ?? []).flat()) {
      const binding = GOVERNED_COHORT_CATEGORIES[cohortStem(label)];
      if (!binding) continue;
      const declared = Number(label.match(/-(\d+)$/)?.[1]);
      const actual = countRows(binding);
      if (declared !== actual) {
        errors.push(
          `${roundId} cohort label ${label} claims ${declared} families but the inventory holds ${actual} in ${describeBinding(binding)}`
        );
      }
    }
  }
  const r7CohortLabels = (checkpointPolicy?.roundCohorts?.R7 ?? []).flat();
  const certifiedFamilyCohortLabels = ["R2", "R3", "R4"].flatMap(
    (roundId) => (checkpointPolicy?.roundCohorts?.[roundId] ?? []).flat()
  );
  if (new Set(r7CohortLabels).size !== r7CohortLabels.length) {
    errors.push("R7 checkpoint cohorts must be unique");
  }
  // Replay is STRUCTURAL, not set-based. A cohort array is not a bag of labels: it
  // is one checkpoint between two explicit Codex GOs, which is what
  // `maximumFamiliesBetweenCodexCheckpoints` and `calibrationLaw` govern. Comparing
  // flattened sets let two R7 cohorts merge into one -- deleting a human review
  // gate -- while the contract still certified "exact replay". Comparing the
  // partition itself makes the cadence part of the claim. R7 is already exactly
  // R2 ++ R3 ++ R4 in order and grouping, so this tightens the law without moving
  // a single declared cohort.
  const partitionOf = (cohorts) => JSON.stringify(cohorts ?? []);
  const certifiedFamilyCohorts = ["R2", "R3", "R4"].flatMap(
    (roundId) => checkpointPolicy?.roundCohorts?.[roundId] ?? []
  );
  if (
    [...r7CohortLabels].sort().join(",") !==
    [...certifiedFamilyCohortLabels].sort().join(",")
  ) {
    errors.push("R7 checkpoint cohorts must replay the exact R2-R4 family cohort catalog");
  } else if (
    partitionOf(checkpointPolicy?.roundCohorts?.R7) !== partitionOf(certifiedFamilyCohorts)
  ) {
    // Same labels, different grouping or order: the census is intact but the
    // checkpoint cadence is not, so it is reported as its own distinct failure.
    errors.push(
      `R7 must replay the R2-R4 checkpoint cadence exactly: ${(checkpointPolicy?.roundCohorts?.R7 ?? []).length} cohorts against ${certifiedFamilyCohorts.length}`
    );
  }
  // R1 stands outside the family census, which left it standing outside every law
  // except its own total. Twelve weight-one strings summing to twelve is satisfied
  // by the same canary repeated twelve times, so a reference family could leave the
  // cohort silently. The canary roster is stated twice -- here and in
  // `rounds.json` R1.scope.families -- and nothing kept the two honest, so each is
  // now checked against the other rather than against a third hand-written list.
  const r1CohortLabels = (checkpointPolicy?.roundCohorts?.R1 ?? []).flat();
  if (new Set(r1CohortLabels).size !== r1CohortLabels.length) {
    errors.push("R1 reference canaries must be unique; a repeated canary silently drops a family");
  }
  const r1ScopeFamilies = rounds?.rounds?.find((round) => round.id === "R1")?.scope?.families;
  if (!Array.isArray(r1ScopeFamilies) || r1ScopeFamilies.length !== expectedCheckpointTotals.R1) {
    errors.push(
      `R1 scope must name exactly ${expectedCheckpointTotals.R1} reference families but names ${Array.isArray(r1ScopeFamilies) ? r1ScopeFamilies.length : "none"}`
    );
  } else if (
    [...r1ScopeFamilies].sort().join(",") !== [...r1CohortLabels].sort().join(",")
  ) {
    errors.push(
      "R1 scope families and R1 checkpoint cohorts must name the same reference canaries"
    );
  }

  const roundIds = rounds?.rounds?.map((round) => round.id) ?? [];
  if (roundIds.join(",") !== "R0,R1,R2,R3,R4,R5,R6,R7") {
    errors.push("round contracts must be exactly R0..R7 in order");
  }
  const r2 = rounds?.rounds?.find((round) => round.id === "R2");
  const r1 = rounds?.rounds?.find((round) => round.id === "R1");
  const r3 = rounds?.rounds?.find((round) => round.id === "R3");
  const r4 = rounds?.rounds?.find((round) => round.id === "R4");
  const r6 = rounds?.rounds?.find((round) => round.id === "R6");
  const r7 = rounds?.rounds?.find((round) => round.id === "R7");
  for (const round of rounds?.rounds ?? []) {
    if (round.id === "R7" && round.enabled !== false) {
      errors.push("R7 round must remain disabled");
    }
    if (round.id !== "R7" && round.enabled !== true) {
      errors.push(`${round.id} must remain enabled inside the authorized R0-R6 scope`);
    }
  }
  // Derived, like R3 and R4. The literal 100 outlived the census: the commercial
  // split moved five families into primitives (crop-marks, texture-backdrop,
  // typewriter, ascii-frame, invert-section) and a hardcoded round scope cannot
  // notice that its own layer grew.
  if (r2?.scope?.primitives !== EXPECTED_COUNTS.primitive) {
    errors.push(`R2 must cover ${EXPECTED_COUNTS.primitive} primitives`);
  }
  if (r1?.scope?.referenceLab !== "/probe/ds-reference") {
    errors.push("R1 must execute through the canonical DS reference lab");
  }
  if (!r1?.scope?.referenceLabLaw?.includes("zero app-bithire")) {
    errors.push("R1 reference lab must explicitly exclude product application dependencies");
  }
  if (
    rounds?.roundBoundary?.checkpointPolicyAuthority !==
    "visual-craft-contract.json#checkpointPolicy"
  ) {
    errors.push("round boundaries must consume the visual craft checkpoint policy");
  }
  // Each axis is validated INDIVIDUALLY, not as a sum. A sum-only law is a
  // same-total false green: moving one pattern into charts (57/18 -> 56/19) or
  // trading a structure for a surface (39/36 -> 38/37) leaves the total intact
  // and the round scope wrong, which is exactly the shape of the drift this
  // reconciliation had to repair by hand.
  for (const [roundId, round, axes] of [
    ["R3", r3, { patterns: EXPECTED_COUNTS.pattern, charts: EXPECTED_COUNTS.chart }],
    [
      "R4",
      r4,
      { structures: EXPECTED_COUNTS.structure, pageSurfaces: EXPECTED_COUNTS.surface }
    ]
  ]) {
    for (const [axis, expected] of Object.entries(axes)) {
      if (round?.scope?.[axis] !== expected) {
        errors.push(
          `${roundId} scope ${axis} is ${round?.scope?.[axis]} but the inventory holds ${expected}`
        );
      }
    }
  }
  // R4's scope used to be a four-term sum whose last two terms named forbidden
  // layers. It is now the two real ones, and the retired keys are rejected rather
  // than tolerated as zero -- `?? 0` would have quietly accepted a stale
  // `commercialKit: 11` going missing OR a stale one still sitting there.
  for (const forbidden of ["surfaceCompositions", "commercialKit"]) {
    if (r4?.scope?.[forbidden] !== undefined) {
      errors.push(`R4 scope key ${forbidden} names a forbidden layer and must be removed`);
    }
  }
  // Every round that states a family denominator states the SAME one, and each is
  // pinned to the inventory. Only R7 used to be checked, which left three copies
  // of the number free to rot: `253` is not hypothetical here, it is the exact
  // stale value this program spent a reconciliation pass draining, and R0/R5/R6
  // could each have taken it back silently. R2/R3/R4 are absent on purpose --
  // they declare per-layer axes instead, validated individually further down.
  for (const [roundId, round, law] of [
    ["R0", rounds?.rounds?.find((round) => round.id === "R0"), "certify"],
    ["R5", rounds?.rounds?.find((round) => round.id === "R5"), "sweep"],
    ["R6", rounds?.rounds?.find((round) => round.id === "R6"), "freeze"],
    ["R7", r7, "disposition"]
  ]) {
    if (round?.scope?.families !== EXPECTED_FAMILY_TOTAL) {
      errors.push(
        `${roundId} must ${law} all ${EXPECTED_FAMILY_TOTAL} certified families but its scope says ${round?.scope?.families}`
      );
    }
  }
  if (r7?.scope?.recipeGroups?.current !== 6 || r7?.scope?.recipeGroups?.target !== 14) {
    errors.push("R7 must expand the six current recipe families into fourteen target groups");
  }
  if (
    !r7?.entry?.some((entry) => entry.includes("R6") && entry.includes("Codex-accepted"))
  ) {
    errors.push("R7 entry must require a Codex-accepted R6 frozen baseline");
  }
  if (!r7?.benchmarkPolicy?.authorityLaw?.includes("existing Rottay")) {
    errors.push("R7 references must preserve existing Rottay semantic authority");
  }
  if (!r7?.benchmarkPolicy?.codeReuseLaw?.includes("no wholesale")) {
    errors.push("R7 benchmark policy must prohibit wholesale external copying");
  }
  if ((r7?.benchmarkPolicy?.references?.length ?? 0) < 6) {
    errors.push("R7 must benchmark the complete named reference cohort");
  }
  if (r7?.scope?.referencePostures !== 5) {
    errors.push("R7 must prove five coherent reference postures");
  }
  if (
    !r7?.objectives?.some((entry) => entry.includes("six non-color axes")) ||
    !r7?.exit?.some((entry) => entry.includes("six-non-color-axis"))
  ) {
    errors.push("R7 pairwise tenant posture evidence must retain six non-color axes");
  }
  if (
    !r7?.objectives?.some((entry) => entry.includes("static BrandTheme") && entry.includes("DB TenantTheme")) ||
    !r7?.exit?.some((entry) => entry.includes("static DB") && entry.includes("exact-restore"))
  ) {
    errors.push("R7 must require static DB parity and exact restore");
  }
  if (!r7?.exit?.some((entry) => entry.includes("14-of-14"))) {
    errors.push("R7 exit must require fourteen productive recipe groups");
  }
  if (!r7?.exit?.some((entry) => entry.includes("dormant public") && entry.includes("0"))) {
    errors.push("R7 exit must drive dormant public customization channels to zero");
  }
  if (
    !r7?.objectives?.some(
      (entry) => entry.includes("evidence sealer") && entry.includes("R0 constants")
    )
  ) {
    errors.push("R7 must generalize the R0-only evidence sealer before certification");
  }
  if (r6?.exit?.some((entry) => entry.includes("push")) &&
      !r6.exit.some((entry) => entry.includes("never pushes"))) {
    errors.push("R6 must preserve the program-wide never-push law");
  }
  if (!program?.invariants?.some((entry) => entry.includes("never pushes"))) {
    errors.push("the Modern rescue program must never push");
  }

  if (typeof orchestration?.graph?.agentCount === "number") {
    errors.push("agent count must be dynamic, never a fixed number");
  }
  if (orchestration?.schemaVersion !== 2) {
    errors.push("agent orchestration schema must remain v2 with model routing");
  }
  const modelRouting = orchestration?.modelRouting;
  if (
    !modelRouting?.programCoordinatorAndArchitectureControl?.preferred?.includes(
      "Opus"
    ) ||
    !modelRouting?.advisoryReadOnly?.preferred?.includes("Fable") ||
    !modelRouting?.creativePremiumFamilyWork?.preferred?.includes("Opus") ||
    !modelRouting?.mechanicalDeterministicWork?.preferred?.includes("Sonnet")
  ) {
    errors.push("model routing must preserve coordinator/creative/mechanical roles");
  }
  if (!modelRouting?.law?.includes("actual availability")) {
    errors.push("model routing must remain adaptive to availability and quality");
  }
  if (
    !orchestration?.efficiency?.some((entry) =>
      entry.includes("non-obvious invariants")
    ) ||
    !orchestration?.efficiency?.some((entry) => entry.includes("progress diary"))
  ) {
    errors.push("agent efficiency must require useful comments and structured receipts");
  }
  if (orchestration?.laneTypes?.["architecture-integrator"]?.singleton !== true) {
    errors.push("architecture integrator must be singleton");
  }
  if (orchestration?.laneTypes?.["quality-integrator"]?.singleton !== true) {
    errors.push("quality integrator must be singleton");
  }
  if ((orchestration?.reservedPaths?.length ?? 0) < 10) {
    errors.push("reserved shared ownership paths are incomplete");
  }
  if (
    orchestration?.r7Execution?.mechanicalWriters?.maximum !== 2 ||
    orchestration?.r7Execution?.mechanicalWriters?.model !== "Sonnet"
  ) {
    errors.push("R7 mechanical parallelism must remain bounded to two Sonnet writers");
  }
  if (
    orchestration?.r7Execution?.machineBudget?.heavyBuildOrTest !== 1 ||
    orchestration?.r7Execution?.machineBudget?.server !== 1 ||
    orchestration?.r7Execution?.machineBudget?.chromium !== 1
  ) {
    errors.push("R7 must retain one heavy process, one server and one Chromium");
  }
  if (!orchestration?.r7Execution?.longIterationLaw?.includes("complete current checkpoint")) {
    errors.push("R7 MAIN must run long checkpoint-sized iterations");
  }
  if (orchestration?.workOrderAdmission?.requiredBeforeWrite !== true) {
    errors.push("complete lane work orders must block writes rather than advise them");
  }
  if (orchestration?.graph?.integratorBatchRecalculationRequired !== true) {
    errors.push("conflict graph must recalculate after integrator batches");
  }

  for (const required of [
    "sourceDigest",
    "artifactSha256",
    "negativeDrill",
    "producer"
  ]) {
    if (!evidence?.receiptRequiredFields?.includes(required)) {
      errors.push(`evidence receipt must require ${required}`);
    }
  }
  if (evidence?.schemaVersion !== 2) {
    errors.push("evidence contract schema must remain v2 with visual checkpoints");
  }
  if (!evidence?.checkpointEvidenceLaw?.includes("explicit Codex GO")) {
    errors.push("checkpoint evidence must require explicit Codex GO before writes");
  }
  for (const field of [
    "checkpointId",
    "beforeAfterCapturePairs",
    "hardVisualVetoResults",
    "mechanicalFloorResults",
    "tenantPaletteAndGrammarResult",
    "cssOwnershipAndCausalityReceipts",
    "codexDecision",
    "nextWriteBoundary"
  ]) {
    if (!evidence?.checkpointRequiredFields?.includes(field)) {
      errors.push(`visual checkpoint must require ${field}`);
    }
  }
  if (evidence?.roundMaximumClaim !== "IMPLEMENTED_PENDING_CODEX_AUDIT") {
    errors.push("round maximum claim must remain pending Codex audit");
  }
  const evidenceRounds = Object.keys(
    evidence?.minimumReliableEvidenceByRound ?? {}
  ).join(",");
  if (evidenceRounds !== "R0,R1,R2,R3,R4,R5,R6,R7") {
    errors.push("minimum reliable evidence must be declared for every round R0..R7");
  }

  for (const manifestError of validateCustomizationManifest()) {
    errors.push(`customization manifest: ${manifestError}`);
  }
  if (!evidence?.minimumReliableEvidenceByRound?.R0?.includes("no captures")) {
    errors.push("R0 evidence must remain capture-free");
  }

  return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const errors = validateModernRescueContracts(readModernRescueContracts());
  if (errors.length > 0) {
    console.error(
      `modern-rescue program contract failed:\n- ${errors.join("\n- ")}`
    );
    process.exitCode = 1;
  } else {
    console.log(
      `modern-rescue program contract OK — ${EXPECTED_FAMILY_TOTAL} families, 20 active public controls, R0-R6 enabled, R7 disabled`
    );
  }
}
