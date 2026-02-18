/**
 * bh-calendar-heatmap - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { HeatmapDay } from '../core';

function generateMockDays(): HeatmapDay[] {
  const days: HeatmapDay[] = [];
  const now = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const base = isWeekend ? 0 : Math.floor(Math.random() * 6);
    const count = Math.random() > 0.3 ? base : 0;
    days.push({ date: dateStr, count });
  }
  return days;
}

export const MOCK_DAYS = generateMockDays();
