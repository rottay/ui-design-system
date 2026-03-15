import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ColorPicker as ModernColorPicker } from './engines/modern';
import { ColorPicker as RusticColorPicker } from './engines/rustic';

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

    fireEvent.change(screen.getByPlaceholderText('#000000'), { target: { value: '#333333' } });
    expect(handleChange).toHaveBeenCalledWith(expect.any(Object), '#333333');

    fireEvent.click(container.querySelectorAll('button')[0] as HTMLButtonElement);
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
