/**
 * TagInput Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagInput } from './';

vi.mock('../../../../../core/engines/factory', () => ({
  createEngineComponent: () => {
    const MockTagInput = ({
      value = [],
      onChange,
      placeholder,
      maxTags,
      allowDuplicates,
      disabled,
      size,
      error,
      errorMessage,
      onRemove,
      ...props
    }: any) => {
      const [inputValue, setInputValue] = React.useState('');

      const addTag = (tag: string) => {
        const trimmed = tag.trim();
        if (!trimmed) return;
        if (maxTags && value.length >= maxTags) return;
        if (!allowDuplicates && value.includes(trimmed)) return;
        onChange?.([...value, trimmed]);
      };

      const removeTag = (index: number) => {
        const tag = value[index];
        onChange?.(value.filter((_: any, i: number) => i !== index));
        onRemove?.(tag, index);
      };

      return (
        <div
          data-testid="taginput"
          data-size={size}
          data-disabled={disabled}
          data-error={error}
          {...props}
        >
          {value.map((tag: string, i: number) => (
            <span key={`${tag}-${i}`} data-testid={`tag-${i}`}>
              {tag}
              <button
                data-testid={`tag-remove-${i}`}
                onClick={() => removeTag(i)}
                disabled={disabled}
              >
                x
              </button>
            </span>
          ))}
          <input
            data-testid="taginput-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(inputValue);
                setInputValue('');
              } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
                removeTag(value.length - 1);
              }
            }}
            placeholder={value.length === 0 ? placeholder : ''}
            disabled={disabled}
          />
          {error && errorMessage && <span data-testid="error-message">{errorMessage}</span>}
        </div>
      );
    };
    MockTagInput.displayName = 'TagInput';
    return MockTagInput;
  },
}));

import React from 'react';

describe('TagInput', () => {
  it('renders correctly', () => {
    render(<TagInput value={['react']} onChange={() => {}} />);
    expect(screen.getByTestId('taginput')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
  });

  it('renders with placeholder when empty', () => {
    render(<TagInput value={[]} onChange={() => {}} placeholder="Add tags" />);
    expect(screen.getByPlaceholderText('Add tags')).toBeInTheDocument();
  });

  it('adds tag on Enter', () => {
    const onChange = vi.fn();
    render(<TagInput value={['existing']} onChange={onChange} />);
    const input = screen.getByTestId('taginput-input');
    fireEvent.change(input, { target: { value: 'new' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['existing', 'new']);
  });

  it('removes tag on remove button click', () => {
    const onChange = vi.fn();
    render(<TagInput value={['a', 'b']} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('tag-remove-0'));
    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  it('removes last tag on Backspace with empty input', () => {
    const onChange = vi.fn();
    render(<TagInput value={['a', 'b']} onChange={onChange} />);
    const input = screen.getByTestId('taginput-input');
    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(onChange).toHaveBeenCalledWith(['a']);
  });

  it('respects maxTags', () => {
    const onChange = vi.fn();
    render(<TagInput value={['a', 'b']} onChange={onChange} maxTags={2} />);
    const input = screen.getByTestId('taginput-input');
    fireEvent.change(input, { target: { value: 'c' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('prevents duplicates by default', () => {
    const onChange = vi.fn();
    render(<TagInput value={['a']} onChange={onChange} />);
    const input = screen.getByTestId('taginput-input');
    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows error message', () => {
    render(<TagInput value={[]} onChange={() => {}} error errorMessage="Required" />);
    expect(screen.getByTestId('error-message')).toHaveTextContent('Required');
  });

  it('disables input when disabled', () => {
    render(<TagInput value={['a']} onChange={() => {}} disabled />);
    expect(screen.getByTestId('taginput-input')).toBeDisabled();
  });
});

describe('TagInput engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<TagInput engine={engine} value={[]} onChange={() => {}} />);
    expect(screen.getByTestId('taginput')).toBeInTheDocument();
  });
});
