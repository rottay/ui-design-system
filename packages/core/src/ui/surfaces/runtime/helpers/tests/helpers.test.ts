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
  resolveSurfaceCapabilityRegistry,
  resolveSurfaceDetailActionVariant,
  resolveSurfacePermission,
  stringifySurfaceValue,
} from '..';
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
      { key: 'secret', label: 'Secret', content: null },
      'fieldId',
      { get: forbidden }
    );
    const field = Object.defineProperty(
      { name: 'secret', label: 'Secret' },
      'fieldId',
      { get: forbidden }
    );
    const tab = Object.defineProperty(
      { key: 'audit', label: 'Audit', content: null },
      'visible',
      { get: forbidden }
    );
    const detailTab = Object.defineProperty(
      { key: 'audit', label: 'Audit', content: () => null },
      'visible',
      { get: forbidden }
    );

    expect(filterSurfaceColumns([column as never], access)).toEqual([column]);
    expect(filterSurfaceActions([action], access)).toEqual([action]);
    expect(filterSurfaceRowActions([action], access, { id: 1 }, 0)).toEqual([action]);
    expect(filterSurfaceFields([field as never], access)).toEqual([field]);
    expect(filterSurfaceTabbedViews([tab], access)).toEqual([tab]);
    expect(filterDetailSurfaceTabs([detailTab], access, { id: 1 })).toEqual([detailTab]);
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
          { key: 'name', fieldId: 'name', header: 'Name' },
          { key: 'cost', fieldId: 'cost', header: 'Cost' },
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
    expect(filterSurfaceTabbedViews([{ key: 'audit', label: 'Audit', content: null }], access)).toEqual([
      { key: 'audit', label: 'Audit', content: null, disabled: true },
    ]);
    expect(resolveSurfacePermission(access, { kind: 'route', id: '/admin' })).toBe(true);
    expect(resolveSurfacePermission(access, { kind: 'route', id: '/missing' })).toBe(false);
    expect(
      resolveSurfaceCapabilityRegistry(
        [
          { kind: 'action', id: 'edit', label: 'Edit' },
          { kind: 'action', id: 'archive', label: 'Archive' },
          { kind: 'action', id: 'missing', label: 'Missing' },
        ],
        access
      )
    ).toEqual([{ kind: 'action', id: 'edit', label: 'Edit', disabled: true }]);
  });

  it('prefers the presentation-native tab capabilityId over the legacy alias', () => {
    const access = {
      mode: 'resolved' as const,
      capabilities: [{ kind: 'tab' as const, id: 'workspace.audit', visible: true }],
    };
    const tab = {
      key: 'audit',
      label: 'Audit',
      content: null,
      capabilityId: 'workspace.audit',
      permissionId: 'legacy.audit',
    };

    expect(filterSurfaceTabbedViews([tab], access)).toEqual([tab]);
  });

  it('fails closed for missing final decisions and never evaluates app policy', () => {
    const access = {
      mode: 'resolved' as const,
      capabilities: [
        { kind: 'column' as const, id: 'name', visible: true },
        { kind: 'field' as const, id: 'name', visible: true },
        { kind: 'action' as const, id: 'edit', visible: true },
        { kind: 'tab' as const, id: 'insights', visible: true },
      ],
    };

    expect(filterSurfaceColumns([
      { key: 'name', fieldId: 'name', header: 'Name' },
      { key: 'cost', fieldId: 'cost', header: 'Cost' },
    ], access).map((column) => column.fieldId)).toEqual(['name']);
    expect(filterSurfaceActions([
      { id: 'edit', label: 'Edit' },
      { id: 'archive', label: 'Archive' },
    ], access).map((action) => action.id)).toEqual(['edit']);
    expect(filterSurfaceRowActions([
      { id: 'edit', label: 'Edit' },
      { id: 'archive', label: 'Archive' },
    ], access, { id: 'row-1' }, 0).map((action) => action.id)).toEqual(['edit']);
    expect(filterSurfaceFields([
      { name: 'name', fieldId: 'name', label: 'Name', type: 'text' as const },
      { name: 'cost', fieldId: 'cost', label: 'Cost', type: 'text' as const },
    ], access).map((field) => field.name)).toEqual(['name']);
    expect(filterSurfaceTabbedViews([
      { key: 'insights', label: 'Insights', content: null },
      { key: 'audit', label: 'Audit', content: null },
    ], access).map((tab) => tab.key)).toEqual(['insights']);
    expect(resolveSurfaceAction({ id: 'archive', label: 'Archive' }, access)).toBeUndefined();
    expect(resolveSurfacePermission(access, { kind: 'route', id: '/missing' })).toBe(false);
  });

  it('keeps domain visibility local when no access projection is supplied', () => {
    const hidden = { id: 'hidden', label: 'Hidden', visible: () => false };
    const visible = { id: 'visible', label: 'Visible' };

    expect(filterSurfaceActions([hidden, visible], undefined).map((action) => action.id)).toEqual([
      'visible',
    ]);
    expect(resolveFieldAccessForRow('field', undefined, { id: 1 }, 0)).toBe('visible');
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
