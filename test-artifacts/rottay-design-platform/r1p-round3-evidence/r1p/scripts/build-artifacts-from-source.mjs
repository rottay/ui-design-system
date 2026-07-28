/**
 * Source-based mirror of packages/core/scripts/build-vertical-artifacts.mjs.
 *
 * Same inputs, same renderer, same APCA gate — but the compiler, themes and
 * renderer come from src/ instead of the frozen dist/ (AD-9). Running the
 * shipped script instead would compile the OLD dist compiler against the NEW
 * extension sources and silently change pixels.
 *
 *   node build-artifacts-from-source.mjs           # write
 *   node build-artifacts-from-source.mjs --check   # fail if stale
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { loadSource, CORE_SPECIFIERS, CORE_ROOT } from './source-loader.mjs';

const check = process.argv.includes('--check');

const m = await loadSource(CORE_SPECIFIERS);
const { isDarkSurfacePalette } = m.compiler;
const {
  renderFirstPartyArtifact,
  FIRST_PARTY_ARTIFACT_SPECS,
  FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
} = m.renderer;
const { apcaContrast, APCA_BODY_TEXT_MIN_LC } = m.apca;

const BRAND_THEMES = {
  bithire: m.bithire.bithireBrandTheme,
  evnto: m.evnto.evntoBrandTheme,
  rottay: m.platform.rottayBrandTheme,
};

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

const RAMP_TOP_STEP = /^--ds-color-(primary|secondary|accent|success|warning|error|info|neutral)-900$/;

const APCA_BASELINE_PATH = `${CORE_ROOT}/scripts/build-vertical-artifacts.apca-baseline.json`;
const apcaBaseline = new Set(
  existsSync(APCA_BASELINE_PATH)
    ? JSON.parse(readFileSync(APCA_BASELINE_PATH, 'utf-8')).knownFailures.map((e) => e.key)
    : [],
);

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
  const baseGround = dark
    ? brandTheme.palette?.darkBackgroundColor
    : (brandTheme.palette?.backgroundColor ?? '#FFFFFF');
  const failures = checkRampApcaAgainstGround(slug, slug, baseGround, compiled.cssVariables);
  for (const block of compiled.modeBlocks ?? []) {
    const modeGround = block.cssVariables['--ds-color-bg-primary'] ?? baseGround;
    const shipped = { ...compiled.cssVariables, ...block.cssVariables };
    failures.push(...checkRampApcaAgainstGround(`${slug}|${block.mode}`, `${slug} (${block.mode} mode)`, modeGround, shipped));
  }
  return failures;
}

let stale = 0;
const apcaFailures = [];

for (const spec of FIRST_PARTY_ARTIFACT_SPECS) {
  const { slug } = spec;
  const brandTheme = BRAND_THEMES[slug];
  const artifactPath = resolve(CORE_ROOT, `src/foundation/tokens/css/facade/artifacts/${slug}/index.css`);
  const extensionPath = resolve(CORE_ROOT, `src/foundation/tokens/css/facade/artifacts/${slug}/_source/extension.css`);

  const { css: output, compiled } = renderFirstPartyArtifact({
    spec,
    brandTheme,
    extensionCss: readFileSync(extensionPath, 'utf-8'),
    regenerateCommand: FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
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

const newApcaFailures = apcaFailures.filter((f) => !apcaBaseline.has(f.key));
const baselinedApcaFailures = apcaFailures.filter((f) => apcaBaseline.has(f.key));
if (baselinedApcaFailures.length > 0) {
  console.warn(`\n${baselinedApcaFailures.length} known ramp pairing(s) below the APCA threshold (baselined, decrease-only):`);
  for (const f of baselinedApcaFailures) console.warn(`  ! ${f.message}`);
}
if (newApcaFailures.length > 0) {
  console.error(`\n${newApcaFailures.length} generated ramp pairing(s) failed the APCA body-text threshold:`);
  for (const f of newApcaFailures) console.error(`  ✗ ${f.message}`);
  process.exit(1);
}
if (check && stale > 0) process.exit(1);
