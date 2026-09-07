#!/usr/bin/env node

/**
 * instance-override-subordination-gate — the app cannot outrank the tenant.
 *
 * WHY THIS GATE EXISTS (F-18). `SurfaceVisualOverrides` is 12 visual fields
 * that 30 surface configs accept, and `useSurfaceProfileDefaultsWithOverrides`
 * applied them with the HIGHEST precedence in the chain and with no validation
 * at all. That is a second customization path: an app repository could decide
 * badge shape, entrance motion or density from its own source and the tenant's
 * theme lost, silently, on every screen that passed a config object.
 *
 * WO-CAN-04 subordinated the path — every selection is adjudicated against the
 * catalog and refused on any channel the tenant decided. This gate exists so
 * the NEXT field cannot reopen it, because the failure mode is invisible: a
 * thirteenth override that nobody mapped to a tenant channel simply wins, and
 * no test that does not already know about it will notice.
 *
 * THE LAW, in three clauses over the real sources:
 *
 *   1. COMPLETENESS. Every field declared in `SurfaceVisualOverrides` has an
 *      admitted domain in `SURFACE_VISUAL_OVERRIDE_CATALOG` and at least one
 *      tenant channel in `SURFACE_VISUAL_OVERRIDE_TENANT_CHANNELS`.
 *   2. NO SURPLUS. Neither map declares a field the contract does not.
 *   3. ONE DOOR. The hook that applies selections reads them only through
 *      `admitInstanceOverrides`; a direct `overrides.<field>` read in the merge
 *      is a bypass of the adjudication, which is how the original defect was
 *      written.
 *
 * There is NO baseline. A finding is a failure.
 *
 * --check (default)  exit 1 listing every finding.
 * --drill            run the three clauses against planted sources that each
 *                    violate exactly one, and require each to be reported.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = findPackageRoot(HERE);

const CHROME_ROOT = 'src/components/structures/foundation/chrome';
const OVERRIDES_ROOT = `${CHROME_ROOT}/runtime/profile-defaults/overrides`;

export const SOURCES = Object.freeze({
  contract: `${CHROME_ROOT}/contracts/index.ts`,
  catalog: `${OVERRIDES_ROOT}/catalog/index.ts`,
  merge: `${OVERRIDES_ROOT}/index.ts`,
});

/** The adjudication door every applied selection must pass through. */
export const ADMISSION_FUNCTION = 'admitInstanceOverrides';

function block(source, header, anchor) {
  const start = source.indexOf(header);
  if (start === -1) return null;
  const anchored = anchor === undefined ? start : source.indexOf(anchor, start);
  if (anchored === -1) return null;
  const open = source.indexOf('{', anchored);
  if (open === -1) return null;
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    else if (source[index] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(open + 1, index);
    }
  }
  return null;
}

/** The property names declared at the top level of an interface/object body. */
function propertyNames(body) {
  if (body === null) return null;
  const withoutComments = body
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');
  const names = [];
  let depth = 0;
  for (const line of withoutComments.split('\n')) {
    const trimmed = line.trim();
    if (depth === 0) {
      const match = /^([A-Za-z_$][\w$]*)\??\s*:/.exec(trimmed);
      if (match) names.push(match[1]);
    }
    depth += (line.match(/[{[(]/g) ?? []).length;
    depth -= (line.match(/[}\])]/g) ?? []).length;
  }
  return names;
}

/**
 * The three clauses, over source text rather than over a runtime import: the
 * gate must be able to read a PLANTED source in the drill, and importing the
 * TypeScript modules would need a compile step that this pre-build gate is not
 * allowed to depend on.
 */
export function analyseSubordination({ contract, catalog, merge }) {
  const findings = [];

  const declared = propertyNames(block(contract, 'export interface SurfaceVisualOverrides'));
  const admitted = propertyNames(block(catalog, 'export const SURFACE_VISUAL_OVERRIDE_CATALOG', 'Object.freeze('));
  const channels = propertyNames(block(catalog, 'export const SURFACE_VISUAL_OVERRIDE_TENANT_CHANNELS', 'Object.freeze('));

  if (declared === null) return [{ clause: 'sources', detail: 'SurfaceVisualOverrides was not found in the contract source' }];
  if (admitted === null) return [{ clause: 'sources', detail: 'SURFACE_VISUAL_OVERRIDE_CATALOG was not found in the catalog source' }];
  if (channels === null) return [{ clause: 'sources', detail: 'SURFACE_VISUAL_OVERRIDE_TENANT_CHANNELS was not found in the catalog source' }];

  for (const field of declared) {
    if (!admitted.includes(field)) {
      findings.push({ clause: 'completeness', detail: `${field}: declared in SurfaceVisualOverrides with no admitted domain in the catalog` });
    }
    if (!channels.includes(field)) {
      findings.push({ clause: 'completeness', detail: `${field}: declared in SurfaceVisualOverrides with no tenant channel, so the tenant cannot outrank it` });
    }
  }
  for (const field of admitted) {
    if (!declared.includes(field)) {
      findings.push({ clause: 'no-surplus', detail: `${field}: admitted by the catalog but not declared in SurfaceVisualOverrides` });
    }
  }
  for (const field of channels) {
    if (!declared.includes(field)) {
      findings.push({ clause: 'no-surplus', detail: `${field}: mapped to a tenant channel but not declared in SurfaceVisualOverrides` });
    }
  }

  if (!merge.includes(ADMISSION_FUNCTION)) {
    findings.push({ clause: 'one-door', detail: `the merge does not call ${ADMISSION_FUNCTION}; selections are applied unadjudicated` });
  }
  const bypass = /(?<![\w$.])overrides\s*[.[]/g;
  const mergeBody = block(merge, 'export function useSurfaceProfileDefaultsWithOverrides');
  for (const match of (mergeBody ?? '').matchAll(bypass)) {
    const line = (mergeBody ?? '').slice(0, match.index).split('\n').length;
    findings.push({
      clause: 'one-door',
      detail: `the merge reads a raw selection ("${match[0].trim()}") at body line ${line}; every read must come from ${ADMISSION_FUNCTION}`,
    });
  }

  return findings;
}

function readSources() {
  return {
    contract: readFileSync(join(PACKAGE_ROOT, SOURCES.contract), 'utf8'),
    catalog: readFileSync(join(PACKAGE_ROOT, SOURCES.catalog), 'utf8'),
    merge: readFileSync(join(PACKAGE_ROOT, SOURCES.merge), 'utf8'),
  };
}

const PLANTED = Object.freeze([
  {
    clause: 'completeness',
    mutate: (sources) => ({
      ...sources,
      contract: sources.contract.replace(
        'export interface SurfaceVisualOverrides {',
        'export interface SurfaceVisualOverrides {\n  plantedDial?: string;',
      ),
    }),
  },
  {
    clause: 'no-surplus',
    mutate: (sources) => {
      const marker = 'export const SURFACE_VISUAL_OVERRIDE_CATALOG';
      const start = sources.catalog.indexOf(marker);
      const open = start === -1 ? -1 : sources.catalog.indexOf('Object.freeze({', start);
      if (open === -1) return sources;
      const cut = open + 'Object.freeze({'.length;
      return {
        ...sources,
        catalog: `${sources.catalog.slice(0, cut)}\n  plantedDial: { kind: 'enum', values: Object.freeze(['a']) },${sources.catalog.slice(cut)}`,
      };
    },
  },
  {
    clause: 'one-door',
    mutate: (sources) => ({
      ...sources,
      merge: sources.merge.replace(
        'const density = admitted.density ?? base.density;',
        'const density = overrides.density ?? base.density;',
      ),
    }),
  },
]);

function main(argv) {
  const sources = readSources();

  if (argv.includes('--drill')) {
    const missed = [];
    for (const negative of PLANTED) {
      const mutated = negative.mutate(sources);
      if (JSON.stringify(mutated) === JSON.stringify(sources)) {
        missed.push(`${negative.clause} (the planted mutation did not apply; the drill is stale)`);
        continue;
      }
      const findings = analyseSubordination(mutated);
      if (!findings.some((finding) => finding.clause === negative.clause)) {
        missed.push(negative.clause);
      }
    }
    if (missed.length > 0) {
      console.error(`instance-override-subordination-gate DRILL FAILED — planted violations not reported: ${missed.join(', ')}`);
      return 1;
    }
    console.log(`instance-override-subordination-gate DRILL OK — all ${PLANTED.length} planted violations were reported.`);
    return 0;
  }

  const findings = analyseSubordination(sources);
  if (findings.length === 0) {
    console.log('instance-override-subordination-gate OK — every SurfaceVisualOverrides field is catalog-modelled, tenant-mapped, and applied only through the admission door.');
    return 0;
  }

  console.error(`instance-override-subordination-gate FAILED — ${findings.length} finding(s):`);
  for (const finding of findings) {
    console.error(`  [${finding.clause}] ${finding.detail}`);
  }
  return 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
