#!/usr/bin/env node

import {
  existsSync,
  readFileSync,
  realpathSync,
  statSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import {
  dirname,
  extname,
  relative,
  resolve,
  sep,
} from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('typescript');

export const CRA17_PUBLIC_ASSET_SUBPATHS = Object.freeze([
  './icons',
  './icons/full',
  './icons/presets/bithire',
  './icons/roles/action-add',
  './marks',
  './marks/brand',
  './marks/cloud',
  './pictograms',
]);

const SUPPLIER_NAME = /(?:lucide|phosphor(?:[\s_-]+icons?)?|hugeicons?|the[\s_-]*svg|thesvg)/iu;
const SUPPLIER_IDENTIFIER = /^(?:Lucide|Phosphor|Hugeicons?|TheSvg)/iu;

function isInside(candidate, root) {
  const path = relative(root, candidate);
  return path === '' || (!path.startsWith(`..${sep}`) && path !== '..');
}

function displayPath(path, root) {
  const local = relative(root, path);
  return local && !local.startsWith('..') ? local.split(sep).join('/') : path;
}

function collectTypesTargets(value, targets = []) {
  if (!value || typeof value !== 'object') return targets;
  for (const [condition, target] of Object.entries(value)) {
    if (condition === 'types' && typeof target === 'string') {
      targets.push(target);
      continue;
    }
    collectTypesTargets(target, targets);
  }
  return targets;
}

function declarationCandidates(fromFile, specifier) {
  const base = resolve(dirname(fromFile), specifier);
  if (specifier.endsWith('.d.ts')) return [base];
  if (/\.(?:mjs|cjs|js|jsx)$/u.test(specifier)) {
    return [base.replace(/\.(?:mjs|cjs|js|jsx)$/u, '.d.ts')];
  }
  if (/\.(?:mts|cts|ts|tsx)$/u.test(specifier)) {
    return [base.replace(/\.(?:mts|cts|ts|tsx)$/u, '.d.ts')];
  }
  if (extname(specifier)) return [base];
  return [`${base}.d.ts`, resolve(base, 'index.d.ts')];
}

function resolveDeclarationEdge(fromFile, specifier, packageRoot) {
  const candidates = declarationCandidates(fromFile, specifier);
  for (const candidate of candidates) {
    if (!isInside(candidate, packageRoot)) {
      return { error: `relative declaration edge escapes the package: ${specifier}` };
    }
    if (!existsSync(candidate) || !statSync(candidate).isFile()) continue;
    if (!candidate.endsWith('.d.ts')) return { asset: candidate };
    return { declaration: candidate };
  }
  return { error: `relative declaration edge cannot resolve: ${specifier}` };
}

function importTypeSpecifier(node) {
  const argument = node.argument;
  if (ts.isLiteralTypeNode(argument) && ts.isStringLiteralLike(argument.literal)) {
    return argument.literal;
  }
  return null;
}

function inspectDeclaration(path, packageRoot) {
  const source = readFileSync(path, 'utf8');
  const sourceFile = ts.createSourceFile(
    path,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const errors = [];
  const specifiers = new Set();
  const report = (node, message) => {
    const location = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    errors.push(
      `${displayPath(path, packageRoot)}:${location.line + 1}:${location.character + 1} ${message}`,
    );
  };

  for (const diagnostic of sourceFile.parseDiagnostics) {
    const location = sourceFile.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
    errors.push(
      `${displayPath(path, packageRoot)}:${location.line + 1}:${location.character + 1} ` +
      `invalid declaration syntax: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`,
    );
  }

  const addSpecifier = (node) => {
    if (!node || !ts.isStringLiteralLike(node)) return;
    specifiers.add(node.text);
  };

  const visit = (node) => {
    if (ts.isIdentifier(node) && SUPPLIER_IDENTIFIER.test(node.text)) {
      report(node, `exposes supplier-owned identifier ${JSON.stringify(node.text)}`);
    }
    if (ts.isStringLiteralLike(node) && SUPPLIER_NAME.test(node.text)) {
      report(node, `exposes supplier name or package ${JSON.stringify(node.text)}`);
    }
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      addSpecifier(node.moduleSpecifier);
    } else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) {
      addSpecifier(node.moduleReference.expression);
    } else if (ts.isImportTypeNode(node)) {
      addSpecifier(importTypeSpecifier(node));
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  for (const reference of sourceFile.referencedFiles) specifiers.add(reference.fileName);

  const declarations = [];
  for (const specifier of specifiers) {
    if (!specifier.startsWith('.')) continue;
    const edge = resolveDeclarationEdge(path, specifier, packageRoot);
    if (edge.error) {
      errors.push(`${displayPath(path, packageRoot)} ${edge.error}`);
    } else if (edge.declaration) {
      declarations.push(edge.declaration);
    }
  }

  return { declarations, errors };
}

function rootsFromManifest(packageRoot, subpaths) {
  const manifestPath = resolve(packageRoot, 'package.json');
  if (!existsSync(manifestPath)) {
    return { errors: [`missing packed package manifest: ${manifestPath}`], roots: {} };
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const roots = {};
  const errors = [];
  for (const subpath of subpaths) {
    let definition = manifest.exports?.[subpath];
    let wildcardReplacement = null;
    if (!definition) {
      for (const [pattern, candidate] of Object.entries(manifest.exports ?? {})) {
        const wildcardIndex = pattern.indexOf('*');
        if (wildcardIndex < 0 || pattern.indexOf('*', wildcardIndex + 1) >= 0) continue;
        const prefix = pattern.slice(0, wildcardIndex);
        const suffix = pattern.slice(wildcardIndex + 1);
        if (!subpath.startsWith(prefix) || !subpath.endsWith(suffix)) continue;
        wildcardReplacement = subpath.slice(prefix.length, subpath.length - suffix.length);
        definition = candidate;
        break;
      }
    }
    const targets = [...new Set(collectTypesTargets(definition).map((target) => (
      wildcardReplacement === null ? target : target.replaceAll('*', wildcardReplacement)
    )))];
    if (targets.length === 0) {
      errors.push(`${subpath} has no packed types export`);
      continue;
    }
    roots[subpath] = targets.map((target) => resolve(packageRoot, target));
  }
  return { errors, roots };
}

/**
 * Audits only declarations reachable from the packed public asset entries.
 * Private adapter declarations may name their implementation supplier; public
 * consumers must never reach those names through a `.d.ts` edge.
 */
export function auditPublicDeclarationClosures(
  packageRoot,
  { roots: explicitRoots, subpaths = CRA17_PUBLIC_ASSET_SUBPATHS } = {},
) {
  const absoluteRoot = resolve(packageRoot);
  const derived = explicitRoots
    ? { errors: [], roots: explicitRoots }
    : rootsFromManifest(absoluteRoot, subpaths);
  const errors = [...derived.errors];
  const pending = [];
  const entrypoints = {};

  for (const [subpath, configuredRoots] of Object.entries(derived.roots)) {
    const roots = (Array.isArray(configuredRoots) ? configuredRoots : [configuredRoots])
      .map((path) => resolve(absoluteRoot, path));
    entrypoints[subpath] = roots.map((path) => displayPath(path, absoluteRoot));
    for (const path of roots) {
      if (!isInside(path, absoluteRoot)) {
        errors.push(`${subpath} declaration root escapes the package: ${path}`);
      } else if (!existsSync(path) || !statSync(path).isFile()) {
        errors.push(`${subpath} packed declaration root is missing: ${displayPath(path, absoluteRoot)}`);
      } else if (!path.endsWith('.d.ts')) {
        errors.push(`${subpath} types export is not a declaration file: ${displayPath(path, absoluteRoot)}`);
      } else {
        pending.push(path);
      }
    }
  }

  const visited = new Set();
  while (pending.length > 0) {
    const path = pending.pop();
    if (visited.has(path)) continue;
    visited.add(path);
    const result = inspectDeclaration(path, absoluteRoot);
    errors.push(...result.errors);
    pending.push(...result.declarations.filter((declaration) => !visited.has(declaration)));
  }

  return {
    entrypoints,
    files: visited.size,
    errors: [...new Set(errors)].sort(),
  };
}

function cliArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function runCli() {
  const scriptDirectory = dirname(fileURLToPath(import.meta.url));
  const packageRoot = resolve(cliArgument('--package-root') ?? resolve(scriptDirectory, '..'));
  const result = auditPublicDeclarationClosures(packageRoot);
  if (result.errors.length > 0) {
    throw new Error(`supplier-owned public declarations found:\n- ${result.errors.join('\n- ')}`);
  }
  console.log(
    `WO-CRA-17 public declaration gate: OK ` +
    `(${Object.keys(result.entrypoints).length} entries, ${result.files} declaration files)`,
  );
  console.log(JSON.stringify(result, null, 2));
}

const invokedAsScript = process.argv[1] &&
  realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (invokedAsScript) {
  try {
    runCli();
  } catch (error) {
    console.error(`WO-CRA-17 public declaration gate: FAIL\n${error.stack ?? error.message}`);
    process.exitCode = 1;
  }
}
