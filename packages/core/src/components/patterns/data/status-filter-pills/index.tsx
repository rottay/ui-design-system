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
type StatusFilterPillIcon = ComponentType<any>;

import { Button } from '../../../primitives/inputs/button';
import { Box } from '../../../primitives/layout/box';
import { Flex } from '../../../primitives/layout/flex';
import { Text } from '../../../primitives/display/typography/compound/text';

export interface StatusFilterPillOption {
  value: string;
  label: string;
  count?: number;
  icon?: StatusFilterPillIcon;
}

/**
 * Backwards-compatible alias for the original `FilterPill` type name from
 * the Rottay-app extraction. New consumers should prefer the explicit
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
  const gap = size === 'sm' ? 6 : 8;

  return (
    <Flex
      data-part="root"
      className="ds-pattern-status-filter-pills"
      data-size={size}
      align="center"
      gap={gap}
    >
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value);
        const Icon = option.icon;

        // Only the Modern Button honors chrome="none": a frozen engine's skin would outrank the pill paint
        // and wash its label out, so the pill pins it under every engine.
        return (
          <Button
            key={option.value}
            engine="modern"
            chrome="none"
            shape="round"
            size={size}
            className="ds-status-filter-pills__pill"
            data-selected={isSelected}
            aria-pressed={isSelected}
            onClick={() => onChange(option.value)}
            icon={
              Icon ? (
                // The pill owns the icon slot, so the anatomy renders whatever the option's
                // icon component renders. The label names the option: the glyph is decorative.
                <span
                  data-part="pill-icon"
                  className="ds-status-filter-pills__pill-icon"
                  data-selected={isSelected}
                  aria-hidden="true"
                >
                  <Icon data-selected={isSelected} />
                </span>
              ) : undefined
            }
            suffix={
              showCounts && option.count !== undefined ? (
                <Box
                  data-part="count-badge"
                  className="ds-status-filter-pills__count-badge"
                  data-selected={isSelected}
                >
                  <Text
                    data-part="count-badge-text"
                    className="ds-status-filter-pills__count-badge-text"
                    data-selected={isSelected}
                    size="sm"
                  >
                    {option.count}
                  </Text>
                </Box>
              ) : undefined
            }
          >
            <Text
              data-part="pill-label"
              className="ds-status-filter-pills__pill-label"
              data-selected={isSelected}
              size="sm"
            >
              {option.label}
            </Text>
          </Button>
        );
      })}
    </Flex>
  );
}
