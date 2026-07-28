#!/usr/bin/env node

/**
 * ROOT-STATE OWNERSHIP GATE — direct `<html>` writers in application source.
 *
 * WHAT THIS ENFORCES (independent audit 2026-07-26, Codex C4 / C6.7)
 * ------------------------------------------------------------------
 * C6.7 makes R1-P acceptance conditional on "root-state channels have one SSR
 * projection and one canonical hydrated owner, without direct app DOM writers".
 * The first two halves are structural and provable by reading the projection
 * and the provider. The third is not: a raw `documentElement.setAttribute`
 * anywhere in an application reaches the same node with the same value, and
 * every value assertion in every suite still passes. It is invisible until the
 * channel disagrees with itself at runtime.
 *
 * So this gate asks the question a value assertion cannot: does the application
 * hold ANY writer of a governed root channel that did not go through the design
 * system's claim registry.
 *
 * WHY A CLAIM AND NOT A WRITE. The server projects these channels into the
 * rendered HTML and a pre-paint script may refine them. An app effect that
 * writes one directly owns nothing: its cleanup either deletes a value the
 * server created, or -- worse -- it has no cleanup and the channel outlives the
 * owner that set it. `claimRootAttribute` and `claimRootAttributeSet` capture
 * what they found and hand exactly that back.
 *
 * THE TWO FINDING CLASSES
 * -----------------------
 *   RAW_ROOT_WRITE     a mutation of the document root on a governed channel,
 *                      or on a channel whose name is not statically knowable.
 *                      An unknowable name is a finding on purpose: the writer
 *                      this gate was built for computed its keys from tenant
 *                      data, and a scanner that only matched literals would
 *                      have called it clean.
 *   LOCAL_CLAIM_COPY   a claim symbol the application declares itself, or
 *                      imports from somewhere other than the design system. A
 *                      local re-implementation is a second authority wearing
 *                      the right name; the application carried one until the
 *                      registry was exported.
 *
 * THERE IS NO BASELINE. Zero is the only passing count, and the remediation
 * landed before the gate. A finding is removed by routing the write through a
 * claim, never by recording it somewhere.
 *
 * SCOPE. Governed channels only. An application owns plenty of root state that
 * is none of the design system's business -- a scroll lock's `overflow`, a
 * feature's own `data-*` marker -- and a gate that failed on those would be
 * traded for a suppression comment within a week.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const SCRIPTS_DIR = dirname(SCRIPT_PATH);
export const CORE_ROOT = resolve(SCRIPTS_DIR, '..');
export const DEFAULT_APP_ROOT = resolve(CORE_ROOT, '../../../app-bithire');

export const FINDINGS = Object.freeze({
  rawWrite: 'RAW_ROOT_WRITE',
  localClaim: 'LOCAL_CLAIM_COPY',
});

/**
 * Channels the design system projects on the server and owns at hydration,
 * plus the application-scope channels the server projects and an app effect
 * CLAIMS. Both kinds have a baseline in the rendered HTML, which is exactly
 * what a raw writer cannot hand back.
 */
export const GOVERNED_ATTRIBUTES = Object.freeze([
  'data-theme',
  'data-engine',
  'data-density',
  'data-ds-motion',
  'data-ds-root',
  'data-vertical',
  'data-account-tenant',
  'data-brand-artifact',
  'data-css-tenant',
  'lang',
  'dir',
]);

/** `data-tenant`, `data-tenant-theme-mode`, `data-anatomy-card`, ... */
export const GOVERNED_ATTRIBUTE_PREFIXES = Object.freeze(['data-tenant', 'data-anatomy-']);

/** Inline style properties the pre-paint script and the theme provider own. */
export const GOVERNED_STYLE_PROPERTIES = Object.freeze(['color-scheme']);

/** Root classes the theme channel owns. */
export const GOVERNED_CLASSES = Object.freeze(['dark']);

/** The design system's claim API. Only this module may supply it. */
export const CLAIM_SYMBOLS = Object.freeze([
  'claimRootAttribute',
  'claimRootAttributeSet',
  'claimRootClass',
  'claimRootStyleProperty',
  'composeRootAttributeReleases',
]);

export const CLAIM_MODULE = '@rottay/design-system';

const EXCLUDED_APP_PATH =
  /(?:^|[\\/])(?:node_modules|\.next|dist|build|coverage|__snapshots__|public)(?:[\\/]|$)/;

const SOURCE_EXTENSIONS = ['.ts', '.tsx'];

function collectSources(root) {
  const found = [];
  const walk = (directory) => {
    let entries;
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(directory, entry.name);
      if (EXCLUDED_APP_PATH.test(`${sep}${relative(root, full)}${sep}`)) continue;
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (entry.name.endsWith('.d.ts')) continue;
      if (SOURCE_EXTENSIONS.some((extension) => entry.name.endsWith(extension))) found.push(full);
    }
  };
  walk(root);
  return found.sort();
}

/**
 * The corpus root. A missing corpus is a hard failure, never a pass: a blocking
 * gate that goes green because it found nothing to look at proves nothing.
 */
export function resolveCorpusRoot(appRoot) {
  const root = resolve(appRoot);
  let stats;
  try {
    stats = statSync(root);
  } catch {
    throw new Error(
      `app corpus MISSING at ${root}\n` +
        '  pass --app-root <path> or set APP_ROOT_WRITER_APP_ROOT.\n' +
        '  a blocking gate must not treat an absent corpus as a pass.',
    );
  }
  if (!stats.isDirectory()) throw new Error(`app corpus is not a directory: ${root}`);
  const src = join(root, 'src');
  try {
    if (statSync(src).isDirectory()) return src;
  } catch {
    // A fixture may point directly at a source directory.
  }
  return root;
}

export function isGovernedAttribute(name) {
  if (GOVERNED_ATTRIBUTES.includes(name)) return true;
  return GOVERNED_ATTRIBUTE_PREFIXES.some((prefix) => name.startsWith(prefix));
}

/** `bithireDetailDictationEnhancer` -> `data-bithire-detail-dictation-enhancer`. */
function datasetKeyToAttribute(key) {
  return `data-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
}

/** `colorScheme` -> `color-scheme`. */
function stylePropertyToCss(property) {
  return property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function isDocumentExpression(node) {
  if (ts.isIdentifier(node)) return node.text === 'document';
  if (ts.isPropertyAccessExpression(node)) {
    return (
      node.name.text === 'document' &&
      ts.isIdentifier(node.expression) &&
      (node.expression.text === 'window' || node.expression.text === 'globalThis')
    );
  }
  return false;
}

/**
 * Every name in one file that refers to the document root.
 *
 * Aliasing is the cheapest way for a writer to stop looking like one --
 * `const root = document.documentElement` is the shape the application already
 * used -- so the scan resolves it rather than matching a spelling.
 */
function collectRootAliases(sourceFile) {
  const aliases = new Set();

  const isRootInitializer = (node) =>
    node &&
    ts.isPropertyAccessExpression(node) &&
    node.name.text === 'documentElement' &&
    isDocumentExpression(node.expression);

  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && node.initializer) {
      if (isRootInitializer(node.initializer) && ts.isIdentifier(node.name)) {
        aliases.add(node.name.text);
      }
      // `const { documentElement } = document` / `{ documentElement: root }`
      if (isDocumentExpression(node.initializer) && ts.isObjectBindingPattern(node.name)) {
        for (const element of node.name.elements) {
          const source = element.propertyName ?? element.name;
          if (
            ts.isIdentifier(source) &&
            source.text === 'documentElement' &&
            ts.isIdentifier(element.name)
          ) {
            aliases.add(element.name.text);
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return aliases;
}

/** File-level `const NAME = 'literal'`, so a named channel still resolves. */
function collectStringConstants(sourceFile) {
  const constants = new Map();
  const visit = (node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      (ts.isStringLiteral(node.initializer) ||
        ts.isNoSubstitutionTemplateLiteral(node.initializer))
    ) {
      constants.set(node.name.text, node.initializer.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return constants;
}

/** The literal value of an expression, or null when it is not knowable here. */
function staticString(node, constants) {
  if (!node) return null;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isIdentifier(node)) return constants.get(node.text) ?? null;
  return null;
}

function lineOf(sourceFile, node) {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
}

/**
 * Scan one source file for direct root mutations and local claim copies.
 *
 * Resolution is syntactic: no program, no type checker, no tsconfig. A scan
 * that needed the app to typecheck could not run while the app is broken, which
 * is exactly when a root writer is most likely to be introduced.
 */
export function scanSource({ fileName, text }) {
  const sourceFile = ts.createSourceFile(
    fileName,
    text,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  const aliases = collectRootAliases(sourceFile);
  const constants = collectStringConstants(sourceFile);
  const findings = [];
  let rootReferences = 0;

  const isRoot = (node) => {
    if (!node) return false;
    if (ts.isIdentifier(node)) return aliases.has(node.text);
    if (ts.isPropertyAccessExpression(node)) {
      return node.name.text === 'documentElement' && isDocumentExpression(node.expression);
    }
    return false;
  };

  /** `root.<member>` for a named member. */
  const rootMember = (node, member) =>
    ts.isPropertyAccessExpression(node) && node.name.text === member && isRoot(node.expression);

  const report = (node, channel, detail) => {
    findings.push({
      kind: FINDINGS.rawWrite,
      channel: channel ?? '<computed>',
      detail,
      line: lineOf(sourceFile, node),
    });
  };

  /** A channel is reportable when it is governed, or when it cannot be read. */
  const reportIfGoverned = (node, name, detail, governs) => {
    if (name === null) {
      report(node, null, `${detail} (channel name is computed, so it cannot be proven ungoverned)`);
      return;
    }
    if (governs(name)) report(node, name, detail);
  };

  const visit = (node) => {
    if (isRoot(node)) rootReferences += 1;

    // --- claim provenance -------------------------------------------------
    if (ts.isImportDeclaration(node) && node.importClause?.namedBindings) {
      const specifier = ts.isStringLiteral(node.moduleSpecifier) ? node.moduleSpecifier.text : '';
      const bindings = node.importClause.namedBindings;
      if (ts.isNamedImports(bindings) && specifier !== CLAIM_MODULE) {
        for (const element of bindings.elements) {
          const imported = (element.propertyName ?? element.name).text;
          if (!CLAIM_SYMBOLS.includes(imported)) continue;
          findings.push({
            kind: FINDINGS.localClaim,
            channel: imported,
            detail: `imported from "${specifier}" instead of ${CLAIM_MODULE}`,
            line: lineOf(sourceFile, element),
          });
        }
      }
    }
    if (
      (ts.isFunctionDeclaration(node) || ts.isVariableDeclaration(node)) &&
      node.name &&
      ts.isIdentifier(node.name) &&
      CLAIM_SYMBOLS.includes(node.name.text)
    ) {
      findings.push({
        kind: FINDINGS.localClaim,
        channel: node.name.text,
        detail: 'declared in the application; the claim registry has one implementation',
        line: lineOf(sourceFile, node),
      });
    }

    // --- root.setAttribute / removeAttribute / toggleAttribute -------------
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const method = node.expression.name.text;
      const receiver = node.expression.expression;

      if (
        isRoot(receiver) &&
        (method === 'setAttribute' || method === 'removeAttribute' || method === 'toggleAttribute')
      ) {
        reportIfGoverned(
          node,
          staticString(node.arguments[0], constants),
          `${method} on the document root`,
          isGovernedAttribute,
        );
      }

      // --- root.classList.* ------------------------------------------------
      if (
        rootMember(receiver, 'classList') &&
        ['add', 'remove', 'toggle', 'replace'].includes(method)
      ) {
        for (const argument of method === 'toggle' ? [node.arguments[0]] : node.arguments) {
          if (argument && ts.isSpreadElement(argument)) continue;
          reportIfGoverned(
            node,
            staticString(argument, constants),
            `classList.${method} on the document root`,
            (name) => GOVERNED_CLASSES.includes(name),
          );
        }
      }

      // --- root.style.setProperty / removeProperty -------------------------
      if (rootMember(receiver, 'style') && (method === 'setProperty' || method === 'removeProperty')) {
        reportIfGoverned(
          node,
          staticString(node.arguments[0], constants),
          `style.${method} on the document root`,
          (name) => GOVERNED_STYLE_PROPERTIES.includes(name),
        );
      }

      // --- Object.assign(root, ...) ----------------------------------------
      if (
        method === 'assign' &&
        ts.isIdentifier(receiver) &&
        receiver.text === 'Object' &&
        node.arguments.some((argument) => isRoot(argument))
      ) {
        report(node, null, 'Object.assign onto the document root');
      }
    }

    // --- assignments -------------------------------------------------------
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      const target = node.left;

      if (ts.isPropertyAccessExpression(target) && isRoot(target.expression)) {
        const property = target.name.text;
        if (property === 'lang' || property === 'dir') {
          report(node, property, `assignment to root.${property}`);
        }
        if (property === 'className') {
          report(node, 'class', 'assignment to root.className replaces every governed class');
        }
      }

      // root.dataset.<key> = ... / root.dataset['x'] = ...
      if (ts.isPropertyAccessExpression(target) && rootMember(target.expression, 'dataset')) {
        reportIfGoverned(
          node,
          datasetKeyToAttribute(target.name.text),
          'assignment to root.dataset',
          isGovernedAttribute,
        );
      }
      if (ts.isElementAccessExpression(target) && rootMember(target.expression, 'dataset')) {
        const key = staticString(target.argumentExpression, constants);
        reportIfGoverned(
          node,
          key === null ? null : datasetKeyToAttribute(key),
          'assignment to root.dataset',
          isGovernedAttribute,
        );
      }

      // root.style.<property> = ...
      if (ts.isPropertyAccessExpression(target) && rootMember(target.expression, 'style')) {
        reportIfGoverned(
          node,
          stylePropertyToCss(target.name.text),
          'assignment to root.style',
          (name) => GOVERNED_STYLE_PROPERTIES.includes(name),
        );
      }
    }

    // --- delete root.dataset.<key> ----------------------------------------
    if (ts.isDeleteExpression(node)) {
      const target = node.expression;
      if (ts.isPropertyAccessExpression(target) && rootMember(target.expression, 'dataset')) {
        reportIfGoverned(
          node,
          datasetKeyToAttribute(target.name.text),
          'delete of root.dataset',
          isGovernedAttribute,
        );
      }
      if (ts.isElementAccessExpression(target) && rootMember(target.expression, 'dataset')) {
        const key = staticString(target.argumentExpression, constants);
        reportIfGoverned(
          node,
          key === null ? null : datasetKeyToAttribute(key),
          'delete of root.dataset',
          isGovernedAttribute,
        );
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return { findings, rootReferences };
}

export function runGate({ appRoot }) {
  const corpusRoot = resolveCorpusRoot(appRoot);
  const files = collectSources(corpusRoot);

  const fileFindings = {};
  const byKind = { [FINDINGS.rawWrite]: 0, [FINDINGS.localClaim]: 0 };
  let rootReferences = 0;
  let claimUsages = 0;

  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    let result;
    try {
      result = scanSource({ fileName: file, text });
    } catch (error) {
      throw new Error(`unparseable app source ${relative(corpusRoot, file)}: ${error.message}`);
    }
    rootReferences += result.rootReferences;
    for (const symbol of CLAIM_SYMBOLS) {
      if (text.includes(symbol)) claimUsages += 1;
    }
    if (result.findings.length === 0) continue;
    const key = relative(corpusRoot, file).split(sep).join('/');
    fileFindings[key] = result.findings;
    for (const finding of result.findings) byKind[finding.kind] += 1;
  }

  const total = byKind[FINDINGS.rawWrite] + byKind[FINDINGS.localClaim];
  return {
    corpusRoot,
    files: files.length,
    rootReferences,
    claimUsages,
    byKind,
    fileFindings,
    total,
    ok: total === 0,
  };
}

export function formatReport(result) {
  const lines = [];
  lines.push('app-root-writer: direct `<html>` writers of governed channels in application source');
  lines.push(`  corpus            ${result.corpusRoot}`);
  lines.push(`  sources scanned   ${result.files}`);
  lines.push(`  root references   ${result.rootReferences}  (reads included; the scan saw the node)`);
  lines.push(`  claim usages      ${result.claimUsages}  (the supported path)`);
  lines.push(`  ${FINDINGS.rawWrite}    ${result.byKind[FINDINGS.rawWrite]}`);
  lines.push(`  ${FINDINGS.localClaim}   ${result.byKind[FINDINGS.localClaim]}`);

  if (result.ok) {
    lines.push('  RESULT: zero direct writers');
    return lines.join('\n');
  }

  lines.push(`  RESULT: FAIL — ${result.total} finding(s)`);
  for (const [file, findings] of Object.entries(result.fileFindings)) {
    for (const finding of findings) {
      lines.push(`    ${file}:${finding.line}  [${finding.kind}] ${finding.channel} — ${finding.detail}`);
    }
  }
  lines.push('');
  lines.push('  RAW_ROOT_WRITE   take a claim instead: claimRootAttribute / claimRootAttributeSet /');
  lines.push('                   claimRootClass / claimRootStyleProperty from @rottay/design-system.');
  lines.push('                   A claim captures the value the server rendered and hands it back.');
  lines.push('  LOCAL_CLAIM_COPY the registry has one implementation. Import it.');
  lines.push('  There is no baseline: a finding is fixed, not recorded.');
  return lines.join('\n');
}

export function parseArgs(argv) {
  const args = {
    mode: 'check',
    appRoot: process.env.APP_ROOT_WRITER_APP_ROOT ?? DEFAULT_APP_ROOT,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const takeValue = () => {
      const value = argv[index + 1];
      if (!value) throw new Error(`${token} requires a value`);
      index += 1;
      return value;
    };
    if (token === '--check') args.mode = 'check';
    else if (token === '--json') args.mode = 'json';
    else if (token === '--app-root') args.appRoot = takeValue();
    else if (token.startsWith('--app-root=')) args.appRoot = token.slice('--app-root='.length);
    else throw new Error(`unknown argument ${token}`);
  }
  return args;
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const result = runGate({ appRoot: args.appRoot });

  if (args.mode === 'json') {
    process.stdout.write(
      `${JSON.stringify(
        {
          ok: result.ok,
          files: result.files,
          rootReferences: result.rootReferences,
          byKind: result.byKind,
          fileFindings: result.fileFindings,
        },
        null,
        2,
      )}\n`,
    );
    return result.ok ? 0 : 1;
  }

  process.stderr.write(`${formatReport(result)}\n`);
  return result.ok ? 0 : 1;
}

const invokedAsScript = process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH;
if (invokedAsScript) {
  try {
    process.exitCode = main();
  } catch (error) {
    process.stderr.write(`app-root-writer: FAIL\n${error.stack ?? error.message}\n`);
    process.exitCode = 1;
  }
}
