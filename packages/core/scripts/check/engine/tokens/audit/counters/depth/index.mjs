import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { shadowScaleDefinitions } from '../../shadow-scales/index.mjs';
import { artifactsDir, tokensCssDir } from '../../context/paths/index.mjs';
import { cssFilesUnder, luminanceHex } from '../../parsing/index.mjs';

/**
 * Count elevation/shadow SCALE definition sites at the foundation/engine layer
 * (tenant artifacts are surface-adaptive overrides of the one scale, not scales).
 * The single source of truth is one --ds-elevation-* ramp defined with literal
 * box-shadow values; --ds-shadow-* must be var() aliases of it. A parallel
 * --ds-shadow-* ramp defined with literal values counts as a second scale.
 * Target: exactly 1.
 */
function countShadowScales() {
  const files = [
    ...cssFilesUnder(join(tokensCssDir, 'foundation')),
    ...cssFilesUnder(join(tokensCssDir, 'runtime/engines')),
  ];
  let scales = 0;
  for (const f of files) {
    scales += shadowScaleDefinitions(readFileSync(f, 'utf8'));
  }
  return scales;
}

/**
 * Count depth declarations that resolve to a pure-black-only value in the dark
 * region of a dark-surface tenant artifact. Covers the elevation ramp AND the
 * tokens components actually consume for depth (--ds-shadow-xs..2xl,
 * --ds-card-shadow / -hover / -elevated), since a pure-black value on any of them
 * renders flat on a dark canvas. A dark-surface depth token must carry a hairline
 * highlight (white) and/or a primary glow — in practice by aliasing the dark
 * --ds-elevation-* ramp. Target: 0.
 */
function countDarkPureBlackElevations() {
  if (!existsSync(artifactsDir)) return 0;
  let count = 0;
  for (const slug of readdirSync(artifactsDir)) {
    const file = join(artifactsDir, slug, 'index.css');
    if (!existsSync(file)) continue;
    const css = readFileSync(file, 'utf8');
    const bg = css.match(/--ds-color-bg-primary:\s*(#[0-9a-fA-F]{6})/);
    if (!bg || luminanceHex(bg[1]) >= 128) continue; // not a dark-surface tenant
    // Split off the light-mode counterpart block (a POSITIVE light selector, not the
    // dark block's own `:not([data-theme='light'])` scope) so only the dark region
    // is scanned.
    const lightIdx = css.search(/(?<!:not\()\[data-theme=['"]light['"]\]|(?<!:not\()\.light(?=[\s,{])/);
    const darkRegion = lightIdx >= 0 ? css.slice(0, lightIdx) : css;
    const depthToken =
      /--ds-(?:elevation-[1-5]|shadow-(?:xs|sm|md|lg|xl|2xl)|card-shadow(?:-hover|-elevated)?):\s*([^;]+);/g;
    for (const m of darkRegion.matchAll(depthToken)) {
      const val = m[1].trim();
      if (val === 'none') continue;
      const hasHighlight = /255/.test(val) || /color-mix|var\(--ds-color-primary/.test(val);
      const isBlackShadow = /rgba?\(\s*0\s*,\s*0\s*,\s*0/.test(val);
      if (isBlackShadow && !hasHighlight) count += 1;
    }
  }
  return count;
}

export {
  countShadowScales,
  countDarkPureBlackElevations,
};
