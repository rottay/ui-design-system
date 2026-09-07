#!/usr/bin/env node
/**
 * controls-catalog — the public control document, GENERATED from the typed
 * catalog (`src/contracts/theme/runtime/catalog`).
 *
 * It replaces the view that joined the capability registry with the
 * customization-surface census. That view was the fifth listing F-04 counted,
 * it needed `dist/` to read a runtime registry, and its "live reads" column
 * described the census rather than the control. This one describes exactly what
 * the catalog declares -- tier, closed domain, keypath, declared fan-out,
 * minimum families, envelope and measured effect -- and nothing it cannot
 * source from there.
 *
 * COMMAND GRAMMAR (closed, exactly ONE token):
 *   --write                    regenerate the view
 *   --check                    fail on: missing view, digest drift, a catalog
 *                              row absent from the view, or a row that claims
 *                              paint (`effect: css-channels`) with no producer
 *   --drill=stale              self-inject each violation and prove THAT drill
 *   --drill=missing-control    produced ITS OWN cause. A drill that only
 *   --drill=unproduced-effect  inherits a baseline failure FAILS.
 *
 * Exit codes: 0 = ok / causal drill · 1 = gate red or vacuous drill ·
 *             2 = invalid usage.
 */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';
import {
  readThemeCatalog,
  readThemeCatalogAnnex,
  readThemeCatalogRetired,
} from '../../../libraries/theme-catalog/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = findPackageRoot(HERE);
const OUT_DIR = join(ROOT, 'docs/generated/customization-controls');
const OUT = join(OUT_DIR, 'index.md');

const DRILL_STALE_CANDIDATE = 'deadbeef';
const DRILL_GHOST_ID = 'drill.ghost';
const DRILL_UNPRODUCED_ID = 'drill.unproduced-effect';

const defineDrill = ({ injects, expectedCause }) => Object.freeze({
  injects,
  expectedCause,
  matches: (failure) => failure.includes(expectedCause),
});

export const DRILL_CASES = Object.freeze({
  stale: defineDrill({
    injects: `stored digest replaced by the candidate "${DRILL_STALE_CANDIDATE}"`,
    expectedCause: `observed=${DRILL_STALE_CANDIDATE}`,
  }),
  'missing-control': defineDrill({
    injects: `synthetic catalog row "${DRILL_GHOST_ID}" the view does not contain`,
    expectedCause: `absent from the view: ${DRILL_GHOST_ID}`,
  }),
  'unproduced-effect': defineDrill({
    injects: `synthetic row "${DRILL_UNPRODUCED_ID}" claiming css-channels with no producer`,
    expectedCause: `claims paint with no producer (drill): ${DRILL_UNPRODUCED_ID}`,
  }),
});

export const DRILL_NAMES = Object.freeze(Object.keys(DRILL_CASES));

export const USAGE = `controls-catalog USAGE — exactly ONE command: --check | --write | ${DRILL_NAMES.map((n) => `--drill=${n}`).join(' | ')}`;

export function parseCommand(argv) {
  if (!Array.isArray(argv)) return { ok: false, error: 'argv must be an array of tokens' };
  if (argv.length === 0) return { ok: false, error: 'no command: exactly ONE token is required' };
  if (argv.length > 1) {
    return { ok: false, error: `${argv.length} tokens received: the grammar admits exactly ONE` };
  }
  const [token] = argv;
  if (typeof token !== 'string') return { ok: false, error: 'the token must be a string' };
  if (token === '--check') return { ok: true, command: 'check' };
  if (token === '--write') return { ok: true, command: 'write' };
  if (token === '--drill') return { ok: false, error: 'bare `--drill`: `--drill=<case>` is required' };
  if (token.startsWith('--drill=')) {
    const drill = token.slice('--drill='.length);
    if (drill === '') return { ok: false, error: 'empty `--drill=`: a case of the grammar is required' };
    if (!Object.hasOwn(DRILL_CASES, drill)) {
      return { ok: false, error: `unknown drill "${drill}": the grammar is closed (${DRILL_NAMES.join(', ')})` };
    }
    return { ok: true, command: 'drill', drill };
  }
  return { ok: false, error: `unrecognised token "${token}"` };
}

function domainText(domain) {
  switch (domain.kind) {
    case 'enum':
      return domain.values.map((value) => `\`${value}\``).join(' \\| ');
    case 'scale':
      return `[${domain.bounds.min} – ${domain.bounds.max}]`;
    case 'color-set':
      return `${domain.roles.length} colours (${domain.roles.join(', ')})`;
    case 'record':
      return `${domain.keys.length} keys (${domain.keys.join(', ')})${
        domain.values ? `, ${domain.values.length} values` : ''
      }`;
    case 'registered':
      return `registered ids (\`${domain.registry}\`)`;
    default:
      return domain.kind;
  }
}

function minimumText(minimum) {
  if (minimum.kind === 'declared-ratio') {
    return `${minimum.families}/${minimum.denominator} (declared fan-out)`;
  }
  if (minimum.kind === 'declared-fan-out') {
    return minimum.families.length > 0
      ? `declared fan-out: ${minimum.families.join(', ')}`
      : 'declared fan-out (the row names no separate family list)';
  }
  return `owner-pending — the kit's example is \`>= ${minimum.referenceExample}/${minimum.denominator}\` and is NOT a binding floor`;
}

function producesText(row) {
  const channels = row.produces.channels.length;
  const attributes = row.produces.rootAttributes.length;
  if (channels === 0 && attributes === 0) return '—';
  const parts = [];
  if (channels > 0) parts.push(`${channels} channel${channels === 1 ? '' : 's'}`);
  if (attributes > 0) parts.push(`${attributes} root attribute${attributes === 1 ? '' : 's'}`);
  return parts.join(' + ');
}

function controlRow(row) {
  return [
    `\`${row.id}\``,
    String(row.kitRow),
    row.title,
    domainText(row.domain),
    row.keypath.document ? `\`${row.keypath.document}\`` : '—',
    producesText(row),
    minimumText(row.minimumFamilies),
    row.envelope,
    row.effect,
  ].join(' | ');
}

export function build(rows = readThemeCatalog()) {
  const annex = readThemeCatalogAnnex();
  const retired = readThemeCatalogRetired();
  const byTier = (tier) => rows.filter((row) => row.tier === tier);

  const header =
    '| id | kit row | control | closed domain | document keypath | declared fan-out | minimum families | envelope (D-28 b) | effect today |';
  const separator = '|---|---|---|---|---|---|---|---|---|';
  const table = (subset) =>
    [header, separator, ...subset.map((row) => `| ${controlRow(row)} |`)].join('\n');

  const digest = createHash('sha256')
    .update(
      JSON.stringify(
        rows.map((row) => [
          row.id,
          row.kitRow,
          row.tier,
          row.domain,
          row.keypath,
          row.produces,
          row.minimumFamilies,
          row.envelope,
          row.effect,
        ]),
      ),
    )
    .update(JSON.stringify(annex))
    .update(JSON.stringify(retired))
    .digest('hex');

  const md = `# Customization controls — product API (generated)

> Generated by \`packages/core/scripts/generate/theme/controls-doc/index.mjs --write\`. Do not hand-edit.
> Source of truth: \`packages/core/src/contracts/theme/runtime/catalog\`, the single typed catalog.
> Tiers are Standard / Pro / Internal. \`internal\` is a PLAN, not a control tier, so no row carries it.
> Rollback: every control is an INPUT — removing the authored value restores the vertical's baseline.
> \`effect today\` is MEASURED, not intended: \`not-yet-derived\` means the row has no producer anywhere yet.

digest: ${digest}

## STANDARD — ${byTier('standard').length} controls

${table(byTier('standard'))}

## PRO — ${byTier('pro').length} controls

${table(byTier('pro'))}

## Outside the ${rows.length} decisions

These entries are part of the approved kit and are deliberately NOT decisions. None counts toward the catalog denominator.

${annex.map((entry) => `- \`${entry.id}\` (${entry.tier}, ${entry.status}) — ${entry.reason}`).join('\n')}

## Retired in v2

${retired.map((entry) => `- \`${entry.id}\` — ${entry.replacedBy}`).join('\n')}
`;
  return { md, digest, rows };
}

export function check({ drill } = {}) {
  if (drill !== undefined && !Object.hasOwn(DRILL_CASES, drill)) {
    throw new Error(`check(): unknown drill "${drill}" — the grammar is closed (${DRILL_NAMES.join(', ')})`);
  }
  const failures = [];
  const { digest, rows } = build();
  if (!existsSync(OUT)) return ['controls view missing — run --write'];
  const stored = readFileSync(OUT, 'utf8');
  const storedDigest = stored.match(/digest: ([0-9a-f]{64})/)?.[1];

  if (storedDigest !== digest) {
    failures.push(
      `controls view STALE vs the typed catalog — regenerate with --write (observed=${storedDigest ?? 'absent'}, expected=${digest})`,
    );
  }
  if (drill === 'stale' && DRILL_STALE_CANDIDATE !== digest) {
    failures.push(
      `controls view STALE vs the typed catalog (drill) — injected candidate (observed=${DRILL_STALE_CANDIDATE}, expected=${digest})`,
    );
  }

  const subjects = [...rows];
  if (drill === 'missing-control') {
    subjects.push({
      id: DRILL_GHOST_ID,
      tier: 'standard',
      effect: 'not-yet-derived',
      produces: { channels: [], rootAttributes: [] },
    });
  }
  if (drill === 'unproduced-effect') {
    subjects.push({
      id: DRILL_UNPRODUCED_ID,
      tier: 'pro',
      effect: 'css-channels',
      produces: { channels: [], rootAttributes: [] },
      drillInjected: true,
      skipPresenceCheck: true,
    });
  }

  for (const row of subjects) {
    if (!row.skipPresenceCheck && !stored.includes(`\`${row.id}\``)) {
      failures.push(`catalog row absent from the view: ${row.id}`);
    }
    // A row that says it paints must name what it paints. This is the honesty
    // rule the old "zero live reads" column was reaching for, stated against
    // the declaration instead of against a census.
    const declares =
      row.produces.channels.length > 0 || row.produces.rootAttributes.length > 0;
    if (row.effect === 'css-channels' || row.effect === 'root-attributes') {
      if (!declares) {
        failures.push(
          row.drillInjected
            ? `row claims paint with no producer (drill): ${row.id}`
            : `row claims paint with no producer: ${row.id}`,
        );
      }
    } else if (declares) {
      failures.push(
        `row declares a producer but its effect says otherwise: ${row.id} (${row.effect})`,
      );
    }
  }
  return failures;
}

function runWrite() {
  const { md, rows } = build();
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT, md);
  console.log(
    `controls-catalog: ${rows.filter((row) => row.tier === 'standard').length} standard + ${rows.filter((row) => row.tier === 'pro').length} pro written to docs/generated/customization-controls/index.md`,
  );
  return 0;
}

function runCheck() {
  const failures = check();
  if (failures.length > 0) {
    for (const failure of failures.slice(0, 10)) console.error(`controls-catalog FAIL — ${failure}`);
    if (failures.length > 10) console.error(`controls-catalog FAIL — … and ${failures.length - 10} more`);
    return 1;
  }
  console.log('controls-catalog --check OK');
  return 0;
}

function runDrill(name) {
  const definition = DRILL_CASES[name];
  const failures = check({ drill: name });
  const causal = failures.filter((failure) => definition.matches(failure));
  const baseline = failures.filter((failure) => !definition.matches(failure));

  if (causal.length === 0) {
    console.error(`controls-catalog DRILL FAIL — ${name} did not produce ITS OWN violation`);
    console.error(`  injected: ${definition.injects}`);
    console.error(`  expected cause: ${definition.expectedCause}`);
    for (const failure of baseline.slice(0, 10)) {
      console.error(`  baseline failure (does NOT credit the drill): ${failure}`);
    }
    if (baseline.length === 0) console.error('  (no baseline failures: the gate went completely silent)');
    return 1;
  }

  console.log(`controls-catalog drill "${name}" OK — ${causal.length} own causal violation(s)`);
  for (const failure of causal) console.log(`  own cause: ${failure}`);
  if (baseline.length > 0) {
    console.log(`  (${baseline.length} pre-existing baseline failure(s), excluded from the drill verdict)`);
  }
  return 0;
}

export function main(argv = process.argv.slice(2)) {
  const parsed = parseCommand(argv);
  if (!parsed.ok) {
    console.error(USAGE);
    console.error(`  received: ${JSON.stringify(argv)}`);
    console.error(`  reason: ${parsed.error}`);
    process.exitCode = 2;
    return 2;
  }
  const code =
    parsed.command === 'write'
      ? runWrite()
      : parsed.command === 'check'
        ? runCheck()
        : runDrill(parsed.drill);
  process.exitCode = code;
  return code;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main();
}
