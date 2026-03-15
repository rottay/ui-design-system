/**
 * bh-job-editor - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type {
  JobEditorStep,
  JobFormData,
  SkillTag,
  ScreeningQuestion,
  ValidationError,
  JobTemplate,
  JobClient,
} from '../core';

// ---------------------------------------------------------------------------
// Steps - with realistic progress state (some completed, one with errors)
// ---------------------------------------------------------------------------

export const DEFAULT_STEPS: JobEditorStep[] = [
  { key: 'basics', label: 'Basics', isComplete: true, isActive: false, hasErrors: false },
  { key: 'description', label: 'Description', isComplete: true, isActive: false, hasErrors: false },
  { key: 'location', label: 'Location', isComplete: true, isActive: false, hasErrors: false },
  { key: 'compensation', label: 'Compensation', isComplete: false, isActive: false, hasErrors: true },
  { key: 'requirements', label: 'Requirements', isComplete: false, isActive: true, hasErrors: false },
  { key: 'configuration', label: 'Configuration', isComplete: false, isActive: false, hasErrors: false },
  { key: 'review', label: 'Review', isComplete: false, isActive: false, hasErrors: false },
];

// ---------------------------------------------------------------------------
// Skills - varied proficiency levels across common tech roles
// ---------------------------------------------------------------------------

export const MOCK_SKILLS: SkillTag[] = [
  { name: 'React', proficiency: 'expert' },
  { name: 'TypeScript', proficiency: 'advanced' },
  { name: 'Node.js', proficiency: 'advanced' },
  { name: 'PostgreSQL', proficiency: 'intermediate' },
  { name: 'AWS', proficiency: 'intermediate' },
  { name: 'GraphQL', proficiency: 'beginner' },
  { name: 'System Design', proficiency: 'advanced' },
  { name: 'CI/CD', proficiency: 'intermediate' },
];

// ---------------------------------------------------------------------------
// Screening Questions - different types (text, boolean, choice)
// ---------------------------------------------------------------------------

export const MOCK_QUESTIONS: ScreeningQuestion[] = [
  {
    id: 'sq-1',
    question: 'How many years of professional experience do you have with React and TypeScript?',
    type: 'text',
    required: true,
  },
  {
    id: 'sq-2',
    question: 'Are you authorized to work in the United States without sponsorship?',
    type: 'boolean',
    required: true,
  },
  {
    id: 'sq-3',
    question: 'What is your preferred work arrangement?',
    type: 'choice',
    required: true,
    options: ['Fully Remote', 'Hybrid (2-3 days in office)', 'On-site', 'Flexible / No Preference'],
  },
  {
    id: 'sq-4',
    question: 'Describe a complex technical challenge you solved in a previous role.',
    type: 'text',
    required: false,
  },
];

// ---------------------------------------------------------------------------
// Validation Errors - sample errors for compensation step
// ---------------------------------------------------------------------------

export const MOCK_ERRORS: ValidationError[] = [
  {
    field: 'salaryMin',
    message: 'Minimum salary must be greater than 0',
    step: 'compensation',
  },
  {
    field: 'salaryMax',
    message: 'Maximum salary must be greater than minimum salary',
    step: 'compensation',
  },
  {
    field: 'currency',
    message: 'Currency is required when salary range is specified',
    step: 'compensation',
  },
];

// ---------------------------------------------------------------------------
// Job Templates - reusable job posting templates
// ---------------------------------------------------------------------------

export const MOCK_TEMPLATES: JobTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Senior Full-Stack Engineer',
    description: 'Standard template for senior full-stack engineering roles with React/Node stack',
  },
  {
    id: 'tpl-2',
    name: 'Staff Engineer - Platform',
    description: 'Staff-level platform engineering role with infrastructure and architecture focus',
  },
  {
    id: 'tpl-3',
    name: 'Engineering Manager',
    description: 'People-manager role for engineering teams, requires technical background',
  },
];

// ---------------------------------------------------------------------------
// Clients - companies that have open requisitions
// ---------------------------------------------------------------------------

export const MOCK_CLIENTS: JobClient[] = [
  {
    id: 'cli-1',
    name: 'Meridian Technologies',
    logo: undefined,
  },
  {
    id: 'cli-2',
    name: 'Apex Financial Solutions',
    logo: undefined,
  },
  {
    id: 'cli-3',
    name: 'NovaBridge Health',
    logo: undefined,
  },
];

// ---------------------------------------------------------------------------
// Primary Form Data - realistic mid-edit state for a Senior Full-Stack role
// ---------------------------------------------------------------------------

export const MOCK_FORM_DATA: JobFormData = {
  // -- Basics --
  title: 'Senior Full-Stack Engineer',
  code: 'ENG-2026-0042',
  department: 'Engineering',
  seniority: 'senior',
  employmentType: 'full-time',
  urgency: 'high',

  // -- Description --
  description:
    'We are looking for a Senior Full-Stack Engineer to join our Platform team. ' +
    'You will own critical product features end-to-end, from database schema design ' +
    'through API development to polished user interfaces. The ideal candidate thrives ' +
    'in a fast-paced environment and is passionate about building scalable, well-tested ' +
    'software that serves millions of users.',
  responsibilities:
    '- Design and implement new product features across the entire stack\n' +
    '- Collaborate with Product, Design, and Data teams to define technical solutions\n' +
    '- Mentor junior engineers through code reviews and pair programming\n' +
    '- Improve developer experience by contributing to internal tooling and CI/CD pipelines\n' +
    '- Participate in on-call rotation and incident response',
  requirements:
    '- 5+ years of professional software development experience\n' +
    '- Strong proficiency with React, TypeScript, and Node.js\n' +
    '- Experience with relational databases (PostgreSQL preferred)\n' +
    '- Familiarity with cloud infrastructure (AWS or GCP)\n' +
    '- Excellent communication and collaboration skills',

  // -- Location --
  primaryLocation: 'New York, NY',
  secondaryLocation: 'San Francisco, CA',
  workArrangement: 'hybrid',

  // -- Compensation --
  salaryMin: 165000,
  salaryMax: 210000,
  currency: 'USD',
  signingBonus: 15000,
  equity: '0.05% - 0.12% ISO',
  benefits: [
    'Health, dental, and vision insurance',
    '401(k) with 4% match',
    'Unlimited PTO',
    'Annual learning budget ($3,000)',
    'Home office stipend',
    'Commuter benefits',
  ],

  // -- Requirements --
  skills: MOCK_SKILLS,
  experienceMin: 5,
  experienceMax: 10,
  educationLevel: "Bachelor's degree in Computer Science or equivalent experience",
  screeningQuestions: MOCK_QUESTIONS,

  // -- Configuration --
  visibility: 'public',
  openings: 2,
  templateId: 'tpl-1',
  clientId: 'cli-1',

  // -- Optional fields --
  workMode: 'hybrid',
  perks: [
    'Weekly team lunches',
    'Annual company offsite',
    'Dog-friendly office',
    'Gym membership reimbursement',
  ],
  timezoneRequirements: 'US Eastern (ET) +/- 3 hours',
  remoteCountries: ['US', 'CA'],
  equityEligible: true,
  bonusEligible: true,
  bonusPercentage: 15,
  hiringUrgency: 'high',
  metaTitle: 'Senior Full-Stack Engineer at Meridian Technologies | BitHire',
  metaDescription:
    'Join Meridian Technologies as a Senior Full-Stack Engineer. ' +
    'Build scalable products with React, TypeScript, and Node.js. ' +
    'Competitive salary ($165K-$210K), equity, and comprehensive benefits.',
  keywords: [
    'senior engineer',
    'full-stack',
    'react',
    'typescript',
    'node.js',
    'new york',
    'hybrid',
  ],
};
