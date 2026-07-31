import { readFileSync } from 'node:fs';

import postcss, { type AtRule } from 'postcss';
import { describe, expect, it } from 'vitest';

const ACTIVITY_CSS_PATH = '../../../../foundation/tokens/css/presentation/components/skin/dashboard-activity-interactions.css';
const METRICS_CSS_PATH = '../../../../foundation/tokens/css/presentation/components/skin/dashboard-metrics-interactions.css';
const DATA_TERMINAL_CSS_PATH = '../../../../foundation/tokens/css/presentation/components/skin/data-terminal-card-keyframes.css';
const STATS_HEADER_CSS_PATH = '../../../../foundation/tokens/css/presentation/components/skin/stats-header-keyframes.css';
const DATA_TERMINAL_SKIN_PATH = '../../../../foundation/tokens/css/presentation/components/skin/data-terminal-card.css';
const STATS_HEADER_SKIN_PATH = '../../../../foundation/tokens/css/presentation/components/skin/stats-header.css';
const ANIMATION_OWNER_PATHS = [
  ACTIVITY_CSS_PATH,
  METRICS_CSS_PATH,
  DATA_TERMINAL_SKIN_PATH,
  STATS_HEADER_SKIN_PATH,
] as const;

const COMPONENT_SOURCES = [
  '../insights/presentation/activity/cards/index.tsx',
  '../insights/presentation/activity/compact/index.tsx',
  '../insights/presentation/activity/ticker/index.tsx',
  '../insights/presentation/activity/timeline/index.tsx',
  '../insights/presentation/metrics/cards/index.tsx',
  '../insights/presentation/metrics/chart/index.tsx',
  '../insights/presentation/metrics/minimal/index.tsx',
  '../insights/presentation/metrics/rows/index.tsx',
  '../data-terminal-card/index.tsx',
  '../stats-header/runtime/rendering/index.tsx',
] as const;

const CSS_CONTRACTS = [
  {
    name: 'dashboard activity interactions',
    path: ACTIVITY_CSS_PATH,
    expectedPaintDeclarations: 43,
  },
  {
    name: 'dashboard metrics interactions',
    path: METRICS_CSS_PATH,
    expectedPaintDeclarations: 44,
  },
  {
    name: 'DataTerminalCard keyframes',
    path: DATA_TERMINAL_CSS_PATH,
    expectedPaintDeclarations: 20,
  },
  {
    name: 'StatsHeader keyframes',
    path: STATS_HEADER_CSS_PATH,
    expectedPaintDeclarations: 3,
  },
] as const;

const EXPECTED_KEYFRAMES = [
  'ds-activity-cards-card-slide-in',
  'ds-activity-cards-dot-pulse',
  'ds-activity-compact-slide-in-right',
  'ds-activity-ticker-live-glow',
  'ds-activity-ticker-progress-fill',
  'ds-activity-timeline-item-slide-in',
  'ds-activity-timeline-live-glow',
  'ds-metrics-cards-card-enter',
  'ds-metrics-cards-dot-glow',
  'ds-metrics-chart-glow',
  'ds-metrics-chart-slide-in',
  'ds-metrics-minimal-glow',
  'ds-metrics-minimal-slide-in',
  'ds-metrics-rows-dot-glow',
  'ds-metrics-rows-row-slide-in',
  'ds-metrics-rows-shimmer',
  'dtc-blink',
  'dtc-breathe',
  'dtc-data-tick',
  'dtc-fade-in',
  'dtc-flow',
  'dtc-glow',
  'dtc-heartbeat',
  'dtc-live-pulse',
  'dtc-number-glow',
  'dtc-pulse',
  'dtc-scan',
  'dtc-slide',
  'dtc-typing',
  'dtc-wave',
  'pulse-dot-ping',
] as const;

const INTERACTION_COMPONENTS = [
  {
    sourcePath: '../insights/presentation/activity/cards/index.tsx',
    cssPath: ACTIVITY_CSS_PATH,
    scope: 'ds-activity-cards',
  },
  {
    sourcePath: '../insights/presentation/activity/compact/index.tsx',
    cssPath: ACTIVITY_CSS_PATH,
    scope: 'ds-activity-compact',
  },
  {
    sourcePath: '../insights/presentation/activity/ticker/index.tsx',
    cssPath: ACTIVITY_CSS_PATH,
    scope: 'ds-activity-ticker',
  },
  {
    sourcePath: '../insights/presentation/activity/timeline/index.tsx',
    cssPath: ACTIVITY_CSS_PATH,
    scope: 'ds-activity-timeline',
  },
  {
    sourcePath: '../insights/presentation/metrics/cards/index.tsx',
    cssPath: METRICS_CSS_PATH,
    scope: 'ds-metrics-cards',
  },
  {
    sourcePath: '../insights/presentation/metrics/chart/index.tsx',
    cssPath: METRICS_CSS_PATH,
    scope: 'ds-metrics-chart',
  },
  {
    sourcePath: '../insights/presentation/metrics/minimal/index.tsx',
    cssPath: METRICS_CSS_PATH,
    scope: 'ds-metrics-minimal',
  },
  {
    sourcePath: '../insights/presentation/metrics/rows/index.tsx',
    cssPath: METRICS_CSS_PATH,
    scope: 'ds-metrics-rows',
  },
] as const;

const LIVE_ANIMATION_CONSUMERS = [
  {
    kind: 'css',
    name: 'ds-activity-ticker-live-glow',
    path: ACTIVITY_CSS_PATH,
    selector: ':where(.ds-activity-ticker) .live-indicator',
    animation: 'ds-activity-ticker-live-glow 1.5s ease-in-out infinite',
  },
  {
    kind: 'css',
    name: 'ds-activity-ticker-progress-fill',
    path: ACTIVITY_CSS_PATH,
    selector: ':where(.ds-activity-ticker) .ticker-progress',
    animation: 'ds-activity-ticker-progress-fill 5s linear',
  },
  {
    kind: 'css',
    name: 'ds-activity-timeline-item-slide-in',
    path: ACTIVITY_CSS_PATH,
    selector: ':where(.ds-activity-timeline) .activity-item-v3',
    animation: 'ds-activity-timeline-item-slide-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
  },
  {
    kind: 'css',
    name: 'ds-activity-timeline-live-glow',
    path: ACTIVITY_CSS_PATH,
    selector: ':where(.ds-activity-timeline) .live-indicator',
    animation: 'ds-activity-timeline-live-glow 1.5s ease-in-out infinite',
  },
  {
    kind: 'css',
    name: 'ds-activity-compact-slide-in-right',
    path: ACTIVITY_CSS_PATH,
    selector: ':where(.ds-activity-compact) .activity-compact-item-v3',
    animation: 'ds-activity-compact-slide-in-right 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
  },
  {
    kind: 'css',
    name: 'ds-activity-cards-card-slide-in',
    path: ACTIVITY_CSS_PATH,
    selector: ':where(.ds-activity-cards) .activity-card-item-v3',
    animation: 'ds-activity-cards-card-slide-in 0.4s ease-out both',
  },
  {
    kind: 'css',
    name: 'ds-activity-cards-dot-pulse',
    path: ACTIVITY_CSS_PATH,
    selector: ':where(.ds-activity-cards) .time-dot',
    animation: 'ds-activity-cards-dot-pulse 2s ease-in-out infinite',
  },
  {
    kind: 'css',
    name: 'ds-metrics-minimal-slide-in',
    path: METRICS_CSS_PATH,
    selector: ':where(.ds-metrics-minimal) .minimal-metric-row',
    animation: 'ds-metrics-minimal-slide-in 0.4s ease-out both',
  },
  {
    kind: 'css',
    name: 'ds-metrics-minimal-glow',
    path: METRICS_CSS_PATH,
    selector: ':where(.ds-metrics-minimal) .live-dot',
    animation: 'ds-metrics-minimal-glow 2s ease-in-out infinite',
  },
  {
    kind: 'css',
    name: 'ds-metrics-cards-card-enter',
    path: METRICS_CSS_PATH,
    selector: ':where(.ds-metrics-cards) .metric-card-v3',
    animation: 'ds-metrics-cards-card-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both',
  },
  {
    kind: 'css',
    name: 'ds-metrics-cards-dot-glow',
    path: METRICS_CSS_PATH,
    selector: ':where(.ds-metrics-cards) .live-dot-v3',
    animation: 'ds-metrics-cards-dot-glow 1.5s ease-in-out infinite',
  },
  {
    kind: 'css',
    name: 'ds-metrics-chart-slide-in',
    path: METRICS_CSS_PATH,
    selector: ':where(.ds-metrics-chart) .metric-chart-row-v3',
    animation: 'ds-metrics-chart-slide-in 0.4s ease-out both',
  },
  {
    kind: 'css',
    name: 'ds-metrics-chart-glow',
    path: METRICS_CSS_PATH,
    selector: ':where(.ds-metrics-chart) .live-dot-chart',
    animation: 'ds-metrics-chart-glow 2s ease-in-out infinite',
  },
  {
    kind: 'css',
    name: 'ds-metrics-rows-row-slide-in',
    path: METRICS_CSS_PATH,
    selector: ':where(.ds-metrics-rows) .metric-row-v3',
    animation: 'ds-metrics-rows-row-slide-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
  },
  {
    kind: 'css',
    name: 'ds-metrics-rows-shimmer',
    path: METRICS_CSS_PATH,
    selector: ':where(.ds-metrics-rows) .metric-row-v3:hover .row-shimmer',
    animation: 'ds-metrics-rows-shimmer 0.8s ease-in-out',
  },
  {
    kind: 'css',
    name: 'ds-metrics-rows-dot-glow',
    path: METRICS_CSS_PATH,
    selector: ':where(.ds-metrics-rows) .live-dot-v3',
    animation: 'ds-metrics-rows-dot-glow 1.5s ease-in-out infinite',
  },
  {
    kind: 'source',
    name: 'dtc-live-pulse',
    path: '../data-terminal-card/index.tsx',
    animation: 'dtc-live-pulse 2s ease-in-out infinite',
  },
  {
    kind: 'source',
    name: 'dtc-data-tick',
    path: '../data-terminal-card/index.tsx',
    animation: 'dtc-data-tick 1s ease-in-out infinite ${i * 0.15}s',
  },
  {
    kind: 'source',
    name: 'dtc-wave',
    path: '../data-terminal-card/index.tsx',
    animation: 'dtc-wave 2s ease-in-out infinite',
  },
  {
    kind: 'source',
    name: 'dtc-fade-in',
    path: '../data-terminal-card/index.tsx',
    animation: 'dtc-fade-in 0.4s ease-out',
  },
  {
    kind: 'source',
    name: 'dtc-heartbeat',
    path: '../data-terminal-card/index.tsx',
    animation: 'dtc-heartbeat 1.5s ease-in-out infinite',
  },
  {
    kind: 'source',
    name: 'dtc-typing',
    path: '../data-terminal-card/index.tsx',
    animation: 'dtc-typing 1s step-end infinite',
  },
  {
    kind: 'source',
    name: 'dtc-breathe',
    path: '../data-terminal-card/index.tsx',
    animation: 'dtc-breathe 4s ease-in-out infinite',
  },
  {
    kind: 'source',
    name: 'dtc-scan',
    path: '../data-terminal-card/index.tsx',
    animation: 'dtc-scan 5s linear infinite',
  },
  {
    kind: 'source',
    name: 'dtc-pulse',
    path: '../data-terminal-card/index.tsx',
    animation: 'dtc-pulse 3s ease-in-out infinite',
  },
  {
    kind: 'source',
    name: 'dtc-slide',
    path: '../data-terminal-card/index.tsx',
    animation: 'dtc-slide 4s linear infinite',
  },
  {
    kind: 'source',
    name: 'dtc-flow',
    path: '../data-terminal-card/index.tsx',
    animation: 'dtc-flow 40s linear infinite',
  },
  {
    kind: 'source',
    name: 'pulse-dot-ping',
    path: '../stats-header/runtime/rendering/index.tsx',
    animation: 'pulse-dot-ping 400ms ease ${i * 50}ms',
  },
] as const;

const INTENTIONALLY_DEAD_KEYFRAMES = ['dtc-glow', 'dtc-blink', 'dtc-number-glow'] as const;

const KEYFRAME_FRAME_SEMANTICS = {
  'ds-activity-ticker-live-glow': {
    '0%, 100%': {
      'box-shadow': '0 0 4px var(--ds-color-success), 0 0 8px var(--ds-color-success)',
      opacity: '1',
    },
    '50%': {
      'box-shadow': '0 0 8px var(--ds-color-success), 0 0 16px var(--ds-color-success)',
      opacity: '0.6',
    },
  },
  'ds-activity-ticker-progress-fill': {
    from: { width: '0%' },
    to: { width: '100%' },
  },
  'ds-activity-timeline-item-slide-in': {
    from: { opacity: '0', transform: 'translateX(-20px)' },
    to: { opacity: '1', transform: 'translateX(0)' },
  },
  'ds-activity-timeline-live-glow': {
    '0%, 100%': {
      'box-shadow': '0 0 4px var(--ds-color-success)',
      opacity: '1',
    },
    '50%': { 'box-shadow': '0 0 10px var(--ds-color-success)', opacity: '0.7' },
  },
  'ds-activity-compact-slide-in-right': {
    from: { opacity: '0', transform: 'translateX(-20px)' },
    to: { opacity: '1', transform: 'translateX(0)' },
  },
  'ds-activity-cards-card-slide-in': {
    from: { opacity: '0', transform: 'translateX(-10px)' },
    to: { opacity: '1', transform: 'translateX(0)' },
  },
  'ds-activity-cards-dot-pulse': {
    '0%, 100%': { transform: 'scale(1)', opacity: '1' },
    '50%': { transform: 'scale(1.2)', opacity: '0.7' },
  },
  'ds-metrics-minimal-slide-in': {
    from: { opacity: '0', transform: 'translateX(-10px)' },
    to: { opacity: '1', transform: 'translateX(0)' },
  },
  'ds-metrics-minimal-glow': {
    '0%, 100%': {
      'box-shadow':
        '0 0 4px var(--ds-signal-card-badge-color, var(--ds-color-success)), 0 0 8px var(--ds-signal-card-badge-color, var(--ds-color-success))',
    },
    '50%': {
      'box-shadow':
        '0 0 8px var(--ds-signal-card-badge-color, var(--ds-color-success)), 0 0 16px var(--ds-signal-card-badge-color, var(--ds-color-success))',
    },
  },
  'ds-metrics-cards-card-enter': {
    from: { opacity: '0', transform: 'translateY(30px) scale(0.9)' },
    to: { opacity: '1', transform: 'translateY(0) scale(1)' },
  },
  'ds-metrics-cards-dot-glow': {
    '0%, 100%': {
      'box-shadow':
        '0 0 4px var(--ds-signal-card-badge-color, var(--ds-color-success)), 0 0 8px var(--ds-signal-card-badge-color, var(--ds-color-success))',
    },
    '50%': {
      'box-shadow':
        '0 0 8px var(--ds-signal-card-badge-color, var(--ds-color-success)), 0 0 16px var(--ds-signal-card-badge-color, var(--ds-color-success))',
    },
  },
  'ds-metrics-chart-slide-in': {
    from: { opacity: '0', transform: 'translateX(-10px)' },
    to: { opacity: '1', transform: 'translateX(0)' },
  },
  'ds-metrics-chart-glow': {
    '0%, 100%': {
      'box-shadow':
        '0 0 3px var(--ds-signal-card-badge-color, var(--ds-color-success)), 0 0 6px var(--ds-signal-card-badge-color, var(--ds-color-success))',
    },
    '50%': {
      'box-shadow':
        '0 0 6px var(--ds-signal-card-badge-color, var(--ds-color-success)), 0 0 12px var(--ds-signal-card-badge-color, var(--ds-color-success))',
    },
  },
  'ds-metrics-rows-row-slide-in': {
    from: { opacity: '0', transform: 'translateX(-30px)' },
    to: { opacity: '1', transform: 'translateX(0)' },
  },
  'ds-metrics-rows-shimmer': {
    from: { left: '-100%' },
    to: { left: '100%' },
  },
  'ds-metrics-rows-dot-glow': {
    '0%, 100%': {
      'box-shadow':
        '0 0 4px var(--ds-signal-card-badge-color, var(--ds-color-success)), 0 0 8px var(--ds-signal-card-badge-color, var(--ds-color-success))',
    },
    '50%': {
      'box-shadow':
        '0 0 8px var(--ds-signal-card-badge-color, var(--ds-color-success)), 0 0 16px var(--ds-signal-card-badge-color, var(--ds-color-success))',
    },
  },
  'dtc-fade-in': {
    from: { opacity: '0', transform: 'translateY(8px)' },
    to: { opacity: '1', transform: 'translateY(0)' },
  },
  'dtc-pulse': {
    '0%, 100%': { opacity: '0.3' },
    '50%': { opacity: '1' },
  },
  'dtc-heartbeat': {
    '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
    '50%': { transform: 'scale(1.2)', opacity: '1' },
  },
  'dtc-breathe': {
    '0%, 100%': { opacity: '0.4' },
    '50%': { opacity: '0.8' },
  },
  'dtc-scan': {
    '0%': { transform: 'translateY(-100%)', opacity: '0' },
    '50%': { opacity: '0.5' },
    '100%': { transform: 'translateY(300%)', opacity: '0' },
  },
  'dtc-glow': {
    '0%, 100%': { 'box-shadow': '0 0 2px currentColor' },
    '50%': { 'box-shadow': '0 0 8px currentColor, 0 0 12px currentColor' },
  },
  'dtc-slide': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(400%)' },
  },
  'dtc-blink': {
    '0%, 90%, 100%': { opacity: '1' },
    '95%': { opacity: '0.2' },
  },
  'dtc-live-pulse': {
    '0%, 100%': { transform: 'scale(1)', 'box-shadow': '0 0 0 0 currentColor' },
    '50%': { transform: 'scale(1.1)', 'box-shadow': '0 0 0 4px transparent' },
  },
  'dtc-data-tick': {
    '0%, 100%': { opacity: '0.6' },
    '10%': { opacity: '1' },
    '20%': { opacity: '0.6' },
  },
  'dtc-wave': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' },
  },
  'dtc-typing': {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0' },
  },
  'dtc-flow': {
    '0%': { 'background-position': '0 0' },
    '100%': { 'background-position': '40px 40px' },
  },
  'dtc-number-glow': {
    '0%, 100%': { 'text-shadow': '0 0 10px currentColor' },
    '50%': { 'text-shadow': '0 0 20px currentColor, 0 0 30px currentColor' },
  },
  'pulse-dot-ping': {
    '0%': { transform: 'scale(1)', opacity: '1' },
    '50%': { transform: 'scale(1.8)', opacity: '0.4' },
    '100%': { transform: 'scale(1)', opacity: '1' },
  },
} satisfies Record<(typeof EXPECTED_KEYFRAMES)[number], Record<string, Record<string, string>>>;

const CRITICAL_RULE_SEMANTICS = [
  {
    path: ACTIVITY_CSS_PATH,
    selector: ':where(.ds-activity-ticker) .nav-button:hover',
    declarations: {
      background: 'var(--ds-color-primary-100)',
      'border-color': 'var(--ds-color-primary-200)',
      transform: 'scale(1.1)',
      'box-shadow': '0 4px 12px var(--ds-color-primary-100)',
    },
  },
  {
    path: ACTIVITY_CSS_PATH,
    selector: ':where(.ds-activity-timeline) .view-all-link:hover',
    declarations: {
      background: 'var(--ds-color-primary-200)',
      transform: 'translateX(2px)',
    },
  },
  {
    path: ACTIVITY_CSS_PATH,
    selector: ':where(.ds-activity-compact) .activity-compact-item-v3:hover',
    declarations: {
      background: 'var(--ds-color-primary-50)',
      'border-color': 'var(--ds-color-primary-200)',
      transform: 'translateX(6px)',
      'box-shadow': '-4px 0 16px var(--ds-color-primary-100)',
    },
  },
  {
    path: ACTIVITY_CSS_PATH,
    selector: ':where(.ds-activity-cards) .activity-card-item-v3:hover',
    declarations: {
      background: 'var(--ds-color-primary-50)',
      'border-color': 'var(--ds-color-primary-200)',
      transform: 'translateX(4px)',
    },
  },
  {
    path: METRICS_CSS_PATH,
    selector: ':where(.ds-metrics-minimal) .minimal-metric-row:hover',
    declarations: {
      background: 'var(--ds-signal-card-section-alt-bg, var(--ds-color-bg-secondary))',
      'border-color':
        'var(--ds-metric-card-border-hover, var(--ds-signal-card-border-hover, var(--ds-color-primary-200)))',
      'box-shadow':
        'var(--ds-metric-card-shadow-hover, var(--ds-metric-card-shadow, var(--ds-signal-card-shadow-hover, none)))',
      transform: 'translateX(4px)',
    },
  },
  {
    path: METRICS_CSS_PATH,
    selector: ':where(.ds-metrics-cards) .metric-card-v3:hover',
    declarations: {
      'border-color':
        'var(--ds-metric-card-border-hover, var(--ds-signal-card-border-hover, var(--ds-color-primary-200)))',
      transform: 'translateY(-6px) scale(1.02)',
      'box-shadow':
        'var(--ds-metric-card-shadow-hover, var(--ds-metric-card-shadow, var(--ds-signal-card-shadow-hover, none)))',
    },
  },
  {
    path: METRICS_CSS_PATH,
    selector: ':where(.ds-metrics-cards) .metric-card-v3:hover .metric-value-v3',
    declarations: {
      color: 'var(--ds-metric-card-value-color-hover, var(--ds-signal-card-accent, var(--ds-color-primary)))',
    },
  },
  {
    path: METRICS_CSS_PATH,
    selector: ':where(.ds-metrics-chart) .metric-chart-row-v3:hover',
    declarations: {
      background: 'var(--ds-signal-card-section-alt-bg, var(--ds-color-bg-secondary))',
      'border-color':
        'var(--ds-metric-card-border-hover, var(--ds-signal-card-border-hover, var(--ds-color-primary-200)))',
      'box-shadow':
        'var(--ds-metric-card-shadow-hover, var(--ds-metric-card-shadow, var(--ds-signal-card-shadow-hover, none)))',
      transform: 'translateX(4px)',
    },
  },
  {
    path: METRICS_CSS_PATH,
    selector: ':where(.ds-metrics-rows) .metric-row-v3:hover',
    declarations: {
      'border-color':
        'var(--ds-metric-card-border-hover, var(--ds-signal-card-border-hover, var(--ds-color-primary-200)))',
      transform: 'translateX(6px)',
      'box-shadow':
        'var(--ds-metric-card-shadow-hover, var(--ds-metric-card-shadow, var(--ds-signal-card-shadow-hover, none)))',
    },
  },
  {
    path: METRICS_CSS_PATH,
    selector: ':where(.ds-metrics-rows) .metric-row-v3:hover .metric-row-value',
    declarations: {
      color: 'var(--ds-metric-card-value-color-hover, var(--ds-signal-card-accent, var(--ds-color-primary)))',
    },
  },
] as const;

function readRelative(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

function parseRelativeCss(path: string) {
  return postcss.parse(readRelative(path), { from: path });
}

function declarationRecord(container: {
  walkDecls: (callback: (declaration: { prop: string; value: string }) => void) => void;
}): Record<string, string> {
  const declarations: Record<string, string> = {};
  container.walkDecls((declaration) => {
    declarations[declaration.prop] = declaration.value;
  });
  return declarations;
}

function declarationsForSelector(path: string, selector: string): Record<string, string> {
  const root = parseRelativeCss(path);
  const matches: Record<string, string>[] = [];

  root.walkRules((rule) => {
    if (rule.selector === selector) matches.push(declarationRecord(rule));
  });

  expect(matches, `${path}: ${selector}`).toHaveLength(1);
  return matches[0]!;
}

function keyframeFrames(keyframes: AtRule): Record<string, Record<string, string>> {
  const frames: Record<string, Record<string, string>> = {};

  for (const node of keyframes.nodes ?? []) {
    if (node.type !== 'rule') continue;
    frames[node.selector] = declarationRecord(node);
  }

  return frames;
}

const EXACT_PAINT_PROPERTIES = new Set([
  '-webkit-backdrop-filter',
  'accent-color',
  'backdrop-filter',
  'box-shadow',
  'color',
  'fill',
  'filter',
  'stroke',
  'text-shadow',
  'transform',
]);

function isPaintDeclaration(property: string): boolean {
  if (property.startsWith('--') || property === 'border-collapse' || property === 'border-spacing') {
    return false;
  }

  return (
    EXACT_PAINT_PROPERTIES.has(property) ||
    property.startsWith('background') ||
    property.startsWith('border') ||
    property.startsWith('outline')
  );
}

function countPaintDeclarations(path: string): number {
  let count = 0;
  parseRelativeCss(path).walkDecls((declaration) => {
    if (isPaintDeclaration(declaration.prop)) count += 1;
  });
  return count;
}

describe('dashboard embedded CSS recovery contract', () => {
  it('keeps all ten dashboard sources free of runtime stylesheet producers', () => {
    for (const path of COMPONENT_SOURCES) {
      const source = readRelative(path);

      expect(source, path).not.toMatch(/<style(?:\s|>)/);
      expect(source, path).not.toMatch(/dangerouslySetInnerHTML/);
      expect(source, path).not.toMatch(/createElement\(\s*['"]style['"]\s*\)/);
      expect(source, path).not.toContain('@keyframes');
    }
  });

  it('keeps every recovered stylesheet parseable without byte-hash baselines', () => {
    for (const contract of CSS_CONTRACTS) {
      const css = readRelative(contract.path);

      expect(css.trim().length, contract.name).toBeGreaterThan(0);
      expect(() => postcss.parse(css, { from: contract.path }), contract.name).not.toThrow();
    }
  });

  it('reconciles all 110 recovered paint declarations by stylesheet', () => {
    const counts = CSS_CONTRACTS.map((contract) => ({
      name: contract.name,
      actual: countPaintDeclarations(contract.path),
      expected: contract.expectedPaintDeclarations,
    }));

    for (const count of counts) {
      expect(count.actual, count.name).toBe(count.expected);
    }

    expect(counts.reduce((total, count) => total + count.actual, 0)).toBe(110);
    expect(counts.map(({ actual }) => actual)).toEqual([43, 44, 20, 3]);
  });

  it('keeps every recovered interaction scope wired to its component and live class hooks', () => {
    expect(INTERACTION_COMPONENTS).toHaveLength(8);

    for (const component of INTERACTION_COMPONENTS) {
      const source = readRelative(component.sourcePath);
      const scopedRules: string[] = [];
      const cssClasses = new Set<string>();

      parseRelativeCss(component.cssPath).walkRules((rule) => {
        if (!rule.selector.startsWith(`:where(.${component.scope})`)) return;
        scopedRules.push(rule.selector);
        for (const match of rule.selector.matchAll(/\.([A-Za-z_-][\w-]*)/g)) {
          cssClasses.add(match[1]!);
        }
      });

      expect(source, component.sourcePath).toContain(`className="${component.scope}"`);
      expect(scopedRules.length, component.scope).toBeGreaterThan(0);
      expect(cssClasses.size, component.scope).toBeGreaterThan(1);

      for (const className of cssClasses) {
        expect(source, `${component.sourcePath}: .${className}`).toContain(className);
      }
    }
  });

  it('accounts for 28 live keyframes and preserves the three known dead DTC definitions explicitly', () => {
    const definitionNames = new Set<string>();
    for (const contract of CSS_CONTRACTS) {
      parseRelativeCss(contract.path).walkAtRules('keyframes', (rule) => definitionNames.add(rule.params));
    }

    expect(LIVE_ANIMATION_CONSUMERS).toHaveLength(28);
    const consumerNames = LIVE_ANIMATION_CONSUMERS.map((consumer) => consumer.name);
    expect(new Set(consumerNames).size).toBe(28);

    for (const consumer of LIVE_ANIMATION_CONSUMERS) {
      expect(definitionNames.has(consumer.name), consumer.name).toBe(true);

      if (consumer.kind === 'css') {
        expect(declarationsForSelector(consumer.path, consumer.selector).animation, consumer.name).toBe(
          consumer.animation
        );
      } else {
        const source = readRelative(consumer.path).replace(/\s+/g, ' ');
        const stillInline = source.includes(consumer.animation);
        const ownedBySkin = ANIMATION_OWNER_PATHS.some((path) => {
          let found = false;
          parseRelativeCss(path).walkDecls('animation', (declaration) => {
            const normalizedValue = declaration.value.trim().replace(/\s+/g, ' ');
            if (normalizedValue.startsWith(`${consumer.name} `)) found = true;
          });
          return found;
        });
        expect(stillInline || ownedBySkin, consumer.name).toBe(true);
      }
    }

    const liveDefinitions = [...definitionNames].filter(
      (name) => !INTENTIONALLY_DEAD_KEYFRAMES.some((deadName) => deadName === name)
    );
    expect([...consumerNames].sort()).toEqual(liveDefinitions.sort());

    const dataTerminalSource = readRelative('../data-terminal-card/index.tsx');
    for (const deadName of INTENTIONALLY_DEAD_KEYFRAMES) {
      expect(definitionNames.has(deadName), deadName).toBe(true);
      expect(dataTerminalSource, deadName).not.toContain(deadName);
    }
  });

  it('pins recovered frame bodies and critical interaction values independently of byte hashes', () => {
    const actualFrames = new Map<string, Record<string, Record<string, string>>>();

    for (const contract of CSS_CONTRACTS) {
      parseRelativeCss(contract.path).walkAtRules('keyframes', (rule) => {
        expect(actualFrames.has(rule.params), `duplicate @keyframes ${rule.params}`).toBe(false);
        actualFrames.set(rule.params, keyframeFrames(rule));
      });
    }

    expect([...actualFrames.keys()].sort()).toEqual([...EXPECTED_KEYFRAMES].sort());
    for (const [name, frames] of Object.entries(KEYFRAME_FRAME_SEMANTICS)) {
      expect(actualFrames.get(name), name).toEqual(frames);
    }

    for (const contract of CRITICAL_RULE_SEMANTICS) {
      expect(declarationsForSelector(contract.path, contract.selector), contract.selector).toEqual(
        contract.declarations
      );
    }
  });

  it('owns every formerly colliding keyframe and keeps interaction rules zero-weight scoped', () => {
    const keyframes: string[] = [];

    for (const contract of CSS_CONTRACTS) {
      const css = readRelative(contract.path);
      const root = postcss.parse(css, { from: contract.path });

      root.walkAtRules('keyframes', (rule) => keyframes.push(rule.params));

      for (const node of root.nodes) {
        if (node.type !== 'rule') continue;
        expect(node.selector, `${contract.name}: ${node.selector}`).toMatch(/^:where\(\.ds-/);
      }

      expect(css, contract.name).not.toMatch(/\brottay\b|#[\da-f]{3,8}|rgba?\(|hsla?\(/i);
    }

    expect([...keyframes].sort()).toEqual([...EXPECTED_KEYFRAMES].sort());
    expect(new Set(keyframes).size).toBe(keyframes.length);
    expect(keyframes).not.toEqual(expect.arrayContaining(['glow', 'slideIn', 'liveGlow', 'dotGlow']));
  });
});
