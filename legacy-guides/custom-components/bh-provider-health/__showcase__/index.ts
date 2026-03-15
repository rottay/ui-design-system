/**
 * bh-provider-health - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ProviderHealthItem } from '../core';

export const MOCK_PROVIDERS: ProviderHealthItem[] = [
  {
    id: 'openai', name: 'OpenAI', status: 'healthy', uptimePercent: 99.95, latencyMs: 180,
    latencyTrend: [190, 180, 175, 185, 170, 180, 165, 175, 180, 185, 170, 160],
    errorRate: 0.02, requestCount: 15420, circuitBreaker: 'closed', lastChecked: new Date(),
    incidents: [], region: 'US East',
  },
  {
    id: 'anthropic', name: 'Anthropic', status: 'healthy', uptimePercent: 99.92, latencyMs: 210,
    latencyTrend: [200, 210, 220, 215, 205, 210, 225, 220, 210, 200, 195, 210],
    errorRate: 0.03, requestCount: 8320, circuitBreaker: 'closed', lastChecked: new Date(),
    incidents: [], region: 'US East',
  },
  {
    id: 'elevenlabs', name: 'ElevenLabs', status: 'degraded', uptimePercent: 98.5, latencyMs: 450,
    latencyTrend: [300, 320, 350, 400, 420, 450, 500, 480, 450, 430, 460, 450],
    errorRate: 1.2, requestCount: 4200, circuitBreaker: 'half-open', lastChecked: new Date(),
    incidents: [
      { id: 'inc-1', providerId: 'elevenlabs', type: 'latency_spike', severity: 'warning', title: 'Elevated latency', startedAt: new Date(Date.now() - 3600000) },
    ],
    region: 'EU West',
  },
];
