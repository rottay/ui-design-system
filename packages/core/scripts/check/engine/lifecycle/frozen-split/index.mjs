#!/usr/bin/env node
// Frozen-engine bundle split gate (WO-RET-02, F-62).
//
// A Modern consumer downloads no Classic or Rustic CSS: those engines ship only
// through the frozen-engine mount, as their own bundle behind
// `./styles/frozen-engines`. Three arms prove it, each able to fail alone:
//
//   1. SOURCE. `base` reaches no frozen-engine stylesheet and ships no
//      frozen-engine selector; a shared sheet the mount reaches is gated on a
//      frozen engine rule by rule; every frozen stylesheet on disk is mounted.
//   2. RULE TEXT. No rule or keyframe of the frozen closure, whitespace- and
//      comment-normalized, occurs anywhere in `base`'s closure: the one graph
//      every Modern bundle is composed from.
//   3. BYTES (after a build). The same intersection over every shipped Modern
//      bundle, a sweep for frozen-engine selector signatures, and a positive
//      control: the frozen bundle carries every frozen rule.
//
// Usage:
//   node scripts/check/engine/lifecycle/frozen-split/index.mjs --check          (arms 1-2)
//   node scripts/check/engine/lifecycle/frozen-split/index.mjs --check --built  (arms 1-3)
//   ... --css-root <dir> --package-root <dir>   (fixture mode, self-test only)

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';
import {
  FROZEN_ENGINE_BUNDLE,
  FROZEN_ENGINE_MOUNT,
  FROZEN_ENGINE_SOURCE,
  FROZEN_SELECTOR_SIGNATURE,
  importClosure,
} from '../../../../libraries/engine/frozen-mount/index.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));

/** Shipped Modern bundles, relative to the package root. */
export const MODERN_BUNDLES = Object.freeze([
  'dist/styles.css',
  'dist/rottay.css',
  'dist/bithire.css',
  'dist/evnto.css',
  'dist/modern-engine.css',
  'artifacts/generated/css/all-verticals/index.css',
  'artifacts/generated/css/verticals/rottay/index.css',
  'artifacts/generated/css/verticals/bithire/index.css',
  'artifacts/generated/css/verticals/evnto/index.css',
  'artifacts/generated/css/engines/modern/index.css',
]);

/**
 * Frozen rule texts a shared stylesheet authors byte-identically, so their bytes
 * in a Modern bundle are the shared copy. Pinned by exact text: a new duplicate fails.
 */
export const FROZEN_GATED_IN_BASE = new Map([
  [
    'presentation/components/skin/layout-primitives/index.css',
    {
      rules: 46,
      reason:
        'Flex/Stack/Space defaults gated on --classic/--rustic. Mounting them behind the frozen bundle re-sorts them after later rottay-components rules that can land on a frozen layout root (e.g. .ds-card-header > [data-part=content]), so they stay until a ruling moves them',
    },
  ],
]);

/** Bundles composed from `base`; the Tailwind-only Modern engine bundles carry no residual. */
const BASE_COMPOSED = new Set(
  MODERN_BUNDLES.filter((rel) => !rel.endsWith('modern-engine.css') && !rel.includes('/engines/modern/')),
);

export const SHARED_IDENTICAL = new Map([
  [
    '@keyframes ds-spin{to{transform:rotate(360deg);}}',
    'presentation/components/skin/data-table-interactions authors the same keyframe; rustic/theme keeps its own copy',
  ],
]);

const norm = (text) => text.replace(/\s+/g, ' ').replace(/\s*([{};:,>])\s*/g, '$1').trim();

/** Every rule and keyframe of a stylesheet, normalized, with its at-rule context. */
export function ruleTexts(css) {
  const out = new Set();
  const root = postcss.parse(css);
  root.walkAtRules(/keyframes$/, (at) => {
    out.add(norm(`@keyframes ${at.params}{${at.nodes.map((n) => n.toString()).join('')}}`));
  });
  root.walkRules((rule) => {
    if (rule.parent.type === 'atrule' && /keyframes$/.test(rule.parent.name)) return;
    const decls = rule.nodes.filter((n) => n.type === 'decl').map((d) => `${d.prop}:${d.value}${d.important ? '!important' : ''}`);
    if (decls.length === 0) return;
    const context = [];
    for (let p = rule.parent; p && p.type === 'atrule'; p = p.parent) {
      if (p.name !== 'layer') context.unshift(`@${p.name} ${p.params}`);
    }
    out.add(norm(`${context.join('')}${rule.selector}{${decls.join(';')}}`));
  });
  return out;
}

function closureRules(files) {
  const all = new Set();
  for (const file of files) {
    if (!file.endsWith('.css')) continue;
    for (const text of ruleTexts(readFileSync(file, 'utf8'))) all.add(text);
  }
  return all;
}

function frozenFilesOnDisk(cssRoot) {
  const out = [];
  const walk = (dir) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'tests') walk(full);
      } else if (entry.name.endsWith('.css')) out.push(full);
    }
  };
  walk(resolve(cssRoot, 'runtime/engines/classic'));
  walk(resolve(cssRoot, 'runtime/engines/rustic'));
  return out;
}

export function auditFrozenSplit({
  cssRoot,
  packageRoot,
  built = false,
  sharedIdentical = SHARED_IDENTICAL,
  frozenGatedInBase = FROZEN_GATED_IN_BASE,
}) {
  const failures = [];
  const rel = (file) => relative(cssRoot, file).replaceAll('\\', '/');
  const baseEntry = resolve(cssRoot, 'facade/entrypoints/base/index.css');
  const mount = resolve(cssRoot, FROZEN_ENGINE_MOUNT);
  if (!existsSync(baseEntry)) return [`base entrypoint missing: ${rel(baseEntry)}`];
  if (!existsSync(mount)) return [`frozen-engine mount missing: ${rel(mount)}`];

  const baseClosure = [...importClosure(baseEntry)];
  const mountClosure = [...importClosure(mount)];
  for (const file of baseClosure) {
    if (FROZEN_ENGINE_SOURCE.test(file)) failures.push(`source: base reaches frozen-engine stylesheet ${rel(file)}`);
  }
  for (const file of mountClosure) {
    if (file === mount || FROZEN_ENGINE_SOURCE.test(file) || !file.endsWith('.css')) continue;
    postcss.parse(readFileSync(file, 'utf8')).walkRules((rule) => {
      if (rule.parent.type === 'atrule' && /keyframes$/.test(rule.parent.name)) return;
      if (!rule.selectors.every((member) => FROZEN_SELECTOR_SIGNATURE.test(member))) {
        failures.push(`source: mounted shared stylesheet ${rel(file)} carries a rule not gated on a frozen engine: ${rule.selector.replace(/\s+/g, ' ').slice(0, 120)}`);
      }
    });
  }
  const residualSeen = new Set();
  for (const file of baseClosure) {
    if (!file.endsWith('.css')) continue;
    const pin = frozenGatedInBase.get(rel(file));
    let gated = 0;
    postcss.parse(readFileSync(file, 'utf8')).walkRules((rule) => {
      const hit = rule.selectors.find((member) => FROZEN_SELECTOR_SIGNATURE.test(member));
      if (!hit) return;
      gated += 1;
      if (!pin) failures.push(`source: ${rel(file)} ships a frozen-engine selector to every bundle: ${hit.replace(/\s+/g, ' ').slice(0, 120)}`);
    });
    if (pin) {
      residualSeen.add(rel(file));
      if (gated !== pin.rules) failures.push(`source: pinned residual ${rel(file)} carries ${gated} frozen-gated rule(s), pinned ${pin.rules}; re-measure the pin with its mover`);
    }
  }
  for (const key of frozenGatedInBase.keys()) {
    if (!residualSeen.has(key)) failures.push(`source: stale FROZEN_GATED_IN_BASE entry ${key} (base no longer reaches it)`);
  }
  const residualRules = [...frozenGatedInBase.values()].reduce((sum, pin) => sum + pin.rules, 0);
  const mounted = new Set(mountClosure);
  for (const file of frozenFilesOnDisk(cssRoot)) {
    if (!mounted.has(file)) failures.push(`source: frozen stylesheet ${rel(file)} ships in no bundle (not reachable from the mount)`);
  }

  const frozenRules = closureRules(mountClosure.filter((file) => file !== mount));
  if (frozenRules.size === 0) failures.push('rule-text: the frozen closure yields no rules; this arm would pass vacuously');
  const baseRules = closureRules(baseClosure);
  for (const text of sharedIdentical.keys()) {
    if (!frozenRules.has(text) || !baseRules.has(text)) failures.push(`rule-text: stale SHARED_IDENTICAL entry ${text}`);
  }
  const leaked = [...frozenRules].filter((text) => baseRules.has(text) && !sharedIdentical.has(text));
  for (const text of leaked.slice(0, 20)) failures.push(`rule-text: base carries frozen rule ${text.slice(0, 160)}`);
  if (leaked.length > 20) failures.push(`rule-text: ... and ${leaked.length - 20} more`);

  if (built) {
    for (const bundle of MODERN_BUNDLES) {
      const path = resolve(packageRoot, bundle);
      if (!existsSync(path)) {
        failures.push(`bytes: ${bundle} is missing; build first`);
        continue;
      }
      const css = readFileSync(path, 'utf8');
      const shipped = ruleTexts(css);
      const inBundle = [...frozenRules].filter((text) => shipped.has(text) && !sharedIdentical.has(text));
      if (inBundle.length > 0) {
        failures.push(`bytes: ${bundle} carries ${inBundle.length} frozen rule(s), first: ${inBundle[0].slice(0, 160)}`);
      }
      let signed = 0;
      let first = '';
      postcss.parse(css).walkRules((rule) => {
        if (FROZEN_SELECTOR_SIGNATURE.test(rule.selector)) {
          signed += 1;
          if (!first) first = rule.selector.replace(/\s+/g, ' ').slice(0, 160);
        }
      });
      const allowed = BASE_COMPOSED.has(bundle) ? residualRules : 0;
      if (signed !== allowed) {
        failures.push(`bytes: ${bundle} carries ${signed} frozen-engine selector rule(s), expected the pinned residual ${allowed}; first: ${first}`);
      }
    }
    for (const frozenBundle of [FROZEN_ENGINE_BUNDLE.dist, FROZEN_ENGINE_BUNDLE.mirror]) {
      const path = resolve(packageRoot, frozenBundle);
      if (!existsSync(path)) {
        failures.push(`bytes: ${frozenBundle} is missing; build first`);
        continue;
      }
      const shipped = ruleTexts(readFileSync(path, 'utf8'));
      const missing = [...frozenRules].filter((text) => !shipped.has(text));
      if (missing.length > 0) {
        failures.push(`bytes: ${frozenBundle} lacks ${missing.length} frozen rule(s), first: ${missing[0].slice(0, 160)}`);
      }
    }
  }
  return failures;
}

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const packageRoot = resolve(argumentValue('--package-root') ?? findPackageRoot(scriptDir));
  const cssRoot = resolve(argumentValue('--css-root') ?? resolve(packageRoot, 'src/foundation/tokens/css'));
  const failures = auditFrozenSplit({ cssRoot, packageRoot, built: process.argv.includes('--built') });
  if (failures.length > 0) {
    console.error(`frozen-split-gate: FAIL -- ${failures.length} finding(s):`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }
  console.log(`frozen-split-gate: OK -- ${process.argv.includes('--built') ? 'source, rule-text and bytes' : 'source and rule-text'} arms`);
}
