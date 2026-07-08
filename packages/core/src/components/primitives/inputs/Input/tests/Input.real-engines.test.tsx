import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ClassicInput from '../engines/classic';
import ModernInput from '../engines/modern';
import RusticInput from '../engines/rustic';
import { Input } from '..';
import { InputAddon } from '../compound/Addon';
import { InputGroup } from '../compound/Group';
import { InputPassword } from '../compound/Password';
import { InputSearch } from '../compound/Search';
import { InputTextArea } from '../compound/TextArea';
import { renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';

describe('Input real engine coverage', () => {
  // WO-CNF-01: `type="hidden"` renders a bare, form-participating input with no
  // wrapper chrome, so server-action forms (e.g. the public apply page's
  // jobIdentifier) receive the value via FormData across every engine.
  it.each([
    ['classic', ClassicInput],
    ['modern', ModernInput],
    ['rustic', RusticInput],
  ] as const)('renders a bare hidden input under the %s engine', (_engine, Engine) => {
    const { container } = render(
      <Engine type="hidden" name="jobIdentifier" value="acme-senior-eng" data-testid="hidden-field" />
    );

    const el = screen.getByTestId('hidden-field') as HTMLInputElement;
    expect(el.tagName).toBe('INPUT');
    expect(el.getAttribute('type')).toBe('hidden');
    expect(el.getAttribute('name')).toBe('jobIdentifier');
    expect(el.value).toBe('acme-senior-eng');
    // Bare passthrough: the hidden input is the only rendered element (no shell,
    // label, or placeholder <style> chrome around it).
    expect(container.querySelectorAll('input').length).toBe(1);
    expect(container.querySelector('label')).toBeNull();
    // A native FormData round trip carries the hidden value.
    const form = document.createElement('form');
    form.appendChild(el.cloneNode(true));
    expect(new FormData(form).get('jobIdentifier')).toBe('acme-senior-eng');
  });

  // WO-CNF-01: `type="file"` renders a bare file picker that forwards its ref
  // (so callers can `.click()` it programmatically) and its native change event
  // (so callers can read `event.target.files`), with no chrome and no value.
  it.each([
    ['classic', ClassicInput],
    ['modern', ModernInput],
    ['rustic', RusticInput],
  ] as const)('renders a bare file input that forwards ref + change event under the %s engine', (_engine, Engine) => {
    const ref = React.createRef<HTMLInputElement>();
    const onChange = vi.fn();
    const { container } = render(
      <Engine
        ref={ref}
        type="file"
        name="audio"
        accept="audio/*"
        onChange={onChange}
        style={{ display: 'none' }}
        data-testid="file-field"
      />
    );

    const el = screen.getByTestId('file-field') as HTMLInputElement;
    expect(el.tagName).toBe('INPUT');
    expect(el.getAttribute('type')).toBe('file');
    expect(el.getAttribute('accept')).toBe('audio/*');
    expect(el.style.display).toBe('none');
    // Ref forwards to the real file input so callers can trigger it.
    expect(ref.current).toBe(el);
    // Bare passthrough: no wrapper/label chrome.
    expect(container.querySelectorAll('input').length).toBe(1);
    expect(container.querySelector('label')).toBeNull();
    // The DS onChange contract passes (value, event); callers read files off the event.
    fireEvent.change(el, { target: { files: [] } });
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][1]).toBeTruthy();
  });

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
    expect(addons[0]).toHaveStyle({ borderTopRightRadius: '0px' });
    expect(addons[1]).toHaveStyle({ marginLeft: '-1px' });

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
    expect(nonCompactAddons[1]).toHaveStyle({ marginLeft: '8px' });
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
