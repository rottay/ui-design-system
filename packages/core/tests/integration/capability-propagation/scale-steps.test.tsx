/**
 * @fileoverview The browser arm of the scale-step capability acceptance
 * (channel-liveness C1, WO-EVI-02): resolution, not paint.
 *
 * Each first-party vertical's own fixture is compiled through the productive
 * door and mounted under its light root and its dark root. On a probe element
 * the 16 and 24 status tint steps must compute a different value per mode, and
 * equal the mix of that root's computed role over its computed ground. Rottay's
 * dark leg is its default root against its light block.
 *
 * The planted fault is WRONG ROOT: the other-mode arm mounted on the vertical's
 * default root. Its readings collapse onto the default ones, and the mode
 * difference must turn red.
 *
 * `auto` stays STOPPED as `computed-style.test.tsx` registers it.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it } from 'vitest';

import type { FlatTheme } from '@/foundation/contracts/composition/tenants/themes';
import {
  FIRST_PARTY_VERTICALS,
  measureMountedArms,
  mountFlatThemeArm,
  type ProbeReadings,
  type ProbeTarget,
  type ProbeVertical,
} from '@tests/support/family-causality';
import { firstPartyFixture } from '@tests/support/theme-lowering';

const TINT_STEPS = [
  { channel: '--ds-tint-error-16', role: '--ds-color-error', step: 16 },
  { channel: '--ds-tint-error-24', role: '--ds-color-error', step: 24 },
  { channel: '--ds-tint-info-16', role: '--ds-color-info', step: 16 },
  { channel: '--ds-tint-info-24', role: '--ds-color-info', step: 24 },
  { channel: '--ds-tint-success-16', role: '--ds-color-success', step: 16 },
  { channel: '--ds-tint-success-24', role: '--ds-color-success', step: 24 },
  { channel: '--ds-tint-warning-16', role: '--ds-color-warning', step: 16 },
  { channel: '--ds-tint-warning-24', role: '--ds-color-warning', step: 24 },
] as const;
const INFO_300 = '--ds-color-info-300';
/** bithire seeds infoColor; evnto and rottay inherit the base ramp, which the base dark scope does not re-seed. */
const SEEDED_INFO: readonly ProbeVertical[] = ['bithire'];

const probeId = (channel: string) => channel.replace(/^--ds-/u, '');

const SCENE = renderToStaticMarkup(
  <>
    {TINT_STEPS.map(({ channel, role, step }) => (
      <React.Fragment key={channel}>
        <div data-probe={probeId(channel)} style={{ backgroundColor: `var(${channel})` }} />
        <div
          data-probe={`${probeId(channel)}-mix`}
          style={{ backgroundColor: `color-mix(in oklab, var(${role}) ${step}%, var(--ds-color-bg-primary))` }}
        />
      </React.Fragment>
    ))}
    <div data-probe={probeId(INFO_300)} style={{ backgroundColor: `var(${INFO_300})` }} />
  </>,
);

const TARGETS: readonly ProbeTarget[] = [
  ...TINT_STEPS.flatMap(({ channel }) => [
    { id: channel, selector: `[data-probe=${probeId(channel)}]`, property: 'background-color' },
    { id: `${channel}:mix`, selector: `[data-probe=${probeId(channel)}-mix]`, property: 'background-color' },
  ]),
  { id: INFO_300, selector: `[data-probe=${probeId(INFO_300)}]`, property: 'background-color' },
];

const fixture = (vertical: ProbeVertical) => JSON.parse(JSON.stringify(firstPartyFixture(vertical))) as FlatTheme;
const ownMode = (vertical: ProbeVertical): 'light' | 'dark' => (vertical === 'rottay' ? 'dark' : 'light');
const otherMode = (vertical: ProbeVertical): 'light' | 'dark' => (vertical === 'rottay' ? 'light' : 'dark');

/** Every tint step that fails to carry the mode, or fails to equal its root's mix. */
function tintFailures(own: Record<string, string>, other: Record<string, string>): string[] {
  const failures: string[] = [];
  for (const { channel } of TINT_STEPS) {
    if (!own[channel] || own[channel].startsWith('<no match')) failures.push(`${channel}: no reading`);
    else if (own[channel] === other[channel]) failures.push(`${channel} held at ${own[channel]}`);
    for (const reading of [own, other]) {
      if (reading[channel] !== reading[`${channel}:mix`]) failures.push(`${channel} ${reading[channel]} != mix ${reading[`${channel}:mix`]}`);
    }
  }
  return failures;
}

const readings: Partial<Record<ProbeVertical, ProbeReadings>> = {};

describe('the scale-step capability resolves per mode root (computed style)', () => {
  beforeAll(async () => {
    for (const vertical of FIRST_PARTY_VERTICALS) {
      readings[vertical] = await measureMountedArms({
        markup: SCENE,
        targets: TARGETS,
        arms: {
          own: () => mountFlatThemeArm(vertical, fixture(vertical), ownMode(vertical)),
          other: () => mountFlatThemeArm(vertical, fixture(vertical), otherMode(vertical)),
          // WRONG ROOT: the other-mode arm on the vertical's default root.
          'wrong-root': () => mountFlatThemeArm(vertical, fixture(vertical)),
        },
      });
    }
  }, 600_000);

  it("the 16 and 24 tint steps compute a different mix under the light and the dark root, equal to that root's role over its ground", () => {
    for (const vertical of FIRST_PARTY_VERTICALS) {
      const { own, other } = readings[vertical]!;
      expect(tintFailures(own!, other!), vertical).toEqual([]);
    }
  });

  it('info-300 follows the mode on the seeded vertical and holds by base-theme law on the unseeded ones', () => {
    for (const vertical of FIRST_PARTY_VERTICALS) {
      const { own, other } = readings[vertical]!;
      expect(own![INFO_300], vertical).toMatch(/^rgb/u);
      if (SEEDED_INFO.includes(vertical)) expect(other![INFO_300], vertical).not.toBe(own![INFO_300]);
      else expect(other![INFO_300], vertical).toBe(own![INFO_300]);
    }
  });

  it('WRONG ROOT: the dark arm mounted under the light root computes the light values (mutant)', () => {
    for (const vertical of FIRST_PARTY_VERTICALS) {
      const { own, 'wrong-root': wrong } = readings[vertical]!;
      expect(tintFailures(own!, wrong!), vertical).not.toEqual([]);
      if (SEEDED_INFO.includes(vertical)) expect(wrong![INFO_300], vertical).toBe(own![INFO_300]);
    }
  });
});
