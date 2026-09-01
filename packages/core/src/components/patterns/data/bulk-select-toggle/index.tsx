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

import { Badge } from '../../../primitives/display/badge';
import { Button } from '../../../primitives/inputs/button';
import { Flex } from '../../../primitives/layout/flex';
import { Text } from '../../../primitives/display/typography/compound/text';
import { VisuallyHidden } from '../../../primitives/foundation/visually-hidden';
import { useOptionalTranslation } from '../../../../infrastructure/runtime/i18n';

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
  /* Localized chrome (components catalog, English floor): the three labels
     below resolve through `bulkSelectToggle.*` when the coordinator lands the
     keys, and render byte-identical English until then. */
  const translation = useOptionalTranslation('components');
  const selectLabel = translation?.tOr('bulkSelectToggle.select', 'Select') ?? 'Select';
  const doneLabel = translation?.tOr('bulkSelectToggle.done', 'Done') ?? 'Done';
  const selectedLabel = translation?.tOr('bulkSelectToggle.selected', 'selected') ?? 'selected';

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
        aria-pressed={active}
      >
        {active ? (
          <XIcon data-part="icon" />
        ) : (
          <CheckSquareIcon data-part="icon" />
        )}
        {/* The button owns the foreground for its variant; a Text that paints
            its own color lands near-invisible on the active/primary fill. */}
        <Text data-part="label" size="sm" color="inherit">{active ? doneLabel : selectLabel}</Text>
      </Button>

      {active && selectedCount > 0 && (
        <Badge
          className="ds-bulk-select-toggle__count"
          variant="primary"
          aria-hidden="true"
        >
          {selectedCount} {selectedLabel}
        </Badge>
      )}

      {/* The Badge is the sighted read-out only; a polite region has to be
          mounted BEFORE its text changes for AT to report a new count. */}
      <VisuallyHidden data-part="count-live" role="status">
        {active && selectedCount > 0 ? `${selectedCount} ${selectedLabel}` : ''}
      </VisuallyHidden>
    </Flex>
  );
}
