/**
 * Input Tests
 * Comprehensive tests for Input component
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../';

// Mock the engine factory
vi.mock('../../../../../core/engines/factory', () => ({
  createEngineComponent: () => {
    const MockInput = ({ children, value, placeholder, size, variant, status, disabled, error, prefix, suffix, clearable, onChange, onFocus, onBlur, onClear, ...props }: any) => (
      <div data-testid="input-wrapper" data-size={size} data-variant={variant} data-status={status} data-disabled={disabled} data-error={error} {...props}>
        {prefix && <span data-testid="input-prefix">{prefix}</span>}
        <input data-testid="input" value={value} placeholder={placeholder} disabled={disabled} onChange={(e) => onChange?.(e.target.value, e)} onFocus={onFocus} onBlur={onBlur} />
        {clearable && value && <button data-testid="clear-button" onClick={onClear}>Clear</button>}
        {suffix && <span data-testid="input-suffix">{suffix}</span>}
      </div>
    );
    MockInput.displayName = 'Input';
    return MockInput;
  },
}));

describe('Input', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByTestId('input')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Input placeholder="Test placeholder" />);
    expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument();
  });

  it('renders with value', () => {
    render(<Input value="test value" onChange={() => {}} />);
    expect(screen.getByDisplayValue('test value')).toBeInTheDocument();
  });

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)('renders size %s', (size) => {
    render(<Input size={size} />);
    expect(screen.getByTestId('input-wrapper')).toHaveAttribute('data-size', size);
  });

  it.each(['outline', 'filled', 'flushed', 'unstyled'] as const)('renders variant %s', (variant) => {
    render(<Input variant={variant} />);
    expect(screen.getByTestId('input-wrapper')).toHaveAttribute('data-variant', variant);
  });

  it.each(['default', 'error', 'warning', 'success'] as const)('renders status %s', (status) => {
    render(<Input status={status} />);
    expect(screen.getByTestId('input-wrapper')).toHaveAttribute('data-status', status);
  });

  it('renders disabled state', () => {
    render(<Input disabled />);
    expect(screen.getByTestId('input')).toBeDisabled();
    expect(screen.getByTestId('input-wrapper')).toHaveAttribute('data-disabled', 'true');
  });

  it('renders error state', () => {
    render(<Input error />);
    expect(screen.getByTestId('input-wrapper')).toHaveAttribute('data-error', 'true');
  });

  it('renders with prefix', () => {
    render(<Input prefix={<span>Prefix</span>} />);
    expect(screen.getByTestId('input-prefix')).toBeInTheDocument();
    expect(screen.getByText('Prefix')).toBeInTheDocument();
  });

  it('renders with suffix', () => {
    render(<Input suffix={<span>Suffix</span>} />);
    expect(screen.getByTestId('input-suffix')).toBeInTheDocument();
    expect(screen.getByText('Suffix')).toBeInTheDocument();
  });

  it('calls onChange handler', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    fireEvent.change(screen.getByTestId('input'), { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalledWith('new value', expect.any(Object));
  });

  it('calls onFocus handler', () => {
    const handleFocus = vi.fn();
    render(<Input onFocus={handleFocus} />);
    fireEvent.focus(screen.getByTestId('input'));
    expect(handleFocus).toHaveBeenCalled();
  });

  it('calls onBlur handler', () => {
    const handleBlur = vi.fn();
    render(<Input onBlur={handleBlur} />);
    fireEvent.blur(screen.getByTestId('input'));
    expect(handleBlur).toHaveBeenCalled();
  });

  it('shows clear button when clearable and has value', () => {
    render(<Input clearable value="test" onChange={() => {}} />);
    expect(screen.getByTestId('clear-button')).toBeInTheDocument();
  });

  it('does not show clear button when clearable but no value', () => {
    render(<Input clearable value="" onChange={() => {}} />);
    expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" />);
    expect(screen.getByTestId('input-wrapper')).toHaveClass('custom-class');
  });
});

describe('Input.Group', () => {
  it('renders multiple inputs', () => {
    render(
      <Input.Group>
        <Input.Addon>https://</Input.Addon>
        <Input placeholder="website" />
      </Input.Group>
    );
    expect(screen.getByText('https://')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('website')).toBeInTheDocument();
  });
});

describe('Input.Password', () => {
  it('renders password input', () => {
    render(<Input.Password placeholder="Password" />);
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });
});

describe('Input.Search', () => {
  it('renders search input', () => {
    render(<Input.Search placeholder="Search" />);
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });
});

describe('Input.TextArea', () => {
  it('renders textarea', () => {
    render(<Input.TextArea placeholder="Description" />);
    expect(screen.getByPlaceholderText('Description')).toBeInTheDocument();
  });
});

describe('Input engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<Input engine={engine} />);
    expect(screen.getByTestId('input-wrapper')).toBeInTheDocument();
  });
});

describe('Input tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Input />);
    expect(screen.getByTestId('input-wrapper')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
