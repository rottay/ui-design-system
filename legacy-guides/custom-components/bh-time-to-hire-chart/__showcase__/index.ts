/**
 * bh-time-to-hire-chart - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { DepartmentConfig, TimeToHireDataPoint } from '../core';

export const MOCK_DEPARTMENTS: DepartmentConfig[] = [
  { name: 'Engineering' },
  { name: 'Design' },
  { name: 'Sales' },
];

export const MOCK_DATA: TimeToHireDataPoint[] = [
  { date: '2025-07', department: 'Engineering', days: 42 },
  { date: '2025-08', department: 'Engineering', days: 38 },
  { date: '2025-09', department: 'Engineering', days: 35 },
  { date: '2025-10', department: 'Engineering', days: 32 },
  { date: '2025-11', department: 'Engineering', days: 29 },
  { date: '2025-12', department: 'Engineering', days: 31 },
  { date: '2025-07', department: 'Design', days: 28 },
  { date: '2025-08', department: 'Design', days: 25 },
  { date: '2025-09', department: 'Design', days: 22 },
  { date: '2025-10', department: 'Design', days: 24 },
  { date: '2025-11', department: 'Design', days: 20 },
  { date: '2025-12', department: 'Design', days: 19 },
  { date: '2025-07', department: 'Sales', days: 18 },
  { date: '2025-08', department: 'Sales', days: 22 },
  { date: '2025-09', department: 'Sales', days: 20 },
  { date: '2025-10', department: 'Sales', days: 16 },
  { date: '2025-11', department: 'Sales', days: 14 },
  { date: '2025-12', department: 'Sales', days: 15 },
];
