/**
 * bh-candidate-bulk-email - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { BulkEmailRecipient } from '../core';
import type { DBCandidate } from '@rottay/recruiter';

export const MOCK_RECIPIENTS: BulkEmailRecipient[] = [
  { candidate: { id: 'br-1', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@email.com' } as DBCandidate, variables: { position: 'Senior Frontend Engineer', interviewDate: 'March 15, 2026' } },
  { candidate: { id: 'br-2', firstName: 'Michael', lastName: 'Chen', email: 'michael.chen@email.com' } as DBCandidate, variables: { position: 'Backend Developer', interviewDate: 'March 16, 2026' } },
  { candidate: { id: 'br-3', firstName: 'Emily', lastName: 'Rodriguez', email: 'emily.r@email.com' } as DBCandidate, variables: { position: 'Product Designer', interviewDate: 'March 17, 2026' } },
  { candidate: { id: 'br-4', firstName: 'James', lastName: 'Kim', email: 'james.kim@email.com' } as DBCandidate, variables: { position: 'DevOps Engineer', interviewDate: 'March 18, 2026' } },
  { candidate: { id: 'br-5', firstName: 'Anna', lastName: 'Kowalski', email: 'anna.k@email.com' } as DBCandidate, variables: { position: 'Data Analyst', interviewDate: 'March 19, 2026' } },
];

export const MOCK_SUBJECT = 'Interview Invitation - {{position}}';

export const MOCK_BODY = 'Dear {{name}},\n\nWe are pleased to invite you for an interview for the {{position}} position.\n\nYour interview is scheduled for {{interviewDate}}.\n\nPlease confirm your availability.\n\nBest regards,\nThe Hiring Team';
