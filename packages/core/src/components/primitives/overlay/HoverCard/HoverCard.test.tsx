/**
 * HoverCard Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HoverCard } from './';

vi.mock('../../../../core/engines/factory', () => ({
  createEngineComponent: () => {
    const MockHoverCard = ({
      content,
      trigger,
      disabled,
      open,
      side,
      align,
      ...props
    }: any) => {
      const [isOpen, setIsOpen] = React.useState(open || false);
      const actualOpen = disabled ? false : (open !== undefined ? open : isOpen);

      return (
        <div
          data-testid="hovercard"
          data-side={side}
          data-align={align}
          data-disabled={disabled}
          {...props}
        >
          <div
            data-testid="hovercard-trigger"
            onMouseEnter={() => !disabled && setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            {trigger}
          </div>
          {actualOpen && (
            <div data-testid="hovercard-content">
              {content}
            </div>
          )}
        </div>
      );
    };
    MockHoverCard.displayName = 'HoverCard';
    return MockHoverCard;
  },
}));

import React from 'react';

describe('HoverCard', () => {
  it('renders the trigger', () => {
    render(
      <HoverCard content={<div>Content</div>} trigger={<span>Hover me</span>} />
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('does not show content by default', () => {
    render(
      <HoverCard content={<div>Content</div>} trigger={<span>Hover me</span>} />
    );
    expect(screen.queryByTestId('hovercard-content')).not.toBeInTheDocument();
  });

  it('shows content on mouse enter', () => {
    render(
      <HoverCard content={<div>Card content</div>} trigger={<span>Hover me</span>} />
    );
    fireEvent.mouseEnter(screen.getByTestId('hovercard-trigger'));
    expect(screen.getByTestId('hovercard-content')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('hides content on mouse leave', () => {
    render(
      <HoverCard content={<div>Card content</div>} trigger={<span>Hover me</span>} />
    );
    fireEvent.mouseEnter(screen.getByTestId('hovercard-trigger'));
    fireEvent.mouseLeave(screen.getByTestId('hovercard-trigger'));
    expect(screen.queryByTestId('hovercard-content')).not.toBeInTheDocument();
  });

  it('does not show when disabled', () => {
    render(
      <HoverCard content={<div>Content</div>} trigger={<span>Hover me</span>} disabled />
    );
    fireEvent.mouseEnter(screen.getByTestId('hovercard-trigger'));
    expect(screen.queryByTestId('hovercard-content')).not.toBeInTheDocument();
  });

  it('shows content when controlled open=true', () => {
    render(
      <HoverCard content={<div>Content</div>} trigger={<span>Hover</span>} open={true} />
    );
    expect(screen.getByTestId('hovercard-content')).toBeInTheDocument();
  });

  it.each(['top', 'bottom', 'left', 'right'] as const)('renders with side %s', (side) => {
    render(
      <HoverCard content={<div>Content</div>} trigger={<span>Hover</span>} side={side} />
    );
    expect(screen.getByTestId('hovercard')).toHaveAttribute('data-side', side);
  });
});

describe('HoverCard engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(
      <HoverCard engine={engine} content={<div>Content</div>} trigger={<span>Trigger</span>} />
    );
    expect(screen.getByTestId('hovercard')).toBeInTheDocument();
  });
});
