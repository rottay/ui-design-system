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

import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { diffArtifacts } from '../../composition/diff/index.mjs';
import {
  loadProgramContracts,
  ownedSourceFiles,
  REPOSITORY_ROOT,
  verifyReceipt,
  writeEvidence,
} from '../../composition/receipt/index.mjs';
import { runCausalProbe, runProbe, serialiseArtifact } from '../../composition/run/index.mjs';
import { buildDataCausalReport } from '../../composition/data-run/index.mjs';
import { readManifest } from '../../foundation/negative-controls/index.mjs';
import { CORE_ROOT } from '../../foundation/paths/index.mjs';
import { assertKnownTargetKeys, FIXTURE_IDS } from '../../foundation/roster/index.mjs';
import { SCOPE_KEYS, THEMES, VERTICAL_KEYS } from '../../foundation/scope/index.mjs';
import { BUNDLE_MODES, resolveBundle } from '../../runtime/bundle/index.mjs';
import {
  composeDbArm,
  dbTenantIdentity,
  composeStaticArm,
  INGRESS_ARM_IDS,
  INGRESS_ARMS,
  loadCompilerArms,
  assertStopDiscrimination,
  loadStaticBaselines,
  lowerStop,
  verticalDefaultMode,
} from '../../runtime/ingress/index.mjs';

/**
 * The default `negativeDrill` for a CLI causal receipt: this instrument's own
 * fail-closed proof, not a per-run claim. Every field is boilerplate about
 * the TOOL rather than about the calibration round, which is exactly why it
 * is safe to default: the round-specific identifiers (`roundId`, `familyId`,
 * `scenarioId`, `producer`) are never defaulted (see `commandCausal`).
 */
const DEFAULT_CAUSAL_NEGATIVE_DRILL = Object.freeze({
  violation:
    'a moved negative control, a non-restoring variable, a zero-match selector, an unhydrated ' +
    'target, or a stale source digest',
  failsClosed: true,
  proof:
    'node --test src/tooling/resolution-probe/foundation/causality/tests/index.test.mjs ' +
    'src/tooling/resolution-probe/foundation/guards/tests/index.test.mjs ' +
    'src/tooling/resolution-probe/foundation/negative-controls/tests/index.test.mjs ' +
    'src/tooling/resolution-probe/composition/run/tests/index.test.mjs',
});

const USAGE = `resolution-probe — what the browser actually paints, per tenant.

  node src/tooling/resolution-probe/public/cli/index.mjs run    [options]
  node src/tooling/resolution-probe/public/cli/index.mjs dial   --set <--var=value> [options]
  node src/tooling/resolution-probe/public/cli/index.mjs causal --control-manifest <path> \\
                                                               --stop <id> [options]
  node src/tooling/resolution-probe/public/cli/index.mjs data-causal --control-manifest <path> \\
                                                               --vertical <k> [--bypass-id <id>]
  node src/tooling/resolution-probe/public/cli/index.mjs diff   <before.json> <after.json>

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

causal options
  --control-manifest <p>  modern-rescue manifest/controls/<control-id>.json. It OWNS which
                          negative controls apply and which channels the control declares.
  --family-manifest <p>   optional manifest/families/<id>.json; narrows the negative controls
                          onto one family root.
  --stop <id>             a normalized stop id declared by the control manifest.
  --arm <id>              repeatable; which ingress door(s) to run: ${INGRESS_ARM_IDS.join(' | ')}
                          (default: both). THIS COMMAND NEVER ACCEPTS A VARIABLE MAP FROM THE
                          OUTSIDE. It calls loadCompilerArms() + lowerStop() itself, importing the
                          REAL compiled compilers from dist/ and lowering the declared stop through
                          them, exactly as a tenant's own ingress door would. A payload
                          self-asserted from JSON would let the harness prove it can multiply and
                          report that as proof the compiler lowers the stop; that door is closed.
  --bind <id=target,...>  binds a declared-targets negative control to the fixture targets it
                          is about; repeatable. An unbound one fails closed. Every target MUST be
                          a real "fixtureId/targetId" pair from FIXTURE_IDS — enforced mechanically
                          — never a name the harness merely wishes existed.
  --source-digest <hex>   the EXPECTED sha256 of the run's full freshness surface (declaredDigest):
                          this instrument's own owned files, the control/family manifest(s), the
                          TS lowerers and productive CSS the manifest's own sourceBindings name,
                          the two compiled dist/ modules the ingress arms import, dist/build-stamp.json,
                          and the bundle's own composition inputs. Wires the stale-source guard into
                          every causal run instead of skipping it; omitting this flag is itself a
                          guard failure (a missing digest is unproven freshness, not proven
                          freshness). The observed digest is always printed in the summary so a
                          first run can seed the next one's --source-digest.
  --round-id <id>         together with --family-id, --scenario-id and --producer, requests a
                          source-bound receipt written through composition/receipt's writeEvidence
                          — which writes both the artifact and the receipt under the programme's
                          evidence root, then REOPENS them and validates by content — alongside
                          --out. All four are required together; omit all four for a naked artifact.
  --family-id <id>        see --round-id.
  --scenario-id <id>      see --round-id.
  --producer <name>       who/what ran this causal round; must not be the sighted approver.
  --evidence-kind <kind>  receipt evidenceKind (default: computed-causal-run; data-causal
                          defaults to data-field-delta, the DATA terminal's proof role).
  --receipt-out <path>    where to write the receipt, RELATIVE to the evidence root (default:
                          <--out>.receipt.json).
  --evidence-root <dir>   absolute directory writeEvidence treats as the repo root for the receipt
                          (default: REPOSITORY_ROOT — write for real). --out and --receipt-out are
                          interpreted RELATIVE to this root when a receipt is requested.

Bundle modes
  fresh   recompose from src/foundation/tokens/css in memory (no build). Default,
          because it is the only mode whose freshness can be proven here.
  dist    the shipped bundle. Currently STALE: scripts/verticals/css-staleness-gate/index.mjs
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
  if (command !== 'run' && command !== 'dial' && command !== 'causal' && command !== 'data-causal') {
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
  if (command === 'data-causal') return commandDataCausal(options);
  if (command === 'causal') return commandCausal(options);

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
    controlManifest: null,
    familyManifest: null,
    stop: null,
    arms: [],
    bindings: {},
    sourceDigest: null,
    roundId: null,
    familyId: null,
    scenarioId: null,
    producer: null,
    evidenceKind: 'computed-causal-run',
    receiptOut: null,
    evidenceRoot: null,
    bypassId: null,
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
      case '--control-manifest':
        options.controlManifest = next();
        break;
      case '--bypass-id':
        options.bypassId = next();
        break;
      case '--family-manifest':
        options.familyManifest = next();
        break;
      case '--stop':
        options.stop = next();
        break;
      case '--arm': {
        const armId = next();
        if (!INGRESS_ARM_IDS.includes(armId)) {
          throw new Error(`unknown --arm ${armId} (known: ${INGRESS_ARM_IDS.join(', ')})`);
        }
        options.arms.push(armId);
        break;
      }
      case '--bind': {
        const assignment = next();
        const separator = assignment.indexOf('=');
        if (separator < 1) {
          throw new Error(`--bind expects <negative-control-id>=<target,target>, got "${assignment}"`);
        }
        const targets = assignment
          .slice(separator + 1)
          .split(',')
          .map((entry) => entry.trim())
          .filter(Boolean);
        // Mechanical enforcement (not a convention): a --bind target must be a
        // real "fixtureId/targetId" pair the roster declares. Checked at parse
        // time so a fabricated target is a `2` (bad invocation), never a run
        // that silently checked nothing.
        assertKnownTargetKeys(targets, { context: `--bind ${assignment.slice(0, separator)}` });
        options.bindings[assignment.slice(0, separator)] = targets;
        break;
      }
      case '--source-digest':
        options.sourceDigest = next();
        break;
      case '--round-id':
        options.roundId = next();
        break;
      case '--family-id':
        options.familyId = next();
        break;
      case '--scenario-id':
        options.scenarioId = next();
        break;
      case '--producer':
        options.producer = next();
        break;
      case '--evidence-kind':
        options.evidenceKind = next();
        break;
      case '--receipt-out':
        options.receiptOut = next();
        break;
      case '--evidence-root':
        options.evidenceRoot = next();
        break;
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
    arms: options.arms.length > 0 ? [...new Set(options.arms)] : [...INGRESS_ARM_IDS],
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

/**
 * The full freshness surface for a causal run — not just the instrument and
 * the manifest TEXT, but everything the manifest's own declared bindings say
 * produced this result: the control manifest's `calibration.sourceBindings`
 * (the TS lowerers + the "computed mounts" CSS, symbol anchors stripped),
 * the family manifest's own top-level `sourceBindings` array when one is
 * given (the productive TSX engines + CSS a family names directly), the two
 * compiled `dist/` modules AND their `.ts` sources the ingress arms actually
 * imported, `dist/build-stamp.json`, and the composed bundle's own input
 * files. Pulled from data the manifest and the ingress module already
 * declare rather than a second hardcoded list this file would have to keep
 * in sync by hand.
 */
/**
 * Whether a manifest `sourceBindings` string is a file the digest can hash.
 *
 * The manifests mix three kinds of `packages/`-prefixed string in the same
 * fields, and only one of them is hashable:
 *   - a FILE — hashed;
 *   - a DIRECTORY — an owner pointer. Expanding it would put whole trees
 *     (`src/ui/primitives` is 1313 files) into the freshness surface, so an
 *     unrelated primitive edit would invalidate every receipt of this control;
 *   - PROSE that happens to open with a path (evidence sentences). Always
 *     contains whitespace, and is never a path.
 *
 * A path-shaped string that does not exist is NOT filtered: a binding naming a
 * vanished file is exactly the staleness this digest exists to catch, so it
 * throws rather than quietly shrinking the surface.
 */
/**
 * Strips a manifest `sourceBindings` locator down to the path it names.
 *
 * The manifests point INTO files two ways — `path#symbol` and `path:1371-1451`
 * — and both must reduce to the same hashable file. Returns null for a string
 * that is not a `packages/` path at all.
 */
function normaliseBoundPath(value, evidenceRoot) {
  const withoutSymbol = value.split('#')[0];
  const withoutLines = withoutSymbol.replace(/:\d+(?:-\d+)?$/, '');
  if (!withoutLines.startsWith('packages/')) return null;
  // Evidence is OUTPUT. A receipt inside its own freshness surface cannot be
  // hashed before it is written, so a path under the evidence root is never a
  // source binding — however a manifest happens to spell an evidence id.
  if (evidenceRoot && withoutLines.startsWith(`${evidenceRoot}/`)) return null;
  return withoutLines;
}

function isDigestibleSourceFile(candidate) {
  if (/\s/.test(candidate)) return false;
  const absolute = resolve(REPOSITORY_ROOT, candidate);
  if (!existsSync(absolute)) {
    throw new Error(
      `resolution-probe: source binding "${candidate}" does not exist. A binding that names a ` +
        'vanished file cannot be hashed, and dropping it would shrink the freshness surface ' +
        'silently.',
    );
  }
  return statSync(absolute).isFile();
}

function causalFreshnessSourceFiles({
  controlManifest,
  familyManifest,
  manifestSourceFiles,
  bundleInputFiles,
}) {
  const evidenceRoot = loadProgramContracts().evidence.root;
  const collectBoundFiles = (value, found = []) => {
    if (typeof value === 'string') {
      const file = normaliseBoundPath(value, evidenceRoot);
      if (file !== null && isDigestibleSourceFile(file)) found.push(file);
      return found;
    }
    if (Array.isArray(value)) {
      for (const entry of value) collectBoundFiles(entry, found);
      return found;
    }
    if (value && typeof value === 'object') {
      for (const entry of Object.values(value)) collectBoundFiles(entry, found);
    }
    return found;
  };
  const controlSourceBindings = collectBoundFiles(controlManifest);
  const familySourceBindings = collectBoundFiles(familyManifest);
  const compilerPaths = Object.values(INGRESS_ARMS).flatMap((spec) => [
    `packages/core/${spec.compilerModule}`,
    `packages/core/${spec.compilerSource}`,
  ]);
  const bundleInputs = (bundleInputFiles ?? []).map((path) => `packages/core/${path}`);
  return [
    ...new Set([
      ...ownedSourceFiles(),
      ...manifestSourceFiles,
      ...controlSourceBindings,
      ...familySourceBindings,
      ...compilerPaths,
      'packages/core/dist/build-stamp.json',
      ...bundleInputs,
    ]),
  ].sort();
}

/**
 * The DATA-terminal causal run (F4B-6).
 *
 * A control whose terminal is DATA paints nothing, so there is no bundle, no
 * browser and no fixture here -- three compiles of the same document with and
 * without the stop, and a diff of the compiled artifact. The CSS `causal`
 * command REFUSES such a control by construction (empty declaredOutputs), which
 * is why this is a separate command and not a flag.
 */
/* ==========================================================================
 * THE DATA-TERMINAL DESCRIPTORS
 *
 * A DATA control paints nothing, so its causal question is asked of a FIELD and
 * of the production reader that consumes it. Those two things are all that
 * differs between one DATA control and the next -- the report shape, the guards,
 * the equality surface algebra and the receipt are already generic
 * (`buildDataCausalReport`). Until now they were literals inside the runner, so
 * the runner WAS responsive.posture.
 *
 * A descriptor states, per control:
 *   `document`        how the tenant writes the stop (the document shape)
 *   `fieldPath`       where the compiled artifact carries it
 *   `equalitySurface` the siblings held constant, so "only this moved" is a
 *                     claim about a surface and not about one field
 *   `witnesses`       the BEHAVIOURAL half: the production reader answering the
 *                     consumer's own question off the compiled artifact
 *
 * Adding a control is adding a row. Nothing here decides whether the control is
 * live, admissible or receipted -- the manifest does.
 * ========================================================================== */
const DATA_TERMINAL_DESCRIPTORS = Object.freeze({
  'responsive.posture': {
    /* The three siblings held constant are NON-COLOUR on purpose: an authored
     * card colour trips the compiler's APCA validation in dark mode, and a probe
     * that cannot compile its own baseline proves nothing about the field it
     * came to measure. */
    document: (stopId) => ({
      visualFoundation: {
        advanced: {
          tokenOverrides: { '--ds-radius-md': '10px' },
          chrome: { cardComponent: { anatomy: 'underline' } },
          profiles: { edge: 'inset-double' },
          ...(stopId === undefined ? {} : { responsivePosture: stopId }),
        },
      },
    }),
    fieldPath: ['normalizedAppearance', 'advanced', 'responsivePosture'],
    equalitySurface: ['chrome', 'tokenOverrides', 'profiles', 'responsivePosture'],
    witnesses: measurePostureBehaviour,
    failClosedDefault: ({ resolveResponsivePosture }) =>
      resolveResponsivePosture(undefined)?.id ?? null,
    bypass: ({ bypassId, compile, documentFor, failClosedDefaultId, resolveActiveResponsivePosture }) => {
      let threw = false;
      try {
        compile(documentFor(bypassId));
      } catch {
        threw = true;
      }
      const rendered = resolveActiveResponsivePosture({
        appearance: { advanced: { responsivePosture: bypassId } },
      });
      return {
        requestedId: bypassId,
        writeTime: { threw },
        renderTime: { resolvedId: rendered?.id ?? null },
        expectedDefaultId: failClosedDefaultId,
      };
    },
  },
});

/**
 * The descriptor for a control, or a refusal that names it.
 *
 * FAIL-CLOSED ON PURPOSE, and this is the half that matters: falling back to a
 * default descriptor would run SOME control's document under ANOTHER control's
 * id and report the result as that control's evidence. A missing descriptor is
 * a gap in this table, not a stop that cannot lower.
 */
function dataTerminalDescriptor(controlId) {
  const descriptor = DATA_TERMINAL_DESCRIPTORS[controlId];
  if (!descriptor) {
    throw new Error(
      `resolution-probe: no DATA-terminal descriptor for control ${JSON.stringify(controlId)}. ` +
        'A DATA run is defined by the document its tenant writes, the artifact field that ' +
        'carries it and the production reader that consumes it, and this runner refuses to ' +
        'guess any of the three. Declared: ' +
        `${Object.keys(DATA_TERMINAL_DESCRIPTORS).join(', ')}. Add a descriptor rather than ` +
        'running this control through another control\'s shape.',
    );
  }
  return descriptor;
}

async function commandDataCausal(options) {
  const controlManifest = options.controlManifest
    ? readManifest(resolve(process.cwd(), options.controlManifest))
    : null;
  if (!controlManifest) {
    process.stderr.write('resolution-probe: data-causal needs --control-manifest\n');
    return 2;
  }
  const vertical = options.verticals[0];
  const stops = (controlManifest.calibration?.normalizedStops ?? []).map((stop) => stop.id);
  if (stops.length === 0) {
    process.stderr.write(
      'resolution-probe: the control declares no normalized stops, so there is nothing to vary.\n',
    );
    return 2;
  }
  // What this control's DATA run IS. Fail-closed: no descriptor, no run.
  let descriptor;
  try {
    descriptor = dataTerminalDescriptor(controlManifest.controlId);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    return 2;
  }

  // Freshness first: loadCompilerArms proves dist/ describes this tree, and the
  // DATA probe then binds the SAME published entrypoint the CSS DB arm binds.
  const arms = await loadCompilerArms();
  const { schemaVersion } = arms['db-tenant-theme'].provenance;
  const identity = dbTenantIdentity(vertical);
  const server = await import(
    pathToFileURL(resolve(CORE_ROOT, INGRESS_ARMS['db-tenant-theme'].compilerModule)).href
  );
  // The canonical write path a tenant takes: a DOCUMENT is hydrated into a
  // config (this is where write-time validation lives, which the bypass guard
  // needs) and only then compiled.
  // Advanced mode keeps an EXPLICIT policy gate: unlike a simple v1 document it
  // does not resolve the vertical envelope from the trusted key, so the caller
  // must name it. `responsivePosture` lives under `.advanced`, so this probe is
  // always in advanced mode.
  const verticalEnvelope = server.getTenantThemeVerticalEnvelope(vertical);
  if (!verticalEnvelope) {
    process.stderr.write(`resolution-probe: no vertical envelope for "${vertical}"\n`);
    return 2;
  }
  const compile = (document) =>
    server.compileTenantThemeConfig(server.hydrateTenantThemeConfig(document, identity), {
      verticalEnvelope,
    });

  // The document the tenant writes, from the descriptor. The runner supplies
  // only the envelope every DATA document shares; the shape under it is the
  // control's own.
  const documentFor = (stopId) => ({
    schemaVersion,
    mode: 'advanced',
    ...descriptor.document(stopId),
  });

  const compiled = (posture) => compile(documentFor(posture));
  const baseline = compiled(undefined);
  const removal = compiled(undefined);
  const compiledStops = stops.map((stopId) => ({ stopId, artifact: compiled(stopId) }));

  // The bypass guard needs BOTH paths, observed separately.
  const main = await import(pathToFileURL(resolve(CORE_ROOT, 'dist/index.js')).href);
  const { resolveActiveResponsivePosture, resolveResponsivePosture, resolveAdaptiveLayout } = main;

  // MEASURED, never asserted: the fail-closed default is whatever the control's
  // own resolver answers when asked for nothing. Hardcoding it would make the
  // bypass guard agree with a constant instead of with the resolver, and it
  // would keep agreeing after somebody changed the resolver's default.
  const failClosedDefaultId = descriptor.failClosedDefault
    ? descriptor.failClosedDefault({ resolveResponsivePosture })
    : null;

  /* The bypass guard asks a question only some controls can be asked: "can a
   * value the WRITE path refuses still reach the RENDER path?". A control whose
   * descriptor declares no bypass simply does not answer it -- absent, not
   * false, so a reader cannot mistake "not asked" for "asked and held". */
  let bypass = null;
  if (options.bypassId) {
    if (!descriptor.bypass) {
      process.stderr.write(
        `resolution-probe: --bypass-id was given but ${JSON.stringify(controlManifest.controlId)} ` +
          'declares no bypass probe, so there is no write/render pair to compare.\n',
      );
      return 2;
    }
    bypass = descriptor.bypass({
      bypassId: options.bypassId,
      compile,
      documentFor,
      failClosedDefaultId,
      resolveActiveResponsivePosture,
    });
  }

  const behaviouralWitnesses = descriptor.witnesses({
    stops,
    compiledStops,
    failClosedDefaultId,
    resolveActiveResponsivePosture,
    resolveResponsivePosture,
    resolveAdaptiveLayout,
  });

  const report = buildDataCausalReport({
    controlId: controlManifest.controlId,
    vertical,
    fieldPath: descriptor.fieldPath,
    equalitySurface: descriptor.equalitySurface,
    stops: compiledStops,
    baseline,
    removal,
    bypass,
    behaviouralWitnesses,
    exception: controlManifest.calibration?.dataDiscriminationException ?? null,
    provenance: {
      module: INGRESS_ARMS['db-tenant-theme'].compilerModule,
      moduleSubpath: INGRESS_ARMS['db-tenant-theme'].compilerModuleSubpath,
      exportName: INGRESS_ARMS['db-tenant-theme'].compilerExport,
      schemaVersion,
      tenant: identity.slug,
    },
  });

  const serialised = `${JSON.stringify(report, null, 2)}\n`;
  const exitCode = report.verdict.pass ? 0 : 1;

  // Receipted through the SAME writeEvidence the CSS runs use: a DATA artifact
  // is evidence like any other, and `buildReceipt` is payload-agnostic, so
  // nothing about the receipt law changes for a terminal that paints nothing.
  const wantsReceipt =
    options.roundId !== null &&
    options.familyId !== null &&
    options.scenarioId !== null &&
    options.producer !== null;
  if (wantsReceipt) {
    if (!options.out) {
      process.stderr.write('resolution-probe: a receipted data-causal run needs --out\n');
      return 2;
    }
    const root = options.evidenceRoot ?? REPOSITORY_ROOT;
    const artifactPath = relative(root, resolve(process.cwd(), options.out)).split('\\').join('/');
    const receiptPath = options.receiptOut
      ? relative(root, resolve(process.cwd(), options.receiptOut)).split('\\').join('/')
      : `${artifactPath}.receipt.json`;
    const written = writeEvidence({
      root,
      artifactPath,
      artifactBytes: serialised,
      receiptPath,
      receiptFields: {
        roundId: options.roundId,
        familyId: options.familyId,
        scenarioId: options.scenarioId,
        // A DATA run's role is `data-field-delta`, and the command says so rather
        // than making every caller remember the flag. The generic default is
        // only kept when the caller explicitly named a different kind, so
        // `--evidence-kind` still overrides.
        evidenceKind:
          options.evidenceKind === 'computed-causal-run' ? 'data-field-delta' : options.evidenceKind,
        commandOrTool: 'node src/tooling/resolution-probe/public/cli/index.mjs data-causal',
        exitCode,
        measuredSourceFiles: dataFreshnessSourceFiles({
          controlManifest,
          manifestSourceFiles: [
            options.controlManifest,
            ...(options.familyManifest ? [options.familyManifest] : []),
          ].map((path) => relative(REPOSITORY_ROOT, resolve(process.cwd(), path)).split('\\').join('/')),
        }),
        negativeDrill: DEFAULT_CAUSAL_NEGATIVE_DRILL,
        producer: options.producer,
      },
    });
    if (!written.validation.valid) {
      process.stderr.write(
        `resolution-probe: the receipt this command just wrote does NOT validate; refusing to ` +
          `report success:\n  ${written.validation.failures.join('\n  ')}\n`,
      );
      return 1;
    }
    return exitCode;
  }

  if (options.out) writeFileSync(options.out, serialised);
  else process.stdout.write(serialised);
  return exitCode;
}

/**
 * S2, S3, the tier negative and the falsifiable prediction, measured.
 *
 * These live in the CLI and not in `composition/data-run/` on purpose: knowing
 * that a posture has a `spanBias` and that a board buckets at 639/839 is domain
 * knowledge, and the instrument is domain-blind by design. What the instrument
 * owns is the LAW that a declared witness which came back red cannot be dropped
 * from the verdict.
 *
 * Every witness is written so that BOTH answers are informative. A negative
 * control that only asserted "the board tier did not move" would also hold if
 * the tenant ladder were dead, so it additionally requires the ladder to move
 * at a width where it should -- that is what makes it a control rather than a
 * tautology.
 */
function measurePostureBehaviour({
  stops,
  compiledStops,
  failClosedDefaultId,
  resolveActiveResponsivePosture,
  resolveResponsivePosture,
  resolveAdaptiveLayout,
}) {
  const witnesses = [];
  const ladder = Object.fromEntries(stops.map((id) => [id, resolveResponsivePosture(id)]));

  // --- S2: the compiled artifact resolves to the stop that was requested -----
  // Fed the REAL compiled artifact, shaped as the production read shapes it
  // (`config.appearance` = normalizedAppearance), so this is the consumer's own
  // question and not a paraphrase of it.
  const s2 = compiledStops.map(({ stopId, artifact }) => ({
    stopId,
    resolvedId: resolveActiveResponsivePosture({ appearance: artifact?.normalizedAppearance })?.id ?? null,
  }));
  witnesses.push({
    id: 'S2',
    question: 'Does the consumer resolve the REQUESTED stop off the compiled artifact, not the default?',
    holds: s2.every((row) => row.resolvedId === row.stopId),
    detail: { rows: s2, failClosedDefaultId },
  });

  // --- prediction: band width invariant, onset shifted ----------------------
  // Declared before the run in the control manifest. Stated as an equality on
  // the BAND (standardMax - compactMax) plus a strict ordering of the onsets, so
  // a ladder that widened one stop's band would break it even if every onset
  // still moved.
  const bands = stops.map((id) => ({
    stopId: id,
    compactMaxPx: ladder[id]?.thresholds?.compactMaxPx ?? null,
    standardMaxPx: ladder[id]?.thresholds?.standardMaxPx ?? null,
    spanBias: ladder[id]?.spanBias ?? null,
  }));
  const widths = bands.map((b) => b.standardMaxPx - b.compactMaxPx);
  const onsets = bands.map((b) => b.compactMaxPx);
  witnesses.push({
    id: 'PREDICTION',
    question: 'Is the band width invariant across stops while the onset shifts?',
    holds:
      new Set(widths).size === 1 &&
      new Set(onsets).size === bands.length &&
      bands.every((b) => typeof b.spanBias === 'string' && b.spanBias.length > 0),
    detail: { bands, bandWidthPx: widths[0] ?? null },
  });

  // --- S3: same width, same cols, same contracts; only spanBias varies -------
  // Three contracts whose min/preferred/max genuinely differ, because a contract
  // with one possible span would produce one geometry under every bias and the
  // scenario would pass while proving nothing.
  const contract = (id) => ({
    id,
    accessibleTitle: id,
    minSpan: { cols: 1 },
    preferredSpan: { cols: 2 },
    maxSpan: { cols: 6 },
    blockPolicy: { mode: 'intrinsic' },
    contentModes: [
      { id: 'full', minSpan: { cols: 2 } },
      { id: 'compact', minSpan: { cols: 1 } },
    ],
    priority: 'primary',
  });
  const contracts = ['a', 'b', 'c'].map(contract);
  const geometry = (spanBias) =>
    resolveAdaptiveLayout(contracts, [], { cols: 6, posture: 'standard', spanBias })
      .placements.map((placement) => `${placement.itemId}:${placement.colSpan}@r${placement.rowStart}`)
      .join(' ');
  const s3 = stops.map((id) => ({ stopId: id, spanBias: ladder[id]?.spanBias ?? null, geometry: geometry(ladder[id]?.spanBias) }));
  witnesses.push({
    id: 'S3',
    question: 'At identical width, cols and contracts, does varying ONLY spanBias produce a different geometry?',
    holds: new Set(s3.map((row) => row.geometry)).size === new Set(s3.map((row) => row.spanBias)).size,
    detail: { cols: 6, posture: 'standard', rows: s3 },
  });

  // --- negative: the board's tier is NOT the tenant ladder -------------------
  // `useAdaptiveBoardLayout` buckets on hardcoded 639/839 literals, so the board
  // answers the same thing under every stop. Recorded as a MEASURED gap, not as
  // a pass: the control the programme certifies is spanBias, and this is the
  // boundary of it.
  const boardTier = (px) => (px <= 639 ? 'single' : px <= 839 ? 'mid' : 'full');
  const tenantTier = (px, stopId) => {
    const thresholds = ladder[stopId]?.thresholds ?? {};
    if (px <= thresholds.compactMaxPx) return 'compact';
    if (px <= thresholds.standardMaxPx) return 'standard';
    return 'expanded';
  };
  const negative = [600, 750, 1000].map((px) => ({
    px,
    boardTiers: [...new Set(stops.map(() => boardTier(px)))],
    tenantTiers: stops.map((id) => tenantTier(px, id)),
  }));
  witnesses.push({
    id: 'TIER_NEGATIVE',
    question:
      'Does the board bucket stay CONSTANT across stops (it reads hardcoded literals) at widths where ' +
      'the tenant ladder demonstrably moves?',
    holds:
      negative.every((row) => row.boardTiers.length === 1) &&
      negative.some((row) => new Set(row.tenantTiers).size > 1),
    detail: { widths: negative, boardLiteralsPx: [639, 839] },
  });

  return witnesses;
}

/**
 * The freshness surface of a DATA receipt.
 *
 * NO CSS. This probe reads a compiled artifact, never a stylesheet, so putting
 * bundle inputs in its digest would declare a dependency it does not have and
 * make every receipt churn on paint changes it cannot see. What it DOES depend
 * on: the instrument (walked by `ownedSourceFiles`), the manifests it reads,
 * the compiled server entrypoint it calls, and the build stamp that proves that
 * entrypoint describes this tree.
 */
function dataFreshnessSourceFiles({ controlManifest, manifestSourceFiles }) {
  const evidenceRoot = loadProgramContracts().evidence.root;
  const bound = [];
  const walk = (value) => {
    if (typeof value === 'string') {
      const file = normaliseBoundPath(value, evidenceRoot);
      if (file !== null && isDigestibleSourceFile(file)) bound.push(file);
      return;
    }
    if (Array.isArray(value)) return void value.forEach(walk);
    if (value && typeof value === 'object') Object.values(value).forEach(walk);
  };
  walk(controlManifest);
  return [
    ...new Set([
      ...ownedSourceFiles(),
      // The manifest FILES themselves, not only the paths they name: the
      // calibration and the cell are part of what this receipt asserts, so
      // editing one must stale it.
      ...manifestSourceFiles,
      ...bound,
      `packages/core/${INGRESS_ARMS['db-tenant-theme'].compilerModule}`,
      `packages/core/${INGRESS_ARMS['db-tenant-theme'].compilerSource}`,
      'packages/core/dist/index.js',
      'packages/core/dist/build-stamp.json',
    ]),
  ].sort();
}

/**
 * The three-phase causal run.
 *
 * It refuses more than it accepts, on purpose. Without a control manifest it
 * would not know which negative controls apply; without a stop it would not
 * know what the mutation means. It NEVER accepts a variable map from the
 * outside — it calls `loadCompilerArms()` + `lowerStop()` itself, so the
 * payload always comes from the REAL compiled compilers. A missing manifest
 * or stop is a `2` (bad invocation), never a run with a caveat.
 */
async function commandCausal(options) {
  if (!options.controlManifest || !options.stop) {
    process.stderr.write(
      'resolution-probe: `causal` requires --control-manifest and --stop. A causal run without ' +
        'the manifest has no declared negative controls, and without a stop it does not know ' +
        'what the mutation means.\n',
    );
    return 2;
  }

  // Receipt metadata is all-or-nothing. A receipt with a fabricated round,
  // family, scenario or producer would look like real evidence while meaning
  // nothing, so the CLI never invents defaults for these four; a naked
  // artifact stays the default and a receipt is requested explicitly.
  const receiptFlags = {
    'round-id': options.roundId,
    'family-id': options.familyId,
    'scenario-id': options.scenarioId,
    producer: options.producer,
  };
  const receiptFlagsGiven = Object.values(receiptFlags).filter((value) => value !== null).length;
  const wantsReceipt = receiptFlagsGiven > 0;
  if (wantsReceipt && receiptFlagsGiven < Object.keys(receiptFlags).length) {
    const missing = Object.entries(receiptFlags)
      .filter(([, value]) => value === null)
      .map(([flag]) => `--${flag}`);
    process.stderr.write(
      `resolution-probe: a causal receipt needs --round-id, --family-id, --scenario-id and ` +
        `--producer together (missing: ${missing.join(', ')}).\n`,
    );
    return 2;
  }
  if (wantsReceipt && !options.out) {
    process.stderr.write(
      'resolution-probe: a causal receipt needs a real artifact path; pass --out alongside ' +
        '--round-id/--family-id/--scenario-id/--producer.\n',
    );
    return 2;
  }

  let controlManifest;
  let familyManifest = null;
  try {
    controlManifest = readManifest(options.controlManifest);
    if (options.familyManifest) familyManifest = readManifest(options.familyManifest);
  } catch (error) {
    process.stderr.write(`resolution-probe: ${error.message}\n`);
    return 2;
  }

  const stop = (controlManifest.calibration?.normalizedStops ?? []).find(
    (entry) => entry.id === options.stop,
  );
  if (!stop) {
    process.stderr.write(
      `resolution-probe: "${options.stop}" is not a normalized stop of ` +
        `${controlManifest.controlId}\n`,
    );
    return 2;
  }

  const requestedArms = options.arms;
  if (requestedArms.includes('static-brand-theme') && options.verticals.length !== 1) {
    // One vertical per static arm: the block names one tenant slug, and
    // `runCausalProbe` refuses the mismatch rather than measuring a block
    // that matches nothing.
    process.stderr.write(
      'resolution-probe: a static ingress arm is tenant-scoped, so `causal` needs exactly one ' +
        `--vertical (got ${options.verticals.length}).\n`,
    );
    return 2;
  }

  // NEVER accept a variable map from the outside. Import the REAL compiled
  // compilers and lower the declared stop through them ourselves — the same
  // door a tenant's own ingress would use. A payload self-asserted from JSON
  // would only prove the harness can multiply and report that as proof the
  // compiler lowers the stop.
  const loadedArms = await loadCompilerArms();
  // H-1: same verified dist as the compilers (V4), loaded once for the run.
  const staticBaselines = await loadStaticBaselines();
  /* R-2 (W-A): the vertical's own default mode, read from the PUBLISHED
   * BrandTheme that `loadStaticBaselines()` just loaded under the freshness
   * law. It is the field `FIRST_PARTY_THEMES` does not project, and the DB arm
   * needs it to declare the mode scope its document is measured in. Resolved
   * once per run so both the arm and the discrimination guard stand in the same
   * scope; fail-closed inside `verticalDefaultMode`.
   *
   * A tenant-less scope (`none`) has no BrandTheme and therefore no default
   * mode; it resolves to `null` here rather than throwing, so the existing
   * refusal for such a run stays where it already is. A document that actually
   * NEEDS the scope still fails closed at the stamp. */
  const runBaseline = staticBaselines[options.verticals[0]] ?? null;
  const runDefaultMode = runBaseline
    ? verticalDefaultMode(runBaseline, options.verticals[0])
    : null;
  const arms = requestedArms.map((armId) => {
    const loaded = loadedArms[armId];
    const lowered = lowerStop({
      armId,
      controlManifest,
      stopId: options.stop,
      compile: loaded.compile,
      // Both arms need it: the static arm to build its tenant selector, the DB
      // arm to resolve the code-owned vertical envelope its compiler validates
      // against. Same vertical for both, which is what makes them comparable.
      vertical: options.verticals[0],
      provenance: loaded.provenance,
      /* FASE-A: the vertical policy envelope resolver, from the SAME arm the
       * compiler came from. Only the advanced space consumes it; the simple
       * space compiles with `{}` exactly as before. */
      verticalEnvelopeFor: loaded.verticalEnvelopeFor,
      // R-2: the mode scope the DB document declares (ignored by the static arm,
      // which writes the theme body and therefore the default mode by construction).
      defaultMode: runDefaultMode,
      /* H-1: the static arm composes its stop over the vertical's PUBLISHED
       * baseline, so it measures the theme production actually ships. The DB
       * arm resolves its baseline inside its own compiler and fails closed if
       * handed one here, which is why this is conditional rather than shared. */
      ...(armId === 'static-brand-theme'
        ? {
            base: staticBaselines[options.verticals[0]].theme,
            baselineSource: staticBaselines[options.verticals[0]].source,
          }
        : {}),
    });
    /* H-2: does this arm ENCODE the stop, or only emit a constant? Runs here,
     * per arm, because it is a property of the whole stop set and the arm is
     * where the set's compiler and baseline are already in hand. Fail-closed:
     * it throws, and a run that cannot show its arm encodes anything must not
     * proceed to measure one.
     *
     * W-C: it is handed the SAME baseline tuple the arm just used, and the
     * arm's own recorded digest, so the guard cannot end up standing on a
     * different scene than the scenario. */
    const discrimination = assertStopDiscrimination({
      armId,
      controlManifest,
      compile: loaded.compile,
      vertical: options.verticals[0],
      provenance: loaded.provenance,
      baseline: armId === 'static-brand-theme' ? staticBaselines[options.verticals[0]] : null,
      armBaselineDigest: lowered.producedBy.input.baseline?.digest ?? null,
      // R-2: same scope as the arm it certifies.
      defaultMode: runDefaultMode,
      // FASE-A: and the same envelope, for the same reason.
      verticalEnvelopeFor: loaded.verticalEnvelopeFor,
    });
    const producedBy = { ...lowered.producedBy, stopDiscrimination: discrimination };

    return armId === 'static-brand-theme'
      ? composeStaticArm({
          vertical: options.verticals[0],
          variables: lowered.variables,
          producedBy,
          // M-1: the arm writes every scope the compiler writes, and it takes
          // the mode grammar FROM the compiler it just called.
          modeVariables: lowered.modeVariables,
          themeModeSelector: loaded.themeModeSelector,
        })
      : composeDbArm({
          // H-3 phase (a): the DB arm serves the compiled artifact's shape --
          // base plus one block per modeDelta -- so it needs the scene's
          // vertical to re-scope onto, and the same compiler grammar.
          vertical: options.verticals[0],
          variables: lowered.variables,
          producedBy,
          modeVariables: lowered.modeVariables,
          themeModeSelector: loaded.themeModeSelector,
        });
  });

  // The stale-source guard (foundation/guards#detectStaleSource), wired so a
  // CLI causal run actually exercises it instead of skipping it. A missing
  // --source-digest is a missing declaredDigest, which is a guard FAILURE
  // (unproven freshness), not a skip: fail-closed, the same law every other
  // guard in this harness follows.
  const manifestSourceFiles = [
    options.controlManifest,
    ...(options.familyManifest ? [options.familyManifest] : []),
  ].map((path) => relative(REPOSITORY_ROOT, resolve(process.cwd(), path)).split('\\').join('/'));
  const bundleInputFiles = (
    await Promise.all(
      options.verticals
        .filter((vertical) => vertical !== 'none')
        .map((vertical) => resolveBundle({ vertical, mode: options.bundleMode })),
    )
  ).flatMap((bundle) => bundle.provenance.inputs ?? []);
  const sourceFiles = causalFreshnessSourceFiles({
    controlManifest,
    familyManifest,
    manifestSourceFiles,
    bundleInputFiles,
  });
  const sourceFreshness = {
    declaredDigest: options.sourceDigest ?? null,
    sourceFiles,
  };

  const artifact = await runCausalProbe({
    controlId: controlManifest.controlId,
    stop,
    controlManifest,
    familyManifest,
    negativeControlBindings: options.bindings,
    arms,
    verticals: options.verticals,
    themes: options.themes,
    fixtures: options.fixtures,
    bundleMode: options.bundleMode,
    sourceFreshness,
  });
  const measuredSourceFreshness = artifact.provenance.sourceFreshness;

  const serialised = serialiseArtifact(artifact);
  const exitCode = artifact.verdict.pass ? 0 : 1;

  // Bind the measured half: a receipt alongside the artifact so the numbers
  // are bound to frozen source + artifact bytes. Written through
  // composition/receipt's writeEvidence — which writes both files under an
  // EXPLICIT root and immediately validates the pair by CONTENT with the
  // programme's own validator — rather than a bare writeFileSync this
  // command would have to trust blindly.
  let receiptInfo = null;
  if (wantsReceipt) {
    const root = options.evidenceRoot ?? REPOSITORY_ROOT;
    const artifactPath = relative(root, resolve(process.cwd(), options.out)).split('\\').join('/');
    const receiptPath = options.receiptOut
      ? relative(root, resolve(process.cwd(), options.receiptOut)).split('\\').join('/')
      : `${artifactPath}.receipt.json`;
    const written = writeEvidence({
      root,
      artifactPath,
      artifactBytes: serialised,
      receiptPath,
      receiptFields: {
        roundId: options.roundId,
        familyId: options.familyId,
        scenarioId: options.scenarioId,
        evidenceKind: options.evidenceKind,
        commandOrTool: 'node src/tooling/resolution-probe/public/cli/index.mjs causal',
        exitCode,
        measuredSourceFiles: measuredSourceFreshness.sourceFiles,
        negativeDrill: DEFAULT_CAUSAL_NEGATIVE_DRILL,
        producer: options.producer,
      },
    });
    // REOPEN from disk and validate by content. writeEvidence already
    // validates once against the in-memory bytes it just wrote; this re-reads
    // what actually landed on disk and re-validates against THAT, so a
    // truncated write or a filesystem oddity cannot be reported as a valid
    // receipt on the strength of the bytes this process happened to hold.
    const reopenedArtifactBytes = readFileSync(written.artifactAbsolute, 'utf-8');
    const revalidation = verifyReceipt(written.receipt, {
      root,
      contracts: loadProgramContracts(),
      artifactBytes: reopenedArtifactBytes,
    });
    const failures = [...new Set([...written.validation.failures, ...revalidation.failures])];
    if (failures.length > 0) {
      process.stderr.write(
        `resolution-probe: the receipt this command just wrote does NOT validate; refusing to ` +
          `report success:\n  ${failures.join('\n  ')}\n`,
      );
      return 1;
    }
    receiptInfo = { receiptPath: written.receiptAbsolute, artifactPath: written.artifactAbsolute };
  } else if (options.out) {
    writeFileSync(options.out, serialised);
  } else {
    process.stdout.write(serialised);
  }

  if (!options.quiet) {
    process.stderr.write(
      summariseCausal(artifact, options, {
        sourceFreshness: measuredSourceFreshness,
        receiptInfo,
      }),
    );
  }
  return exitCode;
}

function summariseCausal(artifact, options, { sourceFreshness = null, receiptInfo = null } = {}) {
  const lines = [
    `resolution-probe causal | control=${artifact.controlId} stop=${artifact.stop?.id} | ` +
      `self-check=${artifact.selfCheck.verdict} | pass=${artifact.verdict.pass}`,
  ];
  for (const [armId, arm] of Object.entries(artifact.arms)) {
    lines.push(
      `  ${armId} @ ${arm.position}: moved=${arm.totals.movedProperties} ` +
        `inert=${arm.totals.inertProperties} restore.exact=${arm.restore.exact} ` +
        `negative-controls.held=${arm.negativeControls.held}`,
    );
    for (const row of arm.restore.rows.slice(0, 20)) {
      lines.push(
        `    RESTORE ${row.kind} ${row.scope} ${row.target ?? row.attribute ?? ''} ` +
          `${row.property ?? ''}: ${row.before} -> ${row.after}`,
      );
    }
    for (const row of arm.negativeControls.violations.slice(0, 20)) {
      lines.push(
        `    NEGATIVE-CONTROL ${row.kind} ${row.negativeControl} ${row.scope} ${row.target} ` +
          `${row.property ?? ''}: ${row.from ?? ''} -> ${row.to ?? ''}`,
      );
    }
  }
  for (const failure of artifact.selfCheck.guardFailures.slice(0, 20)) {
    lines.push(`  GUARD ${failure.guard} ${failure.armId}/${failure.phase} ${failure.target ?? ''}`);
  }
  if (artifact.ingressEquivalence.comparable) {
    lines.push(
      `  ingress equivalence: ${artifact.ingressEquivalence.equivalent ? 'identical' : 'DIVERGES'} ` +
        `(${artifact.ingressEquivalence.rows.length} differing row(s))`,
    );
  }
  if (sourceFreshness) {
    const declared = sourceFreshness.declaredDigest
      ? sourceFreshness.declaredDigest.slice(0, 12)
      : 'NONE (--source-digest not passed; guard fails closed)';
    lines.push(
      `  source digest: observed=${sourceFreshness.observedDigest.slice(0, 12)} declared=${declared} ` +
        `(${sourceFreshness.sourceFiles.length} file(s); pass --source-digest ` +
        `${sourceFreshness.observedDigest} to declare this tree fresh on the next run)`,
    );
  }
  lines.push(`  ${artifact.selfCheck.meaning}`);
  if (options.out) lines.push(`  artifact: ${options.out}`);
  if (receiptInfo) lines.push(`  receipt: ${receiptInfo.receiptPath}`);
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
