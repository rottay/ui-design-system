#!/usr/bin/env node
/**
 * theme-style-registry — what a published style may author, and may reach.
 *
 * THE LAW. A style owns FORM; the tenant owns BRAND. That partition is a
 * judgement, so it is declared; everything that CHECKS the judgement is a
 * measurement, so it is measured here rather than restated.
 *
 * Four questions, all mechanical:
 *
 *   1. IS THE PARTITION TOTAL? Every catalog row is classified, no row is
 *      classified twice, and no row the catalog does not have appears. A
 *      partition with a default is a partition that admits the next row in
 *      silence.
 *   2. DOES EVERY PUBLICATION AUTHOR ONLY WHAT IT MAY? Read from the style
 *      JSONs, which are the content -- not from a summary of them.
 *   3. DOES EVERY PUBLICATION CLEAR EVERY VERTICAL IT DECLARES? The envelope
 *      comparison cannot live in the contract: `contracts/theme/runtime/envelopes`
 *      is the style owner's unranked peer and a production edge to it is
 *      structural debt. So the clearance is enforced from here and from the
 *      owner's own suite, both outside that rule, plus a request-time station
 *      in the ingress. A style dial outside a vertical's range is a MEASURED
 *      functional incompatibility: the remedy is to exclude that vertical with
 *      a written D-28 reason, never to narrow the dial in silence.
 *   4. IS THE FLOOR STILL THE FLOOR? The declared non-emitting row is
 *      re-derived from the catalog's own `produces` block, in BOTH directions.
 *      The first spelling of that floor read a label and refused nothing.
 *
 * Usage:
 *   node scripts/check/theme/style-registry/index.mjs          exit 1 on any finding
 *   node scripts/check/theme/style-registry/index.mjs --json   the measurement
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import { packageRoot as findPackageRoot, repoRoot as findRepoRoot } from '../../../libraries/repo-root/index.mjs';
import { readThemeCatalog } from '../../../libraries/theme-catalog/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);
const REPO_ROOT = findRepoRoot(HERE);

export const STYLES_ROOT = 'src/contracts/theme/runtime/styles';
export const REGISTRY_DIR = `${STYLES_ROOT}/composition/registry`;
export const PARTITION_FILE = `${STYLES_ROOT}/runtime/partition/index.ts`;
export const ENVELOPES_FILE = 'src/contracts/theme/runtime/envelopes/index.ts';
export const ROSTER_FILE = 'src/foundation/contracts/kernel/verticals/index.ts';

/** The counts the partition is pinned at, so the table cannot rot in silence. */
export const EXPECTED_CLASS_COUNTS = Object.freeze({ style: 21, brand: 7, refused: 1 });

/** Which envelope range governs which authored dial, by decision and member. */
export const RANGED_DIALS = Object.freeze([
  { decision: 'motion.dial', member: 'intensity', range: 'motionIntensity', dial: 'motion.intensity' },
  { decision: 'motion.dial', member: 'durationScale', range: 'motionDurationScale', dial: 'motion.durationScale' },
  { decision: 'typography.scale', member: null, range: 'typeScale', dial: 'typography.scale' },
  { decision: 'shape.radius-scale', member: null, range: 'radiusScale', dial: 'shape.radiusScale' },
  { decision: 'surfaces.effect-intensity', member: null, range: 'effectIntensity', dial: 'surfaces.effectIntensity' },
]);

function parse(file) {
  return ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function literalOf(node, source) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map((element) => literalOf(element, source));
  }
  if (ts.isObjectLiteralExpression(node)) {
    const out = {};
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property) || !property.name) continue;
      out[property.name.getText(source).replace(/['"]/gu, '')] = literalOf(property.initializer, source);
    }
    return out;
  }
  if (ts.isAsExpression(node) || (ts.isSatisfiesExpression?.(node) ?? false)) {
    return literalOf(node.expression, source);
  }
  if (ts.isCallExpression(node) && node.arguments.length === 1) {
    return literalOf(node.arguments[0], source);
  }
  if (ts.isSpreadElement?.(node)) return undefined;
  return undefined;
}

/** The declared partition and the declared non-emitting list, off the AST. */
export function readPartition(coreRoot = CORE_ROOT) {
  const file = join(coreRoot, PARTITION_FILE);
  if (!existsSync(file)) return { classes: {}, nonEmitting: [] };
  const source = parse(file);
  let classes = {};
  let nonEmitting = [];
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      if (node.name.text === 'THEME_STYLE_CLASS_BY_DECISION') {
        classes = literalOf(node.initializer, source) ?? {};
      }
      if (node.name.text === 'THEME_STYLE_NON_EMITTING_DECISIONS') {
        nonEmitting = literalOf(node.initializer, source) ?? [];
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return { classes, nonEmitting };
}

/** The vertical envelopes, off the AST: ranges and the anatomy gate. */
export function readEnvelopes(coreRoot = CORE_ROOT) {
  const file = join(coreRoot, ENVELOPES_FILE);
  if (!existsSync(file)) return {};
  const source = parse(file);
  let envelopes = {};
  const visit = (node) => {
    if (
      ts.isVariableDeclaration(node)
      && ts.isIdentifier(node.name)
      && node.name.text === 'TENANT_THEME_VERTICAL_ENVELOPES'
      && node.initializer
    ) {
      envelopes = literalOf(node.initializer, source) ?? {};
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return envelopes;
}

/**
 * The first-party roster, off the AST. The exclusion set is the roster minus a
 * publication's `verticals`, so this gate must read the SAME roster the
 * contract refuses against -- reading the envelope keys instead would let a
 * vertical whose envelope went missing drop out of both readers in silence.
 */
export function readFirstPartyRoster(coreRoot = CORE_ROOT) {
  const file = join(coreRoot, ROSTER_FILE);
  if (!existsSync(file)) return [];
  const source = parse(file);
  let roster = [];
  const visit = (node) => {
    if (
      ts.isVariableDeclaration(node)
      && ts.isIdentifier(node.name)
      && node.name.text === 'FIRST_PARTY_VERTICAL_SLUGS'
      && node.initializer
    ) {
      roster = (literalOf(node.initializer, source) ?? []).filter((slug) => typeof slug === 'string');
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return roster;
}

/** Every publication, read from the JSON that IS the content. */
export function readPublications(coreRoot = CORE_ROOT) {
  const root = join(coreRoot, REGISTRY_DIR);
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const documentPath = join(root, entry.name, 'document/index.json');
      const manifestPath = join(root, entry.name, 'manifest/index.json');
      if (!existsSync(documentPath) || !existsSync(manifestPath)) {
        return { folder: entry.name, incomplete: true };
      }
      return {
        folder: entry.name,
        documentPath,
        document: JSON.parse(readFileSync(documentPath, 'utf8')),
        manifest: JSON.parse(readFileSync(manifestPath, 'utf8')),
      };
    });
}

function dialValue(decisions, entry) {
  const authored = decisions[entry.decision];
  if (authored === undefined) return undefined;
  if (entry.member === null) return authored;
  if (authored === null || typeof authored !== 'object') return undefined;
  return authored[entry.member];
}

export function measure({ coreRoot = CORE_ROOT, repoRoot = REPO_ROOT } = {}) {
  const findings = [];
  const catalog = readThemeCatalog(join(coreRoot, 'src/contracts/theme/runtime/catalog/index.ts'));
  const catalogIds = catalog.map((row) => row.id);
  const { classes, nonEmitting } = readPartition(coreRoot);
  const envelopes = readEnvelopes(coreRoot);
  const roster = readFirstPartyRoster(coreRoot);
  const publications = readPublications(coreRoot);
  if (roster.length === 0) {
    findings.push({
      rule: 'ROSTER_UNREADABLE',
      where: ROSTER_FILE,
      detail: 'FIRST_PARTY_VERTICAL_SLUGS did not read as a list of slugs; with no roster the exclusion set is '
        + 'empty and the D-28 reason law below refuses nothing',
    });
  }

  // 1. The partition is total, and pinned.
  for (const id of catalogIds) {
    if (classes[id] === undefined) {
      findings.push({
        rule: 'PARTITION_ROW_UNCLASSIFIED',
        where: PARTITION_FILE,
        detail: `${id} is a catalog row the style partition does not classify; a partition with a default admits `
          + 'the next row in silence',
      });
    }
  }
  for (const id of Object.keys(classes)) {
    if (!catalogIds.includes(id)) {
      findings.push({
        rule: 'PARTITION_ROW_UNKNOWN',
        where: PARTITION_FILE,
        detail: `${id} is classified by the style partition but is not a catalog row`,
      });
    }
  }
  const counts = {};
  for (const value of Object.values(classes)) counts[value] = (counts[value] ?? 0) + 1;
  for (const [cls, expected] of Object.entries(EXPECTED_CLASS_COUNTS)) {
    if ((counts[cls] ?? 0) !== expected) {
      findings.push({
        rule: 'PARTITION_COUNT_MOVED',
        where: PARTITION_FILE,
        detail: `the partition declares ${counts[cls] ?? 0} ${cls} row(s); the reviewed count is ${expected}. `
          + 'Moving a row between classes is a decision, not a refactor',
      });
    }
  }

  // 4. The floor is re-derived from the catalog's own reach, in both directions.
  const measuredNonEmitting = catalog
    .filter((row) => (row.produces?.channels ?? []).length === 0 && (row.produces?.rootAttributes ?? []).length === 0)
    .map((row) => row.id);
  const declaredFloor = [...nonEmitting].sort().join(',');
  if (measuredNonEmitting.slice().sort().join(',') !== declaredFloor) {
    findings.push({
      rule: 'NON_EMITTING_LIST_DRIFTED',
      where: PARTITION_FILE,
      detail: `the declared non-emitting rows are [${nonEmitting.join(', ')}] but the catalog measures `
        + `[${measuredNonEmitting.join(', ')}]; the floor reads REACH, and a floor that reads a stale list `
        + 'refuses nothing',
    });
  }

  // 2 and 3. Every publication, against the partition and the envelopes.
  for (const publication of publications) {
    if (publication.incomplete) {
      findings.push({
        rule: 'PUBLICATION_INCOMPLETE',
        where: `${REGISTRY_DIR}/${publication.folder}`,
        detail: 'a style folder carries no document/index.json and manifest/index.json pair',
      });
      continue;
    }
    const where = relative(repoRoot, publication.documentPath);
    const { manifest } = publication;
    const decisions = publication.document.decisions ?? {};
    const rows = Object.keys(decisions);

    for (const id of rows) {
      const cls = classes[id];
      if (cls === 'style') continue;
      findings.push({
        rule: 'STYLE_AUTHORS_FORBIDDEN_ROW',
        where,
        detail: `style "${manifest.id}" authors ${id}, which the partition classifies as ${cls ?? 'unclassified'}; `
          + 'a style owns form, the tenant owns brand',
      });
    }

    if (rows.every((id) => nonEmitting.includes(id))) {
      findings.push({
        rule: 'STYLE_EMITS_NOTHING',
        where,
        detail: `style "${manifest.id}" authors no row that emits a channel or a root attribute`,
      });
    }

    const declared = manifest.verticals === 'all' ? Object.keys(envelopes) : manifest.verticals ?? [];
    for (const verticalKey of declared) {
      const envelope = envelopes[verticalKey];
      if (!envelope) {
        findings.push({
          rule: 'STYLE_DECLARES_UNKNOWN_VERTICAL',
          where,
          detail: `style "${manifest.id}" declares ${verticalKey}, which has no registered envelope`,
        });
        continue;
      }
      for (const entry of RANGED_DIALS) {
        const value = dialValue(decisions, entry);
        if (typeof value !== 'number') continue;
        const range = envelope.ranges?.[entry.range];
        if (!range) continue;
        if (value >= range.min && value <= range.max) continue;
        findings.push({
          rule: 'STYLE_DIAL_OUTSIDE_ENVELOPE',
          where,
          detail: `style "${manifest.id}" sets ${entry.dial} ${value}, outside the ${verticalKey} envelope `
            + `[${range.min}, ${range.max}]; narrow the dial or exclude the vertical with a written D-28 reason`,
        });
      }
      const anatomy = decisions['chrome.anatomy'];
      if (anatomy && typeof anatomy === 'object' && envelope.advanced?.allowAnatomyVariants === false) {
        for (const [family, value] of Object.entries(anatomy)) {
          if (value === 'default' || value === undefined) continue;
          findings.push({
            rule: 'STYLE_ANATOMY_FORBIDDEN',
            where,
            detail: `style "${manifest.id}" sets chrome.anatomy.${family} "${value}", but the ${verticalKey} `
              + 'envelope sets allowAnatomyVariants false',
          });
        }
      }
    }

    if (manifest.verticals !== 'all') {
      // `declared` is who is ADMITTED; the D-28 reason is owed by the roster
      // minus that list, keyed by the excluded vertical, which is the key the
      // request-time refusal reads back.
      const admitted = new Set(declared);
      for (const verticalKey of roster) {
        if (admitted.has(verticalKey)) continue;
        const reason = manifest.exclusionReasons?.[verticalKey];
        if (typeof reason === 'string' && reason.length > 0) continue;
        findings.push({
          rule: 'EXCLUSION_WITHOUT_REASON',
          where,
          detail: `style "${manifest.id}" excludes ${verticalKey} without a written D-28 reason under that key; `
            + 'an exclusion is a measured incompatibility, never a convenience',
        });
      }
    }
  }

  if (publications.length === 0) {
    findings.push({
      rule: 'VACUOUS_SCAN',
      where: REGISTRY_DIR,
      detail: 'the style registry is empty — every law below it is vacuous, so the scan refuses to report a pass',
    });
  }

  return {
    catalogRows: catalogIds.length,
    classCounts: counts,
    nonEmitting,
    verticals: Object.keys(envelopes),
    publications: publications.map((publication) => publication.manifest?.id ?? publication.folder),
    findings,
  };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const result = measure();
  if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
  if (result.findings.length > 0) {
    for (const finding of result.findings) {
      console.error(`theme-style-registry FAIL — ${finding.rule} ${finding.where}\n    ${finding.detail}`);
    }
    process.exit(1);
  }
  console.log(
    `theme-style-registry OK — ${result.catalogRows} catalog rows partitioned `
    + `(${Object.entries(result.classCounts).map(([cls, count]) => `${count} ${cls}`).join(', ')}); `
    + `${result.publications.length} publication(s) clear ${result.verticals.length} vertical envelope(s)`,
  );
}
