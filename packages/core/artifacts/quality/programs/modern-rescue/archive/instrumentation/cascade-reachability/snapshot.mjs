/**
 * Snapshot the four "before" bundles (3 verticals + tenant-less) to scratchpad,
 * so the before/after comparison needs only ONE disk state of `default.css`.
 *
 * Why not swap the file back and forth: `resolveBundle` reads from disk, and
 * three other lanes are writing this tree. Two swaps means two windows in which
 * a peer could compose against a half-applied state. One snapshot, one edit.
 *
 * Both arms use RENDERED artifacts, not committed ones. The committed rottay
 * artifact is already behind its source (this lane's own 95 channels are in the
 * .ts and not yet built), so "committed" is not the state the lead will land —
 * "rendered from current source" is.
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CORE = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core';
const S = '/private/tmp/claude-502/-Users-daniel-Developer-Rottay/9de519b9-cdd9-4637-b562-0d6a74d41c3a/scratchpad/CRA23R';
const P = (p) => resolve(CORE, 'src/tooling/resolution-probe', p);

const { resolveBundle, sha256 } = await import(P('runtime/bundle/index.mjs'));
const { renderArtifact, committedArtifact, SLUG } = await import(`${S}/render-artifact.mjs`);

const label = process.argv[2] ?? 'before';
const out = {};
for (const vertical of ['platform', 'bithire', 'evnto']) {
  const slug = SLUG[vertical];
  const base = await resolveBundle({ vertical, mode: 'fresh' });
  const committed = committedArtifact(slug);
  const occurrences = base.css.split(committed).length - 1;
  if (occurrences !== 1) throw new Error(`snapshot: ${slug} artifact appears ${occurrences}x; refusing.`);

  const { css: rendered } = await renderArtifact(slug);
  const withRendered = base.css.replace(committed, rendered);
  writeFileSync(`${S}/bundle-${label}-${vertical}.css`, withRendered);
  out[vertical] = { sha: sha256(withRendered).slice(0, 12), renderedMatchesCommitted: rendered === committed };

  if (vertical === 'platform') {
    const tenantless = base.css.replace(committed, '/* tenant artifact withheld */');
    writeFileSync(`${S}/bundle-${label}-tenantless.css`, tenantless);
    out.tenantless = { sha: sha256(tenantless).slice(0, 12) };
  }
}
console.log(`snapshot [${label}]`);
for (const [k, v] of Object.entries(out)) {
  console.log(`  ${k.padEnd(11)} ${v.sha}${v.renderedMatchesCommitted === undefined ? '' : `   rendered==committed: ${v.renderedMatchesCommitted}`}`);
}
