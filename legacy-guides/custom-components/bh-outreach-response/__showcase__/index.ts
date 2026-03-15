/**
 * bh-outreach-response - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ResponseData } from '../core';

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

function generateMockData(): ResponseData[] {
  const data: ResponseData[] = [];
  for (let d = 0; d < 7; d++) {
    for (const h of HOURS) {
      const base = d < 5 ? 0.15 : 0.05;
      const peak = (h >= 9 && h <= 11) || (h >= 14 && h <= 16) ? 0.2 : 0;
      const rate = Math.min(0.6, base + peak + Math.random() * 0.15);
      data.push({ hour: h, dayOfWeek: d, responseRate: Math.round(rate * 100) / 100, count: Math.floor(rate * 50) });
    }
  }
  return data;
}

export const MOCK_DATA = generateMockData();
