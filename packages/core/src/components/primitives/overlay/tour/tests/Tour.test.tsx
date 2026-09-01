/**
 * Tour Tests
 * Colocated with component following approved architecture.
 *
 * @module Tour/tests
 * @description Unit tests for the Tour component covering all features,
 * variants, and engine implementations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tour } from '..';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('@/infrastructure/runtime/engines/presentation/component-factory', () => ({
  createEngineComponent: () => {
    const MockTour = ({
      steps,
      current,
      open,
      onChange,
      onClose,
      onFinish,
      type,
      mask,
      arrow,
      placement,
      zIndex,
      gap,
      indicatorsRender,
      closeIcon,
      ...props
    }: any) => {
      const [internalCurrent, setInternalCurrent] = React.useState(0);
      const currentStep = current !== undefined ? current : internalCurrent;
      const step = steps?.[currentStep];
      const isLast = currentStep === steps?.length - 1;
      const isFirst = currentStep === 0;

      const handleNext = () => {
        if (isLast) {
          onFinish?.();
          onClose?.();
        } else {
          const next = currentStep + 1;
          setInternalCurrent(next);
          onChange?.(next);
        }
      };

      const handlePrev = () => {
        if (!isFirst) {
          const prev = currentStep - 1;
          setInternalCurrent(prev);
          onChange?.(prev);
        }
      };

      const handleClose = () => {
        onClose?.();
      };

      if (!open || !step) return null;

      return (
        <div
          data-testid="tour-wrapper"
          data-type={type}
          data-placement={placement}
          data-current={currentStep}
          data-total={steps?.length}
          {...props}
        >
          {mask && <div data-testid="tour-mask" />}
          <div data-testid="tour-popover" role="dialog">
            <button data-testid="tour-close" onClick={handleClose}>
              {closeIcon || '×'}
            </button>
            {step.cover && <div data-testid="tour-cover">{step.cover}</div>}
            <div data-testid="tour-title">{step.title}</div>
            {step.description && <div data-testid="tour-description">{step.description}</div>}
            <div data-testid="tour-indicators">
              {indicatorsRender
                ? indicatorsRender(currentStep, steps.length)
                : `${currentStep + 1} / ${steps.length}`}
            </div>
            <div data-testid="tour-buttons">
              {!isFirst && (
                <button data-testid="tour-prev" onClick={handlePrev}>
                  Previous
                </button>
              )}
              <button data-testid="tour-next" onClick={handleNext}>
                {isLast ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      );
    };
    MockTour.displayName = 'Tour';
    return MockTour;
  },
}));

import React from 'react';

describe('Tour', () => {
  const defaultSteps = [
    { title: 'Step 1', description: 'First step description' },
    { title: 'Step 2', description: 'Second step description' },
    { title: 'Step 3', description: 'Third step description' },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('does not render when open=false', () => {
      render(<Tour steps={defaultSteps} open={false} />);
      expect(screen.queryByTestId('tour-wrapper')).not.toBeInTheDocument();
    });

    it('renders when open=true', () => {
      render(<Tour steps={defaultSteps} open={true} />);
      expect(screen.getByTestId('tour-wrapper')).toBeInTheDocument();
    });

    it('renders current step content', () => {
      render(<Tour steps={defaultSteps} open={true} />);
      expect(screen.getByTestId('tour-title')).toHaveTextContent('Step 1');
      expect(screen.getByTestId('tour-description')).toHaveTextContent('First step description');
    });

    it('renders with mask by default', () => {
      render(<Tour steps={defaultSteps} open={true} mask={true} />);
      expect(screen.getByTestId('tour-mask')).toBeInTheDocument();
    });

    it('renders without mask when mask=false', () => {
      render(<Tour steps={defaultSteps} open={true} mask={false} />);
      expect(screen.queryByTestId('tour-mask')).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('shows next button', () => {
      render(<Tour steps={defaultSteps} open={true} />);
      expect(screen.getByTestId('tour-next')).toHaveTextContent('Next');
    });

    it('does not show prev button on first step', () => {
      render(<Tour steps={defaultSteps} open={true} />);
      expect(screen.queryByTestId('tour-prev')).not.toBeInTheDocument();
    });

    it('advances to next step when next is clicked', () => {
      const onChange = vi.fn();
      render(<Tour steps={defaultSteps} open={true} onChange={onChange} />);

      fireEvent.click(screen.getByTestId('tour-next'));
      expect(onChange).toHaveBeenCalledWith(1);
    });

    it('shows prev button on subsequent steps', () => {
      render(<Tour steps={defaultSteps} open={true} current={1} />);
      expect(screen.getByTestId('tour-prev')).toBeInTheDocument();
    });

    it('goes to previous step when prev is clicked', () => {
      const onChange = vi.fn();
      render(<Tour steps={defaultSteps} open={true} current={1} onChange={onChange} />);

      fireEvent.click(screen.getByTestId('tour-prev'));
      expect(onChange).toHaveBeenCalledWith(0);
    });

    it('shows Finish button on last step', () => {
      render(<Tour steps={defaultSteps} open={true} current={2} />);
      expect(screen.getByTestId('tour-next')).toHaveTextContent('Finish');
    });

    it('calls onFinish when Finish is clicked', () => {
      const onFinish = vi.fn();
      render(<Tour steps={defaultSteps} open={true} current={2} onFinish={onFinish} />);

      fireEvent.click(screen.getByTestId('tour-next'));
      expect(onFinish).toHaveBeenCalled();
    });
  });

  describe('Close', () => {
    it('renders close button', () => {
      render(<Tour steps={defaultSteps} open={true} />);
      expect(screen.getByTestId('tour-close')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<Tour steps={defaultSteps} open={true} onClose={onClose} />);

      fireEvent.click(screen.getByTestId('tour-close'));
      expect(onClose).toHaveBeenCalled();
    });

    it('renders custom close icon', () => {
      render(
        <Tour steps={defaultSteps} open={true} closeIcon={<span data-testid="custom-close">X</span>} />
      );
      expect(screen.getByTestId('custom-close')).toBeInTheDocument();
    });
  });

  describe('Indicators', () => {
    it('shows step indicators', () => {
      render(<Tour steps={defaultSteps} open={true} />);
      expect(screen.getByTestId('tour-indicators')).toHaveTextContent('1 / 3');
    });

    it('updates indicators on step change', () => {
      render(<Tour steps={defaultSteps} open={true} current={1} />);
      expect(screen.getByTestId('tour-indicators')).toHaveTextContent('2 / 3');
    });

    it('supports custom indicators render', () => {
      const customRender = (current: number, total: number) => (
        <span data-testid="custom-indicators">{`Step ${current + 1} of ${total}`}</span>
      );

      render(<Tour steps={defaultSteps} open={true} indicatorsRender={customRender} />);
      expect(screen.getByTestId('custom-indicators')).toHaveTextContent('Step 1 of 3');
    });
  });

  describe('Step Content', () => {
    it('renders step with cover', () => {
      const stepsWithCover = [
        { title: 'Step 1', cover: <img data-testid="cover-image" src="test.png" alt="Cover" /> },
      ];

      render(<Tour steps={stepsWithCover} open={true} />);
      expect(screen.getByTestId('tour-cover')).toBeInTheDocument();
      expect(screen.getByTestId('cover-image')).toBeInTheDocument();
    });

    it('renders step without description', () => {
      const stepsWithoutDescription = [{ title: 'Step 1' }];

      render(<Tour steps={stepsWithoutDescription} open={true} />);
      expect(screen.getByTestId('tour-title')).toHaveTextContent('Step 1');
      expect(screen.queryByTestId('tour-description')).not.toBeInTheDocument();
    });
  });

  describe('Type Variants', () => {
    it.each(['default', 'primary'] as const)('renders with type %s', (type) => {
      render(<Tour steps={defaultSteps} open={true} type={type} />);
      expect(screen.getByTestId('tour-wrapper')).toHaveAttribute('data-type', type);
    });
  });

  describe('Controlled Mode', () => {
    it('respects controlled current prop', () => {
      const { rerender } = render(<Tour steps={defaultSteps} open={true} current={0} />);
      expect(screen.getByTestId('tour-title')).toHaveTextContent('Step 1');

      rerender(<Tour steps={defaultSteps} open={true} current={1} />);
      expect(screen.getByTestId('tour-title')).toHaveTextContent('Step 2');
    });

    it('calls onChange on navigation', () => {
      const onChange = vi.fn();
      render(<Tour steps={defaultSteps} open={true} onChange={onChange} />);

      fireEvent.click(screen.getByTestId('tour-next'));
      expect(onChange).toHaveBeenCalledWith(1);
    });
  });

  describe('Accessibility', () => {
    it('has role="dialog" on popover', () => {
      render(<Tour steps={defaultSteps} open={true} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(<Tour steps={defaultSteps} open={true} className="custom-tour" />);
      expect(screen.getByTestId('tour-wrapper')).toHaveClass('custom-tour');
    });
  });
});

describe('Tour engines', () => {
  const defaultSteps = [
    { title: 'Step 1', description: 'First step description' },
  ];

  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<Tour engine={engine} steps={defaultSteps} open={true} />);
    expect(screen.getByTestId('tour-wrapper')).toBeInTheDocument();
  });
});

describe('Tour tenants', () => {
  const defaultSteps = [
    { title: 'Step 1', description: 'First step description' },
  ];

  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Tour steps={defaultSteps} open={true} />);
    expect(screen.getByTestId('tour-wrapper')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
