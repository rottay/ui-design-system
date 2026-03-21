import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { StableEngineName } from '../../../_internal/testing/helpers/engine-test-utils';
import { STABLE_ENGINES, renderWithEngine } from '../../../_internal/testing/helpers/engine-test-utils';
import type { CommandPaletteProps } from './CommandPalette.types';
import ClassicCommandPalette from './engines/classic';
import ModernCommandPalette from './engines/modern';
import RusticCommandPalette from './engines/rustic';

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

describe('PatternCommandPalette advanced engine coverage', () => {
  it.each(STABLE_ENGINES)('covers grouping, recent items, search filtering, keyboard selection, disabled items, and empty states through the %s engine', async (engine) => {
    const Component = COMPONENTS[engine];
    const props = createProps();

    renderWithEngine(<Component {...props} />, engine);

    const input = await screen.findByRole('textbox');
    expect(await screen.findByText('Recent')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('Use arrows to navigate')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(props.items[0].onSelect).toHaveBeenCalledTimes(1);
    expect(props.onOpenChange).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByText('Disabled item'));
    expect(props.items[2].onSelect).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: 'report' } });
    expect(props.onSearch).toHaveBeenCalledWith('report');
    expect(await screen.findByText('Open report')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'no-match' } });
    expect(await screen.findByText('No results found.')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
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
