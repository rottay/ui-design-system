/**
 * Render any first-party vertical artifact IN MEMORY from its authored sources,
 * exactly as `build:vertical-css` would, without writing to the tree.
 *
 * Generalises render-rottay.mjs to all three slugs. The renderer is bundled from
 * `src/`, never `dist/` — dist is behind source (it emits `--ds-tabs-item-radius: 6px`
 * where the committed artifact carries the radius-scale wrap), so a dist-backed
 * render would silently reintroduce that regression into every measurement.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const CORE = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core';

function bundleTs(entry, tag) {
  const out = join(mkdtempSync(join(tmpdir(), `cra23-${tag}-`)), 'out.mjs');
  execFileSync(
    resolve(CORE, 'node_modules/.bin/esbuild'),
    [resolve(CORE, entry), '--bundle', '--format=esm', '--platform=node', `--outfile=${out}`, '--log-level=error'],
    { stdio: ['ignore', 'inherit', 'inherit'] },
  );
  return import(`${pathToFileURL(out).href}?t=${Date.now()}`);
}

const { renderFirstPartyArtifact, FIRST_PARTY_ARTIFACT_SPECS, FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND } =
  await bundleTs('src/infrastructure/compilers/runtime/tenant-css/artifact-renderer/index.ts', 'renderer');

/** slug -> the authored theme module path and its exported symbol. */
const THEMES = {
  rottay: ['src/foundation/tokens/ts/presentation/brand-themes/platform/index.ts', 'rottayBrandTheme'],
  bithire: ['src/foundation/tokens/ts/presentation/brand-themes/bithire/index.ts', 'bithireBrandTheme'],
  evnto: ['src/foundation/tokens/ts/presentation/brand-themes/evnto/index.ts', 'evntoBrandTheme'],
};

/** vertical key -> artifact slug, matching the resolution-probe's scope module. */
export const SLUG = { platform: 'rottay', bithire: 'bithire', evnto: 'evnto' };

export async function renderArtifact(slug) {
  const spec = FIRST_PARTY_ARTIFACT_SPECS.find((s) => s.slug === slug);
  if (!spec) throw new Error(`render-artifact: unknown slug ${slug}`);
  const [path, symbol] = THEMES[slug];
  const mod = await bundleTs(path, `theme-${slug}`);
  const brandTheme = mod[symbol];
  if (!brandTheme) throw new Error(`render-artifact: ${path} does not export ${symbol}`);
  const extensionCss = readFileSync(
    resolve(CORE, `src/foundation/tokens/css/facade/artifacts/${slug}/_source/extension.css`),
    'utf-8',
  );
  const { css, compiled } = renderFirstPartyArtifact({
    spec,
    brandTheme,
    extensionCss,
    regenerateCommand: FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
  });
  return { css, compiled };
}

/** The committed artifact, for the control that proves the renderer is faithful. */
export function committedArtifact(slug) {
  return readFileSync(resolve(CORE, `src/foundation/tokens/css/facade/artifacts/${slug}/index.css`), 'utf-8');
}
