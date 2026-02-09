'use client';

/**
 * EvAccessControl - Config Preset
 * Zone-based access configuration with permission matrix, gate settings,
 * role-zone mapping table, and incident alert rules
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
import type { EvAccessControlProps, GateStatus } from '../../core';

const MOCK_GATES: GateStatus[] = [
  { id: 'g1', name: 'Main Entrance', zone: 'Entry', status: 'open', throughput: 145 },
  { id: 'g2', name: 'VIP Gate', zone: 'VIP', status: 'restricted', throughput: 32 },
  { id: 'g3', name: 'Backstage Door', zone: 'Backstage', status: 'restricted', throughput: 18 },
  { id: 'g4', name: 'Emergency Exit A', zone: 'Main Floor', status: 'closed', throughput: 0 },
  { id: 'g5', name: 'Loading Dock', zone: 'Service', status: 'open', throughput: 8 },
  { id: 'g6', name: 'Side Entrance', zone: 'Entry', status: 'open', throughput: 87 },
];

const ZONES = ['Main Floor', 'VIP', 'Backstage', 'Entry', 'Service', 'Control Room'];

const ROLES = [
  { role: 'Bartender', zones: ['Main Floor', 'VIP', 'Entry'], level: 'standard' },
  { role: 'Security', zones: ['Main Floor', 'VIP', 'Backstage', 'Entry', 'Service'], level: 'elevated' },
  { role: 'Sound Tech', zones: ['Main Floor', 'Backstage', 'Service'], level: 'standard' },
  { role: 'Stage Manager', zones: ['Main Floor', 'VIP', 'Backstage', 'Entry', 'Service', 'Control Room'], level: 'admin' },
  { role: 'Server', zones: ['Main Floor', 'VIP', 'Entry'], level: 'standard' },
  { role: 'Event Coord', zones: ZONES, level: 'admin' },
  { role: 'Vendor', zones: ['Main Floor', 'Service'], level: 'limited' },
  { role: 'Artist', zones: ['Main Floor', 'Backstage'], level: 'standard' },
];

const ALERT_RULES = [
  { id: 'a1', name: 'Denied Entry Alert', trigger: 'denied', zone: 'All Zones', threshold: 3, window: '15 min', enabled: true },
  { id: 'a2', name: 'VIP Overcapacity', trigger: 'capacity', zone: 'VIP', threshold: 80, window: 'Continuous', enabled: true },
  { id: 'a3', name: 'Backstage Intrusion', trigger: 'unauthorized', zone: 'Backstage', threshold: 1, window: 'Immediate', enabled: true },
  { id: 'a4', name: 'Gate Offline', trigger: 'offline', zone: 'All Gates', threshold: 1, window: '5 min', enabled: false },
  { id: 'a5', name: 'Mass Exit Detection', trigger: 'exit_surge', zone: 'Main Floor', threshold: 50, window: '10 min', enabled: true },
];

export const ConfigEvAccessControl = createPreset<EvAccessControlProps>({
  name: 'EvAccessControl.Config',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvAccessControlProps>) => {
    const { Box, Text } = primitives;
    const { gates, onGateToggle, className, style } = props;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const gateData = gates?.length ? gates : MOCK_GATES;

    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<string>('permissions');
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [hoveredGate, setHoveredGate] = useState<string | null>(null);

    const filteredRoles = useMemo(() => {
      if (!searchTerm) return ROLES;
      return ROLES.filter(r => r.role.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm]);

    const gateStatusConfig: Record<string, { color: string; badge: 'success' | 'warning' | 'error' }> = {
      open: { color: tokens.colors.successScale[500], badge: 'success' },
      restricted: { color: tokens.colors.warningScale[500], badge: 'warning' },
      closed: { color: tokens.colors.errorScale[500], badge: 'error' },
    };

    const levelColors: Record<string, 'error' | 'warning' | 'success' | 'info'> = {
      admin: 'error',
      elevated: 'warning',
      standard: 'success',
      limited: 'info',
    };

    const TABS = ['permissions', 'gates', 'alerts'];

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[4] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>
              {'⚙️'} Access Configuration
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {ROLES.length} roles {'·'} {ZONES.length} zones {'·'} {gateData.length} gates {'·'} {ALERT_RULES.filter(a => a.enabled).length} active alerts
            </Text>
          </div>
        </div>

        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          {[
            { label: 'Roles', value: ROLES.length, color: tokens.colors.primaryScale[500] },
            { label: 'Zones', value: ZONES.length, color: tokens.colors.infoScale[500] },
            { label: 'Open Gates', value: gateData.filter(g => g.status === 'open').length, color: tokens.colors.successScale[500] },
            { label: 'Active Alerts', value: ALERT_RULES.filter(a => a.enabled).length, color: tokens.colors.warningScale[500] },
          ].map(s => (
            <div key={s.label} style={{ ...cardBase, padding: tokens.spacing[3], textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: s.color, display: 'block' }}>{s.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{s.label}</Text>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
          {TABS.map(tab => (
            <div key={tab} onClick={() => setActiveTab(tab)} style={createFilterPillStyle(tokens, { active: activeTab === tab })}>
              {tab === 'permissions' ? '🛡️ Permissions' : tab === 'gates' ? '🚪 Gates' : '🔔 Alerts'}
            </div>
          ))}
        </div>

        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
            <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50] }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Role-Zone Access Matrix</Text>
                <div style={{ flex: 1, position: 'relative' as const }}>
                  <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>{'🔍'}</div>
                  <input type="text" placeholder="Search roles..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
                </div>
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
              <thead>
                <tr>
                  <th style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>Role</th>
                  <th style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, textAlign: 'center' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>Level</th>
                  {ZONES.map(z => (
                    <th key={z} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`, textAlign: 'center' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>{z}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map(r => {
                  const isHovered = hoveredRow === r.role;
                  return (
                    <tr
                      key={r.role}
                      onMouseEnter={() => setHoveredRow(r.role)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{ backgroundColor: isHovered ? tokens.colors.neutral[50] : 'transparent', transition: `background-color ${tokens.motion.hover}` }}
                    >
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>{r.role}</td>
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, textAlign: 'center' as const, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                        <span style={createBadgeStyle(tokens, levelColors[r.level])}>{r.level}</span>
                      </td>
                      {ZONES.map(z => (
                        <td key={z} style={{ padding: `${tokens.spacing[2]}px`, textAlign: 'center' as const, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                          {r.zones.includes(z) ? (
                            <span style={{ color: tokens.colors.successScale[500], fontSize: tokens.typography.fontSize.lg }}>{'✓'}</span>
                          ) : (
                            <span style={{ color: tokens.colors.neutral[300], fontSize: tokens.typography.fontSize.lg }}>{'—'}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredRoles.length === 0 && (
              <div style={{ textAlign: 'center' as const, padding: tokens.spacing[6], color: tokens.colors.neutral[400] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm }}>No roles match your search</Text>
              </div>
            )}
          </div>
        )}

        {/* Gates Tab */}
        {activeTab === 'gates' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.spacing[3] }}>
            {gateData.map(gate => {
              const cfg = gateStatusConfig[gate.status];
              const isHovered = hoveredGate === gate.id;
              const maxTp = 200;
              const pct = Math.min(Math.round((gate.throughput / maxTp) * 100), 100);
              const bar = createProgressBarStyle(tokens, { percent: pct, color: cfg.color });
              return (
                <div
                  key={gate.id}
                  onMouseEnter={() => setHoveredGate(gate.id)}
                  onMouseLeave={() => setHoveredGate(null)}
                  style={{
                    ...cardBase,
                    padding: tokens.spacing[4],
                    transition: `all ${tokens.motion.hover}`,
                    ...(isHovered ? { transform: 'translateY(-2px)', boxShadow: tokens.shadows.md } : {}),
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[3] }}>
                    <div>
                      <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{gate.name}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{gate.zone} Zone</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                      <span style={{ width: 10, height: 10, borderRadius: tokens.borderRadius.full, backgroundColor: cfg.color }} />
                      <span style={createBadgeStyle(tokens, cfg.badge)}>{gate.status}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Throughput</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>{gate.throughput}/hr</Text>
                  </div>
                  <div style={bar.track}><div style={bar.fill} /></div>
                  <div style={{ display: 'flex', gap: tokens.spacing[2], marginTop: tokens.spacing[3] }}>
                    {['open', 'restricted', 'closed'].map(st => (
                      <div
                        key={st}
                        onClick={() => onGateToggle?.(gate.id)}
                        style={{
                          flex: 1,
                          padding: `${tokens.spacing[1]}px`,
                          borderRadius: tokens.borderRadius.sm,
                          textAlign: 'center' as const,
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: gate.status === st ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                          backgroundColor: gate.status === st ? gateStatusConfig[st].color : tokens.colors.neutral[50],
                          color: gate.status === st ? tokens.colors.common.white : tokens.colors.neutral[500],
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${gate.status === st ? gateStatusConfig[st].color : tokens.colors.neutral[200]}`,
                          cursor: 'pointer',
                          textTransform: 'capitalize' as const,
                        }}
                      >
                        {st}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
            <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{'🔔'} Alert Rules</Text>
            </div>
            {ALERT_RULES.map(rule => {
              const isHovered = hoveredRow === rule.id;
              return (
                <div
                  key={rule.id}
                  onMouseEnter={() => setHoveredRow(rule.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                    backgroundColor: isHovered ? tokens.colors.neutral[50] : 'transparent',
                    transition: `background-color ${tokens.motion.hover}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: tokens.borderRadius.full,
                      backgroundColor: rule.enabled ? tokens.colors.successScale[500] : tokens.colors.neutral[300],
                    }} />
                    <div>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], display: 'block' }}>{rule.name}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        {rule.zone} {'·'} Threshold: {rule.threshold} {'·'} Window: {rule.window}
                      </Text>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <span style={createBadgeStyle(tokens, rule.trigger === 'denied' ? 'error' : rule.trigger === 'capacity' ? 'warning' : rule.trigger === 'unauthorized' ? 'error' : 'info')}>
                      {rule.trigger}
                    </span>
                    <div style={{
                      width: 40, height: 22, borderRadius: tokens.borderRadius.full,
                      backgroundColor: rule.enabled ? tokens.colors.successScale[500] : tokens.colors.neutral[300],
                      position: 'relative' as const, cursor: 'pointer',
                      transition: `background-color ${tokens.motion.hover}`,
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.common.white,
                        position: 'absolute' as const, top: 2,
                        left: rule.enabled ? 20 : 2,
                        transition: `left ${tokens.motion.hover}`,
                        boxShadow: tokens.shadows.sm,
                      }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Box>
    );
  },
});
