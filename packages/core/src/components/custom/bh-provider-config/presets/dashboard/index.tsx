'use client';

/**
 * BhProviderConfig - Dashboard Preset
 * Full AI provider management dashboard with provider grid, health monitoring,
 * API key management, fallback chain visualization, model registry,
 * cost comparison, and connectivity testing.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createDividerStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createPersonalityAccentBar,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
  getCardPadding,
  getHoverTransform,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
} from '../../../helpers';
import type {
  BhProviderConfigProps,
  ProviderItem,
  ProviderType,
  ProviderStatus,
  CircuitBreakerState,
  ApiKeyInfo,
  ModelInfo,
  FallbackChain,
  TestResult,
  TestStatus,
  DragState,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';

/* ------------------------------------------------------------------ */
/*  Helper: sparkline polyline points                                  */
/* ------------------------------------------------------------------ */
function sparklinePoints(data: number[], width: number, height: number, padding: number): string {
  if (!data.length) return '';
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = (width - padding * 2) / (data.length - 1 || 1);
  return data
    .map((v, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((v - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');
}

function sparklinePolygonPoints(data: number[], width: number, height: number, padding: number): string {
  if (!data.length) return '';
  const line = sparklinePoints(data, width, height, padding);
  const lastX = padding + (data.length - 1) * ((width - padding * 2) / (data.length - 1 || 1));
  return `${padding},${height - padding} ${line} ${lastX},${height - padding}`;
}

/* ------------------------------------------------------------------ */
/*  Helper: format date                                                */
/* ------------------------------------------------------------------ */
function formatShortDate(date: Date): string {
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const absDiff = Math.abs(diffMs);
  const suffix = diffMs >= 0 ? ' ago' : ' from now';
  const seconds = Math.floor(absDiff / 1000);
  if (seconds < 60) return `${seconds}s${suffix}`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m${suffix}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h${suffix}`;
  const days = Math.floor(hours / 24);
  return `${days}d${suffix}`;
}

/* ------------------------------------------------------------------ */
/*  Dashboard Preset                                                   */
/* ------------------------------------------------------------------ */
export const DashboardBhProviderConfig = createPreset<BhProviderConfigProps>({
  name: 'BhProviderConfig.Dashboard',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhProviderConfigProps>) => {
    const { Box, Text } = primitives;

    const {
      providers = [],
      selectedProvider: controlledSelectedProvider,
      onProviderSelect,
      apiKeys = [],
      models = [],
      fallbackChain,
      onFallbackReorder,
      testResults: controlledTestResults,
      onTestProvider,
      onRotateKey,
      onRevokeKey,
      showKeyModal: controlledShowKeyModal,
      onKeyModalToggle,
      modelFilter: controlledModelFilter,
      onModelFilterChange,
      costView: controlledCostView,
      onCostViewChange,
      dragState: controlledDragState,
      className,
      style,
    } = props;

    const [internalSelectedProvider, setInternalSelectedProvider] = useState<string | null>(null);
    const [internalShowKeyModal, setInternalShowKeyModal] = useState(false);
    const [internalTestResults, setInternalTestResults] = useState<TestResult[]>([]);
    const [internalFallbackOrder, setInternalFallbackOrder] = useState<FallbackChain | undefined>(fallbackChain);
    const [internalDragState, setInternalDragState] = useState<DragState>({ draggingId: null, overIndex: null });
    const [internalModelFilter, setInternalModelFilter] = useState<ProviderType | 'all'>('all');
    const [internalCostView, setInternalCostView] = useState<'chart' | 'table'>('chart');

    const activeSelectedProvider = controlledSelectedProvider !== undefined ? controlledSelectedProvider : internalSelectedProvider;
    const activeShowKeyModal = controlledShowKeyModal !== undefined ? controlledShowKeyModal : internalShowKeyModal;
    const activeTestResults = controlledTestResults !== undefined ? controlledTestResults : internalTestResults;
    const activeFallbackChain = fallbackChain || internalFallbackOrder;
    const activeModelFilter = controlledModelFilter !== undefined ? controlledModelFilter : internalModelFilter;
    const activeCostView = controlledCostView !== undefined ? controlledCostView : internalCostView;
    const activeDragState = controlledDragState !== undefined ? controlledDragState : internalDragState;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const cardInteractive = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass, interactive: true }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const hoverTransform = getHoverTransform(tokens);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);
    const typo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const padding = useMemo(() => getCardPadding(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const divider = useMemo(() => createDividerStyle(tokens), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens, { color: tokens.colors.primaryScale[500] }), [tokens]);

    const handleProviderSelect = (providerId: string) => {
      setInternalSelectedProvider(providerId);
      onProviderSelect?.(providerId);
    };

    const handleKeyModalToggle = (open: boolean) => {
      setInternalShowKeyModal(open);
      onKeyModalToggle?.(open);
    };

    const handleModelFilterChange = (filter: ProviderType | 'all') => {
      setInternalModelFilter(filter);
      onModelFilterChange?.(filter);
    };

    const handleCostViewChange = (view: 'chart' | 'table') => {
      setInternalCostView(view);
      onCostViewChange?.(view);
    };

    const handleTestProvider = (providerId: string) => {
      const existing = activeTestResults.find((r) => r.providerId === providerId);
      if (!existing || existing.status !== 'testing') {
        setInternalTestResults((prev) => [
          ...prev.filter((r) => r.providerId !== providerId),
          { providerId, status: 'testing' as TestStatus },
        ]);
      }
      onTestProvider?.(providerId);
    };

    const selectedProviderData = useMemo(
      () => providers.find((p) => p.id === activeSelectedProvider),
      [providers, activeSelectedProvider]
    );

    const filteredModels = useMemo(() => {
      if (activeModelFilter === 'all') return models;
      return models.filter((m) => m.type === activeModelFilter);
    }, [models, activeModelFilter]);

    /* ---------- Status colors ---------- */
    const statusConfig = (status: ProviderStatus) => {
      switch (status) {
        case 'healthy':
          return { color: tokens.colors.successScale[500], bg: tokens.colors.successScale[50], label: 'Healthy' };
        case 'degraded':
          return { color: tokens.colors.warningScale[500], bg: tokens.colors.warningScale[50], label: 'Degraded' };
        case 'down':
          return { color: tokens.colors.errorScale[500], bg: tokens.colors.errorScale[50], label: 'Down' };
      }
    };

    /* ---------- Circuit breaker colors ---------- */
    const circuitConfig = (state: CircuitBreakerState) => {
      switch (state) {
        case 'closed':
          return { color: tokens.colors.successScale[500], bg: tokens.colors.successScale[100], label: 'Closed' };
        case 'open':
          return { color: tokens.colors.errorScale[500], bg: tokens.colors.errorScale[100], label: 'Open' };
        case 'half-open':
          return { color: tokens.colors.warningScale[500], bg: tokens.colors.warningScale[100], label: 'Half-Open' };
      }
    };

    /* ---------- Type badge color ---------- */
    const typeColor = (type: ProviderType): 'primary' | 'success' | 'warning' | 'info' => {
      switch (type) {
        case 'chat': return 'primary';
        case 'tts': return 'success';
        case 'stt': return 'info';
        case 'conversational': return 'warning';
      }
    };

    /* ---------- Test result for a provider ---------- */
    const getTestResult = (providerId: string): TestResult | undefined => {
      return activeTestResults.find((r) => r.providerId === providerId);
    };

    /* ---------- Cost chart max ---------- */
    const maxCost = useMemo(() => {
      if (models.length === 0) return 1;
      return Math.max(...models.map((m) => m.costPer1kTokens), 0.001);
    }, [models]);

    /* ------------------------------------------------------------------ */
    /*  Render                                                             */
    /* ------------------------------------------------------------------ */
    return (
      <Box
        className={className}
        style={{
          height: '100%',
          overflow: 'auto',
          backgroundColor: tokens.colors.neutral[50],
          padding: tokens.spacing[6],
          ...style,
        }}
      >
        {/* =========================================================== */}
        {/*  Header                                                      */}
        {/* =========================================================== */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[6] }}>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              AI Provider Management
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
              }}
            >
              {providers.length} providers configured &middot; {providers.filter((p) => p.status === 'healthy').length} healthy
            </Text>
          </Box>
          <Box
            onClick={() => handleKeyModalToggle(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md,
              border: 'none',
              backgroundColor: tokens.colors.primaryScale[600],
              color: tokens.colors.common.white,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              ...hoverStyle,
            }}
          >
            + Add API Key
          </Box>
        </Box>

        {/* =========================================================== */}
        {/*  1. Provider Grid                                            */}
        {/* =========================================================== */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: tokens.spacing[4],
            marginBottom: tokens.spacing[6],
          }}
        >
          {providers.map((provider) => {
            const isSelected = activeSelectedProvider === provider.id;
            const sc = statusConfig(provider.status);
            const testResult = getTestResult(provider.id);

            return (
              <Box
                key={provider.id}
                onClick={() => handleProviderSelect(provider.id)}
                style={{
                  ...cardInteractive,
                  border: isSelected
                    ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[400]}`
                    : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: isSelected ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
                onMouseEnter={(e) => {
                  Object.assign((e.currentTarget as HTMLDivElement).style, hoverTransform);
                  (e.currentTarget as HTMLDivElement).style.boxShadow = tokens.shadows.md;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'none';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = tokens.shadows.sm;
                }}
              >
                {/* Provider header */}
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    {/* Status dot */}
                    <Box
                      style={{
                        width: tokens.spacing[2],
                        height: tokens.spacing[2],
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: sc.color,
                        flexShrink: 0,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {provider.name}
                    </Text>
                  </Box>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                    }}
                  >
                    {provider.modelCount} models
                  </Text>
                </Box>

                {/* Type badges */}
                <Box
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap' as const,
                    gap: tokens.spacing[1],
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  {provider.types.map((type) => (
                    <Text as="span" key={type} style={createBadgeStyle(tokens, typeColor(type))}>
                      {type}
                    </Text>
                  ))}
                </Box>

                {/* Latency indicator */}
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                    Latency
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color:
                        provider.latencyMs < 200
                          ? tokens.colors.successScale[600]
                          : provider.latencyMs < 500
                          ? tokens.colors.warningScale[600]
                          : tokens.colors.errorScale[600],
                    }}
                  >
                    {provider.latencyMs}ms
                  </Text>
                </Box>
                <Box
                  style={{
                    height: 4,
                    backgroundColor: tokens.colors.neutral[100],
                    borderRadius: tokens.borderRadius.full,
                    overflow: 'hidden',
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  <Box
                    style={{
                      width: `${Math.min((provider.latencyMs / 1000) * 100, 100)}%`,
                      height: '100%',
                      backgroundColor:
                        provider.latencyMs < 200
                          ? tokens.colors.successScale[500]
                          : provider.latencyMs < 500
                          ? tokens.colors.warningScale[500]
                          : tokens.colors.errorScale[500],
                      borderRadius: tokens.borderRadius.full,
                      transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                    }}
                  />
                </Box>

                {/* Test button */}
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box
                    as="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestProvider(provider.id);
                    }}
                    style={{
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      backgroundColor: tokens.colors.common.white,
                      color: tokens.colors.neutral[600],
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      ...hoverStyle,
                    }}
                  >
                    {testResult?.status === 'testing' ? 'Testing...' : 'Test'}
                  </Box>
                  {testResult && testResult.status !== 'testing' && (
                    <Text
                      as="span"
                      style={createBadgeStyle(tokens, testResult.status === 'success' ? 'success' : 'error')}
                    >
                      {testResult.status === 'success'
                        ? `${testResult.latencyMs}ms`
                        : 'Failed'}
                    </Text>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Two column layout: main + sidebar */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 360px',
            gap: tokens.spacing[6],
          }}
        >
          {/* ===================== LEFT COLUMN ===================== */}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[6] }}>
            {/* =========================================================== */}
            {/*  2. Health Dashboard                                         */}
            {/* =========================================================== */}
            <Box style={cardBase}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  display: 'block',
                  marginBottom: tokens.spacing[4],
                }}
              >
                Provider Health
              </Text>
              <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: tokens.spacing[3] }}>
                {providers.map((provider) => {
                  const sc = statusConfig(provider.status);
                  const cb = circuitConfig(provider.circuitBreaker);

                  return (
                    <Box
                      key={provider.id}
                      style={{
                        padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        backgroundColor: tokens.colors.common.white,
                      }}
                    >
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: tokens.spacing[2],
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.neutral[900],
                          }}
                        >
                          {provider.name}
                        </Text>
                        <Box
                          style={{
                            width: tokens.spacing[2],
                            height: tokens.spacing[2],
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: sc.color,
                          }}
                        />
                      </Box>

                      {/* Uptime */}
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize['2xl'],
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.neutral[900],
                          display: 'block',
                          marginBottom: tokens.spacing[1],
                        }}
                      >
                        {provider.uptimePercent}%
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                          display: 'block',
                          marginBottom: tokens.spacing[3],
                        }}
                      >
                        uptime (30d)
                      </Text>

                      {/* Latency trend chart */}
                      {provider.latencyTrend.length > 1 && (
                        <svg width="100%" height="36" viewBox="0 0 140 36" preserveAspectRatio="none" style={{ marginBottom: tokens.spacing[2] }}>
                          <defs>
                            <linearGradient id={`health-grad-${provider.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={sc.color} stopOpacity="0.2" />
                              <stop offset="100%" stopColor={sc.color} stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <polygon
                            points={sparklinePolygonPoints(provider.latencyTrend, 140, 36, 2)}
                            fill={`url(#health-grad-${provider.id})`}
                          />
                          <polyline
                            points={sparklinePoints(provider.latencyTrend, 140, 36, 2)}
                            fill="none"
                            stroke={sc.color}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}

                      {/* Circuit breaker */}
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[2],
                        }}
                      >
                        <Box
                          style={{
                            width: tokens.spacing[4],
                            height: tokens.spacing[4],
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: cb.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Box
                            style={{
                              width: tokens.spacing[2],
                              height: tokens.spacing[2],
                              borderRadius: tokens.borderRadius.full,
                              backgroundColor: cb.color,
                            }}
                          />
                        </Box>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[600],
                          }}
                        >
                          CB: {cb.label}
                        </Text>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* =========================================================== */}
            {/*  5. Fallback Visualization                                   */}
            {/* =========================================================== */}
            {activeFallbackChain && activeFallbackChain.providers.length > 0 && (
              <Box style={cardBase}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                    display: 'block',
                    marginBottom: tokens.spacing[4],
                  }}
                >
                  Fallback Chain
                </Text>
                {/* Flow diagram */}
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0,
                    padding: `${tokens.spacing[4]}px 0`,
                    overflowX: 'auto' as const,
                  }}
                >
                  {activeFallbackChain.providers
                    .sort((a, b) => a.priority - b.priority)
                    .map((chainItem, idx, arr) => {
                      const provider = providers.find((p) => p.id === chainItem.providerId);
                      if (!provider) return null;
                      const sc = statusConfig(provider.status);
                      const isLast = idx === arr.length - 1;
                      const labels = ['Primary', 'Secondary', 'Tertiary', 'Quaternary'];

                      return (
                        <Box
                          key={chainItem.providerId}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0,
                          }}
                        >
                          {/* Provider card */}
                          <Box
                            style={{
                              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                              borderRadius: tokens.borderRadius.lg,
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${sc.color}`,
                              backgroundColor: sc.bg,
                              minWidth: 120,
                              textAlign: 'center' as const,
                              cursor: 'grab',
                            }}
                          >
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                fontWeight: tokens.typography.fontWeight.medium,
                                color: tokens.colors.neutral[500],
                                display: 'block',
                                marginBottom: tokens.spacing[1],
                                textTransform: 'uppercase' as const,
                                letterSpacing: '0.05em',
                              }}
                            >
                              {labels[idx] || `Priority ${idx + 1}`}
                            </Text>
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.sm,
                                fontWeight: tokens.typography.fontWeight.bold,
                                color: tokens.colors.neutral[900],
                                display: 'block',
                              }}
                            >
                              {provider.name}
                            </Text>
                            <Box
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: tokens.spacing[1],
                                marginTop: tokens.spacing[1],
                              }}
                            >
                              <Box
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: tokens.borderRadius.full,
                                  backgroundColor: sc.color,
                                }}
                              />
                              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: sc.color }}>
                                {sc.label}
                              </Text>
                            </Box>
                          </Box>

                          {/* Arrow */}
                          {!isLast && (
                            <svg width="40" height="24" viewBox="0 0 40 24" style={{ flexShrink: 0 }}>
                              <defs>
                                <marker
                                  id={`arrowhead-${idx}`}
                                  markerWidth="8"
                                  markerHeight="6"
                                  refX="8"
                                  refY="3"
                                  orient="auto"
                                >
                                  <polygon
                                    points="0 0, 8 3, 0 6"
                                    fill={tokens.colors.neutral[400]}
                                  />
                                </marker>
                              </defs>
                              <line
                                x1="2"
                                y1="12"
                                x2="32"
                                y2="12"
                                stroke={tokens.colors.neutral[400]}
                                strokeWidth="2"
                                markerEnd={`url(#arrowhead-${idx})`}
                              />
                            </svg>
                          )}
                        </Box>
                      );
                    })}
                </Box>
              </Box>
            )}

            {/* =========================================================== */}
            {/*  6. Model Registry                                           */}
            {/* =========================================================== */}
            {models.length > 0 && (
              <Box style={cardBase}>
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: tokens.spacing[4],
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.lg,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                    }}
                  >
                    Model Registry
                  </Text>
                  <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
                    {(['all', 'chat', 'tts', 'stt', 'conversational'] as const).map((f) => (
                      <Box
                        key={f}
                        onClick={() => handleModelFilterChange(f)}
                        style={{
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.md,
                          border:
                            activeModelFilter === f
                              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}`
                              : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                          backgroundColor:
                            activeModelFilter === f ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                          color:
                            activeModelFilter === f ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight:
                            activeModelFilter === f
                              ? tokens.typography.fontWeight.semibold
                              : tokens.typography.fontWeight.medium,
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          textTransform: 'capitalize' as const,
                          ...hoverStyle,
                        }}
                      >
                        {f}
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Table header */}
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 80px 100px 100px 1.5fr 60px',
                    gap: tokens.spacing[2],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    backgroundColor: tokens.colors.neutral[50],
                    borderRadius: tokens.borderRadius.md,
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  {['Model', 'Type', 'Cost/1K', 'Context', 'Features', ''].map((col) => (
                    <Text key={col} style={{ ...sectionHeader, marginBottom: 0 }}>
                      {col}
                    </Text>
                  ))}
                </Box>

                {/* Model rows */}
                <Box style={{ display: 'flex', flexDirection: 'column' }}>
                  {filteredModels.map((model) => (
                    <Box
                      key={model.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 80px 100px 100px 1.5fr 60px',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                        alignItems: 'center',
                        opacity: model.deprecated ? 0.6 : 1,
                        ...hoverStyle,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.backgroundColor = tokens.colors.neutral[50];
                        e.currentTarget.style.transform = tokens.motion.transform;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: tokens.colors.neutral[800],
                          }}
                        >
                          {model.name}
                        </Text>
                        {model.deprecated && (
                          <Text
                            style={{
                              ...createBadgeStyle(tokens, 'error'),
                              fontSize: tokens.typography.fontSize.xs,
                              padding: `0 ${tokens.spacing[1]}px`,
                            }}
                          >
                            deprecated
                          </Text>
                        )}
                      </Box>
                      <Text style={createBadgeStyle(tokens, typeColor(model.type))}>
                        {model.type}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[700],
                        }}
                      >
                        ${model.costPer1kTokens.toFixed(4)}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[600],
                        }}
                      >
                        {model.contextWindow >= 1000
                          ? `${(model.contextWindow / 1000).toFixed(0)}K`
                          : model.contextWindow}
                      </Text>
                      <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[1] }}>
                        {model.features.slice(0, 3).map((feat) => (
                          <Text
                            key={feat}
                            style={{
                              padding: `0 ${tokens.spacing[1]}px`,
                              borderRadius: tokens.borderRadius.sm,
                              backgroundColor: tokens.colors.neutral[100],
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[600],
                            }}
                          >
                            {feat}
                          </Text>
                        ))}
                        {model.features.length > 3 && (
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[400],
                            }}
                          >
                            +{model.features.length - 3}
                          </Text>
                        )}
                      </Box>
                      <Box />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* =========================================================== */}
            {/*  7. Cost Comparison                                          */}
            {/* =========================================================== */}
            {models.length > 0 && (
              <Box style={cardBase}>
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: tokens.spacing[4],
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.lg,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                    }}
                  >
                    Cost Comparison
                  </Text>
                  <Box
                    style={{
                      display: 'flex',
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      overflow: 'hidden',
                    }}
                  >
                    {(['chart', 'table'] as const).map((v) => (
                      <Box
                        key={v}
                        onClick={() => handleCostViewChange(v)}
                        style={{
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                          border: 'none',
                          backgroundColor:
                            activeCostView === v ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                          color:
                            activeCostView === v ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight:
                            activeCostView === v
                              ? tokens.typography.fontWeight.semibold
                              : tokens.typography.fontWeight.medium,
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          textTransform: 'capitalize' as const,
                          ...hoverStyle,
                        }}
                      >
                        {v}
                      </Box>
                    ))}
                  </Box>
                </Box>

                {activeCostView === 'chart' ? (
                  /* Bar chart */
                  <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                    {models
                      .filter((m) => !m.deprecated)
                      .sort((a, b) => a.costPer1kTokens - b.costPer1kTokens)
                      .slice(0, 10)
                      .map((model) => {
                        const pct = (model.costPer1kTokens / maxCost) * 100;
                        const barColors = [
                          tokens.colors.primaryScale[500],
                          tokens.colors.infoScale[500],
                          tokens.colors.successScale[500],
                          tokens.colors.warningScale[500],
                          tokens.colors.secondaryScale[500],
                        ];
                        const barColor = barColors[models.indexOf(model) % barColors.length];

                        return (
                          <Box
                            key={model.id}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '140px 1fr 80px',
                              alignItems: 'center',
                              gap: tokens.spacing[2],
                            }}
                          >
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: tokens.colors.neutral[700],
                                fontWeight: tokens.typography.fontWeight.medium,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap' as const,
                                textAlign: 'right' as const,
                              }}
                            >
                              {model.name}
                            </Text>
                            <Box
                              style={{
                                height: 20,
                                backgroundColor: tokens.colors.neutral[100],
                                borderRadius: tokens.borderRadius.sm,
                                overflow: 'hidden',
                              }}
                            >
                              <Box
                                style={{
                                  width: `${pct}%`,
                                  height: '100%',
                                  backgroundColor: barColor,
                                  borderRadius: tokens.borderRadius.sm,
                                  transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                                }}
                              />
                            </Box>
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                fontWeight: tokens.typography.fontWeight.semibold,
                                color: tokens.colors.neutral[700],
                              }}
                            >
                              ${model.costPer1kTokens.toFixed(4)}
                            </Text>
                          </Box>
                        );
                      })}
                  </Box>
                ) : (
                  /* Table view */
                  <Box>
                    <Box
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        backgroundColor: tokens.colors.neutral[50],
                        borderRadius: tokens.borderRadius.md,
                        marginBottom: tokens.spacing[2],
                      }}
                    >
                      <Text style={{ ...sectionHeader, marginBottom: 0 }}>Model</Text>
                      <Text style={{ ...sectionHeader, marginBottom: 0 }}>Cost/1K Tokens</Text>
                      <Text style={{ ...sectionHeader, marginBottom: 0 }}>Context</Text>
                    </Box>
                    {models
                      .filter((m) => !m.deprecated)
                      .sort((a, b) => a.costPer1kTokens - b.costPer1kTokens)
                      .map((model) => (
                        <Box
                          key={model.id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1fr',
                            gap: tokens.spacing[2],
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                          }}
                        >
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>
                            {model.name}
                          </Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
                            ${model.costPer1kTokens.toFixed(4)}
                          </Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                            {model.contextWindow >= 1000 ? `${(model.contextWindow / 1000).toFixed(0)}K` : model.contextWindow}
                          </Text>
                        </Box>
                      ))}
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* ===================== RIGHT COLUMN (SIDEBAR) ===================== */}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[6] }}>
            {/* =========================================================== */}
            {/*  3. API Key Management                                       */}
            {/* =========================================================== */}
            <Box style={cardBase}>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: tokens.spacing[4],
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                  }}
                >
                  API Keys
                </Text>
                <Box
                  onClick={() => handleKeyModalToggle(true)}
                  style={{
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    backgroundColor: tokens.colors.common.white,
                    color: tokens.colors.neutral[600],
                    fontSize: tokens.typography.fontSize.xs,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    ...hoverStyle,
                  }}
                >
                  + Add
                </Box>
              </Box>

              <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                {apiKeys.map((key) => (
                  <Box
                    key={key.id}
                    style={{
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      backgroundColor: tokens.colors.common.white,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[800],
                        fontFamily: 'monospace',
                        display: 'block',
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      {key.maskedKey}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        display: 'block',
                        marginBottom: tokens.spacing[2],
                      }}
                    >
                      Last used: {formatRelativeTime(key.lastUsed)} &middot; Created: {formatShortDate(key.createdAt)}
                    </Text>
                    <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
                      <Box
                        onClick={() => onRotateKey?.(key.id)}
                        style={{
                          flex: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: tokens.spacing[1],
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.md,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                          backgroundColor: tokens.colors.common.white,
                          color: tokens.colors.neutral[600],
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          ...hoverStyle,
                        }}
                      >
                        &#x21BB; Rotate
                      </Box>
                      <Box
                        onClick={() => onRevokeKey?.(key.id)}
                        style={{
                          flex: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.md,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                          backgroundColor: tokens.colors.errorScale[50],
                          color: tokens.colors.errorScale[600],
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          ...hoverStyle,
                        }}
                      >
                        Revoke
                      </Box>
                    </Box>
                  </Box>
                ))}
                {apiKeys.length === 0 && (
                  <Box
                    style={{
                      padding: `${tokens.spacing[6]}px ${tokens.spacing[4]}px`,
                      textAlign: 'center' as const,
                      color: tokens.colors.neutral[400],
                    }}
                  >
                    <Text style={{ fontSize: tokens.typography.fontSize.sm }}>
                      No API keys configured.
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>

            {/* =========================================================== */}
            {/*  8. Connectivity Test Panel                                  */}
            {/* =========================================================== */}
            <Box style={cardBase}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  display: 'block',
                  marginBottom: tokens.spacing[4],
                }}
              >
                Connectivity
              </Text>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                {providers.map((provider) => {
                  const testResult = getTestResult(provider.id);
                  const isTesting = testResult?.status === 'testing';
                  const isSuccess = testResult?.status === 'success';
                  const isFailure = testResult?.status === 'failure';

                  return (
                    <Box
                      key={provider.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: tokens.spacing[2],
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        backgroundColor: isTesting
                          ? tokens.colors.warningScale[50]
                          : isSuccess
                          ? tokens.colors.successScale[50]
                          : isFailure
                          ? tokens.colors.errorScale[50]
                          : tokens.colors.common.white,
                      }}
                    >
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        {/* Status indicator */}
                        <Box
                          style={{
                            width: tokens.spacing[3],
                            height: tokens.spacing[3],
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: isTesting
                              ? tokens.colors.warningScale[400]
                              : isSuccess
                              ? tokens.colors.successScale[500]
                              : isFailure
                              ? tokens.colors.errorScale[500]
                              : tokens.colors.neutral[300],
                            ...(isTesting
                              ? { animation: 'pulse 1s ease-in-out infinite' }
                              : {}),
                          }}
                        />
                        <Box>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.sm,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.neutral[800],
                              display: 'block',
                            }}
                          >
                            {provider.name}
                          </Text>
                          {testResult && testResult.status !== 'testing' && (
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: isSuccess
                                  ? tokens.colors.successScale[600]
                                  : tokens.colors.errorScale[600],
                              }}
                            >
                              {isSuccess ? `${testResult.latencyMs}ms` : testResult.error || 'Connection failed'}
                            </Text>
                          )}
                          {isTesting && (
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: tokens.colors.warningScale[600],
                              }}
                            >
                              Testing connection...
                            </Text>
                          )}
                        </Box>
                      </Box>
                      <Box
                        onClick={isTesting ? undefined : (e) => {
                          e.stopPropagation();
                          handleTestProvider(provider.id);
                        }}
                        style={{
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.md,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                          backgroundColor: tokens.colors.common.white,
                          color: isTesting ? tokens.colors.neutral[400] : tokens.colors.neutral[600],
                          fontSize: tokens.typography.fontSize.xs,
                          cursor: isTesting ? 'not-allowed' : 'pointer',
                          ...hoverStyle,
                        }}
                      >
                        {isTesting ? '...' : 'Test'}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* =========================================================== */}
            {/*  4. Configuration Panel (Selected Provider)                   */}
            {/* =========================================================== */}
            {selectedProviderData && (
              <Box style={cardBase}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                    display: 'block',
                    marginBottom: tokens.spacing[4],
                  }}
                >
                  {selectedProviderData.name} Config
                </Text>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                  {/* Status */}
                  <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                      Status
                    </Text>
                    <Text style={createBadgeStyle(tokens, selectedProviderData.status === 'healthy' ? 'success' : selectedProviderData.status === 'degraded' ? 'warning' : 'error')}>
                      {statusConfig(selectedProviderData.status).label}
                    </Text>
                  </Box>
                  {/* Uptime */}
                  <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                      Uptime
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                      {selectedProviderData.uptimePercent}%
                    </Text>
                  </Box>
                  {/* Latency */}
                  <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                      Avg Latency
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                      {selectedProviderData.latencyMs}ms
                    </Text>
                  </Box>
                  {/* Models */}
                  <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                      Models
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                      {selectedProviderData.modelCount}
                    </Text>
                  </Box>
                  {/* Circuit Breaker */}
                  <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                      Circuit Breaker
                    </Text>
                    <Text style={createBadgeStyle(tokens, selectedProviderData.circuitBreaker === 'closed' ? 'success' : selectedProviderData.circuitBreaker === 'open' ? 'error' : 'warning')}>
                      {circuitConfig(selectedProviderData.circuitBreaker).label}
                    </Text>
                  </Box>
                  {/* Types */}
                  <Box>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], display: 'block', marginBottom: tokens.spacing[1] }}>
                      Capabilities
                    </Text>
                    <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[1] }}>
                      {selectedProviderData.types.map((type) => (
                        <Text as="span" key={type} style={createBadgeStyle(tokens, typeColor(type))}>
                          {type}
                        </Text>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* =========================================================== */}
        {/*  Add Key Modal                                               */}
        {/* =========================================================== */}
        {activeShowKeyModal && (
          <Box
            style={{
              position: 'fixed' as const,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: tokens.overlay?.medium,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => handleKeyModalToggle(false)}
          >
            <Box
              onClick={(e) => e.stopPropagation()}
              style={{
                ...cardBase,
                width: 440,
                maxHeight: '80%',
                overflow: 'auto',
                backgroundColor: tokens.colors.common.white,
                ...(isGlass && tokens.glass
                  ? {
                      backdropFilter: tokens.glass.blur,
                      WebkitBackdropFilter: tokens.glass.blur,
                      backgroundColor: tokens.glass.bg,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
                    }
                  : {}),
              }}
            >
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: tokens.spacing[5],
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                  }}
                >
                  Add API Key
                </Text>
                <Box
                  onClick={() => handleKeyModalToggle(false)}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: tokens.colors.neutral[400],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    fontSize: tokens.typography.fontSize.lg,
                    padding: tokens.spacing[1],
                  }}
                >
                  &#x2715;
                </Box>
              </Box>

              <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
                {/* Provider selection */}
                <Box>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700], display: 'block', marginBottom: tokens.spacing[1] }}>
                    Provider
                  </Text>
                  <Box
                    style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                      backgroundColor: tokens.colors.common.white,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[400],
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    Select provider...
                    <Text as="span">&#9662;</Text>
                  </Box>
                </Box>

                {/* Key input */}
                <Box>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700], display: 'block', marginBottom: tokens.spacing[1] }}>
                    API Key
                  </Text>
                  <Box
                    style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                      backgroundColor: tokens.colors.common.white,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[400],
                      fontFamily: 'monospace',
                    }}
                  >
                    sk-...
                  </Box>
                </Box>

                {/* Label */}
                <Box>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700], display: 'block', marginBottom: tokens.spacing[1] }}>
                    Label (optional)
                  </Text>
                  <Box
                    style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                      backgroundColor: tokens.colors.common.white,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[400],
                    }}
                  >
                    e.g. Production Key
                  </Box>
                </Box>
              </Box>

              <Box
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: tokens.spacing[2],
                  marginTop: tokens.spacing[6],
                  paddingTop: tokens.spacing[4],
                  borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}
              >
                <Box
                  onClick={() => handleKeyModalToggle(false)}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    backgroundColor: tokens.colors.common.white,
                    color: tokens.colors.neutral[600],
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    ...hoverStyle,
                  }}
                >
                  Cancel
                </Box>
                <Box
                  onClick={() => handleKeyModalToggle(false)}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: 'none',
                    backgroundColor: tokens.colors.primaryScale[600],
                    color: tokens.colors.common.white,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    ...hoverStyle,
                  }}
                >
                  Save Key
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
