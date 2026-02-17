'use client';

/**
 * BhPipelineFilterBar - Horizontal Preset
 * Inline filters row with filter chips/pills, search within filter,
 * and saved preset dropdown. Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Filter, X, Search, Save, ChevronDown,
  Briefcase, User, Calendar, Flag, Globe, Bookmark,
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
  { id: 'recruiter', label: 'Recruiter', type: 'select', options: [{ value: 'anna', label: 'Anna Smith', count: 18 }, { value: 'bob', label: 'Bob Jones', count: 14 }, { value: 'carol', label: 'Carol Lee', count: 12 }], placeholder: 'Select recruiter...' },
  { id: 'dateRange', label: 'Date Range', type: 'daterange', placeholder: 'Select dates...' },
  { id: 'priority', label: 'Priority', type: 'multiselect', options: [{ value: 'critical', label: 'Critical', count: 3 }, { value: 'high', label: 'High', count: 10 }, { value: 'medium', label: 'Medium', count: 22 }, { value: 'low', label: 'Low', count: 9 }], placeholder: 'Select priority...' },
  { id: 'source', label: 'Source', type: 'select', options: [{ value: 'linkedin', label: 'LinkedIn', count: 30 }, { value: 'referral', label: 'Referral', count: 14 }, { value: 'careers', label: 'Careers Page', count: 8 }], placeholder: 'Select source...' },
];

const MOCK_ACTIVE: ActiveFilter[] = [
  { filterId: 'job', value: 'swe', label: 'Software Engineer' },
  { filterId: 'priority', value: ['high', 'critical'], label: 'High, Critical' },
];

const MOCK_PRESETS: SavedPreset[] = [
  { id: 'sp-1', name: 'Engineering Pipeline', filters: [{ filterId: 'job', value: 'swe', label: 'Software Engineer' }], createdAt: new Date(Date.now() - 86400000 * 3) },
  { id: 'sp-2', name: 'Urgent Hires', filters: [{ filterId: 'priority', value: ['critical', 'high'], label: 'Critical, High' }], createdAt: new Date(Date.now() - 86400000 * 7) },
];

/* ================================================================== */
/*  Horizontal Preset                                                  */
/* ================================================================== */

export const HorizontalBhPipelineFilterBar = createPreset<BhPipelineFilterBarProps>({
  name: 'BhPipelineFilterBar.Horizontal',
  render: (ctx: PresetContext<BhPipelineFilterBarProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      filters: rawFilters = MOCK_FILTERS,
      activeFilters: rawActiveFilters = MOCK_ACTIVE,
      savedPresets: rawSavedPresets = MOCK_PRESETS,
      onFilterChange,
      onFilterRemove,
      onPresetSave,
      onPresetLoad,
      onClear,
      className,
      style,
    } = props;

    const filters = Array.isArray(rawFilters) ? rawFilters : MOCK_FILTERS;
    const activeFilters = Array.isArray(rawActiveFilters) ? rawActiveFilters : MOCK_ACTIVE;
    const savedPresets = Array.isArray(rawSavedPresets) ? rawSavedPresets : MOCK_PRESETS;

    const [searchQuery, setSearchQuery] = useState('');
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [showPresetDropdown, setShowPresetDropdown] = useState(false);


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const handleFilterRemove = useCallback((filterId: string) => {
      onFilterRemove?.(filterId);
    }, [onFilterRemove]);

    const handleFilterSelect = useCallback((filterId: string, value: string) => {
      onFilterChange?.(filterId, value);
      setActiveDropdown(null);
    }, [onFilterChange]);

    const handlePresetLoad = useCallback((presetId: string) => {
      onPresetLoad?.(presetId);
      setShowPresetDropdown(false);
    }, [onPresetLoad]);

    const handleClear = useCallback(() => {
      onClear?.();
    }, [onClear]);

    const handleToggleDropdown = useCallback((filterId: string) => {
      setActiveDropdown(prev => prev === filterId ? null : filterId);
      setShowPresetDropdown(false);
    }, []);

    const handleTogglePresetDropdown = useCallback(() => {
      setShowPresetDropdown(prev => !prev);
      setActiveDropdown(null);
    }, []);

    const filteredOptions = useMemo(() => {
      if (!activeDropdown) return [];
      const filterCfg = filters.find(f => f.id === activeDropdown);
      if (!filterCfg?.options) return [];
      if (!searchQuery) return filterCfg.options;
      return filterCfg.options.filter(o =>
        (o.label ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [activeDropdown, filters, searchQuery]);

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
          overflow: 'visible',
          ...animStyle,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>
        {/* Main filter row */}
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          gap: t.spacing[3],
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          flexWrap: 'wrap',
        }}>
          {/* Filter icon */}
          <Box style={createIconContainerStyle(t, { size: 32, color: t.colors.primaryScale[50] })}>
            <Filter size={16} color={t.colors.primaryScale[600]} />
          </Box>

          {/* Filter buttons */}
          {filters.map((filter) => {
            const Icon = getFilterIcon((filter.id ?? ''));
            const isActive = activeFilters.some(af => af.filterId === filter.id);
            const isOpen = activeDropdown === filter.id;

            return (
              <Box key={filter.id} style={{ position: 'relative' }}>
                <button
                  onClick={() => handleToggleDropdown((filter.id ?? ''))}
                  aria-label={`Filter by ${filter.label}`}
                  aria-expanded={isOpen}
                  aria-haspopup="listbox"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: t.spacing[1],
                    padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                    borderRadius: badgeRadius,
                    fontSize: t.typography.fontSize.sm,
                    fontWeight: t.typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: `all ${t.motion.hover}`,
                    backgroundColor: isActive ? t.colors.primaryScale[50] : t.colors.neutral[100],
                    color: isActive ? t.colors.primaryScale[700] : t.colors.neutral[600],
                    border: `1px solid ${isActive ? t.colors.primaryScale[200] : t.colors.neutral[200]}`,
                  }}
                >
                  <Icon size={14} />
                  <Text style={{ fontSize: t.typography.fontSize.sm }}>{filter.label}</Text>
                  <ChevronDown size={12} style={{
                    transition: `transform ${t.motion.hover}`,
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }} />
                </button>

                {/* Dropdown */}
                {isOpen && filter.options && (
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: t.spacing[1],
                    minWidth: 200,
                    maxHeight: 240,
                    overflow: 'auto',
                    zIndex: 50,
                    ...createCardStyle(t, { elevation: 'lg', glass: isGlass }),
                    padding: 0,
                  }} role="listbox" aria-label={`${filter.label} options`}>
                    {/* Search within filter */}
                    <Box style={{
                      padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                      borderBottom: `1px solid ${t.colors.neutral[100]}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: t.spacing[2],
                    }}>
                      <Search size={14} color={t.colors.neutral[400]} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        aria-label={`Search ${filter.label} options`}
                        style={{
                          border: 'none',
                          outline: 'none',
                          backgroundColor: 'transparent',
                          fontSize: t.typography.fontSize.sm,
                          color: t.colors.neutral[800],
                          width: '100%',
                        }}
                      />
                    </Box>
                    {filteredOptions.map((opt) => (
                      <Box
                        key={opt.value}
                        role="option"
                        aria-selected={activeFilters.some(af => af.filterId === filter.id && (af.value === opt.value || (Array.isArray(af.value) && af.value.includes(opt.value))))}
                        tabIndex={0}
                        onClick={() => handleFilterSelect((filter.id ?? ''), opt.value)}
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilterSelect((filter.id ?? ''), opt.value); } }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                          cursor: 'pointer',
                          transition: `background-color ${t.motion.hover}`,
                          backgroundColor: t.colors.common.white,
                        }}
                      >
                        <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>
                          {opt.label}
                        </Text>
                        {opt.count !== undefined && (
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                            {opt.count}
                          </Text>
                        )}
                      </Box>
                    ))}
                    {filteredOptions.length === 0 && (
                      <Box style={{ padding: t.spacing[3], textAlign: 'center' }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                          No options found
                        </Text>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            );
          })}

          {/* Spacer */}
          <Box style={{ flex: 1 }} />

          {/* Saved presets dropdown */}
          <Box style={{ position: 'relative' }}>
            <button
              onClick={handleTogglePresetDropdown}
              aria-label="Saved filter presets"
              aria-expanded={showPresetDropdown}
              aria-haspopup="listbox"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: t.spacing[1],
                padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                borderRadius: badgeRadius,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.medium,
                cursor: 'pointer',
                backgroundColor: t.colors.neutral[50],
                color: t.colors.neutral[600],
                border: `1px solid ${t.colors.neutral[200]}`,
                transition: `all ${t.motion.hover}`,
              }}
            >
              <Bookmark size={14} />
              <Text style={{ fontSize: t.typography.fontSize.sm }}>Presets</Text>
              <ChevronDown size={12} />
            </button>
            {showPresetDropdown && savedPresets.length > 0 && (
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: t.spacing[1],
                minWidth: 220,
                zIndex: 50,
                ...createCardStyle(t, { elevation: 'lg', glass: isGlass }),
                padding: 0,
              }} role="listbox" aria-label="Saved presets">
                {savedPresets.map((preset) => (
                  <Box
                    key={preset.id}
                    role="option"
                    tabIndex={0}
                    onClick={() => handlePresetLoad((preset.id ?? ''))}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePresetLoad((preset.id ?? '')); } }}
                    style={{
                      padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                      cursor: 'pointer',
                      borderBottom: `1px solid ${t.colors.neutral[50]}`,
                      transition: `background-color ${t.motion.hover}`,
                      backgroundColor: t.colors.common.white,
                    }}
                  >
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800], display: 'block' }}>
                      {preset.name}
                    </Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                      {(preset.filters ?? []).length} filters - {formatDistanceToNow(new Date(preset.createdAt!), { addSuffix: true })}
                    </Text>
                  </Box>
                ))}
                {onPresetSave && (
                  <Box
                    tabIndex={0}
                    role="option"
                    onClick={() => onPresetSave('New Preset')}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPresetSave('New Preset'); } }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: t.spacing[2],
                      padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                      cursor: 'pointer',
                      borderTop: `1px solid ${t.colors.neutral[100]}`,
                      backgroundColor: t.colors.neutral[50],
                      transition: `background-color ${t.motion.hover}`,
                    }}
                  >
                    <Save size={14} color={t.colors.primaryScale[600]} />
                    <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.primaryScale[600], fontWeight: t.typography.fontWeight.medium }}>
                      Save current filters
                    </Text>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing[2],
            padding: `0 ${t.spacing[4]}px ${t.spacing[3]}px`,
            flexWrap: 'wrap',
          }}>
            {activeFilters.map((af, i) => (
              <Box
                key={af.filterId}
                style={{
                  ...createBadgeStyle(t, 'primary'),
                  borderRadius: badgeRadius,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: t.spacing[1],
                  ...entrance.animate,
                  transition: entrance.transition,
                  transitionDelay: `${createStaggerDelay(t, i)}ms`,
                }}
                role="status"
                aria-label={`Active filter: ${af.label}`}
              >
                <Text style={{ fontSize: t.typography.fontSize.xs }}>
                  {af.label}
                </Text>
                <button
                  onClick={() => handleFilterRemove((af.filterId ?? ''))}
                  aria-label={`Remove filter: ${af.label}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 16,
                    height: 16,
                    borderRadius: t.borderRadius.full,
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    padding: 0,
                    color: t.colors.primaryScale[500],
                  }}
                >
                  <X size={10} />
                </button>
              </Box>
            ))}
            <button
              onClick={handleClear}
              aria-label="Clear all filters"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: t.spacing[1],
                padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                borderRadius: badgeRadius,
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.medium,
                cursor: 'pointer',
                backgroundColor: 'transparent',
                color: t.colors.neutral[500],
                border: 'none',
                transition: `color ${t.motion.hover}`,
              }}
            >
              <X size={12} />
              <Text style={{ fontSize: t.typography.fontSize.xs }}>Clear all</Text>
            </button>
          </Box>
        )}
        </Box>
      </Box>
    );
  },
});
