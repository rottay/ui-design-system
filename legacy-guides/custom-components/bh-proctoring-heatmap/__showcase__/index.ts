/**
 * bh-proctoring-heatmap - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { HeatmapDataPoint } from '../core';

function generateMockData(): HeatmapDataPoint[] {
  const data: HeatmapDataPoint[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const isWorkHour = hour >= 9 && hour <= 17;
      const isWeekday = day >= 1 && day <= 5;
      const base = isWorkHour && isWeekday ? 4 : 1;
      data.push({ day, hour, count: Math.floor(Math.random() * base * 3) });
    }
  }
  return data;
}

export const MOCK_DATA = generateMockData();
