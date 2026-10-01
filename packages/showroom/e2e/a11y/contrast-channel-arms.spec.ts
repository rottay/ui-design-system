import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-INV-03 Lot B — the increased-contrast floor, proven per channel per
// vertical by a real media emulation.
//
// The floor is an UNLAYERED root guard, `html[data-engine='modern'][data-theme]`
// at (0,2,1), which beats the tenant artifact's (0,1,1). Eight of its eleven
// channels are artifact-declared in all three verticals, so a hand-injected
// `:root` block would lose to the artifact and read as "nothing moved" — the
// arm here is `page.emulateMedia({ contrast })`, not an injected block.
//
// NOT YET RUN. It is written against the DT's browser slot and is skipped
// unless DS_CONTRAST_ARMS=1 is set, so landing it cannot red the CI a11y job
// before it has been measured once:
//   DS_CONTRAST_ARMS=1 npx playwright test e2e/a11y/contrast-channel-arms.spec.ts
// Budget: 3 verticals x 1 page, two arms read back to back = 6 loads.
// ---------------------------------------------------------------------------

const VERTICALS = ['bithire', 'evnto', 'rottay'] as const;

/** The pinned table of `foundation/a11y/contrast/index.css`, floor values. */
const PINNED: Record<string, string> = {
  '--ds-focus-ring-width': '3px',
  '--ds-focus-ring-offset': '3px',
  '--ds-edge-hairline-width': '2px',
  '--ds-edge-standard-width': '2px',
  '--ds-edge-emphasis-width': '2px',
  '--ds-breadcrumb-separator-opacity': '1',
  '--ds-stack-divider-opacity': '1',
  '--ds-toolbar-divider-opacity': '1',
  '--ds-border-width-2': '3px',
  '--ds-avatar-focus-ring-width': '3px',
  '--ds-avatar-focus-ring-offset': '3px',
};

const CHANNELS = Object.keys(PINNED);
/**
 * Channels a vertical already rests at the floor for (WO-EVI-02: bithire's
 * emphasis is 2px at rest). They must still READ the floor; they cannot move.
 */
const RESTS_AT_THE_FLOOR: Record<string, readonly string[]> = {
  '--ds-edge-emphasis-width': ['bithire'],
};
/** Non-vacuity: a run that measures less than this proves nothing. */
const MINIMUM_CHANNELS = 9;

test.skip(
  !process.env.DS_CONTRAST_ARMS,
  'browser slot: set DS_CONTRAST_ARMS=1 to run the contrast arms',
);

test.describe('increased-contrast floor — channel arms', () => {
  for (const vertical of VERTICALS) {
    test(`${vertical}: every pinned channel moves under prefers-contrast: more`, async ({
      page,
    }) => {
      await page.goto(`/probe/engine-modern?tenant=${vertical}&slug=button`);

      // Without the governed bag on <html> the tenant artifact never applies
      // and a guard-scale change reads as byte-equal. Assert, then measure.
      const root = page.locator('html');
      await expect(root).toHaveAttribute('data-tenant', vertical);
      await expect(root).toHaveAttribute('data-engine', 'modern');
      await expect(root).toHaveAttribute('data-theme', /light|dark/);

      // A transition mid-flight serializes as an interpolated value and reads
      // as a no-op.
      await page.addStyleTag({
        content: 'html { transition: none !important; }',
      });

      const readAll = () =>
        page.evaluate((channels: string[]) => {
          const computed = getComputedStyle(document.documentElement);
          return Object.fromEntries(
            channels.map((channel) => [channel, computed.getPropertyValue(channel).trim()]),
          ) as Record<string, string>;
        }, CHANNELS);

      // Back to back in ONE page: the tree moves under a saved baseline.
      await page.emulateMedia({ contrast: 'no-preference' });
      const resting = await readAll();
      await page.emulateMedia({ contrast: 'more' });
      const raised = await readAll();

      const measured = CHANNELS.filter((channel) => resting[channel] !== '');
      expect(
        measured.length,
        `${vertical} resolved only ${measured.length} of ${CHANNELS.length} channels at rest`,
      ).toBeGreaterThanOrEqual(MINIMUM_CHANNELS);

      const moved = CHANNELS.filter((channel) => resting[channel] !== raised[channel]);
      expect(moved.length, `${vertical} moved no channel at all`).toBeGreaterThanOrEqual(
        MINIMUM_CHANNELS,
      );

      for (const channel of CHANNELS) {
        expect(raised[channel], `${channel} does not reach the floor in ${vertical}`).toBe(
          PINNED[channel],
        );
        if (RESTS_AT_THE_FLOOR[channel]?.includes(vertical)) continue;
        expect(resting[channel], `${channel} already sits at the floor in ${vertical}`).not.toBe(
          raised[channel],
        );
      }

      await page.emulateMedia({ contrast: null });
    });
  }
});
