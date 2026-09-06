import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import ModernAutoComplete from '../engines/modern';

const OPTIONS = [
  { value: 'Alpha', label: 'Alpha result' },
  { value: 'Bravo', label: 'Bravo result' },
];

/**
 * The suggestion panel is PORTALED (WO-CAN-05): it renders through the shared
 * overlay kernel into `#rottay-portal-root`, so it is a sibling of the render
 * container, not a descendant. Queries run against the document; the panel's
 * relationship to the field is asserted by ARIA (`aria-controls`) and by the
 * portal-geometry test below, never by DOM ancestry.
 */
const inPanel = (part: string): HTMLElement | null =>
  document.querySelector(`[data-part="${part}"]`);

const listbox = (): HTMLElement => inPanel('dropdown') as HTMLElement;
const loadingState = (): HTMLElement | null => inPanel('loading-state');
const emptyState = (): HTMLElement | null => inPanel('empty');
const activeOption = (): HTMLElement | null =>
  document.querySelector('[data-active="true"]');

describe('AutoComplete modern loading posture', () => {
  it('shows the loading state instead of the not-found copy while loading', () => {
    render(
      <ModernAutoComplete options={[]} loading defaultOpen notFoundContent="Nothing here" />
    );

    expect(loadingState()).not.toBeNull();
    expect(emptyState()).toBeNull();
    expect(screen.queryByText('Nothing here')).toBeNull();
  });

  it('marks the listbox busy only while loading', () => {
    const { rerender } = render(<ModernAutoComplete options={[]} loading defaultOpen />);
    expect(listbox()).toHaveAttribute('aria-busy', 'true');

    rerender(<ModernAutoComplete options={[]} defaultOpen />);
    expect(listbox()).not.toHaveAttribute('aria-busy');
  });

  it('falls back to the not-found copy once loading resolves with no results', () => {
    const { rerender } = render(
      <ModernAutoComplete options={[]} loading defaultOpen notFoundContent="Nothing here" />
    );
    expect(loadingState()).not.toBeNull();

    rerender(<ModernAutoComplete options={[]} defaultOpen notFoundContent="Nothing here" />);

    expect(loadingState()).toBeNull();
    expect(emptyState()).not.toBeNull();
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('keeps rendering suggestions that already loaded during a refresh', () => {
    render(<ModernAutoComplete options={OPTIONS} loading defaultOpen filterOption={false} />);

    expect(loadingState()).toBeNull();
    expect(screen.getByText('Alpha result')).toBeInTheDocument();
    expect(screen.getByText('Bravo result')).toBeInTheDocument();
  });

  it('renders the loading row as a listbox child so the role contract holds', () => {
    render(<ModernAutoComplete options={[]} loading defaultOpen />);

    const state = loadingState() as HTMLElement;
    expect(state.tagName).toBe('LI');
    expect(state).toHaveAttribute('role', 'option');
    expect(state).toHaveAttribute('aria-disabled', 'true');
    expect(state.parentElement).toBe(listbox());
  });

  it('uses the localized floor copy and lets a consumer override it', () => {
    const { rerender } = render(<ModernAutoComplete options={[]} loading defaultOpen />);
    expect(inPanel('loading-state-label')).toHaveTextContent('Loading suggestions...');

    rerender(<ModernAutoComplete options={[]} loading defaultOpen loadingText="Fetching" />);
    expect(inPanel('loading-state-label')).toHaveTextContent('Fetching');
  });

  it('portals the panel out of the field and keeps its lineage and wiring', () => {
    const { container } = render(<ModernAutoComplete options={OPTIONS} defaultOpen />);

    const panel = listbox();
    // The honest new geometry: a sibling of the render container, mounted in
    // the shared portal root, and NOT reachable by DOM ancestry from the field.
    expect(container.contains(panel)).toBe(false);
    expect(panel.closest('#rottay-portal-root')).not.toBeNull();
    // Tenant/locale lineage is re-stamped around the portaled subtree.
    expect(panel.closest('[data-portal-scope="true"]')).not.toBeNull();
    // The field still owns the panel through ARIA, and the kernel pins it.
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-controls', panel.id);
    expect(panel.style.position).toBe('fixed');
    expect(panel.getAttribute('data-overlay-kind')).toBe('dropdown');
  });

  it('shows nothing while the panel is closed, loading or not', () => {
    render(<ModernAutoComplete options={[]} loading />);

    expect(listbox()).toBeNull();
    expect(loadingState()).toBeNull();
  });

  it('keeps the combobox wiring intact across the loading state', () => {
    render(<ModernAutoComplete options={[]} loading defaultOpen />);

    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-controls', listbox().id);
    expect(input).not.toHaveAttribute('aria-activedescendant');
  });

  it('still navigates suggestions while a refresh is in flight', () => {
    render(<ModernAutoComplete options={OPTIONS} loading defaultOpen filterOption={false} />);

    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    const active = activeOption();
    expect(active).toHaveTextContent('Alpha result');
    expect(input).toHaveAttribute('aria-activedescendant', active?.id ?? '');
  });

  it('uses a presentational list wrapper and keeps active separate from selection', () => {
    render(<ModernAutoComplete options={OPTIONS} defaultOpen filterOption={false} />);

    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    const active = activeOption() as HTMLElement;
    expect(active.closest('li')).toHaveAttribute('role', 'none');
    expect(active).toHaveAttribute('role', 'option');
    expect(active).toHaveAttribute('aria-selected', 'false');
  });
});
