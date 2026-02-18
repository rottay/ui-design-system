/**
 * bh-cost-analyzer - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ProviderCost, ModelCost } from '../core';

export const MOCK_PROVIDERS: ProviderCost[] = [
  { providerId: 'openai', providerName: 'OpenAI', totalCost: 4280.50, tokenCount: 12400000, requestCount: 8420, share: 62.3, trend: 'up' as const, trendValue: 8.2 },
  { providerId: 'anthropic', providerName: 'Anthropic', totalCost: 1850.25, tokenCount: 5200000, requestCount: 3150, share: 26.9, trend: 'down' as const, trendValue: 3.1 },
  { providerId: 'google', providerName: 'Google AI', totalCost: 740.80, tokenCount: 3100000, requestCount: 2080, share: 10.8, trend: 'flat' as const, trendValue: 0.4 },
];

export const MOCK_MODELS: ModelCost[] = [
  { modelId: 'gpt4o', modelName: 'GPT-4o', provider: 'OpenAI', totalCost: 2840.30, tokenCount: 8200000, requestCount: 5600, avgCostPerRequest: 0.507 },
  { modelId: 'gpt4o-mini', modelName: 'GPT-4o Mini', provider: 'OpenAI', totalCost: 1440.20, tokenCount: 4200000, requestCount: 2820, avgCostPerRequest: 0.511 },
  { modelId: 'claude-sonnet', modelName: 'Claude 3.5 Sonnet', provider: 'Anthropic', totalCost: 1250.15, tokenCount: 3500000, requestCount: 2100, avgCostPerRequest: 0.595 },
  { modelId: 'claude-haiku', modelName: 'Claude 3 Haiku', provider: 'Anthropic', totalCost: 600.10, tokenCount: 1700000, requestCount: 1050, avgCostPerRequest: 0.572 },
];
