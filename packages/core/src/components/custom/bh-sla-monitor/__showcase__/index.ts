/**
 * bh-sla-monitor - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { SlaCompliance, SlaBreach, StageSla, AtRiskItem, SlaHistoryPoint, SlaConfig } from '../core';

export const MOCK_COMPLIANCE: SlaCompliance = { percentage: 87.4, trend: 'up' };

export const MOCK_BREACHES: SlaBreach[] = [
  { id: 'b1', jobName: 'Sr. Backend Engineer', stageName: 'Technical Interview', slaHours: 48, actualHours: 72, assignedRecruiter: 'Sofia Martinez' },
  { id: 'b2', jobName: 'Product Designer', stageName: 'Portfolio Review', slaHours: 24, actualHours: 38, assignedRecruiter: 'James Chen' },
  { id: 'b3', jobName: 'Data Analyst', stageName: 'Offer Approval', slaHours: 24, actualHours: 52, assignedRecruiter: 'Priya Sharma' },
  { id: 'b4', jobName: 'DevOps Engineer', stageName: 'Screening Call', slaHours: 24, actualHours: 31, assignedRecruiter: 'Marcus Williams' },
];

export const MOCK_STAGE_SLA: StageSla[] = [
  { stageName: 'Application Review', avgHours: 16, limitHours: 24, status: 'green' },
  { stageName: 'Screening Call', avgHours: 22, limitHours: 24, status: 'yellow' },
  { stageName: 'Technical Interview', avgHours: 38, limitHours: 48, status: 'yellow' },
  { stageName: 'Panel Interview', avgHours: 44, limitHours: 72, status: 'green' },
  { stageName: 'Offer Approval', avgHours: 20, limitHours: 24, status: 'yellow' },
  { stageName: 'Background Check', avgHours: 96, limitHours: 120, status: 'green' },
];

export const MOCK_AT_RISK: AtRiskItem[] = [
  { id: 'r1', type: 'candidate', name: 'Elena Vasquez', stage: 'Technical Interview', hoursRemaining: 4, assignee: 'Sofia Martinez' },
  { id: 'r2', type: 'interview', name: 'Panel: Alex Kim', stage: 'Panel Interview', hoursRemaining: 8, assignee: 'James Chen' },
  { id: 'r3', type: 'candidate', name: 'David Park', stage: 'Offer Approval', hoursRemaining: 2, assignee: 'Priya Sharma' },
  { id: 'r4', type: 'candidate', name: 'Lisa Thompson', stage: 'Screening Call', hoursRemaining: 6, assignee: 'Marcus Williams' },
];

export const MOCK_HISTORY: SlaHistoryPoint[] = [
  { date: 'Jan', compliance: 82 }, { date: 'Feb', compliance: 84 }, { date: 'Mar', compliance: 81 },
  { date: 'Apr', compliance: 85 }, { date: 'May', compliance: 83 }, { date: 'Jun', compliance: 86 },
  { date: 'Jul', compliance: 88 }, { date: 'Aug', compliance: 85 }, { date: 'Sep', compliance: 87 },
  { date: 'Oct', compliance: 86 }, { date: 'Nov', compliance: 88 }, { date: 'Dec', compliance: 87 },
];

/* ── SLA Configuration ──────────────────────────────────────────────── */

export const MOCK_SLA_CONFIG: SlaConfig[] = [
  { stageId: 'stage-review', stageName: 'Application Review', limitHours: 24, alertRecipients: ['recruiting-lead@acme.com', 'hiring-ops@acme.com'], escalationRules: 'Escalate to hiring manager after 4h past SLA', enabled: true, warningThresholdPercent: 75, notifyOnBreach: true },
  { stageId: 'stage-screen', stageName: 'Screening Call', limitHours: 48, alertRecipients: ['recruiting-lead@acme.com'], escalationRules: 'Auto-reassign if recruiter unavailable for 8h', enabled: true, warningThresholdPercent: 80, notifyOnBreach: true },
  { stageId: 'stage-interview', stageName: 'Technical Interview', limitHours: 72, alertRecipients: ['recruiting-lead@acme.com', 'eng-hiring@acme.com'], escalationRules: 'Escalate to VP Engineering after 12h past SLA', enabled: true, warningThresholdPercent: 70, notifyOnBreach: true },
  { stageId: 'stage-offer', stageName: 'Offer Approval', limitHours: 24, alertRecipients: ['recruiting-lead@acme.com', 'cfo@acme.com'], escalationRules: 'Escalate to CEO if offer not approved within 6h past SLA', enabled: true, warningThresholdPercent: 60, notifyOnBreach: true },
];

/** Breach summary mock data */
export const MOCK_TOTAL_BREACHES = 12;
export const MOCK_RESOLVED_BREACHES = 8;
export const MOCK_BREACH_FILTER = 'all' as const;
