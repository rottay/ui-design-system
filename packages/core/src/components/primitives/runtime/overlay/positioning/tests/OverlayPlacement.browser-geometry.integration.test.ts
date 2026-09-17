/**
 * WO-INV-01 -- logical placement, MEASURED IN A REAL BROWSER.
 *
 * PROJECT LABEL. This file runs in the vitest `integration` project, the one
 * the causality suites use, but the geometry it asserts is NOT produced by
 * that project's DOM runner. happy-dom and jsdom do not lay out, do not
 * resolve logical properties and return zero rects, so every number below
 * comes from a real Chromium process driven by `--dump-dom`; the runner only
 * spawns it and reads the result back. No assertion in this file is made
 * against simulated-DOM geometry. The sibling suites that DO measure in the
 * simulated DOM say so themselves: `OverlayPositioning.test.tsx` (`unit`,
 * happy-dom, the measured branch's arithmetic and the alias map) and
 * `Slider.mark-label-direction.test.tsx` (`unit`, happy-dom, the cascade
 * derived by hand from the declared properties).
 *
 * WHAT IT PROVES.
 *   - A popover that asks for the inline-start side (through the deprecated
 *     physical alias `left`, so the alias is exercised end to end) lands on
 *     the physical left of its anchor under LTR and on the physical right
 *     under RTL, with the offset gap on the anchor-facing edge in both.
 *   - The lowering actually reaches paint as `self-inline-start`: the
 *     `self-*` family is the one that resolves against the OVERLAY's own
 *     writing mode, the same mode its logical offset margin resolves in.
 *   - A tooltip that asks for the same side through the same alias mirrors
 *     with it, and does NOT report a collision for having mirrored: its
 *     `data-collision-adjusted` channel compares two logical placements while
 *     `data-placement` carries the physical side its skin selects on.
 *   - The vertical slider readout mirrors about the rail line instead of
 *     keeping a physical side, and the horizontal readout stays centred on
 *     the thumb in both directions.
 *   - A PORTALLED bubble resolves its LOGICAL paint against the `dir` it was
 *     stamped with, not against the tree it landed in: with the app locale
 *     `en` and the anchor inside a `dir="rtl"` wrapper, the bubble is a child
 *     of the LTR portal root, and an aligned placement still lays its shortcut
 *     keys at the inline end and its arrow on the anchor, both physically
 *     mirrored. Restoring `direction: inherit` on the bubble makes it compute
 *     `ltr` from the portal root and turns both readings around.
 *   - An IN-TREE surface (the `anchor-css` branch) does the same in the tree
 *     that DECLARES one direction and PAINTS another: a nested locale island
 *     publishes `dir="rtl"`, a container inside it sets `direction: ltr` in CSS
 *     without declaring `dir`, and the surface is rendered under a trigger that
 *     declares nothing. The engine stamps the island's direction and expresses
 *     every placement in it, so the paint must follow the stamp; restoring
 *     `direction: inherit` on the surface makes it take the container's `ltr`
 *     and lays the copy on the opposite physical side.
 *   - ONE DIRECTION PER REQUEST, in the two trees where the app locale and the
 *     anchor's own context DISAGREE: an anchor inside a bare `dir` wrapper that
 *     contradicts the locale, and a nested locale provider that flips the
 *     context while nothing declares `dir`. Each is measured twice, plain (the
 *     `anchor-css` branch) and under `OverlayPortalBoundary` (the `js` branch),
 *     and both branches must put the bubble on the SAME physical side, report
 *     no collision, name the side they painted, and keep the arrow on the
 *     anchor-facing edge. The uniform scenes above cannot see this: they are
 *     the trees where the two readings happen to agree.
 *
 * HOW IT DRIVES CHROMIUM. It reuses the cascade probe's binary locator and
 * its `--dump-dom` technique, and adds no driver package: the scene bundles
 * with the esbuild binary already in this workspace, measures itself in-page
 * and parks the result on `data-probe-result`.
 *
 * NO SILENT SKIP. If no Chromium binary is installed the test FAILS with the
 * override env var named. A missing browser is "not run", and "not run" must
 * never read as "passed".
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { beforeAll, describe, expect, it } from 'vitest';

import { findChromium } from '@checks/modern-rescue/cascade/probe/browser-analysis/index.mjs';

import type {
  InTreeStampedScene,
  NonUniformScene,
  PlacementProbeResult,
  StampedDirectionScene,
} from './fixtures/logical-placement-scene';

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(HERE, '../../../../../../..');
const SCENE = join(HERE, 'fixtures/logical-placement-scene/index.tsx');
const ESBUILD = join(PACKAGE_ROOT, 'node_modules/.bin/esbuild');
/**
 * The token layer first, then the skins that read it. The arrow assertions
 * measure a real rect, and an arrow whose size and overlap never resolve has
 * no rect to measure -- the `var()` chain would collapse to an invalid
 * declaration and the tip would sit wherever static position left it.
 */
const SKINS = [
  'src/foundation/tokens/css/foundation/themes/default/index.css',
  'src/foundation/tokens/css/presentation/components/tooltip/index.css',
  'src/foundation/tokens/css/runtime/engines/modern/skin/slider/index.css',
  'src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css',
  'src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css',
  'src/foundation/tokens/css/runtime/engines/modern/skin/popconfirm/index.css',
];

/** The gap the Popover contract asks for by default, in px. */
const POPOVER_OFFSET = 10;
/** Sub-pixel tolerance: Chromium lays out in fractional px. */
const TOLERANCE_PX = 1;
/** The arrow straddles the edge by half its own size, plus the overlap token. */
const ARROW_TOLERANCE_PX = 8;

function buildPage(): string {
  const workspace = mkdtempSync(join(tmpdir(), 'ds-logical-placement-'));
  mkdirSync(workspace, { recursive: true });
  const bundle = join(workspace, 'scene.js');
  execFileSync(
    ESBUILD,
    [
      SCENE,
      '--bundle',
      '--format=iife',
      '--jsx=automatic',
      '--loader:.css=text',
      `--alias:@=${join(PACKAGE_ROOT, 'src')}`,
      '--define:process.env.NODE_ENV="production"',
      `--outfile=${bundle}`,
    ],
    { stdio: 'pipe' },
  );
  const styles = SKINS.map(
    (skin) => `<style>${readFileSync(join(PACKAGE_ROOT, skin), 'utf8')}</style>`,
  ).join('\n');
  const page = join(workspace, 'index.html');
  writeFileSync(
    page,
    [
      '<!doctype html><html><head><meta charset="utf-8">',
      '<style>body { margin: 0; }</style>',
      styles,
      '</head><body><div id="root"></div>',
      '<script src="./scene.js"></script>',
      '</body></html>',
    ].join('\n'),
    'utf8',
  );
  return page;
}

function measure(binary: string, page: string, direction: 'ltr' | 'rtl'): PlacementProbeResult {
  const dom = execFileSync(
    binary,
    [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--virtual-time-budget=5000',
      '--dump-dom',
      `file://${page}${direction === 'rtl' ? '#rtl' : ''}`,
    ],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] },
  );
  const match = /data-probe-result="([^"]*)"/.exec(dom);
  if (!match) {
    throw new Error(
      `the scene never reported a measurement under dir=${direction}; the page did not render`,
    );
  }
  const decoded = match[1]!
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  return JSON.parse(decoded) as PlacementProbeResult;
}

const centre = (edges: { left: number; right: number }): number =>
  edges.left + (edges.right - edges.left) / 2;

/**
 * Asserts ONE non-uniform-direction scene: the app locale says one thing and
 * the anchor's own context says the other, so the two positioning branches
 * would each be entitled to a different answer unless one direction governs
 * the request. The anchor's direction is that authority -- it is what the
 * `anchor-css` branch's `self-*` keywords resolve against, and what a
 * portalled panel reproduces for its anchor.
 */
function expectPlacedAgainstAnchorDirection(
  scene: NonUniformScene | null,
  expectedStrategy: 'anchor-css' | 'js',
  options: { arrow?: boolean; stampsPlacement?: boolean } = {},
): void {
  const { arrow = true, stampsPlacement = true } = options;
  expect(scene).not.toBeNull();
  const measured = scene!;
  expect(measured.strategy).toBe(expectedStrategy);
  expect(measured.bubble).not.toBeNull();
  const bubble = measured.bubble!;
  const rtl = measured.anchorDirection === 'rtl';

  // `placement="left"` is the deprecated alias of inline-start, so the painted
  // side is the anchor direction's start edge -- physically right under RTL.
  if (rtl) {
    expect(bubble.left).toBeGreaterThan(measured.anchor.right);
  } else {
    expect(bubble.right).toBeLessThan(measured.anchor.left);
  }

  if (stampsPlacement) {
    // The stamped side NAMES the side that was painted, in both branches.
    expect(bubble.placementAttribute).toBe(rtl ? 'right' : 'left');
    // ... and so does the preferred side, which is the channel that contradicted
    // the paint while the two branches used two different direction authorities.
    expect(bubble.preferredPlacement).toBe(bubble.placementAttribute);
  }
  // Nothing overflowed anything. A mirror is not a collision.
  expect(bubble.collisionAdjusted).toBeNull();

  if (!arrow) return;
  // The arrow sits on the ANCHOR-FACING edge of the bubble, not the far one.
  expect(measured.arrow).not.toBeNull();
  const arrowCentre = centre(measured.arrow!);
  const facing = rtl ? bubble.left : bubble.right;
  const away = rtl ? bubble.right : bubble.left;
  expect(Math.abs(arrowCentre - facing)).toBeLessThanOrEqual(
    Math.abs(arrowCentre - away),
  );
  expect(Math.abs(arrowCentre - facing)).toBeLessThanOrEqual(ARROW_TOLERANCE_PX);
}

describe('logical overlay placement -- real Chromium geometry (NOT the DOM runner)', () => {
  let ltr: PlacementProbeResult;
  let rtl: PlacementProbeResult;

  beforeAll(() => {
    const binary = findChromium();
    if (!binary) {
      throw new Error(
        'no Chromium binary found: this suite measures real layout and cannot be '
          + 'satisfied by a DOM runner. Install one or point CASCADE_PROBE_CHROMIUM at it.',
      );
    }
    if (!existsSync(ESBUILD)) {
      throw new Error(`the esbuild binary is missing at ${ESBUILD}; the scene cannot be bundled`);
    }
    const page = buildPage();
    ltr = measure(binary, page, 'ltr');
    rtl = measure(binary, page, 'rtl');
  }, 120_000);

  it('drives the scene in both reading directions through the i18n authority', () => {
    expect(ltr.dir).toBe('ltr');
    expect(rtl.dir).toBe('rtl');
  });

  it('puts the overlay on the inline-start side of its anchor, mirrored under RTL', () => {
    expect(ltr.popover).not.toBeNull();
    expect(rtl.popover).not.toBeNull();

    // LTR: inline-start is the physical left. The overlay ends before the
    // anchor begins, and the gap it leaves is the requested offset.
    expect(ltr.popover!.right).toBeLessThan(ltr.anchor.left);
    expect(Math.abs(ltr.anchor.left - ltr.popover!.right - POPOVER_OFFSET))
      .toBeLessThanOrEqual(TOLERANCE_PX);

    // RTL: the same request lands on the physical right, gap still
    // anchor-facing. This is the pair that discriminates direction: neither
    // inequality can hold in both directions.
    expect(rtl.popover!.left).toBeGreaterThan(rtl.anchor.right);
    expect(Math.abs(rtl.popover!.left - rtl.anchor.right - POPOVER_OFFSET))
      .toBeLessThanOrEqual(TOLERANCE_PX);
  });

  it('reaches paint through the self-* position-area family', () => {
    // The plain logical keywords resolve against the CONTAINING BLOCK -- for a
    // top-layer overlay, the root element -- while the offset margin resolves
    // against the overlay's own writing mode. `self-*` is the family where
    // both agree, which is why the gap above stays anchor-facing.
    expect(ltr.popover!.positionArea).toBe('self-inline-start');
    expect(rtl.popover!.positionArea).toBe('self-inline-start');

    // The skin channel stays PHYSICAL on purpose (the Modern skins key on
    // `[data-placement^='left']`), and it reports the side the placement
    // RESOLVED to, which is why it differs between the two runs.
    expect(ltr.popover!.placementAttribute).toBe('left');
    expect(rtl.popover!.placementAttribute).toBe('right');
  });

  it('mirrors the tooltip with the same request, and calls it no collision', () => {
    expect(ltr.tooltip?.bubble).toBeTruthy();
    expect(rtl.tooltip?.bubble).toBeTruthy();

    // Same discriminating pair as the popover: the bubble sits before the
    // anchor under LTR and after it under RTL, gap anchor-facing in both.
    expect(ltr.tooltip!.bubble!.right).toBeLessThan(ltr.tooltip!.anchor.left);
    expect(rtl.tooltip!.bubble!.left).toBeGreaterThan(rtl.tooltip!.anchor.right);
    expect(ltr.tooltip!.bubble!.positionArea).toBe('self-inline-start');
    expect(rtl.tooltip!.bubble!.positionArea).toBe('self-inline-start');

    // The skin channel is physical and reports the RESOLVED edge.
    expect(ltr.tooltip!.bubble!.placementAttribute).toBe('left');
    expect(rtl.tooltip!.bubble!.placementAttribute).toBe('right');

    // Nothing overflowed anything: the mirror alone must never raise the
    // collision flag. This is the assertion the physical comparison failed.
    expect(ltr.tooltip!.bubble!.collisionAdjusted).toBeNull();
    expect(rtl.tooltip!.bubble!.collisionAdjusted).toBeNull();
  });

  it('mirrors the vertical slider readout about the rail line', () => {
    expect(ltr.verticalSlider?.tooltip).toBeTruthy();
    expect(rtl.verticalSlider?.tooltip).toBeTruthy();
    expect(ltr.verticalSlider!.tooltip!.placement).toBe('inline-end');
    expect(rtl.verticalSlider!.tooltip!.placement).toBe('inline-end');

    // Distance from the slider root's own inline centre, signed away from the
    // reading start. Equal magnitudes with opposite signs is the mirror.
    const ltrOffset = centre(ltr.verticalSlider!.tooltip!) - centre(ltr.verticalSlider!.root);
    const rtlOffset = centre(rtl.verticalSlider!.tooltip!) - centre(rtl.verticalSlider!.root);
    expect(Math.abs(ltrOffset + rtlOffset)).toBeLessThanOrEqual(TOLERANCE_PX);

    // Counter-factual: a symmetric no-op would also satisfy the line above.
    expect(Math.abs(ltrOffset)).toBeGreaterThan(TOLERANCE_PX);
    expect(ltrOffset).toBeGreaterThan(0);
    expect(rtlOffset).toBeLessThan(0);
  });

  // ONE DIRECTION PER REQUEST. Everything above runs in a UNIFORM tree, where
  // the app locale and the anchor's own context agree and the two branches
  // cannot be told apart. These two scenes take them apart.
  it('places both branches against the anchor direction when a bare dir wrapper contradicts the locale', () => {
    for (const run of [ltr, rtl]) {
      // The wrapper declares the direction the locale is not, so the scene is
      // non-uniform in both navigations.
      expect(run.wrapperDir.plain?.anchorDirection).toBe(run.dir === 'rtl' ? 'ltr' : 'rtl');
      expect(run.wrapperDir.portal?.anchorDirection).toBe(run.wrapperDir.plain?.anchorDirection);

      expectPlacedAgainstAnchorDirection(run.wrapperDir.plain, 'anchor-css');
      expectPlacedAgainstAnchorDirection(run.wrapperDir.portal, 'js');

      // The discriminating assertion: one request, one physical side, both
      // branches. Before the request carried its direction, `anchor-css`
      // followed the wrapper and `js` followed the locale, so these two
      // numbers straddled the anchor from opposite sides.
      expect(run.wrapperDir.plain!.bubble!.placementAttribute)
        .toBe(run.wrapperDir.portal!.bubble!.placementAttribute);
      expect(Math.abs(run.wrapperDir.plain!.bubble!.left - run.wrapperDir.portal!.bubble!.left))
        .toBeLessThanOrEqual(TOLERANCE_PX);
    }
  });

  it('places both branches against the anchor direction when a nested locale provider flips the context', () => {
    for (const run of [ltr, rtl]) {
      // Nothing in the anchor's ancestry declares `dir` here: the nested
      // provider moves the CONTEXT direction only, which is the other way the
      // two readings come apart.
      expect(run.nestedLocale.plain?.anchorDirection).toBe(run.dir);
      expect(run.nestedLocale.portal?.anchorDirection).toBe(run.dir);

      expectPlacedAgainstAnchorDirection(run.nestedLocale.plain, 'anchor-css');
      expectPlacedAgainstAnchorDirection(run.nestedLocale.portal, 'js');

      expect(run.nestedLocale.plain!.bubble!.placementAttribute)
        .toBe(run.nestedLocale.portal!.bubble!.placementAttribute);
      expect(Math.abs(run.nestedLocale.plain!.bubble!.left - run.nestedLocale.portal!.bubble!.left))
        .toBeLessThanOrEqual(TOLERANCE_PX);
    }
  });

  it('places both Popconfirm branches against the anchor direction under a contradicting dir wrapper', () => {
    for (const run of [ltr, rtl]) {
      // Same non-uniform tree as the tooltip scene above: the wrapper declares
      // the direction the app locale is not.
      expect(run.popconfirmDir.plain?.anchorDirection).toBe(run.dir === 'rtl' ? 'ltr' : 'rtl');
      expect(run.popconfirmDir.portal?.anchorDirection).toBe(
        run.popconfirmDir.plain?.anchorDirection,
      );

      // Popconfirm carries no arrow and stamps no placement channel; what it
      // owes is the physical side and an honest collision flag.
      expectPlacedAgainstAnchorDirection(run.popconfirmDir.plain, 'anchor-css', {
        arrow: false,
        stampsPlacement: false,
      });
      expectPlacedAgainstAnchorDirection(run.popconfirmDir.portal, 'js', {
        arrow: false,
        stampsPlacement: false,
      });

      // The discriminating assertion: one request, one physical side, both
      // branches. Before the request carried its direction, `anchor-css`
      // followed the wrapper and `js` followed the locale, and these two panels
      // straddled the anchor from opposite sides.
      expect(Math.abs(run.popconfirmDir.plain!.bubble!.left - run.popconfirmDir.portal!.bubble!.left))
        .toBeLessThanOrEqual(TOLERANCE_PX);
    }
  });

  // The stamped `dir` is the ONLY direction a portalled bubble can resolve its
  // logical paint against: it is not in its anchor's tree any more, and the
  // portal root it landed in speaks the app locale. Measured in the `ltr`
  // navigation, which is where the two disagree (locale `en`, anchor `rtl`).
  it('resolves a portalled bubble\'s logical paint against the dir it stamps', () => {
    const scene: StampedDirectionScene | null = ltr.stampedDirection;
    expect(scene).not.toBeNull();
    const measured = scene!;

    // The tree really is non-uniform, and the bubble really did leave it.
    expect(ltr.dir).toBe('ltr');
    expect(measured.strategy).toBe('js');
    expect(measured.anchorDirection).toBe('rtl');
    expect(measured.portalRootDirection).toBe('ltr');

    // The engine stamps the anchor's direction, and paint follows the stamp.
    // A skin declaration that outranks the UA `[dir]` rule breaks this line.
    expect(measured.stampedDir).toBe('rtl');
    expect(measured.bubbleDirection).toBe('rtl');

    // The shortcut row lays its keys at the bubble's INLINE END, which under
    // the stamped direction is the physical LEFT: they end before the copy
    // begins. Inheriting `ltr` from the portal root puts them on the right.
    expect(measured.content).not.toBeNull();
    expect(measured.keys).not.toBeNull();
    expect(measured.keys!.right).toBeLessThanOrEqual(measured.content!.left + TOLERANCE_PX);

    // The aligned placement's arrow rules are inline-axis rules (the `-end`
    // edge offset and the tracked clamp are `inset-inline-*`), so they resolve
    // against the same stamp: the tip stays on the anchor's centre. Resolved
    // against `ltr` it mirrors to the far side of the bubble instead.
    expect(measured.arrowTracked).toBe('true');
    expect(measured.arrow).not.toBeNull();
    expect(measured.bubble).not.toBeNull();
    expect(Math.abs(centre(measured.arrow!) - centre(measured.anchor)))
      .toBeLessThanOrEqual(ARROW_TOLERANCE_PX);
  });

  // The same law on the OTHER branch: an `anchor-css` surface stays in its
  // anchor's tree, so it has an ancestry to inherit from -- and that ancestry
  // is not the authority the engine used. Measured in the `ltr` navigation,
  // where the island declares `rtl` and the container below it paints `ltr`.
  it('resolves an in-tree surface\'s logical paint against the dir it stamps', () => {
    const scene: InTreeStampedScene | null = ltr.inTreeStamped;
    expect(scene).not.toBeNull();
    const measured = scene!;

    // The branch is the in-tree one, and the tree really does disagree with
    // itself: the nearest declared `dir` is not what the anchor's box paints.
    expect(ltr.dir).toBe('ltr');
    expect(measured.strategy).toBe('anchor-css');
    expect(measured.declaredDir).toBe('rtl');
    expect(measured.anchorDirection).toBe('ltr');

    // The engine stamps the direction it resolved, and paint follows the stamp.
    // A skin declaration that outranks the UA `[dir]` rule breaks this line.
    expect(measured.stampedDir).toBe('rtl');
    expect(measured.surfaceDirection).toBe('rtl');

    // `text-align: start` under the stamp is the physical RIGHT: the copy
    // begins at the body's end edge. Inheriting the container's `ltr` puts it
    // at the opposite edge, while the placement channels still read `rtl`.
    expect(measured.body).not.toBeNull();
    expect(measured.ink).not.toBeNull();
    expect(Math.abs(measured.ink!.right - measured.body!.right))
      .toBeLessThanOrEqual(TOLERANCE_PX);
    expect(measured.ink!.left).toBeGreaterThan(centre(measured.body!));
  });

  it('keeps the horizontal slider readout centred on the thumb in both directions', () => {
    expect(ltr.horizontalSlider?.tooltip).toBeTruthy();
    expect(rtl.horizontalSlider?.tooltip).toBeTruthy();

    // Value 50 of 0..100: the thumb point is the track's inline centre, and
    // the readout centres on it whichever way the track is read.
    expect(Math.abs(centre(ltr.horizontalSlider!.tooltip!) - centre(ltr.horizontalSlider!.input)))
      .toBeLessThanOrEqual(TOLERANCE_PX);
    expect(Math.abs(centre(rtl.horizontalSlider!.tooltip!) - centre(rtl.horizontalSlider!.input)))
      .toBeLessThanOrEqual(TOLERANCE_PX);
  });
});
