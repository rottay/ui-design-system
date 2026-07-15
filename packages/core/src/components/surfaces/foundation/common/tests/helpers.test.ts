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
  filterSurfaceRowActions,
  filterSurfaceTabbedViews,
  normalizeSurfaceError,
  resolveColumnValue,
  resolveFieldAccessForRow,
  resolveSurfaceAction,
  resolveSurfaceButtonVariant,
  resolveSurfaceDetailActionVariant,
  resolveSurfacePermission,
  stringifySurfaceValue,
} from '../../helpers';
import {
  normalizeSurfaceDensity,
  resolveListCardMinWidth,
  resolveSurfaceTabsType,
} from '../../profile-defaults';

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

  it('short-circuits every presentation filter for app-resolved all access', () => {
    const forbidden = vi.fn(() => {
      throw new Error('all access must not evaluate presentation policy');
    });
    const access = Object.defineProperties(
      { mode: 'all' as const },
      {
        capabilities: { get: forbidden },
        isAllowed: { get: forbidden },
        isRowAllowed: { get: forbidden },
        resolveFieldAccess: { get: forbidden },
      }
    );
    const action = Object.defineProperty(
      { id: 'delete', label: 'Delete' },
      'visible',
      { get: forbidden }
    );
    const column = Object.defineProperty(
      { key: 'secret', title: 'Secret' },
      'fieldId',
      { get: forbidden }
    );
    const field = Object.defineProperty(
      { name: 'secret', label: 'Secret' },
      'fieldId',
      { get: forbidden }
    );
    const tab = Object.defineProperty(
      { key: 'audit', label: 'Audit', render: () => null },
      'visible',
      { get: forbidden }
    );

    expect(filterSurfaceColumns([column as never], access)).toEqual([column]);
    expect(filterSurfaceActions([action], access)).toEqual([action]);
    expect(filterSurfaceRowActions([action], access, { id: 1 }, 0)).toEqual([action]);
    expect(filterSurfaceFields([field as never], access)).toEqual([field]);
    expect(filterSurfaceTabbedViews([tab], access)).toEqual([tab]);
    expect(filterDetailSurfaceTabs([tab], access, { id: 1 })).toEqual([tab]);
    expect(resolveSurfaceAction(action, access)).toBe(action);
    expect(resolveFieldAccessForRow('secret', access, { id: 1 }, 0)).toBe('visible');
    expect(resolveSurfacePermission(access, { kind: 'route', id: '/admin' })).toBe(true);
    expect(forbidden).not.toHaveBeenCalled();
  });

  it('uses only the app-resolved capability inventory in resolved mode', () => {
    const access = {
      mode: 'resolved' as const,
      capabilities: [
        { kind: 'column' as const, id: 'name', visible: true },
        { kind: 'column' as const, id: 'cost', visible: false },
        { kind: 'field' as const, id: 'salary', visible: true, disabled: true },
        { kind: 'action' as const, id: 'edit', visible: true, disabled: true },
        { kind: 'action' as const, id: 'archive', visible: false },
        { kind: 'tab' as const, id: 'audit', visible: true, disabled: true },
        { kind: 'route' as const, id: '/admin', visible: true },
      ],
    };
    const edit = { id: 'edit', label: 'Edit' };

    expect(
      filterSurfaceColumns(
        [
          { key: 'name', fieldId: 'name', title: 'Name' },
          { key: 'cost', fieldId: 'cost', title: 'Cost' },
        ],
        access
      ).map((column) => column.fieldId)
    ).toEqual(['name']);
    expect(
      filterSurfaceActions(
        [edit, { id: 'archive', label: 'Archive' }, { id: 'missing', label: 'Missing' }],
        access
      )
    ).toEqual([{ ...edit, disabled: true }]);
    expect(resolveFieldAccessForRow('salary', access, { id: 1 }, 0)).toBe('readonly');
    expect(resolveFieldAccessForRow('missing', access, { id: 1 }, 0)).toBe('hidden');
    expect(filterSurfaceTabbedViews([{ key: 'audit', label: 'Audit' }], access)).toEqual([
      { key: 'audit', label: 'Audit', disabled: true },
    ]);
    expect(resolveSurfacePermission(access, { kind: 'route', id: '/admin' })).toBe(true);
    expect(resolveSurfacePermission(access, { kind: 'route', id: '/missing' })).toBe(false);
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

  it('passes runtime context to permission callbacks and honors action allowlists', () => {
    const runtimeContext = {
      tenantSlug: 'bithire',
      userId: 'user-1',
      role: 'recruiter',
    };
    const isAllowed = vi.fn(({ permission, context }) => {
      return context?.tenantSlug === 'bithire' && permission === 'records:edit';
    });

    const permissions = {
      runtimeContext,
      allowedActions: ['edit'],
      actions: {
        edit: { permission: 'records:edit' },
        delete: { permission: 'records:delete' },
      },
      isAllowed,
    };

    expect(
      filterSurfaceActions(
        [
          { id: 'edit', label: 'Edit' },
          { id: 'delete', label: 'Delete' },
          { id: 'export', label: 'Export' },
        ],
        permissions
      ).map((action) => action.id)
    ).toEqual(['edit']);

    expect(isAllowed).toHaveBeenCalledWith({
      kind: 'action',
      id: 'edit',
      permission: 'records:edit',
      context: runtimeContext,
    });
    expect(resolveSurfacePermission(permissions, { kind: 'action', id: 'export' })).toBe(false);
  });

  it('passes runtime context to row actions and field access resolvers', () => {
    const runtimeContext = { userId: 'owner-1' };
    const row = { id: 'record-1', ownerId: 'owner-1', locked: false };
    const permissions = {
      runtimeContext,
      isRowAllowed: vi.fn(({ id, row: item, context }) => {
        return id === 'edit' && item.ownerId === context?.userId;
      }),
      resolveFieldAccess: vi.fn(({ fieldId, row: item, context }) => {
        if (fieldId === 'salary' && item.ownerId !== context?.userId) return 'hidden';
        return 'readonly';
      }),
    };

    expect(
      filterSurfaceRowActions(
        [
          { id: 'edit', label: 'Edit' },
          { id: 'archive', label: 'Archive' },
        ],
        permissions,
        row,
        0
      ).map((action) => action.id)
    ).toEqual(['edit']);

    expect(resolveFieldAccessForRow('salary', permissions, row, 0)).toBe('readonly');
    expect(permissions.isRowAllowed).toHaveBeenCalledWith(
      expect.objectContaining({ context: runtimeContext })
    );
    expect(permissions.resolveFieldAccess).toHaveBeenCalledWith(
      expect.objectContaining({ context: runtimeContext })
    );
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
    expect(
      resolveColumnValue(
        { key: 'count' },
        (() => 5) as unknown as { count: number }
      )
    ).toBeUndefined();
    const prototype = Object.defineProperty({}, 'inherited', {
      get(this: { value: string }) {
        return this.value;
      },
    });
    const rowWithPrototype = Object.assign(Object.create(prototype), { value: 'same-reference' }) as {
      value: string;
      inherited: string;
    };
    expect(resolveColumnValue({ key: 'inherited' }, rowWithPrototype)).toBe('same-reference');

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
