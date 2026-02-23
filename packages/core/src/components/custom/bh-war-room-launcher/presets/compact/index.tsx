'use client';

/**
 * BhWarRoomLauncher - Compact Preset
 * Small widget with icon, label, active count badge,
 * dropdown with recent/active sessions, and quick create button.
 */

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Target,
  Plus,
  Users,
  Zap,
  PlayCircle,
  Vote,
  CheckCircle2,
  Calendar,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createListItemStyle,
  createPersonalitySectionHeaderStyle,
  createPersonalitySkeletonStyle,
  getPersonalityBadgeRadius,
  getPulseSpeed,
  clickableProps,
  ICON_SIZES,
} from '../../../helpers';
import type { BhWarRoomLauncherProps, LauncherSession } from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStatusIcon(status: LauncherSession['status']) {
  switch (status) {
    case 'active': return PlayCircle;
    case 'voting': return Vote;
    case 'decided': return CheckCircle2;
    case 'scheduled': return Calendar;
    default: return Target;
  }
}

function getStatusColor(status: LauncherSession['status']): 'success' | 'primary' | 'warning' | 'secondary' {
  switch (status) {
    case 'active': return 'success';
    case 'voting': return 'primary';
    case 'decided': return 'secondary';
    case 'scheduled': return 'warning';
    default: return 'secondary';
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const CompactBhWarRoomLauncher = createPreset<BhWarRoomLauncherProps>(
  'CompactBhWarRoomLauncher',
  ({ primitives: { Box, Text }, props, tokens }: PresetContext<BhWarRoomLauncherProps>) => {
    const {
      activeSessionCount = 0,
      recentSessions = [],
      onCreateNew,
      onJoinSession,
      loading = false,
      className,
      style,
    } = props;

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pulseSpeed = useMemo(() => getPulseSpeed(tokens), [tokens]);
    const sectionHeaderStyle = useMemo(() => createPersonalitySectionHeaderStyle(tokens), [tokens]);

    // Close dropdown on outside click
    useEffect(() => {
      if (!isOpen) return;
      const handleClick = (e: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen]);

    const activeSessions = useMemo(
      () => recentSessions.filter((s) => s.status === 'active' || s.status === 'voting'),
      [recentSessions]
    );

    // Loading skeleton
    if (loading) {
      const skeletonStyle = createPersonalitySkeletonStyle(tokens);
      return (
        <Box style={{ ...skeletonStyle, width: 140, height: 36, borderRadius: tokens.borderRadius.md, ...style }} className={className} />
      );
    }

    return (
      <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block', ...style }} className={className}>
        {/* Trigger Button */}
        <Box
          onClick={() => setIsOpen(!isOpen)}
          {...clickableProps(() => setIsOpen(!isOpen), 'Open war room launcher')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
            borderRadius: tokens.borderRadius.md,
            backgroundColor: activeSessionCount > 0 ? tokens.colors.primaryScale[50] : tokens.colors.neutral[50],
            border: `1px solid ${activeSessionCount > 0 ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`,
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
            position: 'relative',
          }}
        >
          <Target size={ICON_SIZES.section} style={{
            color: activeSessionCount > 0 ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
          }} />
          <Text style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            color: activeSessionCount > 0 ? tokens.colors.primaryScale[700] : tokens.colors.neutral[700],
          }}>
            War Room
          </Text>
          {activeSessionCount > 0 && (
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 18,
              height: 18,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.successScale[500],
              color: tokens.colors.common.white,
              fontSize: 10,
              fontWeight: tokens.typography.fontWeight.bold,
              padding: '0 4px',
              animation: pulseSpeed !== 'paused' ? `launcherPulse ${pulseSpeed} ease-in-out infinite` : undefined,
            }}>
              {activeSessionCount}
            </Box>
          )}
          <ChevronDown size={ICON_SIZES.label} style={{
            color: tokens.colors.neutral[400],
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: `transform ${tokens.motion.hover}`,
          }} />
        </Box>

        {/* Dropdown */}
        {isOpen && (
          <Box style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            width: 300,
            ...createCardStyle(tokens, { elevation: 'lg' }),
            zIndex: 50,
            overflow: 'hidden',
          }}>
            {/* Active Sessions */}
            {activeSessions.length > 0 && (
              <Box style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                <Text style={sectionHeaderStyle}>Live Sessions</Text>
                {activeSessions.map((session) => {
                  const StatusIcon = getStatusIcon(session.status);
                  return (
                    <Box
                      key={session.id}
                      onClick={() => {
                        onJoinSession?.(session.id);
                        setIsOpen(false);
                      }}
                      {...clickableProps(
                        () => { onJoinSession?.(session.id); setIsOpen(false); },
                        `Join ${session.title}`
                      )}
                      style={{
                        ...createListItemStyle(tokens, { interactive: true }),
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[2]}px 0`,
                      }}
                    >
                      <Box style={{
                        width: 8,
                        height: 8,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.successScale[500],
                        flexShrink: 0,
                        animation: pulseSpeed !== 'paused' ? `launcherPulse ${pulseSpeed} ease-in-out infinite` : undefined,
                      }} />
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[800],
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {session.title}
                        </Text>
                        <Text style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                        }}>
                          {session.jobTitle} - {session.participantCount} people
                        </Text>
                      </Box>
                      <Box style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: `2px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: tokens.colors.successScale[600],
                        color: tokens.colors.common.white,
                        fontSize: 10,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        flexShrink: 0,
                      }}>
                        <Zap size={10} />
                        Join
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* Recent Sessions */}
            {recentSessions.filter((s) => s.status !== 'active' && s.status !== 'voting').length > 0 && (
              <Box style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderTop: activeSessions.length > 0 ? `1px solid ${tokens.colors.neutral[100]}` : 'none',
              }}>
                <Text style={sectionHeaderStyle}>Recent</Text>
                {recentSessions
                  .filter((s) => s.status !== 'active' && s.status !== 'voting')
                  .slice(0, 3)
                  .map((session) => {
                    const StatusIcon = getStatusIcon(session.status);
                    return (
                      <Box
                        key={session.id}
                        onClick={() => {
                          onJoinSession?.(session.id);
                          setIsOpen(false);
                        }}
                        {...clickableProps(
                          () => { onJoinSession?.(session.id); setIsOpen(false); },
                          `View ${session.title}`
                        )}
                        style={{
                          ...createListItemStyle(tokens, { interactive: true }),
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[2],
                          padding: `${tokens.spacing[2]}px 0`,
                        }}
                      >
                        <StatusIcon size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[400], flexShrink: 0 }} />
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Text style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[700],
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {session.title}
                          </Text>
                          <Text style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                          }}>
                            {session.jobTitle}
                          </Text>
                        </Box>
                        <ArrowRight size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[300], flexShrink: 0 }} />
                      </Box>
                    );
                  })}
              </Box>
            )}

            {/* Empty state */}
            {recentSessions.length === 0 && (
              <Box style={{
                padding: `${tokens.spacing[4]}px ${tokens.spacing[3]}px`,
                textAlign: 'center',
              }}>
                <Text style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[400],
                }}>
                  No war room sessions
                </Text>
              </Box>
            )}

            {/* Create New Button */}
            {onCreateNew && (
              <Box style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderTop: `1px solid ${tokens.colors.neutral[100]}`,
              }}>
                <Box
                  onClick={() => {
                    onCreateNew();
                    setIsOpen(false);
                  }}
                  {...clickableProps(
                    () => { onCreateNew(); setIsOpen(false); },
                    'Create new war room'
                  )}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: tokens.spacing[2],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.primaryScale[600],
                    color: tokens.colors.common.white,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    width: '100%',
                  }}
                >
                  <Plus size={ICON_SIZES.section} />
                  Create War Room
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Pulse animation keyframes */}
        <style>{`
          @keyframes launcherPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        `}</style>
      </div>
    );
  }
);
