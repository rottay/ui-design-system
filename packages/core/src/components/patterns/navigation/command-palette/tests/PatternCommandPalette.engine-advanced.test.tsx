import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { StableEngineName } from '@tests/support/engine';
import { STABLE_ENGINES, renderWithEngine } from '@tests/support/engine';
import type { CommandPaletteProps } from '../contracts';
import ClassicCommandPalette from '../engines/classic';
import ModernCommandPalette from '../engines/modern';
import RusticCommandPalette from '../engines/rustic';

const COMPONENTS: Record<StableEngineName, React.ComponentType<CommandPaletteProps>> = {
  classic: ClassicCommandPalette,
  modern: ModernCommandPalette,
  rustic: RusticCommandPalette,
};

function createProps(overrides: Partial<CommandPaletteProps> = {}): CommandPaletteProps {
  return {
    open: true,
    onOpenChange: vi.fn(),
    onSearch: vi.fn(),
    footer: <div>Use arrows to navigate</div>,
    recentItems: [
      {
        id: 'recent-settings',
        label: 'Recent settings',
        onSelect: vi.fn(),
      },
    ],
    items: [
      {
        id: 'create-event',
        label: 'Create event',
        description: 'Create a new event',
        shortcut: 'C',
        group: 'Actions',
        onSelect: vi.fn(),
      },
      {
        id: 'open-report',
        label: 'Open report',
        description: 'Open the reporting dashboard',
        group: 'Actions',
        onSelect: vi.fn(),
      },
      {
        id: 'disabled-item',
        label: 'Disabled item',
        group: 'Danger zone',
        disabled: true,
        onSelect: vi.fn(),
      },
    ],
    ...overrides,
  };
}

function falseCloseCalls(props: CommandPaletteProps): number {
  return (props.onOpenChange as ReturnType<typeof vi.fn>).mock.calls.filter(
    (call) => call[0] === false,
  ).length;
}

describe('PatternCommandPalette advanced engine coverage', () => {
  it.each(STABLE_ENGINES)('covers grouping, recent items, rendered-order keyboard selection, disabled items, and parent-owned filtering through the %s engine', async (engine) => {
    const Component = COMPONENTS[engine];
    const props = createProps();

    renderWithEngine(<Component {...props} />, engine);

    // The modern engine's search input is role="combobox" (classic/rustic are
    // implicit textboxes), so query by the shared default placeholder.
    const input = await screen.findByPlaceholderText('Type a command...');
    expect(await screen.findByText('Recent')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('Use arrows to navigate')).toBeInTheDocument();

    // activeIndex 0 is the first RENDERED row -- the Recent section's item --
    // so Enter executes exactly the row the highlight sits on.
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(props.recentItems![0].onSelect).toHaveBeenCalledTimes(1);
    expect(props.items[0].onSelect).not.toHaveBeenCalled();
    expect(props.onOpenChange).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByText('Disabled item'));
    expect(props.items[2].onSelect).not.toHaveBeenCalled();

    // With an onSearch handler the PARENT owns filtering (async sources can
    // return rows whose labels do not contain the query): the query
    // propagates out and no row is dropped engine-side.
    fireEvent.change(input, { target: { value: 'report' } });
    expect(props.onSearch).toHaveBeenCalledWith('report');
    expect(await screen.findByText('Open report')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'no-match' } });
    expect(props.onSearch).toHaveBeenCalledWith('no-match');
    expect(screen.getByText('Create event')).toBeInTheDocument();
    expect(screen.queryByText('No results found.')).not.toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it.each(STABLE_ENGINES)('self-filters and shows the empty state when no onSearch handler is provided (%s engine)', async (engine) => {
    const Component = COMPONENTS[engine];
    const props = createProps({ onSearch: undefined });

    renderWithEngine(<Component {...props} />, engine);

    const input = await screen.findByPlaceholderText('Type a command...');

    fireEvent.change(input, { target: { value: 'report' } });
    expect(await screen.findByText('Open report')).toBeInTheDocument();
    expect(screen.queryByText('Create event')).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'zz-no-match' } });
    expect(await screen.findByText('No results found.')).toBeInTheDocument();
  });

  it.each(STABLE_ENGINES)('renders a non-selectable per-section error row and keyboard-skips it (%s engine)', async (engine) => {
    const Component = COMPONENTS[engine];
    const props = createProps({
      recentItems: undefined,
      items: [
        {
          id: 'ds-command-source-error-documents',
          label: "Couldn't search Documents",
          description: 'backend unreachable',
          group: 'Documents',
          kind: 'error',
          disabled: true,
          onSelect: vi.fn(),
        },
        {
          id: 'doc-1',
          label: 'Quarterly report',
          group: 'Documents',
          onSelect: vi.fn(),
        },
      ],
    });

    renderWithEngine(<Component {...props} />, engine);

    const input = await screen.findByPlaceholderText('Type a command...');
    expect(screen.getByText("Couldn't search Documents")).toBeInTheDocument();
    expect(screen.getByText('backend unreachable')).toBeInTheDocument();

    // Clicking the error row must never fire its callback.
    fireEvent.click(screen.getByText("Couldn't search Documents"));
    expect(props.items[0].onSelect).not.toHaveBeenCalled();

    // Keyboard index 0 lands on the real row, skipping the error row.
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(props.items[1].onSelect).toHaveBeenCalledTimes(1);
  });

  it.each(STABLE_ENGINES)('collects a parameterized command in argument mode: chip + prompt, validation, confirm, Escape pop (%s engine)', async (engine) => {
    const Component = COMPONENTS[engine];
    const onSubmit = vi.fn();
    const onSelect = vi.fn();
    const props = createProps({
      recentItems: undefined,
      items: [
        {
          id: 'rename-branch',
          label: 'Rename branch',
          group: 'Actions',
          parameter: {
            prompt: 'Branch name',
            placeholder: 'feature/...',
            validate: (value) => (value.trim() ? null : 'Name is required'),
          },
          onSelect,
          onSubmit,
        },
      ],
    });

    const { container } = renderWithEngine(<Component {...props} />, engine);

    const input = await screen.findByPlaceholderText('Type a command...');

    // Selecting the parameterized item enters argument mode instead of
    // executing: prompt + argument placeholder appear, nothing closed.
    fireEvent.click(screen.getByText('Rename branch'));
    expect(onSelect).not.toHaveBeenCalled();
    expect(falseCloseCalls(props)).toBe(0);
    expect(await screen.findByText('Branch name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('feature/...')).toBeInTheDocument();
    // The breadcrumb chip carries the pending command's label (the list row
    // is replaced by the prompt panel, so this match IS the chip).
    expect(screen.getByText('Rename branch')).toBeInTheDocument();
    if (engine !== 'classic') {
      // navigation-pattern anatomy stamps anatomy on modern + rustic; classic carries no data-part.
      // The modern engine composes Modal, so its content portals OUT of
      // `container` -- the scope for both queries is the whole document, and
      // the mode stamp rides the palette's own content wrapper.
      const scope = engine === 'modern' ? container.ownerDocument : container;
      const modeHost = engine === 'modern' ? "[data-part='content']" : "[data-part='root']";
      const chip = scope.querySelector("[data-part='argument-chip']");
      expect(chip).not.toBeNull();
      expect(chip!.textContent).toBe('Rename branch');
      expect(scope.querySelector(modeHost)!.getAttribute('data-mode')).toBe('argument');
    }

    // Confirming an invalid value keeps argument mode open with the error.
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText('Name is required')).toBeInTheDocument();

    // Editing clears the error; confirming fires run(value) and closes.
    fireEvent.change(input, { target: { value: 'release-cut' } });
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith('release-cut');
    expect(falseCloseCalls(props)).toBe(1);

    // Re-enter argument mode, then Escape pops back to search WITHOUT
    // closing the palette: the prompt disappears, the list returns.
    fireEvent.click(screen.getByText('Rename branch'));
    expect(await screen.findByText('Branch name')).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByText('Branch name')).not.toBeInTheDocument();
    expect(screen.getByText('Rename branch')).toBeInTheDocument();
    expect(falseCloseCalls(props)).toBe(1);
    if (engine !== 'classic') {
      const scope = engine === 'modern' ? container.ownerDocument : container;
      const modeHost = engine === 'modern' ? "[data-part='content']" : "[data-part='root']";
      expect(scope.querySelector(modeHost)!.getAttribute('data-mode')).toBe('search');
    }
  });

  it.each(STABLE_ENGINES)('covers the closed branch through the %s engine', (engine) => {
    const Component = COMPONENTS[engine];

    const { container } = renderWithEngine(
      <Component {...createProps({ open: false })} />,
      engine
    );

    if (engine === 'rustic') {
      expect(container.firstChild).toBeNull();
    } else if (engine === 'modern') {
      // The modern engine composes Modal, whose portal-scope anchor renders
      // even while closed (it is the lineage source the portal snapshot reads
      // from). The closed branch is therefore "no chamber anywhere in the
      // document", asserted at full strength -- not "container is empty".
      expect(container.firstChild).not.toBeNull();
      expect((container.firstChild as HTMLElement).getAttribute('data-part')).toBe('anchor');
      expect(container.ownerDocument.querySelector('dialog')).toBeNull();
      expect(
        container.ownerDocument.querySelector("[data-part='content']"),
      ).toBeNull();
    }
    expect(screen.queryByText('Create event')).not.toBeInTheDocument();
  });
});

// Modern-only: the palette delegates its overlay shell to the governed Modal
// and scopes every APG id to the instance.
describe('modern command palette -- governed shell + instance scoping', () => {
  it('scopes listbox/option ids per instance so two palettes on one page never collide', async () => {
    const first = createProps({ onSearch: undefined });
    const second = createProps({ onSearch: undefined });

    renderWithEngine(
      <>
        <ModernCommandPalette {...first} />
        <ModernCommandPalette {...second} />
      </>,
      'modern',
    );

    await screen.findAllByPlaceholderText('Type a command...');
    const [comboA, comboB] = screen.getAllByRole('combobox');
    expect(comboA).toBeDefined();
    expect(comboB).toBeDefined();

    const listboxIdA = comboA!.getAttribute('aria-controls');
    const listboxIdB = comboB!.getAttribute('aria-controls');
    expect(listboxIdA).toBeTruthy();
    expect(listboxIdB).toBeTruthy();
    // The collision itself: a global literal id makes these identical.
    expect(listboxIdA).not.toBe(listboxIdB);

    const listboxA = document.getElementById(listboxIdA!);
    const listboxB = document.getElementById(listboxIdB!);
    expect(listboxA).not.toBeNull();
    expect(listboxB).not.toBeNull();
    expect(listboxA).not.toBe(listboxB);
    expect(listboxA!.contains(comboA!)).toBe(false);

    // Each input's virtual focus must resolve INSIDE its own listbox.
    const activeA = document.getElementById(comboA!.getAttribute('aria-activedescendant')!);
    const activeB = document.getElementById(comboB!.getAttribute('aria-activedescendant')!);
    expect(activeA).not.toBeNull();
    expect(activeB).not.toBeNull();
    expect(listboxA!.contains(activeA)).toBe(true);
    expect(listboxB!.contains(activeB)).toBe(true);
    expect(activeA).not.toBe(activeB);
  });

  it('is keyboard-operable from a focus target that is not the search input', async () => {
    const props = createProps({ onSearch: undefined, recentItems: undefined });

    renderWithEngine(<ModernCommandPalette {...props} />, 'modern');

    const combobox = await screen.findByRole('combobox');
    const listbox = screen.getByRole('listbox');

    // The keydown never touches the input: with the handler bound to the input
    // only, this event has no listener on its bubble path.
    fireEvent.keyDown(listbox, { key: 'ArrowDown' });
    const secondOptionId = combobox.getAttribute('aria-activedescendant');
    expect(secondOptionId).toBe(screen.getAllByRole('option')[1]!.id);

    fireEvent.keyDown(listbox, { key: 'Enter' });
    expect(props.items[1].onSelect).toHaveBeenCalledTimes(1);
    expect(props.items[0].onSelect).not.toHaveBeenCalled();
  });

  it('renders inside the governed Modal shell instead of a hand-rolled overlay', async () => {
    renderWithEngine(<ModernCommandPalette {...createProps()} />, 'modern');

    const combobox = await screen.findByRole('combobox');
    const dialog = document.querySelector('dialog[aria-modal="true"]');
    expect(dialog).not.toBeNull();

    // The palette scope now rides Modal's surface part.
    const surface = dialog!.querySelector("[data-part='surface']");
    expect(surface).not.toBeNull();
    expect(surface!.classList.contains('ds-pattern-command-palette')).toBe(true);
    expect(surface!.classList.contains('ds-engine-modern')).toBe(true);
    expect(surface!.contains(combobox)).toBe(true);

    // The retired hand-rolled chrome must be gone, not merely unstyled: the
    // focus trap and the backdrop it wrapped are now Modal's.
    expect(document.querySelector("[data-part='dialog']")).toBeNull();
  });

  it('links the argument-mode prompt and error to the input via aria-describedby', async () => {
    const props = createProps({
      recentItems: undefined,
      items: [
        {
          id: 'rename-branch',
          label: 'Rename branch',
          group: 'Actions',
          parameter: {
            prompt: 'Branch name',
            validate: (value) => (value.trim() ? null : 'Name is required'),
          },
          onSelect: vi.fn(),
          onSubmit: vi.fn(),
        },
      ],
    });

    renderWithEngine(<ModernCommandPalette {...props} />, 'modern');

    const input = await screen.findByPlaceholderText('Type a command...');
    fireEvent.click(screen.getByText('Rename branch'));
    const prompt = await screen.findByText('Branch name');
    expect(prompt.id).toBeTruthy();

    // Screen readers announce aria-describedby on focus, so the prompt must be reachable
    // that way, not only by DOM order after the input.
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toContain(prompt.id);

    // An empty argument still describes what to type, even before the
    // validation error exists.
    fireEvent.keyDown(input, { key: 'Enter' });
    const error = await screen.findByText('Name is required');
    expect(input.getAttribute('aria-describedby')).toContain(error.id);
    expect(input.getAttribute('aria-describedby')).toContain(prompt.id);
  });

  it('clamps the keyboard cursor when the item set shrinks with no query change', async () => {
    const props = createProps({ onSearch: undefined, recentItems: undefined });
    const { rerender } = renderWithEngine(<ModernCommandPalette {...props} />, 'modern');

    const input = await screen.findByPlaceholderText('Type a command...');
    // Move the cursor onto the last of the 3 seeded items.
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.getAttribute('aria-activedescendant')).toBe(
      screen.getAllByRole('option')[2]!.id,
    );

    // An async source resolving with fewer rows than were visible, with no query change
    // so the query-reset effect does not run.
    const onlyItemSelect = vi.fn();
    rerender(
      <ModernCommandPalette
        {...props}
        items={[{ id: 'only-item', label: 'Only item', group: 'Actions', onSelect: onlyItemSelect }]}
      />,
    );

    // The cursor must land on the one remaining option -- not point past
    // the end with aria-activedescendant undefined and no row highlighted.
    const remaining = screen.getAllByRole('option');
    expect(remaining).toHaveLength(1);
    expect(input.getAttribute('aria-activedescendant')).toBe(remaining[0]!.id);

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onlyItemSelect).toHaveBeenCalledTimes(1);
  });
});

// Modern-only: the empty result set must not leave a dangling virtual focus.
describe('modern command palette -- empty result announcement', () => {
  it('drops aria-activedescendant when the query matches no row', () => {
    const props = createProps({ onSearch: undefined, recentItems: [] });

    const { container } = renderWithEngine(<ModernCommandPalette {...props} />, 'modern');

    const combobox = screen.getByRole('combobox');
    // Ids are instance-scoped now, so the pin is by IDENTITY: the virtual
    // focus must name the first rendered option, whatever its generated id.
    const firstOption = screen.getAllByRole('option')[0]!;
    expect(firstOption.id).toBeTruthy();
    expect(combobox.getAttribute('aria-activedescendant')).toBe(firstOption.id);

    fireEvent.change(combobox, { target: { value: 'zzzz-no-such-command' } });

    expect(screen.queryByRole('option')).toBeNull();
    expect(combobox.getAttribute('aria-activedescendant')).toBeNull();
    expect(
      container.ownerDocument.querySelector("[data-part='empty']")?.getAttribute('role'),
    ).toBe('status');
  });
});
