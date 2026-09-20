/**
 * Per-family dial reach for the milestone-B motion lot.
 *
 * Every family whose skin binds an intent duration is mounted on the axis
 * instrument's own scene -- the rule's descendant chain collapsed onto one bare
 * node -- and measured under a base arm and a `motion.dial` arm. The family
 * reaches the dial when its own `transition-duration`/`animation-duration`
 * moves; the bare control beside it must not, which is the negative control a
 * palette-only document relies on.
 */
import { beforeAll, describe, expect, it } from 'vitest';

import { measureArms } from '@tests/support/family-causality';
import { motionSites } from './roster';

const sites = motionSites();

/**
 * The roster is READ FROM SOURCE, so a site that loses its intent read simply
 * stops being listed and every remaining assertion still passes. These floors
 * are what makes that visible: they are the milestone-B motion lot's measured
 * population, and they are decrease-only by review, never by a silent edit.
 */
const PINNED_SITES = 406;
const PINNED_FAMILIES = 158;
const CONTROL = '<div id="control">Bare control node</div>';

/**
 * Families whose skin DOES bind an intent duration but whose probe element is
 * painted by a declaration from another owner, measured here and named with the
 * owner that outranks it. Each one is outside this lot's write set (the skins);
 * none is a waiver, because a family that starts moving fails this list.
 */
const OUTRANKED: Readonly<Record<string, string>> = {
  compare: '--ds-skeleton-animation-duration: 1.5s (foundation/themes/default) defines the channel, so the skin fallback to --ds-motion-attention is dead',
  'kanban-surface': '--ds-skeleton-animation-duration: 1.5s (foundation/themes/default)',
  'operational-surface': '--ds-skeleton-animation-duration: 1.5s (foundation/themes/default)',
  report: '--ds-skeleton-animation-duration: 1.5s (foundation/themes/default)',
  'scheduler-surface': '--ds-skeleton-animation-duration: 1.5s (foundation/themes/default)',
  search: '--ds-skeleton-animation-duration: 1.5s (foundation/themes/default)',
  visualization: '--ds-skeleton-animation-duration: 1.5s (foundation/themes/default)',
  'menu-compounds': "runtime/personality's `[data-engine] .ds-menu-item` wins with --ds-personality-animation-entrance-duration",
  'markdown-view': "the frozen classic theme's `html[data-tenant] a` wins with --ds-transition-fast",
};

/** True when at least one transition/animation layer carries real time. */
function painted(reading: string | undefined): boolean {
  if (!reading) return false;
  return reading.split(',').some((layer) => Number.parseFloat(layer) > 0);
}

const markup = [
  CONTROL,
  ...sites.map((site, index) => `<div id="scene-${index}">${site.markup}</div>`),
].join('');

const targets = [
  { id: 'control', selector: '#control', property: 'transition-duration' },
  ...sites.map((site, index) => ({
    id: site.id,
    selector: `#scene-${index} [data-probe-subject]`,
    property: site.property,
  })),
];

describe('motion dial reach, family by family', () => {
  let base: Record<string, string>;
  let slower: Record<string, string>;

  beforeAll(async () => {
    // 1.35 is the top of the rottay envelope for `motionDurationScale`; an arm
    // above it is refused at ingestion rather than measured.
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {}, slower: { 'motion.dial': { durationScale: 1.35 } } },
      targets,
    });
    base = readings.base!;
    slower = readings.slower!;
  }, 240_000);

  it('paints a duration on every family it measured', () => {
    expect(sites.length).toBeGreaterThan(0);
    // Non-vacuity: every scene resolved to a node and painted a duration.
    // A scene the cascade never reached reads the `0s` initial value, in every
    // layer, so a non-zero layer is the floor this sweep must clear.
    const silent = sites.filter((site) => !painted(base[site.id]));
    expect(silent.map((site) => `${site.family} (${site.selector})`)).toEqual([]);
    expect(sites.length).toBeGreaterThanOrEqual(PINNED_SITES);
    expect(new Set(sites.map((site) => site.family)).size).toBeGreaterThanOrEqual(PINNED_FAMILIES);
  });

  it('moves every family whose own skin paints it', () => {
    const stuck = sites
      .filter((site) => slower[site.id] === base[site.id])
      .filter((site) => !(site.family in OUTRANKED));
    expect(stuck.map((site) => `${site.family} (${site.selector}): ${base[site.id]}`)).toEqual([]);
  });

  it('keeps the outranked registry exact: every entry still fails to move', () => {
    const measured = [...new Set(sites.map((site) => site.family))].filter((family) => family in OUTRANKED);
    const moved = measured.filter((family) =>
      sites.filter((site) => site.family === family).every((site) => slower[site.id] !== base[site.id]),
    );
    // Good news fails closed: a family that started moving must leave the list.
    expect(moved).toEqual([]);
    expect(measured.sort()).toEqual(Object.keys(OUTRANKED).sort());
  });

  it('leaves a node with no skin of its own alone', () => {
    expect(slower.control).toBe(base.control);
    expect(base.control).toBe('0s');
  });
});
