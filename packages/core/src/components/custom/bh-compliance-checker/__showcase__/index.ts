/**
 * bh-compliance-checker - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ComplianceRule } from '../core';

export const MOCK_RULES: ComplianceRule[] = [
  { id: 'c-1', name: 'Equal Opportunity Compliance', category: 'Employment Law', status: 'pass', description: 'All job postings include required equal opportunity statements.', lastChecked: new Date(Date.now() - 3600000) },
  { id: 'c-2', name: 'Data Retention Policy', category: 'Data Privacy', status: 'pass', description: 'Candidate data is retained within the defined period.', lastChecked: new Date(Date.now() - 7200000) },
  { id: 'c-3', name: 'GDPR Consent Collection', category: 'Data Privacy', status: 'warning', description: 'Some candidate profiles are missing explicit consent records.', lastChecked: new Date(Date.now() - 14400000) },
  { id: 'c-4', name: 'Background Check Authorization', category: 'Background Screening', status: 'pass', description: 'All background checks have valid authorization on file.', lastChecked: new Date(Date.now() - 21600000) },
  { id: 'c-5', name: 'Interview Bias Training', category: 'Training', status: 'fail', description: '3 interviewers have not completed required bias training.', lastChecked: new Date(Date.now() - 43200000) },
  { id: 'c-6', name: 'Salary Band Compliance', category: 'Compensation', status: 'pass', description: 'All offers fall within approved salary bands.', lastChecked: new Date(Date.now() - 86400000) },
  { id: 'c-7', name: 'Accessibility Standards', category: 'Accessibility', status: 'warning', description: 'Assessment platform meets WCAG 2.1 AA with minor exceptions.', lastChecked: new Date(Date.now() - 172800000) },
  { id: 'c-8', name: 'Right to Work Verification', category: 'Employment Law', status: 'na', description: 'Applicable only for international hires.', lastChecked: new Date(Date.now() - 259200000) },
];
