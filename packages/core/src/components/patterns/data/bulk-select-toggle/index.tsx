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

import { MousePointerSquareDashed, X } from 'lucide-react';

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
    <Flex align="center" gap={8}>
      <Button
        variant={active ? 'primary' : 'ghost'}
        size={size}
        onClick={onToggle}
        style={{
          gap: 6,
          transition: 'all 0.2s ease',
          ...(active && {
            boxShadow: '0 0 0 2px var(--ds-color-primary-200)',
          }),
        }}
      >
        {active ? (
          <X
            style={{
              width: 14,
              height: 14,
              animation: 'slideInCheckbox 0.2s ease-out',
            }}
          />
        ) : (
          <MousePointerSquareDashed style={{ width: 14, height: 14 }} />
        )}
        <Text size="sm">{active ? 'Done' : 'Select'}</Text>
      </Button>

      {active && selectedCount > 0 && (
        <Badge
          variant="primary"
          style={{
            animation: 'slideInCheckbox 0.2s ease-out',
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
