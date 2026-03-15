/**
 * bh-activity-feed - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ActivityItem, ActivityFeedStats } from '../core';

const actor1 = { id: 'u1', name: 'Sofia Martinez', avatar: undefined, role: 'Senior Recruiter' };
const actor2 = { id: 'u2', name: 'James Chen', avatar: undefined, role: 'Hiring Manager' };
const actor3 = { id: 'u3', name: 'Priya Sharma', avatar: undefined, role: 'Technical Lead' };

export const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: 'a1',
    actor: actor1,
    actionType: 'applied',
    entityType: 'candidate',
    entityId: 'c1',
    entityName: 'Emily Watson',
    description: 'Applied for Sr. Frontend Engineer position via LinkedIn.',
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: 'a2',
    actor: actor2,
    actionType: 'interview_scheduled',
    entityType: 'interview',
    entityId: 'i1',
    entityName: 'Technical Screen - Alex Kim',
    description: 'Scheduled for Thursday at 2:00 PM EST.',
    timestamp: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'a3',
    actor: actor3,
    actionType: 'feedback_submitted',
    entityType: 'candidate',
    entityId: 'c2',
    entityName: 'Rachel Green',
    description: 'Strong system design skills. Recommend advancing to final round.',
    timestamp: new Date(Date.now() - 1500000).toISOString(),
  },
  {
    id: 'a4',
    actor: actor1,
    actionType: 'offer_made',
    entityType: 'offer',
    entityId: 'o1',
    entityName: 'Offer #1247 - Tom Baker',
    description: 'Senior Backend Engineer, $155k base + equity package.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'a5',
    actor: actor2,
    actionType: 'stage_change',
    entityType: 'candidate',
    entityId: 'c3',
    entityName: 'Maria Lopez',
    description: 'Moved from Phone Screen to On-site Interview.',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'a6',
    actor: actor3,
    actionType: 'note_added',
    entityType: 'candidate',
    entityId: 'c4',
    entityName: 'David Park',
    description: 'Candidate requested a 2-week delay before starting.',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'a7',
    actor: actor1,
    actionType: 'offer_accepted',
    entityType: 'offer',
    entityId: 'o2',
    entityName: 'Offer #1239 - Sarah Johnson',
    description: 'Start date confirmed for March 3, 2026.',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'a8',
    actor: actor2,
    actionType: 'candidate_rejected',
    entityType: 'candidate',
    entityId: 'c5',
    entityName: 'Kevin Brown',
    description: 'Did not meet minimum requirements for the role.',
    timestamp: new Date(Date.now() - 90000000).toISOString(),
  },
  {
    id: 'a9',
    actor: actor2,
    actionType: 'job_published',
    entityType: 'job',
    entityId: 'j1',
    entityName: 'Staff Engineer - Platform',
    description: 'Published to LinkedIn, Indeed, and company careers page.',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'a10',
    actor: actor3,
    actionType: 'interview_completed',
    entityType: 'interview',
    entityId: 'i2',
    entityName: 'Final Round - Lisa Wang',
    description: 'Panel interview with 3 team members completed successfully.',
    timestamp: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'a11',
    actor: actor1,
    actionType: 'candidate_hired',
    entityType: 'candidate',
    entityId: 'c6',
    entityName: 'Michael Torres',
    description: 'Onboarding begins March 10, 2026. Assigned to Platform team.',
    timestamp: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: 'a12',
    actor: actor2,
    actionType: 'offer_declined',
    entityType: 'offer',
    entityId: 'o3',
    entityName: 'Offer #1231 - Anna Lee',
    description: 'Candidate accepted a competing offer from another company.',
    timestamp: new Date(Date.now() - 432000000).toISOString(),
  },
];

export const MOCK_STATS: ActivityFeedStats = {
  events: 247,
  interviews: 18,
  offers: 7,
  hires: 3,
};
