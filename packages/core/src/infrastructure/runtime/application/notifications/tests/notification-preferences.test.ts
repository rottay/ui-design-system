/**
 * useNotificationPreferences Hook Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotificationPreferences } from '../index';
import type { NotificationChannel, NotificationCategory } from '../index';

// ============================================================================
// Test Fixtures
// ============================================================================

function createChannels(): NotificationChannel[] {
  return [
    { id: 'email', label: 'Email', description: 'Email notifications' },
    { id: 'push', label: 'Push', description: 'Push notifications' },
    { id: 'sms', label: 'SMS', description: 'SMS notifications' },
  ];
}

function createCategories(): NotificationCategory[] {
  return [
    {
      id: 'marketing',
      label: 'Marketing',
      description: 'Promotional content',
      channels: [
        { channelId: 'email', enabled: true },
        { channelId: 'push', enabled: false },
        { channelId: 'sms', enabled: false },
      ],
    },
    {
      id: 'security',
      label: 'Security Alerts',
      channels: [
        { channelId: 'email', enabled: true },
        { channelId: 'push', enabled: true },
        { channelId: 'sms', enabled: true },
      ],
    },
    {
      id: 'updates',
      label: 'Product Updates',
      channels: [
        { channelId: 'email', enabled: false },
        { channelId: 'push', enabled: false },
        { channelId: 'sms', enabled: false },
      ],
    },
  ];
}

function renderPreferences(overrides?: Partial<Parameters<typeof useNotificationPreferences>[0]>) {
  const channels = createChannels();
  const categories = createCategories();
  return renderHook(() =>
    useNotificationPreferences({
      channels,
      categories,
      ...overrides,
    })
  );
}

// ============================================================================
// Tests
// ============================================================================

describe('useNotificationPreferences', () => {
  describe('Initial State', () => {
    it('returns the provided channels and categories', () => {
      const { result } = renderPreferences();

      expect(result.current.channels).toHaveLength(3);
      expect(result.current.categories).toHaveLength(3);
      expect(result.current.channels[0].id).toBe('email');
      expect(result.current.categories[0].id).toBe('marketing');
    });

    it('starts as not dirty', () => {
      const { result } = renderPreferences();
      expect(result.current.isDirty).toBe(false);
    });

    it('starts as not saving', () => {
      const { result } = renderPreferences();
      expect(result.current.isSaving).toBe(false);
    });

    it('preserves initial channel enabled states', () => {
      const { result } = renderPreferences();

      const marketing = result.current.categories.find((c) => c.id === 'marketing')!;
      expect(marketing.channels.find((ch) => ch.channelId === 'email')!.enabled).toBe(true);
      expect(marketing.channels.find((ch) => ch.channelId === 'push')!.enabled).toBe(false);
      expect(marketing.channels.find((ch) => ch.channelId === 'sms')!.enabled).toBe(false);
    });

    it('does not mutate the original categories', () => {
      const categories = createCategories();
      const originalEnabled = categories[0].channels[1].enabled; // marketing.push = false

      const { result } = renderPreferences({ categories });

      act(() => {
        result.current.toggle('marketing', 'push');
      });

      // Original should be untouched
      expect(categories[0].channels[1].enabled).toBe(originalEnabled);
    });
  });

  describe('toggle', () => {
    it('toggles a single channel for a category', () => {
      const { result } = renderPreferences();

      // marketing.push starts false
      act(() => {
        result.current.toggle('marketing', 'push');
      });

      const marketing = result.current.categories.find((c) => c.id === 'marketing')!;
      expect(marketing.channels.find((ch) => ch.channelId === 'push')!.enabled).toBe(true);
    });

    it('toggles from enabled to disabled', () => {
      const { result } = renderPreferences();

      // security.email starts true
      act(() => {
        result.current.toggle('security', 'email');
      });

      const security = result.current.categories.find((c) => c.id === 'security')!;
      expect(security.channels.find((ch) => ch.channelId === 'email')!.enabled).toBe(false);
    });

    it('does not affect other categories', () => {
      const { result } = renderPreferences();

      act(() => {
        result.current.toggle('marketing', 'push');
      });

      // security should remain unchanged
      const security = result.current.categories.find((c) => c.id === 'security')!;
      expect(security.channels.find((ch) => ch.channelId === 'push')!.enabled).toBe(true);
    });

    it('does not affect other channels in the same category', () => {
      const { result } = renderPreferences();

      act(() => {
        result.current.toggle('marketing', 'push');
      });

      const marketing = result.current.categories.find((c) => c.id === 'marketing')!;
      expect(marketing.channels.find((ch) => ch.channelId === 'email')!.enabled).toBe(true);
      expect(marketing.channels.find((ch) => ch.channelId === 'sms')!.enabled).toBe(false);
    });

    it('marks state as dirty after toggle', () => {
      const { result } = renderPreferences();

      expect(result.current.isDirty).toBe(false);

      act(() => {
        result.current.toggle('marketing', 'push');
      });

      expect(result.current.isDirty).toBe(true);
    });

    it('calls onChange callback with correct arguments', () => {
      const onChange = vi.fn();
      const { result } = renderPreferences({ onChange });

      act(() => {
        result.current.toggle('marketing', 'push');
      });

      expect(onChange).toHaveBeenCalledWith('marketing', 'push', true);
    });

    it('calls onChange with false when toggling off', () => {
      const onChange = vi.fn();
      const { result } = renderPreferences({ onChange });

      act(() => {
        result.current.toggle('security', 'email');
      });

      expect(onChange).toHaveBeenCalledWith('security', 'email', false);
    });

    it('is no-op for nonexistent category', () => {
      const { result } = renderPreferences();
      const before = JSON.stringify(result.current.categories);

      act(() => {
        result.current.toggle('nonexistent', 'email');
      });

      expect(JSON.stringify(result.current.categories)).toBe(before);
    });

    it('is no-op for nonexistent channel in existing category', () => {
      const { result } = renderPreferences();
      const before = JSON.stringify(result.current.categories);

      act(() => {
        result.current.toggle('marketing', 'nonexistent');
      });

      expect(JSON.stringify(result.current.categories)).toBe(before);
    });
  });

  describe('toggleAll', () => {
    it('enables all channels for a category', () => {
      const { result } = renderPreferences();

      // updates starts all false
      act(() => {
        result.current.toggleAll('updates', true);
      });

      const updates = result.current.categories.find((c) => c.id === 'updates')!;
      expect(updates.channels.every((ch) => ch.enabled)).toBe(true);
    });

    it('disables all channels for a category', () => {
      const { result } = renderPreferences();

      // security starts all true
      act(() => {
        result.current.toggleAll('security', false);
      });

      const security = result.current.categories.find((c) => c.id === 'security')!;
      expect(security.channels.every((ch) => !ch.enabled)).toBe(true);
    });

    it('does not affect other categories', () => {
      const { result } = renderPreferences();

      act(() => {
        result.current.toggleAll('updates', true);
      });

      // marketing should remain unchanged (email=true, push=false, sms=false)
      const marketing = result.current.categories.find((c) => c.id === 'marketing')!;
      expect(marketing.channels.find((ch) => ch.channelId === 'email')!.enabled).toBe(true);
      expect(marketing.channels.find((ch) => ch.channelId === 'push')!.enabled).toBe(false);
    });

    it('calls onChange for each channel that actually changes', () => {
      const onChange = vi.fn();
      const { result } = renderPreferences({ onChange });

      // marketing: email=true, push=false, sms=false
      // Enabling all should only fire onChange for push and sms
      act(() => {
        result.current.toggleAll('marketing', true);
      });

      expect(onChange).toHaveBeenCalledWith('marketing', 'push', true);
      expect(onChange).toHaveBeenCalledWith('marketing', 'sms', true);
      // email was already true, should not fire for it
      expect(onChange).not.toHaveBeenCalledWith('marketing', 'email', true);
    });

    it('marks as dirty after toggleAll', () => {
      const { result } = renderPreferences();

      act(() => {
        result.current.toggleAll('updates', true);
      });

      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('toggleChannel', () => {
    it('enables a channel across all categories', () => {
      const { result } = renderPreferences();

      // sms starts: marketing=false, security=true, updates=false
      act(() => {
        result.current.toggleChannel('sms', true);
      });

      result.current.categories.forEach((cat) => {
        const sms = cat.channels.find((ch) => ch.channelId === 'sms')!;
        expect(sms.enabled).toBe(true);
      });
    });

    it('disables a channel across all categories', () => {
      const { result } = renderPreferences();

      // email starts: marketing=true, security=true, updates=false
      act(() => {
        result.current.toggleChannel('email', false);
      });

      result.current.categories.forEach((cat) => {
        const email = cat.channels.find((ch) => ch.channelId === 'email')!;
        expect(email.enabled).toBe(false);
      });
    });

    it('does not affect other channels', () => {
      const { result } = renderPreferences();

      act(() => {
        result.current.toggleChannel('sms', true);
      });

      // push should be unchanged: marketing=false, security=true, updates=false
      const marketing = result.current.categories.find((c) => c.id === 'marketing')!;
      expect(marketing.channels.find((ch) => ch.channelId === 'push')!.enabled).toBe(false);

      const security = result.current.categories.find((c) => c.id === 'security')!;
      expect(security.channels.find((ch) => ch.channelId === 'push')!.enabled).toBe(true);
    });

    it('calls onChange for each category where the channel actually changes', () => {
      const onChange = vi.fn();
      const { result } = renderPreferences({ onChange });

      // sms: marketing=false, security=true, updates=false
      // Enabling sms should fire for marketing and updates, not security
      act(() => {
        result.current.toggleChannel('sms', true);
      });

      expect(onChange).toHaveBeenCalledWith('marketing', 'sms', true);
      expect(onChange).toHaveBeenCalledWith('updates', 'sms', true);
      expect(onChange).not.toHaveBeenCalledWith('security', 'sms', true);
    });

    it('marks as dirty after toggleChannel', () => {
      const { result } = renderPreferences();

      act(() => {
        result.current.toggleChannel('sms', true);
      });

      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('isDirty', () => {
    it('is false when no changes made', () => {
      const { result } = renderPreferences();
      expect(result.current.isDirty).toBe(false);
    });

    it('is true after a toggle', () => {
      const { result } = renderPreferences();

      act(() => {
        result.current.toggle('marketing', 'push');
      });

      expect(result.current.isDirty).toBe(true);
    });

    it('returns to false when toggled back to initial state', () => {
      const { result } = renderPreferences();

      act(() => {
        result.current.toggle('marketing', 'push');
      });
      expect(result.current.isDirty).toBe(true);

      act(() => {
        result.current.toggle('marketing', 'push');
      });
      expect(result.current.isDirty).toBe(false);
    });

    it('is false after reset', () => {
      const { result } = renderPreferences();

      act(() => {
        result.current.toggle('marketing', 'push');
        result.current.toggleAll('security', false);
      });
      expect(result.current.isDirty).toBe(true);

      act(() => {
        result.current.reset();
      });
      expect(result.current.isDirty).toBe(false);
    });
  });

  describe('save', () => {
    it('calls onSave with current preferences', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderPreferences({ onSave });

      act(() => {
        result.current.toggle('marketing', 'push');
      });

      await act(async () => {
        await result.current.save();
      });

      expect(onSave).toHaveBeenCalledTimes(1);
      const savedCategories = onSave.mock.calls[0][0];
      const marketing = savedCategories.find((c: NotificationCategory) => c.id === 'marketing')!;
      expect(marketing.channels.find((ch: { channelId: string }) => ch.channelId === 'push')!.enabled).toBe(true);
    });

    it('sets isSaving during save', async () => {
      let resolveSave: () => void;
      const onSave = vi.fn().mockImplementation(
        () => new Promise<void>((resolve) => { resolveSave = resolve; })
      );
      const { result } = renderPreferences({ onSave });

      expect(result.current.isSaving).toBe(false);

      let savePromise: Promise<void>;
      act(() => {
        savePromise = result.current.save();
      });

      expect(result.current.isSaving).toBe(true);

      await act(async () => {
        resolveSave!();
        await savePromise!;
      });

      expect(result.current.isSaving).toBe(false);
    });

    it('sets isSaving to false even when save fails', async () => {
      const onSave = vi.fn().mockRejectedValue(new Error('Network error'));
      const { result } = renderPreferences({ onSave });

      await act(async () => {
        try {
          await result.current.save();
        } catch {
          // Expected
        }
      });

      expect(result.current.isSaving).toBe(false);
    });

    it('is a no-op when onSave is not provided', async () => {
      const { result } = renderPreferences({ onSave: undefined });

      // Should not throw
      await act(async () => {
        await result.current.save();
      });

      expect(result.current.isSaving).toBe(false);
    });
  });

  describe('reset', () => {
    it('restores categories to initial state', () => {
      const { result } = renderPreferences();

      act(() => {
        result.current.toggle('marketing', 'push');
        result.current.toggle('marketing', 'sms');
        result.current.toggleAll('security', false);
        result.current.toggleChannel('email', false);
      });

      act(() => {
        result.current.reset();
      });

      // Verify marketing channel state matches initial
      const marketing = result.current.categories.find((c) => c.id === 'marketing')!;
      expect(marketing.channels.find((ch) => ch.channelId === 'email')!.enabled).toBe(true);
      expect(marketing.channels.find((ch) => ch.channelId === 'push')!.enabled).toBe(false);
      expect(marketing.channels.find((ch) => ch.channelId === 'sms')!.enabled).toBe(false);

      // Verify security channel state matches initial
      const security = result.current.categories.find((c) => c.id === 'security')!;
      expect(security.channels.every((ch) => ch.enabled)).toBe(true);

      // Verify updates channel state matches initial
      const updates = result.current.categories.find((c) => c.id === 'updates')!;
      expect(updates.channels.every((ch) => !ch.enabled)).toBe(true);
    });

    it('clears isDirty', () => {
      const { result } = renderPreferences();

      act(() => {
        result.current.toggleAll('updates', true);
      });
      expect(result.current.isDirty).toBe(true);

      act(() => {
        result.current.reset();
      });
      expect(result.current.isDirty).toBe(false);
    });
  });

  describe('notificationSurfaceProps', () => {
    it('produces flat preference list with composite IDs', () => {
      const { result } = renderPreferences();

      const prefs = result.current.notificationSurfaceProps.preferences;
      // 3 categories x 3 channels = 9
      expect(prefs).toHaveLength(9);

      // Check a specific preference
      const marketingEmail = prefs.find(
        (p) => p.categoryId === 'marketing' && p.channelId === 'email'
      )!;
      expect(marketingEmail.id).toBe('marketing::email');
      expect(marketingEmail.enabled).toBe(true);
    });

    it('onPreferenceChange toggles the correct preference', () => {
      const onChange = vi.fn();
      const { result } = renderPreferences({ onChange });

      act(() => {
        result.current.notificationSurfaceProps.onPreferenceChange(
          'marketing::push',
          true
        );
      });

      const marketing = result.current.categories.find((c) => c.id === 'marketing')!;
      expect(marketing.channels.find((ch) => ch.channelId === 'push')!.enabled).toBe(true);
      expect(onChange).toHaveBeenCalledWith('marketing', 'push', true);
    });

    it('onPreferenceChange reflects in isDirty', () => {
      const { result } = renderPreferences();

      act(() => {
        result.current.notificationSurfaceProps.onPreferenceChange(
          'updates::email',
          true
        );
      });

      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('Complex Workflows', () => {
    it('toggle, toggleAll, toggleChannel in sequence produces correct state', () => {
      const { result } = renderPreferences();

      // 1. Enable push for marketing
      act(() => {
        result.current.toggle('marketing', 'push');
      });

      // 2. Disable all for security
      act(() => {
        result.current.toggleAll('security', false);
      });

      // 3. Enable sms across all categories
      act(() => {
        result.current.toggleChannel('sms', true);
      });

      // Verify marketing: email=true (original), push=true (step 1), sms=true (step 3)
      const marketing = result.current.categories.find((c) => c.id === 'marketing')!;
      expect(marketing.channels.map((ch) => [ch.channelId, ch.enabled])).toEqual([
        ['email', true],
        ['push', true],
        ['sms', true],
      ]);

      // Verify security: email=false (step 2), push=false (step 2), sms=true (step 3 overrides step 2)
      const security = result.current.categories.find((c) => c.id === 'security')!;
      expect(security.channels.map((ch) => [ch.channelId, ch.enabled])).toEqual([
        ['email', false],
        ['push', false],
        ['sms', true],
      ]);

      // Verify updates: email=false (original), push=false (original), sms=true (step 3)
      const updates = result.current.categories.find((c) => c.id === 'updates')!;
      expect(updates.channels.map((ch) => [ch.channelId, ch.enabled])).toEqual([
        ['email', false],
        ['push', false],
        ['sms', true],
      ]);
    });

    it('reset after complex changes restores initial state', () => {
      const { result } = renderPreferences();

      act(() => {
        result.current.toggleAll('marketing', true);
        result.current.toggleChannel('email', false);
        result.current.toggle('updates', 'push');
      });

      act(() => {
        result.current.reset();
      });

      // All should match initial
      const marketing = result.current.categories.find((c) => c.id === 'marketing')!;
      expect(marketing.channels.find((ch) => ch.channelId === 'email')!.enabled).toBe(true);
      expect(marketing.channels.find((ch) => ch.channelId === 'push')!.enabled).toBe(false);

      const security = result.current.categories.find((c) => c.id === 'security')!;
      expect(security.channels.every((ch) => ch.enabled)).toBe(true);

      expect(result.current.isDirty).toBe(false);
    });

    it('save passes all accumulated changes', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderPreferences({ onSave });

      act(() => {
        result.current.toggleAll('updates', true);
        result.current.toggle('marketing', 'sms');
      });

      await act(async () => {
        await result.current.save();
      });

      const saved = onSave.mock.calls[0][0] as NotificationCategory[];

      const updates = saved.find((c) => c.id === 'updates')!;
      expect(updates.channels.every((ch) => ch.enabled)).toBe(true);

      const marketing = saved.find((c) => c.id === 'marketing')!;
      expect(marketing.channels.find((ch) => ch.channelId === 'sms')!.enabled).toBe(true);
    });

    it('works with empty categories', () => {
      const { result } = renderHook(() =>
        useNotificationPreferences({
          channels: createChannels(),
          categories: [],
        })
      );

      expect(result.current.categories).toHaveLength(0);
      expect(result.current.isDirty).toBe(false);
      expect(result.current.notificationSurfaceProps.preferences).toHaveLength(0);
    });

    it('works with empty channels in a category', () => {
      const { result } = renderHook(() =>
        useNotificationPreferences({
          channels: createChannels(),
          categories: [{ id: 'empty', label: 'Empty', channels: [] }],
        })
      );

      expect(result.current.categories).toHaveLength(1);
      expect(result.current.categories[0].channels).toHaveLength(0);

      // toggleAll on empty channels is a no-op
      act(() => {
        result.current.toggleAll('empty', true);
      });

      expect(result.current.categories[0].channels).toHaveLength(0);
    });
  });
});
