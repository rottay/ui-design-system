/**
 * Slider modern skin -- channel guards (K2-V sweep regression pins).
 *
 * Sighted on the :7001 sweep (captures/pass1): the single-mode rail rode
 * `--ds-surface-panel` (~1.05:1 against the page background in both governed
 * sources -> a floating thumb dot), the range mode ignored `disabled`, and
 * the handle `:active` rule double-shifted on press because Tailwind v4
 * centers through the `translate` PROPERTY. These pins guard the channels
 * that fixed each defect.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const skin = readFileSync(
  resolve(HERE, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/slider.css'),
  'utf8',
);

const RAIL_CHANNEL =
  'var(--ds-slider-rail-bg, color-mix(in srgb, var(--ds-color-text-primary) 12%, transparent))';

describe('Slider modern skin rail + fill channels (K2-V sweep)', () => {
  it('paints the range rail through the --ds-slider-rail-bg channel', () => {
    expect(skin).toContain(`[data-part='rail'] {\n  background: ${RAIL_CHANNEL};`);
  });

  it('paints the single-mode fill as a gradient keyed on the runtime percent hatch', () => {
    expect(skin).toContain('var(--ds-color-primary) 0 var(--ds-slider-single-percent, 0%)');
    // RTL mirror: the fill grows from the inline-start (right) under dir=rtl.
    expect(skin).toContain(":dir(rtl)::-webkit-slider-runnable-track");
    expect(skin).toContain('to left,');
  });

  it('mirrors the fill in Gecko via ::-moz-range-progress (primary, not rail)', () => {
    expect(skin).toContain('::-moz-range-progress');
    expect(skin).not.toContain(
      '::-moz-range-progress {\n  block-size: var(--ds-slider-track-size, 4px);\n  border-radius: 9999px;\n  background: var(--ds-surface-panel);'
    );
  });

  it('never paints a rail with the near-invisible --ds-surface-panel again', () => {
    expect(skin).not.toContain('background: var(--ds-surface-panel);');
  });
});

describe('Slider modern skin state postures (K2-V sweep)', () => {
  it('mutes the range-mode custom parts when the root is disabled', () => {
    expect(skin).toContain("[data-disabled='true'] [data-part='rail']");
    expect(skin).toContain("[data-disabled='true'] [data-part='track']");
    expect(skin).toContain("[data-disabled='true'] [data-part='handle']");
    expect(skin).toContain('opacity: var(--ds-disabled-opacity, 0.5);');
  });

  it('keeps the handle :active to a bare scale (no double translate)', () => {
    expect(skin).toContain('transform: scale(0.94);');
    expect(skin).not.toContain('transform: translateX(-50%) translateY(-50%) scale(0.94);');
  });

  it('mirrors RTL centering for handles and mark labels', () => {
    expect(skin).toContain("[data-part='handle']:dir(rtl) {\n  --tw-translate-x: 50%;");
    expect(skin).toContain("[data-part='mark-label'][data-axis='x']:dir(rtl) {\n  transform: translateX(50%);");
  });
});
