'use client';

/**
 * CommandHeader - Full Preset
 * Complete command header with AI insight sidebar, metrics grid, activities,
 * quick actions, system status bar, and optional ambient effects
 */

import { useState, useEffect, useMemo } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { CommandHeaderProps } from '../../core';

export const FullCommandHeader = createPreset<CommandHeaderProps>({
  name: 'CommandHeader.Full',
  render: ({ primitives, props, tokens, engine }: PresetContext<CommandHeaderProps>) => {
    const { Box } = primitives;
    const {
      title,
      subtitle,
      icon,
      quickActions = [],
      metrics = [],
      activities = [],
      insight,
      systemStatus = [],
      primaryAction,
      effects = {},
      className,
      style,
    } = props;

    const [activeMetricIndex, setActiveMetricIndex] = useState(0);

    // Auto-cycle highlighted metric
    useEffect(() => {
      if (metrics.length <= 1) return;
      const interval = setInterval(() => {
        setActiveMetricIndex(prev => (prev + 1) % metrics.length);
      }, 5000);
      return () => clearInterval(interval);
    }, [metrics.length]);

    const styleId = 'cmd-header-full-styles';
    useEffect(() => {
      if (typeof document === 'undefined') return;
      if (document.getElementById(styleId)) return;
      const s = document.createElement('style');
      s.id = styleId;
      s.textContent = `
        @keyframes cmd-particle-float { 0%,100% { transform: translateY(0) translateX(0); opacity:0.3; } 50% { transform: translateY(-20px) translateX(10px); opacity:0.7; } }
        @keyframes cmd-aurora { 0% { transform: translateX(-30%); } 100% { transform: translateX(30%); } }
        @keyframes cmd-fade-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes cmd-pulse { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
      `;
      document.head.appendChild(s);
    }, []);

    const getTrendColor = (positive?: boolean) =>
      positive ? tokens.colors.successScale[500] : tokens.colors.errorScale[500];

    const getTypeColor = (type?: string) => {
      switch (type) {
        case 'success': return tokens.colors.successScale;
        case 'warning': return tokens.colors.warningScale;
        case 'error': return tokens.colors.errorScale;
        case 'info': return tokens.colors.infoScale;
        default: return tokens.colors.primaryScale;
      }
    };

    const getStatusColor = (status?: string) => {
      switch (status) {
        case 'ok': return tokens.colors.successScale[500];
        case 'warning': return tokens.colors.warningScale[500];
        case 'error': return tokens.colors.errorScale[500];
        default: return tokens.colors.neutral[500];
      }
    };

    return (
      <Box
        className={className}
        style={{
          boxShadow: tokens.shadows.md,
          position: 'relative',
          borderRadius: tokens.borderRadius.xl,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.neutral[900],
          color: tokens.colors.common.white,
          overflow: 'hidden',
          ...style,
        }}
      >
        {/* Effects layer */}
        {effects.aurora && (
          <div style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 0,
          }}>
            <div style={{
              position: 'absolute',
              top: -40,
              left: '10%',
              width: '80%',
              height: 80,
              background: `linear-gradient(90deg, ${tokens.colors.primaryScale[500]}33, ${tokens.colors.secondaryScale[500]}33, ${tokens.colors.primaryScale[500]}33)`,
              filter: 'blur(40px)',
              animation: 'cmd-aurora 10s ease-in-out infinite alternate',
            }} />
          </div>
        )}

        {effects.grid && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(${tokens.colors.neutral[700]}40 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            pointerEvents: 'none',
            zIndex: 0,
            opacity: 0.3,
          }} />
        )}

        {effects.particles && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: 3,
                height: 3,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.primaryScale[400],
                left: `${10 + i * 12}%`,
                top: `${20 + (i % 3) * 25}%`,
                animation: `cmd-particle-float ${12 + i * 2}s ease-in-out infinite`,
                animationDelay: `${i * 0.8}s`,
                opacity: 0.4,
              }} />
            ))}
          </div>
        )}

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: tokens.spacing[5], padding: tokens.spacing[5] }}>
          {/* Left section: Title + AI Insight + Quick Actions */}
          <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
            {/* Header */}
            <div style={{ animation: 'cmd-fade-in 0.4s ease-out' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[2] }}>
                {icon && <span style={{ fontSize: tokens.typography.fontSize['2xl'] }}>{icon}</span>}
                <div>
                  <div style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold }}>{title}</div>
                  {subtitle && <div style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400], marginTop: tokens.spacing[0] }}>{subtitle}</div>}
                </div>
              </div>

              {primaryAction && (
                <button
                  onClick={primaryAction.onClick}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: 'none',
                    backgroundColor: tokens.colors.primaryScale[600],
                    color: tokens.colors.common.white,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    marginTop: tokens.spacing[3],
                  }}
                >
                  {primaryAction.icon && <span>{primaryAction.icon}</span>}
                  {primaryAction.label}
                </button>
              )}
            </div>

            {/* AI Insight card */}
            {insight && (
              <div style={{
                backgroundColor: `${tokens.colors.primaryScale[500]}20`,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[500]}40`,
                borderRadius: tokens.borderRadius.lg,
                padding: tokens.spacing[4],
                animation: 'cmd-fade-in 0.6s ease-out',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                  {insight.icon && <span>{insight.icon}</span>}
                  <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[300] }}>
                    {insight.title}
                  </span>
                </div>
                <div style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[300], lineHeight: 1.5 }}>
                  {insight.message}
                </div>
              </div>
            )}

            {/* Quick actions */}
            {quickActions.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[2] }}>
                {quickActions.map((action) => {
                  const scale = getTypeColor(action.color);
                  return (
                    <button
                      key={action.key}
                      onClick={action.onClick}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${scale[500]}50`,
                        backgroundColor: `${scale[500]}15`,
                        color: scale[300],
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {action.icon && <span>{action.icon}</span>}
                      {action.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right section: Metrics + Activities */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], minWidth: 0 }}>
            {/* Metrics grid */}
            {metrics.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(metrics.length, 4)}, 1fr)`,
                gap: tokens.spacing[3],
              }}>
                {metrics.map((metric, i) => {
                  const isActive = i === activeMetricIndex;
                  return (
                    <div
                      key={i}
                      style={{
                        backgroundColor: isActive ? `${tokens.colors.primaryScale[500]}20` : `${tokens.colors.neutral[800]}80`,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isActive ? tokens.colors.primaryScale[500] + '40' : tokens.colors.neutral[700]}`,
                        borderRadius: tokens.borderRadius.lg,
                        padding: tokens.spacing[3],
                        transition: `all ${tokens.motion.hover}`,
                        animation: `cmd-fade-in 0.4s ease-out ${i * 0.1}s both`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                        <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                          {metric.label}
                        </span>
                        {metric.icon && <span style={{ color: tokens.colors.neutral[500], fontSize: tokens.typography.fontSize.sm }}>{metric.icon}</span>}
                      </div>
                      <div style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, letterSpacing: '0.02em' }}>
                        {metric.value}
                        {metric.unit && <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400], marginLeft: tokens.spacing[1] }}>{metric.unit}</span>}
                      </div>
                      {metric.change && (
                        <div style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: getTrendColor(metric.positive),
                          marginTop: tokens.spacing[1],
                          fontWeight: tokens.typography.fontWeight.medium,
                        }}>
                          {metric.positive ? '\u25B2' : '\u25BC'} {metric.change}
                        </div>
                      )}
                      {metric.progress !== undefined && (
                        <div style={{
                          marginTop: tokens.spacing[2],
                          height: 3,
                          backgroundColor: tokens.colors.neutral[700],
                          borderRadius: tokens.borderRadius.full,
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${Math.min(metric.progress, 100)}%`,
                            backgroundColor: tokens.colors.primaryScale[400],
                            borderRadius: tokens.borderRadius.full,
                            transition: 'width 1s ease',
                          }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Activity feed */}
            {activities.length > 0 && (
              <div style={{
                backgroundColor: `${tokens.colors.neutral[800]}80`,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[700]}`,
                borderRadius: tokens.borderRadius.lg,
                padding: tokens.spacing[3],
                maxHeight: 200,
                overflowY: 'auto',
              }}>
                <div style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[400], textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: tokens.spacing[2] }}>
                  Recent Activity
                </div>
                {activities.slice(0, 6).map((item, i) => {
                  const scale = getTypeColor(item.type);
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[3],
                        padding: `${tokens.spacing[2]}px 0`,
                        borderBottom: i < Math.min(activities.length, 6) - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[700]}50` : 'none',
                        animation: `cmd-fade-in 0.3s ease-out ${i * 0.05}s both`,
                      }}
                    >
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: scale[400],
                        flexShrink: 0,
                      }} />
                      <span style={{ flex: 1, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[300], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.text}
                      </span>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], flexShrink: 0 }}>
                        {item.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* System status bar */}
        {systemStatus.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[5],
            padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[700]}`,
            backgroundColor: `${tokens.colors.neutral[800]}60`,
          }}>
            {systemStatus.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: getStatusColor(s.status),
                  animation: s.status === 'ok' ? 'cmd-pulse 2s ease-in-out infinite' : 'none',
                }} />
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{s.label}</span>
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[300], fontWeight: tokens.typography.fontWeight.medium }}>{s.value}</span>
              </div>
            ))}
          </div>
        )}
      </Box>
    );
  },
});
