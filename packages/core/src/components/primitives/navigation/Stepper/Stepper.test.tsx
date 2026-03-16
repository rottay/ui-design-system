/**
 * Stepper Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Stepper } from './';

// Mock the engine factory
vi.mock('../../../../engines/factory', () => ({
  createEngineComponent: () => {
    const MockStepper = ({
      items,
      current,
      defaultCurrent,
      direction,
      size,
      variant,
      status,
      labelPlacement,
      clickable,
      onChange,
      percent,
      progressDot,
      responsive,
      className,
      style,
      children,
    }: any) => {
      const activeStep = current ?? defaultCurrent ?? 0;

      return (
        <nav
          data-testid="stepper"
          data-direction={direction}
          data-size={size}
          data-variant={variant}
          data-status={status}
          data-label-placement={labelPlacement}
          data-clickable={clickable}
          data-current={activeStep}
          data-percent={percent}
          data-progress-dot={progressDot}
          data-responsive={responsive}
          className={className}
          style={style}
          role="navigation"
          aria-label="Progress steps"
        >
          {items?.map((item: any, index: number) => (
            <div
              key={index}
              data-testid={`step-${index}`}
              data-status={item.status || (index < activeStep ? 'finish' : index === activeStep ? 'process' : 'wait')}
              data-disabled={item.disabled}
              onClick={() => {
                if (clickable && !item.disabled) {
                  onChange?.(index);
                }
              }}
            >
              {item.icon}
              <span>{item.title}</span>
              {item.description && <span>{item.description}</span>}
              {item.subTitle && <span>{item.subTitle}</span>}
            </div>
          ))}
          {children}
        </nav>
      );
    };
    MockStepper.displayName = 'Stepper';
    return MockStepper;
  },
}));

const defaultItems = [
  { title: 'Step 1', description: 'First step' },
  { title: 'Step 2', description: 'Second step' },
  { title: 'Step 3', description: 'Third step' },
];

describe('Stepper', () => {
  it('renders correctly', () => {
    render(<Stepper items={defaultItems} />);
    expect(screen.getByTestId('stepper')).toBeInTheDocument();
  });

  it('renders all step items', () => {
    render(<Stepper items={defaultItems} />);
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
  });

  it('renders step descriptions', () => {
    render(<Stepper items={defaultItems} />);
    expect(screen.getByText('First step')).toBeInTheDocument();
    expect(screen.getByText('Second step')).toBeInTheDocument();
    expect(screen.getByText('Third step')).toBeInTheDocument();
  });

  describe('current prop', () => {
    it('sets the active step', () => {
      render(<Stepper items={defaultItems} current={1} />);
      expect(screen.getByTestId('stepper')).toHaveAttribute('data-current', '1');
    });

    it('marks previous steps as finished', () => {
      render(<Stepper items={defaultItems} current={2} />);
      expect(screen.getByTestId('step-0')).toHaveAttribute('data-status', 'finish');
      expect(screen.getByTestId('step-1')).toHaveAttribute('data-status', 'finish');
      expect(screen.getByTestId('step-2')).toHaveAttribute('data-status', 'process');
    });
  });

  describe('direction prop', () => {
    it.each(['horizontal', 'vertical'] as const)('renders direction %s', (direction) => {
      render(<Stepper items={defaultItems} direction={direction} />);
      expect(screen.getByTestId('stepper')).toHaveAttribute('data-direction', direction);
    });
  });

  describe('size prop', () => {
    it.each(['sm', 'md', 'lg'] as const)('renders size %s', (size) => {
      render(<Stepper items={defaultItems} size={size} />);
      expect(screen.getByTestId('stepper')).toHaveAttribute('data-size', size);
    });
  });

  describe('variant prop', () => {
    it.each(['default', 'simple', 'circles'] as const)('renders variant %s', (variant) => {
      render(<Stepper items={defaultItems} variant={variant} />);
      expect(screen.getByTestId('stepper')).toHaveAttribute('data-variant', variant);
    });
  });

  describe('labelPlacement prop', () => {
    it.each(['horizontal', 'vertical'] as const)('renders labelPlacement %s', (placement) => {
      render(<Stepper items={defaultItems} labelPlacement={placement} />);
      expect(screen.getByTestId('stepper')).toHaveAttribute('data-label-placement', placement);
    });
  });

  describe('clickable prop', () => {
    it('calls onChange when step is clicked', () => {
      const onChange = vi.fn();
      render(<Stepper items={defaultItems} clickable onChange={onChange} />);

      fireEvent.click(screen.getByTestId('step-1'));
      expect(onChange).toHaveBeenCalledWith(1);
    });

    it('does not call onChange when not clickable', () => {
      const onChange = vi.fn();
      render(<Stepper items={defaultItems} onChange={onChange} />);

      fireEvent.click(screen.getByTestId('step-1'));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('does not call onChange for disabled steps', () => {
      const onChange = vi.fn();
      const items = [
        { title: 'Step 1' },
        { title: 'Step 2', disabled: true },
        { title: 'Step 3' },
      ];
      render(<Stepper items={items} clickable onChange={onChange} />);

      fireEvent.click(screen.getByTestId('step-1'));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('disabled steps', () => {
    it('renders disabled step', () => {
      const items = [
        { title: 'Step 1' },
        { title: 'Step 2', disabled: true },
      ];
      render(<Stepper items={items} />);
      expect(screen.getByTestId('step-1')).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('step status', () => {
    it('allows custom status per step', () => {
      const items = [
        { title: 'Step 1', status: 'finish' as const },
        { title: 'Step 2', status: 'error' as const },
        { title: 'Step 3', status: 'wait' as const },
      ];
      render(<Stepper items={items} />);
      expect(screen.getByTestId('step-0')).toHaveAttribute('data-status', 'finish');
      expect(screen.getByTestId('step-1')).toHaveAttribute('data-status', 'error');
      expect(screen.getByTestId('step-2')).toHaveAttribute('data-status', 'wait');
    });
  });

  describe('step icons', () => {
    it('renders custom icons', () => {
      const items = [
        { title: 'Step 1', icon: <span data-testid="icon-1">1</span> },
        { title: 'Step 2', icon: <span data-testid="icon-2">2</span> },
      ];
      render(<Stepper items={items} />);
      expect(screen.getByTestId('icon-1')).toBeInTheDocument();
      expect(screen.getByTestId('icon-2')).toBeInTheDocument();
    });
  });

  describe('step subTitle', () => {
    it('renders subTitle', () => {
      const items = [
        { title: 'Step 1', subTitle: 'Optional' },
      ];
      render(<Stepper items={items} />);
      expect(screen.getByText('Optional')).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    render(<Stepper items={defaultItems} className="custom-stepper" />);
    expect(screen.getByTestId('stepper')).toHaveClass('custom-stepper');
  });

  it('applies custom style', () => {
    render(<Stepper items={defaultItems} style={{ width: '100%' }} />);
    expect(screen.getByTestId('stepper')).toHaveStyle({ width: '100%' });
  });

  it('has proper accessibility attributes', () => {
    render(<Stepper items={defaultItems} />);
    const stepper = screen.getByTestId('stepper');
    expect(stepper).toHaveAttribute('role', 'navigation');
    expect(stepper).toHaveAttribute('aria-label', 'Progress steps');
  });
});

describe('Stepper engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<Stepper engine={engine} items={[{ title: 'Test' }]} />);
    expect(screen.getByTestId('stepper')).toBeInTheDocument();
  });
});

describe('Stepper tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Stepper items={[{ title: 'Test' }]} />);
    expect(screen.getByTestId('stepper')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
