/**
 * The gate-side reader of the typed control catalog.
 *
 * WHY IT PARSES SOURCE. `packages/core/src/contracts/theme/runtime/catalog` is
 * the single listing of what a tenant can decide (WO-CAT-02). Gates are `.mjs`
 * and cannot import TypeScript, and a generated JSON copy would be a second
 * listing with its own staleness class -- which is precisely the shape F-04
 * found five times. So the catalog is read where it is authored, with the same
 * TypeScript AST the customization-surface census already uses on the registry.
 *
 * WHAT IT RETURNS. `readThemeCatalogRecords()` yields the control view the
 * gates consume: `controlId`, `tier`, `scope`, `domain`, `ingress` and
 * `declaredOutputs`. That shape is deliberately the one the retired governance
 * control documents carried, so migrating a gate is a one-line swap and the
 * measurement it publishes is comparable across the move.
 *
 * THE RECOGNISED-NAME SET IS WIDER THAN THE 29. `THEME_CATALOG_RETIRED` and the
 * conditional annex entry are included by `readThemeCatalogRecords()` because
 * the cascade catalog still names them (`governedBy: "token-overrides"`), and a
 * head that silently stopped being declared would flip a root's verdict with
 * nobody deciding it. They carry `lifecycleState: 'RETIRED'` / `'CONDITIONAL'`
 * so a gate that wants only live rows can ask for them by name.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import { packageRoot as findPackageRoot } from '../repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);

export const CATALOG_SOURCE = join(
  CORE_ROOT,
  'src/contracts/theme/runtime/catalog/index.ts',
);

/** Literal-only reader: a row computed at runtime is invisible on purpose. */
function literalValue(node, source) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isPrefixUnaryExpression(node)
    && node.operator === ts.SyntaxKind.MinusToken
    && ts.isNumericLiteral(node.operand)) {
    return -Number(node.operand.text);
  }
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map((element) => literalValue(element, source));
  }
  if (ts.isObjectLiteralExpression(node)) {
    const value = {};
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      value[property.name.getText(source).replace(/['"]/g, '')] =
        literalValue(property.initializer, source);
    }
    return value;
  }
  return undefined;
}

function unwrap(expression) {
  let current = expression;
  while (current && (
    ts.isCallExpression(current)
    || ts.isAsExpression(current)
    || (ts.isSatisfiesExpression?.(current) ?? false)
    || ts.isParenthesizedExpression(current)
  )) {
    current = ts.isCallExpression(current) ? current.arguments[0] : current.expression;
  }
  return current;
}

/** Every top-level `const NAME = <array literal>` of the catalog source. */
export function readCatalogArrays(sourcePath = CATALOG_SOURCE) {
  const source = ts.createSourceFile(
    sourcePath,
    readFileSync(sourcePath, 'utf8'),
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS,
  );
  const arrays = new Map();
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      const expression = unwrap(node.initializer);
      if (expression && ts.isArrayLiteralExpression(expression)) {
        arrays.set(
          node.name.text,
          expression.elements
            .filter((element) => ts.isObjectLiteralExpression(element))
            .map((element) => literalValue(element, source)),
        );
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return arrays;
}

function require(arrays, name, sourcePath) {
  const rows = arrays.get(name);
  if (!rows) {
    throw new Error(`theme-catalog: ${sourcePath} declares no ${name} array literal`);
  }
  return rows;
}

/** The 29 decision rows, exactly as authored. */
export function readThemeCatalog(sourcePath = CATALOG_SOURCE) {
  const arrays = readCatalogArrays(sourcePath);
  const rows = require(arrays, 'THEME_CONTROL_CATALOG', sourcePath);
  if (rows.length === 0) throw new Error('theme-catalog: the catalog is empty');
  return rows;
}

export function readThemeCatalogAnnex(sourcePath = CATALOG_SOURCE) {
  return require(readCatalogArrays(sourcePath), 'THEME_CATALOG_ANNEX', sourcePath);
}

export function readThemeCatalogRetired(sourcePath = CATALOG_SOURCE) {
  return require(readCatalogArrays(sourcePath), 'THEME_CATALOG_RETIRED', sourcePath);
}

/**
 * `enumValues` is the closed vocabulary of STOP NAMES a theme may author, and
 * nothing else. It is deliberately NOT filled from `roles` or `keys`: those
 * name the sub-fields of a map-valued control, and a slot classifier that read
 * them as stops would credit `primary` as an authored stop of `palette.seeds`.
 */
function domainOf(row) {
  const domain = row.domain ?? {};
  return {
    kind: domain.kind === 'enum'
      ? 'closed-enum'
      : domain.kind === 'scale'
        ? 'bounded'
        : domain.kind ?? 'unknown',
    enumValues: domain.values ?? [],
    bounds: domain.bounds ?? null,
    defaultBehavior: row.defaultBehavior ?? '',
  };
}

/**
 * The control view the gates consume, in kit row order, followed by the
 * retired and conditional names the cascade catalog still references.
 */
export function readThemeCatalogRecords(sourcePath = CATALOG_SOURCE) {
  const records = readThemeCatalog(sourcePath).map((row) => ({
    controlId: row.id,
    lifecycleState: 'OPERATIONAL',
    tier: row.tier,
    scope: 'tenant',
    title: row.title,
    domain: domainOf(row),
    ingress: {
      staticBrandThemePath: row.keypath?.brandTheme ?? null,
      dbTenantThemePath: row.keypath?.document ?? null,
    },
    declaredOutputs: {
      channels: row.produces?.channels ?? [],
      rootAttributes: row.produces?.rootAttributes ?? [],
      representativeOnly: true,
    },
    dependsOn: row.consumes ?? [],
  }));
  for (const entry of readThemeCatalogRetired(sourcePath)) {
    records.push({
      controlId: entry.id,
      lifecycleState: 'RETIRED',
      tier: 'pro',
      scope: 'tenant',
      title: entry.id,
      domain: { kind: 'retired', enumValues: [], bounds: null, defaultBehavior: entry.replacedBy },
      ingress: { staticBrandThemePath: null, dbTenantThemePath: null },
      declaredOutputs: { channels: entry.channels ?? [], rootAttributes: [], representativeOnly: true },
      dependsOn: [],
    });
  }
  for (const entry of readThemeCatalogAnnex(sourcePath)) {
    if (entry.status !== 'conditional') continue;
    records.push({
      controlId: entry.id,
      lifecycleState: 'CONDITIONAL',
      tier: entry.tier,
      scope: 'tenant',
      title: entry.id,
      domain: { kind: 'conditional', enumValues: entry.values ?? [], bounds: null, defaultBehavior: entry.reason },
      ingress: { staticBrandThemePath: null, dbTenantThemePath: null },
      declaredOutputs: { channels: entry.channels ?? [], rootAttributes: [], representativeOnly: true },
      dependsOn: [],
    });
  }
  return records;
}

/** Every control name the catalog recognises, live or retired. */
export function themeCatalogControlIds(sourcePath = CATALOG_SOURCE) {
  return new Set(readThemeCatalogRecords(sourcePath).map((record) => record.controlId));
}

/** channel -> the control ids that declare it as a head. */
export function themeCatalogChannelOwners(sourcePath = CATALOG_SOURCE) {
  const owners = new Map();
  for (const record of readThemeCatalogRecords(sourcePath)) {
    for (const channel of record.declaredOutputs.channels) {
      if (!owners.has(channel)) owners.set(channel, []);
      owners.get(channel).push(record.controlId);
    }
  }
  return owners;
}

/** Every declared head channel, flattened. */
export function themeCatalogDeclaredChannels(sourcePath = CATALOG_SOURCE) {
  return new Set(themeCatalogChannelOwners(sourcePath).keys());
}
