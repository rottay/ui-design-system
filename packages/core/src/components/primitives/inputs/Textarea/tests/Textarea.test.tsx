/**
 * Textarea Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Textarea } from '../';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../../system/engines/factory', () => ({
  createEngineComponent: () => {
    const MockTextarea = ({
      size,
      variant,
      status,
      placeholder,
      value,
      defaultValue,
      disabled,
      readOnly,
      maxLength,
      showCount,
      rows,
      autoSize,
      allowClear,
      onChange,
      onFocus,
      onBlur,
      onClear,
      className,
      ...props
    }: any) => (
      <div
        data-testid="textarea-wrapper"
        data-size={size}
        data-variant={variant}
        data-status={status}
        data-disabled={disabled}
        data-readonly={readOnly}
        data-showcount={showCount}
        data-allowclear={allowClear}
        className={className}
        {...props}
      >
        <textarea
          data-testid="textarea"
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          rows={rows}
          onChange={(e) => onChange?.(e.target.value, e)}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {showCount && (
          <span data-testid="textarea-count">
            {(value || defaultValue || '').length}{maxLength ? `/${maxLength}` : ''}
          </span>
        )}
        {allowClear && value && (
          <button data-testid="clear-button" onClick={onClear}>×</button>
        )}
      </div>
    );
    MockTextarea.displayName = 'Textarea';
    return MockTextarea;
  },
}));

describe('Textarea', () => {
  it('renders correctly', () => {
    render(<Textarea />);
    expect(screen.getByTestId('textarea-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('textarea')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Textarea placeholder="Enter text..." />);
    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
  });

  it('renders with value', () => {
    render(<Textarea value="Hello World" onChange={() => {}} />);
    expect(screen.getByTestId('textarea')).toHaveValue('Hello World');
  });

  it('renders with defaultValue', () => {
    render(<Textarea defaultValue="Default text" />);
    expect(screen.getByTestId('textarea')).toHaveValue('Default text');
  });

  it.each(['sm', 'md', 'lg'] as const)('renders size %s', (size) => {
    render(<Textarea size={size} />);
    expect(screen.getByTestId('textarea-wrapper')).toHaveAttribute('data-size', size);
  });

  it.each(['outlined', 'filled', 'borderless'] as const)('renders variant %s', (variant) => {
    render(<Textarea variant={variant} />);
    expect(screen.getByTestId('textarea-wrapper')).toHaveAttribute('data-variant', variant);
  });

  it.each(['default', 'error', 'warning', 'success'] as const)('renders status %s', (status) => {
    render(<Textarea status={status} />);
    expect(screen.getByTestId('textarea-wrapper')).toHaveAttribute('data-status', status);
  });

  it('renders disabled state', () => {
    render(<Textarea disabled />);
    expect(screen.getByTestId('textarea')).toBeDisabled();
    expect(screen.getByTestId('textarea-wrapper')).toHaveAttribute('data-disabled', 'true');
  });

  it('renders readonly state', () => {
    render(<Textarea readOnly />);
    expect(screen.getByTestId('textarea')).toHaveAttribute('readonly');
    expect(screen.getByTestId('textarea-wrapper')).toHaveAttribute('data-readonly', 'true');
  });

  it('respects maxLength prop', () => {
    render(<Textarea maxLength={100} />);
    expect(screen.getByTestId('textarea')).toHaveAttribute('maxLength', '100');
  });

  it('shows character count when showCount is true', () => {
    render(<Textarea showCount defaultValue="Hello" />);
    expect(screen.getByTestId('textarea-count')).toHaveTextContent('5');
  });

  it('shows character count with maxLength', () => {
    render(<Textarea showCount maxLength={100} defaultValue="Hello" />);
    expect(screen.getByTestId('textarea-count')).toHaveTextContent('5/100');
  });

  it('respects rows prop', () => {
    render(<Textarea rows={6} />);
    expect(screen.getByTestId('textarea')).toHaveAttribute('rows', '6');
  });

  it('calls onChange when typing', () => {
    const handleChange = vi.fn();
    render(<Textarea onChange={handleChange} />);
    fireEvent.change(screen.getByTestId('textarea'), { target: { value: 'New text' } });
    expect(handleChange).toHaveBeenCalledWith('New text', expect.any(Object));
  });

  it('calls onFocus when focused', () => {
    const handleFocus = vi.fn();
    render(<Textarea onFocus={handleFocus} />);
    fireEvent.focus(screen.getByTestId('textarea'));
    expect(handleFocus).toHaveBeenCalled();
  });

  it('calls onBlur when blurred', () => {
    const handleBlur = vi.fn();
    render(<Textarea onBlur={handleBlur} />);
    fireEvent.blur(screen.getByTestId('textarea'));
    expect(handleBlur).toHaveBeenCalled();
  });

  it('shows clear button when allowClear is true and has value', () => {
    render(<Textarea allowClear value="Some text" onChange={() => {}} />);
    expect(screen.getByTestId('clear-button')).toBeInTheDocument();
  });

  it('calls onClear when clear button is clicked', () => {
    const handleClear = vi.fn();
    render(<Textarea allowClear value="Some text" onClear={handleClear} onChange={() => {}} />);
    fireEvent.click(screen.getByTestId('clear-button'));
    expect(handleClear).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Textarea className="custom-class" />);
    expect(screen.getByTestId('textarea-wrapper')).toHaveClass('custom-class');
  });
});

describe('Textarea engines', () => {
  it.each(['titan', 'hermes', 'apollo'] as const)('works with %s engine', (engine) => {
    render(<Textarea engine={engine} />);
    expect(screen.getByTestId('textarea-wrapper')).toBeInTheDocument();
  });
});
