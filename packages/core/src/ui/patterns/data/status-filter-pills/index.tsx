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
import { PATTERN_TRANSITION } from '../../foundation/motion';

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
            className="ds-status-filter-pills__pill"
            data-selected={isSelected}
            onClick={() => onChange(option.value)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding,
              cursor: 'pointer',
              transition: `background ${PATTERN_TRANSITION}, border-color ${PATTERN_TRANSITION}, color ${PATTERN_TRANSITION}, box-shadow ${PATTERN_TRANSITION}`,
            }}
          >
            {Icon && (
              <Icon
                data-part="pill-icon"
                className="ds-status-filter-pills__pill-icon"
                data-selected={isSelected}
                style={{
                  width: size === 'sm' ? 12 : 14,
                  height: size === 'sm' ? 12 : 14,
                }}
              />
            )}
            <Text
              data-part="pill-label"
              className="ds-status-filter-pills__pill-label"
              data-selected={isSelected}
              size="sm"
              style={{
                fontSize,
                fontWeight: isSelected ? 500 : 400,
              }}
            >
              {option.label}
            </Text>
            {showCounts && option.count !== undefined && (
              <Box
                data-part="count-badge"
                className="ds-status-filter-pills__count-badge"
                data-selected={isSelected}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: size === 'sm' ? 18 : 20,
                  height: size === 'sm' ? 18 : 20,
                  padding: '0 6px',
                }}
              >
                <Text
                  data-part="count-badge-text"
                  className="ds-status-filter-pills__count-badge-text"
                  data-selected={isSelected}
                  size="sm"
                  style={{
                    fontSize: fontSize - 1,
                    fontFamily: 'var(--ds-font-family-mono, monospace)',
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
