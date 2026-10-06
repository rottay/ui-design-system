import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernSelect from '../engines/modern';
import { SelectOption } from '../compound/option';
import { SelectOptGroup } from '../compound/opt-group';

// Select.test pins the public wrapper against a mocked factory; these are the same cases on the live
// Modern engine with chrome="none".
const OPTIONS = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
  { value: 'disabled', label: 'Disabled Option', disabled: true },
];
const root = () => document.querySelector(".ds-select-shell[data-part='root']") as HTMLElement;
const trigger = () => document.querySelector("[data-part='trigger']") as HTMLElement;

describe('Select.test cases on the live Modern engine with chrome="none"', () => {
  it('renders correctly, with placeholder and with options', () => {
    render(<ModernSelect chrome="none" aria-label="Pick" options={OPTIONS} placeholder="Select an option" />);
    expect(screen.getByText('Select an option')).toBeInTheDocument();
    for (const label of ['Option 1', 'Option 2', 'Option 3']) expect(screen.getByText(label)).toBeInTheDocument();
    expect(trigger()).toHaveAttribute('data-chrome', 'none');
  });

  it('handles change events', () => {
    const onChange = vi.fn();
    render(<ModernSelect chrome="none" aria-label="Pick" options={OPTIONS} onChange={onChange} />);
    fireEvent.change(trigger(), { target: { value: 'option1' } });
    expect(onChange).toHaveBeenCalledWith('option1', OPTIONS[0]);
  });

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)('renders size %s', (size) => {
    render(<ModernSelect chrome="none" aria-label="Pick" options={OPTIONS} size={size} />);
    expect(root()).toHaveAttribute('data-size', size);
  });

  it.each(['outline', 'filled', 'flushed', 'default'] as const)('renders variant %s', (variant) => {
    render(<ModernSelect chrome="none" aria-label="Pick" options={OPTIONS} variant={variant} />);
    expect(trigger()).toHaveAttribute('data-variant', variant);
  });

  it.each([
    ['default', null],
    ['error', 'error'],
    ['warning', 'warning'],
    ['success', 'success'],
  ] as const)('renders status %s', (status, stamp) => {
    render(<ModernSelect chrome="none" aria-label="Pick" options={OPTIONS} status={status} />);
    expect(trigger().getAttribute('data-status')).toBe(stamp);
  });

  it('renders disabled state', () => {
    render(<ModernSelect chrome="none" aria-label="Pick" options={OPTIONS} disabled />);
    expect(root()).toHaveAttribute('data-disabled', 'true');
    expect(trigger()).toBeDisabled();
  });

  it('renders loading state', () => {
    render(<ModernSelect chrome="none" aria-label="Pick" options={OPTIONS} loading />);
    expect(root()).toHaveAttribute('data-loading', 'true');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it.each([
    ['multiple', { multiple: true }, 'data-mode', 'multiple'],
    ['searchable', { searchable: true }, 'data-searchable', 'true'],
  ] as const)('renders %s select on the custom path, still chrome-less', (_mode, extra, attr, value) => {
    render(<ModernSelect chrome="none" aria-label="Pick" options={OPTIONS} {...extra} />);
    expect(root()).toHaveAttribute(attr, value);
    expect(trigger().tagName).toBe('DIV');
    expect(trigger()).toHaveAttribute('data-chrome', 'none');
  });

  it('renders the clear action where the custom trigger offers it, and handles it', () => {
    const onClear = vi.fn();
    render(<ModernSelect chrome="none" aria-label="Pick" options={OPTIONS} forceCustomDropdown clearable value="option1" onClear={onClear} />);
    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('handles focus and blur events', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(<ModernSelect chrome="none" aria-label="Pick" options={OPTIONS} onFocus={onFocus} onBlur={onBlur} />);
    fireEvent.focus(trigger());
    fireEvent.blur(trigger());
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('applies custom className to the root', () => {
    render(<ModernSelect chrome="none" aria-label="Pick" options={OPTIONS} className="custom-class" />);
    expect(root()).toHaveClass('custom-class');
  });

  it('renders with controlled and default value', () => {
    const { unmount } = render(<ModernSelect chrome="none" aria-label="Pick" options={OPTIONS} value="option2" />);
    expect(trigger()).toHaveValue('option2');
    unmount();
    render(<ModernSelect chrome="none" aria-label="Pick" options={OPTIONS} defaultValue="option1" />);
    expect(trigger()).toHaveValue('option1');
  });

  it('renders Select.Option and Select.OptGroup children', () => {
    render(
      <ModernSelect chrome="none" aria-label="Pick">
        <SelectOptGroup label="Group 1">
          <SelectOption value="opt1">Option 1</SelectOption>
        </SelectOptGroup>
      </ModernSelect>,
    );
    expect(trigger()).toHaveAttribute('data-chrome', 'none');
  });

  it.each(['rottay', 'bithire', 'default'])('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<ModernSelect chrome="none" aria-label="Pick" options={OPTIONS} />);
    expect(trigger()).toHaveAttribute('data-chrome', 'none');
    document.documentElement.removeAttribute('data-tenant');
  });
});
