'use client';

/**
 * @fileoverview RecordActionBar — the action rail that closes a record page.
 *
 * Takes an optional `meta` slot on the left and either a free-form `actions`
 * ReactNode or a structured `actionItems[]` array built on the shared
 * `SharedHeaderActionDescriptor` shape, so a record page and a page header
 * describe an action the same way.
 *
 * OWNED COPY rides the optional `components` i18n channel with an English floor
 * (`record.actionRail`).
 *
 * INLINE BOUNDARY: action-bar icons take the Button's governed icon channel
 * (`--ds-button-sm-icon-size`) rather than an inline 14px override, so tenant
 * icon sizing reaches the rail. The only inline value is the consumer's `style`
 * passthrough.
 *
 * @see `../index.ts` for the record family narrative and the pre-Checkpoint-D
 * `Surface*` compatibility aliases.
 */

import { type CSSProperties, type ReactNode } from 'react';

import { Box } from '../../../primitives/layout/box';
import { Button } from '../../../primitives/inputs/button';
import { Flex } from '../../../primitives/layout/flex';
import { Stack } from '../../../primitives/layout/stack';
import { Text } from '../../../primitives/display/typography/compound/text';
import { Tooltip } from '../../../primitives/display/tooltip';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import {
  type SharedHeaderActionDescriptor,
  resolveSharedHeaderActionIcon,
  resolveSharedHeaderActionTooltip,
  resolveSharedHeaderActionVariant,
} from '../../../patterns/foundation/header-actions';

/** Hook-local `tOr`: catalogue value with an English floor, never a raw key. */
function useRecordTranslation() {
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, floor: string, params?: Record<string, string | number>): string =>
    i18n?.tOr(key, floor, params) ?? floor;
  return { tOr };
}

export interface RecordActionItem extends SharedHeaderActionDescriptor {
  htmlType?: 'button' | 'submit' | 'reset';
}

export function RecordActionBar({
  meta,
  actions,
  actionItems,
  style,
}: {
  meta?: ReactNode;
  actions?: ReactNode;
  actionItems?: RecordActionItem[];
  style?: CSSProperties;
}) {
  const { tOr } = useRecordTranslation();
  const resolvedActionItems = actionItems?.filter(Boolean) || [];
  const renderedActions =
    resolvedActionItems.length > 0
      ? resolvedActionItems.map((action, index) => {
          const ActionIcon = resolveSharedHeaderActionIcon(action);

          return (
            <Tooltip key={`${action.label}-${index}`} content={resolveSharedHeaderActionTooltip(action)}>
              <Button
                variant={resolveSharedHeaderActionVariant(action)}
                size="sm"
                htmlType={action.htmlType}
                /* Icon geometry rides the Button's governed icon channel
                   (`--ds-button-sm-icon-size`), not an inline override. */
                icon={ActionIcon ? <ActionIcon /> : undefined}
                onClick={action.onClick}
                href={action.href}
                loading={action.loading}
                disabled={action.disabled}
              >
                {action.label}
              </Button>
            </Tooltip>
          );
        })
      : actions;

  return (
    <Flex
      className="ds-structure ds-record"
      data-part="action-bar"
      data-structure="record"
      justify="between"
      align="end"
      gap={16}
      wrap="wrap"
      style={style}
    >
      <Box data-part="action-bar-meta">
        {typeof meta === 'string' ? (
          <Stack spacing={4}>
            <Text
              data-part="action-bar-meta-label"
              size="xs"
              weight="bold"
            >
              {tOr('record.actionRail', 'Action rail')}
            </Text>
            <Text data-part="action-bar-meta-text" size="sm">
              {meta}
            </Text>
          </Stack>
        ) : (
          meta
        )}
      </Box>
      <Flex data-part="action-bar-actions" gap={12} wrap="wrap">
        {renderedActions}
      </Flex>
    </Flex>
  );
}
