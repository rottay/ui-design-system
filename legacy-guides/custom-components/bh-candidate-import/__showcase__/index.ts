/**
 * bh-candidate-import - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ImportStep, FieldMapping, DedupMatch, ValidationResult } from '../core';

export const DEFAULT_STEPS: ImportStep[] = [
  { key: 'method', label: 'Import Method', status: 'active' },
  { key: 'upload', label: 'Upload', status: 'pending' },
  { key: 'mapping', label: 'Field Mapping', status: 'pending' },
  { key: 'dedup', label: 'Dedup Check', status: 'pending' },
  { key: 'validate', label: 'Validation', status: 'pending' },
  { key: 'import', label: 'Import', status: 'pending' },
];

export const DEFAULT_MAPPINGS: FieldMapping[] = [
  { sourceField: 'Full Name', targetField: 'name', autoDetected: true },
  { sourceField: 'Email Address', targetField: 'email', autoDetected: true },
  { sourceField: 'Phone', targetField: 'phone', autoDetected: true },
  { sourceField: 'Current Company', targetField: 'company', autoDetected: false },
  { sourceField: 'Job Title', targetField: 'currentRole', autoDetected: true },
  { sourceField: 'LinkedIn URL', targetField: 'linkedinUrl', autoDetected: false },
  { sourceField: 'Location', targetField: 'location', autoDetected: true },
];

export const DEFAULT_DEDUP: DedupMatch[] = [
  { candidateId: 'c-1', name: 'Sarah Johnson', email: 'sarah.j@google.com', similarity: 98, action: 'merge' },
  { candidateId: 'c-2', name: 'Michael Chen', email: 'mchen@stripe.com', similarity: 85, action: 'skip' },
  { candidateId: 'c-3', name: 'Emily R.', email: 'emily@meta.com', similarity: 72, action: 'create' },
];

export const DEFAULT_VALIDATION: ValidationResult = {
  valid: 142, warnings: 8, errors: 3,
  details: [
    { row: 23, field: 'email', message: 'Invalid email format' },
    { row: 47, field: 'phone', message: 'Missing country code' },
    { row: 89, field: 'email', message: 'Duplicate email within file' },
  ],
};
