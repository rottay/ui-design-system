import React from 'react';
import type { ColumnDef } from '../../../../../../../../foundation/contracts/runtime/components/patterns/core';
import type { SurfaceCapabilityRegistration } from '../../../../../../foundation/contracts';
import {
  isAllSurfaceAccess,
  resolveSurfaceCapabilityRegistry,
} from '../../../../../../runtime/helpers';
import { SurfaceErrorState } from '../../../../../../../structures/feedback/surface-lifecycle';
import { SurfaceCapabilityAnatomy } from '../../../../../../../structures/feedback/capability-anatomy';
import { useSurfaceTranslations } from '../../../../../../../structures/foundation/chrome/runtime/i18n';
import { Box } from '../../../../../../../primitives/layout/box';
import type { CollectionRenderDispatchProps } from '..';
import { getColumnCapabilityId, getColumnHeader } from '../foundation';

export function CollectionErrorAnatomy<T extends object>({
  access,
  actions,
  capabilityRegistry,
  columns,
  error,
  onRetry,
  viewMode,
}: Pick<
  CollectionRenderDispatchProps<T>,
  'access' | 'actions' | 'capabilityRegistry' | 'columns' | 'error' | 'onRetry' | 'viewMode'
>): React.ReactElement {
  const { tSurfaceOr } = useSurfaceTranslations();
  const registeredColumns = isAllSurfaceAccess(access)
    ? columns
    : columns.filter((column) => column.visible !== false);
  const explicitRegistry = capabilityRegistry ?? [];
  const hasExplicitRowActions = explicitRegistry.some(
    (capability) => capability.kind === 'action'
  );
  const registrations: SurfaceCapabilityRegistration[] = [
    ...explicitRegistry,
    ...registeredColumns.map((column) => ({
      kind: 'column' as const,
      id: getColumnCapabilityId(column),
      label: getColumnHeader(column as ColumnDef<unknown>),
    })),
    ...(actions && !hasExplicitRowActions
      ? [{
          kind: 'action' as const,
          id: 'row-actions',
          label: tSurfaceOr('collection_workspace.row_actions', 'Row actions'),
        }]
      : []),
  ];
  const capabilities = resolveSurfaceCapabilityRegistry(registrations, access);

  return (
    <Box
      className="ds-surface ds-collection-render-dispatch"
      data-part="root"
      data-view-mode={viewMode}
      data-state="error"
      data-capability-count={capabilities.length}
      padding="lg"
    >
      {/* Only the element branch needs the wrapper's announcement: the kit
          announces via the Alert's role="alert", and nesting live regions double-reads. */}
      <Box
        data-part="error-state"
        aria-live={React.isValidElement(error) ? 'polite' : undefined}
      >
        {React.isValidElement(error) ? (
          error
        ) : (
          <SurfaceErrorState error={error} onRetry={onRetry} />
        )}
      </Box>

      <SurfaceCapabilityAnatomy
        capabilities={capabilities}
        ariaLabel={tSurfaceOr('states.capability_aria', 'Registered surface capabilities')}
      />
    </Box>
  );
}
