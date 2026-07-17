import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const coreRoot = path.resolve(scriptDirectory, '..');
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

test('DS surfaces accept only app-resolved all or final capability decisions', async () => {
  const contracts = await readFile(path.join(coreRoot, 'src/ui/surfaces/foundation/contracts/index.ts'), 'utf8');
  const collection = await readFile(path.join(coreRoot, 'src/ui/surfaces/foundation/contracts/adaptive/collection/index.ts'), 'utf8');
  const sources = await productiveSurfaceSources(path.join(coreRoot, 'src/ui/surfaces'));

  assert.match(contracts, /type SurfaceAccessInput = AppResolvedSurfaceAccess;/);
  assert.doesNotMatch(`${contracts}\n${collection}`, /permissions\?:\s*SurfacePermissionsConfig/);
  const findings = [];
  for (const source of sources) {
    findings.push(
      ...forbiddenPolicyReferences(await readFile(source.absolute, 'utf8'), source.relative),
    );
  }
  assert.deepEqual(findings, [], 'DS surfaces must not import, define, destructure, or read app authorization policy');
});
