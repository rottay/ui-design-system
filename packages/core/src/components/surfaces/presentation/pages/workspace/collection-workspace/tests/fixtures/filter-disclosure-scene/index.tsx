/**
 * Real-Chromium scene for the collection workspace's tablet filter disclosure.
 *
 * Bundled by esbuild and loaded with `--dump-dom` by
 * `CollectionWorkspace.filter-disclosure.browser-geometry.integration.test.ts`;
 * no simulated DOM produces any number here. The page declares the layout on
 * `<html data-probe-layout>` (`premium` with a header, `plain` without), the
 * window size the runner passes picks the posture. The scene opens the filter disclosure through its
 * trigger, measures in-page and parks the result on `data-probe-result`.
 */
import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { CollectionWorkspaceSurface } from '@/components/surfaces/presentation/pages/workspace/collection-workspace';

/** The row spacing rule the skin declares for the disclosure's action row. */
export const ACTIONS_SELECTOR =
  '.ds-collection-workspace__filter-dropdown-content[data-part="filter-dropdown-content"] > .ds-collection-workspace__filter-dropdown-actions[data-part="filter-dropdown-actions"]';
/** The ancestor-scoped selector the row's spacing used to hang on. */
export const ROOT_SCOPED_ACTIONS_SELECTOR =
  '.ds-surface.ds-collection-workspace .ds-collection-workspace__filter-dropdown-actions[data-part="filter-dropdown-actions"]';

export interface DisclosureProbeResult {
  layout: string;
  viewportWidth: number;
  opened: boolean;
  /** The surface painted (the skin and its tokens loaded), so a 0 gap is a real 0. */
  surfaceBackground: string | null;
  /** Vertical distance from the last field control to the action row, in px. */
  controlToActionsGap: number | null;
  /** Vertical distance from the filter panel to the action row, in px. */
  panelToActionsGap: number | null;
  actionsMarginBlockStart: string | null;
  /** The action row sits under the workspace root (the old rule's scope). */
  actionsUnderWorkspaceRoot: boolean | null;
  matchesActionsSelector: boolean | null;
  matchesRootScopedSelector: boolean | null;
  /** Document-wide census of each selector at measurement time. */
  censusActionsSelector: number;
  censusRootScopedSelector: number;
  /** The 1rem spacing token resolved on the document, in px. */
  spacingMdPx: number;
}

const LAYOUT =
  typeof document !== 'undefined' && document.documentElement.dataset.probeLayout === 'plain'
    ? 'plain'
    : 'premium';

const ROWS = [
  { id: 'r-1', name: 'Alpha workspace', status: 'active' },
  { id: 'r-2', name: 'Beta workspace', status: 'paused' },
];

function Scene() {
  return (
    <DesignSystemProvider
      tenantConfig={{
        slug: 'probe',
        name: 'Probe',
        theme: 'light',
        plan: 'enterprise',
        features: ['all'],
        branding: { companyName: 'Probe' },
      }}
      productProfile="generic.default"
      forceEngine="modern"
      skipCssLoading
    >
      <Suspense fallback={null}>
        <CollectionWorkspaceSurface
          title="Filtered collection"
          {...(LAYOUT === 'premium'
            ? { header: { eyebrow: 'Workspace', title: 'Filtered collection', subtitle: 'Probe' } }
            : {})}
          data={ROWS}
          columns={[{ key: 'name', header: 'Name', accessorKey: 'name' }] as never}
          rowKey="id"
          adaptive={{
            desktop: { filters: 'inline' },
            tablet: { filters: 'dropdown' },
            phone: { filters: 'sheet' },
          }}
          controls={{
            filters: [
              { key: 'query', label: 'Owner', type: 'text', placeholder: 'Search owner' },
              {
                key: 'status',
                label: 'Status',
                type: 'select',
                placeholder: 'All statuses',
                options: [
                  { value: 'active', label: 'Active' },
                  { value: 'paused', label: 'Paused' },
                ],
              },
            ],
            onFilterChange: () => {},
          }}
        />
      </Suspense>
    </DesignSystemProvider>
  );
}

function measure(): DisclosureProbeResult {
  const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
  const actions = document.querySelector<HTMLElement>('[data-part="filter-dropdown-actions"]');
  const panel = actions?.previousElementSibling as HTMLElement | null | undefined;
  const controls = dialog
    ? Array.from(dialog.querySelectorAll<HTMLElement>('input, select, [role="combobox"]')).filter(
        (control) => !actions?.contains(control),
      )
    : [];
  const lastControl = controls[controls.length - 1] ?? null;
  const probe = document.createElement('div');
  probe.style.blockSize = 'var(--ds-spacing-md)';
  document.body.append(probe);
  const spacingMdPx = probe.getBoundingClientRect().height;
  probe.remove();
  return {
    layout: LAYOUT,
    viewportWidth: window.innerWidth,
    opened: Boolean(dialog),
    surfaceBackground: dialog ? getComputedStyle(dialog).backgroundColor : null,
    controlToActionsGap:
      actions && lastControl
        ? actions.getBoundingClientRect().top - lastControl.getBoundingClientRect().bottom
        : null,
    panelToActionsGap:
      actions && panel ? actions.getBoundingClientRect().top - panel.getBoundingClientRect().bottom : null,
    actionsMarginBlockStart: actions ? getComputedStyle(actions).marginBlockStart : null,
    actionsUnderWorkspaceRoot: actions ? Boolean(actions.closest('.ds-surface.ds-collection-workspace')) : null,
    matchesActionsSelector: actions ? actions.matches(ACTIONS_SELECTOR) : null,
    matchesRootScopedSelector: actions ? actions.matches(ROOT_SCOPED_ACTIONS_SELECTOR) : null,
    censusActionsSelector: document.querySelectorAll(ACTIONS_SELECTOR).length,
    censusRootScopedSelector: document.querySelectorAll(ROOT_SCOPED_ACTIONS_SELECTOR).length,
    spacingMdPx,
  };
}

if (typeof document !== 'undefined') {
  const host = document.getElementById('root');
  if (host) createRoot(host).render(<Scene />);
  window.setTimeout(() => {
    document.querySelector<HTMLElement>('button[aria-haspopup="dialog"]')?.click();
    window.setTimeout(() => {
      document.documentElement.setAttribute('data-probe-result', JSON.stringify(measure()));
    }, 1200);
  }, 1500);
}
