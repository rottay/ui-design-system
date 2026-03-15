/**
 * bh-job-board - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { JobItem, CandidateStageCount, JobBoardStat, JobBoardFilter } from '../core';

interface StatusConfig { label: string; color: string; bgColor: string; borderColor: string; dotColor: string }
interface UrgencyConfig { label: string; color: string; bgColor: string; borderColor: string }

export const DEFAULT_STATUS_CFG: StatusConfig = { label: 'Unknown', color: '#666', bgColor: '#f5f5f5', borderColor: '#ddd', dotColor: '#999' };

export const DEFAULT_URGENCY_CFG: UrgencyConfig = { label: 'Normal', color: '#666', bgColor: '#f5f5f5', borderColor: '#ddd' };

// ---------------------------------------------------------------------------
// Mock candidate stage distributions
// ---------------------------------------------------------------------------

const STAGES_SENIOR_ENG: CandidateStageCount[] = [
  { stage: 'Applied', count: 42 },
  { stage: 'Screening', count: 18 },
  { stage: 'Technical Interview', count: 9 },
  { stage: 'On-site', count: 4 },
  { stage: 'Offer', count: 2 },
];

const STAGES_PM: CandidateStageCount[] = [
  { stage: 'Applied', count: 67 },
  { stage: 'Screening', count: 31 },
  { stage: 'Case Study', count: 12 },
  { stage: 'Panel Interview', count: 5 },
  { stage: 'Offer', count: 1 },
];

const STAGES_DESIGNER: CandidateStageCount[] = [
  { stage: 'Applied', count: 29 },
  { stage: 'Portfolio Review', count: 14 },
  { stage: 'Design Challenge', count: 6 },
  { stage: 'Culture Fit', count: 3 },
  { stage: 'Offer', count: 1 },
];

const STAGES_DATA_SCI: CandidateStageCount[] = [
  { stage: 'Applied', count: 55 },
  { stage: 'Screening', count: 22 },
  { stage: 'Take-home', count: 10 },
  { stage: 'Technical Interview', count: 4 },
  { stage: 'Offer', count: 0 },
];

const STAGES_DEVOPS: CandidateStageCount[] = [
  { stage: 'Applied', count: 18 },
  { stage: 'Screening', count: 8 },
  { stage: 'Technical Interview', count: 3 },
  { stage: 'Offer', count: 1 },
];

const STAGES_HEAD_OF_ENG: CandidateStageCount[] = [
  { stage: 'Sourced', count: 12 },
  { stage: 'Outreach', count: 8 },
  { stage: 'First Call', count: 5 },
  { stage: 'Executive Panel', count: 2 },
  { stage: 'Offer', count: 1 },
];

const STAGES_QA: CandidateStageCount[] = [
  { stage: 'Applied', count: 34 },
  { stage: 'Screening', count: 15 },
  { stage: 'Technical Assessment', count: 7 },
  { stage: 'Interview', count: 3 },
  { stage: 'Offer', count: 0 },
];

const STAGES_FILLED: CandidateStageCount[] = [
  { stage: 'Applied', count: 88 },
  { stage: 'Screening', count: 40 },
  { stage: 'Interview', count: 15 },
  { stage: 'Offer', count: 3 },
  { stage: 'Hired', count: 1 },
];

// ---------------------------------------------------------------------------
// Mock jobs (8 jobs covering diverse statuses, urgencies, departments, clients)
// ---------------------------------------------------------------------------

export const MOCK_JOBS: JobItem[] = [
  {
    id: 'job-001',
    title: 'Senior Frontend Engineer',
    code: 'ENG-2026-041',
    status: 'published',
    department: 'Engineering',
    urgency: 'high',
    candidateCount: 75,
    daysOpen: 14,
    location: 'San Francisco, CA',
    isRemote: false,
    clientName: 'Acme Corp',
    workMode: 'hybrid',
    benefits: ['Health Insurance', '401k Match', 'Stock Options', 'Unlimited PTO'],
    salaryMin: 165000,
    salaryMax: 210000,
    salaryCurrency: 'USD',
    totalApplications: 75,
    totalViews: 1240,
    hiringUrgency: 'high',
    targetHireDate: '2026-03-15',
    team: 'Platform UI',
    seniorityLevel: 'Senior',
    recruiterAvatars: [
      'https://i.pravatar.cc/40?u=rec-1',
      'https://i.pravatar.cc/40?u=rec-2',
    ],
    candidatesByStage: STAGES_SENIOR_ENG,
  },
  {
    id: 'job-002',
    title: 'Product Manager - Growth',
    code: 'PM-2026-012',
    status: 'published',
    department: 'Product',
    urgency: 'critical',
    candidateCount: 116,
    daysOpen: 28,
    location: 'New York, NY',
    isRemote: false,
    clientName: 'TechVentures Inc',
    workMode: 'onsite',
    benefits: ['Health Insurance', 'Annual Bonus', 'Learning Budget'],
    salaryMin: 140000,
    salaryMax: 185000,
    salaryCurrency: 'USD',
    totalApplications: 116,
    totalViews: 2100,
    hiringUrgency: 'urgent',
    targetHireDate: '2026-02-28',
    team: 'Growth',
    seniorityLevel: 'Mid-Senior',
    recruiterAvatars: [
      'https://i.pravatar.cc/40?u=rec-3',
    ],
    candidatesByStage: STAGES_PM,
  },
  {
    id: 'job-003',
    title: 'Staff UX Designer',
    code: 'DES-2026-007',
    status: 'paused',
    department: 'Design',
    urgency: 'low',
    candidateCount: 53,
    daysOpen: 45,
    location: 'Austin, TX',
    isRemote: true,
    clientName: 'Acme Corp',
    workMode: 'remote',
    benefits: ['Health Insurance', 'Home Office Stipend', 'Flexible Hours'],
    salaryMin: 150000,
    salaryMax: 195000,
    salaryCurrency: 'USD',
    totalApplications: 53,
    totalViews: 890,
    hiringUrgency: 'low',
    targetHireDate: null,
    team: 'Design Systems',
    seniorityLevel: 'Staff',
    recruiterAvatars: [
      'https://i.pravatar.cc/40?u=rec-4',
      'https://i.pravatar.cc/40?u=rec-5',
      'https://i.pravatar.cc/40?u=rec-6',
    ],
    candidatesByStage: STAGES_DESIGNER,
  },
  {
    id: 'job-004',
    title: 'Data Scientist',
    code: 'DATA-2026-019',
    status: 'published',
    department: 'Data & Analytics',
    urgency: 'medium',
    candidateCount: 91,
    daysOpen: 21,
    location: 'Seattle, WA',
    isRemote: false,
    clientName: 'GlobalFinance Ltd',
    workMode: 'hybrid',
    benefits: ['Health Insurance', 'RSUs', 'Conference Budget', 'Gym Membership'],
    salaryMin: 130000,
    salaryMax: 175000,
    salaryCurrency: 'USD',
    totalApplications: 91,
    totalViews: 1580,
    hiringUrgency: 'normal',
    targetHireDate: '2026-04-01',
    team: 'ML Platform',
    seniorityLevel: 'Mid',
    recruiterAvatars: [
      'https://i.pravatar.cc/40?u=rec-7',
    ],
    candidatesByStage: STAGES_DATA_SCI,
  },
  {
    id: 'job-005',
    title: 'Senior DevOps Engineer',
    code: 'ENG-2026-042',
    status: 'draft',
    department: 'Engineering',
    urgency: 'medium',
    candidateCount: 0,
    daysOpen: 0,
    location: 'Remote (US)',
    isRemote: true,
    clientName: 'CloudScale Systems',
    workMode: 'remote',
    benefits: ['Health Insurance', 'Stock Options', 'Home Office Budget'],
    salaryMin: 155000,
    salaryMax: 200000,
    salaryCurrency: 'USD',
    totalApplications: 0,
    totalViews: 0,
    hiringUrgency: 'normal',
    targetHireDate: '2026-05-01',
    team: 'Infrastructure',
    seniorityLevel: 'Senior',
    recruiterAvatars: [],
    candidatesByStage: STAGES_DEVOPS,
  },
  {
    id: 'job-006',
    title: 'Head of Engineering',
    code: 'EXEC-2026-003',
    status: 'published',
    department: 'Engineering',
    urgency: 'critical',
    candidateCount: 28,
    daysOpen: 60,
    location: 'London, UK',
    isRemote: false,
    clientName: 'TechVentures Inc',
    workMode: 'onsite',
    benefits: ['Private Healthcare', 'Equity Package', 'Relocation Assistance', 'Executive Coaching'],
    salaryMin: 220000,
    salaryMax: 300000,
    salaryCurrency: 'GBP',
    totalApplications: 28,
    totalViews: 3200,
    hiringUrgency: 'urgent',
    targetHireDate: '2026-03-01',
    team: 'Leadership',
    seniorityLevel: 'Executive',
    recruiterAvatars: [
      'https://i.pravatar.cc/40?u=rec-8',
      'https://i.pravatar.cc/40?u=rec-9',
    ],
    candidatesByStage: STAGES_HEAD_OF_ENG,
  },
  {
    id: 'job-007',
    title: 'QA Automation Engineer',
    code: 'ENG-2026-038',
    status: 'closed',
    department: 'Engineering',
    urgency: 'low',
    candidateCount: 59,
    daysOpen: 90,
    location: 'Chicago, IL',
    isRemote: false,
    clientName: 'GlobalFinance Ltd',
    workMode: 'hybrid',
    benefits: ['Health Insurance', '401k Match'],
    salaryMin: 110000,
    salaryMax: 145000,
    salaryCurrency: 'USD',
    totalApplications: 59,
    totalViews: 720,
    hiringUrgency: 'low',
    targetHireDate: '2026-01-15',
    team: 'Quality',
    seniorityLevel: 'Mid',
    recruiterAvatars: [
      'https://i.pravatar.cc/40?u=rec-10',
    ],
    candidatesByStage: STAGES_QA,
  },
  {
    id: 'job-008',
    title: 'Backend Engineer - Payments',
    code: 'ENG-2026-035',
    status: 'closed',
    department: 'Engineering',
    urgency: 'low',
    candidateCount: 147,
    daysOpen: 120,
    location: 'San Francisco, CA',
    isRemote: false,
    clientName: 'Acme Corp',
    workMode: 'hybrid',
    benefits: ['Health Insurance', 'Stock Options', '401k Match', 'Commuter Benefits'],
    salaryMin: 170000,
    salaryMax: 220000,
    salaryCurrency: 'USD',
    totalApplications: 147,
    totalViews: 2800,
    hiringUrgency: 'normal',
    targetHireDate: '2025-12-01',
    team: 'Platform Backend',
    seniorityLevel: 'Senior',
    recruiterAvatars: [
      'https://i.pravatar.cc/40?u=rec-11',
      'https://i.pravatar.cc/40?u=rec-12',
    ],
    candidatesByStage: STAGES_FILLED,
  },
];

// ---------------------------------------------------------------------------
// Board-level stats (summary ribbon)
// ---------------------------------------------------------------------------

export const MOCK_STATS: JobBoardStat[] = [
  { key: 'total', label: 'Total Jobs', count: 8 },
  { key: 'published', label: 'Published', count: 4 },
  { key: 'draft', label: 'Drafts', count: 1 },
  { key: 'paused', label: 'Paused', count: 1 },
  { key: 'closed', label: 'Closed', count: 2 },
];

// ---------------------------------------------------------------------------
// Sample filter (published jobs in Engineering)
// ---------------------------------------------------------------------------

export const MOCK_FILTER: JobBoardFilter = {
  status: 'published',
  department: 'Engineering',
  urgency: null,
  clientId: null,
  search: '',
};

// ---------------------------------------------------------------------------
// Convenience lists for filter dropdowns
// ---------------------------------------------------------------------------

export const MOCK_DEPARTMENTS: string[] = [
  'Engineering',
  'Product',
  'Design',
  'Data & Analytics',
];

export const MOCK_CLIENTS: Array<{ id: string; name: string }> = [
  { id: 'client-001', name: 'Acme Corp' },
  { id: 'client-002', name: 'TechVentures Inc' },
  { id: 'client-003', name: 'GlobalFinance Ltd' },
  { id: 'client-004', name: 'CloudScale Systems' },
];
