import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  CommandRegistryProvider,
  useRegisterCommands,
  useCommands,
  useExecuteCommand,
} from './index';
import type { Command } from './index';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function createWrapper(): React.FC<{ children: React.ReactNode }> {
  return function Wrapper({ children }) {
    return <CommandRegistryProvider>{children}</CommandRegistryProvider>;
  };
}

function makeCommand(overrides: Partial<Command> & { id: string; label: string }): Command {
  return {
    action: vi.fn(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Provider errors
// ---------------------------------------------------------------------------

describe('CommandRegistryProvider', () => {
  it('useRegisterCommands throws without provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderHook(() =>
        useRegisterCommands([
          makeCommand({ id: 'test', label: 'Test' }),
        ]),
      );
    }).toThrow(/CommandRegistryProvider/);
    spy.mockRestore();
  });

  it('useCommands throws without provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderHook(() => useCommands());
    }).toThrow(/CommandRegistryProvider/);
    spy.mockRestore();
  });

  it('useExecuteCommand throws without provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderHook(() => useExecuteCommand());
    }).toThrow(/CommandRegistryProvider/);
    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// useRegisterCommands
// ---------------------------------------------------------------------------

describe('useRegisterCommands', () => {
  it('registers commands without throwing', () => {
    expect(() => {
      renderHook(
        () =>
          useRegisterCommands([
            makeCommand({ id: 'save', label: 'Save' }),
            makeCommand({ id: 'delete', label: 'Delete' }),
          ]),
        { wrapper: createWrapper() },
      );
    }).not.toThrow();
  });

  it('auto-unregisters commands on unmount', () => {
    let commandsResult: ReturnType<typeof useCommands> | null = null;

    function Registrar() {
      useRegisterCommands([
        makeCommand({ id: 'temp-cmd', label: 'Temporary' }),
      ]);
      return null;
    }

    function Reader() {
      commandsResult = useCommands();
      return null;
    }

    const { rerender } = render(
      <CommandRegistryProvider>
        <Registrar />
        <Reader />
      </CommandRegistryProvider>,
    );

    // After mount, the command should be registered
    expect(commandsResult!.commands.length).toBe(1);
    expect(commandsResult!.commands[0].id).toBe('temp-cmd');

    // Remove Registrar to trigger unmount
    rerender(
      <CommandRegistryProvider>
        <Reader />
      </CommandRegistryProvider>,
    );

    expect(commandsResult!.commands.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// useCommands
// ---------------------------------------------------------------------------

describe('useCommands', () => {
  it('returns registered commands sorted by priority', () => {
    let commandsResult: ReturnType<typeof useCommands> | null = null;

    function Registrar() {
      useRegisterCommands([
        makeCommand({ id: 'low', label: 'Low Priority', priority: 1 }),
        makeCommand({ id: 'high', label: 'High Priority', priority: 100 }),
        makeCommand({ id: 'mid', label: 'Mid Priority', priority: 50 }),
      ]);
      return null;
    }

    function Reader() {
      commandsResult = useCommands();
      return null;
    }

    render(
      <CommandRegistryProvider>
        <Registrar />
        <Reader />
      </CommandRegistryProvider>,
    );

    expect(commandsResult!.commands.map((c) => c.id)).toEqual([
      'high',
      'mid',
      'low',
    ]);
  });

  it('sorts alphabetically when priorities are equal', () => {
    let commandsResult: ReturnType<typeof useCommands> | null = null;

    function Registrar() {
      useRegisterCommands([
        makeCommand({ id: 'c', label: 'Charlie' }),
        makeCommand({ id: 'a', label: 'Alpha' }),
        makeCommand({ id: 'b', label: 'Bravo' }),
      ]);
      return null;
    }

    function Reader() {
      commandsResult = useCommands();
      return null;
    }

    render(
      <CommandRegistryProvider>
        <Registrar />
        <Reader />
      </CommandRegistryProvider>,
    );

    expect(commandsResult!.commands.map((c) => c.id)).toEqual(['a', 'b', 'c']);
  });

  it('filters out commands where when() returns false', () => {
    let commandsResult: ReturnType<typeof useCommands> | null = null;
    let isAdmin = false;

    function Registrar() {
      useRegisterCommands([
        makeCommand({ id: 'public', label: 'Public Command' }),
        makeCommand({ id: 'admin', label: 'Admin Command', when: () => isAdmin }),
      ]);
      return null;
    }

    function Reader() {
      commandsResult = useCommands();
      return null;
    }

    const { rerender } = render(
      <CommandRegistryProvider>
        <Registrar />
        <Reader />
      </CommandRegistryProvider>,
    );

    // when() returns false, admin command should not be listed
    expect(commandsResult!.commands.length).toBe(1);
    expect(commandsResult!.commands[0].id).toBe('public');

    // Enable admin
    isAdmin = true;
    rerender(
      <CommandRegistryProvider>
        <Registrar />
        <Reader />
      </CommandRegistryProvider>,
    );

    // Now both should be available (getAll reads when() at call time)
    expect(commandsResult!.commands.length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// search
// ---------------------------------------------------------------------------

describe('useCommands.search', () => {
  it('returns all commands for empty query', () => {
    let commandsResult: ReturnType<typeof useCommands> | null = null;

    function Registrar() {
      useRegisterCommands([
        makeCommand({ id: 'a', label: 'Alpha' }),
        makeCommand({ id: 'b', label: 'Bravo' }),
      ]);
      return null;
    }

    function Reader() {
      commandsResult = useCommands();
      return null;
    }

    render(
      <CommandRegistryProvider>
        <Registrar />
        <Reader />
      </CommandRegistryProvider>,
    );

    const results = commandsResult!.search('');
    expect(results.length).toBe(2);
  });

  it('finds commands by label substring match', () => {
    let commandsResult: ReturnType<typeof useCommands> | null = null;

    function Registrar() {
      useRegisterCommands([
        makeCommand({ id: 'create-ticket', label: 'Create Ticket' }),
        makeCommand({ id: 'delete-ticket', label: 'Delete Ticket' }),
        makeCommand({ id: 'go-inbox', label: 'Go to Inbox' }),
      ]);
      return null;
    }

    function Reader() {
      commandsResult = useCommands();
      return null;
    }

    render(
      <CommandRegistryProvider>
        <Registrar />
        <Reader />
      </CommandRegistryProvider>,
    );

    const results = commandsResult!.search('ticket');
    expect(results.length).toBe(2);
    expect(results.map((r) => r.id).sort()).toEqual(['create-ticket', 'delete-ticket']);
  });

  it('searches across description as well', () => {
    let commandsResult: ReturnType<typeof useCommands> | null = null;

    function Registrar() {
      useRegisterCommands([
        makeCommand({ id: 'settings', label: 'Settings', description: 'Open preferences panel' }),
        makeCommand({ id: 'profile', label: 'Profile' }),
      ]);
      return null;
    }

    function Reader() {
      commandsResult = useCommands();
      return null;
    }

    render(
      <CommandRegistryProvider>
        <Registrar />
        <Reader />
      </CommandRegistryProvider>,
    );

    const results = commandsResult!.search('preferences');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('settings');
  });

  it('performs case-insensitive search', () => {
    let commandsResult: ReturnType<typeof useCommands> | null = null;

    function Registrar() {
      useRegisterCommands([
        makeCommand({ id: 'save', label: 'Save Document' }),
      ]);
      return null;
    }

    function Reader() {
      commandsResult = useCommands();
      return null;
    }

    render(
      <CommandRegistryProvider>
        <Registrar />
        <Reader />
      </CommandRegistryProvider>,
    );

    expect(commandsResult!.search('SAVE').length).toBe(1);
    expect(commandsResult!.search('save').length).toBe(1);
    expect(commandsResult!.search('Save').length).toBe(1);
  });

  it('returns empty array for non-matching query', () => {
    let commandsResult: ReturnType<typeof useCommands> | null = null;

    function Registrar() {
      useRegisterCommands([
        makeCommand({ id: 'save', label: 'Save' }),
      ]);
      return null;
    }

    function Reader() {
      commandsResult = useCommands();
      return null;
    }

    render(
      <CommandRegistryProvider>
        <Registrar />
        <Reader />
      </CommandRegistryProvider>,
    );

    expect(commandsResult!.search('zzzzz').length).toBe(0);
  });

  it('fuzzy matches characters in order', () => {
    let commandsResult: ReturnType<typeof useCommands> | null = null;

    function Registrar() {
      useRegisterCommands([
        makeCommand({ id: 'ct', label: 'Create Ticket' }),
        makeCommand({ id: 'other', label: 'Open Dashboard' }),
      ]);
      return null;
    }

    function Reader() {
      commandsResult = useCommands();
      return null;
    }

    render(
      <CommandRegistryProvider>
        <Registrar />
        <Reader />
      </CommandRegistryProvider>,
    );

    // 'crtic' should fuzzy match 'Create Ticket' (c-r-t-i-c all appear in order)
    const results = commandsResult!.search('crtic');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('ct');
  });
});

// ---------------------------------------------------------------------------
// execute
// ---------------------------------------------------------------------------

describe('useCommands.execute', () => {
  it('executes a command by ID', async () => {
    const action = vi.fn();
    let commandsResult: ReturnType<typeof useCommands> | null = null;

    function Registrar() {
      useRegisterCommands([
        { id: 'do-thing', label: 'Do Thing', action },
      ]);
      return null;
    }

    function Reader() {
      commandsResult = useCommands();
      return null;
    }

    render(
      <CommandRegistryProvider>
        <Registrar />
        <Reader />
      </CommandRegistryProvider>,
    );

    await act(async () => {
      await commandsResult!.execute('do-thing');
    });

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('throws when executing a non-existent command', async () => {
    let commandsResult: ReturnType<typeof useCommands> | null = null;

    function Registrar() {
      useRegisterCommands([
        makeCommand({ id: 'exists', label: 'Exists' }),
      ]);
      return null;
    }

    function Reader() {
      commandsResult = useCommands();
      return null;
    }

    render(
      <CommandRegistryProvider>
        <Registrar />
        <Reader />
      </CommandRegistryProvider>,
    );

    await expect(
      act(async () => {
        await commandsResult!.execute('does-not-exist');
      }),
    ).rejects.toThrow(/not found/);
  });

  it('throws when executing a command whose when() returns false', async () => {
    let commandsResult: ReturnType<typeof useCommands> | null = null;

    function Registrar() {
      useRegisterCommands([
        makeCommand({
          id: 'restricted',
          label: 'Restricted',
          when: () => false,
        }),
      ]);
      return null;
    }

    function Reader() {
      commandsResult = useCommands();
      return null;
    }

    render(
      <CommandRegistryProvider>
        <Registrar />
        <Reader />
      </CommandRegistryProvider>,
    );

    await expect(
      act(async () => {
        await commandsResult!.execute('restricted');
      }),
    ).rejects.toThrow(/not available/);
  });
});

// ---------------------------------------------------------------------------
// useExecuteCommand
// ---------------------------------------------------------------------------

describe('useExecuteCommand', () => {
  it('returns a function that executes commands by ID', async () => {
    const action = vi.fn();
    let executeFn: ((id: string) => Promise<void>) | null = null;

    function Registrar() {
      useRegisterCommands([
        { id: 'action-cmd', label: 'Action', action },
      ]);
      return null;
    }

    function Executor() {
      executeFn = useExecuteCommand();
      return null;
    }

    render(
      <CommandRegistryProvider>
        <Registrar />
        <Executor />
      </CommandRegistryProvider>,
    );

    await act(async () => {
      await executeFn!('action-cmd');
    });

    expect(action).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Keyboard shortcut integration
// ---------------------------------------------------------------------------

describe('Keyboard shortcut integration', () => {
  it('fires command action on matching keyboard shortcut', () => {
    const action = vi.fn();

    function Registrar() {
      useRegisterCommands([
        { id: 'save', label: 'Save', shortcut: 'ctrl+s', action },
      ]);
      return null;
    }

    render(
      <CommandRegistryProvider>
        <Registrar />
      </CommandRegistryProvider>,
    );

    act(() => {
      fireEvent.keyDown(document, { key: 's', ctrlKey: true });
    });

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('does not fire for non-matching shortcuts', () => {
    const action = vi.fn();

    function Registrar() {
      useRegisterCommands([
        { id: 'save', label: 'Save', shortcut: 'ctrl+s', action },
      ]);
      return null;
    }

    render(
      <CommandRegistryProvider>
        <Registrar />
      </CommandRegistryProvider>,
    );

    act(() => {
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    });

    expect(action).not.toHaveBeenCalled();
  });

  it('does not fire shortcut when typing in input', () => {
    const action = vi.fn();

    function Registrar() {
      useRegisterCommands([
        { id: 'quick', label: 'Quick', shortcut: 'ctrl+n', action },
      ]);
      return null;
    }

    const { container } = render(
      <CommandRegistryProvider>
        <Registrar />
        <input data-testid="input" type="text" />
      </CommandRegistryProvider>,
    );

    const input = container.querySelector('input')!;
    act(() => {
      fireEvent.keyDown(input, { key: 'n', ctrlKey: true });
    });

    expect(action).not.toHaveBeenCalled();
  });

  it('respects when() condition for shortcuts', () => {
    const action = vi.fn();
    let enabled = false;

    function Registrar() {
      useRegisterCommands([
        { id: 'cond', label: 'Conditional', shortcut: 'ctrl+d', action, when: () => enabled },
      ]);
      return null;
    }

    render(
      <CommandRegistryProvider>
        <Registrar />
      </CommandRegistryProvider>,
    );

    // Should not fire when condition is false
    act(() => {
      fireEvent.keyDown(document, { key: 'd', ctrlKey: true });
    });
    expect(action).not.toHaveBeenCalled();

    // Enable the condition
    enabled = true;
    act(() => {
      fireEvent.keyDown(document, { key: 'd', ctrlKey: true });
    });
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('cleans up shortcut listener on unmount', () => {
    const action = vi.fn();

    function Registrar() {
      useRegisterCommands([
        { id: 'temp', label: 'Temp', shortcut: 'ctrl+t', action },
      ]);
      return null;
    }

    const { unmount } = render(
      <CommandRegistryProvider>
        <Registrar />
      </CommandRegistryProvider>,
    );

    unmount();

    act(() => {
      fireEvent.keyDown(document, { key: 't', ctrlKey: true });
    });

    expect(action).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Multiple registrars
// ---------------------------------------------------------------------------

describe('Multiple registrars', () => {
  it('supports commands from multiple components', () => {
    let commandsResult: ReturnType<typeof useCommands> | null = null;

    function Registrar1() {
      useRegisterCommands([
        makeCommand({ id: 'from-1', label: 'From One' }),
      ]);
      return null;
    }

    function Registrar2() {
      useRegisterCommands([
        makeCommand({ id: 'from-2', label: 'From Two' }),
      ]);
      return null;
    }

    function Reader() {
      commandsResult = useCommands();
      return null;
    }

    render(
      <CommandRegistryProvider>
        <Registrar1 />
        <Registrar2 />
        <Reader />
      </CommandRegistryProvider>,
    );

    expect(commandsResult!.commands.length).toBe(2);
    const ids = commandsResult!.commands.map((c) => c.id).sort();
    expect(ids).toEqual(['from-1', 'from-2']);
  });

  it('removes only the unmounted component commands', () => {
    let commandsResult: ReturnType<typeof useCommands> | null = null;

    function Registrar1() {
      useRegisterCommands([
        makeCommand({ id: 'persistent', label: 'Persistent' }),
      ]);
      return null;
    }

    function Registrar2() {
      useRegisterCommands([
        makeCommand({ id: 'temporary', label: 'Temporary' }),
      ]);
      return null;
    }

    function Reader() {
      commandsResult = useCommands();
      return null;
    }

    const { rerender } = render(
      <CommandRegistryProvider>
        <Registrar1 />
        <Registrar2 />
        <Reader />
      </CommandRegistryProvider>,
    );

    expect(commandsResult!.commands.length).toBe(2);

    // Remove Registrar2
    rerender(
      <CommandRegistryProvider>
        <Registrar1 />
        <Reader />
      </CommandRegistryProvider>,
    );

    expect(commandsResult!.commands.length).toBe(1);
    expect(commandsResult!.commands[0].id).toBe('persistent');
  });
});

// ---------------------------------------------------------------------------
// Category grouping
// ---------------------------------------------------------------------------

describe('Category support', () => {
  it('preserves category information on commands', () => {
    let commandsResult: ReturnType<typeof useCommands> | null = null;

    function Registrar() {
      useRegisterCommands([
        makeCommand({ id: 'nav-1', label: 'Go Home', category: 'Navigation' }),
        makeCommand({ id: 'act-1', label: 'Save', category: 'Actions' }),
        makeCommand({ id: 'nav-2', label: 'Go Settings', category: 'Navigation' }),
      ]);
      return null;
    }

    function Reader() {
      commandsResult = useCommands();
      return null;
    }

    render(
      <CommandRegistryProvider>
        <Registrar />
        <Reader />
      </CommandRegistryProvider>,
    );

    const navCommands = commandsResult!.commands.filter((c) => c.category === 'Navigation');
    const actCommands = commandsResult!.commands.filter((c) => c.category === 'Actions');

    expect(navCommands.length).toBe(2);
    expect(actCommands.length).toBe(1);
  });
});
