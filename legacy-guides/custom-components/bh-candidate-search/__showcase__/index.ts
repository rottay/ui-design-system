/**
 * bh-candidate-search - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { SavedSearch, FacetCount } from '../core';
import type { DBCandidate } from '@rottay/recruiter';

export const DEFAULT_SAVED_SEARCHES: SavedSearch[] = [
  { id: 'ss-1', name: 'Senior React Devs', query: 'react senior', filters: { skills: ['React', 'TypeScript'], experienceRange: [5, 15] }, resultCount: 45 },
  { id: 'ss-2', name: 'SF Bay Area Engineers', query: 'software engineer', filters: { location: 'San Francisco, CA', radius: 50 }, resultCount: 128 },
  { id: 'ss-3', name: 'Active ML Candidates', query: 'machine learning', filters: { skills: ['Python', 'TensorFlow'], status: ['active'] }, resultCount: 23 },
];

export const DEFAULT_RESULTS: DBCandidate[] = [
  { id: 'c-1', firstName: 'Sarah', lastName: 'Johnson', avatarUrl: null, currentTitle: 'Senior Frontend Engineer', currentCompany: 'Google', currentLocation: { city: 'San Francisco', state: 'CA' }, skills: [{ name: 'React' }, { name: 'TypeScript' }, { name: 'Next.js' }, { name: 'GraphQL' }, { name: 'Node.js' }], status: 'active', email: 'sarah.j@google.com' } as DBCandidate,
  { id: 'c-2', firstName: 'Michael', lastName: 'Chen', avatarUrl: null, currentTitle: 'Full Stack Developer', currentCompany: 'Stripe', currentLocation: { city: 'New York', state: 'NY' }, skills: [{ name: 'React' }, { name: 'Python' }, { name: 'AWS' }, { name: 'Docker' }, { name: 'PostgreSQL' }], status: 'active', email: 'm.chen@stripe.com' } as DBCandidate,
  { id: 'c-3', firstName: 'Emily', lastName: 'Rodriguez', avatarUrl: null, currentTitle: 'Staff Engineer', currentCompany: 'Meta', currentLocation: { city: 'Seattle', state: 'WA' }, skills: [{ name: 'Go' }, { name: 'Kubernetes' }, { name: 'System Design' }, { name: 'gRPC' }, { name: 'Terraform' }], status: 'active', email: 'e.rodriguez@meta.com' } as DBCandidate,
  { id: 'c-4', firstName: 'James', lastName: 'Kim', avatarUrl: null, currentTitle: 'ML Engineer', currentCompany: 'Anthropic', currentLocation: { city: 'San Francisco', state: 'CA' }, skills: [{ name: 'Python' }, { name: 'PyTorch' }, { name: 'Transformers' }, { name: 'CUDA' }, { name: 'MLOps' }], status: 'active', email: 'j.kim@anthropic.com' } as DBCandidate,
  { id: 'c-5', firstName: 'Anna', lastName: 'Kowalski', avatarUrl: null, currentTitle: 'DevOps Lead', currentCompany: 'Vercel', currentLocation: { city: 'Remote' }, skills: [{ name: 'AWS' }, { name: 'Terraform' }, { name: 'Docker' }, { name: 'CI/CD' }, { name: 'Kubernetes' }], status: 'inactive', email: 'a.kowalski@vercel.com' } as DBCandidate,
  { id: 'c-6', firstName: 'David', lastName: 'Thompson', avatarUrl: null, currentTitle: 'VP Engineering', currentCompany: 'Linear', currentLocation: { city: 'New York', state: 'NY' }, skills: [{ name: 'Leadership' }, { name: 'Architecture' }, { name: 'TypeScript' }, { name: 'React' }, { name: 'PostgreSQL' }], status: 'active', email: 'd.thompson@linear.app' } as DBCandidate,
];

export const DEFAULT_MATCH_SCORES: Record<string, number> = {
  'c-1': 95, 'c-2': 88, 'c-3': 92, 'c-4': 85, 'c-5': 78, 'c-6': 91,
};

export const DEFAULT_HIGHLIGHTS: Record<string, string[]> = {
  'c-1': ['React', 'TypeScript', 'Next.js'], 'c-2': ['React', 'Python', 'AWS'],
  'c-3': ['System Design', 'Go'], 'c-4': ['Python', 'PyTorch'],
  'c-5': ['AWS', 'Terraform'], 'c-6': ['Leadership', 'Architecture'],
};

export const DEFAULT_FACETS: FacetCount[] = [
  { dimension: 'skills', value: 'React', count: 45 },
  { dimension: 'skills', value: 'TypeScript', count: 38 },
  { dimension: 'skills', value: 'Python', count: 32 },
  { dimension: 'skills', value: 'Node.js', count: 28 },
  { dimension: 'skills', value: 'AWS', count: 22 },
  { dimension: 'location', value: 'San Francisco', count: 34 },
  { dimension: 'location', value: 'New York', count: 28 },
  { dimension: 'location', value: 'Seattle', count: 18 },
  { dimension: 'status', value: 'active', count: 89 },
  { dimension: 'status', value: 'passive', count: 45 },
  { dimension: 'status', value: 'not-looking', count: 12 },
  { dimension: 'source', value: 'LinkedIn', count: 67 },
  { dimension: 'source', value: 'Referral', count: 34 },
  { dimension: 'source', value: 'Job Board', count: 22 },
];
