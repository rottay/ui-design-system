/**
 * bh-provider-cost - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ProviderCostEntry, CostAlert } from '../core';

export const MOCK_PROVIDERS: ProviderCostEntry[] = [
  { provider: 'OpenAI', model: 'GPT-4o', totalCost: 4280.50, tokenCount: 12500000, avgCostPerRequest: 0.34, budgetLimit: 5000, budgetUsed: 4280.50, trend: 'up' },
  { provider: 'Anthropic', model: 'Claude 3.5 Sonnet', totalCost: 3150.75, tokenCount: 9800000, avgCostPerRequest: 0.28, budgetLimit: 4000, budgetUsed: 3150.75, trend: 'up' },
  { provider: 'Google', model: 'Gemini 1.5 Pro', totalCost: 1820.30, tokenCount: 7200000, avgCostPerRequest: 0.18, budgetLimit: 3000, budgetUsed: 1820.30, trend: 'down' },
  { provider: 'Cohere', model: 'Command R+', totalCost: 890.20, tokenCount: 4500000, avgCostPerRequest: 0.12, budgetLimit: 2000, budgetUsed: 890.20, trend: 'flat' },
  { provider: 'Mistral', model: 'Large 2', totalCost: 542.10, tokenCount: 3100000, avgCostPerRequest: 0.09, budgetLimit: 1500, budgetUsed: 542.10, trend: 'down' },
];

export const MOCK_TOTAL_SPENT = 10683.85;

export const MOCK_ALERTS: CostAlert[] = [
  { id: 'ca-1', provider: 'OpenAI', message: 'OpenAI spend at 86% of monthly budget', severity: 'critical', timestamp: new Date(Date.now() - 1800000) },
  { id: 'ca-2', provider: 'Anthropic', message: 'Anthropic cost trending 22% above forecast', severity: 'warning', timestamp: new Date(Date.now() - 7200000) },
  { id: 'ca-3', provider: 'Google', message: 'Gemini usage normalized after spike', severity: 'info', timestamp: new Date(Date.now() - 14400000) },
];
