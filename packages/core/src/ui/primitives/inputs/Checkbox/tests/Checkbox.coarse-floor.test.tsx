import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  resolve(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/checkbox.css'
  ),
  'utf8'
);

/**
 * 44px coarse-pointer floor for the single Checkbox root row (states spec
 * finding: the labeled single measured 41.25px on the live bundle).
 *
 * Root cause of that measurement: the DS fluid root font-size resolves to
 * 15px at narrow widths, so a `2.75rem` floor erodes to 41.25px exactly where
 * the floor matters. The 44px touch law (WCAG 2.5.8 / platform) is PHYSICAL,
 * so the channel fallback is `44px`, never a rem length. The mechanism is
 * unconditional on the labeled root row and re-asserted under
 * `@media (pointer: coarse)` including the standalone indicator geometry.
 */
/**
 * C2c law: the family touch channel now chains to the single canonical
 * `--ds-touch-target-min`, so the physical 44px is that channel's fallback
 * rather than the family's. Pinned as a chain, whitespace-tolerant, so
 * reformatting cannot break it and a reverted reroute cannot pass it.
 */
const FLOOR_CHAIN =
  /var\(\s*--ds-checkbox-touch-target-min\s*,\s*var\(\s*--ds-touch-target-min\s*,\s*44px\s*\)\s*\)/;

describe('Checkbox modern skin: 44px touch floor (R0/states spec)', () => {
  it('carries an unconditional physical-pixel floor on the labeled root row', () => {
    const rootRule = SKIN.match(
      /\.ds-checkbox\.ds-checkbox--modern\[data-part='root'\] \{[^}]*\}/
    );
    expect(rootRule).not.toBeNull();
    expect(rootRule![0]).toMatch(
      new RegExp(`min-block-size:\\s*${FLOOR_CHAIN.source}`)
    );
    // The labeled single keeps the floor: only the standalone (indicator-only)
    // root is allowed to collapse, and only outside coarse pointers.
    const standaloneRule = SKIN.match(
      /\.ds-checkbox\.ds-checkbox--modern\[data-part='root'\]\[data-standalone='true'\] \{[^}]*\}/
    );
    expect(standaloneRule).not.toBeNull();
    expect(standaloneRule![0]).toContain('min-block-size: 0;');
  });

  it('re-asserts the physical floor under coarse pointers, standalone included', () => {
    const coarse = SKIN.match(/@media \(pointer: coarse\) \{([\s\S]*?)\n\}/);
    expect(coarse).not.toBeNull();
    expect(coarse![0]).toContain(
      ".ds-checkbox.ds-checkbox--modern[data-part='root'] {"
    );
    expect(coarse![0]).toMatch(
      new RegExp(`min-block-size:\\s*${FLOOR_CHAIN.source}`)
    );
    expect(coarse![0]).toContain(
      ".ds-checkbox.ds-checkbox--modern[data-part='root'][data-standalone='true'] {"
    );
    expect(coarse![0]).toMatch(
      new RegExp(`min-inline-size:\\s*${FLOOR_CHAIN.source}`)
    );
  });

  it('never lets a rem length back into the floor channel', () => {
    // 2.75rem == 44px ONLY at a 16px root; the fluid root drops to 15px at
    // narrow widths (measured: 41.25px on the live bundle), so any rem floor
    // silently breaks the law. The fallback must stay a physical 44px.
    expect(SKIN).not.toContain('--ds-checkbox-touch-target-min, 2.75rem');
    expect(SKIN).toMatch(FLOOR_CHAIN);
    // The reroute moved the terminal fallback one link down, so the rem must
    // be barred at the CANONICAL channel too -- otherwise the law could be
    // broken at the very place it is now enforced.
    expect(SKIN).not.toMatch(/var\(\s*--ds-touch-target-min\s*,\s*[\d.]+rem\s*\)/);
  });
});
