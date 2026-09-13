import { describe, expect, it } from 'vitest';

import { VALIDATION_CATALOG, validateRules, type ValidationMessages } from '..';

const messages: ValidationMessages = VALIDATION_CATALOG.create((key, params) => `${key}${params ? JSON.stringify(params) : ''}`);

describe('form rule validation', () => {
  it('reports every failing rule in rule order with the catalog message', async () => {
    const errors = await validateRules([{ required: true }, { min: 3 }, { pattern: /^\d+$/ }], 'ab', messages);
    expect(errors).toEqual(['min_length{"min":3}', 'pattern']);
    expect(await validateRules([{ required: true }], '', messages)).toEqual(['required']);
  });

  it('prefers the rule message and awaits validators in sequence', async () => {
    const calls: string[] = [];
    const rules = [
      { validator: async () => { calls.push('first'); } },
      { message: 'Taken', validator: async () => { calls.push('second'); throw new Error('taken'); } },
    ];
    expect(await validateRules(rules, 'ada', messages)).toEqual(['Taken']);
    expect(calls).toEqual(['first', 'second']);
  });

  it('passes a field with no rules or a satisfied rule set', async () => {
    expect(await validateRules(undefined, '', messages)).toEqual([]);
    expect(await validateRules([{ required: true, max: 5 }], 'ada', messages)).toEqual([]);
  });

  it('hands the field name to an engine catalog that names it', async () => {
    const named: ValidationMessages = { ...messages, required: (field) => `${field} is required` };
    expect(await validateRules([{ required: true }], undefined, named, 'email')).toEqual(['email is required']);
  });
});
