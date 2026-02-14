'use client';

/**
 * BhTemplateLibrary - Cards Preset
 * Grid-based template browser with industry grouping, filter bar,
 * card-based template display, and slide-in detail preview panel.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
  createSurfaceStyle,
  getHoverTransform,
} from '../../../helpers';
import type { BhTemplateLibraryProps, TemplateItem, TemplateFilter, IndustryGroup } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Search,
  Filter,
  Grid,
  List,
  ChevronDown,
  ChevronRight,
  Copy,
  History,
  GitCompare,
  Layers,
  Clock,
  Users,
  TrendingUp,
  X,
  Eye,
  CheckCircle,
  AlertCircle,
  MinusCircle,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStatusConfig(status: TemplateItem['status'], tokens: DesignTokens) {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        bg: tokens.colors.successScale[100],
        color: tokens.colors.successScale[700],
        border: tokens.colors.successScale[200],
        Icon: CheckCircle,
      };
    case 'draft':
      return {
        label: 'Draft',
        bg: tokens.colors.warningScale[100],
        color: tokens.colors.warningScale[700],
        border: tokens.colors.warningScale[200],
        Icon: AlertCircle,
      };
    case 'disabled':
      return {
        label: 'Disabled',
        bg: tokens.colors.neutral[100],
        color: tokens.colors.neutral[500],
        border: tokens.colors.neutral[200],
        Icon: MinusCircle,
      };
  }
}

function getIndustryColor(industry: string, tokens: DesignTokens) {
  const hash = industry.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const scales = [
    tokens.colors.primaryScale,
    tokens.colors.secondaryScale,
    tokens.colors.infoScale,
    tokens.colors.successScale,
    tokens.colors.warningScale,
  ];
  return scales[hash % scales.length];
}

function getAgentInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function filterTemplates(templates: TemplateItem[], filters: TemplateFilter): TemplateItem[] {
  return templates.filter((t) => {
    if (filters.industry && t.industry !== filters.industry) return false;
    if (filters.category && t.category !== filters.category) return false;
    if (filters.status && t.status !== filters.status) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !(t.name || '').toLowerCase().includes(q) &&
        !(t.industry || '').toLowerCase().includes(q) &&
        !(t.category || '').toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });
}

function groupByIndustry(templates: TemplateItem[]): IndustryGroup[] {
  const map = new Map<string, TemplateItem[]>();
  for (const t of templates) {
    const arr = map.get(t.industry) || [];
    arr.push(t);
    map.set(t.industry, arr);
  }
  return Array.from(map.entries()).map(([industry, items]) => ({
    industry,
    templates: items,
  }));
}

/* ------------------------------------------------------------------ */
/*  Cards Preset                                                       */
/* ------------------------------------------------------------------ */
export const CardsBhTemplateLibrary = createPreset<BhTemplateLibraryProps>(
  'BhTemplateLibrary.Cards',
  ({ primitives, props, tokens, engine }: PresetContext<BhTemplateLibraryProps>) => {
    const { Box, Text } = primitives;

    const {
      templates = [],
      filters: controlledFilters,
      onFilterChange,
      selectedTemplate: controlledSelected,
      onTemplateSelect,
      onClone,
      onCompare,
      onViewHistory,
      showPreview: controlledShowPreview,
      onPreviewToggle,
      viewMode,
      onViewModeChange,
      industryGroups: externalGroups,
      className,
      style,
    } = props;

    /* ── Local state ────────────────────────────────────────────────── */
    const [localFilters, setLocalFilters] = useState<TemplateFilter>({
      industry: '',
      category: '',
      status: '',
      search: '',
    });
    const [localSelected, setLocalSelected] = useState<TemplateItem | null>(null);
    const [localShowPreview, setLocalShowPreview] = useState(false);
    const [collapsedIndustries, setCollapsedIndustries] = useState<Set<string>>(new Set());
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const filters = controlledFilters ?? localFilters;
    const selectedTemplate = controlledSelected ?? localSelected;
    const showPreview = controlledShowPreview ?? localShowPreview;

    const handleFilterChange = useCallback(
      (patch: Partial<TemplateFilter>) => {
        const next = { ...filters, ...patch };
        if (onFilterChange) {
          onFilterChange(next);
        } else {
          setLocalFilters(next);
        }
      },
      [filters, onFilterChange],
    );

    const handleSelect = useCallback(
      (t: TemplateItem) => {
        if (onTemplateSelect) onTemplateSelect(t);
        else setLocalSelected(t);
        if (onPreviewToggle) onPreviewToggle(true);
        else setLocalShowPreview(true);
      },
      [onTemplateSelect, onPreviewToggle],
    );

    const handleClosePreview = useCallback(() => {
      if (onPreviewToggle) onPreviewToggle(false);
      else setLocalShowPreview(false);
    }, [onPreviewToggle]);

    const toggleIndustry = useCallback((industry: string) => {
      setCollapsedIndustries((prev) => {
        const next = new Set(prev);
        if (next.has(industry)) next.delete(industry);
        else next.add(industry);
        return next;
      });
    }, []);

    /* ── Derived data ───────────────────────────────────────────────── */
    const filtered = useMemo(() => filterTemplates(templates, filters), [templates, filters]);
    const groups = useMemo(
      () => externalGroups ?? groupByIndustry(filtered),
      [externalGroups, filtered],
    );
    const industries = useMemo(
      () => Array.from(new Set(templates.map((t) => t.industry))),
      [templates],
    );
    const categories = useMemo(
      () => Array.from(new Set(templates.map((t) => t.category))),
      [templates],
    );

    /* ── Engine-aware styling ───────────────────────────────────────── */
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const cardInteractive = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass, interactive: true }), [tokens, isGlass]);
    const hoverTransform = getHoverTransform(tokens);

    /* ── Styles ─────────────────────────────────────────────────────── */
    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column' as const,
      width: '100%',
      height: '100%',
      backgroundColor: tokens.colors.neutral[50],
      fontFamily: 'inherit',
      ...style,
    };

    const filterBarStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[3],
      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
      backgroundColor: tokens.colors.common.white,
      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      flexWrap: 'wrap' as const,
    };

    const searchInputStyle: React.CSSProperties = {
      flex: 1,
      minWidth: 200,
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[2],
      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
      backgroundColor: tokens.colors.neutral[50],
      borderRadius: tokens.borderRadius.md,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      fontSize: tokens.typography.fontSize.sm,
      color: tokens.colors.neutral[700],
    };

    const pillBaseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
      borderRadius: tokens.borderRadius.full,
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.medium,
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      backgroundColor: tokens.colors.common.white,
      color: tokens.colors.neutral[600],
    };

    const pillActiveStyle: React.CSSProperties = {
      ...pillBaseStyle,
      backgroundColor: tokens.colors.primaryScale[50],
      color: tokens.colors.primaryScale[600],
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
    };

    const selectStyle: React.CSSProperties = {
      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
      borderRadius: tokens.borderRadius.md,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.medium,
      backgroundColor: tokens.colors.common.white,
      color: tokens.colors.neutral[700],
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
      outline: 'none',
      appearance: 'none' as const,
      paddingRight: tokens.spacing[6],
      backgroundImage: 'none',
    };

    const bodyStyle: React.CSSProperties = {
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
    };

    const mainStyle: React.CSSProperties = {
      flex: 1,
      overflowY: 'auto' as const,
      padding: tokens.spacing[4],
    };

    const sectionHeaderStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[2],
      padding: `${tokens.spacing[2]}px 0`,
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
      userSelect: 'none' as const,
      marginBottom: tokens.spacing[2],
    };

    const gridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: tokens.spacing[4],
      marginBottom: tokens.spacing[6],
    };

    const templateCardStyle = (id: string): React.CSSProperties => ({
      ...cardInteractive,
      padding: tokens.spacing[4],
      position: 'relative' as const,
      overflow: 'hidden' as const,
      ...(hoveredCard === id ? hoverTransform : {}),
      ...(selectedTemplate?.id === id
        ? {
            borderColor: tokens.colors.primaryScale[400],
            boxShadow: `0 0 0 2px ${tokens.colors.primaryScale[200]}`,
          }
        : {}),
    });

    const cardHeaderStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: tokens.spacing[3],
    };

    const cardTitleStyle: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.md,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[900],
      lineHeight: tokens.typography.lineHeight.tight,
    };

    const metaRowStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[3],
      marginBottom: tokens.spacing[2],
      flexWrap: 'wrap' as const,
    };

    const metaItemStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing[1],
      fontSize: tokens.typography.fontSize.xs,
      color: tokens.colors.neutral[500],
    };

    const agentCircleStyle = (index: number): React.CSSProperties => ({
      width: 24,
      height: 24,
      borderRadius: tokens.borderRadius.full,
      backgroundColor: tokens.colors.primaryScale[100 + ((index * 100) % 400) as 100 | 200 | 300 | 400],
      color: tokens.colors.primaryScale[700],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '10px',
      fontWeight: tokens.typography.fontWeight.semibold,
      marginLeft: index > 0 ? -8 : 0,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.common.white}`,
      position: 'relative' as const,
      zIndex: 10 - index,
    });

    const actionsOverlayStyle: React.CSSProperties = {
      position: 'absolute' as const,
      bottom: 0,
      left: 0,
      right: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.spacing[2],
      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
      background: isGlass && tokens.glass
        ? tokens.glass.bg
        : `linear-gradient(to top, ${tokens.colors.common.white}, ${tokens.colors.common.white}f0)`,
      backdropFilter: isGlass && tokens.glass ? tokens.glass.blur : undefined,
      WebkitBackdropFilter: isGlass && tokens.glass ? tokens.glass.blur : undefined,
      borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
      transition: `opacity ${tokens.transitions?.fast || tokens.motion.hover}`,
    };

    const actionBtnStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing[1],
      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
      borderRadius: tokens.borderRadius.sm,
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.medium,
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      backgroundColor: tokens.colors.common.white,
      color: tokens.colors.neutral[600],
    };

    const actionBtnPrimaryStyle: React.CSSProperties = {
      ...actionBtnStyle,
      backgroundColor: tokens.colors.primaryScale[500],
      color: tokens.colors.common.white,
      border: 'none',
    };

    /* ── Preview Panel Styles ───────────────────────────────────────── */
    const previewPanelStyle: React.CSSProperties = {
      width: 380,
      backgroundColor: tokens.colors.common.white,
      borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      overflowY: 'auto' as const,
      transition: `transform ${tokens.transitions?.normal || tokens.motion.hover}`,
      boxShadow: tokens.shadows.lg,
      ...(isGlass && tokens.glass
        ? {
            backdropFilter: tokens.glass.blur,
            WebkitBackdropFilter: tokens.glass.blur,
            backgroundColor: tokens.glass.bg,
          }
        : {}),
    };

    const previewHeaderStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${tokens.spacing[4]}px ${tokens.spacing[4]}px`,
      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
    };

    const previewTitleStyle: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.lg,
      fontWeight: tokens.typography.fontWeight.bold,
      color: tokens.colors.neutral[900],
    };

    const previewSectionStyle: React.CSSProperties = {
      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
    };

    const previewSectionTitleStyle: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[500],
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      marginBottom: tokens.spacing[2],
    };

    const stageRowStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[2],
      padding: `${tokens.spacing[2]}px 0`,
      fontSize: tokens.typography.fontSize.sm,
      color: tokens.colors.neutral[700],
    };

    const stageDotStyle = (index: number): React.CSSProperties => {
      const colors = [
        tokens.colors.primaryScale[400],
        tokens.colors.infoScale[400],
        tokens.colors.successScale[400],
        tokens.colors.warningScale[400],
        tokens.colors.secondaryScale[400],
      ];
      return {
        width: 8,
        height: 8,
        borderRadius: tokens.borderRadius.full,
        backgroundColor: colors[index % colors.length],
        flexShrink: 0,
      };
    };

    const timelineBarStyle: React.CSSProperties = {
      display: 'flex',
      height: 24,
      borderRadius: tokens.borderRadius.md,
      overflow: 'hidden' as const,
      marginTop: tokens.spacing[2],
      marginBottom: tokens.spacing[1],
    };

    const timelineSegmentStyle = (index: number, total: number): React.CSSProperties => {
      const colors = [
        tokens.colors.primaryScale[300],
        tokens.colors.infoScale[300],
        tokens.colors.successScale[300],
        tokens.colors.warningScale[300],
        tokens.colors.secondaryScale[300],
      ];
      return {
        flex: 1,
        backgroundColor: colors[index % colors.length],
        borderRight:
          index < total - 1
            ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.common.white}`
            : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '9px',
        fontWeight: tokens.typography.fontWeight.semibold,
        color: tokens.colors.neutral[800],
        overflow: 'hidden' as const,
        whiteSpace: 'nowrap' as const,
        textOverflow: 'ellipsis' as const,
        padding: `0 ${tokens.spacing[1]}px`,
      };
    };

    const closeBtnStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 28,
      height: 28,
      borderRadius: tokens.borderRadius.md,
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
      backgroundColor: 'transparent',
      color: tokens.colors.neutral[500],
      border: 'none',
    };

    const emptyStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: `${tokens.spacing[10]}px ${tokens.spacing[4]}px`,
      color: tokens.colors.neutral[400],
      textAlign: 'center' as const,
    };

    const chipRowStyle: React.CSSProperties = {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: tokens.spacing[1],
      marginTop: tokens.spacing[1],
    };

    const chipStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
      borderRadius: tokens.borderRadius.sm,
      fontSize: '10px',
      fontWeight: tokens.typography.fontWeight.medium,
      backgroundColor: tokens.colors.neutral[100],
      color: tokens.colors.neutral[600],
    };

    /* ── Render ──────────────────────────────────────────────────────── */
    return (
      <div style={containerStyle} className={className}>
        {/* Filter Bar */}
        <div style={filterBarStyle}>
          {/* Search */}
          <div style={searchInputStyle}>
            <Search size={14} style={{ color: tokens.colors.neutral[400], flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search templates..."
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                flex: 1,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[700],
              }}
            
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = tokens.colors.neutral[300];
              }}
            />
            {filters.search && (
              <button
                onClick={() => handleFilterChange({ search: '' })}
                style={{
                  ...closeBtnStyle,
                  width: 18,
                  height: 18,
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Industry pills */}
          <div style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' as const }}>
            <span
              style={filters.industry === '' ? pillActiveStyle : pillBaseStyle}
              onClick={() => handleFilterChange({ industry: '' })}
            >
              All
            </span>
            {industries.map((ind) => (
              <span
                key={ind}
                style={filters.industry === ind ? pillActiveStyle : pillBaseStyle}
                onClick={() => handleFilterChange({ industry: ind })}
              >
                {ind}
              </span>
            ))}
          </div>

          {/* Category dropdown */}
          <div style={{ position: 'relative' as const, display: 'flex', alignItems: 'center' }}>
            <select
              style={selectStyle}
              value={filters.category}
              onChange={(e) => handleFilterChange({ category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              style={{
                position: 'absolute' as const,
                right: tokens.spacing[2],
                pointerEvents: 'none' as const,
                color: tokens.colors.neutral[400],
              }}
            />
          </div>

          {/* Status chips */}
          <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
            {(['', 'active', 'draft', 'disabled'] as const).map((s) => {
              const label = s === '' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1);
              return (
                <span
                  key={s}
                  style={filters.status === s ? pillActiveStyle : pillBaseStyle}
                  onClick={() => handleFilterChange({ status: s })}
                >
                  {label}
                </span>
              );
            })}
          </div>

          {/* View mode toggle */}
          {onViewModeChange && (
            <div
              style={{
                display: 'flex',
                gap: 0,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                overflow: 'hidden' as const,
                marginLeft: 'auto',
              }}
            >
              <button
                onClick={() => onViewModeChange('cards')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  border: 'none',
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  backgroundColor:
                    viewMode === 'cards'
                      ? tokens.colors.primaryScale[50]
                      : tokens.colors.common.white,
                  color:
                    viewMode === 'cards'
                      ? tokens.colors.primaryScale[600]
                      : tokens.colors.neutral[500],
                }}
              >
                <Grid size={14} />
              </button>
              <button
                onClick={() => onViewModeChange('table')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  border: 'none',
                  borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  backgroundColor:
                    viewMode === 'table'
                      ? tokens.colors.primaryScale[50]
                      : tokens.colors.common.white,
                  color:
                    viewMode === 'table'
                      ? tokens.colors.primaryScale[600]
                      : tokens.colors.neutral[500],
                }}
              >
                <List size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Body: main grid + optional preview */}
        <div style={bodyStyle}>
          {/* Main scrollable area */}
          <div style={mainStyle}>
            {groups.length === 0 ? (
              <div style={emptyStyle}>
                <Layers size={40} style={{ marginBottom: tokens.spacing[3], opacity: 0.4 }} />
                <span
                  style={{
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[500],
                  }}
                >
                  No templates found
                </span>
                <span
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[400],
                    marginTop: tokens.spacing[1],
                  }}
                >
                  Try adjusting your filters
                </span>
              </div>
            ) : (
              groups.map((group) => {
                const isCollapsed = collapsedIndustries.has(group.industry);
                const industryScale = getIndustryColor(group.industry, tokens);

                return (
                  <div key={group.industry}>
                    {/* Industry section header */}
                    <div
                      style={sectionHeaderStyle}
                      onClick={() => toggleIndustry(group.industry)}
                    >
                      {isCollapsed ? (
                        <ChevronRight
                          size={16}
                          style={{ color: tokens.colors.neutral[500] }}
                        />
                      ) : (
                        <ChevronDown
                          size={16}
                          style={{ color: tokens.colors.neutral[500] }}
                        />
                      )}
                      <span
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[800],
                        }}
                      >
                        {group.industry}
                      </span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: 20,
                          height: 20,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: industryScale[100],
                          color: industryScale[700],
                          fontSize: '11px',
                          fontWeight: tokens.typography.fontWeight.semibold,
                          padding: `0 ${tokens.spacing[1]}px`,
                        }}
                      >
                        {group.templates.length}
                      </span>
                    </div>

                    {/* Template cards grid */}
                    {!isCollapsed && (
                      <div style={gridStyle}>
                        {group.templates.map((template) => {
                          const statusCfg = getStatusConfig(template.status, tokens);
                          const indScale = getIndustryColor(template.industry, tokens);
                          const isHovered = hoveredCard === template.id;

                          return (
                            <div
                              key={template.id}
                              style={templateCardStyle(template.id)}
                              onMouseEnter={() => setHoveredCard(template.id)}
                              onMouseLeave={() => setHoveredCard(null)}
                              onClick={() => handleSelect(template)}
                            >
                              {/* Card header */}
                              <div style={cardHeaderStyle}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={cardTitleStyle}>{template.name}</div>
                                  <div
                                    style={{
                                      fontSize: tokens.typography.fontSize.xs,
                                      color: tokens.colors.neutral[400],
                                      marginTop: tokens.spacing[1],
                                    }}
                                  >
                                    v{template.version}
                                  </div>
                                </div>
                                {/* Status badge */}
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: tokens.spacing[1],
                                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                                    borderRadius: tokens.borderRadius.full,
                                    fontSize: tokens.typography.fontSize.xs,
                                    fontWeight: tokens.typography.fontWeight.medium,
                                    backgroundColor: statusCfg.bg,
                                    color: statusCfg.color,
                                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusCfg.border}`,
                                    flexShrink: 0,
                                  }}
                                >
                                  <statusCfg.Icon size={10} />
                                  {statusCfg.label}
                                </span>
                              </div>

                              {/* Meta row */}
                              <div style={metaRowStyle}>
                                {/* Stage count badge */}
                                <span
                                  style={{
                                    ...createBadgeStyle(tokens, 'info'),
                                    gap: tokens.spacing[1],
                                  }}
                                >
                                  <Layers size={10} />
                                  {template.stageCount} stages
                                </span>

                                {/* Industry badge */}
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                                    borderRadius: tokens.borderRadius.full,
                                    fontSize: tokens.typography.fontSize.xs,
                                    fontWeight: tokens.typography.fontWeight.medium,
                                    backgroundColor: indScale[100],
                                    color: indScale[700],
                                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${indScale[200]}`,
                                  }}
                                >
                                  {template.industry}
                                </span>
                              </div>

                              {/* Usage + Duration row */}
                              <div style={metaRowStyle}>
                                <span style={metaItemStyle}>
                                  <TrendingUp size={12} />
                                  {template.usageCount} uses
                                </span>
                                <span style={metaItemStyle}>
                                  <Clock size={12} />
                                  {template.estimatedDuration}
                                </span>
                              </div>

                              {/* Agent icons */}
                              {template.agentNames.length > 0 && (
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginTop: tokens.spacing[2],
                                    gap: 0,
                                  }}
                                >
                                  <Users
                                    size={12}
                                    style={{
                                      color: tokens.colors.neutral[400],
                                      marginRight: tokens.spacing[2],
                                    }}
                                  />
                                  {template.agentNames.slice(0, 4).map((name, i) => (
                                    <div
                                      key={i}
                                      style={agentCircleStyle(i)}
                                      title={name}
                                    >
                                      {getAgentInitials(name)}
                                    </div>
                                  ))}
                                  {template.agentNames.length > 4 && (
                                    <span
                                      style={{
                                        fontSize: tokens.typography.fontSize.xs,
                                        color: tokens.colors.neutral[500],
                                        marginLeft: tokens.spacing[1],
                                      }}
                                    >
                                      +{template.agentNames.length - 4}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Hover actions overlay */}
                              {isHovered && (
                                <div style={actionsOverlayStyle}>
                                  <button
                                    style={actionBtnPrimaryStyle}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelect(template);
                                    }}
                                  >
                                    <Eye size={12} />
                                    Select
                                  </button>
                                  {onClone && (
                                    <button
                                      style={actionBtnStyle}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onClone(template);
                                      }}
                                    >
                                      <Copy size={12} />
                                      Clone
                                    </button>
                                  )}
                                  {onViewHistory && (
                                    <button
                                      style={actionBtnStyle}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onViewHistory(template);
                                      }}
                                    >
                                      <History size={12} />
                                      History
                                    </button>
                                  )}
                                  {onCompare && (
                                    <button
                                      style={actionBtnStyle}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onCompare(template);
                                      }}
                                    >
                                      <GitCompare size={12} />
                                      Compare
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Detail Preview Panel */}
          {showPreview && selectedTemplate && (
            <div style={previewPanelStyle}>
              {/* Preview header */}
              <div style={previewHeaderStyle}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={previewTitleStyle}>{selectedTemplate.name}</div>
                  <div
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      marginTop: tokens.spacing[1],
                    }}
                  >
                    v{selectedTemplate.version} &middot; {selectedTemplate.category}
                  </div>
                </div>
                <button style={closeBtnStyle} onClick={handleClosePreview}>
                  <X size={16} />
                </button>
              </div>

              {/* Summary */}
              <div style={previewSectionStyle}>
                <div
                  style={{
                    display: 'flex',
                    gap: tokens.spacing[3],
                    flexWrap: 'wrap' as const,
                  }}
                >
                  <span style={metaItemStyle}>
                    <Layers size={12} />
                    {selectedTemplate.stageCount} stages
                  </span>
                  <span style={metaItemStyle}>
                    <Clock size={12} />
                    {selectedTemplate.estimatedDuration}
                  </span>
                  <span style={metaItemStyle}>
                    <TrendingUp size={12} />
                    {selectedTemplate.usageCount} uses
                  </span>
                </div>
              </div>

              {/* SLA Timeline */}
              <div style={previewSectionStyle}>
                <div style={previewSectionTitleStyle}>SLA Timeline</div>
                <div style={timelineBarStyle}>
                  {selectedTemplate.stages.map((stage, i) => (
                    <div
                      key={i}
                      style={timelineSegmentStyle(i, selectedTemplate.stages.length)}
                      title={stage.name}
                    >
                      {stage.name.slice(0, 6)}
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '10px',
                    color: tokens.colors.neutral[400],
                  }}
                >
                  <span>Start</span>
                  <span>{selectedTemplate.estimatedDuration}</span>
                </div>
              </div>

              {/* Stages List */}
              <div style={previewSectionStyle}>
                <div style={previewSectionTitleStyle}>Stages</div>
                {selectedTemplate.stages.map((stage, i) => (
                  <div key={i} style={stageRowStyle}>
                    <div style={stageDotStyle(i)} />
                    <span style={{ flex: 1, fontWeight: tokens.typography.fontWeight.medium }}>
                      {stage.name}
                    </span>
                    <span
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[400],
                      }}
                    >
                      {stage.type}
                    </span>
                  </div>
                ))}
              </div>

              {/* Agent Names */}
              {selectedTemplate.agentNames.length > 0 && (
                <div style={previewSectionStyle}>
                  <div style={previewSectionTitleStyle}>Agents</div>
                  <div style={chipRowStyle}>
                    {selectedTemplate.agentNames.map((name, i) => (
                      <span key={i} style={chipStyle}>
                        <Users size={10} style={{ marginRight: tokens.spacing[1] }} />
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Rubric Names */}
              {selectedTemplate.rubricNames.length > 0 && (
                <div style={previewSectionStyle}>
                  <div style={previewSectionTitleStyle}>Rubrics</div>
                  <div style={chipRowStyle}>
                    {selectedTemplate.rubricNames.map((name, i) => (
                      <span key={i} style={chipStyle}>
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Actions */}
              <div
                style={{
                  padding: `${tokens.spacing[4]}px`,
                  display: 'flex',
                  gap: tokens.spacing[2],
                }}
              >
                <button
                  style={{
                    ...actionBtnPrimaryStyle,
                    flex: 1,
                    justifyContent: 'center',
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  }}
                  onClick={() => onTemplateSelect?.(selectedTemplate)}
                >
                  <Eye size={14} />
                  Select Template
                </button>
                {onClone && (
                  <button
                    style={{
                      ...actionBtnStyle,
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    }}
                    onClick={() => onClone(selectedTemplate)}
                  >
                    <Copy size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);
