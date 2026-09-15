/**
 * @fileoverview The form's rule processing, shared by every engine that owns
 * its own form runtime.
 *
 * @module Form/Runtime/Validation
 * @category Inputs
 * @package @rottay/design-system
 */

import type { TranslationNamespace } from '@/infrastructure/runtime/i18n';
import type { FormRule } from '../../contracts';

export type FormRuleType = NonNullable<FormRule['type']>;

export interface ValidationMessages {
  required: (fieldName: string) => string;
  minLength: (min: number) => string;
  maxLength: (max: number) => string;
  pattern: () => string;
  /** The value's length, item count or numeric value is not exactly `len`. */
  length: (len: number) => string;
  minValue: (min: number) => string;
  maxValue: (max: number) => string;
  minItems: (min: number) => string;
  maxItems: (max: number) => string;
  /** The value is not of the rule's built-in type. */
  type: (type: FormRuleType) => string;
}

export type Translate = (key: string, params?: Record<string, string | number>) => string;

/** A translation with a fallback for a key the catalog does not carry. */
export type TranslateOr = (key: string, fallback: string, params?: Record<string, string | number>) => string;

/** Where an engine's default rule messages come from. */
export interface ValidationCatalog {
  namespace: TranslationNamespace;
  /** Without `tOr`, a key the catalog does not carry resolves to its fallback copy. */
  create: (t: Translate, tOr?: TranslateOr) => ValidationMessages;
}

/** The fallback copy alone, for a caller that brings no catalog lookup with fallback. */
export const FALLBACK_TRANSLATE_OR: TranslateOr = (_key, fallback) => fallback;

/** Default rule messages from the `validation` catalog. */
export const VALIDATION_CATALOG: ValidationCatalog = {
  namespace: 'validation',
  create: (t, tOr = FALLBACK_TRANSLATE_OR) => ({
    required: () => t('required'),
    minLength: (min) => t('min_length', { min }),
    maxLength: (max) => t('max_length', { max }),
    pattern: () => t('pattern'),
    length: (len) => tOr('length', `Must be exactly ${len} characters`, { len }),
    minValue: (min) => t('min_value', { min }),
    maxValue: (max) => t('max_value', { max }),
    minItems: (min) => t('array.min_items', { min }),
    maxItems: (max) => t('array.max_items', { max }),
    type: (type) => {
      switch (type) {
        case 'email':
          return t('email');
        case 'url':
          return t('url');
        case 'number':
          return t('number');
        case 'boolean':
          return tOr('boolean', 'Must be true or false');
        case 'array':
          return tOr('array.type', 'Must be a list');
        default:
          return tOr('string', 'Must be text');
      }
    },
  }),
};

export interface RuleOutcome {
  errors: string[];
  /** Failures of `warningOnly` rules; they never block submission. */
  warnings: string[];
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WEB_PROTOCOLS = new Set(['http:', 'https:', 'ftp:']);

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

function isBlank(value: unknown, rule: FormRule): boolean {
  return isEmpty(value) || (rule.whitespace === true && typeof value === 'string' && value.trim() === '');
}

function isWebUrl(value: string): boolean {
  try {
    return WEB_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    return false;
  }
}

function hasType(value: unknown, type: FormRuleType): boolean {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'email':
      return typeof value === 'string' && EMAIL.test(value);
    case 'url':
      return typeof value === 'string' && isWebUrl(value);
  }
}

type Bound = { kind: 'length' | 'value' | 'items'; size: number } | null;

/** What `min`, `max` and `len` bound: a string's length, a number's value or an array's item count. */
function boundOf(value: unknown, type: FormRuleType | undefined): Bound {
  if (type === 'number' || (type === undefined && typeof value === 'number')) {
    return typeof value === 'number' ? { kind: 'value', size: value } : null;
  }
  if (type === 'array' || (type === undefined && Array.isArray(value))) {
    return Array.isArray(value) ? { kind: 'items', size: value.length } : null;
  }
  return typeof value === 'string' ? { kind: 'length', size: value.length } : null;
}

function belowMessage(kind: NonNullable<Bound>['kind'], min: number, messages: ValidationMessages): string {
  return kind === 'value' ? messages.minValue(min) : kind === 'items' ? messages.minItems(min) : messages.minLength(min);
}

function aboveMessage(kind: NonNullable<Bound>['kind'], max: number, messages: ValidationMessages): string {
  return kind === 'value' ? messages.maxValue(max) : kind === 'items' ? messages.maxItems(max) : messages.maxLength(max);
}

async function failuresOf(rule: FormRule, value: unknown, messages: ValidationMessages, fieldName: string): Promise<string[]> {
  const failures: string[] = [];
  const fail = (fallback: string) => failures.push(rule.message || fallback);

  if (rule.required && isBlank(value, rule)) fail(messages.required(fieldName));

  const present = !isEmpty(value);
  const typed = rule.type === undefined || !present || hasType(value, rule.type);
  if (!typed) fail(messages.type(rule.type as FormRuleType));

  const bound = typed ? boundOf(value, rule.type) : null;
  if (bound) {
    if (rule.len !== undefined) {
      if (bound.size !== rule.len) fail(messages.length(rule.len));
    } else {
      if (rule.min !== undefined && bound.size < rule.min) fail(belowMessage(bound.kind, rule.min, messages));
      if (rule.max !== undefined && bound.size > rule.max) fail(aboveMessage(bound.kind, rule.max, messages));
    }
  }

  if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) fail(messages.pattern());

  if (rule.validator) {
    try {
      await rule.validator(rule, value);
    } catch (error) {
      fail(String(error));
    }
  }
  return failures;
}

/**
 * Every failing rule contributes one message per failed check, in rule order;
 * a `warningOnly` rule contributes warnings instead. Validators run
 * sequentially so a later rule can rely on an earlier one having passed.
 */
export async function evaluateRules(
  rules: readonly FormRule[] | undefined,
  value: unknown,
  messages: ValidationMessages,
  fieldName = '',
): Promise<RuleOutcome> {
  const outcome: RuleOutcome = { errors: [], warnings: [] };
  if (!rules || rules.length === 0) return outcome;
  for (const rule of rules) {
    const failures = await failuresOf(rule, value, messages, fieldName);
    (rule.warningOnly ? outcome.warnings : outcome.errors).push(...failures);
  }
  return outcome;
}

/** The blocking failures alone. */
export async function validateRules(
  rules: readonly FormRule[] | undefined,
  value: unknown,
  messages: ValidationMessages,
  fieldName = '',
): Promise<string[]> {
  return (await evaluateRules(rules, value, messages, fieldName)).errors;
}
