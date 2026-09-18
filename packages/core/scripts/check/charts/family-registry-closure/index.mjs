#!/usr/bin/env node
/**
 * chart-family-registry-closure — six lists, one row set.
 *
 * The eighteen chart families are described in six places and none was
 * derived from another: the `families/` folder set, the `families/` barrel,
 * the charts barrel, the public facade, the showroom registry and the
 * `family-cut` roster. Adding a nineteenth family meant remembering six
 * edits, and forgetting one was invisible. The typed registry is the row set;
 * this gate is what makes the other lists projections of it.
 *
 * Each arm carries an explicit disposition, so what is NOT being enforced is
 * printed by name rather than implied by silence:
 *
 *   ENFORCED  a divergence exits 1 under --check.
 *   OWED      measured and printed every run, not yet blocking, with the work
 *             order that closes it named in the arm's own reason.
 *   SKIPPED   an input this checkout does not carry. Never silent: a skipped
 *             arm prints the path it wanted, so a gate that measures nothing
 *             cannot look like a gate that passed.
 *
 * The showroom's route slugs are not the folder ids for three families
 * (`heat-map`, `tree-map`, `calendar-heat-map` publish `heatmap`, `treemap`,
 * `calendar-heatmap`) and ARE the folder ids for the rest, including
 * `funnel-chart`, whose namespace is `ds-chart-funnel`. Neither projection is
 * total, so the arm asserts the honest property: a BIJECTION where each row
 * claims exactly one showroom entry through its id or its namespace suffix,
 * and no entry is left unclaimed.
 *
 * Usage:
 *   node scripts/check/charts/family-registry-closure/index.mjs           # report
 *   node scripts/check/charts/family-registry-closure/index.mjs --check   # exit 1
 *   node scripts/check/charts/family-registry-closure/index.mjs --json
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = findPackageRoot(here);

const CHARTS = join(root, 'src/components/patterns/visualization/charts');

export const PATHS = Object.freeze({
  registry: join(CHARTS, 'foundation/registry/index.ts'),
  familiesDir: join(CHARTS, 'families'),
  familiesBarrel: join(CHARTS, 'families/index.ts'),
  chartsBarrel: join(CHARTS, 'index.ts'),
  publicFacade: join(root, 'src/entrypoints/public/patterns/charts/index.ts'),
  skinDir: join(root, 'src/foundation/tokens/css/presentation/components/skin'),
  showroomRegistry: join(root, '../showroom/src/data/registry/charts.ts'),
  familyCutBaseline: join(root, 'scripts/check/family-cut/baseline/index.json'),
});

export const DISPOSITIONS = Object.freeze({
  ENFORCED: 'ENFORCED',
  OWED: 'OWED',
  SKIPPED: 'SKIPPED',
});

/* ------------------------------------------------------------------ */
/* Readers                                                             */
/* ------------------------------------------------------------------ */

function parse(source, fileName) {
  return ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

/**
 * Read `CHART_FAMILY_REGISTRY` from source. The gate parses rather than
 * imports so it runs on a clean checkout with no build and no transpiler.
 */
export function readRegistry(source) {
  const sourceFile = parse(source, 'registry.ts');
  const rows = {};
  const visit = (node) => {
    if (
      ts.isVariableDeclaration(node)
      && ts.isIdentifier(node.name)
      && node.name.text === 'CHART_FAMILY_REGISTRY'
      && node.initializer
    ) {
      let literal = node.initializer;
      while (ts.isCallExpression(literal) && literal.arguments.length > 0) {
        literal = literal.arguments[0];
      }
      if (ts.isObjectLiteralExpression(literal)) {
        for (const property of literal.properties) {
          if (!ts.isPropertyAssignment(property)) continue;
          const id = ts.isIdentifier(property.name) || ts.isStringLiteralLike(property.name)
            ? property.name.text
            : null;
          if (!id) continue;
          rows[id] = { id, namespace: namespaceOf(property.initializer) };
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(sourceFile, visit);
  return rows;
}

/** The first `ds-chart-*` string argument of a row constructor. */
function namespaceOf(initializer) {
  let namespace = null;
  const visit = (node) => {
    if (namespace) return;
    if (ts.isStringLiteralLike(node) && node.text.startsWith('ds-chart-')) {
      namespace = node.text;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(initializer);
  return namespace;
}

/** `export { AreaChart } from './area-chart';` -> { 'area-chart': 'AreaChart' }. */
export function readFamiliesBarrel(source) {
  const sourceFile = parse(source, 'families.ts');
  const byId = {};
  for (const statement of sourceFile.statements) {
    if (!ts.isExportDeclaration(statement)) continue;
    if (statement.isTypeOnly) continue;
    const specifier = statement.moduleSpecifier;
    if (!specifier || !ts.isStringLiteralLike(specifier)) continue;
    const id = specifier.text.replace(/^\.\//u, '');
    const clause = statement.exportClause;
    if (!clause || !ts.isNamedExports(clause)) continue;
    for (const element of clause.elements) {
      if (element.isTypeOnly) continue;
      (byId[id] ??= []).push(element.name.text);
    }
  }
  return byId;
}

/** Every non-type-only exported name, whatever it is re-exported from. */
export function readExportedNames(source, fileName) {
  const sourceFile = parse(source, fileName);
  const names = new Set();
  for (const statement of sourceFile.statements) {
    if (!ts.isExportDeclaration(statement) || statement.isTypeOnly) continue;
    const clause = statement.exportClause;
    if (!clause || !ts.isNamedExports(clause)) continue;
    for (const element of clause.elements) {
      if (element.isTypeOnly) continue;
      names.add(element.name.text);
    }
  }
  return names;
}

/** Every `.ds-chart-*` class root the skin corpus declares. */
export function readSkinNamespaces(skinDir) {
  const found = new Set();
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (full.endsWith('.css')) {
        for (const match of readFileSync(full, 'utf8').matchAll(/\.(ds-chart-[a-z0-9-]+)/gu)) {
          found.add(match[1]);
        }
      }
    }
  };
  walk(skinDir);
  return found;
}

/** The `slug` of every `ChartEntry` in the showroom registry. */
export function readShowroomSlugs(source) {
  const sourceFile = parse(source, 'showroom.ts');
  const slugs = new Set();
  const visit = (node) => {
    if (ts.isObjectLiteralExpression(node)) {
      const properties = new Map();
      for (const property of node.properties) {
        if (!ts.isPropertyAssignment(property)) continue;
        const key = ts.isIdentifier(property.name) || ts.isStringLiteralLike(property.name)
          ? property.name.text
          : null;
        if (key && ts.isStringLiteralLike(property.initializer)) {
          properties.set(key, property.initializer.text);
        }
      }
      // A chart entry is the shape that carries a slug AND a component name;
      // the family-group rows carry a slug and a label instead.
      if (properties.has('slug') && properties.has('name') && properties.has('family')) {
        slugs.add(properties.get('slug'));
      }
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(sourceFile, visit);
  return slugs;
}

/* ------------------------------------------------------------------ */
/* Arms                                                                */
/* ------------------------------------------------------------------ */

function difference(left, right) {
  return [...left].filter((value) => !right.has(value)).sort();
}

export function runGate(paths = PATHS) {
  const registrySource = readFileSync(paths.registry, 'utf8');
  const rows = readRegistry(registrySource);
  const ids = new Set(Object.keys(rows));
  const arms = [];

  const add = (name, disposition, detail, findings = [], reason = undefined) => {
    arms.push({ name, disposition, detail, findings, ...(reason ? { reason } : {}) });
  };

  /* 1. the folder set */
  const folders = new Set(
    readdirSync(paths.familiesDir).filter((entry) =>
      statSync(join(paths.familiesDir, entry)).isDirectory(),
    ),
  );
  add('families-folder', DISPOSITIONS.ENFORCED, `${folders.size} folders, ${ids.size} rows`, [
    ...difference(folders, ids).map((id) => `folder "${id}" has no registry row`),
    ...difference(ids, folders).map((id) => `row "${id}" has no families/ folder`),
  ]);

  /* 2. the families barrel, which also gives every row its component symbol */
  const barrel = readFamiliesBarrel(readFileSync(paths.familiesBarrel, 'utf8'));
  const barrelIds = new Set(Object.keys(barrel));
  const symbolFindings = [
    ...difference(barrelIds, ids).map((id) => `families/index.ts exports "${id}" with no row`),
    ...difference(ids, barrelIds).map((id) => `row "${id}" is not exported by families/index.ts`),
  ];
  const symbols = new Set();
  for (const id of ids) {
    const exported = barrel[id] ?? [];
    if (exported.length === 1) symbols.add(exported[0]);
    else if (exported.length > 1) {
      symbolFindings.push(
        `row "${id}" publishes ${exported.length} component symbols (${exported.join(', ')}); a row owns exactly one`,
      );
    }
  }
  add(
    'families-barrel',
    DISPOSITIONS.ENFORCED,
    `${barrelIds.size} exporting owners, ${symbols.size} component symbols`,
    symbolFindings,
  );

  /* 3. the charts barrel */
  const chartsExports = readExportedNames(readFileSync(paths.chartsBarrel, 'utf8'), 'charts.ts');
  add(
    'charts-barrel',
    DISPOSITIONS.ENFORCED,
    `${symbols.size} symbols expected`,
    difference(symbols, chartsExports).map(
      (symbol) => `"${symbol}" is not re-exported by the charts barrel`,
    ),
  );

  /* 4. the public facade */
  const facadeExports = readExportedNames(readFileSync(paths.publicFacade, 'utf8'), 'facade.ts');
  add(
    'public-facade',
    DISPOSITIONS.ENFORCED,
    `${facadeExports.size} facade exports`,
    [
      ...difference(symbols, facadeExports).map(
        (symbol) => `"${symbol}" is not published by the public facade`,
      ),
      ...difference(facadeExports, symbols).map(
        (symbol) => `the public facade publishes "${symbol}", which owns no registry row`,
      ),
    ],
  );

  /* 5. the skin namespaces */
  const skinRoots = readSkinNamespaces(paths.skinDir);
  add(
    'skin-namespace',
    DISPOSITIONS.ENFORCED,
    `${skinRoots.size} ds-chart-* roots in the skin corpus`,
    [...ids]
      .sort()
      .filter((id) => !skinRoots.has(rows[id].namespace))
      .map((id) => `row "${id}" declares namespace "${rows[id].namespace}", which no skin declares`),
  );

  /* 6. the showroom registry */
  if (existsSync(paths.showroomRegistry)) {
    const slugs = readShowroomSlugs(readFileSync(paths.showroomRegistry, 'utf8'));
    const claimed = new Set();
    const findings = [];
    for (const id of [...ids].sort()) {
      const namespaceSuffix = (rows[id].namespace ?? '').replace(/^ds-chart-/u, '');
      const candidates = [id, namespaceSuffix].filter((value) => slugs.has(value));
      if (candidates.length === 0) {
        findings.push(
          `row "${id}" claims no showroom entry (tried "${id}" and "${namespaceSuffix}")`,
        );
        continue;
      }
      if (candidates.length > 1 && candidates[0] !== candidates[1]) {
        findings.push(`row "${id}" claims two showroom entries (${candidates.join(', ')})`);
        continue;
      }
      claimed.add(candidates[0]);
    }
    for (const slug of difference(slugs, claimed)) {
      findings.push(`showroom entry "${slug}" is claimed by no registry row`);
    }
    add('showroom-registry', DISPOSITIONS.ENFORCED, `${slugs.size} showroom entries`, findings);
  } else {
    add(
      'showroom-registry',
      DISPOSITIONS.SKIPPED,
      `not in this checkout: ${paths.showroomRegistry}`,
      [],
      'The showroom package is a sibling workspace; a checkout without it measures nothing here.',
    );
  }

  /* 7. the family-cut roster */
  const cutBaseline = JSON.parse(readFileSync(paths.familyCutBaseline, 'utf8'));
  const roster = new Set(Object.keys(cutBaseline.families ?? {}));
  const missingFromRoster = [...ids].sort().filter((id) => !roster.has(id));
  add(
    'family-cut-roster',
    DISPOSITIONS.OWED,
    `${roster.size} rostered families, ${ids.size - missingFromRoster.length} of ${ids.size} chart rows present`,
    missingFromRoster.map((id) => `row "${id}" is absent from the family-cut roster`),
    'Adding a chart row needs a per-arm adjudication first: variantContract and the DnD arms'
      + ' have no meaning for an SVG mark, and the skeleton arm cannot close before WO-FAM-14.',
  );

  return { rows, symbols: [...symbols].sort(), arms };
}

export function verdict(arms) {
  const blocking = arms.filter(
    (arm) => arm.disposition === DISPOSITIONS.ENFORCED && arm.findings.length > 0,
  );
  return { blocking, ok: blocking.length === 0 };
}

function main() {
  const check = process.argv.includes('--check');
  const asJson = process.argv.includes('--json');
  const { rows, arms } = runGate();
  const { blocking, ok } = verdict(arms);

  if (asJson) {
    console.log(JSON.stringify({ rows: Object.keys(rows), arms }, null, 2));
    if (check && !ok) process.exit(1);
    return;
  }

  console.log('chart-family-registry-closure');
  console.log(`  registry rows: ${Object.keys(rows).length}`);
  for (const arm of arms) {
    console.log(`  [${arm.disposition}] ${arm.name}: ${arm.detail} -- ${arm.findings.length} finding(s)`);
    for (const finding of arm.findings) console.log(`      ${finding}`);
    if (arm.reason) console.log(`      reason: ${arm.reason}`);
  }

  if (!ok) {
    console.log(`\n  ${blocking.length} enforced arm(s) diverge from the registry.`);
    console.log('  The registry is the row set; every other list is its projection.');
    if (check) process.exit(1);
    return;
  }
  console.log('  PASS (every enforced projection agrees with the registry)');
}

const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) main();
