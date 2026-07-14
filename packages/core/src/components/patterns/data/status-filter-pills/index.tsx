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
import {
  FILTER_PILL_ACTIVE_BG,
  FILTER_PILL_ACTIVE_BORDER,
  FILTER_PILL_ACTIVE_COLOR,
  FILTER_PILL_ACTIVE_SHADOW,
  FILTER_PILL_BG,
  FILTER_PILL_BORDER,
  FILTER_PILL_COLOR,
  FILTER_PILL_COUNT_ACTIVE_BG,
  FILTER_PILL_COUNT_ACTIVE_BORDER,
  FILTER_PILL_COUNT_ACTIVE_RING,
  FILTER_PILL_COUNT_BG,
  FILTER_PILL_COUNT_BORDER,
  FILTER_PILL_COUNT_RING,
  FILTER_PILL_FOCUS_RING,
  FILTER_PILL_HOVER_BG,
  FILTER_PILL_HOVER_BORDER,
  FILTER_PILL_SHADOW,
  TRANSITION,
} from '../list-toolbar/tokens';

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
    <Flex data-part="root" className="ds-pattern-status-filter-pills" align="center" gap={gap} style={{ flexWrap: 'wrap' }}>
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value);
        const Icon = option.icon;

        return (
          <Box
            key={option.value}
            as="button"
            data-part="pill"
            data-selected={isSelected}
            onClick={() => onChange(option.value)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding,
              borderRadius: 9999,
              border: `1px solid ${isSelected ? FILTER_PILL_ACTIVE_BORDER : FILTER_PILL_BORDER}`,
              background: isSelected ? FILTER_PILL_ACTIVE_BG : FILTER_PILL_BG,
              color: isSelected ? FILTER_PILL_ACTIVE_COLOR : FILTER_PILL_COLOR,
              cursor: 'pointer',
              transition: `background ${TRANSITION}, border-color ${TRANSITION}, color ${TRANSITION}, box-shadow ${TRANSITION}`,
              outline: 'none',
              boxShadow: isSelected ? FILTER_PILL_ACTIVE_SHADOW : FILTER_PILL_SHADOW,
              backdropFilter: 'blur(6px)',
            }}
            onMouseEnter={(event) => {
              if (!isSelected) {
                event.currentTarget.style.background = FILTER_PILL_HOVER_BG;
                event.currentTarget.style.borderColor = FILTER_PILL_HOVER_BORDER;
              }
            }}
            onMouseLeave={(event) => {
              if (!isSelected) {
                event.currentTarget.style.background = FILTER_PILL_BG;
                event.currentTarget.style.borderColor = FILTER_PILL_BORDER;
              }
            }}
            onFocus={(event) => {
              event.currentTarget.style.boxShadow = FILTER_PILL_FOCUS_RING;
            }}
            onBlur={(event) => {
              event.currentTarget.style.boxShadow = isSelected ? FILTER_PILL_ACTIVE_SHADOW : FILTER_PILL_SHADOW;
            }}
          >
            {Icon && (
              <Icon
                data-part="pill-icon"
                data-selected={isSelected}
                style={{
                  width: size === 'sm' ? 12 : 14,
                  height: size === 'sm' ? 12 : 14,
                  color: isSelected
                    ? FILTER_PILL_ACTIVE_COLOR
                    : FILTER_PILL_COLOR,
                }}
              />
            )}
            <Text
              data-part="pill-label"
              data-selected={isSelected}
              size="sm"
              style={{
                fontSize,
                fontWeight: isSelected ? 500 : 400,
                color: isSelected ? FILTER_PILL_ACTIVE_COLOR : FILTER_PILL_COLOR,
              }}
            >
              {option.label}
            </Text>
            {showCounts && option.count !== undefined && (
              <Box
                data-part="count-badge"
                data-selected={isSelected}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: size === 'sm' ? 18 : 20,
                  height: size === 'sm' ? 18 : 20,
                  padding: '0 6px',
                  borderRadius: 999,
                  background: isSelected ? FILTER_PILL_COUNT_ACTIVE_BG : FILTER_PILL_COUNT_BG,
                  border: `1px solid ${isSelected ? FILTER_PILL_COUNT_ACTIVE_BORDER : FILTER_PILL_COUNT_BORDER}`,
                  boxShadow: isSelected ? FILTER_PILL_COUNT_ACTIVE_RING : FILTER_PILL_COUNT_RING,
                }}
              >
                <Text
                  data-part="count-badge-text"
                  data-selected={isSelected}
                  size="sm"
                  style={{
                    fontSize: fontSize - 1,
                    fontFamily: 'var(--ds-font-family-mono, monospace)',
                    color: isSelected
                      ? FILTER_PILL_ACTIVE_COLOR
                      : FILTER_PILL_COLOR,
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
