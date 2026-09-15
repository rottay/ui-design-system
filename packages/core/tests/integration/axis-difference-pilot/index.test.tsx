/**
 * The WO-EVI-05 pilot run of the by-axis probe: the WO-FAM-01 families mounted on
 * their own server-rendered anatomy, measured in real Chromium on two provisional
 * BitHire tenants that differ beyond colour, with both negative controls of kit
 * rule 4. Every figure it publishes is a pilot figure, never a fleet one, and
 * every denominator is read beside the not-applicable set the population owner
 * publishes with it: 29 applicable pairs plus one reviewed N/A, never 30.
 */
import React from 'react';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterAll, describe, expect, it } from 'vitest';

import ModernButton from '@/components/primitives/inputs/button/engines/modern';
import ModernCheckbox from '@/components/primitives/inputs/checkbox/engines/modern';
import ModernRadio from '@/components/primitives/inputs/radio/engines/modern';
import { RadioGroup } from '@/components/primitives/inputs/radio/compound/group';
import ModernToggle from '@/components/primitives/inputs/toggle/engines/modern';
import ModernSegmented from '@/components/primitives/navigation/segmented/engines/modern';
import { compileTenantThemeDocumentV2 } from '@/entrypoints/server';
import { bithireIdentityCandidate } from '@/foundation/presets/candidates/bithire/documents';
import { MotionContext } from '@/infrastructure/runtime/foundation/motion/composition/react/preference';
import { resolveMotionPolicy } from '@/infrastructure/runtime/foundation/motion/policy';
import {
  evaluatePilot,
  pairScenarios,
  pilotReadings,
  run,
} from '@checks/theme/axis-difference/index.mjs';
import { checkPilotPopulation, withNotApplicable } from '@checks/theme/population/index.mjs';

const CORE = resolve(__dirname, '../../..');
const RECORD = resolve(CORE, '../../test-artifacts/gates/axis-difference-pilot/index.json');
const MODERN_SKINS = 'src/foundation/tokens/css/runtime/engines/modern/skin';
const AGNOSTIC_SKINS = 'src/foundation/tokens/css/presentation/components/skin';
const CATALOG = 'src/contracts/theme/runtime/catalog/index.ts';
const ROSTER = 'scripts/check/family-cut/baseline/index.json';

/** The provisional pair: angular and compact against rounded and lifted, through admitted decisions only. */
const PAIR = ['product-dense', 'warm-humanist'] as const;

type ProbeResult = Awaited<ReturnType<typeof run>>;
type ProbeOptions = {
  verticals: string[];
  themes: string[];
  families: string[];
  scenarios: ReturnType<typeof pairScenarios>;
  mounts: Record<string, { markup: string }>;
  compile: typeof compileTenantThemeDocumentV2;
};
/** The probe's defaults are `null`, which TypeScript reads as its whole parameter type; the run is typed by what it is handed. */
const probe = run as unknown as (options: ProbeOptions) => Promise<ProbeResult>;

type NotApplicable = Record<string, Record<string, { reason: string; review: string }>>;

/**
 * The anatomy a visible desktop client without a reduced-motion preference
 * hydrates to. The server has no motion environment and renders every recipe
 * settled, which would measure a button that can never transition.
 */
const CLIENT_MOTION = {
  systemPrefersReducedMotion: false,
  prefersReducedMotion: false,
  policy: resolveMotionPolicy({ profile: 'calm', reduce: false, pointer: 'fine', power: 'normal', visible: true }),
};

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MotionContext.Provider value={CLIENT_MOTION}>{node}</MotionContext.Provider>);

const MOUNTS: Record<string, { markup: string }> = {
  button: {
    markup: render(
      <div>
        <ModernButton variant="primary">Save changes</ModernButton>
        <ModernButton variant="default">Cancel</ModernButton>
      </div>,
    ),
  },
  checkbox: {
    markup: render(
      <div>
        <ModernCheckbox label="Accept terms" description="Required to continue" defaultChecked />
        <ModernCheckbox label="Subscribe" />
        <ModernCheckbox label="Consent" error />
      </div>,
    ),
  },
  radio: {
    markup: render(
      <div>
        <ModernRadio name="plan" value="pro" label="Pro plan" description="Billed yearly" defaultChecked />
        <ModernRadio name="plan" value="team" label="Team plan" />
        <ModernRadio name="consent" value="yes" label="Consent" error />
      </div>,
    ),
  },
  segmented: {
    markup: render(
      <ModernSegmented
        ariaLabel="Period"
        options={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
        ]}
        defaultValue="week"
      />,
    ),
  },
  toggle: {
    markup: render(
      <div>
        <ModernToggle label="Alerts" description="Sent by email" defaultChecked />
        <ModernToggle label="Digest" />
        <ModernToggle label="Terms" error errorMessage="Accept to continue" />
      </div>,
    ),
  },
};

/**
 * The real button-style Radio.Group: the one radius its own skin authors sits on
 * `[data-part='option']`, below the root the bare probe would read, so the
 * corner is measured only when the anatomy is mounted with `buttonStyle` stamped.
 */
const RADIO_GROUP_MOUNT = {
  markup: render(
    <RadioGroup
      buttonStyle="solid"
      direction="horizontal"
      defaultValue="month"
      options={[
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
      ]}
    />,
  ),
};

const decisionsOf = (id: string) =>
  (bithireIdentityCandidate(id).document as { decisions: Record<string, unknown> }).decisions;

const sandboxes: string[] = [];
afterAll(() => { for (const dir of sandboxes) rmSync(dir, { recursive: true, force: true }); });

/** A copy of what the population owner reads, so a planted skin can be derived without touching the tree. */
function populationSandbox(): string {
  const dir = mkdtempSync(join(tmpdir(), 'evi05-pilot-'));
  sandboxes.push(dir);
  for (const skins of [MODERN_SKINS, AGNOSTIC_SKINS]) {
    mkdirSync(join(dir, skins), { recursive: true });
    cpSync(join(CORE, skins), join(dir, skins), { recursive: true });
  }
  for (const file of [ROSTER, CATALOG]) {
    mkdirSync(join(dir, dirname(file)), { recursive: true });
    cpSync(join(CORE, file), join(dir, file));
  }
  return dir;
}

const record: Record<string, unknown> = {};

describe('WO-EVI-05 pilot — the causal chain on the WO-FAM-01 population', () => {
  const { live: pilot, pin, failures: populationFailures } = checkPilotPopulation(undefined, undefined, undefined, {
    revision: true,
  });
  const notApplicable = pilot.notApplicable as NotApplicable;
  const notApplicablePairs = Object.entries(notApplicable)
    .flatMap(([family, axes]) => Object.keys(axes).map((axis) => `${family}/${axis}`))
    .sort();

  const writeRecord = () => {
    mkdirSync(resolve(RECORD, '..'), { recursive: true });
    writeFileSync(RECORD, `${JSON.stringify({
      workOrder: 'WO-EVI-05',
      scope: 'pilot',
      pair: PAIR,
      applicablePairs: Object.values(pilot.families).reduce((sum, axes) => sum + axes.length, 0),
      notApplicablePairs,
      notApplicable,
      exclusionsRevision: pilot.exclusionsRevision,
      runs: record,
    }, null, 2)}\n`);
  };

  it('measures exactly the published pilot population, with its N/A read from the live derivation and equal to the pin', () => {
    expect(populationFailures).toEqual([]);
    expect(Object.keys(MOUNTS).sort()).toEqual(Object.keys(pilot.families).sort());
    expect(notApplicable).toEqual(pin.notApplicable);
    expect(notApplicablePairs).toEqual(['radio/shape']);
    expect(pilot.families.radio).toEqual(['typography', 'rhythm', 'depth', 'states', 'motion']);
    expect(pilot.denominators).toEqual({ shape: 4, typography: 5, rhythm: 5, depth: 5, states: 5, motion: 5 });
    expect(pilot.notApplicableCounts).toEqual({ shape: 1, typography: 0, rhythm: 0, depth: 0, states: 0, motion: 0 });
    expect(notApplicable.radio!.shape!.review).toBe('WO-EVI-05 core review 2026-09-14');
    expect(notApplicable.radio!.shape!.reason).toMatch(/semantic identity/);
    expect(Object.values(pilot.families).reduce((sum, axes) => sum + axes.length, 0)).toBe(29);
  });

  for (const [baseId, otherId] of [PAIR, [PAIR[1], PAIR[0]]] as const) {
    it(`${baseId} against ${otherId}: both controls hold at 0 % on every cell, every applicable pair moves, and only the published N/A stands aside`, async () => {
      const result = await probe({
        verticals: ['bithire'],
        themes: ['light', 'dark'],
        families: Object.keys(pilot.families),
        scenarios: pairScenarios({ base: decisionsOf(baseId), other: decisionsOf(otherId) }),
        mounts: MOUNTS,
        compile: compileTenantThemeDocumentV2,
      });
      const failures = evaluatePilot(result, pilot);
      record[`${baseId}->${otherId}`] = {
        pilotPopulation: pilot,
        revision: { digest: result.revision.digest, decisionRows: result.revision.decisionRows },
        browser: result.browser,
        bundleMode: result.bundleMode,
        pilotReadings: withNotApplicable(pilotReadings(result, pilot), pilot),
        cells: result.cells.map(({ movedFamilies: _moved, ...cell }) => cell),
        refusals: result.refusals,
        failures,
      };
      writeRecord();
      expect(failures).toEqual([]);
      // The N/A pair is outside the applicable denominator, not silently inside it.
      expect(result.effectiveFamilies.shape).not.toContain('radio');
      expect(result.effectiveFamilies.typography).toContain('radio');
      for (const reading of withNotApplicable(pilotReadings(result, pilot), pilot)) {
        expect(reading.notApplicable).toBe(reading.axis === 'shape' ? 1 : 0);
        expect(reading.moved).toBe(reading.denominator);
      }
    }, 900_000);
  }

  it('MUTANT (a): a tenant corner planted on a non-excluded part of the radio re-enters shape, and the pin refuses it before any browser runs', () => {
    const dir = populationSandbox();
    const skin = join(dir, MODERN_SKINS, 'radio/index.css');
    const source = readFileSync(skin, 'utf8');
    const planted = source.replace(
      ".ds-radio.ds-radio--modern[data-part='root'] {\n  position: relative;",
      ".ds-radio.ds-radio--modern[data-part='root'] {\n  border-radius: var(--ds-radio-corner, var(--ds-radius-md));\n  position: relative;",
    );
    expect(planted).not.toBe(source);
    writeFileSync(skin, planted);
    const { live, failures } = checkPilotPopulation(dir, join(dir, CATALOG), undefined, { revision: true });
    expect(live.families.radio).toEqual(['shape', 'typography', 'rhythm', 'depth', 'states', 'motion']);
    expect(live.notApplicable).toEqual({});
    expect(failures).toContain('shape: published pilot denominator 4 != 5');
    expect(failures).toContain('shape: published pilot not-applicable count 1 != 0');
    expect(failures.some((line) => line.startsWith('radio/shape: published NOT APPLICABLE and now declared'))).toBe(true);
  });

  it('MUTANT: a pilot family whose anatomy the skin no longer reaches is named on the axis it declares', async () => {
    const severed = MOUNTS.checkbox!.markup.replaceAll('ds-checkbox', 'ds-severed');
    const result = await probe({
      verticals: ['bithire'],
      themes: ['light'],
      families: Object.keys(pilot.families),
      scenarios: pairScenarios({ base: decisionsOf(PAIR[0]), other: decisionsOf(PAIR[1]) }),
      mounts: { ...MOUNTS, checkbox: { markup: severed } },
      compile: compileTenantThemeDocumentV2,
    });
    const failures = evaluatePilot(result, pilot);
    expect(failures).toContain('checkbox: declares shape and did not move on it in bithire/light');
    expect(failures).not.toContain('button: declares shape and did not move on it in bithire/light');
  }, 900_000);

  it('radio-group continuity: the population family the exclusion never reaches is mounted button-style and its option corner measured on the shape positive', async () => {
    expect(RADIO_GROUP_MOUNT.markup).toContain('ds-radio-group--button');
    expect(RADIO_GROUP_MOUNT.markup).toContain('data-part="option"');
    expect(RADIO_GROUP_MOUNT.markup).toContain('data-button-style="solid"');
    const result = await probe({
      verticals: ['bithire'],
      themes: ['light', 'dark'],
      families: [...Object.keys(pilot.families), 'radio-group'],
      scenarios: pairScenarios({ base: decisionsOf(PAIR[0]), other: decisionsOf(PAIR[1]) }),
      mounts: { ...MOUNTS, 'radio-group': RADIO_GROUP_MOUNT },
      compile: compileTenantThemeDocumentV2,
    });
    expect(result.families.mounted).toContain('radio-group');
    expect(result.effectiveFamilies.shape).toContain('radio-group');
    const shapeCells = result.cells.filter((cell) => cell.kind === 'positive' && cell.axis === 'shape');
    expect(shapeCells.map((cell) => cell.theme).sort()).toEqual(['dark', 'light']);
    const wiring = Object.fromEntries(shapeCells.map((cell) => [cell.theme, {
      evidential: cell.evidential,
      moved: cell.movedIds.includes('radio-group'),
      property: cell.movedFamilies.find((entry) => entry.family === 'radio-group')?.property ?? null,
    }]));
    record['radio-group-continuity'] = {
      family: 'radio-group',
      scope: 'fleet family outside the pilot roster, mounted for continuity; not a pilot figure',
      mount: 'Radio.Group buttonStyle="solid": the [data-part=option] corner at presentation/components/skin/radio-group/index.css:92',
      pair: PAIR,
      shape: wiring,
      cells: shapeCells.map(({ movedFamilies: _moved, ...cell }) => cell),
    };
    writeRecord();
    for (const cell of shapeCells) expect(cell.evidential).toBe(true);
    // A correctly wired corner PASSES: the option corner moves with the shape decision in both modes.
    for (const cell of shapeCells) expect(cell.movedIds).toContain('radio-group');
    // Its presence changes no pilot verdict: the pilot denominators are the roster's alone.
    expect(evaluatePilot(result, pilot)).toEqual([]);
  }, 900_000);
});
