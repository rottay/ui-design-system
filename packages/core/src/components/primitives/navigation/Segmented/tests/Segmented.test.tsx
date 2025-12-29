/**
 * Segmented Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Segmented } from '../';

vi.mock('../../../../../core/engines/factory', () => ({
  createEngineComponent: () => {
    const MockSegmented = ({
      options, value, defaultValue, onChange, block, disabled, size, className, style, ...props
    }: any) => {
      const normalizedOptions = options.map((opt: any) =>
        typeof opt === 'object' ? opt : { label: opt, value: opt }
      );
      const currentValue = value ?? defaultValue;
      return (
        <div data-testid="segmented" data-size={size} data-block={block} data-disabled={disabled} className={className} style={style} {...props}>
          {normalizedOptions.map((opt: any) => (
            <button key={String(opt.value)} data-testid={`segment-${opt.value}`} data-active={currentValue === opt.value} disabled={disabled || opt.disabled} onClick={() => onChange?.(opt.value)}>
              {opt.icon}{opt.label}
            </button>
          ))}
        </div>
      );
    };
    MockSegmented.displayName = 'Segmented';
    return MockSegmented;
  },
}));

describe('Segmented', () => {
  const defaultOptions = ['Option 1', 'Option 2', 'Option 3'];

  it('renders correctly with string options', () => {
    render(<Segmented options={defaultOptions} />);
    expect(screen.getByTestId('segmented')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('renders with object options', () => {
    const options = [{ label: 'First', value: 1 }, { label: 'Second', value: 2 }];
    render(<Segmented options={options} />);
    expect(screen.getByText('First')).toBeInTheDocument();
  });

  it('renders with defaultValue', () => {
    render(<Segmented options={defaultOptions} defaultValue="Option 2" />);
    expect(screen.getByTestId('segment-Option 2')).toHaveAttribute('data-active', 'true');
  });

  it('calls onChange when option is clicked', () => {
    const handleChange = vi.fn();
    render(<Segmented options={defaultOptions} onChange={handleChange} />);
    fireEvent.click(screen.getByTestId('segment-Option 2'));
    expect(handleChange).toHaveBeenCalledWith('Option 2');
  });

  it.each(['small', 'middle', 'large'] as const)('renders size %s', (size) => {
    render(<Segmented options={defaultOptions} size={size} />);
    expect(screen.getByTestId('segmented')).toHaveAttribute('data-size', size);
  });

  it('renders block mode', () => {
    render(<Segmented options={defaultOptions} block />);
    expect(screen.getByTestId('segmented')).toHaveAttribute('data-block', 'true');
  });

  it('renders disabled state', () => {
    render(<Segmented options={defaultOptions} disabled />);
    expect(screen.getByTestId('segmented')).toHaveAttribute('data-disabled', 'true');
  });

  it('applies custom className', () => {
    render(<Segmented options={defaultOptions} className="custom-class" />);
    expect(screen.getByTestId('segmented')).toHaveClass('custom-class');
  });

  it('applies custom style', () => {
    render(<Segmented options={defaultOptions} style={{ backgroundColor: 'red' }} />);
    expect(screen.getByTestId('segmented')).toBeInTheDocument();
  });

  it('handles numeric option values', () => {
    const options = [1, 2, 3];
    render(<Segmented options={options} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders option with icon', () => {
    const options = [{ label: 'Home', value: 'home', icon: <span data-testid="icon">H</span> }];
    render(<Segmented options={options} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders individual disabled option', () => {
    const options = [{ label: 'Active', value: 'active' }, { label: 'Disabled', value: 'disabled', disabled: true }];
    render(<Segmented options={options} />);
    expect(screen.getByTestId('segment-active')).not.toBeDisabled();
    expect(screen.getByTestId('segment-disabled')).toBeDisabled();
  });

  it('handles mixed option types', () => {
    const options = ['String Option', { label: 'Object Option', value: 'obj' }];
    render(<Segmented options={options} />);
    expect(screen.getByText('String Option')).toBeInTheDocument();
    expect(screen.getByText('Object Option')).toBeInTheDocument();
  });
});

describe('Segmented engines', () => {
  it.each(['titan', 'hermes', 'apollo'] as const)('works with %s engine', (engine) => {
    render(<Segmented engine={engine} options={['Test']} />);
    expect(screen.getByTestId('segmented')).toBeInTheDocument();
  });
});

describe('Segmented tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Segmented options={['Test']} />);
    expect(screen.getByTestId('segmented')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
