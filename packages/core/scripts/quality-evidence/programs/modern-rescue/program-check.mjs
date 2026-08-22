#!/usr/bin/env node
/**
 * @fileoverview T-1 Agent Constitution — fail-closed cross-check.
 *
 * Verifies the durable bootstrap (AGENTS.md, CLAUDE.md), the human entry point
 * (README.md), the programme contracts, and the segmented customization manifest.
 *
 * This checker is intentionally additive: it keeps the full historical contract
 * battery from the HEAD program-check.mjs, adds the T-1 constitutional fences
 * (exact roles, namespace lifecycle, double-accept, transport equality), and
 * integrates the deep manifest gate from validateCustomizationManifest().
 *
 * Run with: node program-check.mjs
 * Exit 0 on CONSTITUTION_READY, non-zero on BLOCKED.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadProgramContracts } from '../../v2/contracts.mjs';
import { validateCustomizationManifest } from '../../../../manifest/generator/index.mjs';
import { DOMAIN_KINDS, validateCascadeRoot, validateCascadeSet } from '../../../../manifest/rules/index.mjs';
import { repoRoot as findRepoRoot } from '../../../lib/repo-root/index.mjs';
import { validateInventory } from './cascade-consumability.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = findRepoRoot(__dirname);

const PROGRAM_DIR = 'packages/core/scripts/quality-evidence/programs/modern-rescue';
const PROGRAM_ROOT = join(repoRoot, PROGRAM_DIR);
// The manifest graduated out of the programme folder to the package root; the
// programme still owns it, so every manifest path is composed from here.
const MANIFEST_DIR = 'packages/core/manifest';

const FILES = {
  agents: 'AGENTS.md',
  claude: 'CLAUDE.md',
  readme: join(PROGRAM_DIR, 'README.md'),
  program: join(PROGRAM_DIR, 'program.json'),
  model: join(PROGRAM_DIR, 'customization-model.json'),
  orchestration: join(PROGRAM_DIR, 'agent-orchestration.json'),
  schema: join(MANIFEST_DIR, 'schema.json'),
  rules: join(MANIFEST_DIR, 'rules/index.mjs'),
};

// T-1 live implementer identity. The seat has moved twice by explicit owner
// order (2026-08-17, 2026-08-20) and was never vacated, so the checker pins
// the current successor by name and requires the unbroken succession chain
// that discharges the kimi-capacity-removal-lacks-successor-or-death-proof
// stop condition. The DT seat follows the same law: decision 13 (2026-08-20)
// moved it from Codex to Kimi K3, and the owner order of 2026-08-21 returned
// it to Codex when Kimi K3 exhausted its quota (documented backup DT
// activated). The seat moved twice and was never vacated, so the coordinator
// is validated as an unbroken CHAIN, exactly like the implementer -- a single
// pair of constants could not express two successions without erasing the
// first. Fable 5 remains the sole audit seat throughout: the DT does not hold
// one (conflict of interest, not capacity removal).
const LIVE_IMPLEMENTER = 'Claude implementer pool (Sonnet/Opus)';
const RETIRED_IMPLEMENTER = 'Kimi 2.7';
const IMPLEMENTER_SUCCESSION_ORDER_DATE = '2026-08-17';
const IMPLEMENTER_SUCCESSION_2_ORDER_DATE = '2026-08-20';
const LIVE_COORDINATOR = 'Codex';
const COORDINATOR_CHAIN_ORIGIN = 'Codex';
const COORDINATOR_SUCCESSION_ORDER_DATE = '2026-08-20';
const COORDINATOR_SUCCESSION_2_ORDER_DATE = '2026-08-21';
const RETAINED_AUDITORS = Object.freeze(['Fable 5']);

// Fable P1 correction (2026-08-21): Kimi K3 retired from ALL live seats that
// day, but tenant-art-direction.json's authority.creativeAdvisor still named
// a live Kimi seat ("Kimi through KIMI-ANNOTATIONS only"). The
// kimiProposalBoundary vocabulary and the KIMI-ANNOTATIONS inbox stay
// intact by design (historical/dormant, not deleted) -- only the live-seat
// designation is fail-closed here.
const EXPECTED_CREATIVE_ADVISOR =
  'none — Kimi K3 retired from all live seats on 2026-08-21; KIMI-ANNOTATIONS is historical/dormant';

/**
 * The sole-auditor roster is EXACT, not a minimum. Requiring only inclusion
 * let a retired seat re-enter silently: `['Fable 5', 'Kimi K3']` satisfied
 * "must name Fable 5" while contradicting the handoff law that the retired DT
 * does not return as auditor. Order is canonical so the contract reads the
 * same everywhere.
 */
function isSoleAuditorRoster(actors) {
  return (
    Array.isArray(actors) &&
    actors.length === RETAINED_AUDITORS.length &&
    actors.every((actor, index) => actor === RETAINED_AUDITORS[index])
  );
}

/**
 * The DT tenure is IMMUTABLE HISTORY, so the chain is pinned record by record,
 * not merely by origin/link/end. Validating only those let
 * `Codex -> AnyActor -> Codex` pass while erasing that Kimi K3 ever held the
 * seat. Two records, exact actors, exact dates.
 */
const COORDINATOR_SUCCESSION_CHAIN = Object.freeze([
  Object.freeze({ predecessor: 'Codex', successor: 'Kimi K3', ownerOrderDate: '2026-08-20' }),
  Object.freeze({ predecessor: 'Kimi K3', successor: 'Codex', ownerOrderDate: '2026-08-21' }),
]);
// The 2026-08-17 successor seat, retired in turn on 2026-08-20. Its name
// contains "Opus", and the succession chain must still be able to narrate
// it, so it is admitted alongside the live pool name below -- never as a
// routing target, only as the historical predecessor record requires.
const RETIRED_IMPLEMENTER_2 = 'Cloud Opus implementer pool';

/**
 * The programme still refuses Opus/Sonnet *routing*. The only admitted
 * mentions are the exact governed names of the live implementer pool and its
 * immediate predecessor (needed to narrate the succession chain), so strip
 * both before looking for an ungoverned model route.
 */
function routesUngovernedModel(text) {
  const stripped = text.split(LIVE_IMPLEMENTER).join('').split(RETIRED_IMPLEMENTER_2).join('');
  return stripped.includes('Opus') || stripped.includes('Sonnet');
}

// Historical family census, derived from family-inventory.json after the 2026-08-12
// adjudication. Every number below is a census of the inventory, never a hand-carried
// total.
const EXPECTED_COUNTS = Object.freeze({
  primitive: 105,
  pattern: 57,
  chart: 18,
  structure: 39,
  surface: 36,
});

const EXPECTED_FAMILY_TOTAL = Object.values(EXPECTED_COUNTS).reduce((sum, n) => sum + n, 0);

const SHADOW_STATE_KEYS = new Set([
  'status',
  'progress',
  'percentage',
  'percentComplete',
  'accepted',
  'completed',
  'done',
]);

export function readModernRescueContracts({ root = PROGRAM_ROOT } = {}) {
  const contracts = loadProgramContracts({ root, fresh: true });
  const checkpointPath = join(root, 'checkpoint.intent.json');
  try {
    contracts.checkpoint = JSON.parse(readFileSync(checkpointPath, 'utf8'));
  } catch {
    contracts.checkpoint = null;
  }
  return contracts;
}

function readText(rel) {
  const abs = join(repoRoot, rel);
  if (!existsSync(abs)) {
    return { exists: false, text: '' };
  }
  return { exists: true, text: readFileSync(abs, 'utf8') };
}

function readJson(rel) {
  const { exists, text } = readText(rel);
  if (!exists) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// T-1 constitutional textual checks
// ---------------------------------------------------------------------------

function collectTextualFailures() {
  const failures = [];

  // 1. Files exist
  for (const [key, rel] of Object.entries(FILES)) {
    const abs = join(repoRoot, rel);
    if (!existsSync(abs)) failures.push(`missing constitution file: ${rel}`);
  }

  // 2. AGENTS.md bootstrap pointers
  const agentsText = readText(FILES.agents).text;
  const requiredAgentsPointers = [
    'CLAUDE.md',
    'packages/core/scripts/quality-evidence/programs/modern-rescue/README.md',
    'packages/core/scripts/quality-evidence/programs/modern-rescue/program.json',
    'packages/core/scripts/quality-evidence/programs/modern-rescue/customization-model.json',
    'packages/core/scripts/quality-evidence/programs/modern-rescue/agent-orchestration.json',
    'packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.mjs',
  ];
  for (const pointer of requiredAgentsPointers) {
    if (!agentsText.includes(pointer)) {
      failures.push(`AGENTS.md must point to ${pointer}`);
    }
  }
  if (agentsText.includes('test-artifacts/') || agentsText.includes('advisory')) {
    failures.push('AGENTS.md must not depend on test-artifacts/advisory as authority');
  }

  // 3. CLAUDE.md bootstrap pointers and anti-drift
  const claudeText = readText(FILES.claude).text;
  if (!claudeText.includes('AGENTS.md')) {
    failures.push('CLAUDE.md bootstrap must point to AGENTS.md');
  }
  const requiredClaudePointers = [
    'packages/core/scripts/quality-evidence/programs/modern-rescue/README.md',
    'program.json',
    'customization-model.json',
    'agent-orchestration.json',
  ];
  for (const pointer of requiredClaudePointers) {
    if (!claudeText.includes(pointer)) {
      failures.push(`CLAUDE.md bootstrap must point to ${pointer}`);
    }
  }
  if (claudeText.includes('test-artifacts/') || claudeText.includes('advisory')) {
    failures.push('CLAUDE.md bootstrap must not depend on test-artifacts/advisory as authority');
  }

  // Premium section must remit to canonical authority, not re-define extension.
  const premiumMatch = claudeText.match(/## Premium white-label model[\s\S]*?(?=\n## |\n### |$)/);
  if (!premiumMatch) {
    failures.push('CLAUDE.md missing Premium white-label model section');
  } else {
    const premiumSection = premiumMatch[0];
    if (premiumSection.includes('_source/extension.css') && !premiumSection.includes('temporary drain debt')) {
      failures.push('CLAUDE.md Premium section treats extension.css as authority');
    }
    if (!premiumSection.includes('Theme') || !premiumSection.includes('compileTheme')) {
      failures.push('CLAUDE.md Premium section must remit to total Theme / compileTheme authority');
    }
  }

  // 4. README.md binding section, roles and fences
  const readmeText = readText(FILES.readme).text;
  if (!readmeText.includes('## Binding constitution')) {
    failures.push('README.md must contain a ## Binding constitution section');
  }
  const requiredBindingTopics = [
    '13 Standard',
    '7 Pro',
    'PROPOSED_NOT_IMPLEMENTED',
    '294-entry exact allowlist',
    '--ds-*',
    '--_ds-*',
    'data-*',
    'transport equality',
    'compileTheme',
  ];
  for (const topic of requiredBindingTopics) {
    if (!readmeText.toLowerCase().includes(topic.toLowerCase())) {
      failures.push(`README.md binding section must mention: ${topic}`);
    }
  }

  if (
    !readmeText.includes(LIVE_COORDINATOR) ||
    !readmeText.includes(LIVE_IMPLEMENTER) ||
    !readmeText.includes('Fable 5')
  ) {
    failures.push(`README.md Roles must name ${LIVE_COORDINATOR}, ${LIVE_IMPLEMENTER} and Fable 5`);
  }
  if (!readmeText.includes(RETIRED_IMPLEMENTER) || !readmeText.includes(IMPLEMENTER_SUCCESSION_ORDER_DATE)) {
    failures.push(
      `README.md Roles must record the ${RETIRED_IMPLEMENTER} implementer succession and its ${IMPLEMENTER_SUCCESSION_ORDER_DATE} owner order`,
    );
  }
  if (!readmeText.includes(IMPLEMENTER_SUCCESSION_2_ORDER_DATE)) {
    failures.push(
      `README.md Roles must record the Cloud Opus implementer pool succession and its ${IMPLEMENTER_SUCCESSION_2_ORDER_DATE} owner order`,
    );
  }
  // Both DT successions must stay narrated: the 2026-08-20 move to Kimi K3 is
  // history that the 2026-08-21 move back to Codex must not erase.
  if (!readmeText.includes('Kimi K3') || !readmeText.includes(COORDINATOR_SUCCESSION_ORDER_DATE)) {
    failures.push(
      `README.md Roles must record the Kimi K3 DT succession and its ${COORDINATOR_SUCCESSION_ORDER_DATE} owner order`,
    );
  }
  if (!readmeText.includes(COORDINATOR_SUCCESSION_2_ORDER_DATE)) {
    failures.push(
      `README.md Roles must record the ${LIVE_COORDINATOR} DT succession and its ${COORDINATOR_SUCCESSION_2_ORDER_DATE} owner order`,
    );
  }
  if (routesUngovernedModel(readmeText)) {
    failures.push('README.md must not route work to Opus or Sonnet outside the governed implementer pool name');
  }

  if (!readmeText.includes('No stage') && !readmeText.includes('No commit') && !readmeText.includes('no stage') && !readmeText.includes('no commit')) {
    failures.push('README.md fences must require explicit owner order before commit');
  }
  if (readmeText.includes('Local commits are allowed after an audited packet')) {
    failures.push('README.md must not allow local commits after an audited packet');
  }

  // 5. Anti-drift textual sentinels
  const simplificationPhrases = [
    'only --ds-* is legal',
    'only `--ds-*` is legal',
    '--_ds-* is illegal',
    '`--_ds-*` is illegal',
    'only ds namespace',
    'universal `--ds-*` only',
  ];
  const checkedTexts = [
    ['AGENTS.md', agentsText],
    ['CLAUDE.md', claudeText],
    ['README.md', readmeText],
  ];
  for (const [name, text] of checkedTexts) {
    for (const phrase of simplificationPhrases) {
      if (text.toLowerCase().includes(phrase.toLowerCase())) {
        failures.push(`${name} contains forbidden namespace simplification: ${phrase}`);
      }
    }
  }

  // 6. manifest schema/rules channel prefixes
  const schema = readJson(FILES.schema);
  if (schema) {
    const prefixes = schema.vocabulary?.channelPrefixes;
    if (!Array.isArray(prefixes) || prefixes.length !== 3 || !prefixes.includes('--ds-') || !prefixes.includes('--_ds-') || !prefixes.includes('data-')) {
      failures.push('manifest/schema.json channelPrefixes must be exactly ["--ds-", "--_ds-", "data-"]');
    }
  }

  const rulesText = readText(FILES.rules).text;
  if (rulesText) {
    if (!rulesText.includes("'--ds-'") || !rulesText.includes("'--_ds-'") || !rulesText.includes("'data-'")) {
      failures.push('manifest/rules/index.mjs CHANNEL_PREFIXES must include --ds-, --_ds- and data-');
    }
  }

  // 6b. manifest schema/rules/controls domain kinds (FAM-KINDS; same figure as 6)
  if (schema) {
    const kinds = schema.vocabulary?.domainKinds;
    const mismatch =
      !Array.isArray(kinds) ||
      kinds.length !== DOMAIN_KINDS.length ||
      DOMAIN_KINDS.some((k) => !kinds.includes(k)) ||
      kinds.some((k) => !DOMAIN_KINDS.includes(k));
    if (mismatch) {
      failures.push('manifest/schema.json vocabulary.domainKinds must match rules/index.mjs DOMAIN_KINDS exactly');
    }
  }
  // 6c. CASCADA (adjudicacion): validar manifest/cascade/roots/* con diente
  const cascadeDir = join(repoRoot, MANIFEST_DIR, 'cascade/roots');
  if (existsSync(cascadeDir)) {
    const famDir = join(repoRoot, MANIFEST_DIR, 'families');
    const famIds = new Set();
    const socketOwnership = new Map();
    const walkFam = (dir, prefix) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const rel = prefix ? `${prefix}/${e.name}` : e.name;
        if (e.isDirectory()) walkFam(join(dir, e.name), rel);
        else if (e.name.endsWith('.json')) {
          const famId = rel.replace(/\.json$/, '');
          famIds.add(famId);
          const doc = readJson(join(MANIFEST_DIR, 'families', rel));
          for (const cell of doc?.themeControls ?? []) {
            for (const edge of cell?.internalChannels ?? []) {
              if (!edge?.channelId || !String(edge.channelId).startsWith('--_ds-')) continue;
              const own = socketOwnership.get(edge.channelId) ?? { owner: edge.semanticOwner, families: new Set() };
              own.families.add(famId);
              socketOwnership.set(edge.channelId, own);
            }
          }
        }
      }
    };
    if (existsSync(famDir)) walkFam(famDir, '');
    const cascadeControlsDir = join(repoRoot, MANIFEST_DIR, 'controls');
    const controlIdsForCascade = existsSync(cascadeControlsDir)
      ? readdirSync(cascadeControlsDir).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5))
      : [];
    const docs = [];
    for (const entry of readdirSync(cascadeDir)) {
      if (!entry.endsWith('.json')) continue;
      const doc = readJson(join(MANIFEST_DIR, 'cascade/roots', entry));
      if (!doc) { failures.push(`manifest/cascade/roots/${entry} is not valid JSON`); continue; }
      docs.push(doc);
      const control = readJson(join(MANIFEST_DIR, 'controls', `${doc.rootId}.json`));
      failures.push(
        ...validateCascadeRoot(doc, {
          label: `manifest/cascade/roots/${entry}`,
          repositoryRoot: repoRoot,
          activeControlIds: controlIdsForCascade,
          controlTier: control?.tier ?? null,
          familyIds: famIds,
          socketOwnership,
        }),
      );
    }
    failures.push(...validateCascadeSet(docs, { label: 'manifest/cascade/roots' }));
    // completitud (orden del adjudicador): TODO control activo tiene su root file
    for (const cid of controlIdsForCascade) {
      if (!existsSync(join(cascadeDir, `${cid}.json`))) {
        failures.push(`manifest/cascade/roots/${cid}.json is missing for active control ${cid}`);
      }
    }
  }

  // 6d. CERCA DE CONSUMIBILIDAD downstream (PRE_F4B lote A, A10).
  //
  // `manifest/cascade/materialized/**` y `backlog/**` estan stale, y el
  // productor del segundo ni siquiera corre de punta a punta en un checkout
  // limpio. Ningun gate los leia, que es justamente como pudieron pudrirse sin
  // que nadie lo notara. La cerca los enumera y los declara bloqueados; ESTE
  // gate, que ya es blocking, es quien la valida.
  //
  // Se llama SOLO `validateInventory()`. `assertConsumable()` es la API del
  // consumidor de F4B y lanza para un path cercado: invocarla aqui dejaria el
  // gate rojo permanentemente por hacer su trabajo, y una cerca asi se borra en
  // vez de respetarse.
  failures.push(...validateInventory());

  const controlsDir = join(repoRoot, MANIFEST_DIR, 'controls');
  if (existsSync(controlsDir)) {
    for (const entry of readdirSync(controlsDir)) {
      if (!entry.endsWith('.json')) continue;
      const control = readJson(join(MANIFEST_DIR, 'controls', entry));
      const kind = control?.domain?.kind;
      if (!DOMAIN_KINDS.includes(kind)) {
        failures.push(
          `manifest/controls/${entry} domain.kind ${JSON.stringify(kind ?? null)} is not a governed domain kind`,
        );
      }
      // FORMA. A control that calls itself an enum has to SAY which values it
      // admits, somewhere a reader can find them. Two domiciles are legal and
      // only two: `domain.enumValues` for a flat single-axis vocabulary, and
      // `calibration.catalog` for a per-axis map -- the domicile the owner
      // ruled in `customization-model.json#vocabularyDomicile`, which exists
      // because `TenantCapabilityDeclaration.enumValues` is a flat
      // `readonly string[]` and cannot express a map. Declaring NEITHER is what
      // this rule refuses: an enum whose vocabulary lives nowhere at all.
      if (kind === 'enum' || kind === 'closed-enum') {
        const enumValues = control?.domain?.enumValues;
        const hasEnum = Array.isArray(enumValues) && enumValues.length > 0;
        const catalog = control?.calibration?.catalog;
        // Endurecido (correccion F5 de la auditoria Fable): antes bastaba con que
        // `catalog` no fuera null. Un `{}` -- o un no-objeto -- satisfacia FORMA
        // declarando vocabulario VACIO. Hoy es inexplotable porque los dos unicos
        // controles con domicilio catalogo entran a ADMISSION, pero eso es una
        // coincidencia de alcance, no una ley. Un catalogo es un mapa con al
        // menos un eje que admita algo.
        const hasCatalog =
          !!catalog &&
          typeof catalog === 'object' &&
          !Array.isArray(catalog) &&
          Object.values(catalog).some((axis) => Array.isArray(axis) && axis.length > 0);
        if (!hasEnum && !hasCatalog) {
          failures.push(
            `manifest/controls/${entry} declares domain.kind ${JSON.stringify(kind)} with an empty ` +
              'domain.enumValues and no calibration.catalog: an enum must name its vocabulary in one ' +
              'of the two governed domiciles',
          );
        }
      }
    }
  }

  /*
   * ADMISSION -- every value a cascade root EMITS must be ADMITTED by a
   * governed owner. Three adjudications are baked in here on purpose; read
   * them before changing a line, because each one is the answer to a real
   * question that was asked and settled.
   *
   * 1. ADMITTED IS NOT EXPANDED. The check is an IMPLICATION, never an
   *    equality. `calibration.catalog` is copied literally from the closed
   *    vocabularies in `expressive-profiles/index.ts` -- what a tenant may
   *    ASK FOR. A cascade root is derived from the `expansion/` tables -- what
   *    the engine EMITS today. The two are deliberately different sizes:
   *    `motif` admits 7 values and only 4 have expansion rows in v1 (`dots`,
   *    `deco-fan`, `ambient-orbs` wait for the K-wave). Demanding set equality
   *    would turn the tree red the day someone admits a value before wiring
   *    its expansion -- punishing the normal order of work. Admitting without
   *    emitting is legal; emitting without admitting is the defect.
   *
   * 2. THE card <-> cardComponent ALIAS, declared once, here. The runtime
   *    authority `TENANT_THEME_ANATOMY_VARIANTS` (tenant-theme/index.ts:322)
   *    names the slot `cardComponent`, and the control's catalog copies it
   *    literally. The cascade root names the same axis `card`, because its
   *    `effects.emits` is the DOM attribute `data-anatomy-card`. Both names
   *    are right in their own domain, so NEITHER artifact is renamed: the
   *    translation lives in this one map and nowhere else.
   *
   * 3. THE density CROSS-OWNER EXCEPTION. `profiles.expressive`'s catalogLaw
   *    excludes `density` on purpose -- ExpressiveAxes reuses the existing
   *    tenant vocabulary instead of minting a parallel profile enum, so the
   *    domain belongs to the `density.mode` control. The root still emits a
   *    `density` axis because it HAS an expansion table. So this axis is
   *    admitted against `controls/density.mode.json` rather than against the
   *    sibling catalog. It is an exception with a named owner, not a hole:
   *    an axis with no mapped owner at all is a failure.
   */
  /*
   * ADMISSION_ROOTS se DERIVA DEL ARBOL, no se pinea (correccion F1 de la
   * auditoria Fable). La lista fija de dos cubria 48 variantes de 17 raices que
   * emiten; el resto podia inventar un valor y salir CONSTITUTION_READY, como
   * Fable probo agregando `ultra` a density.mode. La regla ahora es: TODA raiz
   * de cascada con variantes cuyo control hermano sea enum/closed-enum entra.
   *
   * MAPEO RAIZ -> CONTROL: por id, medido. Los 17 rootId con variantes tienen
   * hoy un control homonimo en manifest/controls/. (El `type.pairing` que se
   * parece a `typography.pairing` es el campo `bindings[].root` de las
   * familias, que nombra la RAIZ DE CANAL, no el archivo de cascada: son
   * espacios de nombres distintos y no se cruzan aqui.)
   *
   * QUE QUEDA FUERA, Y POR QUE. Siete raices tienen control con dominio no
   * enumerado -- `profile-id` (experience.profile, recipe-profile), `scale`
   * (motion.dial), `bounded` (shape.radius-scale, surfaces.effect-intensity,
   * typography.scale) y `font-stack` (typography.families). No hay contra que
   * comparar: un dominio acotado o un stack de fuentes no publica una lista
   * cerrada de tokens. No es una exencion: es que la pregunta "¿esta admitido
   * este valor?" solo tiene respuesta donde hay vocabulario. El dia que uno de
   * esos controles pase a enum, entra solo, sin tocar esta ley.
   *
   * DONDE VIVE EL TOKEN, tambien medido. Las raices con eje escriben
   * `id: "<eje>:<valor>"` y el token es `value`; las planas escriben
   * `id: "<token>"` y `value` es el EFECTO emitido, no el vocabulario
   * (density.mode: id `compact`, value `0.85`). Comparar `value` en las planas
   * habria dado seis rojos falsos el primer dia.
   */
  const admissionRoots = [];
  const cascadeRootsDir = join(repoRoot, MANIFEST_DIR, 'cascade/roots');
  const outsideAdmission = [];
  if (existsSync(cascadeRootsDir)) {
    for (const entry of readdirSync(cascadeRootsDir).sort()) {
      if (!entry.endsWith('.json')) continue;
      const rootDoc = readJson(join(MANIFEST_DIR, 'cascade/roots', entry));
      if (!Array.isArray(rootDoc?.variants) || rootDoc.variants.length === 0) continue;
      const rootId = rootDoc.rootId ?? entry.replace(/\.json$/u, '');
      const controlRel = `${MANIFEST_DIR}/controls/${rootId}.json`;
      if (!existsSync(join(repoRoot, controlRel))) {
        // Fail-closed: una raiz que emite variantes y no tiene control hermano
        // no es "fuera de alcance", es un hueco de gobierno.
        failures.push(
          `admission: ${rootId} emits ${rootDoc.variants.length} variants but has no sibling control in ` +
            'manifest/controls/ to admit them',
        );
        continue;
      }
      const controlDoc = readJson(controlRel);
      const kind = controlDoc?.domain?.kind;
      if (kind === 'enum' || kind === 'closed-enum') admissionRoots.push({ rootId, rootDoc, controlDoc });
      else outsideAdmission.push(`${rootId} (${kind})`);
    }
  }
  /** Root axis name -> catalog axis name. See adjudication 2 above. */
  const CATALOG_AXIS_ALIASES = { card: 'cardComponent' };
  /** Root axis name -> the control that owns its vocabulary. See adjudication 3. */
  const CROSS_OWNER_AXES = { density: 'density.mode' };

  for (const { rootId, rootDoc, controlDoc } of admissionRoots) {
    const catalog = controlDoc?.calibration?.catalog;
    const enumValues = controlDoc?.domain?.enumValues;
    for (const variant of rootDoc.variants ?? []) {
      const id = String(variant?.id ?? '');
      const separator = id.indexOf(':');
      const axis = separator > 0 ? id.slice(0, separator) : null;
      // Con eje, el vocabulario es `value`; sin eje, es el propio `id`.
      const token = axis === null ? id : variant?.value;
      let admitted;
      let ownerLabel;
      if (axis !== null && Object.prototype.hasOwnProperty.call(CROSS_OWNER_AXES, axis)) {
        const ownerId = CROSS_OWNER_AXES[axis];
        const ownerRel = `${MANIFEST_DIR}/controls/${ownerId}.json`;
        const owner = existsSync(join(repoRoot, ownerRel)) ? readJson(ownerRel) : null;
        admitted = owner?.domain?.enumValues;
        ownerLabel = `controls/${ownerId}.json domain.enumValues`;
      } else if (axis !== null) {
        const catalogAxis = CATALOG_AXIS_ALIASES[axis] ?? axis;
        admitted = catalog?.[catalogAxis];
        ownerLabel = `controls/${rootId}.json calibration.catalog.${catalogAxis}`;
      } else {
        admitted = Array.isArray(enumValues) && enumValues.length > 0 ? enumValues : null;
        ownerLabel = `controls/${rootId}.json domain.enumValues`;
      }
      if (!Array.isArray(admitted)) {
        failures.push(
          `admission: ${rootId} emits ${axis === null ? 'variant' : `axis ${JSON.stringify(axis)}`} but no ` +
            `governed owner admits it (looked in ${ownerLabel})`,
        );
        continue;
      }
      if (!admitted.includes(token)) {
        failures.push(
          `admission: ${rootId} emits ${JSON.stringify(axis === null ? token : `${axis}:${token}`)} but ` +
            `${ownerLabel} does not admit that value -- emitting without admitting is the defect this ` +
            'rule refuses',
        );
      }
    }
  }


  return failures;
}

// ---------------------------------------------------------------------------
// T-1 constitutional contract checks (roles, namespace, double-accept)
// ---------------------------------------------------------------------------

function collectContractFailures(contracts) {
  const failures = [];

  const { program, customization: model, orchestration, evidence } = contracts;

  // program.json identity and denominators
  if (program) {
    if (program.r7Enabled !== false) {
      failures.push('program.json r7Enabled must be false');
    }
    if (program.status) {
      failures.push('program.json must not contain a shadow-state key status');
    }
    if (program.denominators?.visibleFamilies !== 255) {
      failures.push('program.json visibleFamilies must be 255');
    }
    if (program.controlBaselines?.standard !== 13) {
      failures.push('program.json standard controls must be 13');
    }
    if (program.controlBaselines?.proCapabilities !== 7) {
      failures.push('program.json pro capabilities must be 7');
    }
    if (program.controlBaselines?.expertExactAllowlist !== 294) {
      failures.push('program.json Expert exact allowlist must be 294');
    }
    if (program.controlBaselines?.expertMaximumOverridesPerDocument !== 200) {
      failures.push('program.json Expert maximumOverridesPerDocument must be 200');
    }
  }

  // customization-model.json namespace lifecycle and target state
  if (model) {
    if (!model.namespaceLifecycle) {
      failures.push('customization-model.json must contain namespaceLifecycle');
    } else {
      const ns = model.namespaceLifecycle;
      if (!ns.publicCanon || ns.publicCanon.prefix !== '--ds-*') {
        failures.push('namespaceLifecycle publicCanon must be --ds-*');
      }
      if (!ns.publicCanon?.forbiddenPatterns || !ns.publicCanon.forbiddenPatterns.includes('dashboard')) {
        failures.push('namespaceLifecycle publicCanon must forbid product/vertical dialects');
      }
      if (!ns.privateProvisional || ns.privateProvisional.prefix !== '--_ds-*') {
        failures.push('namespaceLifecycle privateProvisional must be --_ds-*');
      }
      if (!ns.privateProvisional?.forbidden || !ns.privateProvisional.forbidden.includes('Theme keypaths')) {
        failures.push('namespaceLifecycle privateProvisional must forbid Theme keypaths');
      }
      if (!ns.attributeAxis || ns.attributeAxis.prefix !== 'data-*') {
        failures.push('namespaceLifecycle attributeAxis must be data-*');
      }
      if (!ns.drainLaw || !ns.drainLaw.includes('extension')) {
        failures.push('namespaceLifecycle drainLaw must forbid extension-as-deferral');
      }
    }
    if (!model.transportEquality) {
      failures.push('customization-model.json must contain transportEquality');
    } else {
      const te = model.transportEquality;
      if (!te.law || !te.law.includes('compileTheme')) {
        failures.push('transportEquality law must name compileTheme');
      }
      const forbidden = te.forbidden ?? [];
      for (const required of ['second compiler', 'subset/intersection parity fixture', 'invented neutral Theme', 'silent default vertical', 'slug or product branch']) {
        if (!forbidden.some((entry) => entry.includes(required))) {
          failures.push(`transportEquality must forbid ${required}`);
        }
      }
    }
    if (model.targetControlModel?.implementationState !== 'PROPOSED_NOT_IMPLEMENTED') {
      failures.push('customization-model.json targetControlModel must be PROPOSED_NOT_IMPLEMENTED');
    }
    if (model.standard?.current?.length !== 13) {
      failures.push('customization-model.json standard.current must contain exactly 13 controls');
    }
    if (model.pro?.capabilities?.length !== 7) {
      failures.push('customization-model.json pro.capabilities must contain exactly 7 capabilities');
    }
    if (model.expert?.exactAllowlistBaseline !== 294) {
      failures.push('customization-model.json Expert exactAllowlistBaseline must be 294');
    }
    if (model.expert?.maximumOverridesPerDocument !== 200) {
      failures.push('customization-model.json Expert maximumOverridesPerDocument must be 200');
    }
  }

  // agent-orchestration.json exact roles (T-1 rewrite)
  if (orchestration) {
    if (orchestration.coordinator?.model !== LIVE_COORDINATOR) {
      failures.push(`agent-orchestration.json coordinator must be ${LIVE_COORDINATOR}`);
    }
    // The DT seat moved twice (2026-08-20, 2026-08-21) and was never vacated.
    // The chain is pinned RECORD BY RECORD, not by origin/link/end alone: an
    // origin/end-only law would accept `Codex -> AnyActor -> Codex` and erase
    // the Kimi K3 tenure while still passing. The tenure is immutable history,
    // so the actors, the dates and the record count are all exact, and each
    // record must retain the exact sole-auditor roster.
    const coordinatorSuccession = orchestration.coordinator?.succession;
    if (!Array.isArray(coordinatorSuccession) || coordinatorSuccession.length === 0) {
      failures.push('agent-orchestration.json coordinator must carry a succession record');
    } else if (coordinatorSuccession.length !== COORDINATOR_SUCCESSION_CHAIN.length) {
      failures.push(
        `coordinator succession must hold exactly ${COORDINATOR_SUCCESSION_CHAIN.length} records (the ${COORDINATOR_SUCCESSION_ORDER_DATE} and ${COORDINATOR_SUCCESSION_2_ORDER_DATE} owner orders)`,
      );
    } else {
      COORDINATOR_SUCCESSION_CHAIN.forEach((expected, index) => {
        const record = coordinatorSuccession[index] ?? {};
        if (record.predecessor !== expected.predecessor) {
          failures.push(
            `coordinator succession record ${index} predecessor must be ${expected.predecessor}`,
          );
        }
        if (record.successor !== expected.successor) {
          failures.push(
            `coordinator succession record ${index} successor must be ${expected.successor}`,
          );
        }
        if (record.ownerOrderDate !== expected.ownerOrderDate) {
          failures.push(
            `coordinator succession record ${index} must cite the ${expected.ownerOrderDate} owner order`,
          );
        }
        if (typeof record.proof !== 'string' || record.proof.length === 0) {
          failures.push('every coordinator succession record must state a written succession proof');
        }
        if (!isSoleAuditorRoster(record.retainedAuditCapacity)) {
          failures.push(
            `coordinator succession record ${index} must retain exactly the sole auditor roster ${JSON.stringify(RETAINED_AUDITORS)}`,
          );
        }
      });
      // Redundant with the record-by-record pins above, and deliberately kept:
      // if the pinned chain is ever widened, the structural law still holds.
      for (let i = 1; i < coordinatorSuccession.length; i += 1) {
        if (coordinatorSuccession[i].predecessor !== coordinatorSuccession[i - 1].successor) {
          failures.push(
            'coordinator succession chain must be unbroken: each record predecessor must equal the prior record successor',
          );
        }
      }
      if (coordinatorSuccession[0].predecessor !== COORDINATOR_CHAIN_ORIGIN) {
        failures.push(`coordinator succession must begin with predecessor ${COORDINATOR_CHAIN_ORIGIN}`);
      }
      if (coordinatorSuccession[coordinatorSuccession.length - 1].successor !== LIVE_COORDINATOR) {
        failures.push(`coordinator succession must end with ${LIVE_COORDINATOR}`);
      }
    }
    const routingText = JSON.stringify(orchestration.modelRouting ?? {});
    if (routesUngovernedModel(routingText)) {
      failures.push(
        'agent-orchestration.json modelRouting must not mention Opus or Sonnet outside the governed implementer pool name',
      );
    }
    if (orchestration.modelRouting?.implementer?.actor !== LIVE_IMPLEMENTER) {
      failures.push(`agent-orchestration.json implementer must be the ${LIVE_IMPLEMENTER}`);
    }
    // The seat has moved twice (2026-08-17, 2026-08-20), so succession is a
    // chain, not a single record: each entry's predecessor must equal the
    // prior entry's successor, the chain must begin at RETIRED_IMPLEMENTER
    // and end at LIVE_IMPLEMENTER, and every entry must carry a dated,
    // written proof. This generalizes the single-record law from before the
    // second move without weakening it: exactly one implementer seat exists
    // at every point in the chain.
    const succession = orchestration.modelRouting?.implementer?.succession;
    if (!Array.isArray(succession) || succession.length === 0) {
      failures.push('agent-orchestration.json implementer must carry a succession record');
    } else {
      const [first] = succession;
      const latest = succession[succession.length - 1];
      if (first.predecessor !== RETIRED_IMPLEMENTER) {
        failures.push(`implementer succession must begin with predecessor ${RETIRED_IMPLEMENTER}`);
      }
      if (first.ownerOrderDate !== IMPLEMENTER_SUCCESSION_ORDER_DATE) {
        failures.push(
          `implementer succession must cite the ${IMPLEMENTER_SUCCESSION_ORDER_DATE} owner order`,
        );
      }
      for (let i = 1; i < succession.length; i += 1) {
        if (succession[i].predecessor !== succession[i - 1].successor) {
          failures.push(
            'implementer succession chain must be unbroken: each record predecessor must equal the prior record successor',
          );
        }
      }
      if (succession.length > 1 && latest.ownerOrderDate !== IMPLEMENTER_SUCCESSION_2_ORDER_DATE) {
        failures.push(
          `implementer succession must cite the ${IMPLEMENTER_SUCCESSION_2_ORDER_DATE} owner order for its latest record`,
        );
      }
      if (latest.successor !== LIVE_IMPLEMENTER) {
        failures.push(`implementer succession must end with the ${LIVE_IMPLEMENTER}`);
      }
      for (const record of succession) {
        if (typeof record.proof !== 'string' || record.proof.length === 0) {
          failures.push('every implementer succession record must state a written succession proof');
        }
      }
      const retained = latest.retainedAuditCapacity ?? [];
      for (const auditor of RETAINED_AUDITORS) {
        if (!retained.includes(auditor)) {
          failures.push(`implementer succession must retain ${auditor} audit capacity`);
        }
      }
    }
    const advisory = orchestration.modelRouting?.advisoryReadOnly?.actors ?? [];
    for (const auditor of RETAINED_AUDITORS) {
      if (!advisory.includes(auditor)) {
        failures.push(`agent-orchestration.json must name ${auditor} as an advisor`);
      }
    }
    // EXACT roster, not a minimum: a retired seat must not be able to re-enter
    // the audit roster by simply being appended next to Fable 5.
    if (!isSoleAuditorRoster(advisory)) {
      failures.push(
        `agent-orchestration.json advisoryReadOnly.actors must be exactly ${JSON.stringify(RETAINED_AUDITORS)}`,
      );
    }
    // Decision 13: DT != auditor. The coordinator left the advisory/audit
    // seat the day it assumed the DT seat; a coordinator that still appears
    // in advisoryReadOnly is a live conflict of interest, not a harmless
    // overlap.
    if (orchestration.coordinator?.model && advisory.includes(orchestration.coordinator.model)) {
      failures.push(
        'agent-orchestration.json advisoryReadOnly.actors must not include the coordinator (decision 13: the DT is not the auditor)',
      );
    }
    if (orchestration.r7Execution?.enabled !== false) {
      failures.push('agent-orchestration.json r7Execution.enabled must be false');
    }
    const mechanicalWriters = orchestration.r7Execution?.mechanicalWriters;
    if (mechanicalWriters?.maximum !== 1) {
      failures.push('agent-orchestration.json r7Execution.mechanicalWriters.maximum must remain 1');
    }
    if (mechanicalWriters?.actor !== LIVE_IMPLEMENTER) {
      failures.push(`agent-orchestration.json r7Execution mechanical writer must be the ${LIVE_IMPLEMENTER}`);
    }
    if (!orchestration.doubleAccept) {
      failures.push('agent-orchestration.json must codify doubleAccept');
    } else {
      const da = orchestration.doubleAccept;
      if (!Array.isArray(da.notAuthorizationFor) || da.notAuthorizationFor.length === 0) {
        failures.push('doubleAccept.notAuthorizationFor must list actions it cannot authorize');
      }
      for (const auditor of RETAINED_AUDITORS) {
        if (!da.actors?.includes(auditor)) {
          failures.push(`doubleAccept actors must include ${auditor}`);
        }
      }
      if (!isSoleAuditorRoster(da.actors)) {
        failures.push(
          `doubleAccept actors must be exactly ${JSON.stringify(RETAINED_AUDITORS)}`,
        );
      }
      if (da.coordinator !== LIVE_COORDINATOR) {
        failures.push(`doubleAccept coordinator must be ${LIVE_COORDINATOR}`);
      }
      if (da.implementationActor !== LIVE_IMPLEMENTER) {
        failures.push(`doubleAccept implementationActor must be the ${LIVE_IMPLEMENTER}`);
      }
    }
  }

  // Cross-contract consistency
  if (program && model) {
    if (program.controlBaselines?.standard !== model.standard?.current?.length) {
      failures.push('program.json standard baseline must equal customization-model.json standard.current length');
    }
    if (program.controlBaselines?.proCapabilities !== model.pro?.capabilities?.length) {
      failures.push('program.json pro baseline must equal customization-model.json pro.capabilities length');
    }
    if (program.controlBaselines?.expertExactAllowlist !== model.expert?.exactAllowlistBaseline) {
      failures.push('program.json Expert allowlist baseline must equal customization-model.json expert.exactAllowlistBaseline');
    }
    if (program.controlBaselines?.expertMaximumOverridesPerDocument !== model.expert?.maximumOverridesPerDocument) {
      failures.push('program.json Expert override maximum must equal customization-model.json expert.maximumOverridesPerDocument');
    }
    if (program.r7Enabled !== model.r7Execution?.enabled) {
      failures.push('program.json r7Enabled must equal customization-model.json r7Execution.enabled');
    }
  }

  if (program && orchestration) {
    if (program.r7Enabled !== orchestration.r7Execution?.enabled) {
      failures.push('program.json r7Enabled must equal agent-orchestration.json r7Execution.enabled');
    }
  }

  if (model && orchestration) {
    if (model.r7Execution?.enabled !== orchestration.r7Execution?.enabled) {
      failures.push('customization-model.json r7Execution.enabled must equal agent-orchestration.json r7Execution.enabled');
    }
  }

  // Evidence contract must not contain a parallel status shadow state.
  if (evidence?.status) {
    failures.push('evidence-contract.json must not contain a shadow-state key status');
  }

  return failures;
}

// ---------------------------------------------------------------------------
// Historical contract battery (from HEAD program-check.mjs)
// ---------------------------------------------------------------------------

function collectShadowStateKeys(value, label, errors) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => collectShadowStateKeys(entry, `${label}[${index}]`, errors));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, entry] of Object.entries(value)) {
    if (SHADOW_STATE_KEYS.has(key)) {
      errors.push(`${label} contains forbidden shadow-state key ${key}`);
    }
    collectShadowStateKeys(entry, `${label}.${key}`, errors);
  }
}

function collectHistoricalContractFailures(contracts) {
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
    evidence,
    orchestration,
  } = contracts;

  if (program?.workOrderId !== 'WO-CRA-23') {
    errors.push('program.workOrderId must be WO-CRA-23');
  }
  if (program?.statusAuthority !== 'roadmap/registry.json') {
    errors.push('program.statusAuthority must remain roadmap/registry.json');
  }
  if (program?.denominators?.visibleFamilies !== EXPECTED_FAMILY_TOTAL) {
    errors.push(`program visible family denominator must be ${EXPECTED_FAMILY_TOTAL}`);
  }
  for (const [key, expected] of Object.entries({
    primitives: EXPECTED_COUNTS.primitive,
    patternsExcludingCharts: EXPECTED_COUNTS.pattern,
    charts: EXPECTED_COUNTS.chart,
    structures: EXPECTED_COUNTS.structure,
    pageSurfaces: EXPECTED_COUNTS.surface,
  })) {
    if (program?.denominators?.[key] !== expected) {
      errors.push(`program denominator ${key} must be ${expected}`);
    }
  }
  for (const forbidden of ['surfaceCompositions', 'commercialKit']) {
    if (program?.denominators?.[forbidden] !== undefined) {
      errors.push(`program denominator ${forbidden} names a forbidden layer and must be removed`);
    }
  }
  if (checkpoint?.schemaVersion !== 1 || !checkpoint?.currentWave) {
    errors.push('checkpoint intent must be a versioned non-empty machine contract');
  }
  if (!(checkpoint?.lanes ?? []).some((lane) => lane.id === 'authority')) {
    errors.push('checkpoint intent must retain the authority reconciliation lane');
  }
  if (!(checkpoint?.refused ?? []).includes('R7 execution')) {
    errors.push('checkpoint intent must explicitly refuse R7 execution');
  }
  for (const contractPath of [
    program?.humanEntry,
    program?.checkpointIntent,
    program?.customizationManifest,
    program?.artDirectionContract,
    program?.visualCraftContract,
    program?.r7CustomizationContract,
    program?.referenceLab?.page,
    program?.referenceLab?.substrate,
  ]) {
    if (!contractPath || !existsSync(join(repoRoot, contractPath))) {
      errors.push(`program contract path does not exist: ${contractPath ?? 'missing'}`);
    }
  }
  if (program?.referenceLab?.route !== '/probe/ds-reference') {
    errors.push('R1 reference lab route must remain /probe/ds-reference');
  }
  if (program?.referenceLab?.sameTree !== true) {
    errors.push('R1 reference lab must render the same tree');
  }
  if (program?.referenceLab?.hardcodedDataOnly !== true) {
    errors.push('R1 reference lab must use hardcoded deterministic data only');
  }
  if (program?.referenceLab?.applicationImportsAllowed !== false) {
    errors.push('R1 reference lab must forbid product application imports');
  }
  if ((program?.referenceLab?.scenes ?? []).join(',') !== 'primitives,forms,data,workflow,dashboard,shell,surfaces,all') {
    errors.push('R1 reference lab must retain all eight governed scenes');
  }
  const referenceLabPageSource = readFileSync(
    join(repoRoot, program?.referenceLab?.page ?? ''),
    'utf8',
  );
  const sceneRegistryPath = program?.referenceLab?.sceneRegistry;
  if (!sceneRegistryPath || !existsSync(join(repoRoot, sceneRegistryPath))) {
    errors.push('R1 reference lab must declare an existing scene registry');
  }
  const sceneRegistrySource = sceneRegistryPath && existsSync(join(repoRoot, sceneRegistryPath))
    ? readFileSync(join(repoRoot, sceneRegistryPath), 'utf8')
    : '';
  const substratePath = program?.referenceLab?.substrate;
  if (!substratePath || !existsSync(join(repoRoot, substratePath))) {
    errors.push('R1 reference lab must declare an existing substrate');
  }
  const substrateSource = substratePath && existsSync(join(repoRoot, substratePath))
    ? readFileSync(join(repoRoot, substratePath), 'utf8')
    : '';
  const referenceLabSource = `${referenceLabPageSource}\n${sceneRegistrySource}\n${substrateSource}`;
  for (const forbidden of ['app-bithire', 'src/features/candidates', 'src/app/(dashboard)']) {
    if (referenceLabSource.includes(forbidden)) {
      errors.push(`R1 reference lab contains forbidden product dependency ${forbidden}`);
    }
  }
  for (const required of ['bithire', 'themanagementmiami', 'canonical-db', 'Coverage atlas']) {
    if (!referenceLabSource.includes(required)) {
      errors.push(`R1 reference lab is missing required source marker ${required}`);
    }
  }
  if (/from ['"]@\/components\/torture-sections\/(?!registry)/.test(sceneRegistrySource)) {
    errors.push('R1 scene registry must not import section components');
  }
  const sceneRoutesRoot = program?.referenceLab?.sceneRoutes;
  if (sceneRoutesRoot) {
    const absoluteRoutes = join(repoRoot, sceneRoutesRoot);
    const routed = existsSync(absoluteRoutes)
      ? readdirSync(absoluteRoutes, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => entry.name)
          .sort()
      : [];
    const declared = [...(program?.referenceLab?.scenes ?? [])].sort();
    if (routed.join(',') !== declared.join(',')) {
      errors.push(
        `R1 scene routes ${routed.join('|') || '<none>'} do not match the declared scenes ${declared.join('|')}`,
      );
    }
  } else {
    errors.push('R1 reference lab must declare its scene-route root');
  }
  for (const [name, authorityPath] of Object.entries(program?.inventoryAuthorities ?? {})) {
    if (!existsSync(join(repoRoot, authorityPath))) {
      errors.push(`program inventory authority ${name} does not exist`);
    }
  }

  if (inventory?.denominator !== EXPECTED_FAMILY_TOTAL || inventory?.rows?.length !== EXPECTED_FAMILY_TOTAL) {
    errors.push(`family inventory must contain exactly ${EXPECTED_FAMILY_TOTAL} rows`);
  }
  const ids = inventory?.rows?.map((row) => row.id) ?? [];
  if (new Set(ids).size !== ids.length) {
    errors.push('family inventory ids must be unique');
  }
  for (const row of inventory?.rows ?? []) {
    if (!Object.hasOwn(EXPECTED_COUNTS, row.layer)) {
      errors.push(
        `family inventory ${row.id} declares forbidden layer '${row.layer}'; allowed layers are ${Object.keys(EXPECTED_COUNTS).join('|')}`,
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
  for (const layer of Object.keys(inventory?.counts ?? {})) {
    if (!Object.hasOwn(EXPECTED_COUNTS, layer)) {
      errors.push(`family inventory declares a count for forbidden layer '${layer}'`);
    }
  }
  for (const row of inventory?.rows ?? []) {
    if (!existsSync(join(repoRoot, row.sourceRoot ?? ''))) {
      errors.push(`family inventory ${row.id} sourceRoot does not exist`);
    }
  }
  const familyNames = inventory?.rows?.map((row) => row.family) ?? [];
  if (!familyNames.includes('SemanticSurface')) {
    errors.push('canonical primitive inventory must include SemanticSurface');
  }
  for (const [retired, why] of Object.entries({
    OverlayModal: 'a forwarding alias for feedback/Modal',
    TableCheckboxStyles: 'a global-CSS injector with no productive consumer',
    RecordContent: 'never a component; split into five real record families',
  })) {
    if (familyNames.includes(retired)) {
      errors.push(`retired ${retired} must not count as an independent family (${why})`);
    }
  }

  if (program?.r7Enabled !== false) {
    errors.push('program R7 execution must remain disabled');
  }
  const workOrderPath = join(repoRoot, program?.workOrderAuthority ?? '');
  const workOrderSource = readFileSync(workOrderPath, 'utf8');
  if (!workOrderSource.includes('# Modern Rescue — START HERE')) {
    errors.push('workOrderAuthority must be the Modern Rescue START HERE contract');
  }
  const registry = JSON.parse(readFileSync(join(repoRoot, 'roadmap/registry.json'), 'utf8'));
  const registeredWorkOrder = registry?.workOrders?.find((workOrder) => workOrder.id === 'WO-CRA-23');
  if (!registeredWorkOrder?.programs?.includes('modern-rescue')) {
    errors.push('WO-CRA-23 must register the modern-rescue program');
  }
  if (!registeredWorkOrder?.notes?.includes('Owner-authorized standalone')) {
    errors.push('WO-CRA-23 registry authority must remain explicitly standalone');
  }

  const weight = rubric?.dimensions?.reduce((total, dimension) => total + dimension.weight, 0);
  if (rubric?.schemaVersion !== 3) {
    errors.push('quality rubric schema must remain v3 with family completion depth');
  }
  if (weight !== 100) errors.push(`quality rubric weight must equal 100, got ${weight}`);
  if (rubric?.eligibility?.testsAwardCraftPoints !== false) {
    errors.push('tests must not award craft points');
  }
  if (rubric?.eligibility?.finalSightedAuthority !== `${LIVE_COORDINATOR} (DT)`) {
    errors.push(`${LIVE_COORDINATOR} (DT) must remain final sighted authority`);
  }
  if (rubric?.dimensions?.some((dimension) => dimension.evidenceRequired !== true)) {
    errors.push('every scored quality dimension must require observable evidence');
  }
  if (!rubric?.eligibility?.resilienceCaseFloor?.includes('stressMatrix')) {
    errors.push('resilience declarations must inherit the applicable stressMatrix floor');
  }
  if (!rubric?.binaryContracts?.includes('motif-texture-never-crosses-text-or-controls')) {
    errors.push('motif content-safe behavior must remain a binary contract');
  }
  for (const lifecycle of ['restricted', 'redacted']) {
    if (!rubric?.stressMatrix?.lifecycle?.includes(lifecycle)) {
      errors.push(`stressMatrix lifecycle must include ${lifecycle}`);
    }
  }
  if ((rubric?.hardVetoes?.length ?? 0) < 20) {
    errors.push('quality rubric must retain at least 20 hard vetoes');
  }
  if (rubric?.layerThresholds?.['reference-canary'] !== 95) {
    errors.push('reference canary threshold must remain 95');
  }
  const familyCompletion = rubric?.familyCompletionContract;
  if (familyCompletion?.writerMaximumStatus !== 'ELEVATED_PENDING_CODEX_AUDIT') {
    errors.push('family writers must remain pending Codex audit');
  }
  for (const status of [
    'ELEVATED_PENDING_CODEX_AUDIT',
    'ALREADY_REFERENCE_GRADE_PENDING_CODEX_AUDIT',
    'ASSESSED_NOT_ELEVATED',
    'BLOCKED_OWNER_DECISION',
  ]) {
    if (!familyCompletion?.statuses?.includes(status)) {
      errors.push(`family completion status ${status} must remain representable`);
    }
  }
  if (!familyCompletion?.countingLaw?.includes('Only the DT')) {
    errors.push('only DT-accepted families may count as progress');
  }
  if (!familyCompletion?.sourceChangeLaw?.includes('productive source change')) {
    errors.push('family elevation must require a productive source change');
  }
  if (!familyCompletion?.partialLaw?.includes('ASSESSED_NOT_ELEVATED')) {
    errors.push('partial family work must remain explicitly not elevated');
  }
  if (!familyCompletion?.twoChangeLaw?.includes('every named deficit')) {
    errors.push('small diffs must close every named family deficit');
  }
  const improvementFloors =
    familyCompletion?.materialImprovement
      ?.minimumImprovedDimensionsUnlessEveryOtherApplicableDimensionAlreadyMeetsFloor;
  const expectedImprovementFloors = {
    'reference-canary': 6,
    'primitive-static-layout': 4,
    'primitive-interactive-control-data-overlay': 4,
    pattern: 5,
    chart: 5,
    structure: 6,
    surface: 7,
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
    errors.push('unchanged family dimensions must prove the 4/5 premium floor');
  }
  if (familyCompletion?.materialImprovement?.testsDocsCommentsGeneratedOutputAwardCraft !== false) {
    errors.push('tests/docs/comments/generated output must award zero craft');
  }
  for (const field of [
    'beforeDimensionScores',
    'afterDimensionScores',
    'materialDeltaTable',
    'unchangedDimensionPremiumProof',
    'remainingP0P1Defects',
  ]) {
    if (!familyCompletion?.requiredFamilyReceiptFields?.includes(field)) {
      errors.push(`family receipt must require ${field}`);
    }
  }
  const cssOwnership = rubric?.cssOwnershipContract;
  const expectedCssClassifications = [
    'FAMILY_STRUCTURAL_INVARIANT',
    'FOUNDATION_OR_RUNTIME_INVARIANT',
    'TENANT_DIRECT_CANONICAL',
    'TENANT_DERIVED_CANONICAL',
    'STATE_PREFERENCE_ACCESSIBILITY',
    'RETIRE_WITH_DEATH_PROOF',
  ];
  if (cssOwnership?.allowedClassifications?.join(',') !== expectedCssClassifications.join(',')) {
    errors.push('CSS ownership classifications must remain closed and exact');
  }
  if (!cssOwnership?.roundScopeExit?.includes('zero dead')) {
    errors.push('accepted round scope must require zero dead CSS');
  }
  if (!cssOwnership?.fullProgramExit?.includes('R5/R6') || !cssOwnership?.fullProgramExit?.includes('R7')) {
    errors.push('R5/R6 must establish and R7 must replay the full productive Modern CSS audit');
  }
  if (!cssOwnership?.tenantAuthorityLaw?.includes('static BrandTheme and DB TenantTheme')) {
    errors.push('tenant-variable CSS must retain static and DB canonical authority');
  }
  if ((cssOwnership?.deadCssDefinition?.length ?? 0) < 7) {
    errors.push('dead CSS definition must cover every governed failure mode');
  }
  if (
    !rubric?.binaryContracts?.includes('zero-dead-or-unowned-css-in-round-scope') ||
    !rubric?.binaryContracts?.includes('customizable-css-has-static-db-canonical-authority')
  ) {
    errors.push('CSS ownership and tenant authority must remain binary contracts');
  }

  if (customization?.standard?.current?.length !== 13) {
    errors.push('customization Standard baseline must contain 13 controls');
  }
  if (customization?.pro?.capabilities?.length !== 7) {
    errors.push('customization Pro baseline must contain 7 capabilities');
  }
  if (customization?.expert?.exactAllowlistBaseline !== 294) {
    errors.push('customization Expert baseline must remain 294');
  }
  if (customization?.expert?.maximumOverridesPerDocument !== 200) {
    errors.push('Expert document maximum must remain 200');
  }
  for (const metric of ['coverage', 'resilience', 'canonClosure', 'pathParity']) {
    if (customization?.kpis?.[metric]?.roundExit !== 1) {
      errors.push(`customization KPI ${metric} must exit at 1`);
    }
  }
  if (customization?.kpis?.unknownTargetedImpact?.roundExit !== 0) {
    errors.push('unknown targeted impact must exit at zero');
  }
  const r7Customization = customization?.r7Execution;
  if (r7Customization?.familyDispositionDenominator !== EXPECTED_FAMILY_TOTAL) {
    errors.push(`R7 customization model must disposition ${EXPECTED_FAMILY_TOTAL} families`);
  }
  if (r7Customization?.targetRecipeGroups !== 14) {
    errors.push('R7 customization model must target fourteen recipe groups');
  }
  if (!r7Customization?.benchmarkLaw?.includes('no wholesale')) {
    errors.push('R7 customization benchmark must prohibit wholesale copying');
  }
  if ((r7Customization?.familyAnatomyDispositionRequiredFields?.length ?? 0) < 18) {
    errors.push('R7 family anatomy disposition contract is incomplete');
  }
  if (
    r7Customization?.referencePostures?.count !== 5 ||
    r7Customization?.referencePostures?.pairCount !== 10 ||
    r7Customization?.referencePostures?.minimumNonColorAxesPerPair !== 6
  ) {
    errors.push('R7 must retain five postures, ten pairs and six non-color axes');
  }
  for (const [metric, expected] of Object.entries({
    deadOrUnownedModernCss: 0,
    dormantPublicChannels: 0,
    unknownTargetedImpact: 0,
    coverage: 1,
    resilience: 1,
    canonClosure: 1,
    pathParity: 1,
    staticDbAndExactRestore: 1,
  })) {
    if (r7Customization?.exit?.[metric] !== expected) {
      errors.push(`R7 customization exit ${metric} must equal ${expected}`);
    }
  }
  for (const binary of [
    `r7-${EXPECTED_FAMILY_TOTAL}-family-anatomy-disposition-complete`,
    'r7-reference-parity-without-copy',
    'r7-fourteen-recipe-groups-productive',
    'r7-zero-dormant-public-customization-channels',
    'r7-five-posture-pairwise-distinctiveness',
  ]) {
    if (!rubric?.binaryContracts?.includes(binary)) {
      errors.push(`R7 binary contract missing: ${binary}`);
    }
  }
  if (!rubric?.tenantDivergenceAxes?.includes('navigation-chrome')) {
    errors.push('tenant divergence axes must include navigation chrome');
  }

  const directionIds = artDirection?.targets?.map((target) => target.tenantId) ?? [];
  if (directionIds.join(',') !== 'bithire-static,themanagement-db') {
    errors.push('tenant art direction must cover BitHire static and The Management DB in order');
  }
  if (artDirection?.authority?.sameTree !== true) {
    errors.push('tenant art direction must require the same React tree');
  }
  if (artDirection?.authority?.creativeAdvisor !== EXPECTED_CREATIVE_ADVISOR) {
    errors.push(
      `tenant-art-direction.json authority.creativeAdvisor must equal exactly "${EXPECTED_CREATIVE_ADVISOR}"`,
    );
  }
  if ((artDirection?.divergenceContract?.r1MinimumObservableAxes ?? 0) < 8) {
    errors.push('R1 tenant art direction must require at least eight observable axes');
  }
  if ((artDirection?.divergenceContract?.r1MinimumNonColorAxes ?? 0) < 6) {
    errors.push('R1 tenant art direction must require at least six non-color axes');
  }
  if (artDirection?.targets?.some((target) => target.currentPaletteIsTarget !== false)) {
    errors.push('both current tenant palettes must remain rejected as R1 targets');
  }
  if (artDirection?.targets?.some((target) => !target.paletteRebuildLaw?.includes('Replace'))) {
    errors.push('both tenant targets must retain an explicit palette rebuild law');
  }
  if (artDirection?.kimiProposalBoundary?.allowedWrites !== 'new proposal files under the inbox only') {
    errors.push('Kimi proposal boundary must remain new-files-only');
  }
  if (
    artDirection?.kimiProposalBoundary?.retentionLaw !==
    'delete each raw submission after the DT reproduces and incorporates accepted observations into canonical contracts'
  ) {
    errors.push('Kimi submissions must remain temporary and deletion-bound');
  }
  if (Object.hasOwn(artDirection?.kimiProposalBoundary ?? {}, 'adjudicationRecord')) {
    errors.push('Kimi advisory records must not become a parallel retained authority');
  }
  if (
    artDirection?.kimiProposalBoundary?.claudeMayConsume !==
    'canonical parent program files only; never raw or retained Kimi submissions'
  ) {
    errors.push('Claude must consume only the reconciled canonical program');
  }
  const mechanism = artDirection?.r0MechanismDecisions;
  if (
    mechanism?.boundedEnvelopeRanges?.join(',') !==
    'densityScale,effectIntensity,motionIntensity,motionDurationScale,typeScale,radiusScale'
  ) {
    errors.push('tenant direction must record all six bounded envelope ranges');
  }
  if (mechanism?.exactRadius?.verticalEnvelopeChangeRequired !== false) {
    errors.push('exact premium radius must not require widening the Standard envelope');
  }
  if (mechanism?.semanticToneSeeds?.frontierRequiredForR1 !== false) {
    errors.push('status-seeds frontier must not be treated as an R1 prerequisite');
  }
  if (mechanism?.profileRegistries?.mustRemainIndependent !== true) {
    errors.push('recipe and expressive profile registries must remain independent');
  }

  if (visualCraft?.schemaVersion !== 1) {
    errors.push('visual craft contract schema must remain v1');
  }
  if (visualCraft?.referenceIncidents?.length !== 12) {
    errors.push('visual craft contract must retain the twelve reproduced incidents');
  }
  if ((visualCraft?.bindingCraftLaws?.length ?? 0) < 15) {
    errors.push('visual craft contract must retain at least fifteen binding laws');
  }
  if ((visualCraft?.hardVisualVetoes?.length ?? 0) < 15) {
    errors.push('visual craft contract must retain at least fifteen hard vetoes');
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
    0,
  );
  if (taxonomyCategories.length !== 20) {
    errors.push('visual failure taxonomy must retain exactly twenty categories');
  }
  if (taxonomyCheckCount !== 120) {
    errors.push('visual failure taxonomy must retain exactly 120 checks');
  }
  if (failureTaxonomy?.outcomes?.join(',') !== 'PASS,FAIL,NOT_APPLICABLE_WITH_REASON') {
    errors.push('visual failure taxonomy outcomes must remain closed and exact');
  }
  if (!failureTaxonomy?.elevationLaw?.includes('any FAIL')) {
    errors.push('any applicable visual taxonomy failure must block elevation');
  }
  if (!failureTaxonomy?.notApplicableLaw?.includes('rejected')) {
    errors.push('visual taxonomy N/A claims must require a falsifiable reason');
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
    expansiveControlVisibleHeightPx: 44,
  })) {
    if (visualCraft?.mechanicalFloors?.[floor] !== expected) {
      errors.push(`visual craft mechanical floor ${floor} must remain ${expected}`);
    }
  }
  if (
    visualCraft?.optionalIconAndAssistiveContract?.modes?.join(',') !==
    'none,semantic-leading,semantic-trailing,assistive-ai'
  ) {
    errors.push('optional icon and assistive modes must remain closed and exact');
  }
  const iconGovernance = visualCraft?.iconGovernanceContract;
  if (!iconGovernance?.canonicalFacade?.includes('semantic Icon role facade')) {
    errors.push('icons must resolve through the semantic role facade or packs');
  }
  if ((iconGovernance?.forbidden?.length ?? 0) < 7) {
    errors.push('icon governance must retain the complete forbidden-path census');
  }
  if (!iconGovernance?.exceptionBoundaryLaw?.includes('chart toolbar actions')) {
    errors.push('chart geometry exceptions must not exempt functional chart icons');
  }
  if (
    !iconGovernance?.r0LabExit?.includes('zero generic TagIcon placeholders') ||
    !iconGovernance?.r0LabExit?.includes('zero functional unicode')
  ) {
    errors.push('R0 must drain generic and unicode icon fixtures before visual evidence');
  }
  if (
    !iconGovernance?.fullProgramExit?.includes('full Modern-reachable') ||
    !iconGovernance?.fullProgramExit?.includes('R7')
  ) {
    errors.push('R5/R6 must close and R7 must replay icon governance across Modern and active fixtures');
  }
  const checkpointPolicy = visualCraft?.checkpointPolicy;
  if (checkpointPolicy?.calibrationFamilyCount !== 3) {
    errors.push('every new grammar must calibrate exactly three families');
  }
  if (checkpointPolicy?.maximumFamiliesBetweenCodexCheckpoints !== 25) {
    errors.push('no visual cohort may exceed twenty-five families');
  }
  if (!checkpointPolicy?.calibrationLaw?.includes('explicit DT GO')) {
    errors.push('calibration must stop for explicit DT GO');
  }
  if (!checkpointPolicy?.restartLaw?.includes('restarts')) {
    errors.push('shared grammar changes must restart dependent checkpoints');
  }

  const expectedCheckpointTotals = {
    R1: 12,
    R2: EXPECTED_COUNTS.primitive,
    R3: EXPECTED_COUNTS.pattern + EXPECTED_COUNTS.chart,
    R4: EXPECTED_COUNTS.structure + EXPECTED_COUNTS.surface,
    R7: EXPECTED_FAMILY_TOTAL,
  };
  const declaredCohortRounds = Object.keys(checkpointPolicy?.roundCohorts ?? {});
  const governedCohortRounds = Object.keys(expectedCheckpointTotals);
  if ([...declaredCohortRounds].sort().join(',') !== [...governedCohortRounds].sort().join(',')) {
    errors.push(
      `checkpoint roundCohorts must declare exactly ${governedCohortRounds.join(',')} but declares ${declaredCohortRounds.join(',') || 'nothing'}`,
    );
  }
  const roundPartitionTotal = expectedCheckpointTotals.R2 + expectedCheckpointTotals.R3 + expectedCheckpointTotals.R4;
  if (roundPartitionTotal !== EXPECTED_FAMILY_TOTAL) {
    errors.push(`R2+R3+R4 cover ${roundPartitionTotal} families but the catalog holds ${EXPECTED_FAMILY_TOTAL}`);
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

  const isFoundationCarveOut = (row) =>
    typeof row.sourceOwner === 'string' && row.sourceOwner.includes('/ui/primitives/foundation/');
  const outsideCarveOut = (row) => !isFoundationCarveOut(row);
  const GOVERNED_COHORT_CATEGORIES = {
    'foundation-visual': {
      layer: 'primitive',
      rowFilter: isFoundationCarveOut,
      describe: 'primitive/foundation-visual carve-out',
    },
    'primitive-display': { layer: 'primitive', category: 'display', rowFilter: outsideCarveOut },
    'primitive-inputs': { layer: 'primitive', category: 'inputs', rowFilter: outsideCarveOut },
    'primitive-navigation': { layer: 'primitive', category: 'navigation', rowFilter: outsideCarveOut },
    'primitive-feedback': { layer: 'primitive', category: 'feedback', rowFilter: outsideCarveOut },
    'primitive-overlay': { layer: 'primitive', category: 'overlay', rowFilter: outsideCarveOut },
    'primitive-layout-responsive': { layer: 'primitive', category: 'layout', rowFilter: outsideCarveOut },
    'pattern-data': { layer: 'pattern', category: 'data' },
    'pattern-forms': { layer: 'pattern', category: 'forms' },
    'pattern-visualization-non-chart': { layer: 'pattern', category: 'visualization' },
    'pattern-commerce': { layer: 'pattern', category: 'commerce' },
    'pattern-feedback': { layer: 'pattern', category: 'feedback' },
    'pattern-identity': { layer: 'pattern', category: 'identity' },
    'pattern-communication': { layer: 'pattern', category: 'communication' },
    'pattern-workflow': { layer: 'pattern', category: 'workflow' },
    'pattern-navigation': { layer: 'pattern', category: 'navigation' },
    'pattern-customization': { layer: 'pattern', category: 'customization' },
    'pattern-shell': { layer: 'pattern', category: 'shell' },
    charts: { layer: 'chart' },
    'structure-headers': { layer: 'structure', category: 'headers' },
    'structure-workspace': { layer: 'structure', category: 'workspace' },
    'structure-record': { layer: 'structure', category: 'record' },
    'structure-dashboard': { layer: 'structure', category: 'dashboard' },
    'structure-feedback': { layer: 'structure', category: 'feedback' },
    'structure-shell': { layer: 'structure', category: 'shell' },
    'surface-admin': { layer: 'surface', category: 'admin' },
    'surface-data': { layer: 'surface', category: 'data' },
    'surface-experience': { layer: 'surface', category: 'experience' },
    'surface-forms': { layer: 'surface', category: 'forms' },
    'surface-operations': { layer: 'surface', category: 'operations' },
    'surface-workspace': { layer: 'surface', category: 'workspace' },
  };
  const cohortStem = (label) => label.replace(/-\d+$/, '');
  const countRows = ({ layer, category, rowFilter }) =>
    (inventory?.rows ?? []).filter(
      (row) =>
        row.layer === layer &&
        (category === undefined || row.category === category) &&
        (rowFilter === undefined || rowFilter(row)),
    ).length;
  const describeBinding = (binding) => binding.describe ?? `${binding.layer}/${binding.category ?? '*'}`;
  const ROUND_COHORT_LAYERS = {
    R2: ['primitive'],
    R3: ['pattern', 'chart'],
    R4: ['structure', 'surface'],
  };
  for (const [roundId, allowedLayers] of Object.entries(ROUND_COHORT_LAYERS)) {
    for (const label of (checkpointPolicy?.roundCohorts?.[roundId] ?? []).flat()) {
      const binding = GOVERNED_COHORT_CATEGORIES[cohortStem(label)];
      if (!binding) {
        errors.push(
          `${roundId} cohort label ${label} has no inventory category binding; every R2/R3/R4 label must be governed`,
        );
        continue;
      }
      if (!allowedLayers.includes(binding.layer)) {
        errors.push(
          `${roundId} cohort label ${label} is a ${binding.layer} family but ${roundId} may only carry ${allowedLayers.join('+')} families`,
        );
      }
    }
  }
  for (const roundId of ['R2', 'R3', 'R4', 'R7']) {
    for (const label of (checkpointPolicy?.roundCohorts?.[roundId] ?? []).flat()) {
      const binding = GOVERNED_COHORT_CATEGORIES[cohortStem(label)];
      if (!binding) continue;
      const declared = Number(label.match(/-(\d+)$/)?.[1]);
      const actual = countRows(binding);
      if (declared !== actual) {
        errors.push(
          `${roundId} cohort label ${label} claims ${declared} families but the inventory holds ${actual} in ${describeBinding(binding)}`,
        );
      }
    }
  }
  const r7CohortLabels = (checkpointPolicy?.roundCohorts?.R7 ?? []).flat();
  const certifiedFamilyCohortLabels = ['R2', 'R3', 'R4'].flatMap(
    (roundId) => (checkpointPolicy?.roundCohorts?.[roundId] ?? []).flat(),
  );
  if (new Set(r7CohortLabels).size !== r7CohortLabels.length) {
    errors.push('R7 checkpoint cohorts must be unique');
  }
  const partitionOf = (cohorts) => JSON.stringify(cohorts ?? []);
  const certifiedFamilyCohorts = ['R2', 'R3', 'R4'].flatMap(
    (roundId) => checkpointPolicy?.roundCohorts?.[roundId] ?? [],
  );
  if ([...r7CohortLabels].sort().join(',') !== [...certifiedFamilyCohortLabels].sort().join(',')) {
    errors.push('R7 checkpoint cohorts must replay the exact R2-R4 family cohort catalog');
  } else if (partitionOf(checkpointPolicy?.roundCohorts?.R7) !== partitionOf(certifiedFamilyCohorts)) {
    errors.push(
      `R7 must replay the R2-R4 checkpoint cadence exactly: ${(checkpointPolicy?.roundCohorts?.R7 ?? []).length} cohorts against ${certifiedFamilyCohorts.length}`,
    );
  }
  const r1CohortLabels = (checkpointPolicy?.roundCohorts?.R1 ?? []).flat();
  if (new Set(r1CohortLabels).size !== r1CohortLabels.length) {
    errors.push('R1 reference canaries must be unique; a repeated canary silently drops a family');
  }
  const r1ScopeFamilies = rounds?.rounds?.find((round) => round.id === 'R1')?.scope?.families;
  if (!Array.isArray(r1ScopeFamilies) || r1ScopeFamilies.length !== expectedCheckpointTotals.R1) {
    errors.push(
      `R1 scope must name exactly ${expectedCheckpointTotals.R1} reference families but names ${Array.isArray(r1ScopeFamilies) ? r1ScopeFamilies.length : 'none'}`,
    );
  } else if ([...r1ScopeFamilies].sort().join(',') !== [...r1CohortLabels].sort().join(',')) {
    errors.push('R1 scope families and R1 checkpoint cohorts must name the same reference canaries');
  }

  const roundIds = rounds?.rounds?.map((round) => round.id) ?? [];
  if (roundIds.join(',') !== 'R0,R1,R2,R3,R4,R5,R6,R7') {
    errors.push('round contracts must be exactly R0..R7 in order');
  }
  const r2 = rounds?.rounds?.find((round) => round.id === 'R2');
  const r1 = rounds?.rounds?.find((round) => round.id === 'R1');
  const r3 = rounds?.rounds?.find((round) => round.id === 'R3');
  const r4 = rounds?.rounds?.find((round) => round.id === 'R4');
  const r7 = rounds?.rounds?.find((round) => round.id === 'R7');
  const r6 = rounds?.rounds?.find((round) => round.id === 'R6');
  for (const round of rounds?.rounds ?? []) {
    if (round.id === 'R7' && round.enabled !== false) {
      errors.push('R7 round must remain disabled');
    }
    if (round.id !== 'R7' && round.enabled !== true) {
      errors.push(`${round.id} must remain enabled inside the authorized R0-R6 scope`);
    }
  }
  if (r2?.scope?.primitives !== EXPECTED_COUNTS.primitive) {
    errors.push(`R2 must cover ${EXPECTED_COUNTS.primitive} primitives`);
  }
  if (r1?.scope?.referenceLab !== '/probe/ds-reference') {
    errors.push('R1 must execute through the canonical DS reference lab');
  }
  if (!r1?.scope?.referenceLabLaw?.includes('zero app-bithire')) {
    errors.push('R1 reference lab must explicitly exclude product application dependencies');
  }
  if (rounds?.roundBoundary?.checkpointPolicyAuthority !== 'visual-craft-contract.json#checkpointPolicy') {
    errors.push('round boundaries must consume the visual craft checkpoint policy');
  }
  for (const [roundId, round, axes] of [
    ['R3', r3, { patterns: EXPECTED_COUNTS.pattern, charts: EXPECTED_COUNTS.chart }],
    ['R4', r4, { structures: EXPECTED_COUNTS.structure, pageSurfaces: EXPECTED_COUNTS.surface }],
  ]) {
    for (const [axis, expected] of Object.entries(axes)) {
      if (round?.scope?.[axis] !== expected) {
        errors.push(`${roundId} scope ${axis} is ${round?.scope?.[axis]} but the inventory holds ${expected}`);
      }
    }
  }
  for (const forbidden of ['surfaceCompositions', 'commercialKit']) {
    if (r4?.scope?.[forbidden] !== undefined) {
      errors.push(`R4 scope key ${forbidden} names a forbidden layer and must be removed`);
    }
  }
  for (const [roundId, round, law] of [
    ['R0', rounds?.rounds?.find((round) => round.id === 'R0'), 'certify'],
    ['R5', rounds?.rounds?.find((round) => round.id === 'R5'), 'sweep'],
    ['R6', rounds?.rounds?.find((round) => round.id === 'R6'), 'freeze'],
    ['R7', r7, 'disposition'],
  ]) {
    if (round?.scope?.families !== EXPECTED_FAMILY_TOTAL) {
      errors.push(
        `${roundId} must ${law} all ${EXPECTED_FAMILY_TOTAL} certified families but its scope says ${round?.scope?.families}`,
      );
    }
  }
  if (r7?.scope?.recipeGroups?.current !== 6 || r7?.scope?.recipeGroups?.target !== 14) {
    errors.push('R7 must expand the six current recipe families into fourteen target groups');
  }
  if (!r7?.entry?.some((entry) => entry.includes('R6') && entry.includes('Codex-accepted'))) {
    errors.push('R7 entry must require a Codex-accepted R6 frozen baseline');
  }
  if (!r7?.benchmarkPolicy?.authorityLaw?.includes('existing Rottay')) {
    errors.push('R7 references must preserve existing Rottay semantic authority');
  }
  if (!r7?.benchmarkPolicy?.codeReuseLaw?.includes('no wholesale')) {
    errors.push('R7 benchmark policy must prohibit wholesale external copying');
  }
  if ((r7?.benchmarkPolicy?.references?.length ?? 0) < 6) {
    errors.push('R7 must benchmark the complete named reference cohort');
  }
  if (r7?.scope?.referencePostures !== 5) {
    errors.push('R7 must prove five coherent reference postures');
  }
  if (
    !r7?.objectives?.some((entry) => entry.includes('six non-color axes')) ||
    !r7?.exit?.some((entry) => entry.includes('six-non-color-axis'))
  ) {
    errors.push('R7 pairwise tenant posture evidence must retain six non-color axes');
  }
  if (
    !r7?.objectives?.some((entry) => entry.includes('static BrandTheme') && entry.includes('DB TenantTheme')) ||
    !r7?.exit?.some((entry) => entry.includes('static DB') && entry.includes('exact-restore'))
  ) {
    errors.push('R7 must require static DB parity and exact restore');
  }
  if (!r7?.exit?.some((entry) => entry.includes('14-of-14'))) {
    errors.push('R7 exit must require fourteen productive recipe groups');
  }
  if (!r7?.exit?.some((entry) => entry.includes('dormant public') && entry.includes('0'))) {
    errors.push('R7 exit must drive dormant public customization channels to zero');
  }
  if (!r7?.objectives?.some((entry) => entry.includes('evidence sealer') && entry.includes('R0 constants'))) {
    errors.push('R7 must generalize the R0-only evidence sealer before certification');
  }
  if (r6?.exit?.some((entry) => entry.includes('push')) && !r6.exit.some((entry) => entry.includes('never pushes'))) {
    errors.push('R6 must preserve the program-wide never-push law');
  }
  if (!program?.invariants?.some((entry) => entry.includes('never pushes'))) {
    errors.push('the Modern rescue program must never push');
  }

  // Note: orchestration model-routing checks from HEAD are intentionally
  // superseded by the T-1 constitutional role checks in collectContractFailures,
  // because agent-orchestration.json was rewritten to fix exact roles and
  // disable ungoverned Opus/Sonnet routing for this programme. The single
  // admitted mention is the governed live implementer pool name.

  // P1-1 orchestration mechanics guards (live fields in agent-orchestration.json)
  if (orchestration) {
    if (orchestration.schemaVersion !== 2) {
      errors.push('agent orchestration schema must remain v2 with model routing');
    }
    if (typeof orchestration.graph?.agentCount === 'number') {
      errors.push('agent count must be dynamic, never a fixed number');
    }
    if (orchestration.graph?.integratorBatchRecalculationRequired !== true) {
      errors.push('integrator batch recalculation must be required after every integration batch');
    }
    const efficiency = orchestration.efficiency ?? [];
    const hasUsefulComments = efficiency.some((entry) => /comment/i.test(entry));
    const hasStructuredReceipt = efficiency.some((entry) =>
      /structured.*receipt|structured family receipt/i.test(entry),
    );
    if (!hasUsefulComments || !hasStructuredReceipt) {
      errors.push('agent efficiency must require useful comments and structured receipts');
    }
    if (orchestration.laneTypes?.['architecture-integrator']?.singleton !== true) {
      errors.push('architecture-integrator must remain a singleton lane class');
    }
    if (orchestration.laneTypes?.['quality-integrator']?.singleton !== true) {
      errors.push('quality-integrator must remain a singleton lane class');
    }
    if ((orchestration.reservedPaths?.length ?? 0) < 10) {
      errors.push('reservedPaths must contain at least 10 entries');
    }
    if (orchestration.workOrderAdmission?.requiredBeforeWrite !== true) {
      errors.push('workOrderAdmission.requiredBeforeWrite must block writes');
    }
    const r7mb = orchestration.r7Execution?.machineBudget ?? {};
    if (r7mb.heavyBuildOrTest !== 1 || r7mb.server !== 1 || r7mb.chromium !== 1) {
      errors.push('R7 machine budget must allow exactly one heavy process, one server and one chromium');
    }
    if (!orchestration.r7Execution?.longIterationLaw?.includes('MAIN')) {
      errors.push('R7 MAIN must run long checkpoint-sized iterations');
    }
  }

  for (const required of ['sourceDigest', 'artifactSha256', 'negativeDrill', 'producer']) {
    if (!evidence?.receiptRequiredFields?.includes(required)) {
      errors.push(`evidence receipt must require ${required}`);
    }
  }
  if (evidence?.schemaVersion !== 2) {
    errors.push('evidence contract schema must remain v2 with visual checkpoints');
  }
  if (!evidence?.checkpointEvidenceLaw?.includes('explicit DT GO')) {
    errors.push('checkpoint evidence must require explicit DT GO before writes');
  }
  for (const field of [
    'checkpointId',
    'beforeAfterCapturePairs',
    'hardVisualVetoResults',
    'mechanicalFloorResults',
    'tenantPaletteAndGrammarResult',
    'cssOwnershipAndCausalityReceipts',
    'codexDecision',
    'nextWriteBoundary',
  ]) {
    if (!evidence?.checkpointRequiredFields?.includes(field)) {
      errors.push(`visual checkpoint must require ${field}`);
    }
  }
  if (evidence?.roundMaximumClaim !== 'IMPLEMENTED_PENDING_CODEX_AUDIT') {
    errors.push('round maximum claim must remain pending Codex audit');
  }
  const evidenceRounds = Object.keys(evidence?.minimumReliableEvidenceByRound ?? {}).join(',');
  if (evidenceRounds !== 'R0,R1,R2,R3,R4,R5,R6,R7') {
    errors.push('minimum reliable evidence must be declared for every round R0..R7');
  }
  if (!evidence?.minimumReliableEvidenceByRound?.R0?.includes('no captures')) {
    errors.push('R0 evidence must remain capture-free');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Composed validator
// ---------------------------------------------------------------------------

export function validateModernRescueContracts(
  contracts,
  { includeManifestGate = true } = {},
) {
  const failures = [];

  failures.push(...collectTextualFailures());
  failures.push(...collectContractFailures(contracts));
  failures.push(...collectHistoricalContractFailures(contracts));

  /*
   * CELDA GOBERNADA -- ninguna de las 5100 celdas puede quedar sin ley.
   *
   * Una celda es la interseccion de un control y una familia: la pregunta
   * "¿este control alcanza a esta familia, y por donde?". Estar gobernada
   * significa que alguien ya contesto esa pregunta, de una de tres formas, y
   * las tres son respuestas legitimas:
   *
   *   (a) `internalChannels` no vacio -- el mecanismo esta declarado: por que
   *       socket viaja, quien lo produce, quien lo consume.
   *   (b) `targetBinding` con `status` declarado o con `uncoveredByDesign` --
   *       la ley esta escrita aunque el mecanismo no exista todavia
   *       (MUST_NOT_REACH, ESCAPE_HATCH, NO_CSS_CHANNEL y las prescripciones
   *       de fase 3 son adjudicaciones, no deuda).
   *   (c) `migratedToInternalChannels === true` -- la celda fue revisada y
   *       adjudicada aunque no le corresponda fila (consumo por canal
   *       compartido, dueño cruzado, sin socket propio).
   *
   * Una celda que no cumple ninguna es una celda PELADA: nadie dijo nunca si
   * ese control llega o no llega ahi. Eso es lo que este chequeo refuta.
   *
   * POR QUE ESTO NO LO CUBRIA NADA. `validateInternalChannels`
   * (manifest/rules/index.mjs) dice de si misma: "internalChannels is REQUIRED
   * at IMPLEMENTED+ and OPTIONAL below it". Es decir: por debajo de
   * IMPLEMENTED, una celda podia no declarar nada y nadie se enteraba. Esta
   * regla cubre el resto del espectro sin tocar esa: alli donde la fila es
   * opcional, exige al menos ley escrita o adjudicacion.
   *
   * POR QUE `targetBinding` NO SE BORRA (adjudicacion del coordinador, que
   * corrige el "borrar targetBinding" del plan original). `targetBinding` es
   * el PORTADOR DE LA LEY POR CELDA: es donde vive el `status`, la evidencia
   * `uncoveredByDesign` y la marca de adjudicacion. Borrarlo en masa dejaria
   * 3.628 celdas -- las que hoy no tienen fila -- sin una sola razon escrita,
   * y este chequeo las reportaria peladas a todas. Solo puede desaparecer de
   * una celda el dia que su ley este re-expresada en otro portador; nunca
   * antes, y nunca en masa.
   */
  /** Vocabulario cerrado de `targetBinding.status`, medido sobre el arbol. */
  const GOVERNED_CELL_STATUSES = [
    'MUST_REACH',
    'MUST_NOT_REACH',
    'ESCAPE_HATCH',
    'OVERLAY_OF_ROOTS',
    'NO_CSS_CHANNEL',
  ];
  const familiesRoot = join(repoRoot, MANIFEST_DIR, 'families');
  if (existsSync(familiesRoot)) {
    const bare = [];
    let cellsSeen = 0;
    const walkGoverned = (dir, prefix) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          walkGoverned(join(dir, entry.name), rel);
          continue;
        }
        if (!entry.name.endsWith('.json')) continue;
        const familyId = rel.replace(/\.json$/u, '');
        const doc = readJson(join(MANIFEST_DIR, 'families', rel));
        for (const cell of doc?.themeControls ?? []) {
          cellsSeen += 1;
          const binding = cell?.targetBinding;
          const hasRows = Array.isArray(cell?.internalChannels) && cell.internalChannels.length > 0;
          const status = binding?.status;
          const hasStatus = status !== undefined && status !== null;
          // El vocabulario de `status` es cerrado (correccion F3 de la auditoria
          // Fable). Antes cualquier cadena no-nula contaba como ley escrita, asi
          // que un typo -- `MUST_NOT_REACHX` -- sacaba la celda de todas las
          // particiones por status EN SILENCIO, y solo lo frenaba la frescura del
          // indice hasta la siguiente regeneracion legitima. Los cinco valores
          // son el vocabulario vivo medido: 449 / 2424 / 255 / 255 / 255.
          if (hasStatus && !GOVERNED_CELL_STATUSES.includes(status)) {
            failures.push(
              `governed-cell: ${familyId}#${cell?.controlId ?? '<unnamed>'} declares targetBinding.status ` +
                `${JSON.stringify(status)}, which is not one of ${GOVERNED_CELL_STATUSES.join(' | ')}`,
            );
          }
          const hasWrittenLaw =
            !!binding && (hasStatus && GOVERNED_CELL_STATUSES.includes(status)
              ? true
              : binding.uncoveredByDesign !== undefined && binding.uncoveredByDesign !== null);
          const isAdjudicated = binding?.migratedToInternalChannels === true;
          if (!hasRows && !hasWrittenLaw && !isAdjudicated) {
            bare.push(`${familyId}#${cell?.controlId ?? '<unnamed>'}`);
          }
        }
      }
    };
    walkGoverned(familiesRoot, '');
    // Un recorrido que ve MENOS celdas de las que el manifiesto dice tener no
    // esta limpio: esta roto, y reporta cero peladas exactamente igual que un
    // arbol sano. El denominador lo publica el propio indice, asi que la guarda
    // se mide contra la fuente y no contra un numero pegado aqui.
    const declaredCells = readJson(join(MANIFEST_DIR, 'index.json'))?.denominators?.controlFamilyCells;
    // Fail-closed (correccion F6 de la auditoria Fable): antes, si el generador
    // dejaba de emitir `controlFamilyCells` -- o lo emitia como cadena -- el piso
    // se apagaba EN SILENCIO con el indice fresco. Un piso que se puede desactivar
    // desde el productor que vigila no es un piso.
    if (typeof declaredCells !== 'number') {
      failures.push(
        'governed-cell: manifest/index.json does not publish a numeric ' +
          `denominators.controlFamilyCells (got ${JSON.stringify(declaredCells ?? null)}); the walk floor ` +
          'cannot be checked and must not be skipped',
      );
    } else if (cellsSeen !== declaredCells) {
      failures.push(
        `governed-cell: the walk saw ${cellsSeen} cells but manifest/index.json declares ` +
          `${declaredCells}: a walk that misses cells reports zero bare ones exactly like a clean tree`,
      );
    }
    for (const id of bare.slice(0, 20)) {
      failures.push(
        `governed-cell: ${id} is bare -- no internalChannels, no targetBinding.status, ` +
          'no uncoveredByDesign and no migratedToInternalChannels: nobody ever said whether this ' +
          'control reaches this family',
      );
    }
    if (bare.length > 20) {
      failures.push(`governed-cell: ${bare.length - 20} more bare cells not listed`);
    }
  }


  if (includeManifestGate) {
    try {
      const manifestErrors = validateCustomizationManifest();
      failures.push(...manifestErrors);
    } catch (error) {
      failures.push(`manifest deep gate threw: ${error.message}`);
    }
  }

  return failures;
}

function main() {
  const contracts = readModernRescueContracts();
  const failures = validateModernRescueContracts(contracts);

  if (failures.length > 0) {
    console.error('BLOCKED — constitution drift detected:');
    for (const f of failures) console.error(`  • ${f}`);
    process.exit(1);
  }

  console.log('CONSTITUTION_READY');
  process.exit(0);
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main();
}
