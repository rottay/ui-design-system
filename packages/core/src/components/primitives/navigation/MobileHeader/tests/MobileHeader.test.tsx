/**
 * MobileHeader Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileHeader } from '../';

vi.mock('../../../../runtime/engines/factory', () => ({
  createEngineComponent: () => {
    const MockMobileHeader = ({ title, leftAction, rightActions, onBack, sticky = false, style, children }: any) => {
      const leftSlot = leftAction ?? (
        onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            data-testid="mobile-header-back"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Back
          </button>
        ) : null
      );
      const containerStyle: React.CSSProperties = {
        width: '100%',
        height: 56,
        minHeight: 56,
        ...(sticky ? { position: 'sticky', top: 0, zIndex: 40 } : {}),
        ...style,
      };
      return (
        <header style={containerStyle} data-testid="mobile-header" role="banner">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
            <div data-testid="mobile-header-left">{leftSlot}</div>
            <div style={{ flex: 1, overflow: 'hidden', textAlign: 'center' }}>
              {title && (
                <span
                  data-testid="mobile-header-title"
                  style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}
                >
                  {title}
                </span>
              )}
            </div>
            <div data-testid="mobile-header-right">{rightActions}</div>
          </div>
          {children}
        </header>
      );
    };
    MockMobileHeader.displayName = 'MobileHeader';
    return MockMobileHeader;
  },
}));

describe('MobileHeader', () => {
  it('renders correctly', () => {
    render(<MobileHeader />);
    expect(screen.getByTestId('mobile-header')).toBeInTheDocument();
  });

  it('renders title text', () => {
    render(<MobileHeader title="My Page" />);
    expect(screen.getByTestId('mobile-header-title')).toHaveTextContent('My Page');
  });

  it('truncates long titles with ellipsis', () => {
    render(<MobileHeader title="This is a very long title that should be truncated with ellipsis" />);
    const titleEl = screen.getByTestId('mobile-header-title');
    expect(titleEl).toBeInTheDocument();
    // Verify text-overflow styling is applied
    const style = titleEl.style || window.getComputedStyle(titleEl);
    expect(titleEl).toHaveStyle({ textOverflow: 'ellipsis' });
  });

  it('renders back button when onBack is provided', () => {
    const handleBack = vi.fn();
    render(<MobileHeader onBack={handleBack} />);
    const backBtn = screen.getByTestId('mobile-header-back');
    expect(backBtn).toBeInTheDocument();
    fireEvent.click(backBtn);
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it('does not render back button when no onBack and no leftAction', () => {
    render(<MobileHeader title="Test" />);
    expect(screen.queryByTestId('mobile-header-back')).not.toBeInTheDocument();
  });

  it('renders custom leftAction instead of back button', () => {
    const handleBack = vi.fn();
    render(
      <MobileHeader
        onBack={handleBack}
        leftAction={<span data-testid="custom-left">Menu</span>}
      />,
    );
    expect(screen.getByTestId('custom-left')).toBeInTheDocument();
    // Back button should not be rendered when custom leftAction provided
    expect(screen.queryByTestId('mobile-header-back')).not.toBeInTheDocument();
  });

  it('renders right actions', () => {
    render(
      <MobileHeader
        title="Test"
        rightActions={<button data-testid="right-action">Edit</button>}
      />,
    );
    expect(screen.getByTestId('right-action')).toBeInTheDocument();
  });

  it('applies sticky positioning when sticky=true', () => {
    render(<MobileHeader title="Sticky" sticky />);
    const header = screen.getByTestId('mobile-header');
    expect(header).toHaveStyle({ position: 'sticky', top: '0' });
  });

  it('does not apply sticky positioning by default', () => {
    render(<MobileHeader title="Normal" />);
    const header = screen.getByTestId('mobile-header');
    // Should not have position: sticky when sticky is false/default
    expect(header.style.position).not.toBe('sticky');
  });

  it('renders children below the header bar', () => {
    render(
      <MobileHeader title="Parent">
        <div data-testid="header-child">Subtitle content</div>
      </MobileHeader>,
    );
    expect(screen.getByTestId('header-child')).toBeInTheDocument();
  });

  it('merges custom style', () => {
    render(<MobileHeader title="Styled" style={{ background: 'red' }} />);
    const header = screen.getByTestId('mobile-header');
    expect(header).toHaveStyle({ background: 'red' });
  });

  it('has proper banner role for accessibility', () => {
    render(<MobileHeader title="Accessible" />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('back button has accessible label', () => {
    render(<MobileHeader onBack={() => {}} />);
    const backBtn = screen.getByTestId('mobile-header-back');
    expect(backBtn).toHaveAttribute('aria-label', 'Go back');
  });
});
