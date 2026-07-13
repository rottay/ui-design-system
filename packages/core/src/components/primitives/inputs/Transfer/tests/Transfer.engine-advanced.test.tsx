import React from 'react';
import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Transfer as ModernTransfer } from '../engines/modern';
import { Transfer as RusticTransfer } from '../engines/rustic';
import type { TransferItem } from '../Transfer.types';
import { renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';

const dataSource: TransferItem[] = [
  { key: 'alpha', title: 'Alpha' },
  { key: 'beta', title: 'Beta' },
  { key: 'gamma', title: 'Gamma', disabled: true },
];

function filterOption(input: string, item: TransferItem) {
  return item.title.toLowerCase().includes(input.toLowerCase());
}

function getModernPanel(container: HTMLElement, title: string) {
  const titleElement = screen.getByText(title);
  const panel = titleElement.closest('.flex.flex-col.rounded-lg.overflow-hidden');

  if (!(panel instanceof HTMLElement) || !container.contains(panel)) {
    throw new Error(`Expected modern ${title} panel wrapper`);
  }

  return panel;
}

describe('Transfer runtime engine coverage', () => {
  it('covers modern engine search, select-all, custom rendering, and bidirectional moves', () => {
    const handleChange = vi.fn();
    const handleSelectChange = vi.fn();
    const handleSearch = vi.fn();

    const { container } = renderWithEngine(
      <ModernTransfer
        dataSource={dataSource}
        defaultTargetKeys={['beta']}
        showSearch
        filterOption={filterOption}
        onChange={handleChange}
        onSelectChange={handleSelectChange}
        onSearch={handleSearch}
        render={(item) => <span>{item.title} custom</span>}
        titles={['Available', 'Selected']}
        operations={['Add', 'Remove']}
        locale={{
          searchPlaceholder: 'Find entry',
          notFoundContent: 'Nothing found',
        }}
        listStyle={{ width: 280 }}
      />,
      'modern'
    );

    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Selected')).toBeInTheDocument();
    expect(screen.getByText('Beta custom')).toBeInTheDocument();

    const searchBoxes = screen.getAllByPlaceholderText('Find entry');
    fireEvent.change(searchBoxes[0], { target: { value: 'alp' } });
    expect(handleSearch).toHaveBeenCalledWith('left', 'alp');
    expect(screen.getByText('Alpha custom')).toBeInTheDocument();
    expect(screen.queryByText('Gamma custom')).not.toBeInTheDocument();

    const addButton = screen.getByRole('button', { name: 'Add' });
    const removeButton = screen.getByRole('button', { name: 'Remove' });
    expect(addButton).toBeDisabled();

    const sourcePanel = getModernPanel(container, 'Available');

    const sourceSelectAll = within(sourcePanel).getAllByRole('checkbox')[0];
    fireEvent.click(sourceSelectAll);

    expect(handleSelectChange).toHaveBeenLastCalledWith(['alpha'], []);
    expect(addButton).not.toBeDisabled();

    fireEvent.click(addButton);
    expect(handleChange).toHaveBeenCalledWith(['beta', 'alpha'], 'right', ['alpha']);
    expect(removeButton).toBeDisabled();

    getModernPanel(container, 'Selected');

    const targetBetaLabel = screen.getByText('Beta custom').closest('label');
    if (!(targetBetaLabel instanceof HTMLElement)) {
      throw new Error('Expected modern target item label');
    }

    const targetBetaCheckbox = targetBetaLabel.querySelector('input[type="checkbox"]');
    if (!(targetBetaCheckbox instanceof HTMLInputElement)) {
      throw new Error('Expected beta checkbox');
    }

    fireEvent.click(targetBetaCheckbox);
    expect(handleSelectChange).toHaveBeenLastCalledWith([], ['beta']);
    expect(removeButton).not.toBeDisabled();

    fireEvent.click(removeButton);
    expect(handleChange).toHaveBeenCalledWith(['alpha'], 'left', ['beta']);
  });

  it('covers rustic engine hover styles, search callbacks, one-way mode, and disabled empty-state branches', () => {
    const handleChange = vi.fn();
    const handleSelectChange = vi.fn();
    const handleSearch = vi.fn();

    const { container, rerender } = renderWithEngine(
      <RusticTransfer
        dataSource={dataSource}
        defaultTargetKeys={['beta']}
        showSearch
        filterOption={filterOption}
        onChange={handleChange}
        onSelectChange={handleSelectChange}
        onSearch={handleSearch}
        render={(item) => <span>{item.title} rustic</span>}
        operations={['Push', 'Pull']}
        locale={{
          searchPlaceholder: 'Rustic search',
          notFoundContent: 'No rustic matches',
        }}
      />,
      'rustic'
    );

    const searchBoxes = screen.getAllByPlaceholderText('Rustic search');
    fireEvent.change(searchBoxes[0], { target: { value: 'alp' } });
    expect(handleSearch).toHaveBeenCalledWith('left', 'alp');

    const addButton = screen.getByRole('button', { name: 'Push' });
    const removeButton = screen.getByRole('button', { name: 'Pull' });
    expect(addButton).toBeDisabled();

    const sourceCheckbox = screen.getByRole('checkbox', { name: /alpha rustic/i });
    fireEvent.click(sourceCheckbox);
    expect(handleSelectChange).toHaveBeenLastCalledWith(['alpha'], []);
    expect(addButton).not.toBeDisabled();

    fireEvent.click(addButton);
    expect(handleChange).toHaveBeenCalledWith(['beta', 'alpha'], 'right', ['alpha']);

    const targetCheckbox = screen.getByRole('checkbox', { name: /beta rustic/i });
    fireEvent.click(targetCheckbox);
    expect(handleSelectChange).toHaveBeenLastCalledWith([], ['beta']);
    expect(removeButton).not.toBeDisabled();

    fireEvent.click(removeButton);
    expect(handleChange).toHaveBeenCalledWith(['alpha'], 'left', ['beta']);

    rerender(
      <RusticTransfer
        dataSource={dataSource}
        disabled
        showSearch
        oneWay
        filterOption={filterOption}
        locale={{
          searchPlaceholder: 'Rustic search',
          notFoundContent: 'No rustic matches',
        }}
      />
    );

    expect(screen.queryByRole('button', { name: 'Pull' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '>' })).toBeDisabled();

    const disabledSearch = screen.getAllByPlaceholderText('Rustic search')[0];
    expect(disabledSearch).toBeDisabled();

    rerender(
      <RusticTransfer
        dataSource={dataSource}
        showSearch
        filterOption={() => false}
        locale={{
          searchPlaceholder: 'Rustic search',
          notFoundContent: 'No rustic matches',
        }}
      />
    );

    fireEvent.change(screen.getAllByPlaceholderText('Rustic search')[0], { target: { value: 'zzz' } });
    expect(screen.getByText('No rustic matches')).toBeInTheDocument();

    expect(container.querySelector('.rottay-transfer--rustic')).toBeTruthy();
  });

  it('covers rustic pagination, default filtering, and select-all toggles', () => {
    const handleChange = vi.fn();
    const handleSelectChange = vi.fn();
    const handleSearch = vi.fn();

    renderWithEngine(
      <RusticTransfer
        dataSource={[
          { key: 'alpha', title: 'Alpha' },
          { key: 'beta', title: 'Beta' },
          { key: 'delta', title: 'Delta' },
          { key: 'echo', title: 'Echo' },
        ]}
        defaultTargetKeys={['delta', 'echo']}
        showSearch
        showSelectAll
        pagination={{ pageSize: 1 }}
        onChange={handleChange}
        onSelectChange={handleSelectChange}
        onSearch={handleSearch}
      />,
      'rustic'
    );

    const searchBoxes = screen.getAllByPlaceholderText('Search');
    const targetSearch = searchBoxes[1] as HTMLInputElement;

    fireEvent.change(targetSearch, { target: { value: 'ec' } });
    expect(handleSearch).toHaveBeenCalledWith('right', 'ec');
    expect(screen.getByText('Echo')).toBeInTheDocument();
    expect(screen.queryByText('Delta')).not.toBeInTheDocument();

    const nextButtons = screen.getAllByRole('button', { name: '›' });
    fireEvent.click(nextButtons[0]);
    expect(screen.getByText('Beta')).toBeInTheDocument();

    const prevButtons = screen.getAllByRole('button', { name: '‹' });
    fireEvent.click(prevButtons[0]);
    expect(screen.getByText('Alpha')).toBeInTheDocument();

    const selectAllBoxes = screen.getAllByRole('checkbox').filter((checkbox) => {
      const input = checkbox as HTMLInputElement;
      return !input.getAttribute('aria-label') && !input.closest('label');
    });
    fireEvent.click(selectAllBoxes[0]);
    expect(handleSelectChange).toHaveBeenCalledWith(['alpha', 'beta'], []);

    expect(screen.getByRole('button', { name: '>' })).toBeInTheDocument();
  });
});
