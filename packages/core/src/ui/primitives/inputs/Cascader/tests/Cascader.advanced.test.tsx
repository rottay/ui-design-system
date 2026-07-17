import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

describe('Cascader advanced coverage', () => {
  it.each(['modern', 'rustic'] as const)(
    'covers fieldNames, hover expansion, search selection, displayRender, and clearing in the %s engine',
    async (engine) => {
      const { Cascader } = await import('..');
      const onChange = vi.fn();

      renderWithEngine(
        <Cascader
          engine={engine}
          options={[
            {
              id: 'group',
              text: 'Group',
              items: [
                { id: 'leaf', text: 'Leaf' },
                { id: 'second', text: 'Second' },
              ],
            },
          ] as any}
          fieldNames={{ label: 'text', value: 'id', children: 'items' }}
          expandTrigger="hover"
          showSearch
          allowClear
          placeholder="Pick item"
          displayRender={(labels) => labels.join(' > ')}
          onChange={onChange}
        />,
        engine
      );

      fireEvent.click(await screen.findByText('Pick item'));
      fireEvent.mouseEnter(await screen.findByText('Group'));
      fireEvent.click(await screen.findByText('Leaf'));

      expect(onChange).toHaveBeenCalledWith(
        ['group', 'leaf'],
        expect.arrayContaining([
          expect.objectContaining({ id: 'group' }),
          expect.objectContaining({ id: 'leaf' }),
        ])
      );
      expect(await screen.findByText('Group > Leaf')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Group > Leaf'));
      const search = await screen.findByPlaceholderText('Search...');
      fireEvent.change(search, { target: { value: 'second' } });
      fireEvent.click(await screen.findByText('Group / Second'));

      expect(onChange).toHaveBeenLastCalledWith(
        ['group', 'second'],
        expect.arrayContaining([
          expect.objectContaining({ id: 'group' }),
          expect.objectContaining({ id: 'second' }),
        ])
      );
      expect(await screen.findByText('Group > Second')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button'));
      expect(onChange).toHaveBeenLastCalledWith([], []);
    }
  );

  it.each(['modern', 'rustic'] as const)(
    'covers async loadData, custom notFoundContent, open control, and outside-close signaling in the %s engine',
    async (engine) => {
      const { Cascader } = await import('..');
      const asyncNode = { value: 'async', label: 'Async', isLeaf: false } as any;
      const loadData = vi.fn(async (path) => {
        const target = path[path.length - 1];
        target.children = [{ value: 'loaded', label: 'Loaded child' }];
      });
      const onDropdownVisibleChange = vi.fn();

      const { rerender } = renderWithEngine(
        <Cascader
          engine={engine}
          open
          options={[asyncNode]}
          loadData={loadData}
          onDropdownVisibleChange={onDropdownVisibleChange}
        />,
        engine
      );

      fireEvent.click(await screen.findByText('Async'));
      await waitFor(() => {
        expect(loadData).toHaveBeenCalledWith([
          expect.objectContaining({ value: 'async' }),
        ]);
      });
      expect(await screen.findByText('Loaded child')).toBeInTheDocument();

      rerender(
        <Cascader
          engine={engine}
          options={[]}
          open
          notFoundContent="Nothing here"
          onDropdownVisibleChange={onDropdownVisibleChange}
        />
      );

      expect(await screen.findByText('Nothing here')).toBeInTheDocument();

      fireEvent.mouseDown(document.body);
      expect(onDropdownVisibleChange).toHaveBeenCalledWith(false);
    }
  );
});
