import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernInput from '../engines/modern';
import { InputAddon, InputGroup, InputPassword, InputSearch, InputTextArea } from '../compound';

// Input.test pins the public wrapper against a mocked factory; these are the same cases on the live
// Modern engine with chrome="none".
const shell = () => document.querySelector('.ds-input-shell.ds-input-shell--modern') as HTMLElement;

describe('Input.test cases on the live Modern engine with chrome="none"', () => {
  it('renders correctly, with placeholder and with value', () => {
    render(<ModernInput chrome="none" placeholder="Test placeholder" value="test value" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Test placeholder')).toHaveValue('test value');
    expect(shell()).toHaveAttribute('data-chrome', 'none');
  });

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)('renders size %s', (size) => {
    render(<ModernInput chrome="none" aria-label="Name" size={size} />);
    expect(shell()).toHaveAttribute('data-size', size);
  });

  it.each(['outline', 'filled', 'flushed', 'unstyled'] as const)('renders variant %s', (variant) => {
    render(<ModernInput chrome="none" aria-label="Name" variant={variant} />);
    expect(shell()).toHaveAttribute('data-variant', variant);
  });

  it.each([
    ['default', null],
    ['error', 'data-invalid'],
    ['warning', 'data-warning'],
    ['success', 'data-success'],
  ] as const)('renders status %s', (status, stamp) => {
    render(<ModernInput chrome="none" aria-label="Name" status={status} />);
    for (const attr of ['data-invalid', 'data-warning', 'data-success']) {
      expect(shell().getAttribute(attr)).toBe(attr === stamp ? 'true' : null);
    }
  });

  it('renders disabled and error state', () => {
    render(<ModernInput chrome="none" aria-label="Name" disabled error />);
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeDisabled();
    expect(shell()).toHaveAttribute('data-disabled', 'true');
    expect(shell()).toHaveAttribute('data-invalid', 'true');
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders with prefix and suffix', () => {
    render(<ModernInput chrome="none" aria-label="Name" prefix={<span>Prefix</span>} suffix={<span>Suffix</span>} />);
    expect(shell().querySelector('[data-part="affix-prefix"]')).toHaveTextContent('Prefix');
    expect(shell().querySelector('[data-part="affix-suffix"]')).toHaveTextContent('Suffix');
    expect(shell()).toHaveAttribute('data-chrome', 'none');
  });

  it('calls onChange, onFocus and onBlur handlers', () => {
    const onChange = vi.fn();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(<ModernInput chrome="none" aria-label="Name" onChange={onChange} onFocus={onFocus} onBlur={onBlur} />);
    const field = screen.getByRole('textbox', { name: 'Name' });
    fireEvent.focus(field);
    fireEvent.change(field, { target: { value: 'new value' } });
    fireEvent.blur(field);
    expect(onChange).toHaveBeenCalledWith('new value', expect.any(Object));
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('shows the clear button only when clearable and filled', () => {
    const { rerender } = render(<ModernInput chrome="none" aria-label="Name" clearable value="test" onChange={() => {}} />);
    expect(shell().querySelectorAll('button')).toHaveLength(1);
    rerender(<ModernInput chrome="none" aria-label="Name" clearable value="" onChange={() => {}} />);
    expect(document.querySelectorAll('button')).toHaveLength(0);
  });

  it('applies custom className to the field wrapper', () => {
    render(<ModernInput chrome="none" aria-label="Name" className="custom-class" />);
    expect(document.querySelector('.ds-input-field')).toHaveClass('custom-class');
  });

  it.each(['rottay', 'bithire', 'default'])('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<ModernInput chrome="none" aria-label="Name" />);
    expect(shell()).toHaveAttribute('data-chrome', 'none');
    document.documentElement.removeAttribute('data-tenant');
  });
});

describe('Input compounds with chrome="none"', () => {
  it('Input.Group renders multiple inputs', () => {
    render(
      <InputGroup>
        <InputAddon>https://</InputAddon>
        <ModernInput chrome="none" placeholder="website" />
      </InputGroup>,
    );
    expect(screen.getByText('https://')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('website')).toBeInTheDocument();
  });

  it('Input.Password forwards chrome and keeps the visibility toggle', async () => {
    render(<InputPassword engine="modern" chrome="none" placeholder="Password" />);
    const toggle = await screen.findByRole('button', { name: 'Show password' });
    fireEvent.click(toggle);
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'text');
    expect(shell()).toHaveAttribute('data-chrome', 'none');
  });

  it('Input.Search forwards chrome and keeps the search button', async () => {
    const onSearch = vi.fn();
    render(<InputSearch engine="modern" chrome="none" placeholder="Search" defaultValue="q" onSearch={onSearch} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Search' }));
    expect(onSearch).toHaveBeenCalledWith('q');
    expect(shell()).toHaveAttribute('data-chrome', 'none');
  });

  it('Input.TextArea renders and leaks no chrome attribute', () => {
    const { container } = render(<InputTextArea chrome="none" placeholder="Description" />);
    expect(screen.getByPlaceholderText('Description')).toBeInTheDocument();
    expect(container.querySelector('[chrome], [data-chrome]')).toBeNull();
  });
});
