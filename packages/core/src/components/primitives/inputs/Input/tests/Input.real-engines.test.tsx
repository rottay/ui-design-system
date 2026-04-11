import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ClassicInput from '../engines/classic';
import ModernInput from '../engines/modern';
import { Input } from '..';
import { InputAddon } from '../compound/Addon';
import { InputGroup } from '../compound/Group';
import { InputPassword } from '../compound/Password';
import { InputSearch } from '../compound/Search';
import { InputTextArea } from '../compound/TextArea';
import { renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';

describe('Input real engine coverage', () => {
  it('covers classic number, password, search, and error branches', async () => {
    const handleChange = vi.fn();
    const handleEnter = vi.fn();

    const { rerender } = render(
      <ClassicInput
        type="number"
        defaultValue="12"
        error
        errorMessage="Capacity is invalid"
        onChange={handleChange}
        aria-label="Capacity"
      />
    );

    const spinbutton = screen.getByRole('spinbutton', { name: 'Capacity' });
    fireEvent.change(spinbutton, { target: { value: '34' } });

    expect(handleChange).toHaveBeenCalledWith('34', expect.any(Object));
    expect(screen.getByText('Capacity is invalid')).toBeInTheDocument();

    rerender(
      <ClassicInput
        type="password"
        value="top-secret"
        variant="flushed"
        status="warning"
        errorMessage="Do not leak"
        aria-label="Password"
      />
    );

    expect(screen.getByLabelText('Password')).toHaveValue('top-secret');

    rerender(
      <ClassicInput
        type="search"
        defaultValue="launch"
        clearable
        showCount
        maxLength={20}
        onChange={handleChange}
        onPressEnter={handleEnter}
        aria-label="Search input"
      />
    );

    const searchInput = screen.getByRole('searchbox', { name: 'Search input' });
    fireEvent.keyDown(searchInput, { key: 'Enter' });
    fireEvent.change(searchInput, { target: { value: 'launch week' } });

    expect(handleEnter).toHaveBeenCalled();
    expect(handleChange).toHaveBeenCalledWith('launch week', expect.any(Object));
  });

  it('does not leak classic-only number props to the DOM', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ClassicInput
        type="number"
        defaultValue="12"
        clearable
        showCount
        aria-label="Capacity without prop leaks"
      />
    );

    const joinedErrors = consoleErrorSpy.mock.calls.flat().join(' ');
    expect(joinedErrors).not.toContain('allowClear');
    expect(joinedErrors).not.toContain('showCount');

    consoleErrorSpy.mockRestore();
  });

  it('covers modern wrapper and simple input branches', async () => {
    const handleChange = vi.fn();
    const handleClear = vi.fn();
    const handleEnter = vi.fn();

    const { rerender } = render(
      <ModernInput
        value="Ada"
        prefix={<span data-testid="modern-prefix">@</span>}
        suffix={<span data-testid="modern-suffix">ok</span>}
        clearable
        showCount
        maxLength={12}
        status="success"
        onChange={handleChange}
        onClear={handleClear}
        onPressEnter={handleEnter}
        aria-label="Modern affix input"
      />
    );

    const affixInput = screen.getByRole('textbox', { name: 'Modern affix input' });
    fireEvent.focus(affixInput);
    fireEvent.keyDown(affixInput, { key: 'Enter' });
    fireEvent.click(screen.getByRole('button', { name: /clear input/i }));

    await waitFor(() => {
      expect(handleClear).toHaveBeenCalledTimes(1);
    });

    expect(handleEnter).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('', expect.any(Object));
    expect(screen.getByTestId('modern-prefix')).toBeInTheDocument();
    expect(screen.getByTestId('modern-suffix')).toBeInTheDocument();
    expect(screen.getByText('3/12')).toBeInTheDocument();

    rerender(
      <ModernInput
        defaultValue="readonly"
        variant="unstyled"
        readOnly
        disabled
        error
        errorMessage="Disabled field"
        aria-label="Modern plain input"
      />
    );

    const plainInput = screen.getByRole('textbox', { name: 'Modern plain input' });
    expect(plainInput).toBeDisabled();
    expect(screen.getByText('Disabled field')).toBeInTheDocument();
  });

  it('covers password/search compounds plus addon/group/text-area helpers', async () => {
    const onSearch = vi.fn();
    const onPressEnter = vi.fn();

    renderWithEngine(
      <div>
        <InputPassword
          engine="rustic"
          defaultValue="launch"
          aria-label="Password field"
        />
        <InputSearch
          engine="rustic"
          value="launch"
          onSearch={onSearch}
          aria-label="Search field"
        />
        <InputTextArea
          defaultValue="Draft"
          maxLength={20}
          showCount
          error
          errorMessage="Needs edits"
          onPressEnter={onPressEnter}
          aria-label="Notes"
        />
      </div>,
      'rustic'
    );

    const toggleButton = await screen.findByRole('button', { name: /show password/i });
    fireEvent.click(toggleButton);
    expect(await screen.findByLabelText('Password field')).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(onSearch).toHaveBeenCalledWith('launch');

    const textarea = screen.getByRole('textbox', { name: 'Notes' });
    fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(onPressEnter).toHaveBeenCalledTimes(1);
    expect(screen.getByText('5/20')).toBeInTheDocument();
    expect(screen.getByText('Needs edits')).toBeInTheDocument();

    const { container, rerender } = render(
      <InputGroup compact size="lg">
        <InputAddon position="before">https://</InputAddon>
        <InputAddon position="after">.com</InputAddon>
      </InputGroup>
    );

    const addons = container.querySelectorAll('.rottay-input-addon');
    expect(addons[0].getAttribute('style') ?? '').toContain('border-top-right-radius: 0');
    expect(addons[1].getAttribute('style') ?? '').toContain('margin-left: -1px');

    rerender(
      <InputGroup compact={false} size="sm">
        <InputAddon position="before" variant="transparent">
          prefix
        </InputAddon>
        <InputAddon position="after">suffix</InputAddon>
      </InputGroup>
    );

    const nonCompactAddons = container.querySelectorAll('.rottay-input-addon');
    expect(nonCompactAddons[0].getAttribute('style') ?? '').toContain('background-color: transparent');
    expect(nonCompactAddons[1].getAttribute('style') ?? '').toContain('margin-left: 8px');
  });

  it('covers textarea focus and style branches directly', () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();

    render(
      <InputTextArea
        defaultValue="Ops"
        variant="filled"
        status="warning"
        rows={5}
        resize={false}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-label="Direct textarea"
      />
    );

    const textarea = screen.getByRole('textbox', { name: 'Direct textarea' });
    fireEvent.focus(textarea);
    fireEvent.blur(textarea);

    expect(handleFocus).toHaveBeenCalledTimes(1);
    expect(handleBlur).toHaveBeenCalledTimes(1);
    expect(textarea.getAttribute('style') ?? '').toContain('resize: none');
  });
});
