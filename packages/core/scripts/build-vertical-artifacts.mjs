/**
 * Regenerate first-party vertical CSS artifacts from their authored sources.
 *
 * Each artifact (`src/foundation/tokens/css/facade/artifacts/<slug>/index.css`) is a BUILD OUTPUT:
 *   index.css = compileBrandTheme(<slug>BrandTheme) + <slug>/_source/extension.css
 *
 * The brand compiler owns the theme variables (palette, typography, surfaces,
 * chrome). The declared extension carries what the compiler cannot express
 * (oklch DaisyUI bridge, color scales, semantic sets, dark-mode blocks, and
 * component rules). This keeps the artifact a pure projection of authored
 * sources so drift cannot accumulate by hand-editing.
 *
 * Scope: every slug in FIRST_PARTY_ARTIFACT_SPECS (bithire, evnto, rottay).
 * themanagementmiami and the torture fixtures are deliberately not registered
 * there and must not be added here.
 *
 * Usage:
 *   node scripts/build-vertical-artifacts.mjs           # write artifacts
 *   node scripts/build-vertical-artifacts.mjs --check    # fail if any artifact is stale
 *
 * Imports the compiled package from dist/, so run after `tsc && vite build`
 * (the `build` script sequences this for you via build:vertical-css).
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { isDarkSurfacePalette } from '../dist/infrastructure/compilers/kernel/runtime/brand-theme/index.js';
import { apcaContrast, APCA_BODY_TEXT_MIN_LC } from '../dist/foundation/kernel/accessibility/branding-contrast/index.js';
import {
  renderFirstPartyArtifact,
  FIRST_PARTY_ARTIFACT_SPECS,
  FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
} from '../dist/infrastructure/compilers/runtime/tenant-css/artifact-renderer/index.js';
import { bithireBrandTheme } from '../dist/foundation/tokens/ts/presentation/brand-themes/bithire/index.js';
import { evntoBrandTheme } from '../dist/foundation/tokens/ts/presentation/brand-themes/evnto/index.js';
import { rottayBrandTheme } from '../dist/foundation/tokens/ts/presentation/brand-themes/platform/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const check = process.argv.includes('--check');

const REGENERATE_COMMAND = FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND;

/** Resolve the authored BrandTheme for each first-party artifact slug. */
const BRAND_THEMES = {
  bithire: bithireBrandTheme,
  evnto: evntoBrandTheme,
  rottay: rottayBrandTheme,
};

/** First-party artifacts this generator owns (spec is the shared source of truth). */
const artifacts = FIRST_PARTY_ARTIFACT_SPECS.map((spec) => ({
  ...spec,
  brandTheme: BRAND_THEMES[spec.slug],
}));

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
 * (deriveTenantColorRamps, called from compileBrandTheme). Checks each
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
const APCA_BASELINE_PATH = resolve(__dirname, 'build-vertical-artifacts.apca-baseline.json');
const apcaBaseline = new Set(
  existsSync(APCA_BASELINE_PATH)
    ? JSON.parse(readFileSync(APCA_BASELINE_PATH, 'utf-8')).knownFailures.map((entry) => entry.key)
    : [],
);

/** Check every -900 ramp step that ships in one state against that state's ground. */
function checkRampApcaAgainstGround(scope, label, ground, cssVariables) {
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

function checkGeneratedRampApca(slug, brandTheme, compiled) {
  const dark = isDarkSurfacePalette(brandTheme.palette);
  const baseGround = dark ? brandTheme.palette?.darkBackgroundColor : (brandTheme.palette?.backgroundColor ?? '#FFFFFF');
  const failures = checkRampApcaAgainstGround(slug, slug, baseGround, compiled.cssVariables);

  // A mode block ships its own ramp on its own ground. Checking authored ramps
  // only against the base ground would clear a dark ramp for the light canvas
  // it never appears on -- and miss the pairing that actually renders.
  for (const block of compiled.modeBlocks ?? []) {
    const modeGround = block.cssVariables['--ds-color-bg-primary'] ?? baseGround;
    const shipped = { ...compiled.cssVariables, ...block.cssVariables };
    failures.push(...checkRampApcaAgainstGround(`${slug}|${block.mode}`, `${slug} (${block.mode} mode)`, modeGround, shipped));
  }
  return failures;
}

let stale = 0;
const apcaFailures = [];

for (const spec of artifacts) {
  const { slug, brandTheme } = spec;
  const artifactPath = resolve(root, `src/foundation/tokens/css/facade/artifacts/${slug}/index.css`);
  const extensionPath = resolve(root, `src/foundation/tokens/css/facade/artifacts/${slug}/_source/extension.css`);

  const { css: output, compiled } = renderFirstPartyArtifact({
    spec,
    brandTheme,
    extensionCss: readFileSync(extensionPath, 'utf-8'),
    regenerateCommand: REGENERATE_COMMAND,
  });
  apcaFailures.push(...checkGeneratedRampApca(slug, brandTheme, compiled));

  if (check) {
    const current = existsSync(artifactPath) ? readFileSync(artifactPath, 'utf-8') : '';
    if (current !== output) {
      stale += 1;
      console.error(`✗ artifacts/${slug}/index.css is out of sync with its authored sources.`);
      console.error(firstDiff(current, output));
    } else {
      console.log(`✓ artifacts/${slug}/index.css is up to date.`);
    }
  } else {
    writeFileSync(artifactPath, output);
    console.log(`Generated artifacts/${slug}/index.css (${output.length} bytes, ${Object.keys(compiled.cssVariables).length} compiled vars).`);
  }
}

const newApcaFailures = apcaFailures.filter((failure) => !apcaBaseline.has(failure.key));
const baselinedApcaFailures = apcaFailures.filter((failure) => apcaBaseline.has(failure.key));

if (baselinedApcaFailures.length > 0) {
  console.warn(`\n${baselinedApcaFailures.length} known ramp pairing(s) below the APCA body-text threshold (baselined, decrease-only):`);
  for (const failure of baselinedApcaFailures) console.warn(`  ! ${failure.message}`);
}

if (newApcaFailures.length > 0) {
  console.error(`\n${newApcaFailures.length} generated ramp pairing(s) failed the APCA body-text threshold:`);
  for (const failure of newApcaFailures) console.error(`  ✗ ${failure.message}`);
  console.error(`\nFix the pairing, or add it to ${APCA_BASELINE_PATH} with an owner and a retirement condition.`);
  process.exit(1);
}

if (check && stale > 0) {
  console.error(`\n${stale} vertical artifact(s) are stale or hand-edited. Regenerate with:\n  ${REGENERATE_COMMAND}`);
  process.exit(1);
}
