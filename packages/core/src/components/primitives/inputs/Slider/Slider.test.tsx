/**
 * Slider Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Slider } from './';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../core/engines/factory', () => ({
  createEngineComponent: () => {
    const MockSlider = ({
      value,
      defaultValue,
      onChange,
      onChangeComplete,
      min = 0,
      max = 100,
      step = 1,
      range,
      marks,
      included,
      disabled,
      vertical,
      reverse,
      dots,
      className,
      style,
      ...props
    }: any) => {
      const currentValue = value ?? defaultValue ?? (range ? [0, 100] : 0);

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        const newValue = Number(e.target.value);
        onChange?.(range ? [0, newValue] : newValue);
      };

      const handleMouseUp = () => {
        if (disabled) return;
        onChangeComplete?.(currentValue);
      };

      return (
        <div
          data-testid="slider"
          data-disabled={disabled}
          data-vertical={vertical}
          data-reverse={reverse}
          data-range={range}
          data-dots={dots}
          data-included={included}
          className={className}
          style={style}
          {...props}
        >
          <input
            type="range"
            role="slider"
            min={min}
            max={max}
            step={step ?? 1}
            value={Array.isArray(currentValue) ? currentValue[1] : currentValue}
            disabled={disabled}
            readOnly={value !== undefined && !onChange}
            onChange={handleChange}
            onMouseUp={handleMouseUp}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={Array.isArray(currentValue) ? currentValue[1] : currentValue}
            aria-disabled={disabled}
            data-testid="slider-input"
          />
          {marks && (
            <div data-testid="slider-marks">
              {Object.entries(marks).map(([key, label]) => (
                <span key={key} data-testid={`slider-mark-${key}`}>
                  {typeof label === 'object' && label !== null && 'label' in label
                    ? (label as { label: React.ReactNode }).label
                    : label as React.ReactNode}
                </span>
              ))}
            </div>
          )}
          {range && (
          <input
            type="range"
            role="slider"
            min={min}
            max={max}
            step={step ?? 1}
            value={Array.isArray(currentValue) ? currentValue[0] : 0}
            disabled={disabled}
            readOnly
            aria-valuemin={min}
            aria-valuemax={max}
            data-testid="slider-input-range"
          />
          )}
        </div>
      );
    };
    MockSlider.displayName = 'Slider';
    return MockSlider;
  },
}));

describe('Slider', () => {
  it('renders correctly', () => {
    render(<Slider />);
    expect(screen.getByTestId('slider')).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('renders with default value', () => {
    render(<Slider defaultValue={50} />);
    expect(screen.getByRole('slider')).toHaveValue('50');
  });

  it('renders with controlled value', () => {
    render(<Slider value={75} />);
    expect(screen.getByRole('slider')).toHaveValue('75');
  });

  it('respects min and max props', () => {
    render(<Slider min={10} max={200} value={50} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('min', '10');
    expect(slider).toHaveAttribute('max', '200');
  });

  it('respects step prop', () => {
    render(<Slider step={5} />);
    expect(screen.getByRole('slider')).toHaveAttribute('step', '5');
  });

  it('renders disabled state', () => {
    render(<Slider disabled />);
    expect(screen.getByRole('slider')).toBeDisabled();
    expect(screen.getByTestId('slider')).toHaveAttribute('data-disabled', 'true');
  });

  it('does not call onChange when disabled', () => {
    const handleChange = vi.fn();
    render(<Slider disabled onChange={handleChange} />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: 50 } });
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('calls onChange when value changes', () => {
    const handleChange = vi.fn();
    render(<Slider onChange={handleChange} />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: 50 } });
    expect(handleChange).toHaveBeenCalledWith(50);
  });

  it('calls onChangeComplete when slider is released', () => {
    const handleChangeComplete = vi.fn();
    render(<Slider value={30} onChangeComplete={handleChangeComplete} />);
    fireEvent.mouseUp(screen.getByRole('slider'));
    expect(handleChangeComplete).toHaveBeenCalledWith(30);
  });

  it('renders vertical mode', () => {
    render(<Slider vertical />);
    expect(screen.getByTestId('slider')).toHaveAttribute('data-vertical', 'true');
  });

  it('renders reverse mode', () => {
    render(<Slider reverse />);
    expect(screen.getByTestId('slider')).toHaveAttribute('data-reverse', 'true');
  });

  it('renders with dots enabled', () => {
    render(<Slider dots />);
    expect(screen.getByTestId('slider')).toHaveAttribute('data-dots', 'true');
  });

  it('applies custom className', () => {
    render(<Slider className="custom-class" />);
    expect(screen.getByTestId('slider')).toHaveClass('custom-class');
  });
});

describe('Slider with marks', () => {
  it('renders marks correctly', () => {
    const marks = { 0: 'Start', 50: 'Middle', 100: 'End' };
    render(<Slider marks={marks} />);
    expect(screen.getByTestId('slider-marks')).toBeInTheDocument();
    expect(screen.getByTestId('slider-mark-0')).toHaveTextContent('Start');
    expect(screen.getByTestId('slider-mark-50')).toHaveTextContent('Middle');
    expect(screen.getByTestId('slider-mark-100')).toHaveTextContent('End');
  });

  it('renders marks with custom styles', () => {
    const marks = {
      0: { style: { color: 'red' }, label: 'Low' },
      100: { style: { color: 'green' }, label: 'High' },
    };
    render(<Slider marks={marks} />);
    expect(screen.getByTestId('slider-mark-0')).toHaveTextContent('Low');
    expect(screen.getByTestId('slider-mark-100')).toHaveTextContent('High');
  });
});

describe('Slider range mode', () => {
  it('renders range slider', () => {
    render(<Slider range />);
    expect(screen.getByTestId('slider')).toHaveAttribute('data-range', 'true');
    expect(screen.getByTestId('slider-input-range')).toBeInTheDocument();
  });

  it('renders with range default value', () => {
    render(<Slider range defaultValue={[20, 80]} />);
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(2);
  });

  it('calls onChange with array in range mode', () => {
    const handleChange = vi.fn();
    render(<Slider range onChange={handleChange} />);
    fireEvent.change(screen.getByTestId('slider-input'), { target: { value: 60 } });
    expect(handleChange).toHaveBeenCalledWith([0, 60]);
  });
});

describe('Slider engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<Slider engine={engine} />);
    expect(screen.getByTestId('slider')).toBeInTheDocument();
  });

  it.each(['classic', 'modern', 'rustic'] as const)('renders range mode with %s engine', (engine) => {
    render(<Slider engine={engine} range defaultValue={[10, 90]} />);
    expect(screen.getByTestId('slider')).toHaveAttribute('data-range', 'true');
  });

  it.each(['classic', 'modern', 'rustic'] as const)('renders marks with %s engine', (engine) => {
    const marks = { 0: 'Min', 100: 'Max' };
    render(<Slider engine={engine} marks={marks} />);
    expect(screen.getByTestId('slider-marks')).toBeInTheDocument();
  });
});

describe('Slider tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Slider />);
    expect(screen.getByTestId('slider')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
