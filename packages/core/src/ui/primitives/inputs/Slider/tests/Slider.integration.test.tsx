import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

describe('Slider integration', () => {
  it.each(['modern', 'rustic'] as const)(
    'changes single values in the %s engine',
    async (engine) => {
      const { Slider } = await import('..');
      const onChange = vi.fn();
      const onChangeComplete = vi.fn();

      // Engine selection rides the helper's provider (forceEngine); the public
      // SliderProps contract has no `engine` prop.
      renderWithEngine(
        <Slider min={0} max={100} defaultValue={25} onChange={onChange} onChangeComplete={onChangeComplete} />,
        engine
      );

      const slider = (await screen.findAllByRole('slider'))[0];
      fireEvent.change(slider, { target: { value: '40' } });
      fireEvent.mouseUp(slider);

      expect(onChange).toHaveBeenCalledWith(40);
      expect(onChangeComplete).toHaveBeenCalled();
    }
  );

  it.each(['modern', 'rustic'] as const)(
    'supports range mode in the %s engine',
    async (engine) => {
      const { Slider } = await import('..');
      const onChange = vi.fn();

      renderWithEngine(
        <Slider range min={0} max={100} defaultValue={[20, 80]} onChange={onChange} />,
        engine
      );

      const sliders = await screen.findAllByRole('slider');
      expect(sliders).toHaveLength(2);

      fireEvent.change(sliders[0], { target: { value: '30' } });
      expect(onChange).toHaveBeenCalledWith([30, 80]);
    }
  );

  it('modern engine stamps skin-owned native-input anatomy with no Daisy classes', async () => {
    const { Slider } = await import('..');
    const { container } = renderWithEngine(
      <Slider min={0} max={100} defaultValue={40} />,
      'modern'
    );

    const root = container.querySelector('[data-part="root"]');
    expect(root).not.toBeNull();
    expect(root).toHaveAttribute('data-orientation', 'horizontal');

    const nativeInput = container.querySelector('input[data-part="native-input"]');
    expect(nativeInput).not.toBeNull();
    // Daisy drain: no `range`/`range-primary` class tokens anywhere in the subtree.
    const classTokens = (container.innerHTML.match(/class="[^"]*"/g) ?? []).join(' ');
    expect(classTokens).not.toMatch(/\brange\b/);
    expect(classTokens).not.toMatch(/\brange-primary\b/);
    // axe `label` (critical): the native input has an accessible name.
    expect(nativeInput).toHaveAttribute('aria-label', 'Slider');
  });

  it('modern engine single mode stamps the runtime fill hatch (K2-V sweep)', async () => {
    const { Slider } = await import('..');
    const { container } = renderWithEngine(
      <Slider min={0} max={100} defaultValue={40} />,
      'modern'
    );

    // The ONLY inline style on the visible native input is the documented
    // runtime fill channel the skin's runnable-track gradient reads (the
    // Upload --ds-upload-dropzone-height precedent: runtime value, skin paint).
    const nativeInput = container.querySelector('input[data-part="native-input"]');
    expect(nativeInput).not.toBeNull();
    const style = (nativeInput as HTMLElement).style;
    expect(style.getPropertyValue('--ds-slider-single-percent')).toBe('40%');
    expect(nativeInput?.getAttribute('style')?.replace(/\s/g, '')).toBe(
      '--ds-slider-single-percent:40%;'
    );
  });

  it('modern engine positions horizontal overlays logically (insetInlineStart, K2-V sweep)', async () => {
    const { Slider } = await import('..');
    const { container } = renderWithEngine(
      <Slider range min={0} max={100} defaultValue={[20, 80]} marks={{ 0: '0', 100: '100' }} />,
      'modern'
    );

    // Chromium flips the native range scale under dir=rtl; the custom overlay
    // grammar (track, handles, marks) must follow the inline axis instead of
    // physical `left` (sighted AR defect: mark "0" at the scale's max end).
    const track = container.querySelector('[data-part="track"]') as HTMLElement;
    expect(track.style.insetInlineStart).toBe('20%');
    expect(track.getAttribute('style')).not.toContain('left:');

    const handles = container.querySelectorAll('[data-part="handle"]');
    expect(handles).toHaveLength(2);
    expect((handles[0] as HTMLElement).style.insetInlineStart).toBe('20%');
    expect((handles[1] as HTMLElement).style.insetInlineStart).toBe('80%');

    const marks = container.querySelectorAll('[data-part="mark-label"]');
    expect(marks).toHaveLength(2);
    expect((marks[0] as HTMLElement).style.insetInlineStart).toBe('0%');
    expect((marks[1] as HTMLElement).style.insetInlineStart).toBe('100%');
  });

  it('modern engine positions single-mode marks logically (insetInlineStart, K2-V sweep)', async () => {
    const { Slider } = await import('..');
    const { container } = renderWithEngine(
      <Slider min={0} max={100} defaultValue={40} marks={{ 50: '50' }} />,
      'modern'
    );

    const mark = container.querySelector('[data-part="mark-label"]') as HTMLElement;
    expect(mark).not.toBeNull();
    expect(mark.style.insetInlineStart).toBe('50%');
    expect(mark.getAttribute('style')).not.toContain('left:');
  });

  it('modern engine range mode stamps overlay native inputs without inline styles', async () => {
    const { Slider } = await import('..');
    const { container } = renderWithEngine(
      <Slider range min={0} max={100} defaultValue={[20, 80]} />,
      'modern'
    );

    const overlays = container.querySelectorAll('input[data-part="native-input"][data-variant="overlay"]');
    expect(overlays).toHaveLength(2);
    overlays.forEach((input) => {
      expect(input.getAttribute('style')).toBeNull();
    });
    // Per-handle accessible names (axe `label` critical on bare range inputs).
    expect(overlays[0]).toHaveAttribute('aria-label', 'Minimum value');
    expect(overlays[1]).toHaveAttribute('aria-label', 'Maximum value');
  });

  it('modern engine range mode pairs each overlay input with an adjacent handle', async () => {
    const { Slider } = await import('..');
    const { container } = renderWithEngine(
      <Slider range min={0} max={100} defaultValue={[20, 80]} />,
      'modern'
    );

    // The skin paints the keyboard ring via `input:focus-visible + handle`;
    // that only works when each handle is the adjacent next sibling of its
    // (invisible) overlay input.
    const overlays = container.querySelectorAll('input[data-variant="overlay"]');
    expect(overlays).toHaveLength(2);
    overlays.forEach((input) => {
      const next = input.nextElementSibling;
      expect(next?.getAttribute('data-part')).toBe('handle');
    });
  });

  it.each(['modern', 'rustic'] as const)(
    'renders marks and vertical mode in the %s engine',
    async (engine) => {
      const { Slider } = await import('..');

      renderWithEngine(
        <Slider
          vertical
          marks={{ 0: 'Low', 100: 'High' }}
          defaultValue={50}
          style={{ height: 240 }}
        />,
        engine
      );

      await screen.findByText('Low');
      expect(screen.getByText('High')).toBeInTheDocument();
    }
  );
});
