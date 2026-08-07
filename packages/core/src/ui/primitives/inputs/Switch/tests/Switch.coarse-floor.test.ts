import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  resolve(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/switch.css'
  ),
  'utf8'
);

// 44px coarse-pointer floor on BOTH axes. The channel chains to `--ds-touch-target-min`
// with a PHYSICAL 44px fallback: the fluid root erodes a rem floor at narrow widths.
const FLOOR_CHAIN =
  /var\(\s*--ds-switch-touch-target-min\s*,\s*var\(\s*--ds-touch-target-min\s*,\s*44px\s*\)\s*\)/;

describe('Switch modern skin: 44px touch floor', () => {
  it('carries an unconditional physical-pixel block floor on the root row', () => {
    const rootRule = SKIN.match(
      /\.ds-switch\.ds-switch--modern\[data-part='root'\] \{[^}]*\}/
    );
    expect(rootRule).not.toBeNull();
    expect(rootRule![0]).toMatch(
      new RegExp(`min-block-size:\\s*${FLOOR_CHAIN.source}`)
    );
  });

  it('re-asserts the floor on BOTH axes under coarse pointers', () => {
    const coarse = SKIN.match(/@media \(pointer: coarse\) \{([\s\S]*?)\n\}/);
    expect(coarse).not.toBeNull();
    expect(coarse![0]).toContain(
      ".ds-switch.ds-switch--modern[data-part='root'] {"
    );
    expect(coarse![0]).toMatch(
      new RegExp(`min-block-size:\\s*${FLOOR_CHAIN.source}`)
    );
    // The missing axis: a track-only switch is ~28-44px wide, under the floor.
    expect(coarse![0]).toContain(
      ".ds-switch.ds-switch--modern[data-part='root'][data-standalone='true'] {"
    );
    expect(coarse![0]).toMatch(
      new RegExp(`min-inline-size:\\s*${FLOOR_CHAIN.source}`)
    );
  });

  it('never lets a rem length back into the floor channel', () => {
    expect(SKIN).not.toContain('--ds-switch-touch-target-min, 2.75rem');
    expect(SKIN).toMatch(FLOOR_CHAIN);
    expect(SKIN).not.toMatch(/var\(\s*--ds-touch-target-min\s*,\s*[\d.]+rem\s*\)/);
  });
});
