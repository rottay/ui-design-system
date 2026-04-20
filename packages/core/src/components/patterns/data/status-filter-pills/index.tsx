'use client';

/**
 * @fileoverview StatusFilterPills pattern -- horizontal pill bar for
 * single- or multi-select status filtering.
 *
 * @description
 * Generic, engine-free pattern that renders a row of segmented filter pills.
 * Each pill carries a label, optional icon, and optional count. The pattern
 * stays domain-agnostic: it knows nothing about tenants, users, or any
 * specific entity. Consumers wire option labels and selected values from
 * their own state container.
 */

import type { ComponentType } from 'react';
type LucideIcon = ComponentType<any>;

import { Box, Flex, Text } from '../../../primitives';

export interface StatusFilterPillOption {
  value: string;
  label: string;
  count?: number;
  icon?: LucideIcon;
}

/**
 * Backwards-compatible alias for the original `FilterPill` type name from
 * the app-platform extraction. New consumers should prefer the explicit
 * `StatusFilterPillOption` name.
 */
export type FilterPill = StatusFilterPillOption;

export interface StatusFilterPillsProps {
  /** Available filter options */
  options: StatusFilterPillOption[];
  /** Currently selected value(s) */
  value: string | string[];
  /** Selection change handler */
  onChange: (value: string) => void;
  /** Whether to show counts */
  showCounts?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
}

export function StatusFilterPills({
  options,
  value,
  onChange,
  showCounts = false,
  size = 'md',
}: StatusFilterPillsProps) {
  const selectedValues = Array.isArray(value) ? value : [value];

  const padding = size === 'sm' ? '4px 10px' : '6px 14px';
  const fontSize = size === 'sm' ? 12 : 13;
  const gap = size === 'sm' ? 6 : 8;

  return (
    <Flex align="center" gap={gap} style={{ flexWrap: 'wrap' }}>
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value);
        const Icon = option.icon;

        return (
          <Box
            key={option.value}
            as="button"
            onClick={() => onChange(option.value)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding,
              borderRadius: 9999,
              border: isSelected
                ? '1px solid color-mix(in srgb, var(--ds-color-primary) 60%, var(--ds-color-border))'
                : '1px solid color-mix(in srgb, var(--ds-color-border) 88%, transparent)',
              background: isSelected
                ? 'color-mix(in srgb, var(--ds-color-primary) 14%, var(--ds-surface-card))'
                : 'color-mix(in srgb, var(--ds-surface-card) 86%, transparent)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              outline: 'none',
              boxShadow: isSelected ? 'var(--ds-elevation-1)' : 'none',
              backdropFilter: 'blur(6px)',
            }}
          >
            {Icon && (
              <Icon
                style={{
                  width: size === 'sm' ? 12 : 14,
                  height: size === 'sm' ? 12 : 14,
                  color: isSelected
                    ? 'var(--ds-color-primary)'
                    : 'var(--ds-color-text-muted)',
                }}
              />
            )}
            <Text
              size="sm"
              style={{
                fontSize,
                fontWeight: isSelected ? 500 : 400,
                color: isSelected
                  ? 'var(--ds-color-primary)'
                  : 'var(--ds-color-text-primary)',
              }}
            >
              {option.label}
            </Text>
            {showCounts && option.count !== undefined && (
              <Box
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: size === 'sm' ? 18 : 20,
                  height: size === 'sm' ? 18 : 20,
                  padding: '0 6px',
                  borderRadius: 999,
                  background: isSelected
                    ? 'color-mix(in srgb, var(--ds-color-primary) 18%, transparent)'
                    : 'color-mix(in srgb, var(--ds-color-text-primary) 6%, transparent)',
                }}
              >
                <Text
                  size="sm"
                  style={{
                    fontSize: fontSize - 1,
                    fontFamily: 'monospace',
                    color: isSelected
                      ? 'var(--ds-color-primary)'
                      : 'var(--ds-color-text-muted)',
                  }}
                >
                  {option.count}
                </Text>
              </Box>
            )}
          </Box>
        );
      })}
    </Flex>
  );
}
