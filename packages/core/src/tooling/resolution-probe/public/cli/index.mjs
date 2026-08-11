/**
 * @fileoverview The three commands.
 *
 *   run    measure every (vertical × theme × fixture × property) → artifact
 *   dial   set one tenant input, re-read, report exactly what moved
 *   diff   compare two artifacts
 *
 * Exit codes are meaningful and are the only thing a caller should branch on.
 * `dial` exits non-zero when the harness's own controls did not move, because
 * a run that cannot be shown to observe movement has not measured anything —
 * and a green exit on such a run is how an instrument starts lying.
 *
 *   0  ran, and (for `dial`) the controls moved
 *   1  a fixture no longer matches the CSS, or the controls did not move
 *   2  bad invocation
 *
 * @module Tooling/ResolutionProbe/Public/Cli
 */

import { writeFileSync } from 'node:fs';
import { readFileSync } from 'node:fs';

import { diffArtifacts } from '../../composition/diff/index.mjs';
import { runProbe, serialiseArtifact } from '../../composition/run/index.mjs';
import { BUNDLE_MODES } from '../../runtime/bundle/index.mjs';
import { FIXTURE_IDS } from '../../foundation/roster/index.mjs';
import { SCOPE_KEYS, THEMES, VERTICAL_KEYS } from '../../foundation/scope/index.mjs';

const USAGE = `resolution-probe — what the browser actually paints, per tenant.

  node src/tooling/resolution-probe/public/cli/index.mjs run  [options]
  node src/tooling/resolution-probe/public/cli/index.mjs dial --set <--var=value> [options]
  node src/tooling/resolution-probe/public/cli/index.mjs diff <before.json> <after.json>

Options
  --out <path>            write the artifact here (default: stdout)
  --bundle <mode>         ${BUNDLE_MODES.join(' | ')}   (default: fresh)
  --vertical <k>          repeatable; default all: ${VERTICAL_KEYS.join(', ')}
                          plus 'none' — the tenant-less document (base + engine, no
                          artifact). Opt-in: a base-layer defect is invisible in every
                          tenanted cell, because an artifact outranks the base layer.
  --theme <t>             repeatable; default all: ${THEMES.join(', ')}
  --fixture <id>          repeatable; default all: ${FIXTURE_IDS.join(', ')}
  --set <--var=value>     dial only; repeatable
  --dial-target <where>   dial only; root | fixture   (default: root)
  --quiet                 suppress the human summary on stderr

Bundle modes
  fresh   recompose from src/foundation/tokens/css in memory (no build). Default,
          because it is the only mode whose freshness can be proven here.
  dist    the shipped bundle. Currently STALE: scripts/vertical-css-staleness.gate.mjs
          fails on all five committed bundles. Readings are labelled accordingly.
  styles  the committed mirror; verified byte-identical to dist.
`;

export async function main(argv) {
  const command = argv[0];
  if (!command || command === '--help' || command === '-h') {
    process.stdout.write(USAGE);
    return 0;
  }
  if (command === 'diff') return commandDiff(argv.slice(1));
  if (command !== 'run' && command !== 'dial') {
    process.stderr.write(`resolution-probe: unknown command "${command}"\n\n${USAGE}`);
    return 2;
  }

  let options;
  try {
    options = parseOptions(argv.slice(1));
  } catch (error) {
    process.stderr.write(`resolution-probe: ${error.message}\n\n${USAGE}`);
    return 2;
  }
  if (command === 'dial' && !options.dial) {
    process.stderr.write('resolution-probe: `dial` requires at least one --set --var=value\n');
    return 2;
  }

  const artifact = await runProbe({
    verticals: options.verticals,
    themes: options.themes,
    fixtures: options.fixtures,
    bundleMode: options.bundleMode,
    dial: command === 'dial' ? options.dial : null,
    dialTarget: options.dialTarget,
  });

  const serialised = serialiseArtifact(artifact);
  if (options.out) writeFileSync(options.out, serialised);
  else process.stdout.write(serialised);

  if (!options.quiet) process.stderr.write(summarise(artifact, options));

  if (artifact.unmatched.length > 0) return 1;
  if (artifact.dial && artifact.dial.controls.verdict === 'harness-suspect') return 1;
  return 0;
}

function parseOptions(argv) {
  const options = {
    out: null,
    bundleMode: 'fresh',
    verticals: [],
    themes: [],
    fixtures: [],
    dial: null,
    dialTarget: 'root',
    quiet: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    const next = () => {
      const value = argv[index + 1];
      if (value === undefined) throw new Error(`${flag} needs a value`);
      index += 1;
      return value;
    };
    switch (flag) {
      case '--out':
        options.out = next();
        break;
      case '--bundle': {
        const mode = next();
        if (!BUNDLE_MODES.includes(mode)) throw new Error(`unknown --bundle ${mode}`);
        options.bundleMode = mode;
        break;
      }
      case '--vertical': {
        const vertical = next();
        if (!SCOPE_KEYS.includes(vertical))
          throw new Error(`unknown --vertical ${vertical} (known: ${SCOPE_KEYS.join(', ')})`);
        options.verticals.push(vertical);
        break;
      }
      case '--theme': {
        const theme = next();
        if (!THEMES.includes(theme)) throw new Error(`unknown --theme ${theme}`);
        options.themes.push(theme);
        break;
      }
      case '--fixture': {
        const fixture = next();
        if (!FIXTURE_IDS.includes(fixture)) throw new Error(`unknown --fixture ${fixture}`);
        options.fixtures.push(fixture);
        break;
      }
      case '--set': {
        const assignment = next();
        const separator = assignment.indexOf('=');
        if (separator < 1 || !assignment.startsWith('--')) {
          throw new Error(`--set expects --custom-property=value, got "${assignment}"`);
        }
        options.dial ??= {};
        options.dial[assignment.slice(0, separator)] = assignment.slice(separator + 1);
        break;
      }
      case '--dial-target': {
        const target = next();
        if (target !== 'root' && target !== 'fixture') {
          throw new Error(`--dial-target must be root or fixture, got "${target}"`);
        }
        options.dialTarget = target;
        break;
      }
      case '--quiet':
        options.quiet = true;
        break;
      default:
        throw new Error(`unknown flag ${flag}`);
    }
  }
  return {
    ...options,
    verticals: options.verticals.length > 0 ? options.verticals : VERTICAL_KEYS,
    themes: options.themes.length > 0 ? options.themes : THEMES,
    fixtures: options.fixtures.length > 0 ? options.fixtures : null,
  };
}

function summarise(artifact, options) {
  const lines = [];
  const { bundleMode } = artifact.provenance;
  lines.push(
    `resolution-probe | bundle=${bundleMode} | verticals=${artifact.scopeOfRun.verticals.join(
      ',',
    )} | themes=${artifact.scopeOfRun.themes.join(',')} | fixtures=${
      artifact.scopeOfRun.fixtures.length
    } | browser=${artifact.provenance.browser.browserVersion}`,
  );
  for (const [vertical, provenance] of Object.entries(artifact.provenance.bundles)) {
    const drift = provenance.shippedDistDrift;
    // A null drift has two causes and they are opposite claims: the shipped
    // bundle was read as-is (freshness unproven), or there is no shipped
    // bundle to compare a freshly composed one against (tenant-less). Printing
    // the first for the second states the exact opposite of what happened.
    const driftNote = !drift
      ? provenance.freshnessProven
        ? 'composed from source; nothing shipped to compare against'
        : 'freshness NOT proven (shipped bundle read as-is)'
      : drift.identical
        ? 'matches shipped dist'
        : drift.prefixIdentical
          ? `matches shipped dist + ${drift.shippedTailBytes}B tail (spring block; see the staleness gate)`
          : `shipped dist diverges from src at line ${drift.firstDifferingLine}`;
    lines.push(`  ${vertical}: sha=${provenance.sha256.slice(0, 12)} | ${driftNote}`);
  }
  for (const row of artifact.unmatched) {
    lines.push(`  UNMATCHED ${row.scope} ${row.fixtureId}: ${row.missingSelectors.join(' | ')}`);
  }
  if (artifact.dial) {
    const { totals, controls, applied, target } = artifact.dial;
    lines.push(
      `  dial ${Object.entries(applied)
        .map(([name, value]) => `${name}=${value}`)
        .join(' ')} at ${target}: moved=${totals.movedProperties} inert=${
        totals.inertProperties
      } (${totals.scope})`,
    );
    lines.push(`  controls: ${controls.verdict} — ${controls.meaning}`);
    for (const [scope, targets] of Object.entries(artifact.dial.movements)) {
      for (const [targetKey, properties] of Object.entries(targets)) {
        const movedRows = Object.entries(properties).filter(([, row]) => row.moved);
        if (movedRows.length === 0) continue;
        for (const [property, row] of movedRows) {
          lines.push(`    MOVED ${scope} ${targetKey} ${property}: ${row.from} -> ${row.to}`);
        }
      }
    }
  }
  if (options.out) lines.push(`  artifact: ${options.out}`);
  return `${lines.join('\n')}\n`;
}

function commandDiff(argv) {
  if (argv.length !== 2) {
    process.stderr.write('resolution-probe: diff needs exactly two artifact paths\n');
    return 2;
  }
  const [beforePath, afterPath] = argv;
  const result = diffArtifacts(
    JSON.parse(readFileSync(beforePath, 'utf-8')),
    JSON.parse(readFileSync(afterPath, 'utf-8')),
  );
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.comparable) {
    process.stderr.write(
      'resolution-probe: the two runs did not measure the same question; see ' +
        'provenanceDifferences before reading the changes.\n',
    );
  }
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main(process.argv.slice(2))
    .then((code) => process.exit(code))
    .catch((error) => {
      process.stderr.write(`resolution-probe: ${error.stack ?? error.message}\n`);
      process.exit(1);
    });
}
