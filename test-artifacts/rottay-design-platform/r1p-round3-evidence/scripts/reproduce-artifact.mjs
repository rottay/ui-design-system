/**
 * Bonus verification: re-render each first-party artifact from the SAME authored
 * sources the build uses (dist compileBrandTheme + snapshot extension.css) and
 * byte-compare against the snapshot index.css.
 *
 * READ-ONLY: imports dist modules, reads snapshots, writes nothing to the repo.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const DIST = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core/dist';
const __dirname = dirname(fileURLToPath(import.meta.url));
const SNAP = resolve(__dirname, '..', 'snapshots');

const { compileBrandTheme } = await import(`${DIST}/infrastructure/compilers/kernel/runtime/brand-theme/index.js`);
const { renderVerticalArtifact, FIRST_PARTY_ARTIFACT_SPECS, FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND } =
  await import(`${DIST}/infrastructure/compilers/runtime/tenant-css/artifact-renderer/index.js`);
const { bithireBrandTheme } = await import(`${DIST}/foundation/tokens/ts/presentation/brand-themes/bithire/index.js`);
const { evntoBrandTheme } = await import(`${DIST}/foundation/tokens/ts/presentation/brand-themes/evnto/index.js`);
const { rottayBrandTheme } = await import(`${DIST}/foundation/tokens/ts/presentation/brand-themes/platform/index.js`);

const THEMES = { bithire: bithireBrandTheme, evnto: evntoBrandTheme, rottay: rottayBrandTheme };
const sha256 = (s) => createHash('sha256').update(s, 'utf-8').digest('hex');

const results = [];
for (const spec of FIRST_PARTY_ARTIFACT_SPECS) {
  const extensionCss = readFileSync(resolve(SNAP, spec.slug, '_source', 'extension.css'), 'utf-8');
  const snapshot = readFileSync(resolve(SNAP, spec.slug, 'index.css'), 'utf-8');
  const compiled = compileBrandTheme({ brandTheme: THEMES[spec.slug], tenantSlug: spec.slug });
  const output = renderVerticalArtifact({
    tenantSlug: spec.slug,
    verticalKey: spec.verticalKey,
    authoredThemePath: spec.authoredThemePath,
    displayName: spec.displayName,
    selector: spec.selector,
    compiledCssVariables: compiled.cssVariables,
    extensionCss,
    regenerateCommand: FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
  });
  results.push({
    slug: spec.slug,
    compiledVarCount: Object.keys(compiled.cssVariables).length,
    byteIdentical: output === snapshot,
    renderedSha256: sha256(output),
    snapshotSha256: sha256(snapshot),
  });
}
console.log(JSON.stringify(results, null, 2));
