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

import type { ComponentProps, ComponentType, ReactNode } from 'react';
type StatusFilterPillIcon = ComponentType<any>;

import { partAttributes, useInteractionState } from '@/foundation/behavior';
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

/**
 * The pill is a STATEFUL PART: one place decides when it is hovered, pressed
 * or focus-visible (the shared interaction kernel), and the skin pairs every
 * platform pseudo-class with the kernel token it stands for. At rest the
 * kernel serializes nothing, so `[data-state]` never matches a resting pill
 * and the pseudo-class stays the fallback of one decision rather than a
 * second authority (F-37).
 */
function Pill({
  children,
  ...rest
}: ComponentProps<typeof Box> & { children?: ReactNode }) {
  const interaction = useInteractionState();
  return (
    <Box
      as="button"
      type="button"
      {...rest}
      {...interaction.handlers}
      {...partAttributes('pill', interaction.state)}
    >
      {children}
    </Box>
  );
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

        return (
          <Pill
            key={option.value}
            className="ds-status-filter-pills__pill"
            data-selected={isSelected}
            data-size={size}
            /* Toggle semantics: the pressed state is announced, never painted
               alone (border + ink + weight + checkmark-free ring carry it). */
            aria-pressed={isSelected}
            onClick={() => onChange(option.value)}
          >
            {Icon && (
              <Icon
                data-part="pill-icon"
                className="ds-status-filter-pills__pill-icon"
                data-selected={isSelected}
              />
            )}
            <Text
              data-part="pill-label"
              className="ds-status-filter-pills__pill-label"
              data-selected={isSelected}
              size="sm"
            >
              {option.label}
            </Text>
            {showCounts && option.count !== undefined && (
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
            )}
          </Pill>
        );
      })}
    </Flex>
  );
}
