/**
 * The responsive channel sheet is a projection of the channel vocabulary.
 *
 * `channels/index.css` is a shipped stylesheet, so it is authored rather than
 * generated at build time; this test is what makes it a projection and not a
 * second, hand-maintained list. A channel added to the contract without
 * regenerating the sheet would arm an attribute no rule answers -- a responsive
 * prop that silently paints nothing.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

import {
  RESPONSIVE_BREAKPOINTS,
  RESPONSIVE_BREAKPOINT_ORDER,
} from '@/foundation/contracts/kernel/responsive/breakpoints';
import {
  RESPONSIVE_CHANNELS,
  RESPONSIVE_CHANNEL_ATTRIBUTE,
  RESPONSIVE_CHANNEL_PRIORITY_ATTRIBUTE,
  RESPONSIVE_PRIORITY_CHANNELS,
  isPriorityResponsiveChannel,
  responsiveChannelToken,
  responsiveChannelVariable,
} from '@/foundation/contracts/kernel/responsive/channels';

import { buildResponsiveChannelSheet } from './projection';

const SHEET_PATH = join(__dirname, '../channels/index.css');
const sheet = (): string => readFileSync(SHEET_PATH, 'utf8');

describe('responsive channel sheet', () => {
  it('is byte-for-byte the contract projection', () => {
    expect(sheet()).toBe(buildResponsiveChannelSheet());
  });

  it('declares every channel at every step, and nothing else', () => {
    const css = sheet();
    for (const channel of RESPONSIVE_CHANNELS) {
      for (const step of RESPONSIVE_BREAKPOINT_ORDER) {
        const selector = `[${RESPONSIVE_CHANNEL_ATTRIBUTE}~="${responsiveChannelToken(channel, step)}"]`;
        expect(css, `${channel}@${step}`).toContain(selector);
        expect(css).toContain(`${channel}: var(${responsiveChannelVariable(channel, step)});`);
      }
    }
    const declaredSelectors = css.match(/\[data-ds-responsive[a-z-]*~="[^"]+"\]/g) ?? [];
    const expected =
      RESPONSIVE_CHANNELS.length * RESPONSIVE_BREAKPOINT_ORDER.length
      + RESPONSIVE_PRIORITY_CHANNELS.length * RESPONSIVE_BREAKPOINT_ORDER.length;
    expect(declaredSelectors.length).toBe(expected);
  });

  it('carries priority only for the priority vocabulary', () => {
    const css = sheet();
    for (const channel of RESPONSIVE_CHANNELS) {
      const token = responsiveChannelToken(channel, 'xs');
      const selector = `[${RESPONSIVE_CHANNEL_PRIORITY_ATTRIBUTE}~="${token}"]`;
      expect(css.includes(selector), `${channel} priority rule`).toBe(
        isPriorityResponsiveChannel(channel),
      );
    }
  });

  it('spells each threshold as the ladder step it projects, in mobile-first order', () => {
    const preludes = [...sheet().matchAll(/@media \(min-width: (\d+)px\)/g)].map((match) =>
      Number(match[1]),
    );
    const steps = RESPONSIVE_BREAKPOINT_ORDER.filter((step) => step !== 'xs').map(
      (step) => RESPONSIVE_BREAKPOINTS[step],
    );
    expect(preludes).toEqual(steps);
  });

  it('has no xs prelude: the baseline is the unconditional rule', () => {
    expect(sheet()).not.toContain('@media (min-width: 0px)');
  });
});
