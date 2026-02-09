'use client';

/**
 * BhProviderConfig - Detail Preset
 * Per-provider detail view with split panel layout.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createFilterPillStyle,
  createHoverStyle,
  createPanelHeaderStyle,
  createSectionHeaderStyle,
  getHoverTransform,
} from '../../../helpers';
import type {
  BhProviderConfigProps,
  ProviderItem,
  ProviderType,
  ProviderStatus,
  CircuitBreakerState,
  ApiKeyInfo,
  ModelInfo,
  TestResult,
  TestStatus,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';

/* ------------------------------------------------------------------ */
/*  Helper: sparkline                                                  */
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
/*  Helper: format                                                     */
/* ------------------------------------------------------------------ */
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

function formatShortDate(date: Date): string {
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ------------------------------------------------------------------ */
/*  Helper: progress ring                                              */
/* ------------------------------------------------------------------ */
function progressRing(value: number, max: number, radius: number) {
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / (max || 1), 1);
  const dashArray = `${pct * circumference} ${circumference}`;
  return { circumference, dashArray, pct };
}

/* ------------------------------------------------------------------ */
/*  Detail Preset                                                      */
/* ------------------------------------------------------------------ */
export const DetailBhProviderConfig = createPreset<BhProviderConfigProps>({
  name: 'BhProviderConfig.Detail',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhProviderConfigProps>) => {
    const { Box, Text } = primitives;

    const {
      providers = [],
      selectedProvider: controlledSelectedProvider,
      onProviderSelect,
      apiKeys = [],
      models = [],
      testResults: controlledTestResults,
      onTestProvider,
      onRotateKey,
      onRevokeKey,
      modelFilter: controlledModelFilter,
      onModelFilterChange,
      className,
      style,
    } = props;

    const [internalSelectedProvider, setInternalSelectedProvider] = useState<string | null>(
      providers.length > 0 ? providers[0].id : null
    );
    const [internalTestResults, setInternalTestResults] = useState<TestResult[]>([]);
    const [internalModelFilter, setInternalModelFilter] = useState<ProviderType | 'all'>('all');

    const activeSelectedProvider = controlledSelectedProvider !== undefined ? controlledSelectedProvider : internalSelectedProvider;
    const activeTestResults = controlledTestResults !== undefined ? controlledTestResults : internalTestResults;
    const activeModelFilter = controlledModelFilter !== undefined ? controlledModelFilter : internalModelFilter;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);

    const selectedProviderData = useMemo(
      () => providers.find((p) => p.id === activeSelectedProvider),
      [providers, activeSelectedProvider]
    );

    const filteredModels = useMemo(() => {
      if (activeModelFilter === 'all') return models;
      return models.filter((m) => m.type === activeModelFilter);
    }, [models, activeModelFilter]);

    const handleProviderSelect = (providerId: string) => {
      setInternalSelectedProvider(providerId);
      onProviderSelect?.(providerId);
    };

    const handleModelFilterChange = (filter: ProviderType | 'all') => {
      setInternalModelFilter(filter);
      onModelFilterChange?.(filter);
    };

    const handleTestProvider = (providerId: string) => {
      setInternalTestResults((prev) => [
        ...prev.filter((r) => r.providerId !== providerId),
        { providerId, status: 'testing' as TestStatus },
      ]);
      onTestProvider?.(providerId);
    };

    const statusConfig = (status: ProviderStatus) => {
      switch (status) {
        case 'healthy': return { color: tokens.colors.successScale[500], label: 'Healthy' };
        case 'degraded': return { color: tokens.colors.warningScale[500], label: 'Degraded' };
        case 'down': return { color: tokens.colors.errorScale[500], label: 'Down' };
      }
    };

    const circuitConfig = (state: CircuitBreakerState) => {
      switch (state) {
        case 'closed': return { color: tokens.colors.successScale[500], label: 'Closed' };
        case 'open': return { color: tokens.colors.errorScale[500], label: 'Open' };
        case 'half-open': return { color: tokens.colors.warningScale[500], label: 'Half-Open' };
      }
    };

    const typeColor = (type: ProviderType): 'primary' | 'success' | 'warning' | 'info' => {
      switch (type) {
        case 'chat': return 'primary';
        case 'tts': return 'success';
        case 'stt': return 'info';
        case 'conversational': return 'warning';
      }
    };

    const getTestResult = (providerId: string): TestResult | undefined =>
      activeTestResults.find((r) => r.providerId === providerId);

    /* ------------------------------------------------------------------ */
    /*  Render                                                             */
    /* ------------------------------------------------------------------ */
    return (
      <Box
        className={className}
        style={{
          height: '100%',
          display: 'flex',
          backgroundColor: tokens.colors.neutral[50],
          ...style,
        }}
      >
        {/* =========================================================== */}
        {/*  Left Panel: Provider List                                    */}
        {/* =========================================================== */}
        <div
          style={{
            width: 260,
            flexShrink: 0,
            borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            ...(isGlass && tokens.glass
              ? {
                  backdropFilter: tokens.glass.blurSm,
                  WebkitBackdropFilter: tokens.glass.blurSm,
                  backgroundColor: tokens.glass.bgLight,
                  borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.borderLight}`,
                }
              : {}),
          }}
        >
          <div
            style={{
              padding: tokens.spacing[4],
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                display: 'block',
              }}
            >
              Providers
            </Text>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[2] }}>
            {providers.map((provider) => {
              const isSelected = activeSelectedProvider === provider.id;
              const sc = statusConfig(provider.status);

              return (
                <div
                  key={provider.id}
                  onClick={() => handleProviderSelect(provider.id)}
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.md,
                    marginBottom: tokens.spacing[1],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                    border: isSelected ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}` : `${tokens.surface.borderWidth} solid transparent`,
                    ...hoverStyle,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLDivElement).style.backgroundColor = tokens.colors.neutral[50];
                    }
                    e.currentTarget.style.transform = tokens.motion.transform;
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                    }
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                    <div
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
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: isSelected ? tokens.colors.primaryScale[700] : tokens.colors.neutral[900],
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap' as const,
                      }}
                    >
                      {provider.name}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' as const }}>
                    {provider.types.map((type) => (
                      <span
                        key={type}
                        style={{
                          padding: `0 ${tokens.spacing[1]}px`,
                          borderRadius: tokens.borderRadius.sm,
                          backgroundColor: tokens.colors.neutral[100],
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[600],
                        }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================== */}
        {/*  Right Panel: Provider Detail                                  */}
        {/* =========================================================== */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: tokens.spacing[6],
          }}
        >
          {selectedProviderData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[5] }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                  <div
                    style={{
                      width: tokens.spacing[3],
                      height: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: statusConfig(selectedProviderData.status).color,
                    }}
                  />
                  <div>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize['2xl'],
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.neutral[900],
                        display: 'block',
                      }}
                    >
                      {selectedProviderData.name}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                      {statusConfig(selectedProviderData.status).label} &middot; {selectedProviderData.modelCount} models &middot; {selectedProviderData.uptimePercent}% uptime
                    </Text>
                  </div>
                </div>
                <button
                  onClick={() => handleTestProvider(selectedProviderData.id)}
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
                  Test Connection
                </button>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4] }}>
                {[
                  { label: 'Uptime', value: `${selectedProviderData.uptimePercent}%`, scale: tokens.colors.successScale },
                  { label: 'Latency', value: `${selectedProviderData.latencyMs}ms`, scale: selectedProviderData.latencyMs < 200 ? tokens.colors.successScale : selectedProviderData.latencyMs < 500 ? tokens.colors.warningScale : tokens.colors.errorScale },
                  { label: 'Models', value: `${selectedProviderData.modelCount}`, scale: tokens.colors.infoScale },
                  { label: 'Circuit', value: circuitConfig(selectedProviderData.circuitBreaker).label, scale: selectedProviderData.circuitBreaker === 'closed' ? tokens.colors.successScale : selectedProviderData.circuitBreaker === 'open' ? tokens.colors.errorScale : tokens.colors.warningScale },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      ...cardBase,
                      backgroundColor: stat.scale[50],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${stat.scale[200]}`,
                    }}
                  >
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: stat.scale[700], display: 'block', marginBottom: tokens.spacing[1] }}>
                      {stat.label}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: stat.scale[800] }}>
                      {stat.value}
                    </Text>
                  </div>
                ))}
              </div>

              {/* Latency trend chart */}
              {selectedProviderData.latencyTrend.length > 1 && (
                <div style={cardBase}>
                  <Text style={{ ...sectionHeader, marginBottom: tokens.spacing[3] }}>
                    Latency Trend (24h)
                  </Text>
                  <svg width="100%" height="100" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="detail-latency-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={tokens.colors.primaryScale[400]} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={tokens.colors.primaryScale[400]} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points={sparklinePolygonPoints(selectedProviderData.latencyTrend, 400, 100, 4)}
                      fill="url(#detail-latency-grad)"
                    />
                    <polyline
                      points={sparklinePoints(selectedProviderData.latencyTrend, 400, 100, 4)}
                      fill="none"
                      stroke={tokens.colors.primaryScale[500]}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}

              {/* Type badges */}
              <div style={cardBase}>
                <Text style={{ ...sectionHeader, marginBottom: tokens.spacing[3] }}>
                  Capabilities
                </Text>
                <div style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' as const }}>
                  {selectedProviderData.types.map((type) => (
                    <span key={type} style={{ ...createBadgeStyle(tokens, typeColor(type)), padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px` }}>
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* API Keys for this provider */}
              {apiKeys.length > 0 && (
                <div style={cardBase}>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.lg,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                      display: 'block',
                      marginBottom: tokens.spacing[4],
                    }}
                  >
                    API Keys
                  </Text>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                    {apiKeys.map((key) => (
                      <div
                        key={key.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: tokens.spacing[3],
                          borderRadius: tokens.borderRadius.md,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        }}
                      >
                        <div>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.sm,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.neutral[800],
                              fontFamily: 'monospace',
                              display: 'block',
                            }}
                          >
                            {key.maskedKey}
                          </Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                            Last used: {formatRelativeTime(key.lastUsed)} &middot; Created: {formatShortDate(key.createdAt)}
                          </Text>
                        </div>
                        <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                          <button
                            onClick={() => onRotateKey?.(key.id)}
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
                            &#x21BB;
                          </button>
                          <button
                            onClick={() => onRevokeKey?.(key.id)}
                            style={{
                              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.md,
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                              backgroundColor: tokens.colors.errorScale[50],
                              color: tokens.colors.errorScale[600],
                              fontSize: tokens.typography.fontSize.xs,
                              cursor: 'pointer',
                              transition: `all ${tokens.motion.hover}`,
                              ...hoverStyle,
                            }}
                          >
                            Revoke
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Models for this provider */}
              {models.length > 0 && (
                <div style={cardBase}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                      Models
                    </Text>
                    <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                      {(['all', 'chat', 'tts', 'stt', 'conversational'] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => handleModelFilterChange(f)}
                          style={{
                            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.md,
                            border: activeModelFilter === f ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}` : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                            backgroundColor: activeModelFilter === f ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                            color: activeModelFilter === f ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: activeModelFilter === f ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                            cursor: 'pointer',
                            transition: `all ${tokens.motion.hover}`,
                            textTransform: 'capitalize' as const,
                            ...hoverStyle,
                          }}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                    {filteredModels.map((model) => (
                      <div
                        key={model.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: tokens.spacing[3],
                          borderRadius: tokens.borderRadius.md,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
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
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                              {model.name}
                            </Text>
                            <span style={createBadgeStyle(tokens, typeColor(model.type))}>
                              {model.type}
                            </span>
                            {model.deprecated && (
                              <span style={{ ...createBadgeStyle(tokens, 'error'), fontSize: tokens.typography.fontSize.xs, padding: `0 ${tokens.spacing[1]}px` }}>
                                deprecated
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: tokens.spacing[3] }}>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                              ${model.costPer1kTokens.toFixed(4)}/1K
                            </Text>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                              {model.contextWindow >= 1000 ? `${(model.contextWindow / 1000).toFixed(0)}K` : model.contextWindow} ctx
                            </Text>
                          </div>
                          {model.features.length > 0 && (
                            <div style={{ display: 'flex', gap: tokens.spacing[1], marginTop: tokens.spacing[1], flexWrap: 'wrap' as const }}>
                              {model.features.map((feat) => (
                                <span
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
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: tokens.colors.neutral[400],
              }}
            >
              <Text style={{ fontSize: tokens.typography.fontSize.md }}>
                Select a provider from the list to view details.
              </Text>
            </div>
          )}
        </div>
      </Box>
    );
  },
});
