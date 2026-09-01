import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const coreRoot = findPackageRoot(scriptDirectory);
const FORBIDDEN_POLICY_KEYS = new Set([
  'permissions',
  'granted',
  'isAllowed',
  'isRowAllowed',
  'cascadeRules',
  'allowedActions',
  'deniedActions',
  'resolveFieldAccess',
]);
const LEGACY_POLICY_TYPE_NAMES = new Set([
  'SurfacePermissionRule',
  'SurfacePermissionsConfig',
  'SurfaceRuntimeContext',
]);

function staticPropertyName(node) {
  if (!node) return undefined;
  if (ts.isIdentifier(node) || ts.isStringLiteralLike(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  return undefined;
}

function forbiddenPolicyReferences(sourceText, fileName = 'boundary.ts') {
  const source = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const findings = [];
  function report(node, key) {
    const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
    findings.push(`${fileName}:${line + 1}:${key}`);
  }
  function visit(node) {
    if (ts.isInterfaceDeclaration(node) && LEGACY_POLICY_TYPE_NAMES.has(node.name.text)) {
      const deprecated = ts.getJSDocDeprecatedTag(node);
      if (!deprecated) report(node, `${node.name.text}-without-deprecation`);
      return;
    }
    if (ts.isPropertyAccessExpression(node) && FORBIDDEN_POLICY_KEYS.has(node.name.text)) {
      report(node, node.name.text);
    } else if (ts.isElementAccessExpression(node)) {
      const key = staticPropertyName(node.argumentExpression);
      if (key && FORBIDDEN_POLICY_KEYS.has(key)) report(node, key);
    } else if (ts.isBindingElement(node)) {
      const key = staticPropertyName(node.propertyName ?? node.name);
      if (key && FORBIDDEN_POLICY_KEYS.has(key)) report(node, key);
    } else if (
      (
        ts.isPropertyAssignment(node) ||
        ts.isShorthandPropertyAssignment(node) ||
        ts.isMethodDeclaration(node) ||
        ts.isPropertySignature(node)
      )
    ) {
      const key = staticPropertyName(node.name);
      if (key && FORBIDDEN_POLICY_KEYS.has(key)) report(node, key);
    } else if (ts.isIdentifier(node) && LEGACY_POLICY_TYPE_NAMES.has(node.text)) {
      report(node, node.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return findings;
}

async function productiveSurfaceSources(root) {
  const files = [];
  async function visit(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      const relative = path.relative(root, absolute).split(path.sep).join('/');
      if (entry.isDirectory()) {
        if (entry.name === 'tests' || entry.name === '__tests__') continue;
        await visit(absolute);
      } else if (
        /\.(?:ts|tsx)$/.test(entry.name) &&
        !/\.(?:test|spec|stories)\.(?:ts|tsx)$/.test(entry.name)
      ) {
        files.push({ absolute, relative });
      }
    }
  }
  await visit(root);
  return files;
}

test('presentation boundary scanner catches aliases, computed access, destructuring, and callback extraction', () => {
  const adversarial = `
    import type {
      SurfacePermissionsConfig as Policy,
      SurfaceRuntimeContext as RuntimePolicy,
    } from './contracts';
    function AdversarialBoundary() {
      const alias = source;
      alias.permissions;
      const grants = alias['granted'];
      const { isAllowed: evaluate } = alias;
      const callback = alias[\`isRowAllowed\`];
      return (
        <button
          data-grants={grants?.length}
          onClick={() => {
            evaluate({ kind: 'action', id: 'save' });
            callback({ kind: 'action', id: 'save' });
          }}
        >
          Save
        </button>
      );
    }
  `;
  const findings = forbiddenPolicyReferences(adversarial, 'adversarial.tsx');
  for (const expected of [
    'SurfacePermissionsConfig',
    'SurfaceRuntimeContext',
    'permissions',
    'granted',
    'isAllowed',
    'isRowAllowed',
  ]) {
    assert.ok(findings.some((finding) => finding.endsWith(`:${expected}`)), `missed ${expected}`);
  }
});

const ACCESS_INPUT_NAME = 'SurfaceAccessInput';
const ACCESS_INPUT_SOURCE_NAME = 'AppResolvedSurfaceAccess';
const CHROME_CONTRACTS_SPECIFIER = '../../../structures/foundation/chrome/contracts';

function parseContracts(sourceText, fileName) {
  return ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function topLevelTypeAliases(source, name) {
  return source.statements.filter(
    (statement) => ts.isTypeAliasDeclaration(statement) && statement.name.text === name,
  );
}

function hasExportKeyword(node) {
  return (node.modifiers ?? []).some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
}

function isBareTypeReference(typeNode, name) {
  return (
    Boolean(typeNode) &&
    ts.isTypeReferenceNode(typeNode) &&
    ts.isIdentifier(typeNode.typeName) &&
    typeNode.typeName.text === name &&
    (typeNode.typeArguments === undefined || typeNode.typeArguments.length === 0)
  );
}

function moduleSpecifierText(declaration) {
  const specifier = declaration.moduleSpecifier;
  return specifier && ts.isStringLiteralLike(specifier) ? specifier.text : undefined;
}

function topLevelReExportsFrom(source, specifier) {
  return source.statements.filter(
    (statement) => ts.isExportDeclaration(statement) && moduleSpecifierText(statement) === specifier,
  );
}

function topLevelNamedExportDeclarations(source) {
  return source.statements.filter(
    (statement) =>
      ts.isExportDeclaration(statement) &&
      statement.exportClause !== undefined &&
      ts.isNamedExports(statement.exportClause),
  );
}

// Every export specifier in the file that TOUCHES `name` on either side of an
// `as`: the local symbol being published (`propertyName ?? name`) and the public
// name it is published under (`name`). Both sides matter and neither one alone
// is sufficient. Matching only the public name lets
// `SurfaceAccessInput as SurfaceAccessCompat` publish the canonical symbol under
// a second public name while a healthy row absorbs the count; matching only the
// local name lets `Something as SurfaceAccessInput` occupy the public name from
// a foreign symbol. The scan is file-wide and specifier-agnostic on purpose --
// a competing touch is just as damaging from a second module or from a local
// `export { ... }` block as from the canonical one.
function exportSpecifiersTouching(source, name) {
  const touches = [];
  for (const declaration of topLevelNamedExportDeclarations(source)) {
    for (const element of declaration.exportClause.elements) {
      const exportedName = element.name.text;
      const localName = (element.propertyName ?? element.name).text;
      if (exportedName === name || localName === name) {
        touches.push({
          declaration,
          element,
          exportedName,
          localName,
          moduleSpecifier: moduleSpecifierText(declaration),
        });
      }
    }
  }
  return touches;
}

function describeTouch(touch) {
  const alias = touch.localName === touch.exportedName
    ? touch.exportedName
    : `${touch.localName} as ${touch.exportedName}`;
  return `${alias} <- ${touch.moduleSpecifier ?? '(local)'}`;
}

test('DS surfaces accept only app-resolved all or final capability decisions', async () => {
  const contracts = await readFile(path.join(coreRoot, 'src/components/surfaces/foundation/contracts/index.ts'), 'utf8');
  const chromeContracts = await readFile(
    path.join(coreRoot, 'src/components/structures/foundation/chrome/contracts/index.ts'),
    'utf8',
  );
  const collection = await readFile(path.join(coreRoot, 'src/components/surfaces/foundation/contracts/adaptive/collection/index.ts'), 'utf8');
  const sources = await productiveSurfaceSources(path.join(coreRoot, 'src/components/surfaces'));

  // Both halves of the ownership rule are read off the TypeScript AST, not off
  // the file text: a commented-out declaration, a commented-out re-export, and
  // an aliased re-export are all syntactically absent or syntactically
  // different, and each one bites its own named clause below.
  const chromeSource = parseContracts(chromeContracts, 'chrome-contracts.ts');
  const surfacesSource = parseContracts(contracts, 'surfaces-contracts.ts');

  // The alias is declared exactly once, at the structure tier that owns the
  // chrome vocabulary.
  const canonicalAliases = topLevelTypeAliases(chromeSource, ACCESS_INPUT_NAME);
  assert.equal(
    canonicalAliases.length,
    1,
    'canonical-alias-count: structures/foundation/chrome/contracts must declare exactly one top-level SurfaceAccessInput type alias',
  );
  const [canonicalAlias] = canonicalAliases;
  assert.ok(
    hasExportKeyword(canonicalAlias),
    'canonical-alias-exported: the canonical SurfaceAccessInput alias must carry the export modifier',
  );
  assert.ok(
    canonicalAlias.typeParameters === undefined || canonicalAlias.typeParameters.length === 0,
    'canonical-alias-generic: the canonical SurfaceAccessInput alias must not be generic',
  );
  assert.ok(
    isBareTypeReference(canonicalAlias.type, ACCESS_INPUT_SOURCE_NAME),
    'canonical-alias-rhs: the canonical SurfaceAccessInput alias must resolve to a bare AppResolvedSurfaceAccess reference',
  );

  // The surfaces tier keeps the public name by consuming it downward, so it may
  // never declare its own competing alias.
  assert.equal(
    topLevelTypeAliases(surfacesSource, ACCESS_INPUT_NAME).length,
    0,
    'surfaces-local-redeclaration: surfaces contracts must not declare a local SurfaceAccessInput alias',
  );

  // The downward consumption is a single type-only named re-export pinned to the
  // canonical owner's specifier.
  const chromeReExports = topLevelReExportsFrom(surfacesSource, CHROME_CONTRACTS_SPECIFIER);
  const namedTypeReExports = chromeReExports.filter(
    (declaration) =>
      declaration.isTypeOnly &&
      declaration.exportClause !== undefined &&
      ts.isNamedExports(declaration.exportClause),
  );
  assert.equal(
    namedTypeReExports.length,
    1,
    'surfaces-bridge-declaration: surfaces contracts must carry exactly one type-only named re-export from the structures chrome contracts owner',
  );
  assert.equal(
    chromeReExports.length,
    namedTypeReExports.length,
    'surfaces-bridge-star-or-value-export: surfaces contracts must not add a star or value re-export from the structures chrome contracts owner',
  );
  const bridgeDeclaration = namedTypeReExports[0];
  const bridgedElements = bridgeDeclaration.exportClause.elements.filter(
    (element) => element.name.text === ACCESS_INPUT_NAME,
  );
  assert.equal(
    bridgedElements.length,
    1,
    'surfaces-bridge-name: the type-only re-export block must export SurfaceAccessInput exactly once',
  );
  assert.equal(
    (bridgedElements[0].propertyName ?? bridgedElements[0].name).text,
    ACCESS_INPUT_NAME,
    'surfaces-bridge-alias-laundering: SurfaceAccessInput must be re-exported under its own local name, not aliased from another symbol',
  );

  // The clause above inspects ONE declaration and matches on the exported name
  // only, so on its own it is blind to a second specifier that touches the same
  // symbol: `SurfaceAccessInput as SurfaceAccessCompat` added beside the healthy
  // row keeps the filtered count at one and passes. The file-wide touch scan
  // below closes that hole. It deliberately does not constrain the block's own
  // length -- the live block legitimately re-exports 19 chrome names -- only how
  // many specifiers anywhere in the file may touch SurfaceAccessInput.
  const accessInputTouches = exportSpecifiersTouching(surfacesSource, ACCESS_INPUT_NAME);
  assert.equal(
    accessInputTouches.length,
    1,
    `surfaces-access-input-touch-count: exactly one export specifier in the whole surfaces contracts file may touch ${ACCESS_INPUT_NAME} on either side of an alias, found [${accessInputTouches.map(describeTouch).join(', ')}]`,
  );
  const [accessInputTouch] = accessInputTouches;
  assert.ok(
    accessInputTouch.declaration === bridgeDeclaration,
    `surfaces-access-input-touch-owner: the sole SurfaceAccessInput export specifier must live in the type-only named re-export from the structures chrome contracts owner, found ${describeTouch(accessInputTouch)}`,
  );
  assert.equal(
    accessInputTouch.exportedName,
    ACCESS_INPUT_NAME,
    'surfaces-access-input-public-name: the sole SurfaceAccessInput touch must publish under the name SurfaceAccessInput, not under a compatibility alias',
  );
  assert.equal(
    accessInputTouch.localName,
    ACCESS_INPUT_NAME,
    'surfaces-access-input-local-name: the sole SurfaceAccessInput touch must publish the canonical SurfaceAccessInput symbol, not another symbol renamed into that public name',
  );
  assert.doesNotMatch(`${contracts}\n${collection}`, /permissions\?:\s*SurfacePermissionsConfig/);
  const findings = [];
  for (const source of sources) {
    findings.push(
      ...forbiddenPolicyReferences(await readFile(source.absolute, 'utf8'), source.relative),
    );
  }
  assert.deepEqual(findings, [], 'DS surfaces must not import, define, destructure, or read app authorization policy');
});
