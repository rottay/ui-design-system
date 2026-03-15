'use client';

import { useState, useMemo } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { PermissionTreeProps } from '../../core';
import { PERMISSION_TREE_DEFAULTS } from '../../core';
import {
  createPanelHeaderStyle,
} from '../../../helpers';

export const GridPermissionTree = createPreset<PermissionTreeProps>({
  name: 'PermissionTree.Grid',
  render: ({ primitives, props, tokens, engine }: PresetContext<PermissionTreeProps>) => {
    const { Box } = primitives;
    const {
      items,
      checkedKeys: rawCheckedKeys = [],
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

    const checkedKeys = Array.isArray(rawCheckedKeys) ? rawCheckedKeys : [];

    const [search, setSearch] = useState('');

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

    const handleToggleCategory = (categoryItems: typeof items) => {
      if (disabled || !onCheck) return;
      const keys = categoryItems.map((i) => i.key);
      const allChecked = keys.every((k) => checkedKeys.includes(k));
      const next = allChecked
        ? checkedKeys.filter((k) => !keys.includes(k))
        : [...new Set([...checkedKeys, ...keys])];
      onCheck(next);
    };

    return (
      <Box
        className={className}
        style={{
          boxShadow: tokens.shadows.md,
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[4],
          ...style,
        }}
      >
        {/* Search */}
        {searchable && (
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            style={{
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
        )}

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: tokens.spacing[4],
        }}>
          {Object.entries(grouped).map(([category, categoryItems]) => {
            const allChecked = categoryItems.every((i) => checkedKeys.includes(i.key));
            const someChecked = categoryItems.some((i) => checkedKeys.includes(i.key));

            return (
              <div key={category} style={{
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                borderRadius: tokens.borderRadius.lg,
                overflow: 'hidden',
              }}>
                {/* Category header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                  backgroundColor: tokens.colors.neutral[50],
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}>
                  {onCheck && (
                    <input
                      type="checkbox"
                      checked={allChecked}
                      ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
                      onChange={() => handleToggleCategory(categoryItems)}
                      disabled={disabled}
                      style={{ accentColor: tokens.colors.primaryScale[600], cursor: disabled ? 'not-allowed' : 'pointer' }}
                    />
                  )}
                  <span style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
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
                {categoryItems.map((item) => {
                  const isChecked = checkedKeys.includes(item.key);
                  const isGranted = grantedKeys?.includes(item.key);

                  return (
                    <div
                      key={item.key}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
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
                          <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>
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
        </div>
      </Box>
    );
  },
});
