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

export interface ValidationMessages {
  required: (fieldName: string) => string;
  minLength: (min: number) => string;
  maxLength: (max: number) => string;
  pattern: () => string;
}

export type Translate = (key: string, params?: Record<string, string | number>) => string;

/** Where an engine's default rule messages come from. */
export interface ValidationCatalog {
  namespace: TranslationNamespace;
  create: (t: Translate) => ValidationMessages;
}

/** Default rule messages from the `validation` catalog. */
export const VALIDATION_CATALOG: ValidationCatalog = {
  namespace: 'validation',
  create: (t) => ({
    required: () => t('required'),
    minLength: (min) => t('min_length', { min }),
    maxLength: (max) => t('max_length', { max }),
    pattern: () => t('pattern'),
  }),
};

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

/**
 * Every failing rule contributes one message, in rule order. Validators run
 * sequentially so a later rule can rely on an earlier one having passed.
 */
export async function validateRules(
  rules: readonly FormRule[] | undefined,
  value: unknown,
  messages: ValidationMessages,
  fieldName = '',
): Promise<string[]> {
  if (!rules || rules.length === 0) return [];
  const errors: string[] = [];
  for (const rule of rules) {
    if (rule.required && isEmpty(value)) {
      errors.push(rule.message || messages.required(fieldName));
    }
    if (rule.min !== undefined && typeof value === 'string' && value.length < rule.min) {
      errors.push(rule.message || messages.minLength(rule.min));
    }
    if (rule.max !== undefined && typeof value === 'string' && value.length > rule.max) {
      errors.push(rule.message || messages.maxLength(rule.max));
    }
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      errors.push(rule.message || messages.pattern());
    }
    if (rule.validator) {
      try {
        await rule.validator(rule, value);
      } catch (error) {
        errors.push(rule.message || String(error));
      }
    }
  }
  return errors;
}
