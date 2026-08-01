import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import ModernAutoComplete from '../engines/modern';

const OPTIONS = [
  { value: 'Alpha', label: 'Alpha result' },
  { value: 'Bravo', label: 'Bravo result' },
];

const listbox = (container: HTMLElement): HTMLElement =>
  container.querySelector('[data-part="dropdown"]') as HTMLElement;

const loadingState = (container: HTMLElement): HTMLElement | null =>
  container.querySelector('[data-part="loading-state"]');

const emptyState = (container: HTMLElement): HTMLElement | null =>
  container.querySelector('[data-part="empty"]');

describe('AutoComplete modern loading posture', () => {
  it('shows the loading state instead of the not-found copy while loading', () => {
    const { container } = render(
      <ModernAutoComplete options={[]} loading defaultOpen notFoundContent="Nothing here" />
    );

    expect(loadingState(container)).not.toBeNull();
    expect(emptyState(container)).toBeNull();
    expect(screen.queryByText('Nothing here')).toBeNull();
  });

  it('marks the listbox busy only while loading', () => {
    const { container, rerender } = render(
      <ModernAutoComplete options={[]} loading defaultOpen />
    );
    expect(listbox(container)).toHaveAttribute('aria-busy', 'true');

    rerender(<ModernAutoComplete options={[]} defaultOpen />);
    expect(listbox(container)).not.toHaveAttribute('aria-busy');
  });

  it('falls back to the not-found copy once loading resolves with no results', () => {
    const { container, rerender } = render(
      <ModernAutoComplete options={[]} loading defaultOpen notFoundContent="Nothing here" />
    );
    expect(loadingState(container)).not.toBeNull();

    rerender(<ModernAutoComplete options={[]} defaultOpen notFoundContent="Nothing here" />);

    expect(loadingState(container)).toBeNull();
    expect(emptyState(container)).not.toBeNull();
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('keeps rendering suggestions that already loaded during a refresh', () => {
    const { container } = render(
      <ModernAutoComplete options={OPTIONS} loading defaultOpen filterOption={false} />
    );

    expect(loadingState(container)).toBeNull();
    expect(screen.getByText('Alpha result')).toBeInTheDocument();
    expect(screen.getByText('Bravo result')).toBeInTheDocument();
  });

  it('renders the loading row as a listbox child so the role contract holds', () => {
    const { container } = render(<ModernAutoComplete options={[]} loading defaultOpen />);

    const state = loadingState(container) as HTMLElement;
    expect(state.tagName).toBe('LI');
    expect(state).toHaveAttribute('role', 'option');
    expect(state).toHaveAttribute('aria-disabled', 'true');
    expect(state.parentElement).toBe(listbox(container));
  });

  it('uses the localized floor copy and lets a consumer override it', () => {
    const { container, rerender } = render(<ModernAutoComplete options={[]} loading defaultOpen />);
    expect(
      container.querySelector('[data-part="loading-state-label"]')
    ).toHaveTextContent('Loading suggestions...');

    rerender(<ModernAutoComplete options={[]} loading defaultOpen loadingText="Fetching" />);
    expect(
      container.querySelector('[data-part="loading-state-label"]')
    ).toHaveTextContent('Fetching');
  });

  it('shows nothing while the panel is closed, loading or not', () => {
    const { container } = render(<ModernAutoComplete options={[]} loading />);

    expect(listbox(container)).toBeNull();
    expect(loadingState(container)).toBeNull();
  });

  it('keeps the combobox wiring intact across the loading state', () => {
    const { container } = render(<ModernAutoComplete options={[]} loading defaultOpen />);

    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-controls', listbox(container).id);
    expect(input).not.toHaveAttribute('aria-activedescendant');
  });

  it('still navigates suggestions while a refresh is in flight', () => {
    const { container } = render(
      <ModernAutoComplete options={OPTIONS} loading defaultOpen filterOption={false} />
    );

    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    const active = container.querySelector('[data-active="true"]');
    expect(active).toHaveTextContent('Alpha result');
    expect(input).toHaveAttribute('aria-activedescendant', active?.id ?? '');
  });

  it('uses a presentational list wrapper and keeps active separate from selection', () => {
    const { container } = render(
      <ModernAutoComplete options={OPTIONS} defaultOpen filterOption={false} />
    );

    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    const active = container.querySelector('[data-active="true"]') as HTMLElement;
    expect(active.closest('li')).toHaveAttribute('role', 'none');
    expect(active).toHaveAttribute('role', 'option');
    expect(active).toHaveAttribute('aria-selected', 'false');
  });
});
