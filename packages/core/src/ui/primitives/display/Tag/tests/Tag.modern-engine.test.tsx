import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernTag from '../engines/modern';

describe('Tag modern engine contract', () => {
  it('stamps its premium anatomy and uses the semantic close role', () => {
    const { container } = render(
      <ModernTag icon={<span data-testid="tag-leading-icon" />} closable>
        Verified
      </ModernTag>
    );

    const root = container.querySelector('.rottay-tag-shell--modern');
    expect(root).toHaveAttribute('data-has-icon', 'true');
    expect(root).toHaveAttribute('data-closable', 'true');
    expect(root?.querySelector('[data-part="content"]')).toHaveTextContent('Verified');
    expect(root?.querySelector('[data-icon-name="action.close"]')).not.toBeNull();
  });

  it('activates clickable tags from Enter and Space', () => {
    const onClick = vi.fn();
    render(
      <ModernTag clickable onClick={onClick}>
        Filter
      </ModernTag>
    );

    const root = screen.getByRole('button', { name: 'Filter' });
    fireEvent.keyDown(root, { key: 'Enter' });
    fireEvent.keyDown(root, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('keeps paint and geometry in the skin: no inline layout, size, or transition', () => {
    const { container } = render(
      <ModernTag size="lg" closable>
        Styled
      </ModernTag>
    );

    const root = container.querySelector('.rottay-tag-shell--modern') as HTMLElement;
    expect(root).toHaveAttribute('data-size', 'lg');
    // The skin owns geometry and motion now; the engine's style attribute must
    // not resurrect `transition: all`, fixed heights, or physical margins.
    const inline = root.getAttribute('style') ?? '';
    expect(inline).not.toContain('transition');
    expect(inline).not.toContain('height');
    expect(inline).not.toContain('padding');
    expect(inline).not.toContain('margin-left');

    const close = root.querySelector('[data-part="close"]') as HTMLElement;
    const closeInline = close.getAttribute('style') ?? '';
    expect(closeInline).not.toContain('margin-left');
  });

  it('labels the close control from the caller, never a hardcoded string, when closeLabel is given', () => {
    render(
      <ModernTag closable closeLabel="Quitar filtro">
        Activo
      </ModernTag>
    );

    expect(screen.getByRole('button', { name: 'Quitar filtro' })).toBeInTheDocument();
  });

  it('falls back to the documented English close label without a provider or prop', () => {
    render(<ModernTag closable>Active</ModernTag>);

    expect(screen.getByRole('button', { name: 'Remove tag' })).toBeInTheDocument();
  });

  it('routes the color prop through the custom-bg hatch, not a direct fill', () => {
    const { container } = render(<ModernTag color="rebeccapurple">Custom</ModernTag>);

    const root = container.querySelector('.rottay-tag-shell--modern') as HTMLElement;
    expect(root.style.getPropertyValue('--ds-tag-custom-bg')).toBe('rebeccapurple');
    expect(root.style.backgroundColor).toBe('');
  });
});
