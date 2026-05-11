import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ClassicFilterPanel from '../engines/classic';
import ModernFilterPanel from '../engines/modern';
import RusticFilterPanel from '../engines/rustic';
import { renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';

const INTERACTIVE_ENGINES = [
  ['modern', ModernFilterPanel],
  ['rustic', RusticFilterPanel],
] as const;

const FILTERS = [
  { key: 'query', label: 'Query', type: 'text', placeholder: 'Search' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'Select status',
    options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Live', value: 'live' },
    ],
  },
  {
    key: 'tags',
    label: 'Tags',
    type: 'multi-select',
    options: [
      { label: 'VIP', value: 'vip' },
      { label: 'Indoor', value: 'indoor' },
    ],
  },
  { key: 'enabled', label: 'Enabled', type: 'boolean' },
  { key: 'eventDate', label: 'Event date', type: 'date' },
  { key: 'eventWindow', label: 'Event window', type: 'date-range' },
  { key: 'capacity', label: 'Capacity', type: 'number-range' },
] as const;

describe('PatternFilterPanel runtime engines', () => {
  it.each(INTERACTIVE_ENGINES)(
    'renders and updates the interactive filter matrix through the %s engine',
    async (_engine, Component) => {
      const onChange = vi.fn();
      const onApply = vi.fn();
      const onReset = vi.fn();

      renderWithEngine(
        <Component
          filters={FILTERS as any}
          values={{}}
          onChange={onChange}
          onApply={onApply}
          onReset={onReset}
          layout="inline"
          collapsible
          title="Filters"
          activeCount={3}
          showApply
          showReset
        />,
        _engine
      );

      expect(screen.getByText('Filters')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();

      const collapseButton =
        _engine === 'modern'
          ? screen.getByRole('button', { name: /collapse filters/i })
          : screen.getByRole('button', { name: '-' });
      fireEvent.click(collapseButton);

      if (_engine === 'modern') {
        await waitFor(() => {
          expect(screen.getByRole('button', { name: /expand filters/i })).toBeInTheDocument();
        });
      } else {
        expect(screen.queryByText('Query')).not.toBeInTheDocument();
      }

      const expandButton =
        _engine === 'modern'
          ? screen.getByRole('button', { name: /expand filters/i })
          : screen.getByRole('button', { name: '+' });
      fireEvent.click(expandButton);
      expect(await screen.findByText('Query')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Tags')).toBeInTheDocument();
      expect(screen.getAllByText('Enabled').length).toBeGreaterThan(0);

      fireEvent.change(screen.getByPlaceholderText('Search'), {
        target: { value: 'launch' },
      });
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ query: 'launch' }));

      const statusSelect = document.querySelector('select') as HTMLSelectElement | null;
      if (statusSelect) {
        fireEvent.change(statusSelect, {
          target: { value: 'live' },
        });
      } else {
        fireEvent.click(await screen.findByRole('combobox'));
        fireEvent.click(await screen.findByRole('option', { name: 'Live' }));
      }
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ status: 'live' }));

      fireEvent.click(screen.getByLabelText('VIP'));
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ tags: ['vip'] }));

      const switches = screen.queryAllByRole('switch');
      const checkboxes = screen.queryAllByRole('checkbox');
      const booleanToggle =
        switches.length > 0 ? switches[switches.length - 1] : checkboxes[checkboxes.length - 1];
      fireEvent.click(booleanToggle);
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ enabled: true }));

      fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
      expect(onApply).toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: /reset|clear all/i }));
      expect(onReset).toHaveBeenCalled();
    }
  );

  it('renders the classic engine with loading, badges, collapse, and actions', async () => {
    const onChange = vi.fn();
    const onApply = vi.fn();
    const onReset = vi.fn();

    const { rerender } = render(
      <ClassicFilterPanel
        filters={FILTERS as any}
        values={{ query: 'ada' }}
        onChange={onChange}
        onApply={onApply}
        onReset={onReset}
        collapsible
        title="Classic Filters"
        activeCount={2}
        showApply
        showReset
        loading
      />
    );

    expect(screen.getByText('Classic Filters')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    rerender(
      <ClassicFilterPanel
        filters={FILTERS as any}
        values={{ query: 'ada' }}
        onChange={onChange}
        onApply={onApply}
        onReset={onReset}
        collapsible
        title="Classic Filters"
        activeCount={2}
        showApply
        showReset
      />
    );

    expect(await screen.findByText('Query')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    await waitFor(() => {
      expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ query: 'ada' }));
      expect(onReset).toHaveBeenCalled();
    });
  });

  it('updates the classic engine across all filter control types', async () => {
    const onChange = vi.fn();

    render(
      <ClassicFilterPanel
        filters={FILTERS as any}
        values={{}}
        onChange={onChange}
        layout="sidebar"
        title="Classic Interactive Filters"
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'expo' },
    });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ query: 'expo' }));

    const allComboboxes = screen.getAllByRole('combobox');
    fireEvent.mouseDown(allComboboxes[0]);
    fireEvent.click(await screen.findByText('Live'));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ status: 'live' }));

    fireEvent.click(screen.getByLabelText('VIP'));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ tags: ['vip'] }));

    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ enabled: true }));

    fireEvent.change(screen.getByPlaceholderText('Select date'), {
      target: { value: '2026-03-13' },
    });
    expect(onChange).toHaveBeenCalled();

    fireEvent.change(screen.getByPlaceholderText('Min'), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByPlaceholderText('Max'), {
      target: { value: '50' },
    });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ capacity: [10, undefined] }));
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ capacity: [undefined, 50] }));
    });
  });
});
