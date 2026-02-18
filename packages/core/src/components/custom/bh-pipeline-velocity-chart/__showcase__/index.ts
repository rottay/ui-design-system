/**
 * bh-pipeline-velocity-chart - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { VelocityDataPoint } from '../core';

function generateMockData(period = 14): VelocityDataPoint[] {
  const data: VelocityDataPoint[] = [];
  const now = new Date();
  for (let i = period - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const base = 8 + Math.floor(Math.random() * 12);
    data.push({
      date: date.toISOString().split('T')[0],
      count: base,
      target: 12,
    });
  }
  return data;
}

export const MOCK_DATA = generateMockData();

export const MOCK_DATA_30 = generateMockData(30);
