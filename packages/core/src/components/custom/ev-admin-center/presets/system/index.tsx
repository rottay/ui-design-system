'use client';

/**
 * EvAdminCenter - System Preset
 * Server health gauges, API response times, error rates, resource usage
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvAdminCenterProps } from '../../core';

export const SystemEvAdminCenter = createPreset<EvAdminCenterProps>({
  name: 'EvAdminCenter.System',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvAdminCenterProps>) => {
    const { Box, Text } = primitives;

    const {
      systemMetrics,
      tenants,
      systemEvents,
      quickActions,
      onTenantClick,
      onEventClick,
      className,
      style,
    } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(
      () => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }),
      [tokens, isGlass]
    );
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const [selectedServer, setSelectedServer] = useState('api-prod-1');

    const servers = [
      { id: 'api-prod-1', name: 'API Prod 1', cpu: 42, memory: 68, disk: 55, status: 'healthy' as const, uptime: '45d 12h' },
      { id: 'api-prod-2', name: 'API Prod 2', cpu: 38, memory: 61, disk: 52, status: 'healthy' as const, uptime: '45d 12h' },
      { id: 'db-primary', name: 'DB Primary', cpu: 72, memory: 85, disk: 78, status: 'warning' as const, uptime: '30d 8h' },
      { id: 'cache-01', name: 'Cache 01', cpu: 15, memory: 45, disk: 22, status: 'healthy' as const, uptime: '60d 3h' },
      { id: 'worker-01', name: 'Worker 01', cpu: 88, memory: 72, disk: 40, status: 'warning' as const, uptime: '15d 6h' },
    ];

    const apiEndpoints = [
      { path: '/api/v3/events', avgMs: 45, p99Ms: 120, rpm: 2840, status: 'healthy' as const },
      { path: '/api/v3/tickets', avgMs: 82, p99Ms: 250, rpm: 1560, status: 'healthy' as const },
      { path: '/api/v3/auth', avgMs: 35, p99Ms: 95, rpm: 980, status: 'healthy' as const },
      { path: '/api/v3/payments', avgMs: 210, p99Ms: 680, rpm: 420, status: 'warning' as const },
      { path: '/api/v3/webhooks', avgMs: 340, p99Ms: 1200, rpm: 180, status: 'critical' as const },
    ];

    const errorRates = [
      { hour: '12:00', rate: 0.05 }, { hour: '13:00', rate: 0.08 }, { hour: '14:00', rate: 0.04 },
      { hour: '15:00', rate: 0.12 }, { hour: '16:00', rate: 0.15 }, { hour: '17:00', rate: 0.09 },
      { hour: '18:00', rate: 0.22 }, { hour: '19:00', rate: 0.18 }, { hour: '20:00', rate: 0.11 },
      { hour: '21:00', rate: 0.07 },
    ];

    const resources = [
      { label: 'CPU Cluster', used: 58, total: 100, unit: '%', icon: '🔲' },
      { label: 'Memory Pool', used: 28.4, total: 48, unit: 'GB', icon: '💾' },
      { label: 'Storage', used: 1.2, total: 2, unit: 'TB', icon: '💿' },
      { label: 'Network I/O', used: 3.8, total: 10, unit: 'Gbps', icon: '🌐' },
    ];

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'healthy': return { bg: tokens.colors.successScale[100], text: tokens.colors.successScale[700], dot: tokens.colors.successScale[500] };
        case 'warning': return { bg: tokens.colors.warningScale[100], text: tokens.colors.warningScale[700], dot: tokens.colors.warningScale[500] };
        case 'critical': return { bg: tokens.colors.errorScale[100], text: tokens.colors.errorScale[700], dot: tokens.colors.errorScale[500] };
        default: return { bg: tokens.colors.neutral[100], text: tokens.colors.neutral[700], dot: tokens.colors.neutral[500] };
      }
    };

    const getGaugeColor = (pct: number) => {
      if (pct >= 85) return tokens.colors.errorScale[500];
      if (pct >= 70) return tokens.colors.warningScale[500];
      return tokens.colors.successScale[500];
    };

    const barChartHeight = 100;

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
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[6] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              System Health
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              Infrastructure monitoring and diagnostics
            </Text>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1],
            padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.infoScale[100], color: tokens.colors.infoScale[700],
            fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
          }}>Last updated: just now</span>
        </div>

        {/* Server Health Cards */}
        <div style={cardBase}>
          <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>
            Server Health
          </Text>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${servers.length}, 1fr)`, gap: tokens.spacing[3], marginBottom: tokens.spacing[2] }}>
            {servers.map((srv) => {
              const sc = getStatusColor(srv.status);
              const isSelected = selectedServer === srv.id;
              return (
                <div
                  key={srv.id}
                  onClick={() => setSelectedServer(srv.id)}
                  style={{
                    padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md,
                    border: `1px solid ${isSelected ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                    backgroundColor: isSelected ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                    cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                    textAlign: 'center' as const,
                  }}
                >
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1],
                    fontSize: 10, fontWeight: tokens.typography.fontWeight.bold,
                    textTransform: 'uppercase' as const,
                    padding: '1px 6px', borderRadius: tokens.borderRadius.sm,
                    backgroundColor: sc.bg, color: sc.text,
                    marginBottom: tokens.spacing[2],
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: tokens.borderRadius.full, backgroundColor: sc.dot }} />
                    {srv.status}
                  </span>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>{srv.name}</span>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: tokens.spacing[3], marginTop: tokens.spacing[2] }}>
                    {[{ label: 'CPU', val: srv.cpu }, { label: 'MEM', val: srv.memory }, { label: 'DSK', val: srv.disk }].map((g) => (
                      <div key={g.label} style={{ textAlign: 'center' as const }}>
                        <div style={{ width: 36, height: 36, borderRadius: tokens.borderRadius.full, border: `3px solid ${getGaugeColor(g.val)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
                          <span style={{ fontSize: 9, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[700] }}>{g.val}</span>
                        </div>
                        <span style={{ fontSize: 9, color: tokens.colors.neutral[500] }}>{g.label}</span>
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], display: 'block', marginTop: tokens.spacing[2] }}>Up: {srv.uptime}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[6], marginTop: tokens.spacing[6] }}>
          {/* API Response Times */}
          <div style={cardBase}>
            <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>
              API Response Times
            </Text>
            {/* Table Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 70px 60px', gap: tokens.spacing[2], padding: `${tokens.spacing[1]}px 0`, marginBottom: tokens.spacing[1] }}>
              {['Endpoint', 'Avg', 'P99', 'RPM', 'Status'].map((h) => (
                <span key={h} style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const }}>{h}</span>
              ))}
            </div>
            {apiEndpoints.map((ep, idx) => {
              const sc = getStatusColor(ep.status);
              return (
                <div key={idx} style={{
                  display: 'grid', gridTemplateColumns: '1fr 70px 70px 70px 60px', gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px 0`,
                  borderBottom: idx < apiEndpoints.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800], fontFamily: 'monospace' }}>{ep.path}</span>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, color: ep.avgMs > 200 ? tokens.colors.warningScale[600] : tokens.colors.neutral[700] }}>{ep.avgMs}ms</span>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, color: ep.p99Ms > 500 ? tokens.colors.errorScale[600] : tokens.colors.neutral[700] }}>{ep.p99Ms}ms</span>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{ep.rpm.toLocaleString()}</span>
                  <span style={{
                    fontSize: 10, fontWeight: tokens.typography.fontWeight.bold,
                    padding: '1px 6px', borderRadius: tokens.borderRadius.sm,
                    backgroundColor: sc.bg, color: sc.text,
                    textTransform: 'uppercase' as const, textAlign: 'center' as const,
                  }}>{ep.status === 'healthy' ? 'OK' : ep.status === 'warning' ? 'SLOW' : 'FAIL'}</span>
                </div>
              );
            })}
          </div>

          {/* Error Rate Chart */}
          <div style={cardBase}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                Error Rate (24h)
              </Text>
              <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.errorScale[600] }}>
                Avg: {(errorRates.reduce((s, r) => s + r.rate, 0) / errorRates.length).toFixed(2)}%
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: tokens.spacing[1], height: barChartHeight }}>
              {errorRates.map((d, i) => {
                const h = (d.rate / 0.25) * barChartHeight;
                const color = d.rate >= 0.15 ? tokens.colors.errorScale[400] : d.rate >= 0.1 ? tokens.colors.warningScale[400] : tokens.colors.successScale[400];
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <span style={{ fontSize: 9, color: tokens.colors.neutral[500] }}>{d.rate}%</span>
                    <div style={{
                      width: '100%', maxWidth: 28, height: Math.max(4, h), backgroundColor: color,
                      borderRadius: `${tokens.borderRadius.sm} ${tokens.borderRadius.sm} 0 0`,
                    }} />
                    <span style={{ fontSize: 9, color: tokens.colors.neutral[400] }}>{d.hour.split(':')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Resource Usage */}
        <div style={{ ...cardBase, marginTop: tokens.spacing[6] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>
            Resource Usage
          </Text>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4] }}>
            {resources.map((res, idx) => {
              const pct = Math.round((res.used / res.total) * 100);
              return (
                <div key={idx} style={{ textAlign: 'center' as const }}>
                  <span style={{ fontSize: tokens.typography.fontSize.xl, display: 'block', marginBottom: tokens.spacing[2] }}>{res.icon}</span>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>{res.label}</span>
                  <div style={{ height: 8, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.full, overflow: 'hidden', marginBottom: tokens.spacing[1] }}>
                    <div style={{ height: '100%', width: `${pct}%`, backgroundColor: getGaugeColor(pct), borderRadius: tokens.borderRadius.full, transition: 'width 0.3s ease' }} />
                  </div>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{res.used} / {res.total} {res.unit}</span>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: getGaugeColor(pct), display: 'block' }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </Box>
    );
  },
});
