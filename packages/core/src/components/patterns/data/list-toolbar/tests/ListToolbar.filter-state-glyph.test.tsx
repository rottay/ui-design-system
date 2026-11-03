/**
 * @fileoverview Pins the modern chip's lifecycle glyph: which governed status
 * role each `ActiveFilterState` resolves to, that it is sized from the icon
 * ramp rather than a pixel literal, and that an applied chip carries no glyph
 * at all (an empty icon slot is still a slot in the composed Tag). Also pins
 * that each rail trigger reports the same lifecycle as its strip chip in both
 * layouts, reading only OWN `activeFilters` / `filterStates` entries.
 */

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, screen, waitFor, within } from '@testing-library/react';

import { PatternListToolbar } from '..';
import type { ActiveFilterState, FilterPillConfig, ListToolbarProps } from '../contracts';
import { renderWithEngine } from '@tests/support/engine';
import { mockMatchMedia } from '@tests/support/browser/match-media';

const PILLS = [
  {
    key: 'status',
    label: 'Status',
    value: 'all',
    options: [
      { label: 'All', value: 'all' },
      { label: 'Live', value: 'live' },
    ],
  },
];

function baseProps(filterStates: Record<string, ActiveFilterState>) {
  return {
    title: 'Candidates',
    totalCount: 42,
    search: '',
    onSearchChange: vi.fn(),
    filterPills: PILLS,
    activeFilters: { status: 'live' },
    activeFilterCount: 1,
    onFilterChange: vi.fn(),
    onClearFilters: vi.fn(),
    viewMode: 'list' as const,
    onViewModeChange: vi.fn(),
    density: 'comfortable' as const,
    onDensityChange: vi.fn(),
    primaryAction: { label: 'New candidate', onClick: vi.fn() },
    onExport: vi.fn(),
    filterStates,
  };
}

async function renderChip(state: ActiveFilterState): Promise<HTMLElement> {
  mockMatchMedia(1280);
  renderWithEngine(
    <PatternListToolbar engine="modern" {...baseProps({ status: state })} />,
    'modern',
  );
  const chip = (await screen.findAllByText('Live'))[0].closest(
    '.ds-list-toolbar__filter-chip',
  ) as HTMLElement;
  expect(chip).not.toBeNull();
  // P-88: the composed Tag keeps its own `root` part; the chip is found by the family class.
  expect(chip.getAttribute('data-part')).toBe('root');
  expect(document.querySelector('[data-part="filter-chip"]')).toBeNull();
  return chip;
}

/** The Tag's own close control also carries a glyph; the state glyph is the
 *  one outside it. */
function stateGlyph(chip: HTMLElement): Element | null {
  return (
    [...chip.querySelectorAll('[data-icon-name]')].find(
      (node) => !node.closest('[data-part="close"]'),
    ) ?? null
  );
}

describe('PatternListToolbar filter-state glyph', () => {
  afterEach(async () => {
    await act(async () => {
      document.documentElement.removeAttribute('dir');
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('resolves the draft state to the governed status.draft role', async () => {
    const chip = await renderChip('draft');
    expect(stateGlyph(chip)?.getAttribute('data-icon-name')).toBe('status.draft');
  });

  it('resolves the invalid state to the governed status.error role', async () => {
    const chip = await renderChip('invalid');
    expect(stateGlyph(chip)?.getAttribute('data-icon-name')).toBe('status.error');
  });

  it('sizes the glyph from the icon ramp, never a pixel literal', async () => {
    const chip = await renderChip('draft');
    const glyph = stateGlyph(chip) as SVGElement;
    for (const attribute of ['width', 'height']) {
      const value = glyph.getAttribute(attribute) ?? '';
      expect(value).toContain('--ds-icon-xs-size');
      expect(/^\d+(?:px)?$/u.test(value)).toBe(false);
    }
  });

  it('renders no glyph for an applied chip', async () => {
    const chip = await renderChip('applied');
    expect(stateGlyph(chip)).toBeNull();
  });
});

const RAIL_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Live', value: 'live' },
  { label: 'Paused', value: 'paused' },
];

function pill(key: string, label: string, value = 'live'): FilterPillConfig {
  return { key, label, value, options: RAIL_OPTIONS };
}

/** Every entry is OWN, `__proto__` included; an object-literal `__proto__`
 *  would set the prototype instead of creating an entry. */
function ownRecord<T>(entries: ReadonlyArray<readonly [string, T]>): Record<string, T> {
  const record: Record<string, T> = {};
  for (const [key, value] of entries) {
    Object.defineProperty(record, key, {
      value,
      enumerable: true,
      writable: true,
      configurable: true,
    });
  }
  return record;
}

type RailInput = Pick<ListToolbarProps, 'filterPills' | 'activeFilters' | 'filterStates'>;

const LAYOUTS = [
  { name: 'desktop', width: 1280, layout: 'full' },
  { name: 'compact', width: 390, layout: 'compact' },
] as const;

async function renderRail(width: number, layout: string, input: RailInput): Promise<HTMLElement> {
  mockMatchMedia(width);
  renderWithEngine(
    <PatternListToolbar
      engine="modern"
      title="Candidates"
      totalCount={42}
      search=""
      onSearchChange={vi.fn()}
      onFilterChange={vi.fn()}
      viewMode="list"
      onViewModeChange={vi.fn()}
      density="comfortable"
      onDensityChange={vi.fn()}
      {...input}
    />,
    'modern',
  );
  await screen.findByRole('textbox', { name: 'Search...' });
  const root = document.querySelector<HTMLElement>('.ds-pattern-list-toolbar__root');
  if (!root) throw new Error('ListToolbar root did not render');
  expect(root.getAttribute('data-container-layout')).toBe(layout);
  return root;
}

/** Scoped to this toolbar's own rail; awaits the lazily resolved Button. */
async function triggerState(root: HTMLElement, name: string): Promise<string | null> {
  const rail = await waitFor(() => {
    const node = root.querySelector<HTMLElement>('.ds-list-toolbar__filter-rail');
    if (!node) throw new Error('filter rail did not render');
    return node;
  });
  const button = await within(rail).findByRole('button', { name });
  const host = button.closest('.ds-list-toolbar__filter-trigger');
  if (!host) throw new Error(`no filter trigger named ${name}`);
  return host.getAttribute('data-filter-state');
}

function stripChips(root: HTMLElement): HTMLElement[] {
  const strip = root.querySelector('.ds-list-toolbar__filter-chips-strip');
  return strip ? [...strip.querySelectorAll<HTMLElement>('.ds-list-toolbar__filter-chip')] : [];
}

/** Awaits the lazily resolved Tag of the strip chip labelled `label`. */
async function chipFor(root: HTMLElement, label: string): Promise<HTMLElement> {
  return waitFor(() => {
    const chip = stripChips(root).find((node) => node.textContent?.includes(`${label}:`));
    if (!chip) throw new Error(`no strip chip labelled ${label}`);
    return chip;
  });
}

/** The chip's observable lifecycle: attribute, governed glyph and whether a
 *  visually hidden state word (outside the close control) is announced. */
function chipLifecycle(chip: HTMLElement) {
  return {
    state: chip.getAttribute('data-filter-state'),
    glyph: stateGlyph(chip)?.getAttribute('data-icon-name') ?? null,
    announced: [...chip.querySelectorAll('.ds-sr-only')].some(
      (node) => !node.closest('[data-part="close"]'),
    ),
  };
}

const APPLIED = { state: null, glyph: null, announced: false };
const DRAFT = { state: 'draft', glyph: 'status.draft', announced: true };
const INVALID = { state: 'invalid', glyph: 'status.error', announced: true };

describe.each(LAYOUTS)('PatternListToolbar rail lifecycle ($name)', ({ width, layout }) => {
  afterEach(async () => {
    await act(async () => {
      document.documentElement.removeAttribute('dir');
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('keeps each trigger on its chip lifecycle for ordinary keys', async () => {
    const root = await renderRail(width, layout, {
      filterPills: [
        pill('status', 'Status'),
        pill('stage', 'Stage', 'paused'),
        pill('region', 'Region'),
        pill('legacy', 'Legacy', 'retired'),
        pill('owner', 'Owner'),
      ],
      activeFilters: { status: 'live', stage: 'paused', region: 'live', legacy: 'retired' },
      filterStates: { status: 'draft', stage: 'invalid', owner: 'draft' },
    });

    expect(chipLifecycle(await chipFor(root, 'Status'))).toEqual(DRAFT);
    expect(stripChips(root)).toHaveLength(4);
    expect(await triggerState(root, 'Status: Live')).toBe('draft');
    expect(chipLifecycle(await chipFor(root, 'Stage'))).toEqual(INVALID);
    expect(await triggerState(root, 'Stage: Paused')).toBe('invalid');
    expect(chipLifecycle(await chipFor(root, 'Region'))).toEqual(APPLIED);
    expect(await triggerState(root, 'Region: Live')).toBeNull();
    // Orphaned value: no option resolves, so chip and trigger self-report invalid.
    expect(chipLifecycle(await chipFor(root, 'Legacy'))).toEqual(INVALID);
    expect(await triggerState(root, 'Legacy')).toBe('invalid');
    // A state entry without an active value yields no chip and no trigger state.
    expect(await triggerState(root, 'Owner: Live')).toBeNull();
  });

  it('honors explicit own entries named like Object.prototype members', async () => {
    const root = await renderRail(width, layout, {
      filterPills: [
        pill('constructor', 'Constructor'),
        pill('toString', 'ToString', 'paused'),
        pill('__proto__', 'Proto'),
      ],
      activeFilters: ownRecord<unknown>([
        ['constructor', 'live'],
        ['toString', 'paused'],
        ['__proto__', 'live'],
      ]),
      filterStates: ownRecord<ActiveFilterState>([
        ['constructor', 'draft'],
        ['toString', 'invalid'],
        ['__proto__', 'applied'],
      ]),
    });

    expect(chipLifecycle(await chipFor(root, 'Constructor'))).toEqual(DRAFT);
    expect(stripChips(root)).toHaveLength(3);
    expect(await triggerState(root, 'Constructor: Live')).toBe('draft');
    expect(chipLifecycle(await chipFor(root, 'ToString'))).toEqual(INVALID);
    expect(await triggerState(root, 'ToString: Paused')).toBe('invalid');
    expect(chipLifecycle(await chipFor(root, 'Proto'))).toEqual(APPLIED);
    expect(await triggerState(root, 'Proto: Live')).toBeNull();
  });

  it('keeps the empty-string key as an ordinary own entry', async () => {
    const root = await renderRail(width, layout, {
      filterPills: [pill('', 'Unnamed')],
      activeFilters: { '': 'live' },
      filterStates: { '': 'draft' },
    });

    expect(chipLifecycle(await chipFor(root, 'Unnamed'))).toEqual(DRAFT);
    expect(stripChips(root)).toHaveLength(1);
    expect(await triggerState(root, 'Unnamed: Live')).toBe('draft');
  });

  it('treats an absent chip as applied on prototype-named triggers', async () => {
    const root = await renderRail(width, layout, {
      filterPills: [
        pill('constructor', 'Constructor'),
        pill('toString', 'ToString'),
        pill('__proto__', 'Proto'),
      ],
    });

    expect(await triggerState(root, 'Constructor: Live')).toBeNull();
    expect(await triggerState(root, 'ToString: Live')).toBeNull();
    expect(await triggerState(root, 'Proto: Live')).toBeNull();
    expect(root.querySelector('.ds-list-toolbar__filter-chips-strip')).toBeNull();
  });

  it('raises no phantom chip for prototype-named keys absent from activeFilters', async () => {
    const root = await renderRail(width, layout, {
      filterPills: [
        pill('status', 'Status'),
        pill('constructor', 'Constructor'),
        pill('toString', 'ToString'),
        pill('__proto__', 'Proto'),
      ],
      activeFilters: { status: 'live' },
    });

    expect(chipLifecycle(await chipFor(root, 'Status'))).toEqual(APPLIED);
    expect(stripChips(root)).toHaveLength(1);
    expect(await triggerState(root, 'Status: Live')).toBeNull();
    expect(await triggerState(root, 'Constructor: Live')).toBeNull();
    expect(await triggerState(root, 'ToString: Live')).toBeNull();
    expect(await triggerState(root, 'Proto: Live')).toBeNull();
  });

  it('falls back to option resolution when filterStates has no own entry', async () => {
    const root = await renderRail(width, layout, {
      filterPills: [pill('constructor', 'Constructor'), pill('__proto__', 'Proto')],
      activeFilters: ownRecord<unknown>([
        ['constructor', 'live'],
        ['__proto__', 'live'],
      ]),
      filterStates: {},
    });

    expect(chipLifecycle(await chipFor(root, 'Constructor'))).toEqual(APPLIED);
    expect(stripChips(root)).toHaveLength(2);
    expect(await triggerState(root, 'Constructor: Live')).toBeNull();
    expect(chipLifecycle(await chipFor(root, 'Proto'))).toEqual(APPLIED);
    expect(await triggerState(root, 'Proto: Live')).toBeNull();
  });
});
