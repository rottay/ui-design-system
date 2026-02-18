/**
 * bh-audit-trail - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { AuditEvent, AuditStats } from '../core';

export const MOCK_EVENTS: AuditEvent[] = [
  { id: 'e1', timestamp: new Date(Date.now() - 180000).toISOString(), userName: 'Sofia Martinez', entityType: 'candidate', actionType: 'created', entityName: 'Emily Watson', ipAddress: '192.168.1.42' },
  { id: 'e2', timestamp: new Date(Date.now() - 600000).toISOString(), userName: 'James Chen', entityType: 'job', actionType: 'updated', entityName: 'Sr. Frontend Engineer', ipAddress: '10.0.0.15', beforeState: { status: 'draft', salary: '120k' }, afterState: { status: 'published', salary: '140k' } },
  { id: 'e3', timestamp: new Date(Date.now() - 1500000).toISOString(), userName: 'Priya Sharma', entityType: 'interview', actionType: 'state_change', entityName: 'Panel Review - Alex Kim', ipAddress: '172.16.0.8', beforeState: { stage: 'scheduled', panel: 3 }, afterState: { stage: 'completed', panel: 3 } },
  { id: 'e4', timestamp: new Date(Date.now() - 3000000).toISOString(), userName: 'Marcus Williams', entityType: 'offer', actionType: 'created', entityName: 'Offer #1247 - Rachel Green', ipAddress: '192.168.1.55' },
  { id: 'e5', timestamp: new Date(Date.now() - 5400000).toISOString(), userName: 'Sofia Martinez', entityType: 'team', actionType: 'updated', entityName: 'Engineering Hiring', ipAddress: '192.168.1.42', beforeState: { capacity: 80, members: 5 }, afterState: { capacity: 100, members: 6 } },
  { id: 'e6', timestamp: new Date(Date.now() - 10800000).toISOString(), userName: 'James Chen', entityType: 'candidate', actionType: 'state_change', entityName: 'Tom Baker', ipAddress: '10.0.0.15', beforeState: { stage: 'phone_screen', rating: 3 }, afterState: { stage: 'onsite', rating: 4 }, relatedEvents: ['e3'] },
  { id: 'e7', timestamp: new Date(Date.now() - 21600000).toISOString(), userName: 'Priya Sharma', entityType: 'settings', actionType: 'updated', entityName: 'SLA Configuration', ipAddress: '172.16.0.8', beforeState: { responseTime: 48, escalation: false }, afterState: { responseTime: 24, escalation: true } },
  { id: 'e8', timestamp: new Date(Date.now() - 36000000).toISOString(), userName: 'Marcus Williams', entityType: 'job', actionType: 'deleted', entityName: 'Legacy QA Role', ipAddress: '192.168.1.55' },
];

export const MOCK_STATS: AuditStats = {
  totalEvents: 1247,
  eventsToday: 34,
  mostActiveUser: 'Sofia Martinez',
  mostChangedEntity: 'Candidates',
};
