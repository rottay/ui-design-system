import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// K1 lane interactive-state evidence (M02 sighted evidence, R0 infrastructure).
//
// A bounded matrix: each lane's FLAGSHIP controls only, on one fixed cell
// (source=bithire-static, locale=en, density=comfortable, state=rest):
//
//   lane-a  la-tag dismissible (its close button — the dismiss affordance),
//           la-link (first NavLink)
//   lane-b  lb-input (the inner <input> control itself), lb-checkbox-single
//           (the certified single — the Group options-renderer paints
//           data-part="option-box", not box), lb-switch
//   lane-c  lc-alert first dismiss (data-part="action"), lc-result action
//           (the extra Button)
//
// Per control, six deterministic cells (computed values + settle-polls, never
// pixel baselines — this spec takes nothing from snapshotPathTemplate):
//
//   1. hover          page.hover() → settle-poll the sampled part's computed
//                     channels until TWO consecutive samples agree (3s cap) →
//                     at least one paint channel must differ from rest.
//   2. focus-visible  real Tab walk from an injected sentinel (never
//                     locator.focus(): the skins key the ring on the platform's
//                     own :focus-visible, and only a trusted keyboard focus
//                     raises that) → the ring must grow an outline or a
//                     box-shadow vs rest. For the visually-clipped native
//                     inputs (checkbox/switch) the ring is read on the painted
//                     sibling part (box/track), where the skin draws it via
//                     `input:focus-visible ~ [data-part=...]`.
//   3. pressed        mouse.down() (no up) → a paint difference on the sampled
//                     part (and data-state~='pressed' for behavior-layer
//                     controls) → screenshot → mouse.up().
//   4. forced-colors  emulateMedia({ forcedColors: 'active' }) → the control's
//                     essential affordance must survive: a border or outline
//                     frame (or, for the link, its underline + system ink —
//                     link.css deliberately answers forced colors with LinkText
//                     + underline, not a frame), with forced-color-adjust not
//                     'none'; computed color and forced-color-adjust are read
//                     and logged. Reset to 'none'.
//   5. reduced-motion emulateMedia({ reducedMotion: 'reduce' }) → every
//                     transition-duration / animation-duration on the sampled
//                     part must collapse to 0s/0.01ms (the motion policy:
//                     personality.css's global 0.01ms clamp plus the skins' own
//                     transition:none rules). Reset to 'no-preference'.
//   6. coarse floor   (lane-b controls + lc-result action only) a real mobile
//                     chromium context — the density-authority-matrix.spec.ts
//                     group-H pattern, because CDP media emulation does not
//                     flip (pointer: coarse) in this stack — asserting the
//                     control's bounding height meets the 44px touch floor.
//
// playwright.visual.config.ts runs with reducedMotion:'reduce' by default, so
// each test first pins no-preference/none and every media cell resets after
// itself — cell order never leaks into the next cell's baseline.
//
// Screenshots (review artifacts, NOT baselines) land in
// test-artifacts/rottay-design-platform/K0-K1/captures/states/ as
// <lane>-<control>-<state>.png for the hover, focus, pressed and forced-colors
// cells.
//
// NOT-COMPUTABLE STATES (flagged, never faked): a pressed posture is only
// asserted where the component actually paints one. The la-tag close button,
// the lb-input root and the lc-alert dismiss button have NO :active rule in
// their modern skins and their engines stamp no data-state — mouse.down()
// changes nothing computable on them. Those cells are recorded in PRESSED_GAPS
// and printed at the end of the run instead of asserting a fake diff.
// ---------------------------------------------------------------------------

type LaneId = 'a' | 'b' | 'c';

interface ControlDef {
  /** Artifact/log name: <lane>-<name>-<state>.png. */
  readonly name: string;
  /** Visible control root: hover target, mouse.down target, screenshot subject. */
  readonly control: string;
  /** The Tab-walk landing target — document.activeElement must match this. */
  readonly focusTarget: string;
  /** The element whose computed paint is settle-polled, per state. */
  readonly samples: {
    readonly hover: string;
    readonly focus: string;
    readonly pressed: string;
    readonly frame: string;
    readonly motion: string;
  };
  /** 'paint' asserts a pressed difference; 'none' flags the gap (see header). */
  readonly pressed: 'paint' | 'none';
  /** Why pressed is 'none' — recorded for the coordinator. */
  readonly pressedGap?: string;
  /** Forced-colors essential affordance: a frame, or the link's underline+ink. */
  readonly affordance: 'frame' | 'link';
  /** Also assert data-state~='pressed' while held (behavior-layer controls). */
  readonly expectPressedDataState: boolean;
  /** Include in the coarse-pointer 44px-floor test. */
  readonly coarseFloor: boolean;
}

interface LaneDef {
  readonly id: LaneId;
  readonly route: string;
  readonly witness: string;
  readonly rootTestId: string;
  readonly controls: readonly ControlDef[];
}

const LANES: readonly LaneDef[] = [
  {
    id: 'a',
    route: '/probe/k1-lane-a',
    witness: 'la-avatar',
    rootTestId: 'la-root',
    controls: [
      {
        name: 'tag',
        // The dismissible Tag's interactive affordance is its close button
        // (Tag modern engine: data-part="close" on the first, closable tag).
        control: '[data-testid="la-tag"] [data-part="close"]',
        focusTarget: '[data-testid="la-tag"] [data-part="close"]',
        samples: {
          hover: '[data-testid="la-tag"] [data-part="close"]',
          focus: '[data-testid="la-tag"] [data-part="close"]',
          pressed: '[data-testid="la-tag"] [data-part="close"]',
          frame: '[data-testid="la-tag"] [data-part="close"]',
          motion: '[data-testid="la-tag"] [data-part="close"]',
        },
        pressed: 'none',
        pressedGap:
          'lane-a/tag: tag.css defines :hover and :focus-visible for [data-part="close"] but no ' +
          ':active rule, and the Tag engine stamps no data-state — a press changes nothing computable.',
        affordance: 'frame',
        expectPressedDataState: false,
        coarseFloor: false,
      },
      {
        name: 'link',
        control: '[data-testid="la-link"] a.rottay-link-shell',
        focusTarget: '[data-testid="la-link"] a.rottay-link-shell',
        samples: {
          hover: '[data-testid="la-link"] a.rottay-link-shell',
          focus: '[data-testid="la-link"] a.rottay-link-shell',
          pressed: '[data-testid="la-link"] a.rottay-link-shell',
          frame: '[data-testid="la-link"] a.rottay-link-shell',
          motion: '[data-testid="la-link"] a.rottay-link-shell',
        },
        pressed: 'paint', // link.css :active recolors the ink
        affordance: 'link',
        expectPressedDataState: false,
        coarseFloor: false,
      },
    ],
  },
  {
    id: 'b',
    route: '/probe/k1-lane-b',
    witness: 'lb-input',
    rootTestId: 'lb-root',
    controls: [
      {
        name: 'input',
        // data-testid="lb-input" lands on the <input> itself (plain branch: the
        // shell IS the input), so the control is the inner control directly.
        control: '[data-testid="lb-input"]',
        focusTarget: '[data-testid="lb-input"]',
        samples: {
          hover: '[data-testid="lb-input"]',
          focus: '[data-testid="lb-input"]',
          pressed: '[data-testid="lb-input"]',
          frame: '[data-testid="lb-input"]',
          motion: '[data-testid="lb-input"]',
        },
        pressed: 'none',
        pressedGap:
          'lane-b/input: the modern Input engine wires onPointerEnter/Leave/Focus/Blur but not ' +
          'onPointerDown, so data-state never carries "pressed", and input.css has no :active rule ' +
          'for the root — holding the pointer only paints the focus posture, which is focus evidence.',
        affordance: 'frame',
        expectPressedDataState: false,
        coarseFloor: true,
      },
      {
        name: 'checkbox',
        // The certified single specimen (lb-checkbox-single): the canonical
        // engine paints data-part="box" — the Group options-renderer paints
        // data-part="option-box" instead (known Lane-B debt), so the matrix
        // samples the single. Hover/press/focus paint lives on the box; the
        // native input is the clipped focus target.
        control: '[data-testid="lb-checkbox-single"] .ds-checkbox',
        focusTarget: '[data-testid="lb-checkbox-single"] input[type="checkbox"]',
        samples: {
          hover: '[data-testid="lb-checkbox-single"] [data-part="box"]',
          focus: '[data-testid="lb-checkbox-single"] [data-part="box"]',
          pressed: '[data-testid="lb-checkbox-single"] [data-part="box"]',
          frame: '[data-testid="lb-checkbox-single"] [data-part="box"]',
          motion: '[data-testid="lb-checkbox-single"] [data-part="box"]',
        },
        pressed: 'paint', // checkbox.css: label:active dips the box transform
        affordance: 'frame',
        expectPressedDataState: false,
        coarseFloor: true,
      },
      {
        name: 'switch',
        control: '[data-testid="lb-switch"] .ds-switch',
        focusTarget: '[data-testid="lb-switch"] input[role="switch"]',
        samples: {
          hover: '[data-testid="lb-switch"] [data-part="track"]',
          focus: '[data-testid="lb-switch"] [data-part="track"]',
          pressed: '[data-testid="lb-switch"] [data-part="thumb"]',
          frame: '[data-testid="lb-switch"] [data-part="track"]',
          motion: '[data-testid="lb-switch"] [data-part="track"]',
        },
        pressed: 'paint', // switch.css: label:active dips the thumb transform
        affordance: 'frame',
        expectPressedDataState: false,
        coarseFloor: true,
      },
    ],
  },
  {
    id: 'c',
    route: '/probe/k1-lane-c',
    witness: 'lc-alert',
    rootTestId: 'lc-root',
    controls: [
      {
        name: 'alert',
        // The first alert's dismiss button (Alert modern engine: data-part="action").
        control: '[data-testid="lc-alert"] [data-part="action"]',
        focusTarget: '[data-testid="lc-alert"] [data-part="action"]',
        samples: {
          hover: '[data-testid="lc-alert"] [data-part="action"]',
          focus: '[data-testid="lc-alert"] [data-part="action"]',
          pressed: '[data-testid="lc-alert"] [data-part="action"]',
          frame: '[data-testid="lc-alert"] [data-part="action"]',
          motion: '[data-testid="lc-alert"] [data-part="action"]',
        },
        pressed: 'none',
        pressedGap:
          'lane-c/alert: alert.css defines :hover and :focus-visible for [data-part="action"] but ' +
          'no :active rule, and the Alert engine stamps no data-state — a press changes nothing computable.',
        affordance: 'frame',
        expectPressedDataState: false,
        coarseFloor: false,
      },
      {
        name: 'result',
        // The Result extra Button (native <button>, behavior-layer data-state).
        control: '[data-testid="lc-result"] [data-part="extra"] button',
        focusTarget: '[data-testid="lc-result"] [data-part="extra"] button',
        samples: {
          hover: '[data-testid="lc-result"] [data-part="extra"] button',
          focus: '[data-testid="lc-result"] [data-part="extra"] button',
          pressed: '[data-testid="lc-result"] [data-part="extra"] button',
          frame: '[data-testid="lc-result"] [data-part="extra"] button',
          motion: '[data-testid="lc-result"] [data-part="extra"] button',
        },
        pressed: 'paint', // button.css [data-state~="pressed"] transform/filter + variant repaint
        affordance: 'frame',
        expectPressedDataState: true,
        coarseFloor: true,
      },
    ],
  },
];

/**
 * The paint channels a state can speak through (the states.spec.ts channel
 * vocabulary, plus the underline trio a link expresses hover through).
 * `data-state` is sampled alongside but excluded from paint comparisons — the
 * paintOf rationale from states.spec.ts: an invariant about paint must be
 * asked about paint, and data-state flips painted or not.
 */
const CHANNELS = [
  'backgroundColor',
  'color',
  'borderColor',
  'borderTopWidth',
  'boxShadow',
  'outlineStyle',
  'outlineWidth',
  'outlineColor',
  'transform',
  'opacity',
  'filter',
  'textDecorationLine',
  'textUnderlineOffset',
  'textDecorationThickness',
] as const;

type Sample = Record<string, string>;

function repoRoot(): string {
  let dir = test.info().project.testDir;
  while (!existsSync(join(dir, 'pnpm-workspace.yaml'))) {
    const parent = dirname(dir);
    if (parent === dir) throw new Error('pnpm-workspace.yaml not found above testDir');
    dir = parent;
  }
  return dir;
}

const artifactDir = (): string =>
  join(repoRoot(), 'test-artifacts', 'rottay-design-platform', 'K0-K1', 'captures', 'states');

const artifactPath = (lane: LaneId, control: string, state: string): string =>
  join(artifactDir(), `lane-${lane}-${control}-${state}.png`);

function cellUrl(lane: LaneDef): string {
  return `${lane.route}?source=bithire-static&locale=en&density=comfortable&state=rest`;
}

/** The deterministic render witness: lane testid + compiled theme + fonts. */
async function gotoCell(page: Page, lane: LaneDef): Promise<void> {
  await page.goto(cellUrl(lane), { waitUntil: 'networkidle' });
  await page.getByTestId(lane.witness).waitFor({ timeout: 30_000 });
  await page.waitForFunction(
    () =>
      window
        .getComputedStyle(document.documentElement)
        .getPropertyValue('--ds-color-primary')
        .trim().length > 0,
    undefined,
    { timeout: 20_000 },
  );
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
}

async function sampleOnce(page: Page, selector: string): Promise<Sample> {
  return page
    .locator(selector)
    .first()
    .evaluate((el, channels) => {
      const computed = getComputedStyle(el);
      const cell: Record<string, string> = {};
      for (const channel of channels) {
        cell[channel] = (computed as unknown as Record<string, string>)[channel] ?? '';
      }
      cell['data-state'] = el.getAttribute('data-state') ?? '';
      return cell;
    }, CHANNELS as unknown as string[]);
}

/**
 * Transition-aware settled read: sample the computed channels until TWO
 * consecutive samples agree (80ms apart, 3s cap). "Two consecutive agree" is
 * what "the animation finished" means — sampling on a fixed delay either
 * catches a transition mid-flight or forces a tolerance wide enough to hide a
 * regression. Sampling `data-state` alongside the paint keeps the poll from
 * settling early while the behavior layer's attribute is still catching up
 * with the pointer.
 */
async function readSettled(page: Page, selector: string): Promise<Sample> {
  let previous = JSON.stringify(await sampleOnce(page, selector));
  const deadline = Date.now() + 3_000;
  while (Date.now() < deadline) {
    await page.waitForTimeout(80);
    const current = await sampleOnce(page, selector);
    const serialized = JSON.stringify(current);
    if (serialized === previous) return current;
    previous = serialized;
  }
  throw new Error(`${selector} never settled: still animating after 3s`);
}

/** Per-channel paint differences (data-state excluded) for assertion messages. */
function paintDiff(rest: Sample, current: Sample): string[] {
  const diffs: string[] = [];
  for (const channel of CHANNELS) {
    if (rest[channel] !== current[channel]) {
      diffs.push(`${channel}: ${rest[channel]} -> ${current[channel]}`);
    }
  }
  return diffs;
}

/** Parks the pointer off every control so no subject is left hovered. */
async function releasePointer(page: Page): Promise<void> {
  await page.mouse.move(2, 2);
}

async function blurEverything(page: Page): Promise<void> {
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
}

// ---------------------------------------------------------------------------
// Keyboard focus-walk (same sentinel contract as the axe spec).
// ---------------------------------------------------------------------------

const SENTINEL_ID = 'k1-states-sentinel';

async function injectSentinel(page: Page, lane: LaneDef): Promise<void> {
  await page.evaluate(
    ({ sentinelId, rootTestId }) => {
      document.getElementById(sentinelId)?.remove();
      const root = document.querySelector(`[data-testid="${rootTestId}"]`);
      if (!root?.parentElement) throw new Error(`lane root is missing: ${rootTestId}`);
      const sentinel = document.createElement('button');
      sentinel.id = sentinelId;
      sentinel.type = 'button';
      sentinel.textContent = 'keyboard sentinel';
      root.parentElement.insertBefore(sentinel, root);
    },
    { sentinelId: SENTINEL_ID, rootTestId: lane.rootTestId },
  );
}

async function tabUntil(page: Page, selector: string, maxTabs = 24): Promise<void> {
  await page.locator(`#${SENTINEL_ID}`).focus();
  const walk: string[] = [];
  for (let step = 0; step < maxTabs; step += 1) {
    await page.keyboard.press('Tab');
    const landed = await page.evaluate(
      (sel) => document.activeElement instanceof Element && document.activeElement.matches(sel),
      selector,
    );
    if (landed) return;
    walk.push(
      await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return '<body>';
        const part = el.getAttribute('data-part');
        return `${el.tagName.toLowerCase()}${part ? `[data-part="${part}"]` : ''}`;
      }),
    );
  }
  throw new Error(`Tab never reached ${selector} after ${maxTabs} presses. Walk: ${walk.join(' → ')}`);
}

async function expectActiveElement(page: Page, selector: string): Promise<void> {
  const landed = await page.evaluate(
    (sel) => document.activeElement instanceof Element && document.activeElement.matches(sel),
    selector,
  );
  expect(landed, `document.activeElement is not ${selector}`).toBe(true);
}

// ---------------------------------------------------------------------------
// State-cell readers.
// ---------------------------------------------------------------------------

interface ForcedColorsRead {
  borderTopWidth: string;
  borderTopStyle: string;
  outlineWidth: string;
  outlineStyle: string;
  color: string;
  forcedColorAdjust: string;
  textDecorationLine: string;
}

async function readForcedColors(page: Page, selector: string): Promise<ForcedColorsRead> {
  return page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const computed = getComputedStyle(el);
      return {
        borderTopWidth: computed.borderTopWidth,
        borderTopStyle: computed.borderTopStyle,
        outlineWidth: computed.outlineWidth,
        outlineStyle: computed.outlineStyle,
        color: computed.color,
        forcedColorAdjust: computed.forcedColorAdjust,
        textDecorationLine: computed.textDecorationLine,
      };
    });
}

function hasFrame(read: ForcedColorsRead): boolean {
  const border =
    Number.parseFloat(read.borderTopWidth) > 0 && read.borderTopStyle !== 'none';
  const outline =
    Number.parseFloat(read.outlineWidth) > 0 && read.outlineStyle !== 'none';
  return border || outline;
}

interface MotionRead {
  transitionDuration: string;
  animationDuration: string;
}

async function readMotion(page: Page, selector: string): Promise<MotionRead> {
  return page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const computed = getComputedStyle(el);
      return {
        transitionDuration: computed.transitionDuration,
        animationDuration: computed.animationDuration,
      };
    });
}

/**
 * The governed reduced-motion floor is 0.01ms (OLA-3): motion must collapse to
 * it, not to a literal 0. Browsers serialize that floor as `1e-05s`, so the
 * check is threshold-based — any duration at or under the floor (plus a tiny
 * epsilon) counts as collapsed; anything above it is real motion leaking into
 * a reduced-motion context.
 */
const COLLAPSED_FLOOR_MS = 0.011;

function durationMs(entry: string): number {
  const value = Number.parseFloat(entry);
  if (Number.isNaN(value)) return Number.POSITIVE_INFINITY;
  if (entry.endsWith('ms')) return value;
  if (entry.endsWith('s')) return value * 1000;
  return Number.POSITIVE_INFINITY;
}

function expectDurationsCollapsed(read: MotionRead, label: string): void {
  const durations = [...read.transitionDuration.split(','), ...read.animationDuration.split(',')].map(
    (entry) => entry.trim(),
  );
  for (const duration of durations) {
    expect(
      durationMs(duration) <= COLLAPSED_FLOOR_MS,
      `${label}: motion did not collapse under prefers-reduced-motion ` +
        `(transition-duration ${read.transitionDuration}, animation-duration ${read.animationDuration})`,
    ).toBe(true);
  }
}

// ---------------------------------------------------------------------------
// The matrix.
// ---------------------------------------------------------------------------

/** Pressed postures that are NOT computable, printed at the end of the run. */
const PRESSED_GAPS: string[] = [];

for (const lane of LANES) {
  test(`lane-${lane.id}: flagship interactive states`, async ({ page }) => {
    test.setTimeout(180_000);
    mkdirSync(artifactDir(), { recursive: true });
    // The visual config defaults to reducedMotion:'reduce'; the interactive
    // cells need the real transition policy, and each media cell resets after
    // itself.
    await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'none' });
    await gotoCell(page, lane);
    await injectSentinel(page, lane);

    for (const control of lane.controls) {
      const label = `lane-${lane.id}/${control.name}`;
      const subject = page.locator(control.control).first();

      // ---- rest baseline ---------------------------------------------------
      await releasePointer(page);
      await blurEverything(page);
      const restHover = await readSettled(page, control.samples.hover);
      const restFocus = await readSettled(page, control.samples.focus);
      const restPressed = await readSettled(page, control.samples.pressed);

      // ---- 1. hover ----------------------------------------------------------
      await test.step(`${label}: hover repaints at least one channel`, async () => {
        await blurEverything(page);
        await subject.hover();
        const hovered = await readSettled(page, control.samples.hover);
        const diffs = paintDiff(restHover, hovered);
        expect(
          diffs.length,
          `${label}: hover changed nothing a user can see on ${control.samples.hover}`,
        ).toBeGreaterThan(0);
        console.log(`${label} hover paint diff:\n  ${diffs.join('\n  ')}`);
        await subject.screenshot({ path: artifactPath(lane.id, control.name, 'hover') });
      });

      // ---- 2. focus-visible --------------------------------------------------
      await test.step(`${label}: keyboard focus paints a visible indicator`, async () => {
        await releasePointer(page);
        await blurEverything(page);
        await tabUntil(page, control.focusTarget);
        await expectActiveElement(page, control.focusTarget);
        const focused = await readSettled(page, control.samples.focus);
        const outlineVisible = (s: Sample): boolean =>
          s.outlineStyle !== 'none' && Number.parseFloat(s.outlineWidth) > 0;
        const grewOutline = outlineVisible(focused) && !outlineVisible(restFocus);
        const grewShadow = focused.boxShadow !== 'none' && focused.boxShadow !== restFocus.boxShadow;
        expect(
          grewOutline || grewShadow,
          `${label}: keyboard focus paints nothing on ${control.samples.focus} ` +
            `(outline ${focused.outlineWidth} ${focused.outlineStyle}, box-shadow ${focused.boxShadow})`,
        ).toBe(true);
        await subject.screenshot({ path: artifactPath(lane.id, control.name, 'focus') });
      });

      // ---- 3. pressed --------------------------------------------------------
      if (control.pressed === 'none') {
        PRESSED_GAPS.push(control.pressedGap ?? `${label}: pressed posture not computable`);
        console.log(`${label}: pressed state NOT computable — flagged, not faked. ${control.pressedGap ?? ''}`);
      } else {
        await test.step(`${label}: press repaints the control while held`, async () => {
          await releasePointer(page);
          await blurEverything(page);
          await subject.hover();
          await page.mouse.down();
          try {
            const pressed = await readSettled(page, control.samples.pressed);
            if (control.expectPressedDataState) {
              expect(
                pressed['data-state'],
                `${label}: behavior layer did not stamp data-state~='pressed'`,
              ).toContain('pressed');
            }
            const diffs = paintDiff(restPressed, pressed);
            expect(
              diffs.length,
              `${label}: a held press changed no paint channel on ${control.samples.pressed}`,
            ).toBeGreaterThan(0);
            console.log(`${label} pressed paint diff:\n  ${diffs.join('\n  ')}`);
            await subject.screenshot({ path: artifactPath(lane.id, control.name, 'pressed') });
          } finally {
            await page.mouse.up();
            await releasePointer(page);
          }
        });
      }

      // ---- 4. forced-colors ---------------------------------------------------
      await test.step(`${label}: forced-colors keeps the essential affordance`, async () => {
        await blurEverything(page);
        await page.emulateMedia({ forcedColors: 'active' });
        try {
          await page.waitForTimeout(100);
          const read = await readForcedColors(page, control.samples.frame);
          console.log(
            `${label} forced-colors read: color=${read.color}, forced-color-adjust=${read.forcedColorAdjust}, ` +
              `border=${read.borderTopWidth} ${read.borderTopStyle}, outline=${read.outlineWidth} ${read.outlineStyle}, ` +
              `text-decoration=${read.textDecorationLine}`,
          );
          expect(read.forcedColorAdjust, `${label}: forced-color-adjust opted out`).not.toBe('none');
          expect(read.color.length, `${label}: text color did not resolve under forced colors`).toBeGreaterThan(0);
          if (control.affordance === 'link') {
            // link.css answers forced colors with LinkText + underline, never a
            // frame — the underline IS the essential affordance of a link.
            expect(
              read.textDecorationLine.includes('underline'),
              `${label}: the link lost its underline under forced colors`,
            ).toBe(true);
          } else {
            expect(
              hasFrame(read),
              `${label}: no border or outline survives forced colors on ${control.samples.frame}`,
            ).toBe(true);
          }
          await subject.screenshot({ path: artifactPath(lane.id, control.name, 'forced-colors') });
        } finally {
          await page.emulateMedia({ forcedColors: 'none' });
        }
      });

      // ---- 5. reduced-motion ---------------------------------------------------
      await test.step(`${label}: reduced-motion collapses transition/animation durations`, async () => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        try {
          await page.waitForTimeout(100);
          const read = await readMotion(page, control.samples.motion);
          expectDurationsCollapsed(read, label);
        } finally {
          await page.emulateMedia({ reducedMotion: 'no-preference' });
        }
      });
    }
  });
}

// ---------------------------------------------------------------------------
// 6. coarse-pointer 44px floor (lane-b controls + the lane-c result action).
// ---------------------------------------------------------------------------

test('lane-b controls and lane-c result action meet the 44px coarse-pointer floor', async ({
  browser,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'coarse-pointer emulation is chromium-only');
  test.setTimeout(120_000);
  // CDP Emulation.setEmulatedMedia does not flip pointer media queries in this
  // Chromium/Playwright stack (proven in density-authority-matrix.spec.ts group
  // H); real coarse-pointer media comes from Playwright's mobile+touch
  // emulation.
  const baseURL = test.info().project.use.baseURL as string;
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 852 },
    hasTouch: true,
    isMobile: true,
  });
  try {
    const coarsePage = await context.newPage();
    await expect
      .poll(() => coarsePage.evaluate(() => window.matchMedia('(pointer: coarse)').matches))
      .toBe(true);

    const heightOf = async (selector: string): Promise<number> => {
      const box = await coarsePage.locator(selector).first().boundingBox();
      expect(box, `no bounding box for ${selector}`).not.toBeNull();
      return (box as { height: number }).height;
    };

    const laneB = LANES[1];
    await gotoCell(coarsePage, laneB);
    for (const control of laneB.controls) {
      expect(control.coarseFloor, `${control.name} must declare the coarse floor`).toBe(true);
      expect(
        await heightOf(control.control),
        `lane-b/${control.name} touch floor (44px)`,
      ).toBeGreaterThanOrEqual(44);
    }

    const laneC = LANES[2];
    await gotoCell(coarsePage, laneC);
    const resultAction = laneC.controls.find((control) => control.name === 'result');
    expect(resultAction).toBeDefined();
    expect(
      await heightOf((resultAction as ControlDef).control),
      'lane-c/result action touch floor (44px)',
    ).toBeGreaterThanOrEqual(44);
  } finally {
    await context.close();
  }
});

test.afterAll(() => {
  if (PRESSED_GAPS.length === 0) return;
  console.log(
    `\nPressed postures NOT computable (flagged for the coordinator, never faked):\n` +
      PRESSED_GAPS.map((gap) => `  - ${gap}`).join('\n'),
  );
});
