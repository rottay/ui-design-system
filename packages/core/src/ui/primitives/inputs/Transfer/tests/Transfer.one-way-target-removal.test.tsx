/**
 * `oneWay` target operability and selection freshness (modern engine).
 *
 * `oneWay` hides the left-move button but the target panel kept rendering live
 * select-all and per-row checkboxes: operable controls whose selection had no
 * consumer at all, so items pushed right could never come back. Separately, a
 * move cleared the moved side's selection WITHOUT re-firing `onSelectChange`,
 * leaving a consumer mirroring that callback holding keys the user could no
 * longer see selected.
 *
 * @module Transfer/tests
 */

import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernTransfer from '../engines/modern';

const DATA = [
  { key: '1', title: 'Alpha' },
  { key: '2', title: 'Bravo' },
  { key: '3', title: 'Charlie' },
];

const targetPanel = () => document.querySelector('[data-panel="target"]') as HTMLElement;
const sourcePanel = () => document.querySelector('[data-panel="source"]') as HTMLElement;

describe('Transfer modern oneWay target removal', () => {
  it('gives each target row a named remove action instead of inert checkboxes', () => {
    render(<ModernTransfer oneWay dataSource={DATA} defaultTargetKeys={['2']} />);

    const target = targetPanel();
    expect(within(target).queryByRole('checkbox')).toBeNull();
    expect(within(target).getByRole('button', { name: 'Remove Bravo' })).toBeInTheDocument();
    // The source keeps its selection grammar: only the target lost its consumer.
    expect(within(sourcePanel()).getAllByRole('checkbox').length).toBeGreaterThan(0);
  });

  it('moves the row back to the source and reports the direction', () => {
    const onChange = vi.fn();
    render(
      <ModernTransfer oneWay dataSource={DATA} defaultTargetKeys={['2', '3']} onChange={onChange} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Remove Bravo' }));

    expect(onChange).toHaveBeenCalledWith(['3'], 'left', ['2']);
    expect(within(sourcePanel()).getByText('Bravo')).toBeInTheDocument();
    expect(within(targetPanel()).queryByText('Bravo')).toBeNull();
  });

  it('leaves the target panel untouched when oneWay is off', () => {
    render(<ModernTransfer dataSource={DATA} defaultTargetKeys={['2']} />);

    const target = targetPanel();
    expect(within(target).queryByRole('button', { name: /Remove/ })).toBeNull();
    expect(within(target).getAllByRole('checkbox').length).toBeGreaterThan(0);
  });

  it('disables the remove action for a disabled row', () => {
    render(
      <ModernTransfer
        oneWay
        dataSource={[{ key: '1', title: 'Alpha', disabled: true }]}
        defaultTargetKeys={['1']}
      />
    );

    expect(screen.getByRole('button', { name: 'Remove Alpha' })).toBeDisabled();
  });

  it('tells the consumer the moved-side selection is gone', () => {
    const onSelectChange = vi.fn();
    render(<ModernTransfer dataSource={DATA} onSelectChange={onSelectChange} />);

    fireEvent.click(within(sourcePanel()).getByLabelText('Alpha'));
    expect(onSelectChange).toHaveBeenLastCalledWith(['1'], []);

    fireEvent.click(screen.getByRole('button', { name: 'Move to target' }));

    // Without the re-fire the consumer's last word from the component was
    // still ['1'] -- a selection the panel no longer shows.
    expect(onSelectChange).toHaveBeenLastCalledWith([], []);
  });
});
