/**
 * @fileoverview Capability propagation, the computed-style leg of the CAP-2
 * drained entries (WO-EVI-02).
 *
 * `index.test.ts` beside this file proves that each drained entry's static
 * write MOVES CHANNELS. This file proves the moved channels PAINT: the same
 * writes (`drained-writes.ts`, shared so the two legs cannot drift) are
 * compiled through the productive door, mounted in real Chromium on the
 * families' own server markup, and read back as computed style. Each leg
 * names what it must move and a control it must hold, and each carries a
 * planted fault that must turn it red -- a leg that cannot fail proves nothing.
 *
 * The faults are the two ways this measurement goes blind:
 *  - SEVERED CONSUMER (button-style, profile, expressive): a stylesheet in the
 *    scene pins the painted property, so the skin no longer reads the channel.
 *  - WRONG ROOT (both dark-mode legs): the arm is mounted on the vertical's
 *    static default root attributes instead of its own, which is exactly the
 *    shape that hid the dark-mode write -- a dark-mode channel read under a
 *    light root does not paint.
 *
 * ## Registered, not resolved here
 *
 * - rottay has no static dark-mode leg: dark is its default mode and the door
 *   refuses a `modes.dark` overlay (asserted below, not skipped).
 * - `auto` (v2 `palette.dark-mode`): STOPPED. The server mount stamps
 *   `data-tenant-theme-mode="auto"` and the fallback `data-theme`; resolving
 *   `auto` against `prefers-color-scheme` is the client pre-paint script's job,
 *   which this harness does not run. Measured 2026-10-01: `auto` paints the
 *   fallback under both emulated schemes on all three verticals. Only the
 *   root-attribute half is asserted here.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it } from 'vitest';

import ModernCard from '@/components/primitives/display/card/engines/modern';
import ModernButton from '@/components/primitives/inputs/button/engines/modern';
import ModernPageShell from '@/components/patterns/shell/page-shell/engines/modern';
import type { FlatTheme } from '@/foundation/contracts/composition/tenants/themes';
import {
  FIRST_PARTY_VERTICALS,
  measureMountedArms,
  mountArm,
  mountDocumentArm,
  mountFlatThemeArm,
  type MountedArm,
  type ProbeReadings,
  type ProbeTarget,
  type ProbeVertical,
} from '@tests/support/family-causality';
import { firstPartyFixture } from '@tests/support/theme-lowering';

import { CAP2_STATIC_WRITES } from './drained-writes';

const SCENE = renderToStaticMarkup(
  <>
    <div data-probe="canvas" style={{ background: 'var(--ds-color-bg-primary)' }}>canvas</div>
    <div data-probe="button"><ModernButton variant="primary">Go</ModernButton></div>
    <div data-probe="outlined"><ModernCard variant="outlined" title="Outlined">Body</ModernCard></div>
    <div data-probe="elevated"><ModernCard variant="elevated" title="Elevated">Body</ModernCard></div>
    <div data-probe="shell"><ModernPageShell title="Title" eyebrow="Eyebrow">content</ModernPageShell></div>
  </>,
);

const CARD = ".ds-card[data-part='root']";
const TARGETS: readonly ProbeTarget[] = [
  { id: 'canvas-bg', selector: '[data-probe=canvas]', property: 'background-color' },
  { id: 'button-radius', selector: '[data-probe=button] .ds-button', property: 'border-top-left-radius' },
  { id: 'button-bg', selector: '[data-probe=button] .ds-button', property: 'background-color' },
  { id: 'outlined-edge', selector: `[data-probe=outlined] ${CARD}`, property: 'border-top-style' },
  { id: 'elevated-edge', selector: `[data-probe=elevated] ${CARD}`, property: 'border-top-style' },
  { id: 'elevated-lift', selector: `[data-probe=elevated] ${CARD}`, property: 'background-image' },
  { id: 'eyebrow-case', selector: "[data-probe=shell] [data-part='eyebrow']", property: 'text-transform' },
];

type StaticEntry = 'shape.button-style' | 'experience.profile' | 'profiles.expressive';

interface Leg {
  readonly moves: readonly string[];
  readonly holds: string;
}

/** The family each entry paints through, and the severing fault for it. */
const STATIC_LEGS: Readonly<Record<StaticEntry, Leg & { readonly sever: string }>> = {
  'shape.button-style': {
    moves: ['button-radius'],
    holds: 'button-bg',
    sever: '.ds-button.ds-button--modern { border-radius: 0 !important; }',
  },
  'experience.profile': {
    // Channels with Modern readers only: the page-shell overline case and the
    // elevated card's lift tint. `--ds-material-card-highlight` moves too, and
    // has no Modern reader, so it is not a reading.
    moves: ['eyebrow-case', 'elevated-lift'],
    holds: 'button-radius',
    sever: `[data-part='eyebrow'] { text-transform: none !important; } ${CARD} { background-image: none !important; }`,
  },
  'profiles.expressive': {
    moves: ['outlined-edge', 'elevated-edge'],
    holds: 'button-bg',
    sever: `${CARD} { border-style: solid !important; }`,
  },
};

const DARK_LEG: Leg = { moves: ['button-bg'], holds: 'canvas-bg' };
const MODE_LEG: Leg = { moves: ['canvas-bg'], holds: 'button-radius' };

/** Every way an arm fails its leg, by name; empty means causal. */
function legFailures(base: Record<string, string>, moved: Record<string, string>, leg: Leg): string[] {
  const failures: string[] = [];
  for (const id of leg.moves) {
    if (base[id] === undefined || base[id].startsWith('<no match')) failures.push(`${id}: no reading`);
    else if (moved[id] === base[id]) failures.push(`${id} held at ${base[id]}`);
  }
  if (moved[leg.holds] !== base[leg.holds]) failures.push(`control ${leg.holds} moved`);
  return failures;
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const fixture = (vertical: ProbeVertical) => firstPartyFixture(vertical) as FlatTheme;
const written = (entry: keyof typeof CAP2_STATIC_WRITES, vertical: ProbeVertical) =>
  CAP2_STATIC_WRITES[entry](clone(fixture(vertical)));

/** The vertical's non-default mode: what a `palette.dark-mode` choice can flip to. */
const otherMode = (vertical: ProbeVertical): 'light' | 'dark' => (vertical === 'rottay' ? 'light' : 'dark');
const ownMode = (vertical: ProbeVertical): 'light' | 'dark' => (vertical === 'rottay' ? 'dark' : 'light');
const SEEDS = { 'palette.seeds': { primary: '#1F4FA8', secondary: '#3C6E71', accent: '#B26B2E' } };

const STATIC_DARK: readonly ProbeVertical[] = ['bithire', 'evnto'];

interface VerticalReadings {
  readonly scene: ProbeReadings;
  readonly severed: ProbeReadings;
  readonly document: ProbeReadings;
}

const readings: Partial<Record<ProbeVertical, VerticalReadings>> = {};

describe('capability propagation — the CAP-2 drained entries paint (computed style)', () => {
  beforeAll(async () => {
    for (const vertical of FIRST_PARTY_VERTICALS) {
      const staticArms: Record<string, () => Promise<MountedArm>> = {
        base: () => mountFlatThemeArm(vertical, clone(fixture(vertical))),
      };
      for (const entry of Object.keys(STATIC_LEGS) as StaticEntry[]) {
        staticArms[entry] = () => mountFlatThemeArm(vertical, written(entry, vertical));
      }
      const sceneArms = { ...staticArms };
      if (STATIC_DARK.includes(vertical)) {
        sceneArms['dark:base'] = () => mountFlatThemeArm(vertical, clone(fixture(vertical)), 'dark');
        sceneArms['dark:write'] = () => mountFlatThemeArm(vertical, written('palette.dark-mode', vertical), 'dark');
        // WRONG ROOT: the write mounted on the vertical's default (light) root.
        sceneArms['dark:wrong-root'] = () => mountFlatThemeArm(vertical, written('palette.dark-mode', vertical));
      }
      const scene = await measureMountedArms({ markup: SCENE, targets: TARGETS, arms: sceneArms });

      const severed = await measureMountedArms({
        markup: `<style>${Object.values(STATIC_LEGS).map((leg) => leg.sever).join('\n')}</style>${SCENE}`,
        targets: TARGETS,
        arms: staticArms,
      });

      const document = await measureMountedArms({
        markup: SCENE,
        targets: TARGETS,
        arms: {
          base: () => mountDocumentArm(vertical, SEEDS),
          other: () => mountDocumentArm(vertical, { ...SEEDS, 'palette.dark-mode': otherMode(vertical) }),
          own: () => mountDocumentArm(vertical, { ...SEEDS, 'palette.dark-mode': ownMode(vertical) }),
          // WRONG ROOT: `mountArm` stamps the static vertical's attributes on every arm.
          'wrong-root:base': () => mountArm(vertical, SEEDS),
          'wrong-root:other': () => mountArm(vertical, { ...SEEDS, 'palette.dark-mode': otherMode(vertical) }),
        },
      });

      readings[vertical] = { scene, severed, document };
    }
  }, 600_000);

  for (const [entry, leg] of Object.entries(STATIC_LEGS) as [StaticEntry, (typeof STATIC_LEGS)[StaticEntry]][]) {
    it(`${entry}: the static write moves ${leg.moves.join(', ')} and holds ${leg.holds} on every vertical`, () => {
      for (const vertical of FIRST_PARTY_VERTICALS) {
        const { scene } = readings[vertical]!;
        expect(legFailures(scene.base!, scene[entry]!, leg), vertical).toEqual([]);
      }
    });

    it(`${entry}: a severed consumer turns the leg red (mutant)`, () => {
      for (const vertical of FIRST_PARTY_VERTICALS) {
        const { severed } = readings[vertical]!;
        expect(legFailures(severed.base!, severed[entry]!, leg), vertical).not.toEqual([]);
      }
    });
  }

  it('palette.dark-mode (static): the dark write paints the primary button under a dark root', () => {
    for (const vertical of STATIC_DARK) {
      const { scene } = readings[vertical]!;
      expect(legFailures(scene['dark:base']!, scene['dark:write']!, DARK_LEG), vertical).toEqual([]);
    }
  });

  it('palette.dark-mode (static): read under the default root, the same write paints nothing (mutant)', () => {
    for (const vertical of STATIC_DARK) {
      const { scene } = readings[vertical]!;
      expect(legFailures(scene.base!, scene['dark:wrong-root']!, DARK_LEG), vertical).not.toEqual([]);
    }
  });

  it('palette.dark-mode (static): rottay refuses the dark overlay (registered asymmetry, not a leg)', async () => {
    await expect(mountFlatThemeArm('rottay', written('palette.dark-mode', 'rottay'), 'dark'))
      .rejects.toThrow(/dark is its declared defaultMode/u);
  });

  it('palette.dark-mode (v2): choosing the other mode repaints the canvas; choosing the own mode moves nothing', () => {
    for (const vertical of FIRST_PARTY_VERTICALS) {
      const { document } = readings[vertical]!;
      expect(legFailures(document.base!, document.other!, MODE_LEG), vertical).toEqual([]);
      expect(document.own, `${vertical}: the default mode is a no-op`).toEqual(document.base);
    }
  });

  it('palette.dark-mode (v2): mounted on the static root, the mode choice is invisible (mutant)', () => {
    for (const vertical of FIRST_PARTY_VERTICALS) {
      const { document } = readings[vertical]!;
      expect(
        legFailures(document['wrong-root:base']!, document['wrong-root:other']!, MODE_LEG),
        vertical,
      ).not.toEqual([]);
    }
  });

  it('palette.dark-mode (v2): each arm projects its own root mode; `auto` is preserved for the pre-paint script', async () => {
    for (const vertical of FIRST_PARTY_VERTICALS) {
      const other = await mountDocumentArm(vertical, { ...SEEDS, 'palette.dark-mode': otherMode(vertical) });
      const auto = await mountDocumentArm(vertical, { ...SEEDS, 'palette.dark-mode': 'auto' });
      expect(other.rootAttributes['data-theme'], vertical).toBe(otherMode(vertical));
      expect(other.rootAttributes['data-tenant-theme-mode'], vertical).toBe(otherMode(vertical));
      expect(auto.rootAttributes['data-tenant-theme-mode'], vertical).toBe('auto');
    }
  });
});
