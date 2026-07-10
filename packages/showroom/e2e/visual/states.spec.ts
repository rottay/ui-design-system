import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-ARC-07 — the interaction states of a skin, pinned in a real browser.
//
// WHY THIS EXISTS
// ---------------
// ARC-07 moves a component's paint out of an inline `style={}` object and into
// a stylesheet keyed on the `data-part` / `data-state` attributes the behavior
// layer already stamps (WO-ARC-02). Its gate is "not one pixel moves".
//
// The 48 visual baselines cannot certify that. Every one of them photographs a
// page at rest: no baseline hovers anything, presses anything, or focuses
// anything. A migration could drop the entire hover rule, delete the press
// transform, and erase the focus ring, and all 89 gate tests would stay green.
//
// So the states are photographed here instead, as exact computed values, and
// the migration must reproduce them byte for byte.
//
// WHY EXACT STRINGS, AND NOT A TOLERANCE
// --------------------------------------
// Both engines animate. The rustic engine drives hover through spring physics
// (WO-CRA-06), so a sample taken at a fixed delay catches the spring mid-flight:
// at 200ms its scale reads 1.01085 and overshoots, at 400ms it has settled on
// exactly 1.01. Sampling on a timer would either be flaky or force a tolerance
// wide enough to hide a real regression.
//
// `readSettled` polls until two consecutive samples agree, which is what "the
// animation finished" actually means. Once settled, the values are clean and
// deterministic -- `matrix(1.01, 0, 0, 1.01, 0, -2)`, `0px 4px 6px -1px` -- so
// they are compared verbatim. No tolerance, nothing to tune.
//
// WHAT A CELL IS
// --------------
// One button variant, on one tenant, under one engine, in one interaction
// state, with twelve paint channels and its `data-state` attribute. The
// attribute is recorded alongside the paint so this file also pins the ARC-02
// contract in a real browser: a pointer press must not raise `focus-visible`,
// and a disabled part must report nothing else.
//
// UPDATING THE MATRIX
// -------------------
// The matrix is a record of what the component paints today, not a design
// decision. When a WO deliberately changes an interaction state, re-record it
// and the diff belongs in that WO's commit, where a reviewer can read it:
//
//   RECORD_STATE_MATRIX=1 pnpm --filter @rottay/showroom exec \
//     playwright test --config playwright.visual.config.ts visual/states
//
// Re-recording to make a red test go green, without a WO that intends the
// change, is the failure mode this file exists to prevent.
// ---------------------------------------------------------------------------

type Fixture = 'rottay' | 'bithire' | 'torture-dark';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly Fixture[] = ['rottay', 'bithire', 'torture-dark'];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];

/**
 * The buttons the torture probe renders, by document order, and the states each
 * one is put through. `primary-disabled` gets `hovered` deliberately: a disabled
 * control that reacts to a pointer is lying about being disabled, and the only
 * way to catch that is to hover it and demand nothing moved.
 */
const SUBJECTS: readonly { name: string; index: number; states: readonly StateName[] }[] = [
  { name: 'primary', index: 0, states: ['rest', 'hovered', 'rest-after-hover', 'pressed', 'focus-visible'] },
  { name: 'secondary', index: 1, states: ['rest', 'hovered', 'rest-after-hover', 'pressed', 'focus-visible'] },
  { name: 'default', index: 2, states: ['rest', 'hovered', 'rest-after-hover', 'pressed', 'focus-visible'] },
  { name: 'ghost', index: 3, states: ['rest', 'hovered', 'rest-after-hover', 'pressed', 'focus-visible'] },
  { name: 'primary-disabled', index: 5, states: ['rest', 'hovered'] },
];

type StateName = 'rest' | 'hovered' | 'rest-after-hover' | 'pressed' | 'focus-visible';

/**
 * The channels through which a button can express an interaction state. A skin
 * that moves any of them has changed what the user sees.
 */
const CHANNELS = [
  'backgroundColor',
  'backgroundImage',
  'color',
  'borderColor',
  'borderTopWidth',
  'boxShadow',
  'outlineStyle',
  'outlineWidth',
  'outlineColor',
  'outlineOffset',
  'transform',
  'opacity',
] as const;

type Cell = Record<string, string>;
type Matrix = Record<string, Cell>;

const MATRIX_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), 'state-matrix.json');
const RECORDING = process.env.RECORD_STATE_MATRIX === '1';

const BUTTONS = '[data-testid="probe-button"] button';

function cellKey(fixture: Fixture, engine: Engine, subject: string, state: StateName): string {
  return `${fixture}/${engine}/${subject}/${state}`;
}

/**
 * A cell without its `data-state`, i.e. only what a user can actually see.
 *
 * An invariant about paint must be asked about paint. `data-state` goes from
 * `''` to `'hovered'` on every hover, painted or not, so a whole-cell
 * comparison of rest against hover can never fail -- it would stay green with
 * the entire hover rule neutralized at `!important`.
 */
function paintOf(cell: Cell): Cell {
  const { 'data-state': _state, ...paint } = cell;
  return paint;
}

/**
 * Reads the paint channels once the element has stopped moving.
 *
 * "Stopped moving" is THREE consecutive identical samples, not a delay. The
 * rustic spring needs ~400ms; a modern transition needs ~150ms; a resting
 * element needs none. Polling for agreement serves all three without encoding
 * any of them.
 *
 * Three, not two: a spring approaches its target asymptotically, so two samples
 * 80ms apart can agree on a plateau the animation has not actually left. That
 * produced a cell recorded mid-flight, and two invariants that failed on data
 * rather than on the component.
 */
async function readSettled(page: Page, index: number): Promise<Cell> {
  const sample = () =>
    page.locator(BUTTONS).nth(index).evaluate((el, channels) => {
      const computed = getComputedStyle(el);
      const cell: Record<string, string> = {};
      for (const channel of channels) cell[channel] = computed[channel as never] as string;
      cell['data-state'] = el.getAttribute('data-state') ?? '';
      return cell;
    }, CHANNELS as unknown as string[]);

  const AGREEING_SAMPLES = 3;
  let previous = JSON.stringify(await sample());
  let agreements = 1;

  for (let attempt = 0; attempt < 40; attempt += 1) {
    await page.waitForTimeout(80);
    const current = await sample();
    const serialized = JSON.stringify(current);
    if (serialized === previous) {
      agreements += 1;
      if (agreements >= AGREEING_SAMPLES) return current;
    } else {
      agreements = 1;
      previous = serialized;
    }
  }
  throw new Error(`button ${index} never settled: still animating after 3.2s`);
}

/** Parks the pointer off every control so no subject is left hovered. */
async function releasePointer(page: Page): Promise<void> {
  await page.mouse.move(2, 2);
}

/**
 * Focuses a subject the way a keyboard user does: land on the element before it,
 * then Tab. `element.focus()` would also raise `focus-visible` under the current
 * hook, but it would stop doing so the moment a skin keys its ring on the
 * platform's own `:focus-visible` pseudo-class -- and this test must survive
 * that, because ARC-07 may well make that change.
 */
async function focusByKeyboard(page: Page, index: number): Promise<void> {
  await releasePointer(page);
  if (index === 0) {
    // The sentinel goes OUTSIDE the probe container. Inside, it would be a
    // ninth-plus `button` and every `nth(index)` below it would address the
    // wrong subject -- the matrix would still record cleanly, and it would
    // record the wrong control.
    await page.evaluate(() => {
      if (document.getElementById('keyboard-sentinel')) return;
      const container = document.querySelector<HTMLElement>('[data-testid="probe-button"]');
      if (!container?.parentElement) throw new Error('probe container is missing');
      const sentinel = document.createElement('button');
      sentinel.id = 'keyboard-sentinel';
      sentinel.textContent = 'sentinel';
      container.parentElement.insertBefore(sentinel, container);
    });
    await page.locator('#keyboard-sentinel').focus();
  } else {
    await page.locator(BUTTONS).nth(index - 1).focus();
  }
  await page.keyboard.press('Tab');

  const landed = await page.locator(BUTTONS).nth(index).evaluate((el) => el === document.activeElement);
  expect(landed, `Tab did not land on button ${index}`).toBe(true);
}

async function blurEverything(page: Page): Promise<void> {
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
}

async function captureSubject(
  page: Page,
  fixture: Fixture,
  engine: Engine,
  subject: (typeof SUBJECTS)[number]
): Promise<Matrix> {
  const captured: Matrix = {};
  const button = page.locator(BUTTONS).nth(subject.index);

  for (const state of subject.states) {
    switch (state) {
      case 'rest':
        await releasePointer(page);
        await blurEverything(page);
        break;
      case 'hovered':
        await blurEverything(page);
        await button.hover({ force: true });
        break;
      case 'rest-after-hover':
        await releasePointer(page);
        await blurEverything(page);
        break;
      case 'pressed':
        await button.hover({ force: true });
        await page.mouse.down();
        break;
      case 'focus-visible':
        await focusByKeyboard(page, subject.index);
        break;
    }

    captured[cellKey(fixture, engine, subject.name, state)] = await readSettled(page, subject.index);

    if (state === 'pressed') await page.mouse.up();
  }

  await releasePointer(page);
  await blurEverything(page);
  return captured;
}

async function openProbe(page: Page, fixture: Fixture, engine: Engine): Promise<void> {
  await page.goto(`/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&slug=button`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForSelector(BUTTONS);
  await page.waitForFunction(
    (expected) => document.documentElement.getAttribute('data-engine') === expected,
    engine
  );
  // The probe must actually have painted the subject set. A blank page would
  // otherwise "settle" instantly and record a matrix of empty strings -- the
  // exact way this program once certified a blank PNG as clean.
  await expect(page.locator(BUTTONS)).toHaveCount(9);
}

const recorded: Matrix = {};

function loadMatrix(): Matrix {
  if (!fs.existsSync(MATRIX_PATH)) {
    throw new Error(
      `state-matrix.json is missing. Record it with:\n` +
        `  RECORD_STATE_MATRIX=1 pnpm --filter @rottay/showroom exec playwright test --config playwright.visual.config.ts visual/states`
    );
  }
  return JSON.parse(fs.readFileSync(MATRIX_PATH, 'utf8')) as Matrix;
}

const baseline: Matrix = RECORDING ? {} : loadMatrix();

test.describe('button interaction states are pinned per tenant and engine', () => {
  for (const fixture of FIXTURES) {
    for (const engine of ENGINES) {
      test(`${fixture} / ${engine}`, async ({ page }) => {
        await openProbe(page, fixture, engine);

        for (const subject of SUBJECTS) {
          const captured = await captureSubject(page, fixture, engine, subject);
          Object.assign(recorded, captured);

          if (RECORDING) continue;

          for (const [key, cell] of Object.entries(captured)) {
            expect(baseline[key], `${key} is absent from state-matrix.json`).toBeDefined();
            expect(cell, `${key} moved: the skin no longer paints this state the way it did`).toEqual(
              baseline[key]
            );
          }
        }
      });
    }
  }
});

test.describe('the states mean what the anatomy contract says they mean', () => {
  test('a pointer press never raises focus-visible, and a disabled button never reacts', async () => {
    // Read off the matrix that the tests above just captured, so these
    // invariants are asserted against the same measurements, not a second run.
    const source = RECORDING ? recorded : baseline;
    expect(Object.keys(source).length, 'no cells were captured').toBeGreaterThan(0);

    for (const fixture of FIXTURES) {
      for (const engine of ENGINES) {
        for (const subject of SUBJECTS) {
          const at = (state: StateName) => source[cellKey(fixture, engine, subject.name, state)];

          if (subject.name === 'primary-disabled') {
            const rest = at('rest');
            const hovered = at('hovered');
            expect(rest['data-state'], `${fixture}/${engine}: disabled button reports extra state`).toBe(
              'disabled'
            );
            expect(hovered, `${fixture}/${engine}: a disabled button reacted to hover`).toEqual(rest);
            continue;
          }

          const pressed = at('pressed');
          expect(
            pressed['data-state'],
            `${fixture}/${engine}/${subject.name}: a mouse press drew a keyboard focus ring`
          ).not.toContain('focus-visible');
          expect(pressed['data-state']).toContain('pressed');

          const focused = at('focus-visible');
          expect(
            focused['data-state'],
            `${fixture}/${engine}/${subject.name}: Tab did not raise focus-visible`
          ).toContain('focus-visible');
          expect(
            focused['data-state'],
            `${fixture}/${engine}/${subject.name}: keyboard focus arrived hovered`
          ).not.toContain('hovered');
        }
      }
    }
  });

  test('every subject paints a keyboard focus indicator', async () => {
    const source = RECORDING ? recorded : baseline;

    for (const fixture of FIXTURES) {
      for (const engine of ENGINES) {
        for (const subject of SUBJECTS) {
          if (subject.name === 'primary-disabled') continue;
          const rest = source[cellKey(fixture, engine, subject.name, 'rest')];
          const focused = source[cellKey(fixture, engine, subject.name, 'focus-visible')];

          // An indicator is an outline the element did not have at rest, or a
          // box-shadow it did not have at rest. Both engines are permitted their
          // own answer; neither is permitted to have none.
          const grewOutline = focused.outlineStyle !== 'none' && focused.outlineStyle !== rest.outlineStyle;
          const grewShadow = focused.boxShadow !== rest.boxShadow;
          expect(
            grewOutline || grewShadow,
            `${fixture}/${engine}/${subject.name}: keyboard focus paints nothing`
          ).toBe(true);
        }
      }
    }
  });

  test('a hover that ends leaves no trace', async () => {
    // A skin that paints hover by mutating the element's inline style can fail
    // to put back what it overwrote. The modern Button did exactly that: its
    // hover set `borderColor` as a longhand over a `border` shorthand, and once
    // the pointer left, the colour did not come back -- it fell through to
    // whatever the cascade said, which on a dark tenant is the `*` border floor
    // and elsewhere is `currentColor`. Nothing photographed it, because no
    // baseline hovers.
    const source = RECORDING ? recorded : baseline;

    for (const fixture of FIXTURES) {
      for (const engine of ENGINES) {
        for (const subject of SUBJECTS) {
          if (subject.name === 'primary-disabled') continue;
          const rest = source[cellKey(fixture, engine, subject.name, 'rest')];
          const after = source[cellKey(fixture, engine, subject.name, 'rest-after-hover')];
          expect(
            paintOf(after),
            `${fixture}/${engine}/${subject.name}: the control did not return to rest after the pointer left`
          ).toEqual(paintOf(rest));
        }
      }
    }
  });

  test('every subject reacts to hover', async () => {
    const source = RECORDING ? recorded : baseline;

    for (const fixture of FIXTURES) {
      for (const engine of ENGINES) {
        for (const subject of SUBJECTS) {
          if (subject.name === 'primary-disabled') continue;
          const rest = source[cellKey(fixture, engine, subject.name, 'rest')];
          const hovered = source[cellKey(fixture, engine, subject.name, 'hovered')];
          expect(
            paintOf(hovered),
            `${fixture}/${engine}/${subject.name}: hover changed nothing a user can see`
          ).not.toEqual(paintOf(rest));
        }
      }
    }
  });

  test('every subject reacts to a press, and the press is a transform', async () => {
    const source = RECORDING ? recorded : baseline;

    for (const fixture of FIXTURES) {
      for (const engine of ENGINES) {
        for (const subject of SUBJECTS) {
          if (subject.name === 'primary-disabled') continue;
          const hovered = source[cellKey(fixture, engine, subject.name, 'hovered')];
          const pressed = source[cellKey(fixture, engine, subject.name, 'pressed')];
          expect(
            pressed.transform,
            `${fixture}/${engine}/${subject.name}: a press does not move the control`
          ).not.toBe(hovered.transform);
          expect(pressed.transform).toContain('matrix');
        }
      }
    }
  });
});

test.afterAll(async () => {
  if (!RECORDING) return;
  const ordered: Matrix = {};
  for (const key of Object.keys(recorded).sort()) ordered[key] = recorded[key];
  fs.writeFileSync(MATRIX_PATH, `${JSON.stringify(ordered, null, 2)}\n`);
  // eslint-disable-next-line no-console
  console.log(`recorded ${Object.keys(ordered).length} cells to ${MATRIX_PATH}`);
});
