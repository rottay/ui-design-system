/**
 * Every rule option the contract announces decides the outcome of a field:
 * the built-in `type`s, `len`, `whitespace` on `required`, `min`/`max` read
 * by the value's kind (length, numeric value or item count), and
 * `warningOnly`, which turns a failure into a warning that blocks nothing.
 */
import { describe, expect, it } from 'vitest';

import { VALIDATION_CATALOG, evaluateRules, validateRules, type ValidationMessages } from '..';

const messages: ValidationMessages = VALIDATION_CATALOG.create(
  (key, params) => `${key}${params ? JSON.stringify(params) : ''}`,
  (key, fallback) => `${key}=${fallback}`,
);

describe('the built-in type rule', () => {
  it('accepts a well-formed email and refuses a malformed one with the catalog message', async () => {
    expect(await validateRules([{ type: 'email' }], 'ada@example.com', messages)).toEqual([]);
    expect(await validateRules([{ type: 'email' }], 'ada@', messages)).toEqual(['email']);
    expect(await validateRules([{ type: 'email' }], 'ada example.com', messages)).toEqual(['email']);
  });

  it('accepts an absolute web URL and refuses everything else', async () => {
    expect(await validateRules([{ type: 'url' }], 'https://rottay.com/path?x=1', messages)).toEqual([]);
    expect(await validateRules([{ type: 'url' }], 'rottay.com', messages)).toEqual(['url']);
    expect(await validateRules([{ type: 'url' }], 'javascript:alert(1)', messages)).toEqual(['url']);
  });

  it('reads number, boolean, string and array strictly by the value kind', async () => {
    expect(await validateRules([{ type: 'number' }], 42, messages)).toEqual([]);
    expect(await validateRules([{ type: 'number' }], '42', messages)).toEqual(['number']);
    expect(await validateRules([{ type: 'number' }], Number.NaN, messages)).toEqual(['number']);
    expect(await validateRules([{ type: 'boolean' }], false, messages)).toEqual([]);
    expect(await validateRules([{ type: 'boolean', message: 'Boolean only' }], 'yes', messages)).toEqual(['Boolean only']);
    expect(await validateRules([{ type: 'string' }], 'x', messages)).toEqual([]);
    expect(await validateRules([{ type: 'string', message: 'Text only' }], 5, messages)).toEqual(['Text only']);
    expect(await validateRules([{ type: 'array' }], [], messages)).toEqual([]);
    expect(await validateRules([{ type: 'array', message: 'List only' }], 'x', messages)).toEqual(['List only']);
  });

  it('leaves an empty optional value alone and lets required speak first', async () => {
    expect(await validateRules([{ type: 'email' }], '', messages)).toEqual([]);
    expect(await validateRules([{ type: 'number' }], undefined, messages)).toEqual([]);
    expect(await validateRules([{ required: true, type: 'email' }], '', messages)).toEqual(['required']);
  });
});

describe('the exact length rule', () => {
  it('measures strings and arrays, and equals numbers', async () => {
    expect(await validateRules([{ len: 4 }], 'abcd', messages)).toEqual([]);
    expect(await validateRules([{ len: 4, message: 'Exactly four' }], 'abc', messages)).toEqual(['Exactly four']);
    expect(await validateRules([{ len: 2 }], [1, 2], messages)).toEqual([]);
    expect(await validateRules([{ len: 2, message: 'Two items' }], [1], messages)).toEqual(['Two items']);
    expect(await validateRules([{ len: 4 }], 4, messages)).toEqual([]);
    expect(await validateRules([{ len: 4, message: 'Four' }], 5, messages)).toEqual(['Four']);
  });

  it('takes precedence over min and max on the same rule', async () => {
    expect(await validateRules([{ len: 3, min: 5, max: 1 }], 'abc', messages)).toEqual([]);
  });
});

describe('the whitespace option', () => {
  it('makes a whitespace-only string fail the required check', async () => {
    expect(await validateRules([{ required: true, whitespace: true }], '   ', messages)).toEqual(['required']);
    expect(await validateRules([{ required: true, whitespace: true }], ' a ', messages)).toEqual([]);
  });

  it('changes nothing without required, and required alone still accepts whitespace', async () => {
    expect(await validateRules([{ whitespace: true }], '   ', messages)).toEqual([]);
    expect(await validateRules([{ required: true }], '   ', messages)).toEqual([]);
  });
});

describe('min and max read the value kind', () => {
  it('bounds a string by its length', async () => {
    expect(await validateRules([{ min: 3 }], 'ab', messages)).toEqual(['min_length{"min":3}']);
    expect(await validateRules([{ max: 2 }], 'abc', messages)).toEqual(['max_length{"max":2}']);
    expect(await validateRules([{ type: 'string', min: 2, max: 3 }], 'abc', messages)).toEqual([]);
  });

  it('bounds a number by its value', async () => {
    expect(await validateRules([{ min: 10 }], 5, messages)).toEqual(['min_value{"min":10}']);
    expect(await validateRules([{ max: 10 }], 50, messages)).toEqual(['max_value{"max":10}']);
    expect(await validateRules([{ type: 'number', min: 1, max: 10 }], 10, messages)).toEqual([]);
  });

  it('bounds an array by its item count', async () => {
    expect(await validateRules([{ min: 2 }], [1], messages)).toEqual(['array.min_items{"min":2}']);
    expect(await validateRules([{ max: 2 }], [1, 2, 3], messages)).toEqual(['array.max_items{"max":2}']);
    expect(await validateRules([{ type: 'array', min: 1 }], [], messages)).toEqual(['array.min_items{"min":1}']);
  });

  it('reports only the type mismatch when the declared type does not hold', async () => {
    expect(await validateRules([{ type: 'number', min: 10 }], '5', messages)).toEqual(['number']);
  });
});

describe('rules combine in order', () => {
  it('reports each failing rule once, in rule order, with its own message', async () => {
    expect(await validateRules([{ required: true }, { type: 'email' }, { max: 5 }], 'ada@example.com', messages)).toEqual([
      'max_length{"max":5}',
    ]);
    expect(
      await validateRules([{ required: true, message: 'Need it' }, { type: 'email', message: 'Bad email' }, { len: 3, message: 'Three' }], 'nope', messages),
    ).toEqual(['Bad email', 'Three']);
  });
});

describe('warningOnly turns a failure into a warning', () => {
  it('collects the failure as a warning and leaves the errors empty', async () => {
    expect(await evaluateRules([{ min: 8, warningOnly: true, message: 'Weak' }], 'abc', messages)).toEqual({
      errors: [],
      warnings: ['Weak'],
    });
    expect(await validateRules([{ min: 8, warningOnly: true, message: 'Weak' }], 'abc', messages)).toEqual([]);
  });

  it('keeps blocking failures and warnings apart on the same field', async () => {
    expect(
      await evaluateRules([{ required: true }, { min: 8, warningOnly: true, message: 'Weak' }, { pattern: /\d/ }], '', messages),
    ).toEqual({ errors: ['required', 'pattern'], warnings: ['Weak'] });
  });

  it('applies to a custom validator as well', async () => {
    const rules = [{ warningOnly: true, validator: async () => { throw new Error('Consider a stronger one'); } }];
    expect(await evaluateRules(rules, 'abc', messages)).toEqual({ errors: [], warnings: ['Error: Consider a stronger one'] });
  });
});
