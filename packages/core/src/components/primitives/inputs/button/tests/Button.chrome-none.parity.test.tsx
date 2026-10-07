import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernButton from '../engines/modern';
import { ButtonGroup, ButtonIcon } from '../compound';

// Button.test pins the public wrapper against a mocked factory; these are the same cases on the live
// Modern engine with chrome="none".
const owner = () => document.querySelector('.ds-button.ds-button--modern') as HTMLButtonElement;

describe('Button.test cases on the live Modern engine with chrome="none"', () => {
  it('renders correctly', () => {
    render(<ModernButton chrome="none">Click me</ModernButton>);
    expect(screen.getByRole('button', { name: 'Click me' })).toHaveAttribute('data-chrome', 'none');
  });

  it('handles click events, and does not trigger click when disabled', () => {
    const onClick = vi.fn();
    const { rerender } = render(<ModernButton chrome="none" onClick={onClick}>Click me</ModernButton>);
    fireEvent.click(owner());
    rerender(<ModernButton chrome="none" onClick={onClick} disabled>Click me</ModernButton>);
    fireEvent.click(owner());
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(owner()).toBeDisabled();
    expect(owner()).toHaveAttribute('data-disabled', 'true');
  });

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)('renders size %s', (size) => {
    render(<ModernButton chrome="none" size={size}>Test</ModernButton>);
    expect(owner()).toHaveAttribute('data-size', size);
  });

  it.each(['primary', 'secondary', 'outline', 'ghost', 'link', 'danger', 'default', 'text', 'dashed'] as const)(
    'renders variant %s',
    (variant) => {
      render(<ModernButton chrome="none" variant={variant}>Test</ModernButton>);
      expect(owner()).toHaveAttribute('data-variant', variant);
    },
  );

  it.each(['default', 'round', 'circle'] as const)('renders shape %s', (shape) => {
    render(<ModernButton chrome="none" shape={shape}>Test</ModernButton>);
    expect(owner()).toHaveAttribute('data-shape', shape);
  });

  it('renders pending state', () => {
    render(<ModernButton chrome="none" pending>Saving</ModernButton>);
    expect(owner()).toHaveAttribute('data-pending', 'true');
    expect(owner()).toBeDisabled();
    expect(owner().querySelector("[data-part='busy-content']")).not.toBeNull();
  });

  it('renders danger variant, block button and the icon slot', () => {
    render(<ModernButton chrome="none" danger block icon={<span>★</span>}>Delete</ModernButton>);
    expect(owner()).toHaveAttribute('data-variant', 'danger');
    expect(owner()).toHaveAttribute('data-full-width', 'true');
    expect(owner().querySelector("[data-part='icon']")).toHaveTextContent('★');
  });

  it('applies custom className and sets the htmlType (default button)', () => {
    const { rerender } = render(<ModernButton chrome="none" className="custom-class">Default</ModernButton>);
    expect(owner()).toHaveClass('custom-class');
    expect(owner()).toHaveAttribute('type', 'button');
    rerender(<ModernButton chrome="none" htmlType="submit">Submit</ModernButton>);
    expect(owner()).toHaveAttribute('type', 'submit');
  });

  it('Button.Group renders multiple buttons', () => {
    render(
      <ButtonGroup>
        <ModernButton chrome="none">First</ModernButton>
        <ModernButton chrome="none">Second</ModernButton>
        <ModernButton chrome="none">Third</ModernButton>
      </ButtonGroup>,
    );
    for (const name of ['First', 'Second', 'Third']) expect(screen.getByRole('button', { name })).toHaveAttribute('data-chrome', 'none');
  });

  it('Button.Icon renders the icon button (its closed prop set has no chrome, so it stays standard)', () => {
    render(<ButtonIcon icon={<span>★</span>} aria-label="Star" />);
    expect(screen.getByRole('button', { name: 'Star' }).hasAttribute('data-chrome')).toBe(false);
    expect(screen.getByText('★')).toBeInTheDocument();
  });

  it.each(['rottay', 'bithire', 'default'])('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<ModernButton chrome="none">Test</ModernButton>);
    expect(owner()).toHaveAttribute('data-chrome', 'none');
    document.documentElement.removeAttribute('data-tenant');
  });
});
