import React from 'react';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import ModernTree from '../engines/modern';
import type { TreeDataNode } from '../contracts';

// ---------------------------------------------------------------------------
// K3-A Pass 1 — modern Tree paint-ownership + Daisy-drain ratchet.
//
// The engine painted connectors with Tailwind `absolute border-l` utilities
// and the checkbox with DaisyUI `checkbox checkbox-sm checkbox-primary`
// classes. Both are gone: tree.css is the single paint owner (position, width,
// color, accent tint) keyed on the data-part hooks, and the per-level offsets
// that stay inline are LOGICAL (inline-start) so the hierarchy mirrors in RTL.
// ---------------------------------------------------------------------------

const SKIN = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/tree.css'
  ),
  'utf8'
);

const DATA: TreeDataNode[] = [
  {
    key: '0',
    title: 'src',
    children: [
      { key: '0-0', title: 'index.ts' },
      { key: '0-1', title: 'app.tsx' },
    ],
  },
  { key: '1', title: 'package.json' },
];

describe('Tree modern — connectors and checkbox are the skin, offsets are logical', () => {
  it('drains the Tailwind/Daisy paint classes from connectors, checkbox, icon, toggle', () => {
    const { container } = render(
      <ModernTree treeData={DATA} showLine showIcon checkable defaultExpandAll />
    );

    const connector = container.querySelector('[data-part="connector"]') as HTMLElement;
    expect(connector).not.toBeNull();
    expect(connector.className).toBe('');

    const checkbox = container.querySelector('[data-part="checkbox"]') as HTMLElement;
    expect(checkbox.className).toBe('');
    expect(checkbox.style.marginRight).toBe('');

    const toggle = container.querySelector('[data-part="tree-node-toggle"]') as HTMLElement;
    expect(toggle.className).toBe('');
    expect(toggle.style.marginRight).toBe('');
    expect(toggle.style.width).toBe('');

    // No Daisy checkbox class survives anywhere in the tree.
    expect(container.innerHTML).not.toMatch(/checkbox-(sm|primary|indeterminate)/);
  });

  it('indents with logical inline-start, never physical left', () => {
    const { container } = render(
      <ModernTree treeData={DATA} showLine defaultExpandAll />
    );

    const rows = container.querySelectorAll('[data-part="row"]');
    const childRow = Array.from(rows).find((row) =>
      row.getAttribute('data-tree-node-key') === '0-0'
    ) as HTMLElement;
    expect(childRow.style.paddingInlineStart).toContain('var(--ds-tree-indent');
    expect(childRow.style.paddingLeft).toBe('');

    const connector = container.querySelector('[data-part="connector"]') as HTMLElement;
    expect(connector.style.insetInlineStart).toContain('var(--ds-tree-indent');
    expect(connector.style.left).toBe('');
  });

  it('keeps the translated-label fallback contract on the toggle and checkbox', () => {
    render(<ModernTree treeData={DATA} checkable defaultExpandAll />);

    // No I18nProvider here: the documented English fallbacks must render.
    expect(screen.getAllByRole('button', { name: 'Collapse' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('checkbox', { name: 'Select src' })).toBeInTheDocument();
  });

  it('gives the first visible node the roving tab stop before any keyboard focus', () => {
    const { container } = render(<ModernTree treeData={DATA} defaultExpandAll />);

    // WAI-ARIA TreeView: exactly one treeitem is Tab-reachable with no prior
    // focus — previously every node was tabIndex=-1 and the tree was
    // unreachable from the keyboard.
    const tabbable = container.querySelectorAll('[role="treeitem"][tabindex="0"]');
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveAttribute('data-tree-node-key', '0');
  });

  it('moves DOM focus on the FIRST ArrowDown from the roving stop (K3-A Pass-2 regression)', () => {
    const { container } = render(<ModernTree treeData={DATA} defaultExpandAll checkable />);
    const root = container.querySelector('[data-part="root"]') as HTMLElement;

    // Tab-in lands DOM focus on the roving stop without setting the engine's
    // focus state. The first ArrowDown must move to the next visible node --
    // previously the handler swallowed that keystroke just to initialize
    // focusedKey, and focus never moved.
    (container.querySelector('[data-tree-node-key="0"]') as HTMLElement).focus();
    fireEvent.keyDown(root, { key: 'ArrowDown' });

    const moved = container.querySelector('[data-tree-node-key="0-0"]') as HTMLElement;
    expect(moved).toHaveAttribute('data-focused', 'true');
    expect(document.activeElement).toBe(moved);

    // And ArrowLeft on the expanded parent of the anchor collapses it.
    fireEvent.keyDown(root, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(container.querySelector('[data-tree-node-key="0"]'));
    fireEvent.keyDown(root, { key: 'ArrowLeft' });
    expect(container.querySelector('[data-tree-node-key="0"]')).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('pins the skin rules that replaced the drained paint', () => {
    // connectors: position + per-axis widths owned by the skin
    expect(SKIN).toMatch(/\[data-part='connector'\][^{]*\{[^}]*position:\s*absolute/);
    expect(SKIN).toMatch(/\[data-axis='vertical'\][^{]*\{[^}]*border-left-width/);
    expect(SKIN).toMatch(/\[data-axis='horizontal'\][^{]*\{[^}]*border-top-width/);
    // checkbox: accent tint + logical margin
    expect(SKIN).toMatch(/\[data-part='checkbox'\][^{]*\{[^}]*accent-color/);
    expect(SKIN).toMatch(/\[data-part='checkbox'\][^{]*\{[^}]*margin-inline-end/);
    // toggle + icon geometry
    expect(SKIN).toMatch(/\[data-part='tree-node-toggle'\][^{]*\{[^}]*margin-inline-end/);
    expect(SKIN).toMatch(/\[data-part='icon'\][^{]*\{[^}]*width:\s*var\(--ds-tree-icon-size/);
    // K3-A Pass 2 (sighted RTL): the collapsed expand caret mirrors in RTL;
    // the flip composes with Tailwind v4's native `rotate` property instead
    // of overriding the expanded 90° turn
    expect(SKIN).toMatch(/\[data-part='tree-node-toggle'\]\s*>\s*span:dir\(rtl\)[^{]*\{[^}]*transform:\s*scaleX\(-1\)/);
    // drop indicator wrapper + inner line
    expect(SKIN).toMatch(/\[data-part='drop-indicator'\][^{]*\{[^}]*inset-inline/);
    expect(SKIN).toMatch(/\[data-part='drop-indicator'\]\s*>\s*div[^{]*\{[^}]*rottay-drop-indicator/);
  });
});
