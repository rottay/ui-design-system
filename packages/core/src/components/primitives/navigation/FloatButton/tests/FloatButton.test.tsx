/**
 * FloatButton Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FloatButton } from '../';

vi.mock('../../../../../system/engines/factory', () => ({
  createEngineComponent: (name: string) => {
    if (name === 'FloatButton.Group') {
      const MockGroup = ({ children, trigger, open, onOpenChange, icon, shape, type, className, style, ...props }: any) => (
        <div data-testid="float-button-group" data-trigger={trigger} data-open={open} data-shape={shape} data-type={type} className={className} style={style} {...props}>
          <button data-testid="float-button-group-trigger" onClick={() => onOpenChange?.(!open)}>{icon}</button>
          {children}
        </div>
      );
      MockGroup.displayName = 'FloatButton.Group';
      return MockGroup;
    }
    if (name === 'FloatButton.BackTop') {
      const MockBackTop = ({ visibilityHeight, onClick, icon, shape, type, tooltip, className, style, ...props }: any) => (
        <button data-testid="float-button-backtop" data-visibility-height={visibilityHeight} data-shape={shape} data-type={type} title={tooltip} className={className} style={style} onClick={onClick} {...props}>
          {icon || '↑'}
        </button>
      );
      MockBackTop.displayName = 'FloatButton.BackTop';
      return MockBackTop;
    }
    const MockFloatButton = ({ icon, description, tooltip, type, shape, onClick, href, target, badge, children, className, style, ...props }: any) => {
      const content = <>{icon}{description}{children}{badge?.dot && <span data-testid="badge-dot" />}{badge?.count && <span data-testid="badge-count">{badge.count}</span>}</>;
      if (href) {
        return <a data-testid="float-button" href={href} target={target} title={tooltip} data-type={type} data-shape={shape} className={className} style={style} {...props}>{content}</a>;
      }
      return <button data-testid="float-button" type="button" onClick={onClick} title={tooltip} data-type={type} data-shape={shape} className={className} style={style} {...props}>{content}</button>;
    };
    MockFloatButton.displayName = 'FloatButton';
    MockFloatButton.Group = vi.fn();
    MockFloatButton.BackTop = vi.fn();
    return MockFloatButton;
  },
}));

describe('FloatButton', () => {
  it('renders correctly', () => {
    render(<FloatButton />);
    expect(screen.getByTestId('float-button')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    render(<FloatButton icon={<span data-testid="icon">+</span>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders with description', () => {
    render(<FloatButton description="Help" />);
    expect(screen.getByText('Help')).toBeInTheDocument();
  });

  it('renders with tooltip', () => {
    render(<FloatButton tooltip="Click me" />);
    expect(screen.getByTestId('float-button')).toHaveAttribute('title', 'Click me');
  });

  it('renders with type default', () => {
    render(<FloatButton type="default" />);
    expect(screen.getByTestId('float-button')).toHaveAttribute('data-type', 'default');
  });

  it('renders with type primary', () => {
    render(<FloatButton type="primary" />);
    expect(screen.getByTestId('float-button')).toHaveAttribute('data-type', 'primary');
  });

  it('renders with circle shape', () => {
    render(<FloatButton shape="circle" />);
    expect(screen.getByTestId('float-button')).toHaveAttribute('data-shape', 'circle');
  });

  it('renders with square shape', () => {
    render(<FloatButton shape="square" />);
    expect(screen.getByTestId('float-button')).toHaveAttribute('data-shape', 'square');
  });

  it('handles onClick', () => {
    const handleClick = vi.fn();
    render(<FloatButton onClick={handleClick} />);
    fireEvent.click(screen.getByTestId('float-button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('renders as link when href is provided', () => {
    render(<FloatButton href="https://example.com" target="_blank" />);
    const button = screen.getByTestId('float-button');
    expect(button.tagName).toBe('A');
    expect(button).toHaveAttribute('href', 'https://example.com');
  });

  it('renders with badge dot', () => {
    render(<FloatButton badge={{ dot: true }} />);
    expect(screen.getByTestId('badge-dot')).toBeInTheDocument();
  });

  it('renders with badge count', () => {
    render(<FloatButton badge={{ count: 5 }} />);
    expect(screen.getByTestId('badge-count')).toHaveTextContent('5');
  });

  it('applies custom className', () => {
    render(<FloatButton className="custom-class" />);
    expect(screen.getByTestId('float-button')).toHaveClass('custom-class');
  });

  it('applies custom style', () => {
    render(<FloatButton style={{ backgroundColor: 'red' }} />);
    expect(screen.getByTestId('float-button')).toBeInTheDocument();
  });
});

describe('FloatButton.Group', () => {
  it('renders group correctly', () => {
    render(
      <FloatButton.Group>
        <FloatButton />
        <FloatButton />
      </FloatButton.Group>
    );
    expect(screen.getByTestId('float-button-group')).toBeInTheDocument();
  });

  it('renders with click trigger', () => {
    render(<FloatButton.Group trigger="click"><FloatButton /></FloatButton.Group>);
    expect(screen.getByTestId('float-button-group')).toHaveAttribute('data-trigger', 'click');
  });

  it('renders with hover trigger', () => {
    render(<FloatButton.Group trigger="hover"><FloatButton /></FloatButton.Group>);
    expect(screen.getByTestId('float-button-group')).toHaveAttribute('data-trigger', 'hover');
  });
});

describe('FloatButton.BackTop', () => {
  it('renders backtop correctly', () => {
    render(<FloatButton.BackTop />);
    expect(screen.getByTestId('float-button-backtop')).toBeInTheDocument();
  });

  it('renders with visibility height', () => {
    render(<FloatButton.BackTop visibilityHeight={200} />);
    expect(screen.getByTestId('float-button-backtop')).toHaveAttribute('data-visibility-height', '200');
  });

  it('handles onClick', () => {
    const handleClick = vi.fn();
    render(<FloatButton.BackTop onClick={handleClick} />);
    fireEvent.click(screen.getByTestId('float-button-backtop'));
    expect(handleClick).toHaveBeenCalled();
  });
});
