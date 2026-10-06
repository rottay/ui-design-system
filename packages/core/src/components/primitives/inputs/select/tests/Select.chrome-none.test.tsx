import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import ModernSelect from '../engines/modern';
import { Select } from '..';

const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];
const triggerOf = (container: HTMLElement) => container.querySelector("[data-part='trigger']") as HTMLElement;

afterEach(() => cleanup());

describe('Modern Select chrome="none"', () => {
  it.each([
    ['native', {}],
    ['custom', { forceCustomDropdown: true }],
  ])('stamps nothing by default on the %s trigger', (_path, extra) => {
    const { container } = render(<ModernSelect aria-label="Status" options={OPTIONS} {...extra} />);
    expect(triggerOf(container).hasAttribute('data-chrome')).toBe(false);
  });

  it.each([
    ['native', {}, 'SELECT'],
    ['custom', { forceCustomDropdown: true }, 'DIV'],
  ])('stamps the %s trigger, its paint owner, and leaks no prop', (_path, extra, tag) => {
    const { container } = render(<ModernSelect chrome="none" aria-label="Status" options={OPTIONS} {...extra} />);
    const trigger = triggerOf(container);
    expect(trigger.tagName).toBe(tag);
    expect(trigger.getAttribute('data-chrome')).toBe('none');
    expect(container.querySelectorAll('[data-chrome]')).toHaveLength(1);
    expect(container.querySelector('[chrome]')).toBeNull();
  });

  it('keeps the behaviour contract: change, focus, aria-invalid and the forwarded ref', () => {
    const onChange = vi.fn();
    const onFocus = vi.fn();
    const ref = React.createRef<HTMLElement>();
    render(
      <ModernSelect ref={ref} chrome="none" aria-label="Status" placeholder="" status="error" options={OPTIONS} onChange={onChange} onFocus={onFocus} />,
    );
    const select = screen.getByRole('combobox', { name: 'Status' });
    expect(ref.current).toBe(select);
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAttribute('data-status', 'error');
    fireEvent.focus(select);
    fireEvent.change(select, { target: { value: 'b' } });
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('b', OPTIONS[1]);
  });
});

describe('Select onKeyDown', () => {
  it('reaches the native trigger directly, which consumes nothing', () => {
    const seen: Array<[string, boolean]> = [];
    render(
      <ModernSelect aria-label="Status" options={OPTIONS} onKeyDown={(event) => seen.push([event.key, event.defaultPrevented])} />,
    );
    const select = screen.getByRole('combobox', { name: 'Status' });
    for (const key of ['Enter', 'Escape', 'Tab', 'ArrowDown']) fireEvent.keyDown(select, { key });
    expect(seen).toEqual([
      ['Enter', false],
      ['Escape', false],
      ['Tab', false],
      ['ArrowDown', false],
    ]);
  });

  it('runs after the custom trigger handles the key, and defaultPrevented says whether it consumed it', () => {
    const seen: Array<[string, boolean, string | null]> = [];
    render(
      <ModernSelect
        aria-label="Status"
        options={OPTIONS}
        forceCustomDropdown
        onKeyDown={(event) => seen.push([event.key, event.defaultPrevented, screen.getByRole('combobox', { name: 'Status' }).getAttribute('aria-expanded')])}
      />,
    );
    const trigger = screen.getByRole('combobox', { name: 'Status' });
    for (const key of ['Tab', 'ArrowDown', 'Tab', 'Escape', 'a']) fireEvent.keyDown(trigger, { key });
    // The open list's Escape belongs to the overlay: it closes the list and never reaches the caller.
    expect(seen).toEqual([
      ['Tab', false, 'false'],
      ['ArrowDown', true, 'false'],
      ['Tab', false, 'true'],
      ['a', true, 'false'],
    ]);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('Select chrome on the frozen engines (E5)', () => {
  const normalise = (html: string) => html.replace(/(rc_select_|select-|_r_)[\w-]*/g, '$1#');

  it.each(['classic', 'rustic'] as const)('the %s engine renders the same DOM with and without chrome', async (engine) => {
    const plain = renderWithEngine(<Select engine={engine} aria-label="Status" options={OPTIONS} value="a" />, engine);
    await screen.findAllByText('Alpha');
    const reference = normalise(plain.container.innerHTML);
    plain.unmount();
    const chromeless = renderWithEngine(<Select engine={engine} chrome="none" aria-label="Status" options={OPTIONS} value="a" />, engine);
    await screen.findAllByText('Alpha');
    expect(chromeless.container.querySelector('[chrome], [data-chrome]')).toBeNull();
    expect(normalise(chromeless.container.innerHTML)).toBe(reference);
  });

  it('still reaches the Modern engine through the factory', async () => {
    const { container } = renderWithEngine(<Select engine="modern" chrome="none" aria-label="Status" options={OPTIONS} />, 'modern');
    await screen.findByRole('combobox', { name: 'Status' });
    expect(triggerOf(container).getAttribute('data-chrome')).toBe('none');
  });
});
