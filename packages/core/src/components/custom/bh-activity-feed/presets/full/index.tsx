'use client';

/**
 * BhActivityFeed - Full Preset
 * Chronological activity feed with stats bar, filter bar, and date-grouped
 * timeline of recruiting activities.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Activity,
  User,
  Briefcase,
  Video,
  FileText,
  Gift,
  ArrowRightLeft,
  StickyNote,
  MessageSquare,
  XCircle,
  CheckCircle2,
  Globe,
  Lock,
  CalendarDays,
  Clock,
  TrendingUp,
  Users,
  ChevronDown,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import type { ColorScale } from '../../../../../types';
import {
  createCardStyle,
  createIconContainerStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createStaggerDelay,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
} from '../../../helpers';
import type {
  BhActivityFeedProps,
  ActivityItem,
  ActivityFeedFilter,
  ActivityActionType,
  ActivityEntityType,
} from '../../core';
import {
  getActionTypeLabel,
  getActionTypeColorKey,
  formatActivityTimestamp,
  groupActivitiesByDate,
} from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const ACTION_OPTIONS: { value: ActivityActionType; label: string }[] = [
  { value: 'applied', label: 'Applied' },
  { value: 'interview_scheduled', label: 'Interview Scheduled' },
  { value: 'interview_completed', label: 'Interview Completed' },
  { value: 'offer_made', label: 'Offer Made' },
  { value: 'offer_accepted', label: 'Offer Accepted' },
  { value: 'offer_declined', label: 'Offer Declined' },
  { value: 'stage_change', label: 'Stage Change' },
  { value: 'note_added', label: 'Note Added' },
  { value: 'feedback_submitted', label: 'Feedback' },
  { value: 'candidate_rejected', label: 'Rejected' },
  { value: 'candidate_hired', label: 'Hired' },
  { value: 'job_published', label: 'Job Published' },
  { value: 'job_closed', label: 'Job Closed' },
];

const ENTITY_OPTIONS: { value: ActivityEntityType; label: string }[] = [
  { value: 'candidate', label: 'Candidate' },
  { value: 'job', label: 'Job' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'position', label: 'Position' },
];

function getActionIcon(actionType: ActivityActionType, size: number) {
  switch (actionType) {
    case 'applied': return <FileText size={size} />;
    case 'interview_scheduled': return <CalendarDays size={size} />;
    case 'interview_completed': return <Video size={size} />;
    case 'offer_made': return <Gift size={size} />;
    case 'offer_accepted': return <CheckCircle2 size={size} />;
    case 'offer_declined': return <XCircle size={size} />;
    case 'stage_change': return <ArrowRightLeft size={size} />;
    case 'note_added': return <StickyNote size={size} />;
    case 'feedback_submitted': return <MessageSquare size={size} />;
    case 'candidate_rejected': return <XCircle size={size} />;
    case 'candidate_hired': return <CheckCircle2 size={size} />;
    case 'job_published': return <Globe size={size} />;
    case 'job_closed': return <Lock size={size} />;
    default: return <Activity size={size} />;
  }
}

function getEntityIcon(entityType: ActivityEntityType, size: number) {
  switch (entityType) {
    case 'candidate': return <User size={size} />;
    case 'job': return <Briefcase size={size} />;
    case 'interview': return <Video size={size} />;
    case 'offer': return <FileText size={size} />;
    case 'position': return <Users size={size} />;
    default: return <Activity size={size} />;
  }
}

/* ------------------------------------------------------------------ */
/*  Full Preset                                                        */
/* ------------------------------------------------------------------ */
export const FullBhActivityFeed = createPreset<BhActivityFeedProps>({
  name: 'BhActivityFeed.Full',
  render: ({ primitives, props, tokens }: PresetContext<BhActivityFeedProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      activities: activitiesProp,
      stats: statsProp,
      filters: externalFilters,
      onFilterChange,
      selectedActivity: externalSelected,
      onActivitySelect,
      onEntityClick,
      className,
      style,
    } = props;

    const activities = activitiesProp?.length ? activitiesProp : [];
    const stats = statsProp;

    /* -- Internal state ---------------------------------------------- */
    const [filters, setFilters] = useState<ActivityFeedFilter>(externalFilters ?? {});
    const [selectedActivity, setSelectedActivity] = useState<string | null>(externalSelected ?? null);
    const [showActionFilters, setShowActionFilters] = useState(false);

    const handleFilterChange = useCallback((next: ActivityFeedFilter) => {
      setFilters(next);
      onFilterChange?.(next);
    }, [onFilterChange]);

    const handleSelect = useCallback((id: string | null) => {
      setSelectedActivity(id);
      onActivitySelect?.(id);
    }, [onActivitySelect]);

    /* -- Styles ------------------------------------------------------ */
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });
    const card = useMemo(() => createCardStyle(t, { padding: 20 }), [t]);
    const typo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeR = useMemo(() => getPersonalityBadgeRadius(t), [t]);

    const glassStyle = useMemo(() => {
      if (t.surface.useGlass && t.glass) {
        return {
          backdropFilter: t.glass.blur,
          WebkitBackdropFilter: t.glass.blur,
        };
      }
      return {};
    }, [t]);

    /* -- Filtered activities ----------------------------------------- */
    const filteredActivities = useMemo(() => activities.filter((item) => {
      if (filters.actionType && item.actionType !== filters.actionType) return false;
      if (filters.entityType && item.entityType !== filters.entityType) return false;
      if (filters.actorId && item.actor.id !== filters.actorId) return false;
      return true;
    }), [activities, filters]);

    const grouped = useMemo(() => groupActivitiesByDate(filteredActivities), [filteredActivities]);

    /* ================================================================ */
    /*  Inner Components                                                 */
    /* ================================================================ */

    const StatCard = ({ label, value, icon, scaleKey }: { label: string; value: string | number; icon: React.ReactNode; scaleKey: string }) => {
      const s = (t.colors as any)[scaleKey] ?? t.colors.neutral;
      return (
        <Box style={{
          ...card,
          display: 'flex',
          alignItems: 'center',
          gap: t.spacing[3],
          flex: '1 1 180px',
        }}>
          <Box style={{
            ...createIconContainerStyle(t, { size: 40, color: s[50] }),
            color: s[600],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {icon}
          </Box>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.medium,
              color: t.colors.neutral[500],
              textTransform: typo.labelTransform,
              letterSpacing: typo.labelLetterSpacing,
              display: 'block',
            }}>
              {label}
            </Text>
            <Text style={{
              fontSize: t.typography.fontSize.lg,
              fontWeight: t.typography.fontWeight.semibold,
              color: t.colors.neutral[900],
            }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Text>
          </Box>
        </Box>
      );
    };

    const FilterPill = ({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) => (
      <Box
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-pressed={active}
        aria-label={`Filter by ${label}`}
        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
          borderRadius: t.borderRadius.full,
          border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${active ? t.colors.primaryScale[300] : t.colors.neutral[200]}`,
          backgroundColor: active ? t.colors.primaryScale[50] : t.colors.common.white,
          color: active ? t.colors.primaryScale[700] : t.colors.neutral[600],
          fontSize: t.typography.fontSize.xs,
          fontWeight: t.typography.fontWeight.medium,
          cursor: 'pointer',
          transition: `all ${t.motion.hover}`,
        }}
      >
        <Text style={{ fontSize: t.typography.fontSize.xs }}>{label}</Text>
      </Box>
    );

    const ActivityCard = ({ item, index }: { item: ActivityItem; index: number }) => {
      const colorKey = getActionTypeColorKey(item.actionType);
      const scale = (t.colors as any)[colorKey] ?? t.colors.neutral;
      const isSelected = selectedActivity === item.id;
      const itemEntrance = createEntranceAnimation(t, { index });

      return (
        <Box
          key={item.id}
          onClick={() => handleSelect(isSelected ? null : item.id)}
          role="button"
          tabIndex={0}
          aria-label={`${item.actor.name} ${getActionTypeLabel(item.actionType)} ${item.entityName}`}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(isSelected ? null : item.id); } }}
          style={{
            display: 'flex',
            gap: t.spacing[3],
            position: 'relative' as const,
            ...itemEntrance.animate,
            transition: itemEntrance.transition,
          }}
        >
          {/* Timeline dot */}
          <Box style={{
            width: 40,
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'center',
            paddingTop: t.spacing[3],
            zIndex: 1,
          }}>
            <Box style={{
              width: 14,
              height: 14,
              borderRadius: t.borderRadius.full,
              backgroundColor: scale[500],
              border: `3px solid ${t.colors.common.white}`,
              boxShadow: t.shadows.sm,
            }} />
          </Box>

          {/* Card */}
          <Box
            style={{
              ...card,
              flex: 1,
              borderLeft: `3px solid ${scale[400]}`,
              cursor: 'pointer',
              transition: `all ${t.motion.hover}`,
              boxShadow: isSelected ? t.shadows.md : card.boxShadow,
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.boxShadow = t.shadows.md; }}
            onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.boxShadow = isSelected ? t.shadows.md : (card.boxShadow as string) || ''; }}
          >
            {/* Header row */}
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                {/* Avatar */}
                <Box style={{
                  width: 32,
                  height: 32,
                  borderRadius: t.borderRadius.full,
                  backgroundColor: t.colors.neutral[200],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}>
                  {item.actor.avatar ? (
                    <Box
                      as="img"
                      style={{ width: 32, height: 32, borderRadius: t.borderRadius.full, objectFit: 'cover' as const }}
                      {...{ src: item.actor.avatar, alt: item.actor.name }}
                    />
                  ) : (
                    <User size={16} color={t.colors.neutral[500]} />
                  )}
                </Box>

                {/* Actor + action text */}
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], flexWrap: 'wrap' as const }}>
                    <Text style={{
                      fontSize: t.typography.fontSize.sm,
                      fontWeight: t.typography.fontWeight.semibold,
                      color: t.colors.neutral[900],
                    }}>
                      {item.actor.name}
                    </Text>
                    <Text style={{
                      fontSize: t.typography.fontSize.sm,
                      color: t.colors.neutral[500],
                    }}>
                      {getActionTypeLabel(item.actionType)}
                    </Text>
                    <Box
                      role={onEntityClick ? 'button' : undefined}
                      tabIndex={onEntityClick ? 0 : undefined}
                      aria-label={onEntityClick ? `View ${item.entityType}: ${item.entityName}` : undefined}
                      style={{
                        cursor: onEntityClick ? 'pointer' : 'default',
                        display: 'inline',
                      }}
                      onClick={onEntityClick ? (e: React.MouseEvent) => {
                        e.stopPropagation();
                        onEntityClick(item.entityType, item.entityId);
                      } : undefined}
                      onKeyDown={onEntityClick ? (e: React.KeyboardEvent) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          onEntityClick(item.entityType, item.entityId);
                        }
                      } : undefined}
                    >
                      <Text
                        style={{
                          fontSize: t.typography.fontSize.sm,
                          fontWeight: t.typography.fontWeight.medium,
                          color: t.colors.primaryScale[700],
                        }}
                      >
                        {item.entityName}
                      </Text>
                    </Box>
                  </Box>
                  {item.actor.role && (
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      color: t.colors.neutral[400],
                    }}>
                      {item.actor.role}
                    </Text>
                  )}
                </Box>
              </Box>

              {/* Right: badges + timestamp */}
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexShrink: 0 }}>
                <Box style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: t.spacing[1],
                  padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                  borderRadius: badgeR,
                  backgroundColor: scale[50],
                  color: scale[700],
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.medium,
                }}>
                  {getActionIcon(item.actionType, 12)}
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>
                    {item.actionType.replace(/_/g, ' ')}
                  </Text>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <Clock size={12} color={t.colors.neutral[400]} />
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.neutral[500],
                    whiteSpace: 'nowrap' as const,
                  }}>
                    {formatActivityTimestamp(item.timestamp)}
                  </Text>
                </Box>
              </Box>
            </Box>

            {/* Description */}
            {item.description && (
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                color: t.colors.neutral[600],
                lineHeight: 1.5,
                paddingLeft: t.spacing[10] + t.spacing[1],
              }}>
                {item.description}
              </Text>
            )}
          </Box>
        </Box>
      );
    };

    /* ================================================================ */
    /*  Render                                                           */
    /* ================================================================ */
    return (
      <Box
        className={className}
        role="region"
        aria-label="Activity Feed"
        style={{
          minHeight: '100%',
          backgroundColor: t.colors.neutral[50],
          padding: t.spacing[7],
          fontFamily: 'inherit',
          ...glassStyle,
          ...entrance.animate,
          transition: entrance.transition,
          ...style,
        }}
      >
        <Box style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5] }}>

          {/* ---- Stats Bar ------------------------------------------ */}
          {stats && (
            <Box style={{ display: 'flex', gap: t.spacing[4], flexWrap: 'wrap' as const }}>
              {stats.events != null && (
                <StatCard label="Events" value={stats.events} icon={<Activity size={18} />} scaleKey="primaryScale" />
              )}
              {stats.interviews != null && (
                <StatCard label="Interviews" value={stats.interviews} icon={<Video size={18} />} scaleKey="infoScale" />
              )}
              {stats.offers != null && (
                <StatCard label="Offers" value={stats.offers} icon={<Gift size={18} />} scaleKey="warningScale" />
              )}
              {stats.hires != null && (
                <StatCard label="Hires" value={stats.hires} icon={<TrendingUp size={18} />} scaleKey="successScale" />
              )}
            </Box>
          )}

          {/* ---- Filter Bar ----------------------------------------- */}
          <Box style={{
            ...card,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap' as const,
            gap: t.spacing[3],
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexWrap: 'wrap' as const }}>
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                color: t.colors.neutral[500],
                fontWeight: t.typography.fontWeight.medium,
              }}>
                Entity:
              </Text>
              {ENTITY_OPTIONS.map((opt) => {
                const isActive = filters.entityType === opt.value;
                return (
                  <FilterPill
                    key={opt.value}
                    active={isActive}
                    label={opt.label}
                    onClick={() => handleFilterChange({ ...filters, entityType: isActive ? undefined : opt.value })}
                  />
                );
              })}

              <Box style={{ width: 1, height: 20, backgroundColor: t.colors.neutral[200], margin: `0 ${t.spacing[1]}px` }} />

              <Text style={{
                fontSize: t.typography.fontSize.xs,
                color: t.colors.neutral[500],
                fontWeight: t.typography.fontWeight.medium,
              }}>
                Action:
              </Text>
              <Box
                onClick={() => setShowActionFilters(!showActionFilters)}
                role="button"
                tabIndex={0}
                aria-expanded={showActionFilters}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowActionFilters(!showActionFilters); } }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: t.spacing[1],
                  padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                  borderRadius: t.borderRadius.full,
                  border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${filters.actionType ? t.colors.primaryScale[300] : t.colors.neutral[200]}`,
                  backgroundColor: filters.actionType ? t.colors.primaryScale[50] : t.colors.common.white,
                  color: filters.actionType ? t.colors.primaryScale[700] : t.colors.neutral[600],
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${t.motion.hover}`,
                }}
              >
                <Text style={{ fontSize: t.typography.fontSize.xs }}>
                  {filters.actionType ? ACTION_OPTIONS.find(o => o.value === filters.actionType)?.label ?? 'All' : 'All Actions'}
                </Text>
                <ChevronDown size={12} />
              </Box>

              {showActionFilters && (
                <Box style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[1],
                  flexWrap: 'wrap' as const,
                }}>
                  {ACTION_OPTIONS.map((opt) => {
                    const isActive = filters.actionType === opt.value;
                    return (
                      <FilterPill
                        key={opt.value}
                        active={isActive}
                        label={opt.label}
                        onClick={() => {
                          handleFilterChange({ ...filters, actionType: isActive ? undefined : opt.value });
                          setShowActionFilters(false);
                        }}
                      />
                    );
                  })}
                </Box>
              )}
            </Box>

            {/* Active filter count */}
            {(filters.actionType || filters.entityType) && (
              <Box
                onClick={() => handleFilterChange({})}
                role="button"
                tabIndex={0}
                aria-label="Clear all filters"
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilterChange({}); } }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: t.spacing[1],
                  padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                  borderRadius: t.borderRadius.md,
                  backgroundColor: t.colors.neutral[100],
                  color: t.colors.neutral[600],
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${t.motion.hover}`,
                }}
              >
                <XCircle size={12} />
                <Text style={{ fontSize: t.typography.fontSize.xs }}>Clear filters</Text>
              </Box>
            )}
          </Box>

          {/* ---- Timeline ------------------------------------------- */}
          {filteredActivities.length === 0 ? (
            <Box style={{
              ...card,
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center',
              justifyContent: 'center',
              padding: `${t.spacing[10]}px ${t.spacing[4]}px`,
              textAlign: 'center' as const,
            }}>
              <Box style={{ color: t.colors.neutral[300], marginBottom: t.spacing[3] }}>
                <Activity size={32} />
              </Box>
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
                No activities match your filters
              </Text>
            </Box>
          ) : (
            <Box style={{ position: 'relative' as const }}>
              {/* Vertical line */}
              <Box style={{
                position: 'absolute' as const,
                left: 19,
                top: 0,
                bottom: 0,
                width: 2,
                backgroundColor: t.colors.neutral[200],
              }} />

              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5] }}>
                {grouped.map((group, i) => (
                  <Box key={group.label} style={{ ...animStyle(i), display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
                    {/* Date group header */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], paddingLeft: t.spacing[10] + t.spacing[3] }}>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        fontWeight: t.typography.fontWeight.semibold,
                        color: t.colors.neutral[500],
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.05em',
                      }}>
                        {group.label}
                      </Text>
                      <Box style={{
                        flex: 1,
                        height: 1,
                        backgroundColor: t.colors.neutral[200],
                      }} />
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        color: t.colors.neutral[400],
                      }}>
                        {group.items.length} {group.items.length === 1 ? 'event' : 'events'}
                      </Text>
                    </Box>

                    {/* Activity items */}
                    {group.items.map((item, idx) => (
                      <ActivityCard key={item.id} item={item} index={idx} />
                    ))}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
