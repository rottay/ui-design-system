import React from 'react';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

// ---------------------------------------------------------------------------
// OTPInput real-engine coverage (K4-D Pass 1): the public component resolves
// through the genuine engine factory, and the modern engine's drained
// geometry lives in `modern/skin/otp-input.css` keyed on data-part/data-size/
// data-disabled -- no inline styles remain on any part. The legacy
// OTPInput.test.tsx mocks the component factory outright, so behavior through
// real engines lives here. Mirrors TagInput.real-engines.test.tsx.
// ---------------------------------------------------------------------------

const SKIN = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/otp-input.css'
  ),
  'utf8'
);

/** Comment-stripped copy -- negative pins must not match prose in the header. */
const SKIN_NC = SKIN.replace(/\/\*[\s\S]*?\*\//g, '');

describe('OTPInput real engines', () => {
  it.each(['modern', 'rustic'] as const)(
    'types and completes a code through the real %s engine',
    async (engine) => {
      const { OTPInput } = await import('..');
      const onChange = vi.fn();
      const onComplete = vi.fn();

      renderWithEngine(<OTPInput engine={engine} length={4} onChange={onChange} onComplete={onComplete} />, engine);

      const slot0 = await screen.findByLabelText('Digit 1 of 4');
      fireEvent.change(slot0, { target: { value: '1' } });
      expect(onChange).toHaveBeenCalledWith('1');

      // Paste distributes from the first slot; a full-length paste completes.
      fireEvent.paste(screen.getByLabelText('Digit 2 of 4'), { clipboardData: { getData: () => '1234' } });
      expect(onChange).toHaveBeenCalledWith('1234');
      expect(onComplete).toHaveBeenCalledWith('1234');
    }
  );

  it('modern engine stamps skin-owned anatomy with no inline styles on any part', async () => {
    const { OTPInput } = await import('..');
    const { container } = renderWithEngine(
      <OTPInput engine="modern" length={4} size="lg" value="12" error errorMessage="Required" onChange={() => {}} />,
      'modern'
    );

    const root = (await waitFor(() => {
      const el = container.querySelector('.ds-otp-input.ds-otp-input--modern[data-part="root"]');
      expect(el).not.toBeNull();
      return el;
    })) as HTMLElement;
    expect(root).toHaveAttribute('data-size', 'lg');
    expect(root.getAttribute('style')).toBeNull();

    const slot = container.querySelector('[data-part="slot"]') as HTMLElement;
    expect(slot.getAttribute('style')).toBeNull();
    expect(slot).toHaveAttribute('data-error', 'true');
    expect(slot).toHaveAttribute('data-filled', 'true');

    const errorWrapper = container.querySelector('[data-part="error-wrapper"]') as HTMLElement;
    expect(errorWrapper).not.toBeNull();
    expect(errorWrapper.getAttribute('style')).toBeNull();
    const errorMessage = container.querySelector('[data-part="error-message"]') as HTMLElement;
    expect(errorMessage).toHaveTextContent('Required');
    expect(errorMessage.getAttribute('style')).toBeNull();
  });

  it('modern skin pins: row flex/gap, per-size density-scaled geometry, tokenised monospace', () => {
    expect(/\.ds-otp-input\.ds-otp-input--modern\[data-part='root'\]\s*\{[^}]*display:\s*flex/.test(SKIN)).toBe(true);
    expect(/gap:\s*var\(--ds-otp-slot-gap,\s*8px\)/.test(SKIN)).toBe(true);
    for (const [size, box, font] of [['sm', '36px', '16px'], ['md', '44px', '20px'], ['lg', '52px', '24px']] as const) {
      const re = new RegExp(`\\[data-size='${size}'\\] \\[data-part='slot'\\]\\s*\\{[^}]*var\\(--ds-otp-slot-${size}-size, ${box}\\) \\* var\\(--ds-density-effective-scale\\)`);
      expect(re.test(SKIN), `size ${size} box`).toBe(true);
      expect(new RegExp(`\\[data-size='${size}'\\][^}]*var\\(--ds-otp-slot-${size}-font-size, ${font}\\)`).test(SKIN), `size ${size} font`).toBe(true);
    }
    expect(/\[data-part='slot'\]\s*\{[^}]*font-family:\s*var\(--ds-font-family-mono\)/.test(SKIN)).toBe(true);
    expect(/\[data-part='slot'\]\s*\{[^}]*font-weight:\s*700/.test(SKIN)).toBe(true);
  });

  it('modern skin pins: disabled posture and logical error gap (drained from inline)', () => {
    expect(/\[data-part='root'\]\[data-disabled='true'\] \[data-part='slot'\]\s*\{[^}]*opacity:\s*0\.5/.test(SKIN)).toBe(true);
    expect(/\[data-part='root'\]\[data-disabled='true'\] \[data-part='slot'\]\s*\{[^}]*cursor:\s*not-allowed/.test(SKIN)).toBe(true);
    expect(/\[data-part='root'\] ~ \[data-part='error-wrapper'\]\s*\{[^}]*margin-block-start:\s*var\(--ds-otp-error-gap,\s*4px\)/.test(SKIN)).toBe(true);
    expect(/\[data-part='error-message'\]\s*\{[^}]*font-size:\s*var\(--ds-otp-error-font-size,\s*12px\)/.test(SKIN)).toBe(true);
    // The documented imperative-focus replacement stays intact.
    expect(/\[data-part='slot'\]:focus:not\(\[data-error='true'\]\)/.test(SKIN)).toBe(true);
  });

  it('modern skin pins: slot surface reads the certified --ds-input-bg channel, never the generic bg-input (TMM near-black regression)', () => {
    // The TMM DB projection resolves --ds-input-bg to its light control
    // surface (#FFFEFB) while --ds-color-bg-input resolves near-black
    // (#0F0F12), which put the dark slot value ink at ~1.3:1 (axe serious).
    expect(/background:\s*var\(--ds-otp-slot-bg,\s*var\(--ds-input-bg,\s*var\(--ds-surface-control\)\)\)/.test(SKIN_NC)).toBe(true);
    expect(SKIN_NC).not.toContain('var(--ds-color-bg-input');
  });

  it('modern skin pins: Pass-2 state grammar -- filled border step, focus halo, coarse floor, motion guard', () => {
    // Filled slots read one border step stronger than empty.
    expect(
      /\[data-part='slot'\]\[data-part='slot'\]\[data-filled='true'\]\s*\{[^}]*border-color:\s*var\(--ds-otp-slot-border-filled,\s*var\(--ds-color-border-hover\)\)/.test(SKIN_NC)
    ).toBe(true);
    // Focus shows the Input grammar's halo; error slots halo in the error channel.
    expect(
      /\[data-part='slot'\]:focus\s*\{[^}]*box-shadow:\s*var\(--ds-otp-slot-shadow-focus,\s*var\(--ds-input-shadow-focus,\s*var\(--ds-focus-ring\)\)\)/.test(SKIN_NC)
    ).toBe(true);
    expect(
      /\[data-part='slot'\]:focus\[data-error='true'\]\s*\{[^}]*box-shadow:\s*var\(--ds-input-error-shadow-focus,/.test(SKIN_NC)
    ).toBe(true);
    // Coarse floor: every slot at least 44px under (pointer: coarse).
    const coarse = SKIN_NC.match(/@media \(pointer: coarse\)\s*\{\n([\s\S]*?)\n\}/);
    expect(coarse, 'coarse media block present').not.toBeNull();
    expect(/\[data-part='slot'\]\s*\{[^}]*min-inline-size:\s*var\(--ds-input-touch-target-min\)/.test(coarse![1])).toBe(true);
    expect(/\[data-part='slot'\]\s*\{[^}]*min-block-size:\s*var\(--ds-input-touch-target-min\)/.test(coarse![1])).toBe(true);
    expect(SKIN_NC).not.toContain('var(--ds-input-touch-target-min, 44px)');
    // Motion honoured.
    const rm = SKIN_NC.match(/@media \(prefers-reduced-motion: reduce\)\s*\{\n([\s\S]*?)\n\}/);
    expect(rm).not.toBeNull();
    expect(/\[data-part='slot'\]/.test(rm![1])).toBe(true);
  });

  it('modern skin pins: error ink follows the CONTRAST LAW (axe color-contrast/serious regression)', () => {
    // 12px error text on a governed-source page surface must reach 4.5:1;
    // the raw error channel measured 4.25:1 on bithire's #F4F8FB canvas, so
    // the skin deepens it 30% toward the source's own text-primary with a
    // raw escape hatch -- the K3-A idiom.
    expect(/--ds-otp-error-ink/.test(SKIN)).toBe(true);
    expect(
      /color:\s*var\(\s*--ds-otp-error-ink,\s*color-mix\(\s*in srgb,\s*var\(--ds-color-error\) 70%,\s*var\(--ds-color-text-primary\) 30%\s*\)\s*\)/.test(SKIN)
    ).toBe(true);
    // The semantic channel itself is not repainted for non-text uses.
    expect(/\[data-part='slot'\]\[data-part='slot'\]\[data-error='true'\]\s*\{\s*border:\s*1px solid var\(--ds-color-error\)/.test(SKIN)).toBe(true);
  });
});
