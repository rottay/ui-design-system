import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { ContextMenu } from '..';
import { renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';

describe('ContextMenu real engines', () => {
  it('covers divider, group, disabled, select, outside-click, and escape branches in the rustic engine', async () => {
    await import('./engines/rustic');
    const handleSelect = vi.fn();
    const handleItemClick = vi.fn();

    renderWithEngine(
      <ContextMenu
        engine="rustic"
        trigger={<button type="button">Right click target</button>}
        onSelect={handleSelect}
        items={[
          { key: 'group', label: 'Workspace', type: 'group' },
          { key: 'divider-1', label: 'divider', type: 'divider' },
          { key: 'open', label: 'Open dashboard', shortcut: 'O', onClick: handleItemClick },
          { key: 'disabled', label: 'Disabled item', disabled: true },
          { key: 'danger', label: 'Delete workspace', danger: true },
        ]}
      />,
      'rustic'
    );

    const trigger = await screen.findByRole('button', { name: /right click target/i }, { timeout: 15000 });
    fireEvent.contextMenu(trigger);

    expect(await screen.findByRole('menu', {}, { timeout: 15000 })).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(screen.getByText('Workspace')).toBeInTheDocument();
    expect(screen.getByText('O')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('menuitem', { name: /disabled item/i }));
    expect(handleSelect).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('menuitem', { name: /open dashboard/i }));

    await waitFor(() => {
      expect(handleItemClick).toHaveBeenCalledTimes(1);
      expect(handleSelect).toHaveBeenCalledWith('open');
    });

    fireEvent.contextMenu(trigger);
    expect(await screen.findByRole('menu', {}, { timeout: 15000 })).toBeInTheDocument();
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    fireEvent.contextMenu(trigger);
    expect(await screen.findByRole('menu', {}, { timeout: 15000 })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });
});
