import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { ContextMenu } from '..';
import { renderWithEngine } from '@tests/support/engine';
import {
  readSkinRules,
  waitForComposedContent,
  winningDecl,
} from '@tests/support/skin-reachability';

/** Engine skins live outside the helper's default presentation root. */
const RUSTIC_SKIN_ROOT = 'src/foundation/tokens/css/runtime/engines/rustic/skin';

/**
 * The twin of the dropdown item-hover rule: `context-menu.css` reads the same
 * `--ds-dropdown-item-hover-bg` channel, and nothing asserted it. PARSED rather
 * than substring-matched so a reformat cannot turn a live channel into a red.
 */
const CONTEXT_MENU_ITEM_HOVER = winningDecl(
  readSkinRules('context-menu', RUSTIC_SKIN_ROOT),
  'background-color',
  (rule) => rule.selector.includes("[data-part='item']") && rule.selector.includes(':hover')
);

describe('ContextMenu real engines', () => {
  it('covers divider, group, disabled, select, outside-click, and escape branches in the rustic engine', async () => {
    await import('../engines/rustic');
    const handleSelect = vi.fn();
    const handleItemClick = vi.fn();

    renderWithEngine(
      <ContextMenu
        engine="rustic"
        trigger={<button type="button">Right click target</button>}
        onSelect={handleSelect}
        items={[
          { key: 'group', label: 'Workspace', type: 'group' },
          { key: 'divider-1', type: 'divider' },
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

    // Side one: the rule declares the shared channel and keeps the guard that
    // stops it repainting a disabled row.
    expect(CONTEXT_MENU_ITEM_HOVER?.decls['background-color']).toBe(
      'var(--ds-dropdown-item-hover-bg, var(--ds-color-neutral-100, #f3f4f6))'
    );
    expect(CONTEXT_MENU_ITEM_HOVER?.selector).toContain(":not([data-disabled='true'])");

    // Side two: the DOM presents a node that selector can reach, and correctly
    // excludes the disabled one. Declaring the rule and stamping the hook it
    // needs are separate facts.
    const restingItem = CONTEXT_MENU_ITEM_HOVER!.selector.replace(':hover', '');
    await waitForComposedContent(waitFor, document, restingItem, 1);
    expect(screen.getByRole('menuitem', { name: /open dashboard/i }).matches(restingItem)).toBe(
      true
    );
    expect(screen.getByRole('menuitem', { name: /disabled item/i }).matches(restingItem)).toBe(
      false
    );

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
