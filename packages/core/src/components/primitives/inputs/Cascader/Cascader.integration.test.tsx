import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '../../../../testing/helpers/engine-test-utils';

const options = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
      },
    ],
  },
  {
    value: 'disabled',
    label: 'Disabled',
    disabled: true,
  },
];

describe('Cascader integration', () => {
  it.each(['modern', 'rustic'] as const)(
    'opens and selects nested values in the %s engine',
    async (engine) => {
      const { Cascader } = await import('.');
      const onChange = vi.fn();

      renderWithEngine(
        <Cascader
          engine={engine}
          options={options}
          placeholder="Select location"
          onChange={onChange}
        />,
        engine
      );

      fireEvent.click(await screen.findByText('Select location'));
      fireEvent.click(await screen.findByText('Zhejiang'));
      fireEvent.click(await screen.findByText('Hangzhou'));

      expect(onChange).toHaveBeenCalledWith(
        ['zhejiang', 'hangzhou'],
        expect.arrayContaining([
          expect.objectContaining({ value: 'zhejiang' }),
          expect.objectContaining({ value: 'hangzhou' }),
        ])
      );
    }
  );

  it.each(['modern', 'rustic'] as const)(
    'ignores disabled options in the %s engine',
    async (engine) => {
      const { Cascader } = await import('.');
      const onChange = vi.fn();

      renderWithEngine(
        <Cascader
          engine={engine}
          options={options}
          open
          onChange={onChange}
        />,
        engine
      );

      fireEvent.click(await screen.findByText('Disabled'));
      expect(onChange).not.toHaveBeenCalled();
    }
  );

  it.each(['modern', 'rustic'] as const)(
    'clears selected values in the %s engine',
    async (engine) => {
      const { Cascader } = await import('.');
      const onChange = vi.fn();

      renderWithEngine(
        <Cascader
          engine={engine}
          options={[{ value: 'design', label: 'Design' }]}
          defaultValue={['design']}
          allowClear
          onChange={onChange}
        />,
        engine
      );

      fireEvent.click(await screen.findByRole('button'));
      expect(onChange).toHaveBeenCalledWith([], []);
    }
  );

  it.each(['modern', 'rustic'] as const)(
    'renders custom empty content in the %s engine',
    async (engine) => {
      const { Cascader } = await import('.');

      renderWithEngine(
        <Cascader
          engine={engine}
          options={[]}
          open
          notFoundContent="Nothing found"
        />,
        engine
      );

      expect(await screen.findByText('Nothing found')).toBeInTheDocument();
    }
  );
});
