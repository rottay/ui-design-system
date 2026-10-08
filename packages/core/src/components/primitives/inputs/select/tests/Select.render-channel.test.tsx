/**
 * The render channel (E-3): `renderOption`, `renderValue` and `listboxLabel` replace content only,
 * and `textValue`/`lang`/`dir` are option data. Unset, the markup is the pre-channel markup.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import ModernSelect from '../engines/modern';
import { Select } from '..';
import type { SelectOption, SelectOptionRenderState, SelectValueRenderState } from '../contracts';
import { renderWithEngine } from '@tests/support/engine';

const OPTIONS: SelectOption[] = [
  { value: 'ada', label: 'Ada Lovelace', description: 'Analyst' },
  { value: 'grace', label: 'Grace Hopper', icon: <span>G</span> },
  { value: 'alan', label: 'Alan Turing', disabled: true },
];

/** Captured at the lot's base with the same fixtures; the listbox id prefix is normalised to SELECT. */
const PRE_CHANNEL_MARKUP = {
  single: "<div class=\"ds-select-shell ds-select-shell--modern \" data-part=\"root\" data-size=\"md\" data-mode=\"single\"><div aria-label=\"Owner\" data-part=\"trigger\" data-variant=\"outline\" tabindex=\"0\" role=\"combobox\" aria-expanded=\"false\" aria-haspopup=\"listbox\"><div data-part=\"trigger-value\"><span data-part=\"value\" data-mode=\"single\" title=\"Ada Lovelace\">Ada Lovelace</span></div><div data-part=\"trigger-actions\"><button type=\"button\" aria-label=\"Clear selection\" tabindex=\"-1\" data-part=\"clear-button\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"13\" height=\"13\" fill=\"currentColor\" viewBox=\"0 0 256 256\" class=\"rottay-icon rottay-semantic-icon\" focusable=\"false\" aria-hidden=\"true\" data-asset-class=\"semantic-icon\" data-icon-name=\"action.close\" data-icon-role=\"control\" data-icon-state=\"idle\" data-icon-tone=\"default\" data-icon-weight=\"regular\" data-icon-mirrored=\"false\"><path d=\"M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z\"></path></svg></button><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 256 256\" class=\"rottay-icon rottay-semantic-icon\" focusable=\"false\" aria-hidden=\"true\" data-part=\"arrow-icon\" data-asset-class=\"semantic-icon\" data-icon-name=\"navigation.down\" data-icon-role=\"navigation\" data-icon-state=\"idle\" data-icon-tone=\"default\" data-icon-weight=\"regular\" data-icon-mirrored=\"false\"><path d=\"M205.66,149.66l-72,72a8,8,0,0,1-11.32,0l-72-72a8,8,0,0,1,11.32-11.32L120,196.69V40a8,8,0,0,1,16,0V196.69l58.34-58.35a8,8,0,0,1,11.32,11.32Z\"></path></svg></div></div></div>",
  tags: "<div class=\"ds-select-shell ds-select-shell--modern \" data-part=\"root\" data-size=\"md\" data-mode=\"multiple\"><div aria-label=\"Watchers\" data-part=\"trigger\" data-variant=\"outline\" tabindex=\"0\" role=\"combobox\" aria-expanded=\"false\" aria-haspopup=\"listbox\"><div data-part=\"trigger-value\"><div data-part=\"value\" data-mode=\"multiple\"><span data-part=\"tag\"><span data-part=\"tag-label\" title=\"Ada Lovelace\">Ada Lovelace</span><button type=\"button\" tabindex=\"-1\" aria-label=\"Remove Ada Lovelace\" data-part=\"tag-remove\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"10\" height=\"10\" fill=\"currentColor\" viewBox=\"0 0 256 256\" class=\"rottay-icon rottay-semantic-icon\" focusable=\"false\" aria-hidden=\"true\" data-asset-class=\"semantic-icon\" data-icon-name=\"action.close\" data-icon-role=\"control\" data-icon-state=\"idle\" data-icon-tone=\"default\" data-icon-weight=\"regular\" data-icon-mirrored=\"false\"><path d=\"M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z\"></path></svg></button></span><span data-part=\"tag\"><span data-part=\"tag-label\" title=\"Grace Hopper\">Grace Hopper</span><button type=\"button\" tabindex=\"-1\" aria-label=\"Remove Grace Hopper\" data-part=\"tag-remove\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"10\" height=\"10\" fill=\"currentColor\" viewBox=\"0 0 256 256\" class=\"rottay-icon rottay-semantic-icon\" focusable=\"false\" aria-hidden=\"true\" data-asset-class=\"semantic-icon\" data-icon-name=\"action.close\" data-icon-role=\"control\" data-icon-state=\"idle\" data-icon-tone=\"default\" data-icon-weight=\"regular\" data-icon-mirrored=\"false\"><path d=\"M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z\"></path></svg></button></span></div></div><div data-part=\"trigger-actions\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 256 256\" class=\"rottay-icon rottay-semantic-icon\" focusable=\"false\" aria-hidden=\"true\" data-part=\"arrow-icon\" data-asset-class=\"semantic-icon\" data-icon-name=\"navigation.down\" data-icon-role=\"navigation\" data-icon-state=\"idle\" data-icon-tone=\"default\" data-icon-weight=\"regular\" data-icon-mirrored=\"false\"><path d=\"M205.66,149.66l-72,72a8,8,0,0,1-11.32,0l-72-72a8,8,0,0,1,11.32-11.32L120,196.69V40a8,8,0,0,1,16,0V196.69l58.34-58.35a8,8,0,0,1,11.32,11.32Z\"></path></svg></div></div></div>",
  native: "<div class=\"ds-select-shell ds-select-shell--modern \" data-part=\"root\" data-size=\"md\"><select data-variant=\"outline\" aria-label=\"Native\" data-part=\"trigger\"><option value=\"\" disabled=\"\">Select an option</option><option value=\"ada\" selected=\"\">Ada Lovelace</option><option value=\"grace\">Grace Hopper</option><option value=\"alan\" disabled=\"\">Alan Turing</option></select><span data-part=\"native-arrow\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 256 256\" class=\"rottay-icon rottay-semantic-icon\" focusable=\"false\" aria-hidden=\"true\" data-asset-class=\"semantic-icon\" data-icon-name=\"navigation.down\" data-icon-role=\"navigation\" data-icon-state=\"idle\" data-icon-tone=\"default\" data-icon-weight=\"regular\" data-icon-mirrored=\"false\"><path d=\"M205.66,149.66l-72,72a8,8,0,0,1-11.32,0l-72-72a8,8,0,0,1,11.32-11.32L120,196.69V40a8,8,0,0,1,16,0V196.69l58.34-58.35a8,8,0,0,1,11.32,11.32Z\"></path></svg></span></div>",
  openSingle: "<div role=\"listbox\" id=\"SELECT-listbox\" data-part=\"option-list\"><div role=\"option\" id=\"SELECT-option-0\" aria-selected=\"true\" data-active=\"true\" data-part=\"option\" data-selected=\"true\"><span data-part=\"option-content\" data-has-description=\"true\"><span data-part=\"option-label\">Ada Lovelace</span><span data-part=\"option-description\">Analyst</span></span><span data-part=\"option-check\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"14\" height=\"14\" fill=\"currentColor\" viewBox=\"0 0 256 256\" class=\"rottay-icon rottay-semantic-icon\" focusable=\"false\" aria-hidden=\"true\" data-asset-class=\"semantic-icon\" data-icon-name=\"status.success\" data-icon-role=\"status\" data-icon-state=\"idle\" data-icon-tone=\"success\" data-icon-weight=\"duotone\" data-icon-mirrored=\"false\"><path d=\"M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z\" opacity=\"0.2\"></path><path d=\"M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z\"></path></svg></span></div><div role=\"option\" id=\"SELECT-option-1\" aria-selected=\"false\" data-part=\"option\"><span data-part=\"option-icon\"><span>G</span></span><span data-part=\"option-content\"><span data-part=\"option-label\">Grace Hopper</span></span></div><div role=\"option\" id=\"SELECT-option-2\" aria-selected=\"false\" aria-disabled=\"true\" data-part=\"option\" data-disabled=\"true\"><span data-part=\"option-content\"><span data-part=\"option-label\">Alan Turing</span></span></div></div>",
  openMultiple: "<div role=\"listbox\" id=\"SELECT-listbox\" aria-multiselectable=\"true\" data-part=\"option-list\"><div role=\"option\" id=\"SELECT-option-0\" aria-selected=\"true\" data-active=\"true\" data-part=\"option\" data-selected=\"true\"><span data-part=\"option-checkbox\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"14\" height=\"14\" fill=\"currentColor\" viewBox=\"0 0 256 256\" class=\"rottay-icon rottay-semantic-icon\" focusable=\"false\" aria-hidden=\"true\" data-asset-class=\"semantic-icon\" data-icon-name=\"status.success\" data-icon-role=\"status\" data-icon-state=\"idle\" data-icon-tone=\"success\" data-icon-weight=\"duotone\" data-icon-mirrored=\"false\"><path d=\"M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z\" opacity=\"0.2\"></path><path d=\"M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z\"></path></svg></span><span data-part=\"option-content\" data-has-description=\"true\"><span data-part=\"option-label\">Ada Lovelace</span><span data-part=\"option-description\">Analyst</span></span></div><div role=\"option\" id=\"SELECT-option-1\" aria-selected=\"false\" data-part=\"option\"><span data-part=\"option-checkbox\"></span><span data-part=\"option-icon\"><span>G</span></span><span data-part=\"option-content\"><span data-part=\"option-label\">Grace Hopper</span></span></div><div role=\"option\" id=\"SELECT-option-2\" aria-selected=\"false\" aria-disabled=\"true\" data-part=\"option\" data-disabled=\"true\"><span data-part=\"option-checkbox\"></span><span data-part=\"option-content\"><span data-part=\"option-label\">Alan Turing</span></span></div></div>",
};

function openListboxHtml(ui: React.ReactElement): string {
  const view = render(ui);
  fireEvent.click(view.getByRole('combobox'));
  const listbox = document.querySelector('[role="listbox"]')!;
  const prefix = listbox.id.replace(/-listbox$/, '');
  const html = listbox.outerHTML.split(prefix).join('SELECT');
  view.unmount();
  return html;
}

const trigger = (): HTMLElement => screen.getByRole('combobox');
const rows = (): HTMLElement[] => screen.getAllByRole('option');
const activeRow = (): HTMLElement | null => document.querySelector('[data-part="option"][data-active="true"]');
const probe = (_option: SelectOption, defaultContent: React.ReactNode) => <span data-rc="">{defaultContent}</span>;

afterEach(() => vi.restoreAllMocks());

describe('T-1 default identity: unset, the markup is the pre-channel markup', () => {
  it('renders the closed custom, tag and native paths byte for byte', () => {
    expect(renderToStaticMarkup(<ModernSelect options={OPTIONS} defaultValue="ada" forceCustomDropdown clearable aria-label="Owner" />)).toBe(PRE_CHANNEL_MARKUP.single);
    expect(renderToStaticMarkup(<ModernSelect options={OPTIONS} defaultValue={['ada', 'grace']} multiple aria-label="Watchers" />)).toBe(PRE_CHANNEL_MARKUP.tags);
    expect(renderToStaticMarkup(<ModernSelect options={OPTIONS} defaultValue="ada" aria-label="Native" />)).toBe(PRE_CHANNEL_MARKUP.native);
  });

  it('renders the open listbox byte for byte', () => {
    expect(openListboxHtml(<ModernSelect options={OPTIONS} defaultValue="ada" forceCustomDropdown aria-label="Owner" />)).toBe(PRE_CHANNEL_MARKUP.openSingle);
    expect(openListboxHtml(<ModernSelect options={OPTIONS} defaultValue={['ada']} multiple aria-label="Watchers" />)).toBe(PRE_CHANNEL_MARKUP.openMultiple);
  });
});

describe('T-2 path', () => {
  it.each([
    ['renderOption', { renderOption: probe }],
    ['renderValue', { renderValue: probe }],
  ])('%s alone renders the custom listbox', (_name, extra) => {
    const { container } = render(<ModernSelect options={OPTIONS} aria-label="Owner" {...extra} />);
    expect(container.querySelector('select')).toBeNull();
    expect(trigger().tagName).toBe('DIV');
  });

  it('listboxLabel alone keeps the native path', () => {
    const { container } = render(<ModernSelect options={OPTIONS} aria-label="Owner" listboxLabel="People" />);
    expect(container.querySelector('select')).not.toBeNull();
    expect(container.querySelector('[aria-label="People"]')).toBeNull();
  });
});

describe('T-3 content scope', () => {
  it('replaces only the option content; the row, its ARIA and its affordances stay Select\'s', () => {
    render(
      <ModernSelect options={OPTIONS} defaultValue="ada" forceCustomDropdown aria-label="Owner" renderOption={() => <span data-probe="" />} />,
    );
    fireEvent.click(trigger());
    const [ada, grace, alan] = rows();
    expect(ada).toHaveAttribute('id');
    expect(ada).toHaveAttribute('aria-selected', 'true');
    expect(ada).toHaveAttribute('data-active', 'true');
    expect(alan).toHaveAttribute('aria-disabled', 'true');
    expect(ada.querySelector('[data-part="option-check"]')).not.toBeNull();
    expect(grace.querySelector('[data-part="option-icon"]')).not.toBeNull();
    for (const row of [ada, grace, alan]) {
      const content = row.querySelector('[data-part="option-content"]')!;
      expect(content.children).toHaveLength(1);
      expect(content.firstElementChild).toHaveAttribute('data-probe');
      expect(content.hasAttribute('data-has-description')).toBe(false);
      expect(row.querySelector('[data-part="option-label"], [data-part="option-description"]')).toBeNull();
    }
  });

  it('keeps the multiple checkbox around custom content', () => {
    render(<ModernSelect options={OPTIONS} defaultValue={['ada']} multiple aria-label="Watchers" renderOption={() => <span data-probe="" />} />);
    fireEvent.click(trigger());
    expect(rows()[0].querySelector('[data-part="option-checkbox"]')).not.toBeNull();
  });

  it('replaces only the value content; the trigger, clear, chevron and tag removal stay Select\'s', () => {
    const { container, unmount } = render(
      <ModernSelect options={OPTIONS} defaultValue="ada" forceCustomDropdown clearable aria-label="Owner" renderValue={() => <span data-probe="" />} />,
    );
    const value = container.querySelector('[data-part="value"][data-mode="single"]')!;
    expect(value.children).toHaveLength(1);
    expect(value.firstElementChild).toHaveAttribute('data-probe');
    expect(value).toHaveAttribute('title', 'Ada Lovelace');
    expect(screen.getByRole('button', { name: 'Clear selection' })).toBeInTheDocument();
    expect(container.querySelector('[data-part="arrow-icon"]')).not.toBeNull();
    unmount();

    const tags = render(
      <ModernSelect options={OPTIONS} defaultValue={['ada', 'grace']} multiple aria-label="Watchers" renderValue={() => <span data-probe="" />} />,
    );
    const labels = tags.container.querySelectorAll('[data-part="tag-label"]');
    expect(labels).toHaveLength(2);
    labels.forEach((label) => expect(label.firstElementChild).toHaveAttribute('data-probe'));
    expect(screen.getByRole('button', { name: 'Remove Ada Lovelace' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Grace Hopper' })).toBeInTheDocument();
  });

  it('hands the default content to the hook so a caller can wrap it', () => {
    render(<ModernSelect options={OPTIONS} forceCustomDropdown aria-label="Owner" renderOption={probe} />);
    fireEvent.click(trigger());
    const wrapped = rows()[0].querySelector('[data-rc] > [data-part="option-label"]');
    expect(wrapped).toHaveTextContent('Ada Lovelace');
    expect(rows()[0].querySelector('[data-rc] > [data-part="option-description"]')).toHaveTextContent('Analyst');
  });
});

describe('T-4 state facts', () => {
  it('reports selected, active, disabled, index and multiple, frozen, as the row stamps them', () => {
    const seen: Array<{ label: string; state: SelectOptionRenderState }> = [];
    const spy = (option: SelectOption, defaultContent: React.ReactNode, state: SelectOptionRenderState) => {
      seen.push({ label: String(option.label), state });
      return defaultContent;
    };
    const groups = [
      { label: 'People', options: [{ value: 'ada', label: 'Ada Lovelace' }, { value: 'grace', label: 'Grace Hopper' }] },
      { label: 'Archived', disabled: true, options: [{ value: 'alan', label: 'Alan Turing' }] },
    ];
    render(<ModernSelect optionGroups={groups} defaultValue="grace" aria-label="Owner" renderOption={spy} />);
    fireEvent.click(trigger());

    const check = () => {
      const latest = new Map(seen.map((entry) => [entry.label, entry.state]));
      for (const row of rows()) {
        const state = latest.get(row.textContent!.trim())!;
        expect(Object.isFrozen(state)).toBe(true);
        expect(state.selected).toBe(row.getAttribute('aria-selected') === 'true');
        expect(state.active).toBe(row.getAttribute('data-active') === 'true');
        expect(state.active).toBe(trigger().getAttribute('aria-activedescendant') === row.id);
        expect(state.disabled).toBe(row.getAttribute('aria-disabled') === 'true');
        expect(state.multiple).toBe(false);
        expect(state.labelProps).toEqual({});
      }
    };

    check();
    const latestIndex = (label: string) => seen.filter((entry) => entry.label === label).at(-1)!.state.index;
    expect(latestIndex('Ada Lovelace')).toBe(1);
    expect(latestIndex('Alan Turing')).toBe(4);
    expect(seen.filter((entry) => entry.label === 'Alan Turing').at(-1)!.state.disabled).toBe(true);

    fireEvent.keyDown(trigger(), { key: 'ArrowUp' });
    check();
    fireEvent.keyDown(trigger(), { key: 'ArrowDown' });
    check();
    fireEvent.mouseEnter(rows()[0]);
    check();
    fireEvent.click(rows()[0]);
    fireEvent.click(trigger());
    check();
    expect(seen.filter((entry) => entry.label === 'Ada Lovelace').at(-1)!.state.selected).toBe(true);
  });

  it('reports multiple, and the value placement, as facts', () => {
    const optionStates: SelectOptionRenderState[] = [];
    const valueStates: SelectValueRenderState[] = [];
    render(
      <ModernSelect
        options={OPTIONS}
        defaultValue={['ada']}
        multiple
        aria-label="Watchers"
        renderOption={(_o, d, state) => (optionStates.push(state), d)}
        renderValue={(_o, d, state) => (valueStates.push(state), d)}
      />,
    );
    fireEvent.click(trigger());
    expect(optionStates.every((state) => state.multiple)).toBe(true);
    expect(valueStates.at(-1)).toEqual({ placement: 'tag', disabled: false, labelProps: {} });
    expect(Object.isFrozen(valueStates.at(-1))).toBe(true);

    const single: SelectValueRenderState[] = [];
    render(<ModernSelect options={OPTIONS} defaultValue="ada" disabled aria-label="Locked" renderValue={(_o, d, state) => (single.push(state), d)} />);
    expect(single.at(-1)).toEqual({ placement: 'single', disabled: true, labelProps: {} });
  });

  it('carries no function in either state type', () => {
    type FunctionKeys<T> = { [K in keyof T]-?: T[K] extends (...args: never[]) => unknown ? K : never }[keyof T];
    expectTypeOf<FunctionKeys<SelectOptionRenderState>>().toEqualTypeOf<never>();
    expectTypeOf<FunctionKeys<SelectValueRenderState>>().toEqualTypeOf<never>();
  });
});

describe('T-6 the text source is data, never rendered output', () => {
  const RICH: SelectOption[] = [
    { value: 'alpha', label: <strong>Alpha</strong>, textValue: 'Alpha' },
    { value: 'beta', label: <strong>Beta</strong>, textValue: 'Beta' },
  ];

  it('reaches a rich label through textValue: type-ahead, search, tokens, remove label and title', () => {
    const typeahead = render(<ModernSelect options={RICH} forceCustomDropdown aria-label="Letters" />);
    fireEvent.click(trigger());
    fireEvent.keyDown(trigger(), { key: 'b' });
    expect(activeRow()).toHaveTextContent('Beta');
    typeahead.unmount();

    const search = render(<ModernSelect options={RICH} searchable aria-label="Letters" />);
    fireEvent.click(trigger());
    fireEvent.change(screen.getByRole('combobox', { name: 'Search options' }), { target: { value: 'alp' } });
    expect(rows().map((row) => row.textContent)).toEqual(['Alpha']);
    search.unmount();

    const onChange = vi.fn();
    const tokens = render(<ModernSelect options={RICH} multiple searchable tokenSeparators={[',']} onChange={onChange} aria-label="Letters" />);
    fireEvent.click(trigger());
    fireEvent.change(screen.getByRole('combobox', { name: 'Search options' }), { target: { value: 'alpha,' } });
    expect(onChange).toHaveBeenLastCalledWith(['alpha'], [RICH[0]]);
    tokens.unmount();

    const tags = render(<ModernSelect options={RICH} defaultValue={['alpha']} multiple aria-label="Letters" />);
    expect(screen.getByRole('button', { name: 'Remove Alpha' })).toBeInTheDocument();
    expect(tags.container.querySelector('[data-part="tag-label"]')).toHaveAttribute('title', 'Alpha');
    tags.unmount();

    const single = render(<ModernSelect options={RICH} defaultValue="alpha" forceCustomDropdown aria-label="Letters" />);
    expect(single.container.querySelector('[data-part="value"]')).toHaveAttribute('title', 'Alpha');
  });

  it('warns once per Select when a rich label has no textValue, and the option stays unreachable', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const bare: SelectOption[] = [
      { value: 'alpha', label: <strong>Alpha</strong> },
      { value: 'beta', label: <strong>Beta</strong> },
    ];
    const view = render(<ModernSelect options={bare} defaultValue={['alpha']} multiple searchable aria-label="Letters" />);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      'Select option alpha has a non-text label and no textValue; it cannot be reached by type-ahead or search.',
    );
    expect(view.container.querySelector('[data-part="tag-remove"]')).toHaveAttribute('aria-label', 'Remove ');
    fireEvent.click(trigger());
    fireEvent.change(screen.getByRole('combobox', { name: 'Search options' }), { target: { value: 'b' } });
    expect(screen.queryAllByRole('option').filter((row) => row.getAttribute('data-part') === 'option')).toHaveLength(0);
    view.rerender(<ModernSelect options={[...bare]} defaultValue={['alpha']} multiple searchable aria-label="Letters" />);
    expect(warn).toHaveBeenCalledTimes(1);
    view.unmount();

    render(<ModernSelect options={bare} forceCustomDropdown aria-label="Letters" />);
    expect(warn).toHaveBeenCalledTimes(2);
    fireEvent.click(trigger());
    const before = activeRow()?.id;
    fireEvent.keyDown(trigger(), { key: 'b' });
    expect(activeRow()?.id).toBe(before);
  });

  it('does not warn for text labels', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<ModernSelect options={[{ value: 1, label: 1 }, { value: 'b', label: 'Beta' }]} forceCustomDropdown aria-label="Mixed" />);
    expect(warn).not.toHaveBeenCalled();
  });

  it('never reads rendered output: a hook painting ZZZ is reached by its textValue only', () => {
    render(
      <ModernSelect
        options={[
          { value: 'one', label: 'One' },
          { value: 'alpha', label: 'Alpha', textValue: 'Alpha' },
        ]}
        forceCustomDropdown
        aria-label="Letters"
        renderOption={(option) => <span>{option.value === 'alpha' ? 'ZZZ' : 'One'}</span>}
      />,
    );
    fireEvent.click(trigger());
    fireEvent.keyDown(trigger(), { key: 'z' });
    expect(activeRow()).toHaveTextContent('One');
    fireEvent.keyDown(trigger(), { key: 'a' });
    expect(activeRow()).toHaveTextContent('ZZZ');
  });

  it('feeds the native option its text when the path stays native', () => {
    const { container } = render(<ModernSelect options={[{ value: 'alpha', label: <b>Alpha</b>, textValue: 'Alpha' }]} aria-label="Letters" />);
    expect(container.querySelector('option[value="alpha"]')).toHaveTextContent('Alpha');
  });
});

describe('T-7 lang and dir live in the option data and land on the label text only', () => {
  const ARABIC: SelectOption[] = [
    { value: 'ar', label: 'العربية', lang: 'ar', description: 'Arabic' },
    { value: 'en', label: 'English' },
    { value: 'he', label: 'עברית', lang: 'he', dir: 'rtl' },
  ];

  it('stamps lang and dir=auto on option-label, never on the row or the description', () => {
    render(<ModernSelect options={ARABIC} forceCustomDropdown aria-label="Language" />);
    fireEvent.click(trigger());
    const [ar, en, he] = rows();
    const label = (row: HTMLElement) => row.querySelector('[data-part="option-label"]')!;
    expect(label(ar)).toHaveAttribute('lang', 'ar');
    expect(label(ar)).toHaveAttribute('dir', 'auto');
    expect(ar.hasAttribute('lang') || ar.hasAttribute('dir')).toBe(false);
    expect(ar.querySelector('[data-part="option-description"]')!.hasAttribute('lang')).toBe(false);
    expect(label(en).hasAttribute('lang') || label(en).hasAttribute('dir')).toBe(false);
    expect(label(he)).toHaveAttribute('dir', 'rtl');
    expect(trigger().hasAttribute('lang') || trigger().hasAttribute('dir')).toBe(false);
  });

  it('stamps them on the single value, each tag label and the native option', () => {
    const single = render(<ModernSelect options={ARABIC} defaultValue="ar" forceCustomDropdown aria-label="Language" />);
    const value = single.container.querySelector('[data-part="value"]')!;
    expect(value).toHaveAttribute('lang', 'ar');
    expect(value).toHaveAttribute('dir', 'auto');
    single.unmount();

    const tags = render(<ModernSelect options={ARABIC} defaultValue={['ar', 'en']} multiple aria-label="Languages" />);
    const [arTag, enTag] = tags.container.querySelectorAll('[data-part="tag-label"]');
    expect(arTag).toHaveAttribute('lang', 'ar');
    expect(enTag.hasAttribute('lang') || enTag.hasAttribute('dir')).toBe(false);
    tags.unmount();

    const native = render(<ModernSelect options={ARABIC} aria-label="Language" />);
    expect(native.container.querySelector('option[value="ar"]')).toHaveAttribute('lang', 'ar');
    expect(native.container.querySelector('option[value="ar"]')).toHaveAttribute('dir', 'auto');
    expect(native.container.querySelector('option[value="en"]')!.hasAttribute('lang')).toBe(false);
  });

  it('hands the same attributes to the hooks as labelProps', () => {
    const optionProps: Record<string, unknown> = {};
    const valueProps: Record<string, unknown> = {};
    const { container } = render(
      <ModernSelect
        options={ARABIC}
        defaultValue="ar"
        aria-label="Language"
        renderOption={(option, _d, state) => {
          optionProps[String(option.value)] = state.labelProps;
          return <span {...state.labelProps}>{option.label}</span>;
        }}
        renderValue={(option, _d, state) => {
          valueProps[String(option.value)] = state.labelProps;
          return <span {...state.labelProps}>{option.label}</span>;
        }}
      />,
    );
    fireEvent.click(trigger());
    expect(optionProps).toEqual({ ar: { lang: 'ar', dir: 'auto' }, en: {}, he: { lang: 'he', dir: 'rtl' } });
    expect(valueProps).toEqual({ ar: { lang: 'ar', dir: 'auto' } });
    const value = container.querySelector('[data-part="value"]')!;
    expect(value.hasAttribute('lang')).toBe(false);
    expect(value.firstElementChild).toHaveAttribute('lang', 'ar');
  });
});

describe('T-8 disabled under the channel', () => {
  it('does not commit a disabled row, skips it with the arrows and keeps aria-disabled', () => {
    const onChange = vi.fn();
    render(<ModernSelect options={[OPTIONS[0]!, OPTIONS[2]!, OPTIONS[1]!]} forceCustomDropdown aria-label="Owner" onChange={onChange} renderOption={probe} />);
    fireEvent.click(trigger());
    const alan = rows()[1]!;
    expect(alan).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(alan);
    expect(onChange).not.toHaveBeenCalled();
    expect(activeRow()).toHaveTextContent('Ada Lovelace');
    fireEvent.keyDown(trigger(), { key: 'ArrowDown' });
    expect(activeRow()).toHaveTextContent('Grace Hopper');
  });
});

describe('T-10 Modern only', () => {
  const normalise = (html: string) => html.replace(/(rc_select_|select-|_r_)[\w-]*/g, '$1#');
  const DATA: SelectOption[] = [
    { value: 'a', label: 'Alpha', textValue: 'Alpha', lang: 'en', dir: 'ltr' },
    { value: 'b', label: 'Beta', lang: 'es' },
  ];
  const PLAIN: SelectOption[] = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
  ];

  it.each(['classic', 'rustic'] as const)('the %s engine renders the same DOM with and without the channel', async (engine) => {
    const plain = renderWithEngine(<Select engine={engine} aria-label="Status" options={PLAIN} value="a" />, engine);
    await screen.findAllByText('Alpha');
    const reference = normalise(plain.container.innerHTML);
    plain.unmount();
    const channelled = renderWithEngine(
      <Select engine={engine} aria-label="Status" options={DATA} value="a" renderOption={probe} renderValue={probe} listboxLabel="Statuses" />,
      engine,
    );
    await screen.findAllByText('Alpha');
    expect(channelled.container.querySelector('[data-rc], [lang], [dir]')).toBeNull();
    expect(normalise(channelled.container.innerHTML)).toBe(reference);
  });

  it('reaches the Modern engine through the factory', async () => {
    renderWithEngine(<Select engine="modern" aria-label="Status" options={PLAIN} value="a" renderValue={probe} />, 'modern');
    const combobox = await screen.findByRole('combobox', { name: 'Status' });
    expect(combobox.querySelector('[data-rc]')).not.toBeNull();
  });
});

describe('T-11 listboxLabel', () => {
  it('names the open listbox when set', () => {
    render(<ModernSelect options={OPTIONS} forceCustomDropdown aria-label="Owner" listboxLabel="People" />);
    fireEvent.click(trigger());
    expect(screen.getByRole('listbox', { name: 'People' })).toBeInTheDocument();
  });

  it('stamps no name when unset', () => {
    render(<ModernSelect options={OPTIONS} forceCustomDropdown aria-label="Owner" />);
    fireEvent.click(trigger());
    expect(screen.getByRole('listbox').hasAttribute('aria-label')).toBe(false);
  });
});
