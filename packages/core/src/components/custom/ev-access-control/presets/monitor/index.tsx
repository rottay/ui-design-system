'use client';

/**
 * EvAccessControl - Monitor Preset
 * Live access monitoring dashboard with gate status cards, real-time log feed,
 * zone throughput bars, KPI stats, and search/filter capabilities
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
  createProgressBarStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvAccessControlProps, AccessLog, GateStatus } from '../../core';

const MOCK_LOGS: AccessLog[] = [
  { id: 'l1', personName: 'Maria S.', personType: 'staff', zone: 'VIP', action: 'entry', time: new Date('2026-02-08T20:45:00') },
  { id: 'l2', personName: 'Carlos R.', personType: 'staff', zone: 'Backstage', action: 'entry', time: new Date('2026-02-08T20:42:00') },
  { id: 'l3', personName: 'John D.', personType: 'attendee', zone: 'Main Floor', action: 'entry', time: new Date('2026-02-08T20:40:00') },
  { id: 'l4', personName: 'Unknown', personType: 'attendee', zone: 'VIP', action: 'denied', time: new Date('2026-02-08T20:38:00'), reason: 'Invalid credential' },
  { id: 'l5', personName: 'DJ Cosmic', personType: 'artist', zone: 'Backstage', action: 'entry', time: new Date('2026-02-08T20:35:00') },
  { id: 'l6', personName: 'Sofia T.', personType: 'vendor', zone: 'Main Floor', action: 'exit', time: new Date('2026-02-08T20:33:00') },
  { id: 'l7', personName: 'Pedro K.', personType: 'staff', zone: 'Entry Gate', action: 'entry', time: new Date('2026-02-08T20:30:00') },
  { id: 'l8', personName: 'Laura P.', personType: 'staff', zone: 'Control Room', action: 'entry', time: new Date('2026-02-08T20:28:00') },
  { id: 'l9', personName: 'Guest #241', personType: 'attendee', zone: 'Main Floor', action: 'denied', time: new Date('2026-02-08T20:25:00'), reason: 'Expired ticket' },
  { id: 'l10', personName: 'Ana L.', personType: 'staff', zone: 'Bar Area', action: 'entry', time: new Date('2026-02-08T20:22:00') },
];

const MOCK_GATES: GateStatus[] = [
  { id: 'g1', name: 'Main Entrance', zone: 'Entry', status: 'open', throughput: 145 },
  { id: 'g2', name: 'VIP Gate', zone: 'VIP', status: 'restricted', throughput: 32 },
  { id: 'g3', name: 'Backstage Door', zone: 'Backstage', status: 'restricted', throughput: 18 },
  { id: 'g4', name: 'Emergency Exit A', zone: 'Main Floor', status: 'closed', throughput: 0 },
  { id: 'g5', name: 'Loading Dock', zone: 'Service', status: 'open', throughput: 8 },
  { id: 'g6', name: 'Side Entrance', zone: 'Entry', status: 'open', throughput: 87 },
];

const ACTION_FILTERS = ['all', 'entry', 'exit', 'denied'];
const PERSON_TYPES = ['all', 'staff', 'attendee', 'artist', 'vendor'];

export const MonitorEvAccessControl = createPreset<EvAccessControlProps>({
  name: 'EvAccessControl.Monitor',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvAccessControlProps>) => {
    const { Box, Text } = primitives;
    const { logs, gates, onGateToggle, onLogClick, className, style } = props;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const logData = logs?.length ? logs : MOCK_LOGS;
    const gateData = gates?.length ? gates : MOCK_GATES;

    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [hoveredGate, setHoveredGate] = useState<string | null>(null);
    const [hoveredLog, setHoveredLog] = useState<string | null>(null);

    const filteredLogs = useMemo(() => {
      return logData.filter(l => {
        if (searchTerm && !l.personName.toLowerCase().includes(searchTerm.toLowerCase()) && !l.zone.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (actionFilter !== 'all' && l.action !== actionFilter) return false;
        if (typeFilter !== 'all' && l.personType !== typeFilter) return false;
        return true;
      });
    }, [logData, searchTerm, actionFilter, typeFilter]);

    const totalEntries = logData.filter(l => l.action === 'entry').length;
    const totalExits = logData.filter(l => l.action === 'exit').length;
    const totalDenied = logData.filter(l => l.action === 'denied').length;
    const openGates = gateData.filter(g => g.status === 'open').length;
    const totalThroughput = gateData.reduce((s, g) => s + g.throughput, 0);

    const actionColors: Record<string, { badge: 'success' | 'warning' | 'error' | 'info'; icon: string }> = {
      entry: { badge: 'success', icon: '→' },
      exit: { badge: 'info', icon: '←' },
      denied: { badge: 'error', icon: '✗' },
    };

    const gateStatusColors: Record<string, string> = {
      open: tokens.colors.successScale[500],
      restricted: tokens.colors.warningScale[500],
      closed: tokens.colors.errorScale[500],
    };

    const personTypeColors: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
      staff: 'primary',
      attendee: 'success',
      artist: 'warning',
      vendor: 'info',
    };

    const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[4] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>
              {'🔐'} Access Monitor
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              Live access control {'·'} {filteredLogs.length} events {'·'} {openGates}/{gateData.length} gates open
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <span style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.successScale[500], boxShadow: `0 0 6px ${tokens.colors.successScale[500]}60` }} />
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.successScale[600] }}>Live</Text>
          </div>
        </div>

        {/* KPI Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          {[
            { label: 'Entries', value: totalEntries, color: tokens.colors.successScale[500], icon: '→' },
            { label: 'Exits', value: totalExits, color: tokens.colors.infoScale[500], icon: '←' },
            { label: 'Denied', value: totalDenied, color: tokens.colors.errorScale[500], icon: '✗' },
            { label: 'Open Gates', value: openGates, color: tokens.colors.primaryScale[500], icon: '🚪' },
            { label: 'Throughput', value: totalThroughput, color: tokens.colors.warningScale[500], icon: '📊' },
          ].map(s => (
            <div key={s.label} style={{ ...cardBase, padding: tokens.spacing[3], textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>{s.icon} {s.label}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: s.color, display: 'block' }}>{s.value}</Text>
            </div>
          ))}
        </div>

        {/* Gate Status Cards */}
        <div style={{ marginBottom: tokens.spacing[4] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>{'🚪'} Gate Status</Text>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[3] }}>
            {gateData.map(gate => {
              const maxThroughput = 200;
              const pct = Math.min(Math.round((gate.throughput / maxThroughput) * 100), 100);
              const bar = createProgressBarStyle(tokens, { percent: pct, color: gateStatusColors[gate.status] });
              const isHovered = hoveredGate === gate.id;
              return (
                <div
                  key={gate.id}
                  onClick={() => onGateToggle?.(gate.id)}
                  onMouseEnter={() => setHoveredGate(gate.id)}
                  onMouseLeave={() => setHoveredGate(null)}
                  style={{
                    ...cardBase,
                    padding: tokens.spacing[3],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    ...(isHovered ? { transform: 'translateY(-2px)', boxShadow: tokens.shadows.md } : {}),
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[2] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{gate.name}</Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                      <span style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: gateStatusColors[gate.status] }} />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: gateStatusColors[gate.status], textTransform: 'capitalize' as const }}>{gate.status}</Text>
                    </div>
                  </div>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[2] }}>{gate.zone} {'·'} {gate.throughput} people/hr</Text>
                  <div style={bar.track}><div style={bar.fill} /></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Access Log */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
          <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>{'📋'} Access Log</Text>
            <div style={{ display: 'flex', gap: tokens.spacing[3], alignItems: 'center', flexWrap: 'wrap' as const }}>
              <div style={{ flex: 1, minWidth: 180, position: 'relative' as const }}>
                <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>{'🔍'}</div>
                <input type="text" placeholder="Search name or zone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                {ACTION_FILTERS.map(f => (
                  <div key={f} onClick={() => setActionFilter(f)} style={createFilterPillStyle(tokens, { active: actionFilter === f })}>
                    {f === 'all' ? 'All Actions' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                {PERSON_TYPES.map(t => (
                  <div key={t} onClick={() => setTypeFilter(t)} style={createFilterPillStyle(tokens, { active: typeFilter === t })}>
                    {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div style={{ textAlign: 'center' as const, padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
              <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'🔐'}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>No access events match your filters</Text>
            </div>
          ) : (
            filteredLogs.map(log => {
              const ac = actionColors[log.action];
              const isHovered = hoveredLog === log.id;
              return (
                <div
                  key={log.id}
                  onClick={() => onLogClick?.(log.id)}
                  onMouseEnter={() => setHoveredLog(log.id)}
                  onMouseLeave={() => setHoveredLog(null)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                    backgroundColor: isHovered ? tokens.colors.neutral[50] : 'transparent',
                    cursor: 'pointer',
                    transition: `background-color ${tokens.motion.hover}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: tokens.borderRadius.full,
                      backgroundColor: log.action === 'denied' ? tokens.colors.errorScale[100] : tokens.colors.primaryScale[100],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold,
                      color: log.action === 'denied' ? tokens.colors.errorScale[700] : tokens.colors.primaryScale[700],
                    }}>
                      {log.personName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], display: 'block' }}>{log.personName}</Text>
                      <div style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'center' }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{log.zone}</Text>
                        {log.reason && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.errorScale[500] }}>{log.reason}</Text>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <span style={createBadgeStyle(tokens, personTypeColors[log.personType])}>{log.personType}</span>
                    <span style={createBadgeStyle(tokens, ac.badge)}>{ac.icon} {log.action}</span>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], minWidth: 60, textAlign: 'right' as const }}>{formatTime(log.time)}</Text>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Box>
    );
  },
});
