'use client';

/**
 * @fileoverview BulkSelectToggle pattern -- toggle button for entering or
 * exiting bulk-selection mode in tables and lists.
 *
 * @description
 * Generic, engine-free pattern that pairs a primary/ghost button with an
 * optional selection-count Badge. The pattern stays domain-agnostic: it
 * never references rows, items, or any specific entity. Consumers wire
 * the active state and selected-count from their own state container.
 */

import {
  CheckSquareIcon,
  XIcon,
} from '../../../../graphics/icons';

import { Badge, Button, Flex, Text } from '../../../primitives';

export interface BulkSelectToggleProps {
  /** Whether bulk selection mode is active */
  active: boolean;
  /** Toggle handler */
  onToggle: () => void;
  /** Number of selected items */
  selectedCount?: number;
  /** Size variant */
  size?: 'sm' | 'md';
}

export function BulkSelectToggle({
  active,
  onToggle,
  selectedCount = 0,
  size = 'sm',
}: BulkSelectToggleProps) {
  return (
    <Flex
      className="ds-pattern-bulk-select-toggle"
      data-part="root"
      data-active={active ? 'true' : 'false'}
      data-has-selection={selectedCount > 0 ? 'true' : 'false'}
      align="center"
      gap={8}
    >
      <Button
        className="ds-bulk-select-toggle__trigger"
        variant={active ? 'primary' : 'ghost'}
        size={size}
        onClick={onToggle}
        style={{
          gap: 6,
        }}
      >
        {active ? (
          <XIcon
            data-part="icon"
            style={{
              width: 14,
              height: 14,
            }}
          />
        ) : (
          <CheckSquareIcon data-part="icon" style={{ width: 14, height: 14 }} />
        )}
        <Text data-part="label" size="sm">{active ? 'Done' : 'Select'}</Text>
      </Button>

      {active && selectedCount > 0 && (
        <Badge
          className="ds-bulk-select-toggle__count"
          variant="primary"
          style={{
            fontFamily: 'monospace',
            fontSize: 12,
          }}
        >
          {selectedCount} selected
        </Badge>
      )}
    </Flex>
  );
}
