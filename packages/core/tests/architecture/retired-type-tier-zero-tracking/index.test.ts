/**
 * @fileoverview Fail-closed gate: the `xs`/`sm` tier tracking channels are
 * retired, with no way back.
 *
 * WHY IT EXISTS. `--ds-type-tier-xs-letter-spacing` and
 * `--ds-type-tier-sm-letter-spacing` were emitted as the literal `0` and
 * measured ZERO readers -- none in `packages/core`, none in the showroom, none
 * in app-bithire, app-evnto or app-platform. They were not a dormant knob: a
 * small heading takes its tracking from the governed heading role
 * (`--ds-typography-heading-letter-spacing`), and a tier channel that resolved
 * to `0` could only have taken effect by OVERRIDING the role it was meant to
 * defer to. So the pair was a second tracking authority whose only safe value
 * was the one that did nothing. Owner resolution R5 (F2.9) retired them rather
 * than pin them inert or invent a reader to satisfy the liveness census.
 *
 * WHAT REPLACED THEM. Nothing was ported, because the route they stood in front
 * of already worked: `Typography.causality.integration` probes it in a real
 * browser across the three first-party verticals -- `xs`/`sm` paint the role to
 * the pixel their own size implies, a type arm moves the role and both follow
 * it, and `md` holds because the tier owns `md` and up. bithire is the witness
 * that makes the two sources distinguishable: its role tracking is POSITIVE
 * while its `md` tier channel is negative.
 *
 * WHAT THIS GATE DOES NOT READ. Generated snapshots -- `facade/artifacts/`,
 * `artifacts/generated/`, the hooks manifest and the customization manifests --
 * still carry the two declarations until their owners regenerate. A declaration
 * nobody reads paints nothing, and re-deriving those files is the DT's
 * serialized window, not this drill's business. Authored source is the
 * authority here, and that is what is scanned.
 *
 * The mutation block at the bottom proves the source scan can fail. A gate that
 * has never been shown to go red is not evidence.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

import { describe, expect, it } from 'vitest';

import { deriveTypeTierChannels } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/typography/tier';

const PACKAGE_ROOT = resolve(__dirname, '../../..');
const SRC_ROOT = join(PACKAGE_ROOT, 'src');
const SHOWROOM_ROOT = resolve(PACKAGE_ROOT, '../showroom/src');

/** The sibling application checkouts, when this machine has them. */
const SIBLING_APPS = ['app-bithire', 'app-evnto', 'app-platform'].map((app) =>
  resolve(PACKAGE_ROOT, '../../..', app, 'src'),
);

/** The two retired names. */
const RETIRED = [
  '--ds-type-tier-xs-letter-spacing',
  '--ds-type-tier-sm-letter-spacing',
] as const;

/** The governed role the two small tiers inherit instead. */
const HEADING_ROLE = '--ds-typography-heading-letter-spacing';

const TYPOGRAPHY_SKIN = join(
  SRC_ROOT,
  'foundation/tokens/css/runtime/engines/modern/skin/typography/index.css',
);

/**
 * The generated snapshots, which are outputs rather than authorities. They are
 * named by path so a NEW generated tree cannot quietly widen the exemption.
 */
const GENERATED = [
  'src/foundation/tokens/css/facade/artifacts/',
  'artifacts/generated/',
  '/dist/',
  '/.next/',
];

const TEST_OR_SUPPORT =
  /(?:^|[\\/])(?:tests?|__tests__|fixtures|__fixtures__|stories)[\\/]|\.(?:test|spec|stories)\.[cm]?tsx?$/u;

const AUTHORED = /\.(?:[cm]?tsx?|css)$/u;

function walk(root: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(root)) {
    if (entry === 'node_modules' || entry === 'dist' || entry === '.next') continue;
    const absolute = join(root, entry);
    if (statSync(absolute).isDirectory()) found.push(...walk(absolute));
    else if (AUTHORED.test(absolute)) found.push(absolute);
  }
  return found;
}

/** Every authored (non-test, non-generated) source file in the scanned repos. */
function productiveSources(): string[] {
  // An absent root would make every "no reader" assertion below pass on an
  // empty list, so the two roots this package owns are asserted present.
  for (const root of [SRC_ROOT, SHOWROOM_ROOT]) {
    expect(existsSync(root), `source root moved: ${root}`).toBe(true);
  }
  const roots = [SRC_ROOT, SHOWROOM_ROOT, ...SIBLING_APPS.filter((root) => existsSync(root))];
  return roots
    .flatMap(walk)
    .map((file) => file.split(sep).join('/'))
    .filter((file) => !TEST_OR_SUPPORT.test(relative(PACKAGE_ROOT, file)))
    .filter((file) => !GENERATED.some((generated) => file.includes(generated)));
}

/** Files whose text names any of the given channels. */
function filesNaming(files: readonly string[], needles: readonly string[]): string[] {
  return files
    .filter((file) => {
      const text = readFileSync(file, 'utf8');
      return needles.some((needle) => text.includes(needle));
    })
    .map((file) => relative(PACKAGE_ROOT, file).split(sep).join('/'));
}

describe('the two zero-only tier tracking channels -- the producer is gone', () => {
  it('emits neither name', () => {
    const emitted = Object.keys(deriveTypeTierChannels());
    for (const name of RETIRED) expect(emitted, name).not.toContain(name);
  });

  it('narrows the ramp rather than emptying it', () => {
    // The retirement is two channels, not the tier owner: the five tiers that
    // DO state tracking keep it, and both small tiers keep their leading.
    const emitted = deriveTypeTierChannels();
    for (const size of ['md', 'lg', 'xl', '2xl', '3xl']) {
      expect(emitted[`--ds-type-tier-${size}-letter-spacing`], size).toBeTruthy();
    }
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']) {
      expect(emitted[`--ds-type-tier-${size}-line-height`], size).toBeTruthy();
    }
  });
});

describe('no authored source reaches for either name', () => {
  it('names neither channel anywhere productive across the scanned repos', () => {
    expect(filesNaming(productiveSources(), RETIRED)).toEqual([]);
  });

  it('scans more than this package alone', () => {
    // The census that justified the retirement covered four repos. If the
    // sibling checkouts are gone the claim above is narrower than it reads, so
    // the breadth is asserted instead of assumed.
    const scanned = productiveSources();
    expect(scanned.length).toBeGreaterThan(1000);
    expect(scanned.some((file) => file.includes('/packages/showroom/src/'))).toBe(true);
  });
});

describe('the route the two small tiers inherit instead is still declared', () => {
  it('paints every modern heading from the governed role', () => {
    const skin = readFileSync(TYPOGRAPHY_SKIN, 'utf8').replace(/\s+/gu, ' ');
    expect(skin).toContain(`letter-spacing: var(${HEADING_ROLE});`);
  });

  it('declares tier tracking only from md up', () => {
    const skin = readFileSync(TYPOGRAPHY_SKIN, 'utf8');
    for (const size of ['md', 'lg', 'xl', '2xl', '3xl']) {
      expect(skin, size).toContain(`var(--ds-type-tier-${size}-letter-spacing`);
    }
    for (const size of ['xs', 'sm']) {
      expect(skin, size).not.toContain(`var(--ds-type-tier-${size}-letter-spacing`);
    }
  });
});

describe('the scan can fail', () => {
  it('reports a planted reader', () => {
    // The scanner is run against its own source, which names both channels in
    // prose. If `filesNaming` were fail-open this would come back empty and
    // every finding above would be vacuous.
    const planted = filesNaming([__filename], RETIRED);
    expect(planted).toHaveLength(1);
    expect(planted[0]).toContain('retired-type-tier-zero-tracking');
  });
});
