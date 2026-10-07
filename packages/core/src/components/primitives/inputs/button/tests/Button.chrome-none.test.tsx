import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { responsiveChannelElement, responsiveCss, responsiveTokens } from '@tests/support/responsive';
import ModernButton from '../engines/modern';
import { Button } from '..';

afterEach(() => cleanup());

describe('Modern Button chrome="none"', () => {
  it('stamps nothing by default, so a standard button is unchanged', () => {
    render(<ModernButton>Save</ModernButton>);
    expect(screen.getByRole('button', { name: 'Save' }).hasAttribute('data-chrome')).toBe(false);
  });

  it.each([
    ['button', {}, 'BUTTON'],
    ['anchor', { href: '/next' }, 'A'],
  ])('stamps the %s paint owner and leaks no prop', (_path, extra, tag) => {
    const { container } = render(<ModernButton chrome="none" {...extra}>Save</ModernButton>);
    const owner = container.querySelector('.ds-button.ds-button--modern') as HTMLElement;
    expect(owner.tagName).toBe(tag);
    expect(owner.getAttribute('data-chrome')).toBe('none');
    expect(container.querySelectorAll('[data-chrome]')).toHaveLength(1);
    expect(container.querySelector('[chrome]')).toBeNull();
  });

  it('keeps the behaviour contract: click, keys, focus, aria-pressed, shape and the forwarded ref', () => {
    const onClick = vi.fn();
    const onKeyDown = vi.fn();
    const onFocus = vi.fn();
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <ModernButton ref={ref} chrome="none" shape="round" aria-pressed data-selected="true" onClick={onClick} onKeyDown={onKeyDown} onFocus={onFocus}>
        Open
      </ModernButton>,
    );
    const button = screen.getByRole('button', { name: 'Open', pressed: true });
    expect(ref.current).toBe(button);
    expect(button).toHaveAttribute('data-shape', 'round');
    expect(button).toHaveAttribute('data-selected', 'true');
    fireEvent.focus(button);
    fireEvent.keyDown(button, { key: 'Enter' });
    fireEvent.click(button);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('Modern Button chrome="none" responsive size (the Button.responsive cases)', () => {
  it('renders plain scalar size as tokenized inline style', () => {
    const { container } = render(<ModernButton chrome="none" size="sm">Small</ModernButton>);
    expect(container.querySelector('.ds-button')).toHaveAttribute('data-size', 'sm');
    expect(responsiveCss(container)).toBe('');
  });

  it('generates CSS media queries and omits DaisyUI size class', () => {
    const { container } = render(<ModernButton chrome="none" size={{ xs: 'sm', lg: 'lg' }}>Responsive</ModernButton>);
    expect(responsiveCss(container)).not.toBe('');
    expect(responsiveChannelElement(container)?.className).not.toContain('btn-sm');
  });

  it('drops only the responsive padding channel; height, type and icon size still respond', () => {
    const tokens = (chrome: 'standard' | 'none') => {
      const { container, unmount } = render(<ModernButton chrome={chrome} size={{ xs: 'sm', md: 'md', xl: 'lg' }}>Multi</ModernButton>);
      const value = responsiveTokens(container);
      const css = responsiveCss(container);
      unmount();
      return { value, css };
    };
    const standard = tokens('standard');
    const none = tokens('none');
    expect(standard.css).toContain('padding-inline:');
    expect(none.css).not.toContain('padding-inline:');
    for (const declaration of ['height:', 'line-height:', '--ds-button-resolved-icon-size:', 'font-size:', '@media (min-width: 768px)', '@media (min-width: 1280px)']) {
      expect(none.css).toContain(declaration);
    }
    expect([...none.value].sort()).toEqual([...standard.value].filter((token) => !token.startsWith('padding-inline@')).sort());
  });
});

describe('Button chrome on the frozen engines (E5)', () => {
  const normalise = (html: string) => html.replace(/(_r_|rc_|:r)[\w-]*/g, '$1#');

  it.each(['classic', 'rustic'] as const)('the %s engine renders the same DOM with and without chrome', async (engine) => {
    const plain = renderWithEngine(<Button engine={engine}>Save</Button>, engine);
    await screen.findByRole('button', { name: 'Save' });
    const reference = normalise(plain.container.innerHTML);
    plain.unmount();
    const chromeless = renderWithEngine(<Button engine={engine} chrome="none">Save</Button>, engine);
    await screen.findByRole('button', { name: 'Save' });
    expect(chromeless.container.querySelector('[chrome], [data-chrome]')).toBeNull();
    expect(normalise(chromeless.container.innerHTML)).toBe(reference);
  });

  it('still reaches the Modern engine through the factory', async () => {
    renderWithEngine(<Button engine="modern" chrome="none">Save</Button>, 'modern');
    expect(await screen.findByRole('button', { name: 'Save' })).toHaveAttribute('data-chrome', 'none');
  });
});
