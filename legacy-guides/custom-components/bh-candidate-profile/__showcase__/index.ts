/**
 * bh-candidate-profile - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type {
  CandidateStats,
  CandidateApplication,
  CandidateInterview,
  CandidateNote,
  CandidateEvent,
  ScoreCard,
  CandidateCompensation,
  CandidateAvailability,
  CandidateDocumentLinks,
} from '../core';
import type { DBCandidate } from '@rottay/recruiter';

export const DEFAULT_CANDIDATE = {
  id: 'c-1', firstName: 'Sarah', lastName: 'Johnson', avatarUrl: null,
  currentTitle: 'Senior Frontend Engineer', currentCompany: 'Google',
  currentLocation: { city: 'San Francisco', state: 'CA' },
  email: 'sarah.j@google.com', phone: '+1 (415) 555-0127',
  source: 'linkedin', status: 'active',
  skills: [
    { name: 'React', level: 'expert', yearsOfExperience: 6 },
    { name: 'TypeScript', level: 'expert', yearsOfExperience: 5 },
    { name: 'Next.js', level: 'advanced', yearsOfExperience: 4 },
    { name: 'GraphQL', level: 'advanced', yearsOfExperience: 3 },
    { name: 'Node.js', level: 'intermediate', yearsOfExperience: 5 },
    { name: 'System Design', level: 'intermediate', yearsOfExperience: 3 },
    { name: 'Testing', level: 'advanced', yearsOfExperience: 5 },
    { name: 'CI/CD', level: 'intermediate', yearsOfExperience: 3 },
  ],
  languages: [
    { language: 'English', proficiency: 'Native' },
    { language: 'Spanish', proficiency: 'Conversational' },
  ],
  linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
  githubUrl: 'https://github.com/sarahjohnson',
  portfolioUrl: 'https://sarahjohnson.dev',
  websiteUrl: null,
  expectedSalaryMin: 180000, expectedSalaryMax: 220000, expectedSalaryCurrency: 'USD',
  yearsOfExperience: 8,
  resumeUrl: null,
} as unknown as DBCandidate;

export const DEFAULT_STATS: CandidateStats = {
  activeApplications: 3,
  totalInterviews: 7,
  avgScore: 91,
  lastActivityDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
  aiMatchScore: 94,
  screeningScore: 89,
  technicalScore: 92,
  culturalScore: 87,
};

export const DEFAULT_APPLICATIONS: CandidateApplication[] = [
  { id: 'a-1', jobName: 'Staff Frontend Engineer', stage: 'Technical Interview', scorePercent: 92, pipelineProgress: 0.6, recruiterName: 'Alex Rivera', status: 'interviewing' },
  { id: 'a-2', jobName: 'Frontend Lead', stage: 'Offer Pending', scorePercent: 88, pipelineProgress: 0.9, recruiterName: 'Jordan Park', status: 'offer_pending' },
  { id: 'a-3', jobName: 'Senior React Developer', stage: 'Screening', scorePercent: 75, pipelineProgress: 0.2, recruiterName: 'Sam Lee', status: 'screening' },
];

export const DEFAULT_INTERVIEWS: CandidateInterview[] = [
  { id: 'i-1', date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), type: 'ai', status: 'scheduled', duration: '45 min', hasReplay: false },
  { id: 'i-2', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), type: 'human', status: 'completed', scorePercent: 91, duration: '60 min', hasReplay: true },
  { id: 'i-3', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), type: 'ai', status: 'completed', scorePercent: 88, duration: '30 min', hasReplay: true },
];

export const DEFAULT_NOTES: CandidateNote[] = [
  { id: 'n-1', authorName: 'Alex Rivera', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), content: 'Strong technical skills, excellent communication. Recommend advancing to final round.', isEditable: true },
  { id: 'n-2', authorName: 'Jordan Park', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), content: 'Initial screening went well. Candidate is enthusiastic about the role and team culture.', isEditable: false },
];

export const DEFAULT_EVENTS: CandidateEvent[] = [
  { id: 'e-1', type: 'interview', message: 'Completed AI interview for Staff Frontend Engineer', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), entityName: 'Staff Frontend Engineer' },
  { id: 'e-2', type: 'application', message: 'Applied to Frontend Lead position', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), entityName: 'Frontend Lead' },
  { id: 'e-3', type: 'note', message: 'Alex Rivera added a note', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: 'e-4', type: 'stage', message: 'Moved to Technical Interview stage', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), entityName: 'Staff Frontend Engineer' },
];

export const DEFAULT_SCORE_CARDS: ScoreCard[] = [
  {
    applicationId: 'a-1',
    jobName: 'Staff Frontend Engineer',
    overallScore: 92,
    dimensions: [
      { name: 'React & TypeScript', score: 96, weight: 0.3 },
      { name: 'System Design', score: 88, weight: 0.25 },
      { name: 'Problem Solving', score: 91, weight: 0.2 },
      { name: 'Communication', score: 94, weight: 0.15 },
      { name: 'Leadership', score: 89, weight: 0.1 },
    ],
    date: '2026-02-10',
  },
  {
    applicationId: 'a-2',
    jobName: 'Frontend Lead',
    overallScore: 88,
    dimensions: [
      { name: 'Technical Depth', score: 90, weight: 0.25 },
      { name: 'Team Management', score: 82, weight: 0.25 },
      { name: 'Architecture', score: 91, weight: 0.2 },
      { name: 'Stakeholder Communication', score: 87, weight: 0.15 },
      { name: 'Strategic Thinking', score: 86, weight: 0.15 },
    ],
    date: '2026-02-07',
  },
  {
    applicationId: 'a-3',
    jobName: 'Senior React Developer',
    overallScore: 75,
    dimensions: [
      { name: 'React Proficiency', score: 94, weight: 0.35 },
      { name: 'Testing & QA', score: 78, weight: 0.2 },
      { name: 'Performance Optimization', score: 72, weight: 0.2 },
      { name: 'Collaboration', score: 68, weight: 0.15 },
      { name: 'Domain Knowledge', score: 55, weight: 0.1 },
    ],
    date: '2026-02-03',
  },
];

export const DEFAULT_COMPENSATION: CandidateCompensation = {
  currentSalary: 195000,
  currentSalaryCurrency: 'USD',
  expectedSalaryMin: 180000,
  expectedSalaryMax: 220000,
  expectedSalaryCurrency: 'USD',
};

export const DEFAULT_AVAILABILITY: CandidateAvailability = {
  availableFrom: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
  noticePeriodDays: 30,
  requiresVisaSponsorship: false,
  workAuthorization: 'US Citizen',
  willingToRelocate: true,
  relocationPreferences: ['New York', 'Seattle', 'Austin'],
};

export const DEFAULT_DOCUMENT_LINKS: CandidateDocumentLinks = {
  portfolioUrl: 'https://sarahjohnson.dev',
  githubUrl: 'https://github.com/sarahjohnson',
  websiteUrl: 'https://sarahjohnson.dev/blog',
  linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
};
