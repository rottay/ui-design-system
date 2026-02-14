'use client';

/**
 * BhPipelineFilterBar - Dropdown Preset
 * Collapsible filter panel with expandable sections.
 * Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Filter, X, Search, Save, ChevronDown, ChevronUp,
  Briefcase, User, Calendar, Flag, Globe, Bookmark, SlidersHorizontal,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createEmptyStateStyle,
  formatDistanceToNow,
  getAccentAwareLayout,
} from '../../../helpers';
import type {
  BhPipelineFilterBarProps,
  FilterConfig,
  ActiveFilter,
  SavedPreset,
} from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getFilterIcon(filterId: string) {
  switch (filterId) {
    case 'job': return Briefcase;
    case 'recruiter': return User;
    case 'dateRange': return Calendar;
    case 'priority': return Flag;
    case 'source': return Globe;
    default: return Filter;
  }
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_FILTERS: FilterConfig[] = [
  { id: 'job', label: 'Job', type: 'select', options: [{ value: 'swe', label: 'Software Engineer', count: 24 }, { value: 'pm', label: 'Product Manager', count: 12 }, { value: 'design', label: 'UX Designer', count: 8 }], placeholder: 'Select job...' },
  { id: 'recruiter', label: 'Recruiter', type: 'select', options: [{ value: 'anna', label: 'Anna Smith', count: 18 }, { value: 'bob', label: 'Bob Jones', count: 14 }], placeholder: 'Select recruiter...' },
  { id: 'dateRange', label: 'Date Range', type: 'daterange', placeholder: 'Select dates...' },
  { id: 'priority', label: 'Priority', type: 'multiselect', options: [{ value: 'critical', label: 'Critical', count: 3 }, { value: 'high', label: 'High', count: 10 }, { value: 'medium', label: 'Medium', count: 22 }, { value: 'low', label: 'Low', count: 9 }], placeholder: 'Select priority...' },
  { id: 'source', label: 'Source', type: 'select', options: [{ value: 'linkedin', label: 'LinkedIn', count: 30 }, { value: 'referral', label: 'Referral', count: 14 }], placeholder: 'Select source...' },
];

const MOCK_ACTIVE: ActiveFilter[] = [
  { filterId: 'job', value: 'swe', label: 'Software Engineer' },
];

const MOCK_PRESETS: SavedPreset[] = [
  { id: 'sp-1', name: 'Engineering Pipeline', filters: [{ filterId: 'job', value: 'swe', label: 'Software Engineer' }], createdAt: new Date(Date.now() - 86400000 * 3) },
];

/* ================================================================== */
/*  Dropdown Preset                                                    */
/* ================================================================== */

export const DropdownBhPipelineFilterBar = createPreset<BhPipelineFilterBarProps>({
  name: 'BhPipelineFilterBar.Dropdown',
  render: (ctx: PresetContext<BhPipelineFilterBarProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const {
      filters = MOCK_FILTERS,
      activeFilters = MOCK_ACTIVE,
      savedPresets = MOCK_PRESETS,
      onFilterChange,
      onFilterRemove,
      onPresetSave,
      onPresetLoad,
      onClear,
      className,
      style,
    } = props;

    const [isExpanded, setIsExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const handleFilterSelect = useCallback((filterId: string, value: string) => {
      onFilterChange?.(filterId, value);
    }, [onFilterChange]);

    const handleFilterRemove = useCallback((filterId: string) => {
      onFilterRemove?.(filterId);
    }, [onFilterRemove]);

    const handlePresetLoad = useCallback((presetId: string) => {
      onPresetLoad?.(presetId);
    }, [onPresetLoad]);

    const handleClear = useCallback(() => {
      onClear?.();
    }, [onClear]);

    const handleToggle = useCallback(() => {
      setIsExpanded(prev => !prev);
    }, []);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    return (
      <Box
        className={className}
        style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
          ...animStyle,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>
        {/* Collapsed header bar */}
        <Box
          tabIndex={0}
          role="button"
          aria-expanded={isExpanded}
          aria-label={`Filter panel, ${activeFilters.length} active filters`}
          onClick={handleToggle}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggle(); } }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing[3],
            padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
            cursor: 'pointer',
            transition: `background-color ${t.motion.hover}`,
            backgroundColor: t.colors.common.white,
            ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg } : {}),
          }}
        >
          <Box style={createIconContainerStyle(t, { size: 32, color: t.colors.primaryScale[50] })}>
            <SlidersHorizontal size={16} color={t.colors.primaryScale[600]} />
          </Box>
          <Box style={{ flex: 1 }}>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Filters
            </Text>
          </Box>
          {activeFilters.length > 0 && (
            <Box style={{
              ...createBadgeStyle(t, 'primary'),
              borderRadius: badgeRadius,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>{activeFilters.length} active</Text>
            </Box>
          )}
          {isExpanded ? (
            <ChevronUp size={16} color={t.colors.neutral[400]} />
          ) : (
            <ChevronDown size={16} color={t.colors.neutral[400]} />
          )}
        </Box>

        {/* Active chips (always visible) */}
        {activeFilters.length > 0 && !isExpanded && (
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing[2],
            padding: `0 ${t.spacing[4]}px ${t.spacing[3]}px`,
            flexWrap: 'wrap',
          }}>
            {activeFilters.map((af) => (
              <Box
                key={af.filterId}
                style={{
                  ...createBadgeStyle(t, 'primary'),
                  borderRadius: badgeRadius,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: t.spacing[1],
                }}
                role="status"
                aria-label={`Active filter: ${af.label}`}
              >
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{af.label}</Text>
                <button
                  onClick={(e) => { e.stopPropagation(); handleFilterRemove((af.filterId ?? '')); }}
                  aria-label={`Remove filter: ${af.label}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 14, height: 14, borderRadius: t.borderRadius.full,
                    border: 'none', backgroundColor: 'transparent', cursor: 'pointer',
                    padding: 0, color: t.colors.primaryScale[500],
                  }}
                >
                  <X size={10} />
                </button>
              </Box>
            ))}
          </Box>
        )}

        {/* Expanded filter panel */}
        {isExpanded && (
          <Box style={{
            borderTop: `1px solid ${t.colors.neutral[100]}`,
            padding: t.spacing[4],
          }}>
            {/* Search */}
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              gap: t.spacing[2],
              padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
              borderRadius: t.borderRadius.md,
              backgroundColor: t.colors.neutral[50],
              border: `1px solid ${t.colors.neutral[200]}`,
              marginBottom: t.spacing[4],
            }}>
              <Search size={14} color={t.colors.neutral[400]} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search filters..."
                aria-label="Search filters"
                style={{
                  border: 'none', outline: 'none', backgroundColor: 'transparent',
                  fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800], width: '100%',
                }}
              />
            </Box>

            {/* Filter sections */}
            <Box style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: t.spacing[4],
              marginBottom: t.spacing[4],
            }}>
              {filters.map((filter, fi) => {
                const Icon = getFilterIcon((filter.id ?? ''));
                const activeValue = activeFilters.find(af => af.filterId === filter.id);
                return (
                  <Box
                    key={filter.id}
                    style={{
                      ...entrance.animate,
                      transition: entrance.transition,
                      transitionDelay: `${createStaggerDelay(t, fi)}ms`,
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
                      <Icon size={14} color={t.colors.neutral[500]} />
                      <Text style={{
                        ...sectionLabel,
                        marginBottom: 0,
                      }}>
                        {filter.label}
                      </Text>
                    </Box>
                    {filter.type === 'daterange' ? (
                      <Box style={{
                        padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                        borderRadius: t.borderRadius.md,
                        backgroundColor: t.colors.neutral[50],
                        border: `1px solid ${t.colors.neutral[200]}`,
                      }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                          {filter.placeholder ?? 'Select date range...'}
                        </Text>
                      </Box>
                    ) : filter.options ? (
                      <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[1] }}>
                        {filter.options
                          .filter(o => !searchQuery || (o.label ?? '').toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((opt) => {
                            const isSelected = activeValue?.value === opt.value ||
                              (Array.isArray(activeValue?.value) && (activeValue?.value as string[]).includes(opt.value));
                            return (
                              <Box
                                key={opt.value}
                                role="option"
                                aria-selected={isSelected}
                                tabIndex={0}
                                onClick={() => handleFilterSelect((filter.id ?? ''), opt.value)}
                                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilterSelect((filter.id ?? ''), opt.value); } }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                                  borderRadius: t.borderRadius.sm,
                                  cursor: 'pointer',
                                  backgroundColor: isSelected ? t.colors.primaryScale[50] : 'transparent',
                                  transition: `background-color ${t.motion.hover}`,
                                }}
                              >
                                <Text style={{
                                  fontSize: t.typography.fontSize.xs,
                                  color: isSelected ? t.colors.primaryScale[700] : t.colors.neutral[700],
                                  fontWeight: isSelected ? t.typography.fontWeight.medium : t.typography.fontWeight.normal,
                                }}>
                                  {opt.label}
                                </Text>
                                {opt.count !== undefined && (
                                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                                    {opt.count}
                                  </Text>
                                )}
                              </Box>
                            );
                          })}
                      </Box>
                    ) : null}
                  </Box>
                );
              })}
            </Box>

            {/* Bottom actions */}
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: `1px solid ${t.colors.neutral[100]}`,
              paddingTop: t.spacing[3],
            }}>
              {/* Saved presets */}
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                <Bookmark size={14} color={t.colors.neutral[400]} />
                {savedPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetLoad((preset.id ?? ''))}
                    aria-label={`Load preset: ${preset.name}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                      borderRadius: badgeRadius,
                      fontSize: t.typography.fontSize.xs,
                      fontWeight: t.typography.fontWeight.medium,
                      cursor: 'pointer',
                      backgroundColor: t.colors.neutral[100],
                      color: t.colors.neutral[600],
                      border: `1px solid ${t.colors.neutral[200]}`,
                      transition: `all ${t.motion.hover}`,
                    }}
                  >
                    {preset.name}
                  </button>
                ))}
              </Box>

              <Box style={{ display: 'flex', gap: t.spacing[2] }}>
                {onPresetSave && (
                  <button
                    onClick={() => onPresetSave('New Preset')}
                    aria-label="Save current filters as preset"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: t.spacing[1],
                      padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                      borderRadius: badgeRadius,
                      fontSize: t.typography.fontSize.xs,
                      fontWeight: t.typography.fontWeight.medium,
                      cursor: 'pointer',
                      backgroundColor: t.colors.common.white,
                      color: t.colors.primaryScale[600],
                      border: `1px solid ${t.colors.primaryScale[200]}`,
                      transition: `all ${t.motion.hover}`,
                    }}
                  >
                    <Save size={12} />
                    Save
                  </button>
                )}
                <button
                  onClick={handleClear}
                  aria-label="Clear all filters"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: t.spacing[1],
                    padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                    borderRadius: badgeRadius,
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.medium,
                    cursor: 'pointer',
                    backgroundColor: t.colors.common.white,
                    color: t.colors.neutral[500],
                    border: `1px solid ${t.colors.neutral[200]}`,
                    transition: `all ${t.motion.hover}`,
                  }}
                >
                  <X size={12} />
                  Clear
                </button>
              </Box>
            </Box>
          </Box>
        )}
        </Box>
      </Box>
    );
  },
});
