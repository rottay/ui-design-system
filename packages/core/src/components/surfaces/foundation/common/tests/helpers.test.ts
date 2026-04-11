/**
 * @fileoverview Tests for surface helpers: permission resolution, column/action
 * filtering, variant mapping, and value normalization.
 */

import { describe, expect, it, vi } from 'vitest';
import {
  countActiveFilters,
  filterDetailSurfaceTabs,
  filterSurfaceActions,
  filterSurfaceColumns,
  filterSurfaceFields,
  filterSurfaceTabbedViews,
  normalizeSurfaceError,
  resolveColumnValue,
  resolveSurfaceAction,
  resolveSurfaceButtonVariant,
  resolveSurfaceDetailActionVariant,
  stringifySurfaceValue,
} from '../../../helpers';
import {
  normalizeSurfaceDensity,
  resolveListCardMinWidth,
  resolveSurfaceTabsType,
} from '../../../profile-defaults';

describe('normalizeSurfaceError', () => {
  it('extracts message and stack from Error instances', () => {
    const error = new Error('Surface exploded');
    const normalized = normalizeSurfaceError(error);

    expect(normalized.message).toBe('Surface exploded');
    expect(normalized.description).toContain('Error: Surface exploded');
  });

  it('uses plain strings as the message', () => {
    const normalized = normalizeSurfaceError('Request failed');

    expect(normalized).toEqual({
      message: 'Request failed',
    });
  });

  it('falls back when no recognizable message exists', () => {
    const normalized = normalizeSurfaceError({ code: 500 });

    expect(normalized.message).toBe(
      'Something went wrong while rendering this surface.'
    );
  });

  it('filters single actions through the same permission rules as action bars', () => {
    const action = {
      id: 'delete-record',
      label: 'Delete record',
      variant: 'danger' as const,
      onClick: vi.fn(),
    };

    expect(
      resolveSurfaceAction(action, {
        granted: [],
        actions: {
          'delete-record': {
            permission: 'records:delete',
          },
        },
      })
    ).toBeUndefined();

    expect(
      resolveSurfaceAction(action, {
        granted: ['records:delete'],
        actions: {
          'delete-record': {
            permission: 'records:delete',
          },
        },
      })
    ).toEqual(action);
  });

  it('filters columns, actions, fields, and tabs through visibility and permission rules', () => {
    const permissions = {
      granted: ['records:view', 'records:edit', 'records:tab'],
      fields: {
        name: { permission: 'records:view' },
        cost: { permission: 'records:finance' },
      },
      actions: {
        edit: { permission: 'records:edit' },
        archive: { permission: 'records:archive' },
      },
      tabs: {
        insights: { permission: 'records:tab' },
        audits: { permission: 'records:audit' },
      },
    };

    expect(
      filterSurfaceColumns(
        [
          { key: 'name', fieldId: 'name', title: 'Name' },
          { key: 'cost', fieldId: 'cost', title: 'Cost' },
        ],
        permissions
      )
    ).toEqual([{ key: 'name', fieldId: 'name', title: 'Name' }]);

    expect(
      filterSurfaceActions(
        [
          { id: 'edit', label: 'Edit', onClick: vi.fn() },
          { id: 'archive', label: 'Archive', onClick: vi.fn() },
          { id: 'hidden', label: 'Hidden', onClick: vi.fn(), visible: () => false },
        ],
        permissions,
        { id: 1 }
      ).map((action) => action.id)
    ).toEqual(['edit']);

    expect(
      filterSurfaceFields(
        [
          { name: 'name', fieldId: 'name', label: 'Name' },
          { name: 'custom', label: 'Custom' },
        ],
        permissions
      ).map((field) => field.name)
    ).toEqual(['name', 'custom']);

    expect(
      filterSurfaceTabbedViews(
        [
          { key: 'insights', label: 'Insights', badge: '2' },
          { key: 'audits', label: 'Audits' },
          { key: 'hidden', label: 'Hidden', visible: () => false },
        ],
        permissions
      ).map((view) => view.key)
    ).toEqual(['insights']);

    expect(
      filterDetailSurfaceTabs(
        [
          { key: 'insights', label: 'Insights', render: () => null },
          { key: 'audits', label: 'Audits', render: () => null },
          { key: 'conditional', label: 'Conditional', visible: (item) => item.enabled, render: () => null },
        ],
        permissions,
        { enabled: true }
      ).map((tab) => tab.key)
    ).toEqual(['insights', 'conditional']);
  });

  it('supports callback-based permission resolution', () => {
    expect(
      filterSurfaceActions(
        [{ id: 'edit', label: 'Edit', onClick: vi.fn() }],
        {
          isAllowed: ({ id }) => id === 'edit',
          actions: { edit: { permission: 'records:edit' } },
        }
      )
    ).toHaveLength(1);
  });

  it('normalizes surface action variants and utility helpers', () => {
    expect(resolveSurfaceButtonVariant('primary')).toBe('primary');
    expect(resolveSurfaceButtonVariant('outline' as never)).toBe('secondary');
    expect(resolveSurfaceDetailActionVariant('secondary')).toBe('default');
    expect(resolveSurfaceDetailActionVariant('danger')).toBe('danger');

    expect(
      countActiveFilters({
        query: 'launch',
        tags: ['vip'],
        enabled: true,
        archived: false,
        empty: '',
      })
    ).toBe(3);

    expect(
      resolveColumnValue(
        { key: 'status', accessorKey: 'status' },
        { status: 'live', nested: { count: 2 }, amount: 12 }
      )
    ).toBe('live');
    expect(
      resolveColumnValue(
        { key: 'amount', accessorFn: (item: { amount: number }) => item.amount * 2 },
        { amount: 12 }
      )
    ).toBe(24);
    expect(
      resolveColumnValue(
        { key: 'count' },
        { count: 5 }
      )
    ).toBe(5);

    expect(stringifySurfaceValue(true)).toBe('true');
    expect(stringifySurfaceValue(new Date('2026-03-14T00:00:00Z'))).toBe('2026-03-14T00:00:00.000Z');
    expect(stringifySurfaceValue({ count: 2 })).toBe('{"count":2}');
    expect(stringifySurfaceValue(undefined)).toBe('-');
  });
});

describe('surface profile defaults', () => {
  it('normalizes token density into the shared surface vocabulary', () => {
    expect(normalizeSurfaceDensity('normal')).toBe('comfortable');
    expect(normalizeSurfaceDensity('compact')).toBe('compact');
    expect(normalizeSurfaceDensity('spacious')).toBe('spacious');
  });

  it('uses card tabs only for spacious products', () => {
    expect(resolveSurfaceTabsType('compact')).toBe('line');
    expect(resolveSurfaceTabsType('comfortable')).toBe('line');
    expect(resolveSurfaceTabsType('spacious')).toBe('card');
  });

  it('derives list card width from density', () => {
    expect(resolveListCardMinWidth('compact')).toBe(240);
    expect(resolveListCardMinWidth('comfortable')).toBe(280);
    expect(resolveListCardMinWidth('spacious')).toBe(320);
  });
});
