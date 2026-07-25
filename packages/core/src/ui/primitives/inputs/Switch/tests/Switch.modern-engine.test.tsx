import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernSwitch from '../engines/modern';

describe('Modern Switch public anatomy', () => {
  it('paints nothing inline and stamps the skin contract', () => {
    const { container } = render(<ModernSwitch defaultChecked size="lg" />);

    const root = container.querySelector('.ds-switch--modern[data-part="root"]') as HTMLElement;
    const track = container.querySelector('[data-part="track"]') as HTMLElement;
    const thumb = container.querySelector('[data-part="thumb"]') as HTMLElement;

    expect(root).toHaveAttribute('data-size', 'lg');
    expect(root).toHaveAttribute('data-checked', 'true');
    for (const el of [track, thumb]) {
      expect(el.style.background).toBe('');
      expect(el.style.backgroundColor).toBe('');
      expect(el.style.border).toBe('');
      expect(el.style.boxShadow).toBe('');
      expect(el.style.width).toBe('');
      expect(el.style.transform).toBe('');
    }
  });

  it('exposes switch semantics on the native input', () => {
    const { container } = render(<ModernSwitch defaultChecked />);
    const input = container.querySelector('input[role="switch"]') as HTMLInputElement;

    expect(input).toHaveAttribute('aria-checked', 'true');
    expect(input).not.toBeDisabled();
  });

  it('disables interaction while loading and announces busy', () => {
    const handleChange = vi.fn();
    const { container } = render(<ModernSwitch loading onChange={handleChange} />);
    const input = container.querySelector('input[role="switch"]') as HTMLInputElement;

    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelector('[data-part="loading-indicator"]')).toBeInTheDocument();
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-loading', 'true');

    fireEvent.click(input);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('swaps state labels without inline paint', () => {
    const { rerender } = render(<ModernSwitch checked={false} unCheckedChildren="Off" checkedChildren="On" />);
    expect(screen.getByText('Off')).toHaveAttribute('data-part', 'label');

    rerender(<ModernSwitch checked checkedChildren="On" unCheckedChildren="Off" />);
    expect(screen.getByText('On')).toHaveAttribute('data-part', 'label');
    expect(screen.getByText('On').style.cssText).toBe('');
  });

  it('toggles uncontrolled state and fires onClick with the previous value', () => {
    const handleChange = vi.fn();
    const handleClick = vi.fn();
    const { container } = render(<ModernSwitch onChange={handleChange} onClick={handleClick} />);
    const input = container.querySelector('input[role="switch"]') as HTMLInputElement;

    fireEvent.click(input);
    expect(handleChange).toHaveBeenCalledWith(true);
    expect(handleClick).toHaveBeenCalledWith(false, expect.anything());
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-checked', 'true');
  });

  it('keeps identical markup in an Arabic RTL context (travel flips in the skin)', () => {
    const { container } = render(
      <div dir="rtl" lang="ar">
        <ModernSwitch defaultChecked size="md" />
      </div>,
    );

    const root = container.querySelector('[data-part="root"]');
    expect(root).toHaveAttribute('data-checked', 'true');
    expect(root).toHaveAttribute('data-size', 'md');
  });
});
