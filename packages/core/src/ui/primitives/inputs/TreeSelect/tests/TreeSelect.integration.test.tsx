import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

const treeData = [
  {
    value: 'engineering',
    title: 'Engineering',
    children: [
      { value: 'frontend', title: 'Frontend' },
      { value: 'backend', title: 'Backend', disabled: true },
    ],
  },
  {
    value: 'design',
    title: 'Design',
  },
];

describe('TreeSelect integration', () => {
  it.each(['modern', 'rustic'] as const)(
    'opens and selects nested options in the %s engine',
    async (engine) => {
      const { TreeSelect } = await import('..');
      const onChange = vi.fn();

      renderWithEngine(
        <TreeSelect
          engine={engine}
          treeData={treeData}
          treeDefaultExpandAll
          placeholder="Select team"
          onChange={onChange}
        />,
        engine
      );

      fireEvent.click(await screen.findByText('Select team'));
      fireEvent.click(await screen.findByText('Frontend'));

      expect(onChange).toHaveBeenCalledWith(
        'frontend',
        ['Frontend'],
        expect.objectContaining({ triggerValue: 'frontend' })
      );

      await waitFor(() => {
        expect(screen.getByText('Frontend')).toBeInTheDocument();
      });
    }
  );

  it.each(['modern', 'rustic'] as const)(
    'supports checkable multi-select in the %s engine',
    async (engine) => {
      const { TreeSelect } = await import('..');
      const onChange = vi.fn();

      renderWithEngine(
        <TreeSelect
          engine={engine}
          treeData={treeData}
          treeCheckable
          multiple
          treeDefaultExpandAll
          open
          onChange={onChange}
        />,
        engine
      );

      fireEvent.click(await screen.findByText('Frontend'));
      fireEvent.click(await screen.findByText('Design'));

      expect(onChange).toHaveBeenLastCalledWith(
        expect.arrayContaining(['frontend', 'design']),
        ['Design'],
        expect.objectContaining({ triggerValue: 'design' })
      );
    }
  );

  it.each(['modern', 'rustic'] as const)(
    'ignores disabled nodes in the %s engine',
    async (engine) => {
      const { TreeSelect } = await import('..');
      const onChange = vi.fn();

      renderWithEngine(
        <TreeSelect
          engine={engine}
          treeData={treeData}
          treeDefaultExpandAll
          open
          onChange={onChange}
        />,
        engine
      );

      fireEvent.click(await screen.findByText('Backend'));
      expect(onChange).not.toHaveBeenCalled();
    }
  );

  it.each(['modern', 'rustic'] as const)(
    'clears selected values in the %s engine',
    async (engine) => {
      const { TreeSelect } = await import('..');
      const onChange = vi.fn();

      renderWithEngine(
        <TreeSelect
          engine={engine}
          treeData={[{ value: 'design', title: 'Design' }]}
          defaultValue="design"
          allowClear
          onChange={onChange}
        />,
        engine
      );

      fireEvent.click(await screen.findByRole('button'));

      expect(onChange).toHaveBeenCalledWith(
        '',
        [],
        expect.objectContaining({ triggerValue: '' })
      );
    }
  );

  it.each(['modern', 'rustic'] as const)(
    'renders custom empty content in the %s engine',
    async (engine) => {
      const { TreeSelect } = await import('..');

      renderWithEngine(
        <TreeSelect
          engine={engine}
          treeData={[]}
          open
          notFoundContent="Nothing here"
        />,
        engine
      );

      expect(await screen.findByText('Nothing here')).toBeInTheDocument();
    }
  );

  it.each(['modern', 'rustic'] as const)(
    'reports dropdown visibility changes in the %s engine',
    async (engine) => {
      const { TreeSelect } = await import('..');
      const onDropdownVisibleChange = vi.fn();

      renderWithEngine(
        <TreeSelect
          engine={engine}
          treeData={treeData}
          placeholder="Pick a team"
          onDropdownVisibleChange={onDropdownVisibleChange}
        />,
        engine
      );

      fireEvent.click(await screen.findByText('Pick a team'));
      expect(onDropdownVisibleChange).toHaveBeenCalledWith(true);
    }
  );
});
