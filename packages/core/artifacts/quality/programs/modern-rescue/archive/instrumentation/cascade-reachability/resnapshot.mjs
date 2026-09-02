/**
 * Re-snapshot BOTH arms from ONE disk state, after the bithire lane authored
 * +355 lines in its theme mid-flight.
 *
 * The previous snapshot pair is void: its `before` bundles were composed with
 * the OLD bithire theme and its `after` with the same, but the tree has since
 * moved, so any re-run of only one arm would differ by two causes at once and
 * "bithire moves 6 rows" could not be attributed to this change.
 *
 * NO DISK SWAP. `default.css` is imported verbatim into the composed bundle, so
 * the `before` arm is produced by substituting the pristine file text back into
 * the already-composed `after` bundle. One read of the tree, both arms, and the
 * bithire/evnto themes are necessarily identical across arms because they come
 * from the same read.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CORE = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core';
const S = '/private/tmp/claude-502/-Users-daniel-Developer-Rottay/9de519b9-cdd9-4637-b562-0d6a74d41c3a/scratchpad/CRA23R';
const P = (p) => resolve(CORE, 'src/tooling/resolution-probe', p);

const { resolveBundle, sha256 } = await import(P('runtime/bundle/index.mjs'));
const { renderArtifact, committedArtifact, SLUG } = await import(`${S}/render-artifact.mjs`);

const DEFAULT_CSS = resolve(CORE, 'src/foundation/tokens/css/foundation/themes/default.css');
const edited = readFileSync(DEFAULT_CSS, 'utf-8');
const pristine = readFileSync(`${S}/default.css.orig`, 'utf-8');
if (edited === pristine) throw new Error('resnapshot: default.css is unedited; nothing to compare.');

for (const vertical of ['platform', 'bithire', 'evnto']) {
  const slug = SLUG[vertical];
  const base = await resolveBundle({ vertical, mode: 'fresh' });
  const committed = committedArtifact(slug);
  if (base.css.split(committed).length - 1 !== 1) throw new Error(`resnapshot: ${slug} artifact not unique.`);

  const { css: rendered } = await renderArtifact(slug);
  const after = base.css.replace(committed, rendered);

  const hits = after.split(edited).length - 1;
  if (hits !== 1) {
    throw new Error(
      `resnapshot: edited default.css appears ${hits}x in the composed ${vertical} bundle; ` +
        'the before-arm substitution would be wrong. Refusing.',
    );
  }
  const before = after.replace(edited, pristine);

  writeFileSync(`${S}/bundle-before-${vertical}.css`, before);
  writeFileSync(`${S}/bundle-after-${vertical}.css`, after);
  console.log(`  ${vertical.padEnd(9)} before=${sha256(before).slice(0, 12)} after=${sha256(after).slice(0, 12)}`);

  if (vertical === 'platform') {
    const tlAfter = base.css.replace(committed, '/* tenant artifact withheld */');
    const tlBefore = tlAfter.replace(edited, pristine);
    writeFileSync(`${S}/bundle-before-tenantless.css`, tlBefore);
    writeFileSync(`${S}/bundle-after-tenantless.css`, tlAfter);
    console.log(`  tenantless before=${sha256(tlBefore).slice(0, 12)} after=${sha256(tlAfter).slice(0, 12)}`);
  }
}
console.log('both arms rebuilt from one disk state');
