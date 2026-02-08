'use client';

/**
 * BhTemplateLibrary - Table Preset
 * Sortable table view with inline expandable details for template browsing.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
  createSurfaceStyle,
  getHoverTransform,
} from '../../../helpers';
import type { BhTemplateLibraryProps, TemplateItem, TemplateFilter } from '../../core';
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
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

type SortField = 'name' | 'industry' | 'category' | 'status' | 'stageCount' | 'usageCount' | 'version';
type SortDir = 'asc' | 'desc';

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
        !t.name.toLowerCase().includes(q) &&
        !t.industry.toLowerCase().includes(q) &&
        !t.category.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });
}

function sortTemplates(templates: TemplateItem[], field: SortField, dir: SortDir): TemplateItem[] {
  return [...templates].sort((a, b) => {
    let cmp = 0;
    const aVal = a[field];
    const bVal = b[field];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      cmp = aVal.localeCompare(bVal);
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      cmp = aVal - bVal;
    } else {
      cmp = String(aVal).localeCompare(String(bVal));
    }
    return dir === 'asc' ? cmp : -cmp;
  });
}

/* ------------------------------------------------------------------ */
/*  Table Preset                                                       */
/* ------------------------------------------------------------------ */
export const TableBhTemplateLibrary = createPreset<BhTemplateLibraryProps>(
  'BhTemplateLibrary.Table',
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
      showPreview,
      onPreviewToggle,
      viewMode,
      onViewModeChange,
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
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDir, setSortDir] = useState<SortDir>('asc');
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const filters = controlledFilters ?? localFilters;
    const selectedTemplate = controlledSelected ?? localSelected;

    const handleFilterChange = useCallback(
      (patch: Partial<TemplateFilter>) => {
        const next = { ...filters, ...patch };
        if (onFilterChange) onFilterChange(next);
        else setLocalFilters(next);
      },
      [filters, onFilterChange],
    );

    const handleSelect = useCallback(
      (t: TemplateItem) => {
        if (onTemplateSelect) onTemplateSelect(t);
        else setLocalSelected(t);
      },
      [onTemplateSelect],
    );

    const handleSort = useCallback(
      (field: SortField) => {
        if (sortField === field) {
          setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
          setSortField(field);
          setSortDir('asc');
        }
      },
      [sortField],
    );

    const toggleExpand = useCallback((id: string) => {
      setExpandedRow((prev) => (prev === id ? null : id));
    }, []);

    /* ── Derived data ───────────────────────────────────────────────── */
    const filtered = useMemo(() => filterTemplates(templates, filters), [templates, filters]);
    const sorted = useMemo(() => sortTemplates(filtered, sortField, sortDir), [filtered, sortField, sortDir]);
    const industries = useMemo(() => Array.from(new Set(templates.map((t) => t.industry))), [templates]);
    const categories = useMemo(() => Array.from(new Set(templates.map((t) => t.category))), [templates]);

    /* ── Engine-aware styling ───────────────────────────────────────── */
    const isGlass = engine === 'modern' && !!tokens.glass;

    /* ── Styles ─────────────────────────────────────────────────────── */
    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column' as const,
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
    };

    const tableContainerStyle: React.CSSProperties = {
      flex: 1,
      overflowY: 'auto' as const,
      padding: tokens.spacing[4],
    };

    const tableWrapperStyle: React.CSSProperties = {
      backgroundColor: tokens.colors.common.white,
      borderRadius: tokens.borderRadius.lg,
      boxShadow: tokens.shadows.sm,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      overflow: 'hidden' as const,
      ...(isGlass && tokens.glass
        ? {
            backdropFilter: tokens.glass.blur,
            WebkitBackdropFilter: tokens.glass.blur,
            backgroundColor: tokens.glass.bg,
          }
        : {}),
    };

    const thStyle = (field?: SortField): React.CSSProperties => ({
      padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
      textAlign: 'left' as const,
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[500],
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      backgroundColor: tokens.colors.neutral[50],
      cursor: field ? 'pointer' : 'default',
      userSelect: 'none' as const,
      whiteSpace: 'nowrap' as const,
    });

    const tdStyle: React.CSSProperties = {
      padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
      fontSize: tokens.typography.fontSize.sm,
      color: tokens.colors.neutral[700],
      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
      verticalAlign: 'middle' as const,
    };

    const rowStyle = (id: string): React.CSSProperties => ({
      cursor: 'pointer',
      transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
      backgroundColor:
        selectedTemplate?.id === id
          ? tokens.colors.primaryScale[50]
          : hoveredRow === id
          ? tokens.colors.neutral[50]
          : tokens.colors.common.white,
    });

    const sortIconStyle: React.CSSProperties = {
      display: 'inline-flex',
      marginLeft: tokens.spacing[1],
      verticalAlign: 'middle',
    };

    const expandedDetailStyle: React.CSSProperties = {
      padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`,
      backgroundColor: tokens.colors.neutral[50],
      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
    };

    const detailGridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: tokens.spacing[4],
    };

    const detailSectionTitleStyle: React.CSSProperties = {
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
      padding: `${tokens.spacing[1]}px 0`,
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

    const chipStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
      borderRadius: tokens.borderRadius.sm,
      fontSize: '10px',
      fontWeight: tokens.typography.fontWeight.medium,
      backgroundColor: tokens.colors.neutral[100],
      color: tokens.colors.neutral[600],
      marginRight: tokens.spacing[1],
      marginBottom: tokens.spacing[1],
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

    const closeBtnStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 18,
      height: 18,
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

    const agentCircleStyle = (index: number): React.CSSProperties => ({
      width: 22,
      height: 22,
      borderRadius: tokens.borderRadius.full,
      backgroundColor: tokens.colors.primaryScale[100 + ((index * 100) % 400) as 100 | 200 | 300 | 400],
      color: tokens.colors.primaryScale[700],
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '9px',
      fontWeight: tokens.typography.fontWeight.semibold,
      marginLeft: index > 0 ? -6 : 0,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.common.white}`,
      position: 'relative' as const,
      zIndex: 10 - index,
    });

    const timelineBarStyle: React.CSSProperties = {
      display: 'flex',
      height: 20,
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
        borderRight: index < total - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.common.white}` : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '8px',
        fontWeight: tokens.typography.fontWeight.semibold,
        color: tokens.colors.neutral[800],
        overflow: 'hidden' as const,
        whiteSpace: 'nowrap' as const,
        textOverflow: 'ellipsis' as const,
        padding: `0 ${tokens.spacing[1]}px`,
      };
    };

    /* ── Sort header helper ─────────────────────────────────────────── */
    const renderSortHeader = (label: string, field: SortField) => (
      <th style={thStyle(field)} onClick={() => handleSort(field)}>
        {label}
        {sortField === field && (
          <span style={sortIconStyle}>
            {sortDir === 'asc' ? (
              <ArrowUp size={10} style={{ color: tokens.colors.primaryScale[500] }} />
            ) : (
              <ArrowDown size={10} style={{ color: tokens.colors.primaryScale[500] }} />
            )}
          </span>
        )}
      </th>
    );

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
                style={closeBtnStyle}
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

        {/* Table */}
        <div style={tableContainerStyle}>
          <div style={tableWrapperStyle}>
            {sorted.length === 0 ? (
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
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse' as const,
                  tableLayout: 'fixed' as const,
                }}
              >
                <thead>
                  <tr>
                    <th style={{ ...thStyle(), width: 32 }} />
                    {renderSortHeader('Name', 'name')}
                    {renderSortHeader('Industry', 'industry')}
                    {renderSortHeader('Category', 'category')}
                    {renderSortHeader('Status', 'status')}
                    {renderSortHeader('Stages', 'stageCount')}
                    {renderSortHeader('Usage', 'usageCount')}
                    <th style={thStyle()}>Agents</th>
                    <th style={thStyle()}>Duration</th>
                    <th style={{ ...thStyle(), width: 100 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((template) => {
                    const statusCfg = getStatusConfig(template.status, tokens);
                    const indScale = getIndustryColor(template.industry, tokens);
                    const isExpanded = expandedRow === template.id;
                    const isSelected = selectedTemplate?.id === template.id;

                    return (
                      <React.Fragment key={template.id}>
                        <tr
                          style={rowStyle(template.id)}
                          onMouseEnter={() => setHoveredRow(template.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                          onClick={() => handleSelect(template)}
                        >
                          {/* Expand toggle */}
                          <td style={{ ...tdStyle, width: 32, cursor: 'pointer', textAlign: 'center' as const }}>
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(template.id);
                              }}
                            >
                              {isExpanded ? (
                                <ChevronDown size={14} style={{ color: tokens.colors.neutral[500] }} />
                              ) : (
                                <ChevronRight size={14} style={{ color: tokens.colors.neutral[400] }} />
                              )}
                            </span>
                          </td>

                          {/* Name */}
                          <td style={tdStyle}>
                            <div
                              style={{
                                fontWeight: tokens.typography.fontWeight.semibold,
                                color: tokens.colors.neutral[900],
                                fontSize: tokens.typography.fontSize.sm,
                              }}
                            >
                              {template.name}
                            </div>
                            <div
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: tokens.colors.neutral[400],
                              }}
                            >
                              v{template.version}
                            </div>
                          </td>

                          {/* Industry */}
                          <td style={tdStyle}>
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
                          </td>

                          {/* Category */}
                          <td style={tdStyle}>
                            <span style={{ fontSize: tokens.typography.fontSize.sm }}>
                              {template.category}
                            </span>
                          </td>

                          {/* Status */}
                          <td style={tdStyle}>
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
                              }}
                            >
                              <statusCfg.Icon size={10} />
                              {statusCfg.label}
                            </span>
                          </td>

                          {/* Stages */}
                          <td style={tdStyle}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: tokens.spacing[1],
                                fontSize: tokens.typography.fontSize.sm,
                              }}
                            >
                              <Layers size={12} style={{ color: tokens.colors.infoScale[500] }} />
                              {template.stageCount}
                            </span>
                          </td>

                          {/* Usage */}
                          <td style={tdStyle}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: tokens.spacing[1],
                                fontSize: tokens.typography.fontSize.sm,
                              }}
                            >
                              <TrendingUp size={12} style={{ color: tokens.colors.successScale[500] }} />
                              {template.usageCount}
                            </span>
                          </td>

                          {/* Agents */}
                          <td style={tdStyle}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              {template.agentNames.slice(0, 3).map((name, i) => (
                                <div key={i} style={agentCircleStyle(i)} title={name}>
                                  {getAgentInitials(name)}
                                </div>
                              ))}
                              {template.agentNames.length > 3 && (
                                <span
                                  style={{
                                    fontSize: tokens.typography.fontSize.xs,
                                    color: tokens.colors.neutral[500],
                                    marginLeft: tokens.spacing[1],
                                  }}
                                >
                                  +{template.agentNames.length - 3}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Duration */}
                          <td style={tdStyle}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: tokens.spacing[1],
                                fontSize: tokens.typography.fontSize.xs,
                                color: tokens.colors.neutral[500],
                              }}
                            >
                              <Clock size={12} />
                              {template.estimatedDuration}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ ...tdStyle, width: 100 }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: tokens.spacing[1],
                                opacity: hoveredRow === template.id ? 1 : 0,
                                transition: `opacity ${tokens.transitions?.fast || tokens.motion.hover}`,
                              }}
                            >
                              <button
                                style={actionBtnPrimaryStyle}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelect(template);
                                }}
                                title="Select"
                              >
                                <Eye size={12} />
                              </button>
                              {onClone && (
                                <button
                                  style={actionBtnStyle}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onClone(template);
                                  }}
                                  title="Clone"
                                >
                                  <Copy size={12} />
                                </button>
                              )}
                              {onViewHistory && (
                                <button
                                  style={actionBtnStyle}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onViewHistory(template);
                                  }}
                                  title="History"
                                >
                                  <History size={12} />
                                </button>
                              )}
                              {onCompare && (
                                <button
                                  style={actionBtnStyle}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onCompare(template);
                                  }}
                                  title="Compare"
                                >
                                  <GitCompare size={12} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded inline details */}
                        {isExpanded && (
                          <tr>
                            <td
                              colSpan={10}
                              style={{ padding: 0, border: 'none' }}
                            >
                              <div style={expandedDetailStyle}>
                                <div style={detailGridStyle}>
                                  {/* Left: Stages */}
                                  <div>
                                    <div style={detailSectionTitleStyle}>Stages</div>
                                    {template.stages.map((stage, i) => (
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

                                    {/* SLA Timeline */}
                                    <div style={{ marginTop: tokens.spacing[3] }}>
                                      <div style={detailSectionTitleStyle}>SLA Timeline</div>
                                      <div style={timelineBarStyle}>
                                        {template.stages.map((stage, i) => (
                                          <div
                                            key={i}
                                            style={timelineSegmentStyle(i, template.stages.length)}
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
                                        <span>{template.estimatedDuration}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right: Agents & Rubrics */}
                                  <div>
                                    {template.agentNames.length > 0 && (
                                      <div style={{ marginBottom: tokens.spacing[3] }}>
                                        <div style={detailSectionTitleStyle}>Agents</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap' as const }}>
                                          {template.agentNames.map((name, i) => (
                                            <span key={i} style={chipStyle}>
                                              <Users
                                                size={10}
                                                style={{ marginRight: tokens.spacing[1] }}
                                              />
                                              {name}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {template.rubricNames.length > 0 && (
                                      <div style={{ marginBottom: tokens.spacing[3] }}>
                                        <div style={detailSectionTitleStyle}>Rubrics</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap' as const }}>
                                          {template.rubricNames.map((name, i) => (
                                            <span key={i} style={chipStyle}>
                                              {name}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Inline actions */}
                                    <div
                                      style={{
                                        display: 'flex',
                                        gap: tokens.spacing[2],
                                        marginTop: tokens.spacing[3],
                                      }}
                                    >
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
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  },
);
