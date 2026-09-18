/**
 * The keyboard and touch move protocol the tree GAINED in WO-FAM-08 / F-69
 * lot 7 — a DECLARED ADDITION, not a transport pin. Before this lot the only
 * way to reorder a node was an HTML5 pointer drag, the arrows were the whole
 * of the tree's keyboard vocabulary, and nothing was ever announced.
 *
 * The drill walks the round trip the debrief §6.2 asks for, adapted to the
 * kernel's DELEGATED mode: open, pick a destination, pick a position, commit,
 * cancel, a refused self and a refused descendant, focus on both ends, and the
 * same physical key under an RTL locale. The keys the tree already owned —
 * arrows, Space, Enter, typeahead — must survive outside move mode.
 */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernTree from '../engines/modern';
import type { TreeDataNode } from '../contracts';
import { I18nProvider } from '@/infrastructure/runtime/i18n';

const DATA: TreeDataNode[] = [
  {
    key: 'src',
    title: 'src',
    children: [
      { key: 'index', title: 'index.ts' },
      { key: 'app', title: 'app.tsx' },
    ],
  },
  { key: 'pkg', title: 'package.json' },
  { key: 'readme', title: 'README.md' },
];

// ---------------------------------------------------------------------------
// A harness that really applies the move, so "the node moved" and "focus is on
// the node that moved" are read where the user reads them: in the DOM.
// ---------------------------------------------------------------------------

function detach(nodes: TreeDataNode[], key: React.Key): [TreeDataNode[], TreeDataNode | null] {
  let found: TreeDataNode | null = null;
  const walk = (list: TreeDataNode[]): TreeDataNode[] =>
    list
      .filter((node) => {
        if (node.key !== key) return true;
        found = node;
        return false;
      })
      .map((node) => (node.children ? { ...node, children: walk(node.children) } : node));
  const next = walk(nodes);
  return [next, found];
}

function attach(
  nodes: TreeDataNode[],
  dropKey: React.Key,
  moved: TreeDataNode,
  dropPosition: number
): TreeDataNode[] {
  const at = nodes.findIndex((node) => node.key === dropKey);
  if (at !== -1 && dropPosition !== 0) {
    const next = [...nodes];
    next.splice(dropPosition === -1 ? at : at + 1, 0, moved);
    return next;
  }
  return nodes.map((node) => {
    if (node.key === dropKey && dropPosition === 0) {
      return { ...node, children: [...(node.children ?? []), moved] };
    }
    return node.children ? { ...node, children: attach(node.children, dropKey, moved, dropPosition) } : node;
  });
}

function Harness({ onDrop }: { onDrop: (info: { dragKey: React.Key; dropKey: React.Key; dropPosition: number }) => void }) {
  const [data, setData] = React.useState<TreeDataNode[]>(DATA);
  return (
    <ModernTree
      treeData={data}
      draggable
      defaultExpandAll
      onDrop={({ dragNode, dropNode, dropPosition }) => {
        onDrop({ dragKey: dragNode.key, dropKey: dropNode.key, dropPosition });
        setData((previous) => {
          const [without, moved] = detach(previous, dragNode.key);
          return moved ? attach(without, dropNode.key, moved, dropPosition) : previous;
        });
      }}
    />
  );
}

function mount(locale?: 'ar') {
  const onDrop = vi.fn();
  const tree = <Harness onDrop={onDrop} />;
  const utils = render(
    locale ? (
      <I18nProvider locale={locale} fallbackLocale="en">
        {tree}
      </I18nProvider>
    ) : (
      tree
    )
  );
  return { ...utils, onDrop };
}

function rowOf(key: string): HTMLElement {
  const row = document.querySelector(`[data-tree-node-key="${key}"]`);
  if (!row) throw new Error(`Expected a tree row for ${key}`);
  return row as HTMLElement;
}

/** The move affordance, found where a user finds it: on the row it belongs to. */
function handleOf(key: string): HTMLElement {
  const handle = rowOf(key).querySelector('[data-part="drag-handle"]');
  if (!handle) throw new Error(`Expected a move control on ${key}`);
  return handle as HTMLElement;
}

function activate(key: string): void {
  act(() => {
    fireEvent.click(handleOf(key));
  });
}

function press(key: string): void {
  act(() => {
    fireEvent.keyDown(rowOf('src').closest('[data-part="root"]') as HTMLElement, { key });
  });
}

/**
 * The pair is identified by what it IS — two polite status regions — because
 * the announcer stamps no `data-part`: the VisuallyHidden primitive owns the
 * clip, so there is no anatomy for a skin rule to paint.
 */
function regions(container: HTMLElement): string[] {
  const found = Array.from(container.querySelectorAll('[role="status"][aria-live="polite"]'));
  expect(found).toHaveLength(2);
  return found.map((node) => node.textContent ?? '');
}

function announced(container: HTMLElement): string {
  return regions(container).join('');
}

/** Where the move would land right now, as the row stamps it. */
function candidate(): string | null {
  const target = document.querySelector('[data-part="row"][data-drop-target]');
  return target
    ? `${target.getAttribute('data-tree-node-key')}/${target.getAttribute('data-drop-position')}`
    : null;
}

/** The rendered order, depth-first, exactly as it reads on screen. */
function order(): string[] {
  return Array.from(document.querySelectorAll('[data-tree-node-key]')).map(
    (node) => node.getAttribute('data-tree-node-key') ?? ''
  );
}

describe('Tree move affordance — presence and tab reach', () => {
  it('renders no control and no live region when the tree is not draggable', () => {
    const { container } = render(<ModernTree treeData={DATA} defaultExpandAll />);

    expect(container.querySelectorAll('[data-part="drag-handle"]')).toHaveLength(0);
    expect(container.querySelectorAll('[role="status"]')).toHaveLength(0);
  });

  it('renders a named control per row and shares the tree ONE roving tab stop', () => {
    const { container } = mount();

    expect(container.querySelectorAll('[data-part="drag-handle"]')).toHaveLength(5);
    expect(handleOf('src')).toHaveAttribute('aria-label', 'Move src');
    expect(handleOf('pkg')).toHaveAttribute('aria-label', 'Move package.json');

    // One tab stop for the rows, one for their controls: not one per row.
    const tabbable = container.querySelectorAll('[data-part="drag-handle"][tabindex="0"]');
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0].closest('[data-tree-node-key]')).toHaveAttribute('data-tree-node-key', 'src');
    expect(regions(container)).toEqual(['', '']);
    for (const region of container.querySelectorAll('[role="status"]')) {
      expect(region).toHaveAttribute('aria-live', 'polite');
      expect(region.className).toContain('ds-visually-hidden');
    }
  });

  it('omits the control on a disabled row, which is not a drag source', () => {
    render(<ModernTree treeData={[{ key: 'a', title: 'A' }, { key: 'b', title: 'B', disabled: true }]} draggable />);

    expect(rowOf('a').querySelector('[data-part="drag-handle"]')).not.toBeNull();
    expect(rowOf('b').querySelector('[data-part="drag-handle"]')).toBeNull();
  });
});

describe('Tree move affordance — the keyboard round trip', () => {
  it('opens on a seeded destination, announces the protocol and stages nothing', () => {
    const { container, onDrop } = mount();

    activate('src');

    // `src`'s own children are never offered, so the seed is the first node
    // OUTSIDE its subtree.
    expect(candidate()).toBe('pkg/after');
    expect(rowOf('src')).toHaveAttribute('data-dragging', 'true');
    expect(handleOf('src')).toHaveAttribute('aria-pressed', 'true');
    expect(announced(container)).toContain('Moving src');
    expect(order()).toEqual(['src', 'index', 'app', 'pkg', 'readme']);
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('walks the destination with the vertical arrows and re-announces each one', () => {
    const { container, onDrop } = mount();

    activate('src');
    press('ArrowDown');
    const first = announced(container);
    press('ArrowUp');
    const second = announced(container);

    expect(first).toContain('after README.md');
    expect(second).toContain('after package.json');
    expect(first).not.toEqual(second);
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('steps the position with the cross axis and clamps at both ends', () => {
    const { container } = mount();

    activate('src');
    expect(candidate()).toBe('pkg/after');

    press('ArrowLeft');
    expect(candidate()).toBe('pkg/inside');
    expect(announced(container)).toContain('into package.json');

    press('ArrowLeft');
    expect(candidate()).toBe('pkg/before');

    press('ArrowLeft');
    expect(candidate()).toBe('pkg/before');
    expect(announced(container)).toContain('Cannot move src any further');

    press('ArrowRight');
    expect(candidate()).toBe('pkg/inside');
  });

  /**
   * The identical-outcome case §6.2 names: a second blocked press writes the
   * SAME string, so it only re-announces because the two regions alternate.
   * Reading the concatenation alone would be green on a single stuck region.
   */
  it('announces a blocked edge, moves nothing, and re-announces when repeated', () => {
    const { container, onDrop } = mount();

    activate('src');
    press('ArrowDown');
    press('ArrowDown');
    const firstRegions = regions(container);
    press('ArrowDown');
    const secondRegions = regions(container);

    expect(announced(container)).toContain('Cannot move src any further');
    expect(firstRegions).not.toEqual(secondRegions);
    expect(firstRegions.filter(Boolean)).toEqual(secondRegions.filter(Boolean));
    expect(candidate()).toBe('readme/after');
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('commits once on Enter, moves the node, and lands focus on it', () => {
    const { container, onDrop } = mount();

    activate('src');
    press('Enter');

    expect(onDrop.mock.calls).toEqual([[{ dragKey: 'src', dropKey: 'pkg', dropPosition: 1 }]]);
    expect(order()).toEqual(['pkg', 'src', 'index', 'app', 'readme']);
    expect(announced(container)).toContain('src moved after package.json');
    expect(candidate()).toBeNull();
    expect(rowOf('src')).toHaveFocus();
  });

  it('commits on Space too, because move mode is modal over the tree contract', () => {
    const { onDrop } = mount();

    activate('src');
    press(' ');

    expect(onDrop).toHaveBeenCalledTimes(1);
  });

  it('cancels on Escape with an announcement and focus back on the origin row', () => {
    const { container, onDrop } = mount();

    activate('src');
    press('ArrowDown');
    press('Escape');

    expect(announced(container)).toContain('Move cancelled');
    expect(announced(container)).toContain('src stays where it was');
    expect(candidate()).toBeNull();
    expect(order()).toEqual(['src', 'index', 'app', 'pkg', 'readme']);
    expect(onDrop).not.toHaveBeenCalled();
    expect(rowOf('src')).toHaveFocus();
    expect(handleOf('src')).toHaveAttribute('aria-label', 'Move src');
  });
});

describe('Tree move affordance — touch, which is the same control', () => {
  it('relabels every row while a move is live, and a destination commits in one tap', () => {
    const { container, onDrop } = mount();

    activate('src');

    // Each destination control names ITS OWN row, so the label is the promise
    // a tap keeps -- the candidate's position, against the row it sits on.
    expect(handleOf('src')).toHaveAttribute('aria-label', 'Cancel moving src');
    expect(handleOf('pkg')).toHaveAttribute('aria-label', 'Move src after package.json');
    expect(handleOf('readme')).toHaveAttribute('aria-label', 'Move src after README.md');
    expect(handleOf('index')).toHaveAttribute('aria-label', 'Cannot move src into index.ts');

    activate('readme');

    expect(onDrop.mock.calls).toEqual([[{ dragKey: 'src', dropKey: 'readme', dropPosition: 1 }]]);
    expect(order()).toEqual(['pkg', 'readme', 'src', 'index', 'app']);
    expect(announced(container)).toContain('src moved after README.md');
  });

  it('cancels from the origin control, which is the same control it opened', () => {
    const { container, onDrop } = mount();

    activate('src');
    activate('src');

    expect(announced(container)).toContain('Move cancelled');
    expect(candidate()).toBeNull();
    expect(onDrop).not.toHaveBeenCalled();
  });
});

describe('Tree move affordance — self and descendants are refused by name', () => {
  it('never offers the node itself or its own subtree as a destination', () => {
    const { onDrop } = mount();

    activate('src');
    // Walking UP from `pkg` has only `src`'s own subtree above it, so the walk
    // refuses rather than landing on a descendant.
    press('ArrowUp');

    expect(candidate()).toBe('pkg/after');
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('skips a descendant on the way past it instead of landing on it', () => {
    const { onDrop } = mount();

    activate('pkg');
    expect(candidate()).toBe('readme/after');
    press('ArrowUp');
    // `pkg` itself is skipped as self; the next eligible row up is `app`.
    expect(candidate()).toBe('app/after');
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('refuses the descendant control by name and commits nothing', () => {
    const { container, onDrop } = mount();

    activate('src');
    activate('app');

    expect(announced(container)).toContain('Cannot move src into app.tsx');
    expect(announced(container)).toContain('it is inside src');
    expect(onDrop).not.toHaveBeenCalled();
    expect(candidate()).toBe('pkg/after');
  });

  it('says so, and opens nothing, when a node has nowhere to go', () => {
    const { container } = render(
      <ModernTree treeData={[{ key: 'only', title: 'Only' }]} draggable defaultExpandAll />
    );

    act(() => {
      fireEvent.click(handleOf('only'));
    });

    expect(announced(container)).toContain('There is nowhere to move Only');
    expect(candidate()).toBeNull();
    expect(handleOf('only')).toHaveAttribute('aria-label', 'Move Only');
  });
});

describe('Tree move affordance — reading direction', () => {
  /**
   * The direction authority is the i18n locale, never a DOM probe: under `ar`
   * the same physical key resolves the opposite logical intent on the cross
   * axis, so ArrowRight steps the position where ArrowLeft does in LTR.
   */
  it('mirrors the cross axis under an RTL locale', () => {
    mount('ar');

    activate('src');
    expect(candidate()).toBe('pkg/after');

    press('ArrowRight');
    expect(candidate()).toBe('pkg/inside');

    press('ArrowLeft');
    expect(candidate()).toBe('pkg/after');
  });

  it('leaves the vertical axis alone under an RTL locale', () => {
    mount('ar');

    activate('src');
    press('ArrowDown');

    expect(candidate()).toBe('readme/after');
  });
});

describe('Tree move affordance — the keys the tree already owned', () => {
  it('leaves the arrows, Space and Enter to the TreeView contract while no move is live', () => {
    const onSelect = vi.fn();
    const onCheck = vi.fn();
    const { container } = render(
      <ModernTree treeData={DATA} draggable defaultExpandAll checkable onSelect={onSelect} onCheck={onCheck} />
    );

    rowOf('src').focus();
    press('ArrowDown');
    expect(rowOf('index')).toHaveFocus();

    press(' ');
    expect(onCheck).toHaveBeenCalledTimes(1);

    press('Enter');
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(announced(container)).toEqual('');
  });

  it('says nothing on a POINTER drop, exactly as before this lot', () => {
    const { container, onDrop } = mount();
    const row = rowOf('pkg');
    Object.defineProperty(row, 'getBoundingClientRect', {
      value: () => ({ top: 0, left: 0, width: 100, height: 100, bottom: 100, right: 100, x: 0, y: 0, toJSON: () => ({}) }),
      configurable: true,
    });

    act(() => {
      fireEvent.dragStart(rowOf('src'), { dataTransfer: { effectAllowed: '', setData: vi.fn() } });
    });
    act(() => {
      const event = new Event('dragover', { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'clientY', { value: 90 });
      Object.defineProperty(event, 'dataTransfer', { value: { dropEffect: '' } });
      row.dispatchEvent(event);
    });
    act(() => {
      fireEvent.drop(row);
    });

    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(announced(container)).toEqual('');
    expect(document.activeElement).toBe(document.body);
  });
});
