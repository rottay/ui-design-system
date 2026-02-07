'use client';

/**
 * ActivityMonitor - Compact Preset
 * Log list with inline detail expansion
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { ActivityMonitorProps, TimeRange, DetailTab } from '../../core';
import { getLogStatusColors, getEvaluationColors, getTimeRangeOptions } from '../../core';

export const CompactActivityMonitor = createPreset<ActivityMonitorProps>({
  name: 'ActivityMonitor.Compact',
  render: ({ primitives, props, tokens, engine }: PresetContext<ActivityMonitorProps>) => {
    const { Box, Stack } = primitives;
    const logStatusColors = getLogStatusColors(tokens);
    const evalColors = getEvaluationColors(tokens);
    const timeRangeOptions = getTimeRangeOptions();

    const {
      logs,
      timeRange: timeRangeProp,
      onTimeRangeChange,
      selectedLogId: selectedLogIdProp,
      onLogSelect,
      activeDetailTab: activeDetailTabProp,
      onDetailTabChange,
      onRefresh,
      title = 'Activity',
      loading,
      className,
      style,
    } = props;

    const [internalTimeRange, setInternalTimeRange] = useState<TimeRange>(timeRangeProp ?? '24h');
    const [expandedLogId, setExpandedLogId] = useState(selectedLogIdProp ?? '');
    const [internalDetailTab, setInternalDetailTab] = useState<DetailTab>(activeDetailTabProp ?? 'completion');

    const currentTimeRange = timeRangeProp ?? internalTimeRange;
    const activeDetailTab = activeDetailTabProp ?? internalDetailTab;

    const handleTimeRange = (range: TimeRange) => {
      setInternalTimeRange(range);
      onTimeRangeChange?.(range);
    };

    const handleLogClick = (logId: string) => {
      const newId = expandedLogId === logId ? '' : logId;
      setExpandedLogId(newId);
      onLogSelect?.(newId);
    };

    const handleDetailTab = (tab: DetailTab) => {
      setInternalDetailTab(tab);
      onDetailTabChange?.(tab);
    };

    const detailTabs: Array<{ key: DetailTab; label: string }> = [
      { key: 'completion', label: 'Completion' },
      { key: 'evaluations', label: 'Evaluations' },
      { key: 'raw', label: 'Raw' },
    ];

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: tokens.colors.common.white, ...style }}>
        {/* Header */}
        <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{title}</h3>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <Box style={{ display: 'flex', gap: 0, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, borderRadius: tokens.borderRadius.md, overflow: 'hidden' }}>
              {timeRangeOptions.map((opt) => (
                <button key={opt.value} onClick={() => handleTimeRange(opt.value)} style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, border: 'none',
                  backgroundColor: currentTimeRange === opt.value ? tokens.colors.neutral[100] : 'transparent',
                  color: currentTimeRange === opt.value ? tokens.colors.neutral[900] : tokens.colors.neutral[500],
                  fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  {opt.value}
                </button>
              ))}
            </Box>
            <button onClick={onRefresh} style={{
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, borderRadius: tokens.borderRadius.sm,
              backgroundColor: 'transparent', color: tokens.colors.neutral[600],
              fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              ↻
            </button>
          </Box>
        </Box>

        {/* Log list */}
        <Box style={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>Loading...</Box>
          ) : (
            <Stack direction="vertical" spacing="none">
              {logs.map((log) => {
                const sColors = logStatusColors[log.status];
                const isExpanded = log.id === expandedLogId;

                return (
                  <Box key={log.id}>
                    <Box onClick={() => handleLogClick(log.id)} style={{
                      display: 'flex', alignItems: 'center', gap: tokens.spacing[3],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      cursor: 'pointer',
                      backgroundColor: isExpanded ? tokens.colors.neutral[50] : 'transparent',
                      transition: `background-color ${tokens.motion.hover}`,
                    }}>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: `all ${tokens.motion.hover}`, color: tokens.colors.neutral[400] }}>▶</span>
                      <span style={{ width: tokens.spacing[2], height: tokens.spacing[2], borderRadius: tokens.borderRadius.full, backgroundColor: sColors.dot, flexShrink: 0 }} />
                      <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], fontWeight: tokens.typography.fontWeight.medium, flex: 1 }}>{log.name}</span>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{log.latency}</span>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      {log.cost && <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{log.cost}</span>}
                    </Box>

                    {/* Expanded detail */}
                    {isExpanded && log.detail && (
                      <Box style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.neutral[50], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
                        <Box style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                          {detailTabs.map((tab) => (
                            <button key={tab.key} onClick={() => handleDetailTab(tab.key)} style={{
                              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.sm, border: 'none',
                              backgroundColor: activeDetailTab === tab.key ? tokens.colors.common.white : 'transparent',
                              color: activeDetailTab === tab.key ? tokens.colors.neutral[900] : tokens.colors.neutral[500],
                              fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit',
                              boxShadow: activeDetailTab === tab.key ? tokens.shadows.sm : 'none',
                            }}>
                              {tab.label}
                            </button>
                          ))}
                        </Box>

                        {activeDetailTab === 'completion' && (
                          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: tokens.spacing[2] }}>
                            {Object.entries(log.detail.metrics).map(([key, val]) => (
                              <Box key={key} style={{ padding: tokens.spacing[2], backgroundColor: tokens.colors.common.white, borderRadius: tokens.borderRadius.sm, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
                                <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{key}</Box>
                                <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], marginTop: tokens.spacing[1] }}>{String(val)}</Box>
                              </Box>
                            ))}
                          </Box>
                        )}

                        {activeDetailTab === 'evaluations' && log.detail.evaluations && (
                          <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[2] }}>
                            {log.detail.evaluations.map((evaluation, idx) => {
                              const eColors = evalColors[evaluation.result];
                              return (
                                <span key={idx} style={{
                                  display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1],
                                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                                  borderRadius: tokens.borderRadius.sm,
                                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${eColors.border}`,
                                  fontSize: tokens.typography.fontSize.xs,
                                }}>
                                  <span style={{ color: tokens.colors.neutral[700] }}>{evaluation.label}</span>
                                  <span style={{ fontWeight: tokens.typography.fontWeight.semibold, color: eColors.color }}>{evaluation.result}</span>
                                </span>
                              );
                            })}
                          </Box>
                        )}

                        {activeDetailTab === 'raw' && (
                          <pre style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700], whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0, padding: tokens.spacing[2], backgroundColor: tokens.colors.common.white, borderRadius: tokens.borderRadius.sm, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
                            {log.detail.rawData ?? JSON.stringify(log.detail.metrics, null, 2)}
                          </pre>
                        )}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>
      </Box>
    );
  },
});
