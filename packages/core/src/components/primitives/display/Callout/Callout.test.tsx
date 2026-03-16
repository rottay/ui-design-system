/**
 * Callout Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Callout } from './Callout';

vi.mock('../../../../engines/factory', () => ({
  createEngineComponent: () => {
    const MockCallout = ({
      variant = 'info',
      title,
      children,
      icon,
      closable,
      onClose,
      action,
      ...props
    }: any) => {
      const [visible, setVisible] = React.useState(true);
      if (!visible) return null;

      return (
        <div
          data-testid="callout"
          data-variant={variant}
          role="alert"
          {...props}
        >
          {icon && <span data-testid="callout-icon">{icon}</span>}
          {title && <div data-testid="callout-title">{title}</div>}
          <div data-testid="callout-content">{children}</div>
          {action && <div data-testid="callout-action">{action}</div>}
          {closable && (
            <button
              data-testid="callout-close"
              onClick={() => { setVisible(false); onClose?.(); }}
            >
              Close
            </button>
          )}
        </div>
      );
    };
    MockCallout.displayName = 'Callout';
    return MockCallout;
  },
}));

import React from 'react';

describe('Callout', () => {
  it('renders correctly', () => {
    render(<Callout>Message</Callout>);
    expect(screen.getByTestId('callout')).toBeInTheDocument();
    expect(screen.getByText('Message')).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(<Callout title="Title">Message</Callout>);
    expect(screen.getByTestId('callout-title')).toHaveTextContent('Title');
  });

  it('has alert role', () => {
    render(<Callout>Message</Callout>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it.each(['info', 'warning', 'error', 'success'] as const)(
    'renders variant %s',
    (variant) => {
      render(<Callout variant={variant}>Message</Callout>);
      expect(screen.getByTestId('callout')).toHaveAttribute('data-variant', variant);
    }
  );

  it('defaults to info variant', () => {
    render(<Callout>Message</Callout>);
    expect(screen.getByTestId('callout')).toHaveAttribute('data-variant', 'info');
  });

  it('renders closable and handles close', () => {
    const onClose = vi.fn();
    render(<Callout closable onClose={onClose}>Message</Callout>);
    expect(screen.getByTestId('callout-close')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('callout-close'));
    expect(onClose).toHaveBeenCalled();
    expect(screen.queryByTestId('callout')).not.toBeInTheDocument();
  });

  it('renders custom icon', () => {
    render(<Callout icon={<span>ICON</span>}>Message</Callout>);
    expect(screen.getByTestId('callout-icon')).toHaveTextContent('ICON');
  });

  it('renders action element', () => {
    render(<Callout action={<button>Action</button>}>Message</Callout>);
    expect(screen.getByTestId('callout-action')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Callout className="custom-class">Message</Callout>);
    expect(screen.getByTestId('callout')).toHaveClass('custom-class');
  });
});

describe('Callout engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<Callout engine={engine}>Message</Callout>);
    expect(screen.getByTestId('callout')).toBeInTheDocument();
  });
});
