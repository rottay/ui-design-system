import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernInput from '../engines/modern';
import ClassicInput from '../engines/classic';
import RusticInput from '../engines/rustic';

const shellOf = (container: HTMLElement) => container.querySelector('.ds-input-shell.ds-input-shell--modern') as HTMLElement;
const fieldOf = (container: HTMLElement) => container.querySelector('.ds-input-field[data-part="field"]') as HTMLElement;

describe('Modern Input chrome="none"', () => {
  it('stamps nothing by default, so a standard control is unchanged', () => {
    const { container } = render(<ModernInput aria-label="Name" />);
    expect(shellOf(container).hasAttribute('data-chrome')).toBe(false);
    expect(fieldOf(container).hasAttribute('data-chrome')).toBe(false);
  });

  it.each([
    ['plain', {}],
    ['affix', { prefix: <span>@</span> }],
  ])('stamps the paint owner and its field wrapper in the %s branch', (_branch, extra) => {
    const { container } = render(<ModernInput aria-label="Name" chrome="none" {...extra} />);
    expect(shellOf(container).getAttribute('data-chrome')).toBe('none');
    expect(fieldOf(container).getAttribute('data-chrome')).toBe('none');
    expect(container.querySelector('[chrome]')).toBeNull();
  });

  it('keeps the behaviour contract: Enter intent, keydown, aria-invalid and the forwarded ref', () => {
    const onPressEnter = vi.fn();
    const onKeyDown = vi.fn();
    const ref = React.createRef<HTMLInputElement>();
    render(
      <ModernInput ref={ref} chrome="none" aria-label="Name" status="error" onPressEnter={onPressEnter} onKeyDown={onKeyDown} />,
    );
    const field = screen.getByRole('textbox', { name: 'Name' });
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAttribute('data-invalid', 'true');
    fireEvent.keyDown(field, { key: 'Enter', keyCode: 229 });
    expect(onPressEnter).not.toHaveBeenCalled();
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(onPressEnter).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalledTimes(2);
    expect(ref.current).toBe(field);
  });

  it('drops only the responsive padding channel under chrome="none"', () => {
    const tokens = (chrome: 'standard' | 'none') => {
      const { container, unmount } = render(<ModernInput aria-label="Name" chrome={chrome} size={{ base: 'sm', md: 'lg' }} />);
      const value = shellOf(container).getAttribute('data-ds-responsive') ?? '';
      unmount();
      return value;
    };
    const standard = tokens('standard');
    const none = tokens('none');
    expect(standard).toMatch(/padding-inline@/);
    expect(none).not.toMatch(/padding-inline@/);
    expect(none.split(/\s+/).filter(Boolean).sort()).toEqual(
      standard.split(/\s+/).filter((token) => token && !token.startsWith('padding-inline@')).sort(),
    );
  });

  it('never reaches the DOM from a frozen engine', () => {
    for (const Frozen of [ClassicInput, RusticInput]) {
      const { container, unmount } = render(<Frozen aria-label="Name" chrome="none" />);
      expect(container.querySelector('[chrome]')).toBeNull();
      expect(container.querySelector('[data-chrome]')).toBeNull();
      unmount();
    }
  });
});
