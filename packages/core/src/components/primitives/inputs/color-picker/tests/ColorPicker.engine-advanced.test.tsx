import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ColorPicker as ModernColorPicker } from '../engines/modern';
import { ColorPicker as RusticColorPicker } from '../engines/rustic';
import { renderWithEngine } from '@tests/support/engine';

const presetGroups = [
  { label: 'Brand', colors: ['#111111', '#222222'] },
  { label: 'Accent', colors: ['#abcdef'] },
];

describe('ColorPicker runtime engine coverage', () => {
  afterEach(() => {
    cleanup();
  });

  it('covers modern engine click and hover triggers, custom text, presets, clear, and outside click', async () => {
    const handleChange = vi.fn();
    const handleOpenChange = vi.fn();

    const { rerender, container } = render(
      <ModernColorPicker
        defaultValue="#123456"
        format="rgb"
        showText={(color) => `picked:${color.toHexString()}`}
        presets={presetGroups}
        allowClear
        onChange={handleChange}
        onOpenChange={handleOpenChange}
        placement="topLeft"
      />
    );

    expect(screen.getByText('picked:#123456')).toBeInTheDocument();

    fireEvent.click(screen.getByText('picked:#123456'));
    expect(handleOpenChange).toHaveBeenCalledWith(true);

    rerender(
      <ModernColorPicker
        open
        defaultValue="#123456"
        format="rgb"
        showText
        presets={presetGroups}
        allowClear
        onChange={handleChange}
        onOpenChange={handleOpenChange}
        placement="topLeft"
      />
    );

    const colorInput = document.querySelector('input[type="color"]') as HTMLInputElement | null;
    if (!(colorInput instanceof HTMLInputElement)) {
      throw new Error('Expected modern color input');
    }

    fireEvent.change(colorInput, { target: { value: '#654321' } });
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        toHexString: expect.any(Function),
        toRgbString: expect.any(Function),
      }),
      '#654321'
    );

    const hexInput = screen.getByPlaceholderText('#000000');
    fireEvent.change(hexInput, { target: { value: '#333333' } });
    fireEvent.blur(hexInput);
    expect(handleChange).toHaveBeenCalledWith(expect.any(Object), '#333333');

    // The panel is portaled: its buttons live in `#rottay-portal-root`, and
    // the first one is still the first PRESET swatch (the format switcher is
    // a `<select>`, the trigger stays a div).
    const panel = document.querySelector('[data-part="dropdown"]') as HTMLElement;
    fireEvent.click(panel.querySelectorAll('button')[0] as HTMLButtonElement);
    expect(handleChange).toHaveBeenCalledWith(expect.any(Object), '#111111');

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(handleChange).toHaveBeenCalledWith(expect.any(Object), '');
    expect(handleOpenChange).toHaveBeenCalledWith(false);

    fireEvent.mouseDown(document.body);
    expect(handleOpenChange).toHaveBeenCalledWith(false);

    rerender(<ModernColorPicker trigger="hover" onOpenChange={handleOpenChange} />);

    const trigger = container.firstElementChild as HTMLElement | null;
    if (!(trigger instanceof HTMLElement)) {
      throw new Error('Expected modern trigger container');
    }
    fireEvent.mouseEnter(trigger);
    fireEvent.mouseLeave(trigger);
    expect(handleOpenChange).toHaveBeenCalledWith(true);
    expect(handleOpenChange).toHaveBeenCalledWith(false);

    rerender(<ModernColorPicker disabled trigger="click" onOpenChange={handleOpenChange} />);
    const trueCallsBeforeDisabledClick = handleOpenChange.mock.calls.filter(([value]) => value === true).length;
    fireEvent.click(trigger);
    expect(handleOpenChange.mock.calls.filter(([value]) => value === true).length).toBe(trueCallsBeforeDisabledClick);
  });

  it('resolves the token-backed default against the provider-owned root (K4-C modern)', async () => {
    // No defaultValue: the engine defaults to var(--ds-color-primary). The
    // swatch consumes the var() natively; the value resolves to #rrggbb once
    // the provider paint is readable (var supplied on the root inline style,
    // the happy-dom-compatible form of the QRCode provider test).
    const { container, unmount } = render(
      <ModernColorPicker
        showText
        style={{ '--ds-color-primary': '#2a7d4f' } as React.CSSProperties}
      />,
    );

    const swatch = container.querySelector('[data-part="swatch"]') as HTMLElement;
    expect(swatch).not.toBeNull();

    await waitFor(() => {
      expect(swatch.style.getPropertyValue('--ds-colorpicker-swatch-color')).toBe('#2a7d4f');
    });
    expect(screen.getByText('#2a7d4f')).toBeInTheDocument();
    unmount();

    // Unresolvable token: the swatch keeps the var() and never invents a color.
    const { container: bareContainer } = render(<ModernColorPicker />);
    const bareSwatch = bareContainer.querySelector('[data-part="swatch"]') as HTMLElement;
    expect(bareSwatch.style.getPropertyValue('--ds-colorpicker-swatch-color')).toBe(
      'var(--ds-color-primary)',
    );
  });

  it('normalizes rgb() resolutions to #rrggbb for the native input (K4-C Pass-2 live finding)', async () => {
    // Chromium serializes computed color custom properties as `rgb(r, g, b)`,
    // which the native <input type="color"> cannot consume. Simulate that
    // serialization path by resolving through an rgb() intermediate var chain.
    const { container } = render(
      <ModernColorPicker
        showText
        style={{ '--ds-color-primary': 'rgb(42, 125, 79)' } as React.CSSProperties}
      />,
    );
    const swatch = container.querySelector('[data-part="swatch"]') as HTMLElement;
    await waitFor(() => {
      expect(swatch.style.getPropertyValue('--ds-colorpicker-swatch-color')).toBe('#2a7d4f');
    });
    expect(screen.getByText('#2a7d4f')).toBeInTheDocument();
  });

  it('places the modern dropdown above the trigger for top placements', () => {
    const { container } = render(<ModernColorPicker open placement="topLeft" />);
    // The panel is PORTALED (WO-CAN-05): it renders through the overlay
    // kernel into `#rottay-portal-root`, so it is a sibling of the render
    // container. `data-placement` survives as the declared preference the
    // kernel positions from; the panel itself carries no placement utility.
    const dropdown = document.querySelector('[data-part="dropdown"]') as HTMLElement;
    expect(dropdown).not.toBeNull();
    expect(container.contains(dropdown)).toBe(false);
    expect(dropdown.closest('#rottay-portal-root')).not.toBeNull();
    expect(dropdown).toHaveAttribute('data-placement', 'topLeft');
    expect(dropdown.className).not.toContain('bottom-full');
    expect(dropdown.style.position).toBe('fixed');
  });

  it('rides the tenant mono channel on the hex input via the skin, not a Tailwind utility (K4-C Pass-2 live finding)', () => {
    const skin = readFileSync(
      resolve(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/color-picker/index.css'),
      'utf8',
    );
    expect(skin).toContain('font-family: var(--ds-font-family-mono);');
    // The engine no longer relies on the shadowed Tailwind font-mono utility.
    render(<ModernColorPicker open />);
    const hex = document.querySelector('[data-part="hex-input"]') as HTMLElement;
    expect(hex.className).not.toContain('font-mono');
  });

  it('keeps the dropdown inside the viewport when it would overflow the inline-end', () => {
    // The private `data-edge` pass is gone: viewport collision is the overlay
    // kernel's measured branch, which clamps the panel inside an 8px margin
    // on BOTH axes instead of only end-aligning on the inline one. The law is
    // the same and now stated as the geometry it actually produces.
    const original = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
      return {
        x: 0, y: 0, top: 0, left: 0, bottom: 100,
        right: window.innerWidth + 24,
        width: 200, height: 100,
        toJSON: () => ({}),
      } as DOMRect;
    };
    try {
      render(<ModernColorPicker open />);
      const dropdown = document.querySelector('[data-part="dropdown"]') as HTMLElement;
      expect(dropdown).not.toBeNull();
      expect(dropdown.style.position).toBe('fixed');

      const left = Number.parseFloat(dropdown.style.left);
      expect(Number.isNaN(left)).toBe(false);
      // Clamped inside the viewport: never past the inline-end edge, never
      // before the inline-start margin.
      expect(left).toBeGreaterThanOrEqual(8);
      expect(left + 200).toBeLessThanOrEqual(window.innerWidth - 8);

      // The retired edge mechanism leaves nothing behind, in the DOM or the skin.
      expect(dropdown.hasAttribute('data-edge')).toBe(false);
      const skin = readFileSync(
        resolve(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/color-picker/index.css'),
        'utf8',
      );
      expect(skin).not.toContain("[data-part='dropdown'][data-edge='end']");
      expect(skin).not.toContain('inset-inline-end: 0');
      // Nor does the skin keep a position that would fight the kernel's.
      expect(/\[data-part='dropdown'\][^{]*\{[^}]*position:\s*absolute/.test(skin)).toBe(false);
    } finally {
      Element.prototype.getBoundingClientRect = original;
    }
  });

  it('renders the Clear fallback with a provider mounted and catalog keys absent (i18n echo guard, K4-C)', () => {
    // The suites above render WITHOUT a provider (no-provider fallback path).
    // With a provider mounted but the key still absent from the catalog, the
    // missing key echoes the raw key back and the endsWith guard falls back.
    renderWithEngine(<ModernColorPicker open allowClear />, 'modern');
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });

  it('names the native input, hex input, and preset swatches (K4-C axe remediation)', () => {
    // No provider: documented English fallbacks.
    render(<ModernColorPicker open allowClear presets={presetGroups} />);
    expect(screen.getByLabelText('Choose color')).toBeInTheDocument();
    expect(screen.getByLabelText('Hex color')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select color #111111' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select color #222222' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select color #abcdef' })).toBeInTheDocument();
  });

  it('renders label fallbacks with a provider mounted and catalog keys absent (echo guard)', () => {
    renderWithEngine(<ModernColorPicker open allowClear presets={presetGroups} />, 'modern');
    expect(screen.getByLabelText('Choose color')).toBeInTheDocument();
    expect(screen.getByLabelText('Hex color')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select color #111111' })).toBeInTheDocument();
  });

  it('covers rustic engine portal open/close, hover trigger, controlled values, clear branch, and disabled guards', async () => {
    const handleChange = vi.fn();
    const handleOpenChange = vi.fn();

    const { rerender, container } = render(
      <RusticColorPicker
        defaultValue="#112233"
        showText={(color) => `rustic:${color.toHexString()}`}
        presets={presetGroups}
        allowClear
        onChange={handleChange}
        onOpenChange={handleOpenChange}
      />
    );

    expect(screen.getByText('rustic:#112233')).toBeInTheDocument();

    fireEvent.click(screen.getByText('rustic:#112233'));
    expect(handleOpenChange).toHaveBeenCalledWith(true);

    rerender(
      <RusticColorPicker
        open
        value={{ toHexString: () => '#445566', toRgbString: () => 'rgb(68, 85, 102)', toHsbString: () => 'hsb' }}
        format="rgb"
        showText
        presets={presetGroups}
        allowClear
        onChange={handleChange}
        onOpenChange={handleOpenChange}
      />
    );

    await waitFor(() => {
      expect(document.body.querySelector('.rottay-colorpicker__dropdown')).toBeTruthy();
    });

    const rusticColorInput = document.body.querySelector('input[type="color"]') as HTMLInputElement | null;
    if (!(rusticColorInput instanceof HTMLInputElement)) {
      throw new Error('Expected rustic color input');
    }

    fireEvent.change(rusticColorInput, { target: { value: '#778899' } });
    expect(handleChange).toHaveBeenCalledWith(expect.any(Object), '#778899');

    fireEvent.change(screen.getByPlaceholderText('#000000'), { target: { value: '#aabbcc' } });
    expect(handleChange).toHaveBeenCalledWith(expect.any(Object), '#aabbcc');

    fireEvent.click(screen.getByRole('button', { name: 'Select color #111111' }));
    expect(handleChange).toHaveBeenCalledWith(expect.any(Object), '#111111');

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(handleChange).toHaveBeenCalledWith(expect.any(Object), '');
    expect(handleOpenChange).toHaveBeenCalledWith(false);

    fireEvent.mouseDown(document.body);
    expect(handleOpenChange.mock.calls.filter(([value]) => value === false).length).toBeGreaterThanOrEqual(2);

    rerender(
      <RusticColorPicker
        trigger="hover"
        onOpenChange={handleOpenChange}
      />
    );

    const rusticTrigger = container.querySelector('.rottay-colorpicker') as HTMLElement | null;
    if (!(rusticTrigger instanceof HTMLElement)) {
      throw new Error('Expected rustic trigger');
    }

    fireEvent.mouseEnter(rusticTrigger);
    fireEvent.mouseLeave(rusticTrigger);
    expect(handleOpenChange).toHaveBeenCalledWith(true);
    expect(handleOpenChange).toHaveBeenCalledWith(false);

    rerender(
      <RusticColorPicker
        disabled
        allowClear
        trigger="click"
        onOpenChange={handleOpenChange}
      />
    );

    fireEvent.click(container.querySelector('.rottay-colorpicker') as HTMLElement);
    expect(container.querySelector('.rottay-colorpicker--disabled')).toBeTruthy();
  });
});
