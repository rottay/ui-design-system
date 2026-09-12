#!/usr/bin/env node
/**
 * ONE RESPONSIVE MECHANISM (WO-INV-04 / F-46, F-35).
 *
 * The audit found six responsive authorities in structures and surfaces, a
 * per-instance `<style dangerouslySetInnerHTML>` in every responsive primitive,
 * and 36 `@container` queries attached to whatever ancestor happened to be a
 * container. This gate is the four measurements that say it stayed collapsed.
 *
 *   (a) NO PER-INSTANCE STYLESHEET. `dangerouslySetInnerHTML` under
 *       `src/components/primitives/inputs` must be zero: a responsive size that
 *       arrives as an injected stylesheet is dropped by a strict CSP.
 *
 *   (b) DYNAMIC VIEWPORT. `100vh` / `100vw` must not appear under `src`. Mobile
 *       browser chrome makes them lie about the visible area; `dvh`/`dvw` do not.
 *
 *   (c) ONE AUTHORITY. Only `infrastructure/runtime/responsive` may DERIVE
 *       viewport state: no width-based `matchMedia` and no `min-width`/
 *       `max-width` query construction lives anywhere else. Exceptions are
 *       declared by path WITH a reason, never silently.
 *
 *   (d) EVERY SURFACE CONSUMES IT. Each page surface that behaves responsively
 *       must reach that authority -- directly, or through a PURE
 *       `ResponsiveValue` builder that derives nothing of its own.
 *
 * Usage:
 *   node scripts/check/responsive/single-authority/index.mjs          # report
 *   node scripts/check/responsive/single-authority/index.mjs --check  # exit 1 on any finding
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = findPackageRoot(HERE);
const SRC = join(ROOT, 'src');

/** The one module allowed to derive viewport state. */
export const RESPONSIVE_AUTHORITY = 'src/infrastructure/runtime/responsive';

/**
 * Width-query sites outside the authority that are NOT a second responsive
 * vocabulary, each with the reason it is not.
 */
export const DECLARED_EXCEPTIONS = Object.freeze({
  'src/components/primitives/layout/system/engines/modern/index.tsx':
    "Sider's `breakpoint` prop is an Ant-parity COMPATIBILITY ladder (480/576/768/992/1200/1600), documented as such at SIDER_BREAKPOINT_WIDTHS. Its values are a public API promise, not the DS ladder; rewriting them onto the DS steps would change what the prop means.",
  'src/foundation/contracts/kernel/responsive/breakpoints/index.ts':
    'The ladder itself: this is where the DS width queries are built.',
});

const toPosix = (p) => p.split(sep).join('/');
const rel = (p) => toPosix(relative(ROOT, p));

function walk(dir, test, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules') continue;
      walk(full, test, out);
    } else if (test(entry)) {
      out.push(full);
    }
  }
  return out;
}

const isSource = (name) => /\.(tsx?|css)$/.test(name);
const isProductionTs = (name) => /\.tsx?$/.test(name) && !/\.(test|spec|stories)\.tsx?$/.test(name);

/** (a) */
export function perInstanceStylesheets() {
  const root = join(SRC, 'components/primitives/inputs');
  return walk(root, isProductionTs)
    .filter((file) => readFileSync(file, 'utf8').includes('dangerouslySetInnerHTML'))
    .map(rel);
}

/** (b) */
export function staticViewportUnits() {
  const findings = [];
  for (const file of walk(SRC, isSource)) {
    const text = readFileSync(file, 'utf8');
    text.split('\n').forEach((line, index) => {
      if (/100vh|100vw/.test(line)) findings.push(`${rel(file)}:${index + 1}`);
    });
  }
  return findings;
}

/** (c) */
export function secondDerivations() {
  const findings = [];
  for (const file of walk(SRC, isProductionTs)) {
    const path = rel(file);
    if (path.startsWith(RESPONSIVE_AUTHORITY)) continue;
    if (path.includes('/tests/')) continue;
    if (DECLARED_EXCEPTIONS[path]) continue;
    const text = readFileSync(file, 'utf8');
    text.split('\n').forEach((line, index) => {
      if (/matchMedia\s*\(/.test(line) && /(min-width|max-width|\$\{)/.test(line)) {
        findings.push(`${path}:${index + 1} ${line.trim().slice(0, 90)}`);
      }
    });
  }
  return findings;
}

/** Every page surface owner, and whether it behaves responsively at all. */
export function surfaceAdoption() {
  const root = join(SRC, 'components/surfaces/presentation/pages');
  const surfaces = [];
  for (const group of readdirSync(root)) {
    const groupDir = join(root, group);
    if (!statSync(groupDir).isDirectory()) continue;
    for (const name of readdirSync(groupDir)) {
      const entry = join(groupDir, name, 'index.tsx');
      try {
        if (!statSync(entry).isFile()) continue;
      } catch {
        continue;
      }
      const text = readFileSync(entry, 'utf8');
      const responsive =
        /useResponsive\b|useResponsiveValue\b|useBreakpoints\b|surfaceStackingValue\b|surfaceColumnsValue\b|resolveSurfacePosture\b|useCollectionWorkspace\b/.test(
          text,
        );
      const reachesAuthority = /from ['"][^'"]*infrastructure\/runtime\/responsive['"]/.test(text)
        || /useCollectionWorkspace\b/.test(text);
      surfaces.push({ id: `${group}/${name}`, responsive, reachesAuthority });
    }
  }
  return surfaces;
}

/** (e) `@container` queries with no container named. */
export function unnamedContainerQueries() {
  const findings = [];
  for (const file of walk(SRC, (name) => name.endsWith('.css'))) {
    const text = readFileSync(file, 'utf8');
    text.split('\n').forEach((line, index) => {
      if (/@container\s*\(/.test(line)) findings.push(`${rel(file)}:${index + 1}`);
    });
  }
  return findings;
}

/** The one query that means "the nearest ancestor container", by design. */
export const DECLARED_UNNAMED_QUERY =
  'src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css';

export function run() {
  const stylesheets = perInstanceStylesheets();
  const viewportUnits = staticViewportUnits();
  const derivations = secondDerivations();
  const surfaces = surfaceAdoption();
  const unnamed = unnamedContainerQueries().filter(
    (finding) => !finding.startsWith(DECLARED_UNNAMED_QUERY),
  );

  const responsiveSurfaces = surfaces.filter((surface) => surface.responsive);
  const adopted = responsiveSurfaces.filter((surface) => surface.reachesAuthority);
  const unadopted = responsiveSurfaces.filter((surface) => !surface.reachesAuthority);

  return { stylesheets, viewportUnits, derivations, surfaces, responsiveSurfaces, adopted, unadopted, unnamed };
}

function main() {
  const result = run();
  const lines = [
    '[responsive-single-authority]',
    `  per-instance stylesheets (inputs) : ${result.stylesheets.length}`,
    `  static viewport units (100vh/vw)  : ${result.viewportUnits.length}`,
    `  viewport derivations outside it   : ${result.derivations.length}`,
    `  surfaces on the one authority     : ${result.adopted.length}/${result.responsiveSurfaces.length}`,
    `  unnamed @container queries        : ${result.unnamed.length} (1 declared exception excluded)`,
  ];
  for (const finding of [...result.stylesheets, ...result.viewportUnits, ...result.derivations, ...result.unnamed]) {
    lines.push(`  FINDING ${finding}`);
  }
  for (const surface of result.unadopted) lines.push(`  FINDING surface ${surface.id} does not reach the authority`);

  const failed =
    result.stylesheets.length > 0 ||
    result.viewportUnits.length > 0 ||
    result.derivations.length > 0 ||
    result.unnamed.length > 0 ||
    result.unadopted.length > 0;

  lines.push(failed ? '[responsive-single-authority] FAIL' : '[responsive-single-authority] OK');
  process.stdout.write(`${lines.join('\n')}\n`);
  if (failed && process.argv.includes('--check')) process.exitCode = 1;
}

if (process.argv[1] && toPosix(process.argv[1]).endsWith('check/responsive/single-authority/index.mjs')) {
  main();
}
