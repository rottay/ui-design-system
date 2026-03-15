/**
 * useFormDiff Hook Tests
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFormDiff } from './form-diff';

describe('useFormDiff', () => {
  describe('Basic Comparison', () => {
    it('reports no changes when original and current are identical', () => {
      const data = { name: 'Alice', age: 30 };
      const { result } = renderHook(() =>
        useFormDiff({ original: data, current: { ...data } }),
      );

      expect(result.current.hasChanges).toBe(false);
      expect(result.current.changedCount).toBe(0);
      expect(result.current.changedFields).toEqual([]);
      expect(result.current.summary).toBe('No changes');
      expect(result.current.diff.every((e) => e.type === 'unchanged')).toBe(true);
    });

    it('detects a changed field', () => {
      const { result } = renderHook(() =>
        useFormDiff({
          original: { name: 'Alice', age: 30 },
          current: { name: 'Bob', age: 30 },
        }),
      );

      expect(result.current.hasChanges).toBe(true);
      expect(result.current.changedFields).toEqual(['name']);
      expect(result.current.changedCount).toBe(1);
      expect(result.current.summary).toBe('1 field changed');
    });

    it('detects multiple changed fields', () => {
      const { result } = renderHook(() =>
        useFormDiff({
          original: { name: 'Alice', age: 30, email: 'a@b.com' },
          current: { name: 'Bob', age: 25, email: 'a@b.com' },
        }),
      );

      expect(result.current.hasChanges).toBe(true);
      expect(result.current.changedCount).toBe(2);
      expect(result.current.changedFields).toContain('name');
      expect(result.current.changedFields).toContain('age');
      expect(result.current.summary).toBe('2 fields changed');
    });

    it('detects added fields', () => {
      const { result } = renderHook(() =>
        useFormDiff({
          original: { name: 'Alice' } as any,
          current: { name: 'Alice', email: 'a@b.com' },
        }),
      );

      const emailDiff = result.current.getFieldDiff('email');
      expect(emailDiff).toBeDefined();
      expect(emailDiff!.type).toBe('added');
      expect(emailDiff!.oldValue).toBeUndefined();
      expect(emailDiff!.newValue).toBe('a@b.com');
    });

    it('detects removed fields', () => {
      const { result } = renderHook(() =>
        useFormDiff({
          original: { name: 'Alice', email: 'a@b.com' },
          current: { name: 'Alice' } as any,
        }),
      );

      const emailDiff = result.current.getFieldDiff('email');
      expect(emailDiff).toBeDefined();
      expect(emailDiff!.type).toBe('removed');
      expect(emailDiff!.oldValue).toBe('a@b.com');
      expect(emailDiff!.newValue).toBeUndefined();
    });
  });

  describe('Deep Comparison', () => {
    it('compares nested objects recursively', () => {
      const { result } = renderHook(() =>
        useFormDiff({
          original: {
            name: 'Alice',
            address: { city: 'NYC', zip: '10001' },
          },
          current: {
            name: 'Alice',
            address: { city: 'LA', zip: '10001' },
          },
        }),
      );

      expect(result.current.hasChanges).toBe(true);
      expect(result.current.changedFields).toEqual(['address.city']);

      const cityDiff = result.current.getFieldDiff('address.city');
      expect(cityDiff).toBeDefined();
      expect(cityDiff!.type).toBe('changed');
      expect(cityDiff!.oldValue).toBe('NYC');
      expect(cityDiff!.newValue).toBe('LA');
    });

    it('compares deeply nested objects', () => {
      const { result } = renderHook(() =>
        useFormDiff({
          original: {
            config: { theme: { primary: '#000', secondary: '#fff' } },
          },
          current: {
            config: { theme: { primary: '#111', secondary: '#fff' } },
          },
        }),
      );

      expect(result.current.changedFields).toEqual(['config.theme.primary']);
    });

    it('detects added nested keys', () => {
      const { result } = renderHook(() =>
        useFormDiff({
          original: { address: { city: 'NYC' } } as any,
          current: { address: { city: 'NYC', state: 'NY' } },
        }),
      );

      const stateDiff = result.current.getFieldDiff('address.state');
      expect(stateDiff).toBeDefined();
      expect(stateDiff!.type).toBe('added');
    });
  });

  describe('Array Comparison', () => {
    it('detects changed arrays', () => {
      const { result } = renderHook(() =>
        useFormDiff({
          original: { tags: ['a', 'b'] },
          current: { tags: ['a', 'c'] },
        }),
      );

      expect(result.current.hasChanges).toBe(true);
      const tagsDiff = result.current.getFieldDiff('tags');
      expect(tagsDiff).toBeDefined();
      expect(tagsDiff!.type).toBe('changed');
      expect(tagsDiff!.oldValue).toEqual(['a', 'b']);
      expect(tagsDiff!.newValue).toEqual(['a', 'c']);
    });

    it('reports unchanged when arrays are identical', () => {
      const { result } = renderHook(() =>
        useFormDiff({
          original: { tags: ['a', 'b'] },
          current: { tags: ['a', 'b'] },
        }),
      );

      expect(result.current.hasChanges).toBe(false);
      const tagsDiff = result.current.getFieldDiff('tags');
      expect(tagsDiff!.type).toBe('unchanged');
    });

    it('detects added items in arrays', () => {
      const { result } = renderHook(() =>
        useFormDiff({
          original: { items: [1, 2] },
          current: { items: [1, 2, 3] },
        }),
      );

      expect(result.current.hasChanges).toBe(true);
      const itemsDiff = result.current.getFieldDiff('items');
      expect(itemsDiff!.type).toBe('changed');
    });

    it('detects removed items from arrays', () => {
      const { result } = renderHook(() =>
        useFormDiff({
          original: { items: [1, 2, 3] },
          current: { items: [1, 2] },
        }),
      );

      const itemsDiff = result.current.getFieldDiff('items');
      expect(itemsDiff!.type).toBe('changed');
    });

    it('handles arrays of objects', () => {
      const { result } = renderHook(() =>
        useFormDiff({
          original: { users: [{ id: 1, name: 'A' }] },
          current: { users: [{ id: 1, name: 'B' }] },
        }),
      );

      expect(result.current.hasChanges).toBe(true);
      const usersDiff = result.current.getFieldDiff('users');
      expect(usersDiff!.type).toBe('changed');
    });
  });

  describe('Ignore Fields', () => {
    it('ignores specified top-level fields', () => {
      const { result } = renderHook(() =>
        useFormDiff({
          original: { name: 'Alice', updatedAt: '2024-01-01', id: '123' },
          current: { name: 'Alice', updatedAt: '2024-06-01', id: '456' },
          ignore: ['updatedAt', 'id'],
        }),
      );

      expect(result.current.hasChanges).toBe(false);
      expect(result.current.diff.length).toBe(1); // only 'name'
      expect(result.current.diff[0].field).toBe('name');
    });

    it('ignores nested field paths', () => {
      const { result } = renderHook(() =>
        useFormDiff({
          original: { meta: { version: 1, label: 'A' } },
          current: { meta: { version: 2, label: 'A' } },
          ignore: ['meta.version'],
        }),
      );

      expect(result.current.hasChanges).toBe(false);
    });

    it('does not include ignored fields in diff output', () => {
      const { result } = renderHook(() =>
        useFormDiff({
          original: { a: 1, b: 2, c: 3 },
          current: { a: 10, b: 20, c: 30 },
          ignore: ['b'],
        }),
      );

      expect(result.current.diff.map((d) => d.field)).not.toContain('b');
      expect(result.current.changedCount).toBe(2);
    });
  });

  describe('Field Labels', () => {
    it('attaches labels to diff entries', () => {
      const { result } = renderHook(() =>
        useFormDiff({
          original: { firstName: 'Alice', lastName: 'Smith' },
          current: { firstName: 'Bob', lastName: 'Smith' },
          fieldLabels: { firstName: 'First Name', lastName: 'Last Name' },
        }),
      );

      const firstNameDiff = result.current.getFieldDiff('firstName');
      expect(firstNameDiff!.label).toBe('First Name');

      const lastNameDiff = result.current.getFieldDiff('lastName');
      expect(lastNameDiff!.label).toBe('Last Name');
    });

    it('supports labels for nested field paths', () => {
      const { result } = renderHook(() =>
        useFormDiff({
          original: { address: { city: 'NYC' } },
          current: { address: { city: 'LA' } },
          fieldLabels: { 'address.city': 'City' },
        }),
      );

      const cityDiff = result.current.getFieldDiff('address.city');
      expect(cityDiff!.label).toBe('City');
    });

    it('leaves label undefined when not provided', () => {
      const { result } = renderHook(() =>
        useFormDiff({
          original: { name: 'Alice' },
          current: { name: 'Bob' },
        }),
      );

      const nameDiff = result.current.getFieldDiff('name');
      expect(nameDiff!.label).toBeUndefined();
    });
  });

  describe('getFieldDiff', () => {
    it('returns the diff entry for a given field', () => {
      const { result } = renderHook(() =>
        useFormDiff({
          original: { name: 'Alice', age: 30 },
          current: { name: 'Bob', age: 30 },
        }),
      );

      const nameDiff = result.current.getFieldDiff('name');
      expect(nameDiff).toBeDefined();
      expect(nameDiff!.field).toBe('name');
      expect(nameDiff!.type).toBe('changed');
      expect(nameDiff!.oldValue).toBe('Alice');
      expect(nameDiff!.newValue).toBe('Bob');
    });

    it('returns undefined for non-existent fields', () => {
      const { result } = renderHook(() =>
        useFormDiff({
          original: { name: 'Alice' },
          current: { name: 'Alice' },
        }),
      );

      expect(result.current.getFieldDiff('nonexistent')).toBeUndefined();
    });
  });

  describe('Memoization', () => {
    it('returns stable references when inputs do not change', () => {
      const original = { name: 'Alice', age: 30 };
      const current = { name: 'Bob', age: 30 };

      const { result, rerender } = renderHook(() =>
        useFormDiff({ original, current }),
      );

      const firstDiff = result.current.diff;
      const firstGetFieldDiff = result.current.getFieldDiff;

      rerender();

      expect(result.current.diff).toBe(firstDiff);
      expect(result.current.getFieldDiff).toBe(firstGetFieldDiff);
    });

    it('recalculates when original changes', () => {
      const { result, rerender } = renderHook(
        ({ original, current }) => useFormDiff({ original, current }),
        {
          initialProps: {
            original: { name: 'Alice' },
            current: { name: 'Bob' },
          },
        },
      );

      expect(result.current.changedCount).toBe(1);

      rerender({
        original: { name: 'Bob' },
        current: { name: 'Bob' },
      });

      expect(result.current.hasChanges).toBe(false);
      expect(result.current.changedCount).toBe(0);
    });

    it('recalculates when current changes', () => {
      const { result, rerender } = renderHook(
        ({ original, current }) => useFormDiff({ original, current }),
        {
          initialProps: {
            original: { name: 'Alice' },
            current: { name: 'Alice' },
          },
        },
      );

      expect(result.current.hasChanges).toBe(false);

      rerender({
        original: { name: 'Alice' },
        current: { name: 'Charlie' },
      });

      expect(result.current.hasChanges).toBe(true);
      expect(result.current.changedFields).toEqual(['name']);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty objects', () => {
      const { result } = renderHook(() =>
        useFormDiff({ original: {}, current: {} }),
      );

      expect(result.current.hasChanges).toBe(false);
      expect(result.current.diff).toEqual([]);
    });

    it('handles null values', () => {
      const { result } = renderHook(() =>
        useFormDiff({
          original: { value: null } as any,
          current: { value: 'hello' },
        }),
      );

      const valueDiff = result.current.getFieldDiff('value');
      expect(valueDiff!.type).toBe('added');
    });

    it('handles boolean changes', () => {
      const { result } = renderHook(() =>
        useFormDiff({
          original: { active: true },
          current: { active: false },
        }),
      );

      const activeDiff = result.current.getFieldDiff('active');
      expect(activeDiff!.type).toBe('changed');
      expect(activeDiff!.oldValue).toBe(true);
      expect(activeDiff!.newValue).toBe(false);
    });

    it('handles numeric zero vs non-zero', () => {
      const { result } = renderHook(() =>
        useFormDiff({
          original: { count: 0 },
          current: { count: 5 },
        }),
      );

      const countDiff = result.current.getFieldDiff('count');
      expect(countDiff!.type).toBe('changed');
    });

    it('handles string to number type change', () => {
      const { result } = renderHook(() =>
        useFormDiff({
          original: { value: '5' } as any,
          current: { value: 5 } as any,
        }),
      );

      const valueDiff = result.current.getFieldDiff('value');
      expect(valueDiff!.type).toBe('changed');
    });

    it('summary correctly pluralizes', () => {
      const { result: r0 } = renderHook(() =>
        useFormDiff({
          original: { a: 1 },
          current: { a: 1 },
        }),
      );
      expect(r0.current.summary).toBe('No changes');

      const { result: r1 } = renderHook(() =>
        useFormDiff({
          original: { a: 1 },
          current: { a: 2 },
        }),
      );
      expect(r1.current.summary).toBe('1 field changed');

      const { result: r3 } = renderHook(() =>
        useFormDiff({
          original: { a: 1, b: 2, c: 3 },
          current: { a: 10, b: 20, c: 30 },
        }),
      );
      expect(r3.current.summary).toBe('3 fields changed');
    });
  });
});
