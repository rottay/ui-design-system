'use client';

/**
 * BhSlaMonitor - Standard Preset
 * SLA tracking dashboard with compliance hero, breach alerts, per-stage bars,
 * at-risk countdown cards, historical trend chart, and configuration panel.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createSectionHeaderStyle,
  createSurfaceStyle,
  getHoverTransform,
} from '../../../helpers';
import type {
  BhSlaMonitorProps,
  SlaCompliance,
  SlaBreach,
  StageSla,
  AtRiskItem,
  SlaHistoryPoint,
  SlaConfig,
} from '../../core';
import {
  getSlaStatusColors,
  getComplianceColor,
  TIME_RANGE_OPTIONS,
} from '../../core';
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  User,
  Settings,
  ChevronRight,
  BarChart3,
  AlertCircle,
  Timer,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  Mail,
  Zap,
  X,
} from 'lucide-react';

export const StandardBhSlaMonitor = createPreset<BhSlaMonitorProps>({
  name: 'BhSlaMonitor.Standard',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhSlaMonitorProps>) => {
    const { Box, Stack } = primitives;

    const {
      compliance: externalCompliance,
      breaches: externalBreaches = [],
      stageSlaData: externalStageSlaData = [],
      atRiskItems: externalAtRiskItems = [],
      history: externalHistory = [],
      config: externalConfig = [],
      timeRange: externalTimeRange = '7d',
      onTimeRangeChange,
      showConfig: externalShowConfig = false,
      onConfigToggle,
      selectedStage: externalSelectedStage,
      onStageSelect,
      breachFilter: externalBreachFilter = 'all',
      onBreachFilterChange,
      className,
      style,
    } = props;

    const [timeRange, setTimeRange] = useState(externalTimeRange);
    const [showConfig, setShowConfig] = useState(externalShowConfig);
    const [selectedStage, setSelectedStage] = useState<string | null>(
      externalSelectedStage ?? null
    );
    const [breachFilter, setBreachFilter] = useState(externalBreachFilter);

    useEffect(() => { setTimeRange(externalTimeRange); }, [externalTimeRange]);
    useEffect(() => { setShowConfig(externalShowConfig); }, [externalShowConfig]);
    useEffect(() => {
      if (externalSelectedStage !== undefined) setSelectedStage(externalSelectedStage);
    }, [externalSelectedStage]);
    useEffect(() => { setBreachFilter(externalBreachFilter); }, [externalBreachFilter]);

    const handleTimeRangeChange = useCallback(
      (range: string) => {
        setTimeRange(range);
        onTimeRangeChange?.(range);
      },
      [onTimeRangeChange]
    );

    const handleConfigToggle = useCallback(() => {
      const next = !showConfig;
      setShowConfig(next);
      onConfigToggle?.();
    }, [showConfig, onConfigToggle]);

    const handleStageSelect = useCallback(
      (stage: string | null) => {
        setSelectedStage(stage);
        onStageSelect?.(stage);
      },
      [onStageSelect]
    );

    const handleBreachFilterChange = useCallback(
      (filter: 'all' | 'active' | 'resolved') => {
        setBreachFilter(filter);
        onBreachFilterChange?.(filter);
      },
      [onBreachFilterChange]
    );

    const isGlass = engine === 'modern';
    const slaColors = getSlaStatusColors(tokens);
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const cardInteractive = useMemo(() => createCardStyle(tokens, {
      elevation: 'sm',
      glass: isGlass,
      interactive: true,
    }), [tokens, isGlass]);
    const hoverTransition = useMemo(() => createHoverStyle(tokens), [tokens]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);

    const containerStyle: React.CSSProperties = {
      ...createSurfaceStyle(tokens, { elevation: 'sm', glass: isGlass }),
      padding: tokens.spacing[5],
      backgroundColor: tokens.colors.neutral[50],
      minHeight: '100%',
      ...style,
    };

    const sectionTitleStyle: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.lg,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[900],
      margin: 0,
    };

    const pulseKeyframes = `
      @keyframes bhSlaPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `;

    /* ---- Compliance Hero ---- */
    const renderComplianceHero = () => {
      const comp = externalCompliance ?? { percentage: 0, trend: 'stable' as const };
      const compColor = getComplianceColor(tokens, comp.percentage);
      const trendIcon =
        comp.trend === 'up' ? (
          <TrendingUp size={20} color={tokens.colors.successScale[600]} />
        ) : comp.trend === 'down' ? (
          <TrendingDown size={20} color={tokens.colors.errorScale[600]} />
        ) : (
          <Minus size={16} color={tokens.colors.neutral[400]} />
        );
      const trendLabel =
        comp.trend === 'up' ? 'Improving' : comp.trend === 'down' ? 'Declining' : 'Stable';
      const trendColor =
        comp.trend === 'up'
          ? tokens.colors.successScale[600]
          : comp.trend === 'down'
          ? tokens.colors.errorScale[600]
          : tokens.colors.neutral[500];

      const heroStyle: React.CSSProperties = {
        ...createCardStyle(tokens, { elevation: 'md', glass: isGlass }),
        padding: `${tokens.spacing[6]}px ${tokens.spacing[6]}px`,
        background:
          isGlass && tokens.glass
            ? tokens.glass.bg
            : `linear-gradient(135deg, ${compColor.bg}, ${tokens.colors.common.white})`,
        position: 'relative' as const,
        overflow: 'hidden',
      };

      return (
        <div style={heroStyle}>
          <style>{pulseKeyframes}</style>
          {isGlass && tokens.glass && (
            <div
              style={{
                position: 'absolute' as const,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backdropFilter: tokens.glass.blur,
                WebkitBackdropFilter: tokens.glass.blur,
                pointerEvents: 'none' as const,
              }}
            />
          )}
          <Stack
            direction="horizontal"
            align="center"
            justify="space-between"
            style={{ position: 'relative' as const, zIndex: 1 }}
          >
            <Stack direction="horizontal" align="center" gap={tokens.spacing[5]}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: compColor.bg,
                  border: `3px solid ${compColor.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: tokens.typography.fontSize['2xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: compColor.color,
                    lineHeight: tokens.typography.lineHeight.tight,
                  }}
                >
                  {Math.round(comp.percentage)}
                </span>
              </div>
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: tokens.spacing[2],
                  }}
                >
                  <span
                    style={{
                      fontSize: tokens.typography.fontSize['4xl'],
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: compColor.color,
                      lineHeight: tokens.typography.lineHeight.tight,
                    }}
                  >
                    {comp.percentage.toFixed(1)}%
                  </span>
                </div>
                <p
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[600],
                    margin: `${tokens.spacing[1]}px 0 0 0`,
                  }}
                >
                  SLA Compliance Rate
                </p>
                <Stack
                  direction="horizontal"
                  align="center"
                  gap={tokens.spacing[1]}
                  style={{ marginTop: tokens.spacing[2] }}
                >
                  {trendIcon}
                  <span
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: trendColor,
                    }}
                  >
                    {trendLabel}
                  </span>
                </Stack>
              </div>
            </Stack>

            <Stack direction="horizontal" align="center" gap={tokens.spacing[2]}>
              {TIME_RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleTimeRangeChange(opt.value)}
                  style={{
                    ...hoverTransition,
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border:
                      timeRange === opt.value
                        ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}`
                        : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    backgroundColor:
                      timeRange === opt.value
                        ? tokens.colors.primaryScale[50]
                        : tokens.colors.common.white,
                    color:
                      timeRange === opt.value
                        ? tokens.colors.primaryScale[700]
                        : tokens.colors.neutral[600],
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  {opt.label}
                </button>
              ))}
              <button
                onClick={handleConfigToggle}
                style={{
                  ...hoverTransition,
                  padding: `${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: showConfig
                    ? tokens.colors.primaryScale[50]
                    : tokens.colors.common.white,
                  color: showConfig
                    ? tokens.colors.primaryScale[700]
                    : tokens.colors.neutral[600],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Settings size={16} />
              </button>
            </Stack>
          </Stack>
        </div>
      );
    };

    /* ---- Breach Alerts ---- */
    const renderBreachAlerts = () => {
      if (externalBreaches.length === 0) return null;

      const filterOptions: Array<{ value: 'all' | 'active' | 'resolved'; label: string }> = [
        { value: 'all', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'resolved', label: 'Resolved' },
      ];

      return (
        <div style={cardBase}>
          <Stack
            direction="horizontal"
            align="center"
            justify="space-between"
            style={{ marginBottom: tokens.spacing[4] }}
          >
            <Stack direction="horizontal" align="center" gap={tokens.spacing[2]}>
              <AlertTriangle size={18} color={tokens.colors.errorScale[600]} />
              <span style={sectionTitleStyle}>SLA Breaches</span>
              <span
                style={{
                  ...createBadgeStyle(tokens, 'error'),
                  marginLeft: tokens.spacing[1],
                }}
              >
                {externalBreaches.length}
              </span>
            </Stack>
            <Stack direction="horizontal" align="center" gap={tokens.spacing[1]}>
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleBreachFilterChange(opt.value)}
                  style={{
                    ...hoverTransition,
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: 'none',
                    backgroundColor:
                      breachFilter === opt.value
                        ? tokens.colors.errorScale[100]
                        : 'transparent',
                    color:
                      breachFilter === opt.value
                        ? tokens.colors.errorScale[700]
                        : tokens.colors.neutral[500],
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </Stack>
          </Stack>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column' as const,
              gap: tokens.spacing[3],
            }}
          >
            {externalBreaches.map((breach) => {
              const exceededBy = breach.actualHours - breach.slaHours;
              const exceededPercent =
                breach.slaHours > 0
                  ? Math.round((exceededBy / breach.slaHours) * 100)
                  : 0;

              return (
                <div
                  key={breach.id}
                  style={{
                    ...createSurfaceStyle(tokens, { elevation: 'sm', glass: isGlass }),
                    padding: tokens.spacing[4],
                    backgroundColor: tokens.colors.errorScale[50],
                    borderLeft: `4px solid ${tokens.colors.errorScale[500]}`,
                  }}
                >
                  <Stack
                    direction="horizontal"
                    align="center"
                    justify="space-between"
                  >
                    <div style={{ flex: 1 }}>
                      <Stack
                        direction="horizontal"
                        align="center"
                        gap={tokens.spacing[2]}
                        style={{ marginBottom: tokens.spacing[2] }}
                      >
                        <span
                          style={{
                            fontSize: tokens.typography.fontSize.md,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.neutral[900],
                          }}
                        >
                          {breach.jobName}
                        </span>
                        <ChevronRight
                          size={14}
                          color={tokens.colors.neutral[400]}
                        />
                        <span
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[600],
                          }}
                        >
                          {breach.stageName}
                        </span>
                      </Stack>
                      <Stack direction="horizontal" align="center" gap={tokens.spacing[4]}>
                        <span
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                          }}
                        >
                          SLA: {breach.slaHours}h
                        </span>
                        <span
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.errorScale[700],
                          }}
                        >
                          Actual: {breach.actualHours}h (+{exceededBy}h / +{exceededPercent}%)
                        </span>
                      </Stack>
                    </div>
                    <Stack direction="horizontal" align="center" gap={tokens.spacing[2]}>
                      {breach.recruiterAvatar ? (
                        <img
                          src={breach.recruiterAvatar}
                          alt={breach.assignedRecruiter}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: tokens.borderRadius.full,
                            objectFit: 'cover' as const,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: tokens.colors.neutral[200],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <User size={16} color={tokens.colors.neutral[500]} />
                        </div>
                      )}
                      <span
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[700],
                          fontWeight: tokens.typography.fontWeight.medium,
                        }}
                      >
                        {breach.assignedRecruiter}
                      </span>
                    </Stack>
                  </Stack>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    /* ---- Per-Stage SLA Bars ---- */
    const renderStageSla = () => {
      if (externalStageSlaData.length === 0) return null;

      const maxHours = Math.max(
        ...externalStageSlaData.map((s) => Math.max(s.avgHours, s.limitHours))
      );
      const chartWidth = 600;
      const barHeight = 28;
      const rowGap = tokens.spacing[3];
      const labelWidth = 120;
      const chartAreaWidth = chartWidth - labelWidth - 60;

      return (
        <div style={cardBase}>
          <Stack
            direction="horizontal"
            align="center"
            gap={tokens.spacing[2]}
            style={{ marginBottom: tokens.spacing[4] }}
          >
            <BarChart3 size={18} color={tokens.colors.primaryScale[600]} />
            <span style={sectionTitleStyle}>Stage SLA Performance</span>
          </Stack>

          <svg
            width="100%"
            viewBox={`0 0 ${chartWidth} ${externalStageSlaData.length * (barHeight + rowGap) + 20}`}
            style={{ overflow: 'visible' }}
          >
            {externalStageSlaData.map((stage, i) => {
              const y = i * (barHeight + rowGap) + 10;
              const barW =
                maxHours > 0
                  ? (stage.avgHours / maxHours) * chartAreaWidth
                  : 0;
              const limitX =
                maxHours > 0
                  ? labelWidth + (stage.limitHours / maxHours) * chartAreaWidth
                  : labelWidth;
              const statusColors = slaColors[stage.status];
              const isSelected = selectedStage === stage.stageName;

              return (
                <g
                  key={stage.stageName}
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    handleStageSelect(
                      isSelected ? null : stage.stageName
                    )
                  }
                >
                  {/* Label */}
                  <text
                    x={labelWidth - 8}
                    y={y + barHeight / 2 + 4}
                    textAnchor="end"
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fill: isSelected
                        ? tokens.colors.primaryScale[700]
                        : tokens.colors.neutral[700],
                      fontWeight: isSelected
                        ? tokens.typography.fontWeight.semibold
                        : tokens.typography.fontWeight.normal,
                    }}
                  >
                    {stage.stageName}
                  </text>

                  {/* Background */}
                  <rect
                    x={labelWidth}
                    y={y}
                    width={chartAreaWidth}
                    height={barHeight}
                    rx={Number(tokens.borderRadius.sm.replace('px', '')) || 4}
                    fill={tokens.colors.neutral[100]}
                  />

                  {/* Avg bar */}
                  <rect
                    x={labelWidth}
                    y={y}
                    width={Math.max(barW, 2)}
                    height={barHeight}
                    rx={Number(tokens.borderRadius.sm.replace('px', '')) || 4}
                    fill={statusColors.dot}
                    opacity={0.8}
                  />

                  {/* SLA limit line */}
                  <line
                    x1={limitX}
                    y1={y - 2}
                    x2={limitX}
                    y2={y + barHeight + 2}
                    stroke={tokens.colors.neutral[800]}
                    strokeWidth={2}
                    strokeDasharray="4,2"
                  />

                  {/* Values */}
                  <text
                    x={labelWidth + chartAreaWidth + 8}
                    y={y + barHeight / 2 + 4}
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fill: statusColors.color,
                      fontWeight: tokens.typography.fontWeight.medium,
                    }}
                  >
                    {stage.avgHours}h
                  </text>
                </g>
              );
            })}
          </svg>

          <Stack
            direction="horizontal"
            align="center"
            gap={tokens.spacing[4]}
            style={{ marginTop: tokens.spacing[3] }}
          >
            <Stack direction="horizontal" align="center" gap={tokens.spacing[1]}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: tokens.borderRadius.sm,
                  backgroundColor: tokens.colors.successScale[500],
                }}
              />
              <span
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[600],
                }}
              >
                Within SLA
              </span>
            </Stack>
            <Stack direction="horizontal" align="center" gap={tokens.spacing[1]}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: tokens.borderRadius.sm,
                  backgroundColor: tokens.colors.warningScale[500],
                }}
              />
              <span
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[600],
                }}
              >
                Near limit
              </span>
            </Stack>
            <Stack direction="horizontal" align="center" gap={tokens.spacing[1]}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: tokens.borderRadius.sm,
                  backgroundColor: tokens.colors.errorScale[500],
                }}
              />
              <span
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[600],
                }}
              >
                Breached
              </span>
            </Stack>
            <Stack direction="horizontal" align="center" gap={tokens.spacing[1]}>
              <div
                style={{
                  width: 16,
                  height: 2,
                  backgroundColor: tokens.colors.neutral[800],
                  borderTop: `2px dashed ${tokens.colors.neutral[800]}`,
                }}
              />
              <span
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[600],
                }}
              >
                SLA Limit
              </span>
            </Stack>
          </Stack>
        </div>
      );
    };

    /* ---- At-Risk Items ---- */
    const renderAtRiskItems = () => {
      if (externalAtRiskItems.length === 0) return null;

      return (
        <div style={cardBase}>
          <Stack
            direction="horizontal"
            align="center"
            gap={tokens.spacing[2]}
            style={{ marginBottom: tokens.spacing[4] }}
          >
            <Timer size={18} color={tokens.colors.warningScale[600]} />
            <span style={sectionTitleStyle}>At-Risk Items</span>
            <span style={createBadgeStyle(tokens, 'warning')}>
              {externalAtRiskItems.length}
            </span>
          </Stack>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: tokens.spacing[3],
            }}
          >
            {externalAtRiskItems.map((item) => {
              const urgencyColor =
                item.hoursRemaining <= 2
                  ? {
                      bg: tokens.colors.errorScale[50],
                      border: tokens.colors.errorScale[300],
                      text: tokens.colors.errorScale[700],
                      badge: tokens.colors.errorScale[500],
                    }
                  : item.hoursRemaining <= 6
                  ? {
                      bg: tokens.colors.warningScale[50],
                      border: tokens.colors.warningScale[300],
                      text: tokens.colors.warningScale[700],
                      badge: tokens.colors.warningScale[500],
                    }
                  : {
                      bg: tokens.colors.infoScale[50],
                      border: tokens.colors.infoScale[300],
                      text: tokens.colors.infoScale[700],
                      badge: tokens.colors.infoScale[500],
                    };

              return (
                <div
                  key={item.id}
                  style={{
                    ...createSurfaceStyle(tokens, { elevation: 'sm', glass: isGlass }),
                    padding: tokens.spacing[4],
                    backgroundColor: urgencyColor.bg,
                    borderLeft: `3px solid ${urgencyColor.border}`,
                  }}
                >
                  <Stack
                    direction="horizontal"
                    align="start"
                    justify="space-between"
                    style={{ marginBottom: tokens.spacing[2] }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[900],
                          display: 'block',
                        }}
                      >
                        {item.name}
                      </span>
                      <span
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                        }}
                      >
                        {item.stage}
                      </span>
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.md,
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        backgroundColor: urgencyColor.badge,
                        color: tokens.colors.common.white,
                      }}
                    >
                      {item.type === 'candidate' ? 'Candidate' : 'Interview'}
                    </span>
                  </Stack>

                  <Stack
                    direction="horizontal"
                    align="center"
                    justify="space-between"
                  >
                    <Stack direction="horizontal" align="center" gap={tokens.spacing[1]}>
                      <Clock size={14} color={urgencyColor.text} />
                      <span
                        style={{
                          fontSize: tokens.typography.fontSize.lg,
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: urgencyColor.text,
                        }}
                      >
                        {item.hoursRemaining}h
                      </span>
                      <span
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                        }}
                      >
                        remaining
                      </span>
                    </Stack>
                    <span
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[600],
                      }}
                    >
                      {item.assignee}
                    </span>
                  </Stack>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    /* ---- Historical Trend Chart ---- */
    const renderHistoryChart = () => {
      if (externalHistory.length < 2) return null;

      const chartW = 600;
      const chartH = 200;
      const padL = 40;
      const padR = 16;
      const padT = 16;
      const padB = 32;
      const plotW = chartW - padL - padR;
      const plotH = chartH - padT - padB;

      const minVal = Math.min(...externalHistory.map((p) => p.compliance));
      const maxVal = Math.max(...externalHistory.map((p) => p.compliance));
      const range = Math.max(maxVal - minVal, 10);
      const yMin = Math.max(0, minVal - range * 0.1);
      const yMax = Math.min(100, maxVal + range * 0.1);
      const yRange = yMax - yMin;

      const points = externalHistory.map((p, i) => {
        const x = padL + (i / (externalHistory.length - 1)) * plotW;
        const y = padT + plotH - ((p.compliance - yMin) / yRange) * plotH;
        return { x, y, ...p };
      });

      const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');
      const areaPath = `M${points[0].x},${padT + plotH} ${points
        .map((p) => `L${p.x},${p.y}`)
        .join(' ')} L${points[points.length - 1].x},${padT + plotH} Z`;

      const thresholdY90 =
        padT + plotH - ((90 - yMin) / yRange) * plotH;
      const thresholdY75 =
        padT + plotH - ((75 - yMin) / yRange) * plotH;

      return (
        <div style={cardBase}>
          <Stack
            direction="horizontal"
            align="center"
            gap={tokens.spacing[2]}
            style={{ marginBottom: tokens.spacing[4] }}
          >
            <Activity size={18} color={tokens.colors.infoScale[600]} />
            <span style={sectionTitleStyle}>Compliance Trend</span>
          </Stack>

          <svg
            width="100%"
            viewBox={`0 0 ${chartW} ${chartH}`}
            style={{ overflow: 'visible' }}
          >
            {/* Grid lines */}
            {[yMin, yMin + yRange * 0.25, yMin + yRange * 0.5, yMin + yRange * 0.75, yMax].map(
              (v, i) => {
                const y = padT + plotH - ((v - yMin) / yRange) * plotH;
                return (
                  <g key={i}>
                    <line
                      x1={padL}
                      y1={y}
                      x2={padL + plotW}
                      y2={y}
                      stroke={tokens.colors.neutral[100]}
                      strokeWidth={1}
                    />
                    <text
                      x={padL - 6}
                      y={y + 4}
                      textAnchor="end"
                      style={{
                        fontSize: '10px',
                        fill: tokens.colors.neutral[400],
                      }}
                    >
                      {Math.round(v)}%
                    </text>
                  </g>
                );
              }
            )}

            {/* 90% threshold line */}
            {90 >= yMin && 90 <= yMax && (
              <line
                x1={padL}
                y1={thresholdY90}
                x2={padL + plotW}
                y2={thresholdY90}
                stroke={tokens.colors.successScale[400]}
                strokeWidth={1}
                strokeDasharray="6,3"
              />
            )}

            {/* 75% threshold line */}
            {75 >= yMin && 75 <= yMax && (
              <line
                x1={padL}
                y1={thresholdY75}
                x2={padL + plotW}
                y2={thresholdY75}
                stroke={tokens.colors.warningScale[400]}
                strokeWidth={1}
                strokeDasharray="6,3"
              />
            )}

            {/* Area fill */}
            <path
              d={areaPath}
              fill={tokens.colors.primaryScale[100]}
              opacity={0.4}
            />

            {/* Line */}
            <polyline
              points={polyline}
              fill="none"
              stroke={tokens.colors.primaryScale[500]}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dots */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={3.5}
                fill={tokens.colors.common.white}
                stroke={tokens.colors.primaryScale[500]}
                strokeWidth={2}
              />
            ))}

            {/* X-axis labels */}
            {points
              .filter(
                (_, i) =>
                  i === 0 ||
                  i === points.length - 1 ||
                  i % Math.ceil(points.length / 6) === 0
              )
              .map((p, i) => (
                <text
                  key={i}
                  x={p.x}
                  y={padT + plotH + 18}
                  textAnchor="middle"
                  style={{
                    fontSize: '10px',
                    fill: tokens.colors.neutral[400],
                  }}
                >
                  {p.date}
                </text>
              ))}
          </svg>
        </div>
      );
    };

    /* ---- Configuration Panel ---- */
    const renderConfig = () => {
      if (!showConfig || externalConfig.length === 0) return null;

      return (
        <div style={cardBase}>
          <Stack
            direction="horizontal"
            align="center"
            justify="space-between"
            style={{ marginBottom: tokens.spacing[4] }}
          >
            <Stack direction="horizontal" align="center" gap={tokens.spacing[2]}>
              <Settings size={18} color={tokens.colors.neutral[600]} />
              <span style={sectionTitleStyle}>SLA Configuration</span>
            </Stack>
            <button
              onClick={handleConfigToggle}
              style={{
                ...hoverTransition,
                padding: tokens.spacing[1],
                border: 'none',
                backgroundColor: 'transparent',
                color: tokens.colors.neutral[400],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </Stack>

          <div style={{ overflowX: 'auto' as const }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse' as const,
                fontSize: tokens.typography.fontSize.sm,
              }}
            >
              <thead>
                <tr>
                  {['Stage', 'SLA Limit (h)', 'Alert Recipients', 'Escalation Rules'].map(
                    (header) => (
                      <th
                        key={header}
                        style={{
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                          textAlign: 'left' as const,
                          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                          color: tokens.colors.neutral[600],
                          fontWeight: tokens.typography.fontWeight.semibold,
                          fontSize: tokens.typography.fontSize.xs,
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.05em',
                          whiteSpace: 'nowrap' as const,
                        }}
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {externalConfig.map((cfg) => (
                  <tr key={cfg.stageId}>
                    <td
                      style={{
                        padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {cfg.stageName}
                    </td>
                    <td
                      style={{
                        padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                        color: tokens.colors.neutral[700],
                      }}
                    >
                      <Stack direction="horizontal" align="center" gap={tokens.spacing[1]}>
                        <Clock size={14} color={tokens.colors.neutral[400]} />
                        <span>{cfg.limitHours}h</span>
                      </Stack>
                    </td>
                    <td
                      style={{
                        padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      }}
                    >
                      <Stack direction="horizontal" align="center" gap={tokens.spacing[1]} style={{ flexWrap: 'wrap' as const }}>
                        {cfg.alertRecipients.map((recipient, idx) => (
                          <span
                            key={idx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: tokens.spacing[1],
                              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.full,
                              backgroundColor: tokens.colors.primaryScale[50],
                              color: tokens.colors.primaryScale[700],
                              fontSize: tokens.typography.fontSize.xs,
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                            }}
                          >
                            <Mail size={10} />
                            {recipient}
                          </span>
                        ))}
                      </Stack>
                    </td>
                    <td
                      style={{
                        padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                        color: tokens.colors.neutral[600],
                      }}
                    >
                      <Stack direction="horizontal" align="center" gap={tokens.spacing[1]}>
                        <Zap size={14} color={tokens.colors.warningScale[500]} />
                        <span>{cfg.escalationRules}</span>
                      </Stack>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    };

    /* ---- Main Layout ---- */
    return (
      <div className={className} style={containerStyle}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column' as const,
            gap: tokens.spacing[5],
            maxWidth: 1400,
            margin: '0 auto',
          }}
        >
          {/* Compliance Hero */}
          {renderComplianceHero()}

          {/* Breach Alerts */}
          {renderBreachAlerts()}

          {/* Two-column layout: Stage SLA + At-Risk */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
              gap: tokens.spacing[5],
            }}
          >
            {renderStageSla()}
            {renderAtRiskItems()}
          </div>

          {/* Historical Trend */}
          {renderHistoryChart()}

          {/* Configuration */}
          {renderConfig()}
        </div>
      </div>
    );
  },
});
