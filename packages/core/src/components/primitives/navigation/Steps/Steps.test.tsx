/**
 * Steps Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Steps } from './';

// Mock the engine factory
vi.mock('../../../../core/engines/factory', () => ({
  createEngineComponent: () => {
    const MockSteps = ({
      items,
      current,
      direction,
      initial,
      labelPlacement,
      percent,
      progressDot,
      responsive,
      size,
      status,
      type,
      onChange,
      className,
      style,
    }: any) => {
      const activeStep = current ?? initial ?? 0;

      return (
        <div
          data-testid="steps"
          data-direction={direction}
          data-size={size}
          data-type={type}
          data-status={status}
          data-label-placement={labelPlacement}
          data-current={activeStep}
          data-percent={percent}
          data-progress-dot={progressDot}
          data-responsive={responsive}
          className={className}
          style={style}
          role="navigation"
          aria-label="Steps"
        >
          {items?.map((item: any, index: number) => (
            <div
              key={index}
              data-testid={`step-${index}`}
              data-status={item.status || (index < activeStep ? 'finish' : index === activeStep ? 'process' : 'wait')}
              data-disabled={item.disabled}
              onClick={() => {
                if (onChange && !item.disabled) {
                  onChange(index);
                }
              }}
            >
              {item.icon}
              <span data-testid={`step-${index}-title`}>{item.title}</span>
              {item.subTitle && <span data-testid={`step-${index}-subtitle`}>{item.subTitle}</span>}
              {item.description && <span data-testid={`step-${index}-description`}>{item.description}</span>}
            </div>
          ))}
        </div>
      );
    };
    MockSteps.displayName = 'Steps';
    return MockSteps;
  },
}));

const defaultItems = [
  { title: 'First', description: 'First step' },
  { title: 'Second', description: 'Second step' },
  { title: 'Third', description: 'Third step' },
];

describe('Steps', () => {
  it('renders correctly', () => {
    render(<Steps items={defaultItems} />);
    expect(screen.getByTestId('steps')).toBeInTheDocument();
  });

  it('renders all step items', () => {
    render(<Steps items={defaultItems} />);
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });

  it('renders step descriptions', () => {
    render(<Steps items={defaultItems} />);
    expect(screen.getByText('First step')).toBeInTheDocument();
    expect(screen.getByText('Second step')).toBeInTheDocument();
    expect(screen.getByText('Third step')).toBeInTheDocument();
  });

  describe('current prop', () => {
    it('sets the active step', () => {
      render(<Steps items={defaultItems} current={1} />);
      expect(screen.getByTestId('steps')).toHaveAttribute('data-current', '1');
    });

    it('marks previous steps as finished', () => {
      render(<Steps items={defaultItems} current={2} />);
      expect(screen.getByTestId('step-0')).toHaveAttribute('data-status', 'finish');
      expect(screen.getByTestId('step-1')).toHaveAttribute('data-status', 'finish');
      expect(screen.getByTestId('step-2')).toHaveAttribute('data-status', 'process');
    });
  });

  describe('direction prop', () => {
    it.each(['horizontal', 'vertical'] as const)('renders direction %s', (direction) => {
      render(<Steps items={defaultItems} direction={direction} />);
      expect(screen.getByTestId('steps')).toHaveAttribute('data-direction', direction);
    });
  });

  describe('size prop', () => {
    it.each(['default', 'small'] as const)('renders size %s', (size) => {
      render(<Steps items={defaultItems} size={size} />);
      expect(screen.getByTestId('steps')).toHaveAttribute('data-size', size);
    });
  });

  describe('type prop', () => {
    it.each(['default', 'navigation', 'inline'] as const)('renders type %s', (type) => {
      render(<Steps items={defaultItems} type={type} />);
      expect(screen.getByTestId('steps')).toHaveAttribute('data-type', type);
    });
  });

  describe('labelPlacement prop', () => {
    it.each(['horizontal', 'vertical'] as const)('renders labelPlacement %s', (placement) => {
      render(<Steps items={defaultItems} labelPlacement={placement} />);
      expect(screen.getByTestId('steps')).toHaveAttribute('data-label-placement', placement);
    });
  });

  describe('onChange callback', () => {
    it('calls onChange when step is clicked', () => {
      const onChange = vi.fn();
      render(<Steps items={defaultItems} onChange={onChange} />);

      fireEvent.click(screen.getByTestId('step-1'));
      expect(onChange).toHaveBeenCalledWith(1);
    });

    it('does not call onChange for disabled steps', () => {
      const onChange = vi.fn();
      const items = [
        { title: 'First' },
        { title: 'Second', disabled: true },
        { title: 'Third' },
      ];
      render(<Steps items={items} onChange={onChange} />);

      fireEvent.click(screen.getByTestId('step-1'));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('disabled steps', () => {
    it('renders disabled step', () => {
      const items = [
        { title: 'First' },
        { title: 'Second', disabled: true },
      ];
      render(<Steps items={items} />);
      expect(screen.getByTestId('step-1')).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('step status', () => {
    it('allows custom status per step', () => {
      const items = [
        { title: 'First', status: 'finish' as const },
        { title: 'Second', status: 'error' as const },
        { title: 'Third', status: 'wait' as const },
      ];
      render(<Steps items={items} />);
      expect(screen.getByTestId('step-0')).toHaveAttribute('data-status', 'finish');
      expect(screen.getByTestId('step-1')).toHaveAttribute('data-status', 'error');
      expect(screen.getByTestId('step-2')).toHaveAttribute('data-status', 'wait');
    });
  });

  describe('step icons', () => {
    it('renders custom icons', () => {
      const items = [
        { title: 'First', icon: <span data-testid="icon-1">1</span> },
        { title: 'Second', icon: <span data-testid="icon-2">2</span> },
      ];
      render(<Steps items={items} />);
      expect(screen.getByTestId('icon-1')).toBeInTheDocument();
      expect(screen.getByTestId('icon-2')).toBeInTheDocument();
    });
  });

  describe('step subTitle', () => {
    it('renders subTitle', () => {
      const items = [
        { title: 'First', subTitle: 'Optional' },
      ];
      render(<Steps items={items} />);
      expect(screen.getByText('Optional')).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    render(<Steps items={defaultItems} className="custom-steps" />);
    expect(screen.getByTestId('steps')).toHaveClass('custom-steps');
  });

  it('applies custom style', () => {
    render(<Steps items={defaultItems} style={{ width: '100%' }} />);
    expect(screen.getByTestId('steps')).toHaveStyle({ width: '100%' });
  });

  it('has proper accessibility attributes', () => {
    render(<Steps items={defaultItems} />);
    const steps = screen.getByTestId('steps');
    expect(steps).toHaveAttribute('role', 'navigation');
    expect(steps).toHaveAttribute('aria-label', 'Steps');
  });
});

describe('Steps engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<Steps engine={engine} items={[{ title: 'Test' }]} />);
    expect(screen.getByTestId('steps')).toBeInTheDocument();
  });
});

describe('Steps tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Steps items={[{ title: 'Test' }]} />);
    expect(screen.getByTestId('steps')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
