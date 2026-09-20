#!/usr/bin/env node
/**
 * class-window — the declared class migration windows, read from source.
 *
 * A family that is renaming its public class vocabulary stamps the canonical
 * `ds-` spelling BESIDE the superseded one for as long as a pinned consumer
 * still selects the old name (see
 * `src/components/structures/foundation/class-window`). For the duration of
 * that window the family's own source and skin name two spellings of the same
 * class, and a census that counted both would report the migration as NEW
 * debt -- the family would be punished for starting it.
 *
 * So the census reads the window as ONE row, still spelled the old way: while
 * a declared pair is present on BOTH arms, the canonical twin is not counted
 * as a class token, a vocabulary or a legacy-namespace class. That is the
 * honest reading -- the family still owns exactly the classes outside `ds-`
 * it owned before, and its debt falls only when the superseded arm is deleted,
 * at which point the canonical twin enters the census, the legacy count drops
 * and the ratchet asks for its pin to be lowered. Which is the closure step.
 *
 * WHAT IT DOES NOT HIDE. Only a canonical name DECLARED for that exact family,
 * and only while its superseded partner is still present, is set aside. An
 * undeclared name, a name declared for a different family, and a canonical
 * name left behind after its partner is gone all count as written.
 *
 * The declaration is read from the TypeScript source, so a row computed at
 * runtime is invisible on purpose.
 */

import { readFileSync } from 'node:fs';
import { dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = findPackageRoot(HERE);

export const REGISTRY_SOURCE = 'src/components/structures/foundation/class-window/index.ts';

const toPosix = (value) => value.split(sep).join('/');

/** `[...] as const satisfies T` -> the array literal. */
function unwrap(node) {
  let current = node;
  for (;;) {
    if (!current) return undefined;
    if (ts.isAsExpression(current) || ts.isParenthesizedExpression(current)
      || current.kind === ts.SyntaxKind.SatisfiesExpression) {
      current = current.expression;
      continue;
    }
    return current;
  }
}

function literal(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map((element) => literal(unwrap(element)));
  if (ts.isObjectLiteralExpression(node)) {
    const value = {};
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      value[property.name.getText().replace(/['"]/g, '')] = literal(unwrap(property.initializer));
    }
    return value;
  }
  return undefined;
}

/**
 * Every declared window: `{ family, cut, pairs: { superseded: canonical } }`.
 * A registry that is missing or holds no literal array is an error, never an
 * empty list -- an unreadable declaration must not silently widen a census.
 */
export function readClassMigrationWindows(root = DEFAULT_ROOT) {
  const file = join(root, REGISTRY_SOURCE);
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== 'CLASS_MIGRATION_WINDOWS') continue;
      const array = unwrap(declaration.initializer);
      if (array && ts.isArrayLiteralExpression(array)) return literal(array);
    }
  }
  throw new Error(`class-window: ${toPosix(file)} declares no literal CLASS_MIGRATION_WINDOWS`);
}

/**
 * The canonical twins to set aside for one family's census: declared for THIS
 * family, and only while the superseded partner is still among its tokens.
 */
export function windowedCanonicalClasses(family, tokens, windows = readClassMigrationWindows()) {
  const declared = windows.find((entry) => entry.family === family);
  if (!declared) return new Set();
  const present = new Set(tokens);
  const paired = new Set();
  for (const [superseded, canonical] of Object.entries(declared.pairs)) {
    if (present.has(superseded)) paired.add(canonical);
  }
  return paired;
}
