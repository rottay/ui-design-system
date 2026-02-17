'use client';

import { useState, useMemo, useCallback } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { FilterBuilderProps, FilterFieldConfig } from '../../core';
import { FILTER_BUILDER_DEFAULTS } from '../../core';
import {
  createBadgeStyle,
  createCardStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createSectionHeaderStyle,
} from '../../../helpers';

export const PanelFilterBuilder = createPreset<FilterBuilderProps>({
  name: 'FilterBuilder.Panel',
  render: ({ primitives, props, tokens, engine }: PresetContext<FilterBuilderProps>) => {
    const { Box } = primitives;
    const {
      filterConfig,
      filters,
      onFiltersChange,
      quickPresets: rawQuickPresets = [],
      savedFilters: rawSavedFilters = [],
      onSaveFilter,
      onDeleteSavedFilter,
      onLoadSavedFilter,
      totalCount,
      filteredCount,
      searchKey = FILTER_BUILDER_DEFAULTS.searchKey!,
      searchIcon,
      loading,
      className,
      style,
    } = props;

    const quickPresets = Array.isArray(rawQuickPresets) ? rawQuickPresets : [];
    const savedFilters = Array.isArray(rawSavedFilters) ? rawSavedFilters : [];

    const [showSecondary, setShowSecondary] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [saveName, setSaveName] = useState('');

    const primaryFields = useMemo(() => filterConfig.filter((f) => f.primary), [filterConfig]);
    const secondaryFields = useMemo(() => filterConfig.filter((f) => !f.primary), [filterConfig]);
    const searchField = useMemo(() => filterConfig.find((f) => f.key === searchKey), [filterConfig, searchKey]);

    const hasFilters = useMemo(() => {
      return Object.entries(filters).some(([, val]) => {
        if (val === '' || val === null || val === undefined) return false;
        if (Array.isArray(val) && val.length === 0) return false;
        return true;
      });
    }, [filters]);

    const activeFilterCount = useMemo(() => {
      return Object.entries(filters).filter(([, val]) => {
        if (val === '' || val === null || val === undefined) return false;
        if (Array.isArray(val) && val.length === 0) return false;
        return true;
      }).length;
    }, [filters]);

    const setFilter = useCallback((key: string, value: unknown) => {
      onFiltersChange({ ...filters, [key]: value });
    }, [filters, onFiltersChange]);

    const resetFilters = useCallback(() => {
      const cleared: Record<string, unknown> = {};
      filterConfig.forEach((f) => {
        if (f.type === 'multiselect') cleared[f.key] = [];
        else if (f.type === 'boolean') cleared[f.key] = null;
        else if (f.type === 'number-range') cleared[f.key] = { min: '', max: '' };
        else cleared[f.key] = '';
      });
      onFiltersChange(cleared);
    }, [filterConfig, onFiltersChange]);

    const renderField = (field: FilterFieldConfig) => {
      const value = filters[field.key];

      switch (field.type) {
        case 'text':
          return (
            <input
              type="text"
              value={(value as string) ?? ''}
              onChange={(e) => setFilter(field.key, e.target.value)}
              placeholder={field.placeholder ?? field.label}
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                fontSize: tokens.typography.fontSize.sm,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.neutral[50],
                color: tokens.colors.neutral[900],
                outline: 'none',
                fontFamily: 'inherit',
                minWidth: field.minWidth ?? 160,
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
          );

        case 'select':
          return (
            <select
              value={(value as string) ?? ''}
              onChange={(e) => setFilter(field.key, e.target.value)}
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                fontSize: tokens.typography.fontSize.sm,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[900],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                fontFamily: 'inherit',
                minWidth: field.minWidth ?? 140,
              }}
            >
              <option value="">{field.placeholder ?? `All ${field.label}`}</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          );

        case 'multiselect':
          return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[1] }}>
              {field.options?.map((opt) => {
                const selected = Array.isArray(value) && value.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      const arr = Array.isArray(value) ? value : [];
                      setFilter(field.key, selected ? arr.filter((v: string) => v !== opt.value) : [...arr, opt.value]);
                    }}
                    style={{
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: selected ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                      color: selected ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                      backgroundColor: selected ? tokens.colors.primaryScale[50] : tokens.colors.neutral[50],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${selected ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`,
                      borderRadius: tokens.borderRadius.full,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      fontFamily: 'inherit',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          );

        case 'number-range': {
          const range = (value as { min?: string; max?: string }) ?? {};
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <input
                type="number"
                value={range.min ?? ''}
                onChange={(e) => setFilter(field.key, { ...range, min: e.target.value })}
                placeholder="Min"
                style={{
                  width: 80,
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                  fontSize: tokens.typography.fontSize.sm,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  borderRadius: tokens.borderRadius.md,
                  fontFamily: 'inherit',
                }}
              />
              <span style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.xs }}>–</span>
              <input
                type="number"
                value={range.max ?? ''}
                onChange={(e) => setFilter(field.key, { ...range, max: e.target.value })}
                placeholder="Max"
                style={{
                  width: 80,
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                  fontSize: tokens.typography.fontSize.sm,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  borderRadius: tokens.borderRadius.md,
                  fontFamily: 'inherit',
                }}
              />
            </div>
          );
        }

        case 'boolean':
          return (
            <label style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => setFilter(field.key, e.target.checked || null)}
                style={{ accentColor: tokens.colors.primaryScale[600] }}
              />
              <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{field.label}</span>
            </label>
          );

        default:
          return null;
      }
    };

    return (
      <Box
        className={className}
        style={{
          backgroundColor: tokens.colors.common.white,
          borderRadius: tokens.borderRadius.lg,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          overflow: 'hidden',
          ...style,
        }}
      >
        {/* Counts + filter count */}
        {(totalCount !== undefined || activeFilterCount > 0) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          }}>
            {totalCount !== undefined && (
              <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                {filteredCount !== undefined && filteredCount !== totalCount
                  ? <><strong style={{ color: tokens.colors.neutral[700] }}>{filteredCount}</strong> of {totalCount} results</>
                  : <><strong style={{ color: tokens.colors.neutral[700] }}>{totalCount}</strong> results</>
                }
              </span>
            )}
            {activeFilterCount > 0 && (
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                padding: `0 ${tokens.spacing[2]}px`,
                backgroundColor: tokens.colors.primaryScale[50],
                color: tokens.colors.primaryScale[600],
                borderRadius: tokens.borderRadius.full,
                fontWeight: tokens.typography.fontWeight.semibold,
              }}>
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}
              </span>
            )}
            <div style={{ flex: 1 }} />
            {savedFilters.length > 0 && (
              <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                {savedFilters.map((sf) => (
                  <button
                    key={sf.id}
                    onClick={() => onLoadSavedFilter?.(sf)}
                    style={{
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[600],
                      backgroundColor: tokens.colors.neutral[50],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      borderRadius: tokens.borderRadius.md,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      fontFamily: 'inherit',
                    }}
                  >
                    {sf.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Primary filters row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          flexWrap: 'wrap' as const,
        }}>
          {/* Search */}
          {searchField && (
            <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160, maxWidth: 320 }}>
              {searchIcon && (
                <span style={{
                  position: 'absolute',
                  left: tokens.spacing[3],
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: tokens.colors.neutral[400],
                  fontSize: tokens.typography.fontSize.sm,
                  pointerEvents: 'none',
                }}>
                  {searchIcon}
                </span>
              )}
              <input
                type="text"
                value={(filters[searchKey] as string) ?? ''}
                onChange={(e) => setFilter(searchKey, e.target.value)}
                placeholder={searchField.placeholder ?? 'Search...'}
                style={{
                  width: '100%',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  paddingLeft: searchIcon ? tokens.spacing[8] : tokens.spacing[3],
                  fontSize: tokens.typography.fontSize.sm,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.neutral[50],
                  color: tokens.colors.neutral[900],
                  outline: 'none',
                  fontFamily: 'inherit',
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
            </div>
          )}

          {/* Primary filter fields */}
          {primaryFields.filter((f) => f.key !== searchKey).map((field) => (
            <div key={field.key}>
              {renderField(field)}
            </div>
          ))}

          {/* More filters toggle */}
          {secondaryFields.length > 0 && (
            <button
              onClick={() => setShowSecondary(!showSecondary)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                fontSize: tokens.typography.fontSize.sm,
                color: showSecondary ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                backgroundColor: showSecondary ? tokens.colors.primaryScale[50] : 'transparent',
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${showSecondary ? tokens.colors.primaryScale[200] : tokens.colors.neutral[300]}`,
                borderRadius: tokens.borderRadius.md,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                fontFamily: 'inherit',
              }}
            >
              More Filters
              {activeFilterCount > primaryFields.length && (
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  backgroundColor: tokens.colors.primaryScale[100],
                  color: tokens.colors.primaryScale[700],
                  padding: `0 ${tokens.spacing[1]}px`,
                  borderRadius: tokens.borderRadius.full,
                  marginLeft: tokens.spacing[1],
                }}>
                  +{activeFilterCount - primaryFields.length}
                </span>
              )}
            </button>
          )}

          {hasFilters && (
            <button
              onClick={resetFilters}
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                fontFamily: 'inherit',
                textDecoration: 'underline',
              }}
            >
              Clear all
            </button>
          )}

          {onSaveFilter && hasFilters && (
            <button
              onClick={() => setShowSaveModal(true)}
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.primaryScale[600],
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                fontFamily: 'inherit',
              }}
            >
              Save filter
            </button>
          )}
        </div>

        {/* Quick presets */}
        {quickPresets.length > 0 && (
          <div style={{
            display: 'flex',
            gap: tokens.spacing[2],
            padding: `0 ${tokens.spacing[4]}px ${tokens.spacing[3]}px`,
            flexWrap: 'wrap' as const,
          }}>
            {quickPresets.map((preset) => (
              <button
                key={preset.key}
                onClick={() => onFiltersChange({ ...filters, ...preset.filters })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[600],
                  backgroundColor: tokens.colors.neutral[50],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  borderRadius: tokens.borderRadius.md,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  fontFamily: 'inherit',
                }}
              >
                {preset.icon && <span>{preset.icon}</span>}
                {preset.label}
              </button>
            ))}
          </div>
        )}

        {/* Secondary filters */}
        {showSecondary && secondaryFields.length > 0 && (
          <div style={{
            padding: `${tokens.spacing[4]}px ${tokens.spacing[4]}px`,
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            backgroundColor: tokens.colors.neutral[50],
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: tokens.spacing[4],
          }}>
            {secondaryFields.map((field) => (
              <div key={field.key}>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[500],
                  marginBottom: tokens.spacing[2],
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                }}>
                  {field.label}
                </div>
                {renderField(field)}
              </div>
            ))}
          </div>
        )}

        {/* Applied filters tags */}
        {hasFilters && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap' as const,
            gap: tokens.spacing[1],
            padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px ${tokens.spacing[3]}px`,
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          }}>
            {Object.entries(filters)
              .filter(([, val]) => {
                if (val === '' || val === null || val === undefined) return false;
                if (Array.isArray(val) && val.length === 0) return false;
                return true;
              })
              .map(([key, val]) => {
                const field = filterConfig.find((f) => f.key === key);
                const label = field?.label ?? key;
                const displayVal = Array.isArray(val) ? `${val.length} selected` : String(val);
                return (
                  <span
                    key={key}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      fontSize: tokens.typography.fontSize.xs,
                      backgroundColor: tokens.colors.primaryScale[50],
                      color: tokens.colors.primaryScale[700],
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[100]}`,
                    }}
                  >
                    {label}: {displayVal}
                    <button
                      onClick={() => {
                        const cleared = { ...filters };
                        if (field?.type === 'multiselect') cleared[key] = [];
                        else if (field?.type === 'boolean') cleared[key] = null;
                        else if (field?.type === 'number-range') cleared[key] = { min: '', max: '' };
                        else cleared[key] = '';
                        onFiltersChange(cleared);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: tokens.colors.primaryScale[400],
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        fontSize: tokens.typography.fontSize.xs,
                        padding: 0,
                        lineHeight: 1,
                      }}
                    >
                      {'\u2715'}
                    </button>
                  </span>
                );
              })}
          </div>
        )}

        {/* Save filter modal */}
        {showSaveModal && (
          <>
            <div onClick={() => setShowSaveModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: tokens.overlay?.light, zIndex: 999 }} />
            <div style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              width: 360,
              backgroundColor: tokens.colors.common.white,
              borderRadius: tokens.borderRadius.xl,
              boxShadow: tokens.shadows.xl,
              padding: tokens.spacing[5],
            }}>
              <div style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing[4] }}>
                Save Filter
              </div>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Filter name"
                autoFocus
                style={{
                  width: '100%',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  fontSize: tokens.typography.fontSize.sm,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  borderRadius: tokens.borderRadius.md,
                  marginBottom: tokens.spacing[4],
                  fontFamily: 'inherit',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: tokens.spacing[2] }}>
                <button
                  onClick={() => { setShowSaveModal(false); setSaveName(''); }}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[600],
                    backgroundColor: tokens.colors.common.white,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    borderRadius: tokens.borderRadius.md,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (saveName.trim()) {
                      onSaveFilter?.(saveName.trim());
                      setShowSaveModal(false);
                      setSaveName('');
                    }
                  }}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.common.white,
                    backgroundColor: tokens.colors.primaryScale[600],
                    border: 'none',
                    borderRadius: tokens.borderRadius.md,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    fontFamily: 'inherit',
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </>
        )}
      </Box>
    );
  },
});
