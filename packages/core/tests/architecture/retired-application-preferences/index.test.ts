import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement, type ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as publicSurface from '@rottay/design-system';
import * as hookFacade from '@/infrastructure/runtime/facade';
import { useLayoutPreference } from '@/infrastructure/runtime/application/state/layout-preference';
import {
  CommandRegistryProvider,
  useRegisterCommands,
} from '@/infrastructure/runtime/application/commands/runtime/registry';
import { useCommandPaletteItems } from '@/components/patterns/navigation/command-palette/runtime/application-commands';

const PACKAGE_ROOT = resolve(__dirname, '../../..');
const RETIRED_BINDINGS = [
  'useRouterState',
  'UseRouterStateOptions',
  'UseRouterStateReturn',
  'useNotificationPreferences',
  'NotificationChannel',
  'NotificationCategory',
  'UseNotificationPreferencesOptions',
  'UseNotificationPreferencesReturn',
] as const;
const RETIRED_OWNERS = [
  'src/infrastructure/runtime/application/navigation/routing/index.ts',
  'src/infrastructure/runtime/application/notifications/index.ts',
] as const;
const USAGE_KEY = 'ret01-preserved-palette';
const STORAGE_KEY = `ds-layout-${USAGE_KEY}`;

afterEach(() => {
  window.localStorage.removeItem(STORAGE_KEY);
});

describe('the two unadopted application preference hooks are retired', () => {
  it.each(RETIRED_OWNERS)('has no implementation owner at %s', (owner) => {
    expect(existsSync(resolve(PACKAGE_ROOT, owner))).toBe(false);
  });

  it.each(RETIRED_BINDINGS)('does not publish %s from root or facade', (name) => {
    expect(publicSurface).not.toHaveProperty(name);
    expect(hookFacade).not.toHaveProperty(name);
  });

  it('removes every retired binding and owner edge from the former publisher', () => {
    const facade = readFileSync(resolve(PACKAGE_ROOT, 'src/infrastructure/runtime/facade/react-hooks/index.ts'), 'utf8');
    for (const name of RETIRED_BINDINGS) expect(facade).not.toContain(name);
    expect(facade).not.toContain('../../application/navigation/routing');
    expect(facade).not.toContain('../../application/notifications');
  });

  it('keeps the same public layout hook and its real palette callback persistence', () => {
    expect(publicSurface.useLayoutPreference).toBe(useLayoutPreference);
    expect(hookFacade.useLayoutPreference).toBe(useLayoutPreference);
    window.localStorage.removeItem(STORAGE_KEY);
    const action = vi.fn();
    const commands = [{ id: 'ret01-command', label: 'Retained command', action }];
    const timestamp = 1_700_000_000_000;
    const wrapper = ({ children }: { children: ReactNode }) => createElement(CommandRegistryProvider, null, children);
    const { result, unmount } = renderHook(() => {
      useRegisterCommands(commands);
      return useCommandPaletteItems({ usageKey: USAGE_KEY, clock: () => timestamp });
    }, { wrapper });

    expect(result.current.items).toHaveLength(1);
    act(() => result.current.items[0].onSelect());
    expect(action).toHaveBeenCalledTimes(1);
    unmount();
    const stored = window.localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored as string).commandUsage['ret01-command']).toEqual({ score: 1, lastUsedAt: timestamp });
  });
});

type PublicSurface = typeof import('@rottay/design-system');
type AssertTrue<T extends true> = T;
export type _RetiredHooksAbsent = AssertTrue<
  Extract<'useRouterState' | 'useNotificationPreferences', keyof PublicSurface> extends never ? true : false
>;

// @ts-expect-error RET-01/D19 retires the exclusive URL-state options type.
export type _RetiredRouterOptions = import('@rottay/design-system').UseRouterStateOptions<Record<string, unknown>>;
// @ts-expect-error RET-01/D19 retires the exclusive URL-state return type.
export type _RetiredRouterReturn = import('@rottay/design-system').UseRouterStateReturn<Record<string, unknown>>;
// @ts-expect-error RET-01/D19 retires the exclusive preference channel type.
export type _RetiredNotificationChannel = import('@rottay/design-system').NotificationChannel;
// @ts-expect-error RET-01/D19 retires the exclusive preference category type.
export type _RetiredNotificationCategory = import('@rottay/design-system').NotificationCategory;
// @ts-expect-error RET-01/D19 retires the exclusive preference options type.
export type _RetiredNotificationOptions = import('@rottay/design-system').UseNotificationPreferencesOptions;
// @ts-expect-error RET-01/D19 retires the exclusive preference return type.
export type _RetiredNotificationReturn = import('@rottay/design-system').UseNotificationPreferencesReturn;
