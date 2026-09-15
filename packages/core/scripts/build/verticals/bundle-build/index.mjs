/**
 * Regenerate first-party vertical artifacts from their authored source.
 *
 * Each artifact (`src/foundation/tokens/css/facade/artifacts/<slug>/index.css`) is a BUILD OUTPUT:
 *   index.css = compileThemeIntent(staticThemeIntent(<slug>))
 * compiled over the neutral foundation with the vertical's preset admitted.
 *
 * The SAME compile has a non-CSS half, and it is written here too:
 *   src/infrastructure/compilers/runtime/tenant-css/artifact-runtime/index.ts
 *     = the recipe selection the compile validated, plus the governed behavior
 *       (motion dial, expressive selection, decided channels) read off the
 *       resolved baseline by `firstPartyGovernedBehavior`.
 * A code-owned vertical has no artifact row for the runtime to read, so those
 * selections would otherwise have to be re-derived from the preset by a second
 * reader. One compile, two outputs, one gate.
 *
 * The theme compiler owns every theme variable the artifact carries (palette,
 * typography, surfaces, chrome) and every mode block, so the artifact is a pure
 * projection of ONE authored source: the vertical's preset document admitted
 * over the neutral foundation. There is no second authored input to merge:
 * an artifact with two authors is an artifact whose value can be decided by
 * whichever author is read last, which is exactly the drift this generator exists
 * to make impossible.
 *
 * Scope: every slug in FIRST_PARTY_ARTIFACT_SPECS (bithire, evnto, rottay).
 * themanagementmiami and the torture fixtures are deliberately not registered
 * there and must not be added here.
 *
 * ORDER. The runtime module is an input of the package bundle, so it must be
 * written BEFORE `vite build`. Writing and `--check` therefore lower the themes
 * with the bootstrap compiler stage (`../compiler-bootstrap`), compiled from
 * `src/`, never with `dist/`. `--verify-dist` runs after the bundle and proves
 * the block the package ships is the block its own compiler produces.
 *
 * Usage:
 *   node scripts/build/verticals/bundle-build/index.mjs                # write artifacts
 *   node scripts/build/verticals/bundle-build/index.mjs --check        # fail if any artifact is stale
 *   node scripts/build/verticals/bundle-build/index.mjs --verify-dist  # fail if dist ships a stale runtime block
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { COMPILER_MODULES, withBootstrapCompiler } from '../compiler-bootstrap/index.mjs';
import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = findPackageRoot(__dirname);
const check = process.argv.includes('--check');
const verifyDist = process.argv.includes('--verify-dist');

/** The compiler modules the generator reads, loaded from one compile root. */
async function loadCompiler(compilerRoot) {
  const load = (key) => import(pathToFileURL(resolve(compilerRoot, `${COMPILER_MODULES[key]}.js`)).href);
  const [ground, contrast, renderer, roster] = await Promise.all(
    ['ground', 'brandingContrast', 'artifactRenderer', 'roster'].map(load),
  );
  return {
    LIGHT_DEFAULT_GROUND: ground.LIGHT_DEFAULT_GROUND,
    DARK_DEFAULT_GROUND: ground.DARK_DEFAULT_GROUND,
    apcaContrast: contrast.apcaContrast,
    APCA_BODY_TEXT_MIN_LC: contrast.APCA_BODY_TEXT_MIN_LC,
    renderFirstPartyArtifact: renderer.renderFirstPartyArtifact,
    FIRST_PARTY_ARTIFACT_SPECS: renderer.FIRST_PARTY_ARTIFACT_SPECS,
    REGENERATE_COMMAND: renderer.FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
    FIRST_PARTY_VERTICAL_ROSTER: roster.FIRST_PARTY_VERTICAL_ROSTER,
  };
}

/** First-party artifacts this generator owns (spec is the shared source of truth). */
function firstPartyArtifacts({ FIRST_PARTY_VERTICAL_ROSTER, FIRST_PARTY_ARTIFACT_SPECS }) {
  const artifacts = FIRST_PARTY_VERTICAL_ROSTER.map((row, index) => {
    const spec = FIRST_PARTY_ARTIFACT_SPECS[index];
    if (!spec || spec.slug !== row.slug) {
      throw new Error(`First-party artifact order drift at index ${index}: ${spec?.slug ?? '<missing>'} !== ${row.slug}`);
    }
    return spec;
  });
  if (artifacts.length !== FIRST_PARTY_ARTIFACT_SPECS.length) {
    throw new Error('First-party artifact projection length differs from the roster');
  }
  return artifacts;
}

/** Every governed selection the runtime half of an artifact publishes, in block order. */
const RUNTIME_FIELDS = ['recipeProfile', 'motion', 'expressive', 'decidedChannels'];

function renderBlock(runtime) {
  const fields = RUNTIME_FIELDS.filter((field) => runtime[field] !== undefined).map(
    (field) => `${field}: ${JSON.stringify(runtime[field])}`,
  );
  return fields.length === 0 ? 'Object.freeze({})' : `Object.freeze({ ${fields.join(', ')} })`;
}

/**
 * The FORMAT of the generated runtime module, stated ONCE so the writer and the
 * `--check` comparison are the same function: a generator whose expected output
 * is spelled twice can pass its own check against a file it would never write.
 *
 * @param {ReadonlyArray<{ slug: string, runtime: Record<string, unknown> }>} rows
 *   One row per first-party vertical, in roster order.
 * @param {string} regenerateCommand
 * @returns {string} the exact bytes of the generated module.
 */
function renderFirstPartyArtifactRuntimeModule(rows, regenerateCommand) {
  const entries = rows.map((row) => `  ${row.slug}: ${renderBlock(row.runtime)},`);
  return [
    '/* GENERATED — do not edit */',
    '/**',
    ' * @fileoverview The runtime half of every first-party vertical artifact.',
    ' *',
    ' * This file is a BUILD OUTPUT of the SAME compile that writes',
    ' * `src/foundation/tokens/css/facade/artifacts/<slug>/index.css`:',
    ' *   block = the recipe selection that compile validated, plus the governed',
    ' *   behavior `firstPartyGovernedBehavior` reads off its resolved baseline.',
    ' *',
    ' * WHY IT EXISTS. A code-owned vertical ships its CSS inside `styles.css`, so',
    ' * the runtime has no artifact row to read the non-CSS half off — and a',
    ' * governed SELECTION is not paint, so no stylesheet can hand it to React.',
    ' * The runtime used to re-derive that selection from the authored theme,',
    ' * which made the artifact and the product two independent readers of one',
    ' * decision. This is the artifact\'s own block, materialized for import',
    ' * exactly as its variables are materialized for loading.',
    ' *',
    ` * Regenerate: ${regenerateCommand}`,
    ' *',
    ' * @module Compilers/TenantCss/ArtifactRuntime',
    ' * @category Compilers',
    ' * @package @rottay/design-system',
    ' */',
    '',
    "import type { BrandExpressiveSelection } from '@/foundation/contracts/composition/tenants/themes';",
    "import type { FirstPartyVerticalId } from '@/foundation/contracts/kernel/verticals';",
    '',
    '/** The governed, non-CSS selections one vertical\'s artifact compiled. */',
    'export interface FirstPartyArtifactRuntimeBlock {',
    '  /** Validated recipe-profile id, absent when the vertical selects none. */',
    '  readonly recipeProfile?: string;',
    '  /** The motion dial the vertical decided; absent when it left motion to the foundation. */',
    '  readonly motion?: {',
    '    readonly intensity?: number;',
    '    readonly entranceDuration?: number;',
    '  };',
    '  /** The expressive selection the vertical decided. */',
    '  readonly expressive?: BrandExpressiveSelection;',
    '  /** Personality channels the vertical decided -- names only, nothing here can paint. */',
    '  readonly decidedChannels?: readonly string[];',
    '}',
    '',
    'export const FIRST_PARTY_ARTIFACT_RUNTIME: Readonly<',
    '  Record<FirstPartyVerticalId, FirstPartyArtifactRuntimeBlock>',
    '> = Object.freeze({',
    ...entries,
    '});',
    '',
    '/**',
    ' * The recipe profile a first-party vertical\'s artifact compiled, or',
    ' * `undefined` when it selected none. Never a fallback to another vertical.',
    ' */',
    'export function firstPartyArtifactRecipeProfile(',
    '  vertical: string,',
    '): string | undefined {',
    '  return FIRST_PARTY_ARTIFACT_RUNTIME[vertical as FirstPartyVerticalId]',
    '    ?.recipeProfile;',
    '}',
    '',
  ].join('\n');
}

function firstDiff(a, b) {
  const al = a.split('\n');
  const bl = b.split('\n');
  const max = Math.max(al.length, bl.length);
  for (let i = 0; i < max; i += 1) {
    if (al[i] !== bl[i]) {
      return `  line ${i + 1}:\n    committed: ${JSON.stringify(al[i])}\n    generated: ${JSON.stringify(bl[i])}`;
    }
  }
  return '  (files differ only in trailing content/length)';
}

/**
 * WO-TOK-02 step 5: compile-time APCA pairing check on the GENERATED ramp
 * (deriveTenantColorRamps, called from the lowering). Checks each
 * role's step-900 -- the far-from-ground extreme, meant to be usable as
 * readable text/icon color -- against the tenant's own ground.
 *
 * Deliberately scoped to the ramp this WO generates, not a re-check of
 * every pre-existing seed color against ground: bithire's own warningColor
 * (#D6A04E) already fails an APCA-60 check against its ground (#F8FBFF)
 * today, unrelated to this WO's derivation, and is already tracked by the
 * pre-existing `a11y.apcaPairings` decrease-only counter in
 * engine-token-audit.mjs (WO-GAT-04, "extend, never fork" -- this does not
 * duplicate that ratchet). Hard-failing the build on that pre-existing gap
 * would block bithire's artifact over a color choice this WO has no mandate
 * to change. The ramp's own far extreme is a real, always-should-pass
 * regression check instead: it is anchored to a fixed lightness bound
 * independent of the seed (see ramp.ts), so a failure here means the
 * derivation itself broke, not that a tenant chose an unlucky color.
 */
const RAMP_TOP_STEP = /^--ds-color-(primary|secondary|accent|success|warning|error|info|neutral)-900$/;

/**
 * Known-failing ramp/ground pairings, decrease-only.
 *
 * Extending the check to mode blocks revealed pairings that ALREADY ship in
 * those states: an unpinned ramp inherited the base block's light-ground values
 * into a dark state, where the -900 step is invisible. R1-P is an architecture
 * wave and may not repaint anything silently, so the pairings are recorded here
 * and adjudicated in sighted work. Anything NOT on this list fails the build;
 * entries that stop failing may simply be deleted.
 */
const APCA_BASELINE_PATH = resolve(__dirname, 'contrast-baseline/index.json');
const apcaBaseline = new Set(
  existsSync(APCA_BASELINE_PATH)
    ? JSON.parse(readFileSync(APCA_BASELINE_PATH, 'utf-8')).knownFailures.map((entry) => entry.key)
    : [],
);

/** Check every -900 ramp step that ships in one state against that state's ground. */
function checkRampApcaAgainstGround({ apcaContrast, APCA_BODY_TEXT_MIN_LC }, scope, label, ground, cssVariables) {
  if (!ground) return [];
  const failures = [];
  for (const [name, hex] of Object.entries(cssVariables)) {
    if (!RAMP_TOP_STEP.test(name)) continue;
    const lc = apcaContrast(hex, ground);
    if (Math.abs(lc) >= APCA_BODY_TEXT_MIN_LC) continue;
    failures.push({
      key: `${scope}|${name}`,
      message: `${label}: ${name} (${hex}) vs ground ${ground} -- |Lc|=${Math.abs(lc).toFixed(1)}, needs >=${APCA_BODY_TEXT_MIN_LC}`,
    });
  }
  return failures;
}

function checkGeneratedRampApca(compiler, slug, compiled) {
  // A compile's ground for the mode it compiles is the ground it emits:
  // `--ds-color-bg-primary` in the base block. When a compile carries none,
  // the fallback is keyed to its DECLARED color scheme rather than inferred
  // from which channels happen to be populated -- the compiler's own
  // DARK_DEFAULT_GROUND / LIGHT_DEFAULT_GROUND.
  const baseGround =
    compiled.cssVariables['--ds-color-bg-primary'] ??
    (compiled.colorScheme === 'dark' ? compiler.DARK_DEFAULT_GROUND : compiler.LIGHT_DEFAULT_GROUND);
  const failures = checkRampApcaAgainstGround(compiler, slug, slug, baseGround, compiled.cssVariables);

  // A mode block ships its own ramp on its own ground. Checking authored ramps
  // only against the base ground would clear a dark ramp for the light canvas
  // it never appears on -- and miss the pairing that actually renders. A block
  // that leaves the ground to the foundation renders on that mode's default.
  for (const block of compiled.modeBlocks ?? []) {
    const modeGround =
      block.cssVariables['--ds-color-bg-primary'] ??
      (block.colorScheme === 'dark' ? compiler.DARK_DEFAULT_GROUND : compiler.LIGHT_DEFAULT_GROUND);
    const shipped = { ...compiled.cssVariables, ...block.cssVariables };
    failures.push(...checkRampApcaAgainstGround(compiler, `${slug}|${block.mode}`, `${slug} (${block.mode} mode)`, modeGround, shipped));
  }
  return failures;
}

/** A gate verdict already printed; thrown so the bootstrap directory is still removed. */
class GateFailure extends Error {}

const RUNTIME_MODULE_PATH = resolve(
  root,
  'src/infrastructure/compilers/runtime/tenant-css/artifact-runtime/index.ts',
);

/** Lower every first-party theme once, gate its ramp, and collect both halves. */
function compileArtifacts(compiler) {
  const apcaFailures = [];
  const rows = firstPartyArtifacts(compiler).map((spec) => {
    const { css, compiled, governed } = compiler.renderFirstPartyArtifact({
      spec,
      regenerateCommand: compiler.REGENERATE_COMMAND,
    });
    apcaFailures.push(...checkGeneratedRampApca(compiler, spec.slug, compiled));
    return {
      slug: spec.slug,
      css,
      compiled,
      runtime: { recipeProfile: compiled.runtime.recipeProfile, ...governed },
    };
  });

  const newApcaFailures = apcaFailures.filter((failure) => !apcaBaseline.has(failure.key));
  const baselinedApcaFailures = apcaFailures.filter((failure) => apcaBaseline.has(failure.key));

  if (!verifyDist && baselinedApcaFailures.length > 0) {
    console.warn(`\n${baselinedApcaFailures.length} known ramp pairing(s) below the APCA body-text threshold (baselined, decrease-only):`);
    for (const failure of baselinedApcaFailures) console.warn(`  ! ${failure.message}`);
  }

  if (newApcaFailures.length > 0) {
    console.error(`\n${newApcaFailures.length} generated ramp pairing(s) failed the APCA body-text threshold:`);
    for (const failure of newApcaFailures) console.error(`  ✗ ${failure.message}`);
    console.error(`\nFix the pairing, or add it to ${APCA_BASELINE_PATH} with an owner and a retirement condition.`);
    throw new GateFailure('apca');
  }
  return rows;
}

/** Write, or with `--check` compare, both outputs of the bootstrap compile. */
function generate(compiler) {
  let stale = 0;
  const rows = compileArtifacts(compiler);

  for (const { slug, css: output, compiled } of rows) {
    const artifactPath = resolve(root, `src/foundation/tokens/css/facade/artifacts/${slug}/index.css`);
    if (check) {
      const current = existsSync(artifactPath) ? readFileSync(artifactPath, 'utf-8') : '';
      if (current !== output) {
        stale += 1;
        console.error(`✗ artifacts/${slug}/index.css is out of sync with its authored source.`);
        console.error(firstDiff(current, output));
      } else {
        console.log(`✓ artifacts/${slug}/index.css is up to date.`);
      }
    } else {
      writeFileSync(artifactPath, output);
      console.log(`Generated artifacts/${slug}/index.css (${output.length} bytes, ${Object.keys(compiled.cssVariables).length} compiled vars).`);
    }
  }

  // The runtime half, written as ONE module rather than one per slug: a reader
  // needs the whole roster to answer "which profile did this vertical compile?",
  // and three files would be three imports of one fact.
  const runtimeModule = renderFirstPartyArtifactRuntimeModule(rows, compiler.REGENERATE_COMMAND);
  const current = existsSync(RUNTIME_MODULE_PATH) ? readFileSync(RUNTIME_MODULE_PATH, 'utf-8') : '';
  if (check) {
    if (current !== runtimeModule) {
      stale += 1;
      console.error('✗ tenant-css/artifact-runtime/index.ts is out of sync with its authored source.');
      console.error(firstDiff(current, runtimeModule));
    } else {
      console.log('✓ tenant-css/artifact-runtime/index.ts is up to date.');
    }
  } else if (current === runtimeModule) {
    // Identical bytes are NOT rewritten: a standalone regeneration after a build
    // would otherwise date the module after its bundle, which `decisions-lit` refuses.
    console.log('tenant-css/artifact-runtime/index.ts is already current.');
  } else {
    writeFileSync(RUNTIME_MODULE_PATH, runtimeModule);
    console.log(
      `Generated tenant-css/artifact-runtime/index.ts (${runtimeModule.length} bytes, ${rows.length} verticals).`,
    );
  }

  if (check && stale > 0) {
    console.error(`\n${stale} vertical artifact(s) are stale or hand-edited. Regenerate with:\n  ${compiler.REGENERATE_COMMAND}`);
    throw new GateFailure('stale');
  }
}

/**
 * The block the package SHIPS, in both module formats, against the block its
 * own bundled compiler produces. The source module can be current while the
 * bundle still carries its predecessor; only the bundle is what a consumer
 * mounts, so only the bundle can answer this.
 */
async function verifyShippedRuntime(compiler, distRoot) {
  const modulePath = resolve(distRoot, COMPILER_MODULES.artifactRuntime);
  const shipped = {
    esm: (await import(pathToFileURL(`${modulePath}.js`).href)).FIRST_PARTY_ARTIFACT_RUNTIME,
    cjs: createRequire(import.meta.url)(`${modulePath}.cjs`).FIRST_PARTY_ARTIFACT_RUNTIME,
  };
  let drift = 0;
  for (const { slug, runtime } of compileArtifacts(compiler)) {
    const expected = renderBlock(runtime);
    for (const [format, table] of Object.entries(shipped)) {
      const actual = table?.[slug] === undefined ? '<missing>' : renderBlock(table[slug]);
      if (actual !== expected) {
        drift += 1;
        console.error(`✗ dist ${format} runtime block for ${slug} is ${actual}, but its compile produced ${expected}.`);
      }
    }
  }
  if (drift > 0) {
    console.error(
      '\nThe bundle was compiled from a runtime module older than its artifacts. The artifacts must be ' +
        'generated before `vite build`; run the full build: pnpm --filter @rottay/design-system build',
    );
    throw new GateFailure('dist');
  }
  console.log(`✓ dist ships the runtime block its compiler produces (${Object.keys(shipped).join(', ')}).`);
}

try {
  if (verifyDist) {
    const distRoot = resolve(root, 'dist');
    await verifyShippedRuntime(await loadCompiler(distRoot), distRoot);
  } else {
    await withBootstrapCompiler(root, async (compilerRoot) => generate(await loadCompiler(compilerRoot)));
  }
} catch (error) {
  if (!(error instanceof GateFailure)) console.error(error);
  process.exitCode = 1;
}
