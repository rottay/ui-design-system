/**
 * The WO-EVI-05 pilot run of the by-axis probe: the WO-FAM-01 families mounted on
 * their own server-rendered anatomy, measured in real Chromium on two provisional
 * BitHire tenants that differ beyond colour, with both negative controls of kit
 * rule 4. Every figure it publishes is a pilot figure, never a fleet one.
 */
import React from 'react';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernButton from '@/components/primitives/inputs/button/engines/modern';
import ModernCheckbox from '@/components/primitives/inputs/checkbox/engines/modern';
import ModernRadio from '@/components/primitives/inputs/radio/engines/modern';
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
import { checkPilotPopulation } from '@checks/theme/population/index.mjs';

const RECORD = resolve(__dirname, '../../../../../test-artifacts/gates/axis-difference-pilot/index.json');

/** The provisional pair: angular and compact against rounded and lifted, through admitted decisions only. */
const PAIR = ['product-dense', 'warm-humanist'] as const;

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
 * The (family, axis) pairs measured NOT moving on the pilot pair, with the cause
 * measured for each. The pilot is not green while this is non-empty; the run
 * asserts it exactly, so a new red fails and a cured pair must leave it.
 */
const NOT_YET_GREEN: Record<string, string> = {
  'radio/shape':
    'ADJUDICATED, not a wiring gap (WO-EVI-05 progressLog, 2026-09-14): every radius the bare radio '
    + 'paints is a semantic identity, so no shape decision may lawfully move it. The circle is round '
    + 'because round means single-choice (skin/radio/index.css:64) and the dot is bound to it (:203); '
    + 'the family stamps no frame part for a corner to govern; the focus ring is an outline, which '
    + 'follows the circle rather than carrying a radius of its own; and the touch target is a height, '
    + 'which kit rule 4 does not count as shape. The family therefore declares an axis it cannot '
    + 'satisfy without breaking what the control means. Correcting the declaration is a shared-core '
    + 'contract decision pending above the DT -- the population is DERIVED from the skin, so a '
    + 'withdrawal needs a semantic-identity exclusion in the population owner, not an edit here. The '
    + 'future lawful owner is named: the Radio.Group button-style option corner '
    + '(presentation/components/skin/radio-group/index.css:92), pending a Modern skin owner.',
};

const decisionsOf = (id: string) =>
  (bithireIdentityCandidate(id).document as { decisions: Record<string, unknown> }).decisions;

const record: Record<string, unknown> = {};

describe('WO-EVI-05 pilot — the causal chain on the WO-FAM-01 population', () => {
  const { live: pilot, failures: populationFailures } = checkPilotPopulation(undefined, undefined, undefined, {
    revision: true,
  });

  it('measures exactly the published pilot population, at its catalog revision', () => {
    expect(populationFailures).toEqual([]);
    expect(Object.keys(MOUNTS).sort()).toEqual(Object.keys(pilot.families).sort());
  });

  for (const [baseId, otherId] of [PAIR, [PAIR[1], PAIR[0]]] as const) {
    it(`${baseId} against ${otherId}: both controls hold at 0 % on every cell, and only the NOT_YET_GREEN pairs fail to move`, async () => {
      const result = await run({
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
        pilotReadings: pilotReadings(result, pilot),
        cells: result.cells.map(({ movedFamilies: _moved, ...cell }) => cell),
        refusals: result.refusals,
        failures,
      };
      mkdirSync(resolve(RECORD, '..'), { recursive: true });
      writeFileSync(RECORD, `${JSON.stringify({ workOrder: 'WO-EVI-05', scope: 'pilot', pair: PAIR, runs: record }, null, 2)}\n`);
      expect([...failures].sort()).toEqual(
        Object.keys(NOT_YET_GREEN).flatMap((key) => {
          const [family, axis] = key.split('/');
          return ['light', 'dark'].map((theme) => `${family}: declares ${axis} and did not move on it in bithire/${theme}`);
        }).sort(),
      );
    }, 900_000);
  }

  it('MUTANT: a pilot family whose anatomy the skin no longer reaches is named on the axis it declares', async () => {
    const severed = MOUNTS.checkbox!.markup.replaceAll('ds-checkbox', 'ds-severed');
    const result = await run({
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
});
