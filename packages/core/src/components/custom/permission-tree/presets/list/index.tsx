'use client';

import { useState, useMemo } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { PermissionTreeProps } from '../../core';
import { PERMISSION_TREE_DEFAULTS } from '../../core';
import {
  createCardStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
} from '../../../helpers';

export const ListPermissionTree = createPreset<PermissionTreeProps>({
  name: 'PermissionTree.List',
  render: ({ primitives, props, tokens, engine }: PresetContext<PermissionTreeProps>) => {
    const { Box } = primitives;
    const isGlass = engine === 'modern' && !!tokens.glass;
    const {
      items,
      checkedKeys = [],
      onCheck,
      grantedKeys,
      showStatus = PERMISSION_TREE_DEFAULTS.showStatus,
      disabled = PERMISSION_TREE_DEFAULTS.disabled,
      searchable = PERMISSION_TREE_DEFAULTS.searchable,
      grantedLabel = PERMISSION_TREE_DEFAULTS.grantedLabel,
      deniedLabel = PERMISSION_TREE_DEFAULTS.deniedLabel,
      searchPlaceholder = PERMISSION_TREE_DEFAULTS.searchPlaceholder,
      className,
      style,
    } = props;

    const [search, setSearch] = useState('');
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

    const grouped = useMemo(() => {
      const groups: Record<string, typeof items> = {};
      const filtered = search
        ? items.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()) || item.description?.toLowerCase().includes(search.toLowerCase()))
        : items;

      filtered.forEach((item) => {
        const cat = item.category || 'Other';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(item);
      });
      return groups;
    }, [items, search]);

    const handleToggle = (key: string) => {
      if (disabled || !onCheck) return;
      const next = checkedKeys.includes(key)
        ? checkedKeys.filter((k) => k !== key)
        : [...checkedKeys, key];
      onCheck(next);
    };

    const toggleCollapse = (category: string) => {
      setCollapsedCategories((prev) => {
        const next = new Set(prev);
        if (next.has(category)) next.delete(category);
        else next.add(category);
        return next;
      });
    };

    return (
      <Box
        className={className}
        style={{ ...createCardStyle(tokens, { glass: isGlass, elevation: 'md' }), overflow: 'hidden' as const, ...style }}
      >
        {/* Search */}
        {searchable && (
          <div style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              style={{
                width: '100%',
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
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

        {/* Flat tree */}
        {Object.entries(grouped).map(([category, categoryItems]) => {
          const isCollapsed = collapsedCategories.has(category);

          return (
            <div key={category}>
              {/* Category row */}
              <div
                onClick={() => toggleCollapse(category)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                  backgroundColor: tokens.colors.neutral[50],
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  userSelect: 'none',
                }}
              >
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                  transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                  transition: `all ${tokens.motion.hover}`,
                }}>
                  {'\u25BE'}
                </span>
                <span style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[800],
                }}>
                  {category}
                </span>
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                  marginLeft: 'auto',
                }}>
                  {categoryItems.length}
                </span>
              </div>

              {/* Items */}
              {!isCollapsed && categoryItems.map((item) => {
                const isChecked = checkedKeys.includes(item.key);
                const isGranted = grantedKeys?.includes(item.key);

                return (
                  <div
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: tokens.spacing[2],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`,
                      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[50]}`,
                    }}
                  >
                    {onCheck && (
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggle(item.key)}
                        disabled={disabled}
                        style={{ marginTop: 3, accentColor: tokens.colors.primaryScale[600], cursor: disabled ? 'not-allowed' : 'pointer' }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>
                          {item.label}
                        </span>
                        {showStatus && grantedKeys && (
                          <span style={{
                            fontSize: tokens.typography.fontSize.xs,
                            padding: `0 ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.sm,
                            backgroundColor: isGranted ? tokens.colors.successScale[50] : tokens.colors.neutral[100],
                            color: isGranted ? tokens.colors.successScale[700] : tokens.colors.neutral[500],
                          }}>
                            {isGranted ? grantedLabel : deniedLabel}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </Box>
    );
  },
});
