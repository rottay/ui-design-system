import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { StableEngineName } from '../../../../../tooling/testing/helpers/engine';
import { STABLE_ENGINES, renderWithEngine } from '../../../../../tooling/testing/helpers/engine';
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
      // CK-G stamps anatomy on modern + rustic; classic carries no data-part.
      const chip = container.querySelector("[data-part='argument-chip']");
      expect(chip).not.toBeNull();
      expect(chip!.textContent).toBe('Rename branch');
      expect(
        container.querySelector("[data-part='root']")!.getAttribute('data-mode'),
      ).toBe('argument');
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
      expect(
        container.querySelector("[data-part='root']")!.getAttribute('data-mode'),
      ).toBe('search');
    }
  });

  it.each(STABLE_ENGINES)('covers the closed branch through the %s engine', (engine) => {
    const Component = COMPONENTS[engine];

    const { container } = renderWithEngine(
      <Component {...createProps({ open: false })} />,
      engine
    );

    if (engine === 'classic') {
      expect(screen.queryByText('Create event')).not.toBeInTheDocument();
    } else {
      expect(container.firstChild).toBeNull();
    }
  });
});
