'use client';

/**
 * ActivityMonitor - Dashboard Preset
 * Timeline chart + log list + detail panel
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { ActivityMonitorProps, TimeRange, DetailTab } from '../../core';
import { getLogStatusColors, getEvaluationColors, getTimeRangeOptions, calculateBarHeight } from '../../core';
import {
  createBadgeStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
} from '../../../helpers';

export const DashboardActivityMonitor = createPreset<ActivityMonitorProps>({
  name: 'ActivityMonitor.Dashboard',
  render: ({ primitives, props, tokens, engine }: PresetContext<ActivityMonitorProps>) => {
    const { Box, Stack } = primitives;
    const logStatusColors = getLogStatusColors(tokens);
    const evalColors = getEvaluationColors(tokens);
    const timeRangeOptions = getTimeRangeOptions();

    const {
      logs,
      timeline = [],
      timeRange: timeRangeProp,
      onTimeRangeChange,
      selectedLogId: selectedLogIdProp,
      onLogSelect,
      activeDetailTab: activeDetailTabProp,
      onDetailTabChange,
      onRefresh,
      title = 'Monitor',
      sortColumn,
      sortDirection,
      onSort,
      loading,
      className,
      style,
    } = props;

    const [internalTimeRange, setInternalTimeRange] = useState<TimeRange>(timeRangeProp ?? '24h');
    const [internalSelectedLog, setInternalSelectedLog] = useState(selectedLogIdProp ?? '');
    const [internalDetailTab, setInternalDetailTab] = useState<DetailTab>(activeDetailTabProp ?? 'completion');

    const currentTimeRange = timeRangeProp ?? internalTimeRange;
    const selectedLogId = selectedLogIdProp ?? internalSelectedLog;
    const activeDetailTab = activeDetailTabProp ?? internalDetailTab;

    const handleTimeRange = (range: TimeRange) => {
      setInternalTimeRange(range);
      onTimeRangeChange?.(range);
    };

    const handleLogSelect = (logId: string) => {
      setInternalSelectedLog(logId);
      onLogSelect?.(logId);
    };

    const handleDetailTab = (tab: DetailTab) => {
      setInternalDetailTab(tab);
      onDetailTabChange?.(tab);
    };

    const selectedLog = logs.find(l => l.id === selectedLogId);
    const maxBarValue = Math.max(...timeline.map(p => p.successCount + p.errorCount), 1);
    const maxBarHeight = 60;

    const detailTabs: Array<{ key: DetailTab; label: string }> = [
      { key: 'completion', label: 'Completion' },
      { key: 'variables', label: 'Variables' },
      { key: 'evaluations', label: 'Evaluations' },
      { key: 'raw', label: 'Raw' },
    ];

    const columns = [
      { key: 'timestamp', label: 'Time' },
      { key: 'name', label: 'Name' },
      { key: 'latency', label: 'Latency' },
      { key: 'status', label: 'Status' },
      { key: 'cost', label: 'Cost' },
    ];

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: tokens.colors.common.white, ...style }}>
        {/* Header */}
        <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{title}</h2>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            {/* Time range selector */}
            <Box style={{ display: 'flex', gap: tokens.spacing[1], padding: tokens.spacing[1], backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.md }}>
              {timeRangeOptions.map((opt) => (
                <button key={opt.value} onClick={() => handleTimeRange(opt.value)} style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.sm, border: 'none',
                  backgroundColor: currentTimeRange === opt.value ? tokens.colors.common.white : 'transparent',
                  color: currentTimeRange === opt.value ? tokens.colors.neutral[900] : tokens.colors.neutral[500],
                  fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit',
                  transition: `all ${tokens.motion.hover}`,
                  fontWeight: currentTimeRange === opt.value ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                  boxShadow: currentTimeRange === opt.value ? tokens.shadows.sm : 'none',
                }}>
                  {opt.value}
                </button>
              ))}
            </Box>
            <button onClick={onRefresh} style={{
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.sm, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: 'transparent', color: tokens.colors.neutral[600],
              fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit',
              transition: `all ${tokens.motion.hover}`,
            }}>
              ↻
            </button>
          </Box>
        </Box>

        {/* Timeline chart */}
        {timeline.length > 0 && (
          <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, height: maxBarHeight + tokens.spacing[8] }}>
            <Box style={{ display: 'flex', alignItems: 'flex-end', gap: tokens.spacing[1], height: maxBarHeight }}>
              {timeline.map((point, idx) => {
                const successH = calculateBarHeight(point.successCount, maxBarValue, maxBarHeight);
                const errorH = calculateBarHeight(point.errorCount, maxBarValue, maxBarHeight);
                return (
                  <Box key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }} title={point.label ?? point.timestamp}>
                    {errorH > 0 && <Box style={{ width: '100%', height: errorH, backgroundColor: tokens.colors.errorScale[400], borderRadius: `${tokens.borderRadius.sm} ${tokens.borderRadius.sm} 0 0` }} />}
                    {successH > 0 && <Box style={{ width: '100%', height: successH, backgroundColor: tokens.colors.successScale[400], borderRadius: errorH > 0 ? '0' : `${tokens.borderRadius.sm} ${tokens.borderRadius.sm} 0 0` }} />}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Main content */}
        <Box style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Log table */}
          <Box style={{ flex: 1, overflow: 'auto' }}>
            {loading ? (
              <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>Loading...</Box>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col.key} onClick={() => onSort?.(col.key)} style={{
                        textAlign: 'left', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[500], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        cursor: onSort ? 'pointer' : 'default', userSelect: 'none',
                        backgroundColor: tokens.colors.neutral[50],
                      }}>
                        {col.label}
                        {sortColumn === col.key && <span style={{ marginLeft: tokens.spacing[1] }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const sColors = logStatusColors[log.status];
                    const isSelected = log.id === selectedLogId;
                    return (
                      <tr key={log.id} onClick={() => handleLogSelect(log.id)} style={{
                        cursor: 'pointer',
                        backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                        transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                      }}>
                        <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, fontWeight: tokens.typography.fontWeight.medium }}>
                          {log.name}
                        </td>
                        <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                          {log.latency}
                        </td>
                        <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1],
                            padding: `0 ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.sm,
                            fontSize: tokens.typography.fontSize.xs,
                            color: sColors.color, backgroundColor: sColors.bgColor,
                          }}>
                            <span style={{ width: tokens.spacing[1], height: tokens.spacing[1], borderRadius: tokens.borderRadius.full, backgroundColor: sColors.dot }} />
                            {log.status}
                          </span>
                        </td>
                        <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                          {log.cost ?? '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Box>

          {/* Detail panel */}
          {selectedLog?.detail && (
            <Box style={{ width: 360, borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
              {/* Detail tabs */}
              <Box style={{ display: 'flex', borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, padding: `0 ${tokens.spacing[3]}px` }}>
                {detailTabs.map((tab) => (
                  <button key={tab.key} onClick={() => handleDetailTab(tab.key)} style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`, border: 'none',
                    borderBottom: activeDetailTab === tab.key ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[900]}` : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} transparent`,
                    backgroundColor: 'transparent',
                    color: activeDetailTab === tab.key ? tokens.colors.neutral[900] : tokens.colors.neutral[500],
                    fontWeight: activeDetailTab === tab.key ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                    fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit',
                    transition: `all ${tokens.motion.hover}`,
                  }}>
                    {tab.label}
                  </button>
                ))}
              </Box>

              <Box style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[3] }}>
                {activeDetailTab === 'completion' && (
                  <Stack direction="vertical" spacing="sm">
                    <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' }}>Metrics</Box>
                    {Object.entries(selectedLog.detail.metrics).map(([key, val]) => (
                      <Box key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: tokens.typography.fontSize.sm }}>
                        <span style={{ color: tokens.colors.neutral[600] }}>{key}</span>
                        <span style={{ color: tokens.colors.neutral[900], fontWeight: tokens.typography.fontWeight.medium }}>{String(val)}</span>
                      </Box>
                    ))}
                  </Stack>
                )}
                {activeDetailTab === 'evaluations' && selectedLog.detail.evaluations && (
                  <Stack direction="vertical" spacing="sm">
                    {selectedLog.detail.evaluations.map((evaluation, idx) => {
                      const eColors = evalColors[evaluation.result];
                      return (
                        <Box key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${eColors.border}` }}>
                          <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{evaluation.label}</span>
                          <span style={{ padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: eColors.color, backgroundColor: eColors.bgColor }}>
                            {evaluation.result.toUpperCase()}
                          </span>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
                {activeDetailTab === 'raw' && (
                  <pre style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700], whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0, padding: tokens.spacing[2], backgroundColor: tokens.colors.neutral[50], borderRadius: tokens.borderRadius.sm }}>
                    {selectedLog.detail.rawData ?? JSON.stringify(selectedLog.detail.metrics, null, 2)}
                  </pre>
                )}
                {activeDetailTab === 'variables' && (
                  <Stack direction="vertical" spacing="sm">
                    {selectedLog.detail.input && (
                      <>
                        <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' }}>Input</Box>
                        <pre style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700], whiteSpace: 'pre-wrap', margin: 0, padding: tokens.spacing[2], backgroundColor: tokens.colors.neutral[50], borderRadius: tokens.borderRadius.sm }}>{selectedLog.detail.input}</pre>
                      </>
                    )}
                    {selectedLog.detail.output && (
                      <>
                        <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', marginTop: tokens.spacing[2] }}>Output</Box>
                        <pre style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700], whiteSpace: 'pre-wrap', margin: 0, padding: tokens.spacing[2], backgroundColor: tokens.colors.neutral[50], borderRadius: tokens.borderRadius.sm }}>{selectedLog.detail.output}</pre>
                      </>
                    )}
                  </Stack>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
