'use client';

/**
 * BhSlaMonitor - Standard Preset
 * SLA tracking dashboard with compliance hero, breach alerts, per-stage bars,
 * at-risk items queue, and compliance history trend chart.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Shield,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  XCircle,
  Timer,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  createEntranceAnimation,
  createStaggerDelay,
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
import { getSlaStatusColors, getComplianceColor, TIME_RANGE_OPTIONS } from '../../core';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
const MOCK_COMPLIANCE: SlaCompliance = { percentage: 87.4, trend: 'up' };

const MOCK_BREACHES: SlaBreach[] = [
  { id: 'b1', jobName: 'Sr. Backend Engineer', stageName: 'Technical Interview', slaHours: 48, actualHours: 72, assignedRecruiter: 'Sofia Martinez' },
  { id: 'b2', jobName: 'Product Designer', stageName: 'Portfolio Review', slaHours: 24, actualHours: 38, assignedRecruiter: 'James Chen' },
  { id: 'b3', jobName: 'Data Analyst', stageName: 'Offer Approval', slaHours: 24, actualHours: 52, assignedRecruiter: 'Priya Sharma' },
  { id: 'b4', jobName: 'DevOps Engineer', stageName: 'Screening Call', slaHours: 24, actualHours: 31, assignedRecruiter: 'Marcus Williams' },
];

const MOCK_STAGE_SLA: StageSla[] = [
  { stageName: 'Application Review', avgHours: 16, limitHours: 24, status: 'green' },
  { stageName: 'Screening Call', avgHours: 22, limitHours: 24, status: 'yellow' },
  { stageName: 'Technical Interview', avgHours: 38, limitHours: 48, status: 'yellow' },
  { stageName: 'Panel Interview', avgHours: 44, limitHours: 72, status: 'green' },
  { stageName: 'Offer Approval', avgHours: 20, limitHours: 24, status: 'yellow' },
  { stageName: 'Background Check', avgHours: 96, limitHours: 120, status: 'green' },
];

const MOCK_AT_RISK: AtRiskItem[] = [
  { id: 'r1', type: 'candidate', name: 'Elena Vasquez', stage: 'Technical Interview', hoursRemaining: 4, assignee: 'Sofia Martinez' },
  { id: 'r2', type: 'interview', name: 'Panel: Alex Kim', stage: 'Panel Interview', hoursRemaining: 8, assignee: 'James Chen' },
  { id: 'r3', type: 'candidate', name: 'David Park', stage: 'Offer Approval', hoursRemaining: 2, assignee: 'Priya Sharma' },
  { id: 'r4', type: 'candidate', name: 'Lisa Thompson', stage: 'Screening Call', hoursRemaining: 6, assignee: 'Marcus Williams' },
];

const MOCK_HISTORY: SlaHistoryPoint[] = [
  { date: 'Jan', compliance: 82 }, { date: 'Feb', compliance: 84 }, { date: 'Mar', compliance: 81 },
  { date: 'Apr', compliance: 85 }, { date: 'May', compliance: 83 }, { date: 'Jun', compliance: 86 },
  { date: 'Jul', compliance: 88 }, { date: 'Aug', compliance: 85 }, { date: 'Sep', compliance: 87 },
  { date: 'Oct', compliance: 86 }, { date: 'Nov', compliance: 88 }, { date: 'Dec', compliance: 87 },
];

/* ================================================================== */
/*  Preset                                                             */
/* ================================================================== */
export const StandardBhSlaMonitor = createPreset<BhSlaMonitorProps>({
  name: 'BhSlaMonitor.Standard',
  render: ({ primitives, props, tokens }: PresetContext<BhSlaMonitorProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      compliance: compProp,
      breaches: brProp,
      stageSlaData: stageProp,
      atRiskItems: riskProp,
      history: histProp,
      timeRange: trProp,
      onTimeRangeChange,
      selectedStage: selStageProp,
      onStageSelect,
      className,
      style,
    } = props;

    const compliance = compProp ?? MOCK_COMPLIANCE;
    const breaches = brProp?.length ? brProp : MOCK_BREACHES;
    const stageSlaData = stageProp?.length ? stageProp : MOCK_STAGE_SLA;
    const atRiskItems = riskProp?.length ? riskProp : MOCK_AT_RISK;
    const history = histProp?.length ? histProp : MOCK_HISTORY;

    const [timeRange, setTimeRange] = useState(trProp ?? '7d');
    const [selectedStage, setSelectedStage] = useState<string | null>(selStageProp ?? null);
    const [activeTab, setActiveTab] = useState<'breaches' | 'at-risk'>('breaches');

    const handleTimeRange = useCallback((val: string) => {
      setTimeRange(val);
      onTimeRangeChange?.(val);
    }, [onTimeRangeChange]);

    const handleStageSelect = useCallback((stage: string) => {
      const next = selectedStage === stage ? null : stage;
      setSelectedStage(next);
      onStageSelect?.(next);
    }, [selectedStage, onStageSelect]);

    const handleTabChange = useCallback((tab: 'breaches' | 'at-risk') => {
      setActiveTab(tab);
    }, []);

    /* ---- Computed ---- */
    const statusColors = useMemo(() => getSlaStatusColors(t), [t]);
    const compColor = useMemo(() => getComplianceColor(t, compliance.percentage), [t, compliance.percentage]);
    const histMin = useMemo(() => Math.min(...history.map(h => h.compliance), 0), [history]);
    const histMax = useMemo(() => Math.max(...history.map(h => h.compliance), 100), [history]);
    const histRange = histMax - histMin || 1;

    /* ---- Styles ---- */
    const card = useMemo(() => createCardStyle(t, { padding: 28 }), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const typo = useMemo(() => getPersonalityTypography(t), [t]);

    const glassStyle = useMemo(() => {
      if (t.surface.useGlass && t.glass) {
        return {
          backdropFilter: t.glass.blur,
          WebkitBackdropFilter: t.glass.blur,
        };
      }
      return {};
    }, [t]);

    /* ================================================================ */
    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column' as const, width: '100%', gap: t.spacing[5], padding: t.spacing[7], backgroundColor: t.colors.neutral[50], minHeight: '100%', ...glassStyle, ...style }} role="region" aria-label="SLA Monitor Dashboard">

        {/* === Header === */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
            <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.primaryScale[100] })}>
              <Shield size={22} color={t.colors.primaryScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: typo.headingWeight, color: t.colors.neutral[900], letterSpacing: typo.headingLetterSpacing }}>
                SLA Monitor
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500]}}>
                {breaches.length} active breach{breaches.length !== 1 ? 'es' : ''} -- {atRiskItems.length} at risk
              </Text>
            </Box>
          </Box>

          {/* Time range toggle */}
          <Box style={{ display: 'flex', gap: t.spacing[1] }} role="radiogroup" aria-label="Time range">
            {TIME_RANGE_OPTIONS.map(opt => (
              <Box
                key={opt.value}
                onClick={() => handleTimeRange(opt.value)}
                role="radio"
                aria-checked={timeRange === opt.value}
                tabIndex={0}
                style={{
                  padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                  borderRadius: badgeRadius,
                  cursor: 'pointer',
                  backgroundColor: timeRange === opt.value ? t.colors.primaryScale[600] : t.colors.neutral[100],
                  transition: `all ${t.motion.hover}`,
                }}
              >
                <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: timeRange === opt.value ? t.colors.common.white : t.colors.neutral[600] }}>
                  {opt.label}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>

        {/* === Compliance Hero + Stage Bars === */}
        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: t.spacing[5] }}>

          {/* Compliance gauge */}
          <Box style={{ ...card, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center' }} role="status" aria-label={`Overall compliance: ${compliance.percentage.toFixed(1)}%`}>
            <Text style={{ ...sectionLabel, marginBottom: t.spacing[4] }}>Overall Compliance</Text>
            <svg width={160} height={100} viewBox="0 0 160 100" role="img" aria-hidden="true">
              {/* Background arc */}
              <path
                d={`M 20 90 A 60 60 0 0 1 140 90`}
                fill="none"
                stroke={t.colors.neutral[100]}
                strokeWidth={12}
                strokeLinecap="round"
              />
              {/* Value arc */}
              {(() => {
                const pct = Math.min(compliance.percentage / 100, 1);
                const angle = Math.PI * pct;
                const x = 80 - 60 * Math.cos(angle);
                const y = 90 - 60 * Math.sin(angle);
                const largeArc = pct > 0.5 ? 1 : 0;
                return (
                  <path
                    d={`M 20 90 A 60 60 0 ${largeArc} 1 ${x} ${y}`}
                    fill="none"
                    stroke={compColor.color}
                    strokeWidth={12}
                    strokeLinecap="round"
                  />
                );
              })()}
              <text x={80} y={78} textAnchor="middle" fontSize={28} fontWeight={700} fill={compColor.color}>
                {compliance.percentage.toFixed(1)}%
              </text>
            </svg>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginTop: t.spacing[3] }}>
              {compliance.trend === 'up' && <TrendingUp size={14} color={t.colors.successScale[600]} />}
              {compliance.trend === 'down' && <TrendingDown size={14} color={t.colors.errorScale[600]} />}
              {compliance.trend === 'stable' && <Minus size={14} color={t.colors.neutral[500]} />}
              <Text style={{ fontSize: t.typography.fontSize.sm, color: compliance.trend === 'up' ? t.colors.successScale[600] : compliance.trend === 'down' ? t.colors.errorScale[600] : t.colors.neutral[500], fontWeight: t.typography.fontWeight.medium }}>
                {compliance.trend === 'up' ? 'Improving' : compliance.trend === 'down' ? 'Declining' : 'Stable'}
              </Text>
            </Box>
          </Box>

          {/* Stage SLA bars */}
          <Box style={{ ...card }} role="list" aria-label="Stage performance">
            <Text style={{ ...sectionLabel, marginBottom: t.spacing[4] }}>Stage Performance</Text>
            {stageSlaData.map(stage => {
              const pct = (stage.avgHours / stage.limitHours) * 100;
              const sColors = statusColors[stage.status];
              const isSelected = selectedStage === stage.stageName;
              return (
                <Box
                  key={stage.stageName}
                  onClick={() => handleStageSelect(stage.stageName)}
                  role="listitem"
                  tabIndex={0}
                  aria-selected={isSelected}
                  aria-label={`${stage.stageName}: ${stage.avgHours}h of ${stage.limitHours}h limit`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: t.spacing[3],
                    marginBottom: t.spacing[3],
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                    borderRadius: t.borderRadius.md,
                    cursor: 'pointer',
                    backgroundColor: isSelected ? sColors.bg : 'transparent',
                    transition: `background-color ${t.motion.hover}`,
                  }}
                >
                  <Box style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: sColors.dot, flexShrink: 0 }} />
                  <Text style={{ width: 140, fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], fontWeight: t.typography.fontWeight.medium, flexShrink: 0 }}>
                    {stage.stageName}
                  </Text>
                  <Box style={{ flex: 1, position: 'relative' as const, height: 20 }}>
                    <Box style={{ position: 'absolute' as const, inset: 0, borderRadius: t.borderRadius.sm, backgroundColor: t.colors.neutral[100] }} />
                    <Box style={{
                      position: 'absolute' as const, top: 0, left: 0, height: '100%',
                      width: `${Math.min(pct, 100)}%`,
                      borderRadius: t.borderRadius.sm,
                      backgroundColor: sColors.dot,
                      opacity: 0.7,
                      transition: `width ${t.motion.hover}`,
                    }} />
                    {/* SLA limit marker */}
                    <Box style={{ position: 'absolute' as const, top: -2, left: '100%', width: 2, height: 'calc(100% + 4px)', backgroundColor: t.colors.neutral[400], borderRadius: 1 }} />
                  </Box>
                  <Text style={{ width: 80, fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], textAlign: 'right' as const, flexShrink: 0 }}>
                    {stage.avgHours}h / {stage.limitHours}h
                  </Text>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* === Breaches & At-Risk (tabbed) + History Chart === */}
        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[5] }}>

          {/* Left: Breaches / At-risk */}
          <Box style={{ ...card, padding: 0, overflow: 'hidden' }}>
            {/* Tab header */}
            <Box style={{ display: 'flex', borderBottom: `1px solid ${t.colors.neutral[200]}` }} role="tablist" aria-label="Alert categories">
              {(['breaches', 'at-risk'] as const).map(tab => (
                <Box
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  role="tab"
                  tabIndex={0}
                  aria-selected={activeTab === tab}
                  aria-controls={`panel-${tab}`}
                  style={{
                    flex: 1,
                    padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                    cursor: 'pointer',
                    textAlign: 'center' as const,
                    borderBottom: activeTab === tab ? `2px solid ${t.colors.primaryScale[600]}` : '2px solid transparent',
                    backgroundColor: activeTab === tab ? t.colors.primaryScale[50] : 'transparent',
                    transition: `all ${t.motion.hover}`,
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: t.spacing[1] }}>
                    {tab === 'breaches' ? <XCircle size={14} color={activeTab === tab ? t.colors.errorScale[600] : t.colors.neutral[400]} /> : <Timer size={14} color={activeTab === tab ? t.colors.warningScale[600] : t.colors.neutral[400]} />}
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: activeTab === tab ? t.colors.neutral[800] : t.colors.neutral[500] }}>
                      {tab === 'breaches' ? `Breaches (${breaches.length})` : `At Risk (${atRiskItems.length})`}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Tab content */}
            <Box style={{ padding: t.spacing[4], maxHeight: 320, overflow: 'auto' }} role="tabpanel" id={`panel-${activeTab}`}>
              {activeTab === 'breaches' && breaches.map(breach => (
                <Box key={breach.id} role="listitem" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[3],
                  padding: `${t.spacing[3]}px ${t.spacing[3]}px`,
                  marginBottom: t.spacing[2],
                  borderRadius: t.borderRadius.md,
                  border: `1px solid ${t.colors.errorScale[200]}`,
                  backgroundColor: t.colors.errorScale[50],
                }}>
                  <Box style={createIconContainerStyle(t, { size: 32, color: t.colors.errorScale[100] })}>
                    <AlertTriangle size={16} color={t.colors.errorScale[600]} />
                  </Box>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1 }}>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>
                      {breach.jobName}
                    </Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500]}}>
                      {breach.stageName} -- {breach.assignedRecruiter}
                    </Text>
                  </Box>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], textAlign: 'right' as const }}>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.errorScale[600] }}>
                      {breach.actualHours}h
                    </Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                      SLA: {breach.slaHours}h
                    </Text>
                  </Box>
                </Box>
              ))}

              {activeTab === 'at-risk' && atRiskItems.map(item => {
                const urgentColor = item.hoursRemaining <= 4 ? t.colors.errorScale[600] : t.colors.warningScale[600];
                const urgentBg = item.hoursRemaining <= 4 ? t.colors.errorScale[50] : t.colors.warningScale[50];
                const urgentBorderColor = item.hoursRemaining <= 4 ? t.colors.errorScale[200] : t.colors.warningScale[200];
                return (
                  <Box key={item.id} role="listitem" aria-label={`${item.name}: ${item.hoursRemaining}h remaining`} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: t.spacing[3],
                    padding: `${t.spacing[3]}px ${t.spacing[3]}px`,
                    marginBottom: t.spacing[2],
                    borderRadius: t.borderRadius.md,
                    border: `1px solid ${urgentBorderColor}`,
                    backgroundColor: urgentBg,
                  }}>
                  <Box style={createIconContainerStyle(t, { size: 32, color: t.colors.neutral[100] })}>
                    <Timer size={16} color={urgentColor} />
                  </Box>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1 }}>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>
                      {item.name}
                    </Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500]}}>
                      {item.stage} -- {item.assignee}
                    </Text>
                  </Box>
                  <Box style={{
                    padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                    borderRadius: badgeRadius,
                    backgroundColor: urgentBg,
                    border: `1px solid ${urgentBorderColor}`,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: urgentColor }}>
                      {item.hoursRemaining}h left
                    </Text>
                  </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Right: History chart */}
          <Box style={{ ...card }}>
            <Text style={{ ...sectionLabel, marginBottom: t.spacing[4] }}>Compliance Trend</Text>
            <Box style={{ display: 'flex', justifyContent: 'center' }}>
              <svg width={420} height={200} viewBox="0 0 420 200" role="img" aria-label="Compliance trend chart">
                {/* Grid */}
                {[0, 0.25, 0.5, 0.75, 1].map(frac => {
                  const y = 16 + (1 - frac) * 150;
                  const val = (histMin + frac * histRange).toFixed(0);
                  return (
                    <g key={frac}>
                      <line x1={36} y1={y} x2={400} y2={y} stroke={t.colors.neutral[100]} strokeWidth={1} />
                      <text x={32} y={y + 4} fontSize={9} fill={t.colors.neutral[400]} textAnchor="end">{val}%</text>
                    </g>
                  );
                })}
                {/* 90% threshold line */}
                {(() => {
                  const y = 16 + (1 - (90 - histMin) / histRange) * 150;
                  return <line x1={36} y1={y} x2={400} y2={y} stroke={t.colors.successScale[300]} strokeWidth={1} strokeDasharray="4 4" />;
                })()}
                {/* Line + area */}
                {history.length > 1 && (() => {
                  const xStep = 364 / Math.max(history.length - 1, 1);
                  const points = history.map((h, i) => ({
                    x: 36 + i * xStep,
                    y: 16 + (1 - (h.compliance - histMin) / histRange) * 150,
                  }));
                  const lineColor = t.colors.primaryScale[500];
                  const areaPath = `M${points[0].x},${points[0].y} ${points.slice(1).map(p => `L${p.x},${p.y}`).join(' ')} L${points[points.length - 1].x},166 L${points[0].x},166 Z`;
                  return (
                    <g>
                      <defs>
                        <linearGradient id="slaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={lineColor} stopOpacity={0.15} />
                          <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <path d={areaPath} fill="url(#slaGrad)" />
                      <polyline points={points.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={lineColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      {points.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r={3} fill={lineColor} stroke={t.colors.common.white} strokeWidth={2} />
                      ))}
                    </g>
                  );
                })()}
                {/* X labels */}
                {history.map((h, i) => {
                  if (history.length > 8 && i % 2 !== 0) return null;
                  const x = 36 + i * (364 / Math.max(history.length - 1, 1));
                  return <text key={i} x={x} y={190} fontSize={9} fill={t.colors.neutral[400]} textAnchor="middle">{h.date}</text>;
                })}
              </svg>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
