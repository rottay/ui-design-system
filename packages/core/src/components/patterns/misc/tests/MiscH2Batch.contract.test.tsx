import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';

import { PatternFileManager } from '../file-manager';
import { PatternUserProfileCard } from '../user-profile-card';
import { PatternPricingTable } from '../pricing-table';
import { PatternEmptyState } from '../empty-state';
import { TokenInspector } from '../token-inspector';
import { renderWithEngine } from '../../../../_internal/testing/helpers/engine-test-utils';

// ---------------------------------------------------------------------------
// WO-SKIN-06 checkpoint CK-H2 -- category-A patterns/misc anatomy contract.
//
// The inert pre-step adds scope classes, data-part, and bounded state
// attributes to the 9 H2 engine files without moving paint. These tests prove
// the stamps reach the rendered DOM under modern and rustic, including every
// loading root and every selector-bearing enum/boolean branch. TokenInspector
// is createElement-only, so its test exercises the actual rendered call tree;
// a JSX-only source probe would provide no evidence for that file.
// ---------------------------------------------------------------------------

const ENGINES = ['modern', 'rustic'] as const;

const FILES = [
  { id: 'image', name: 'photo.jpg', type: 'file' as const, mimeType: 'image/jpeg', size: 1_024 },
  { id: 'pdf', name: 'report.pdf', type: 'file' as const, mimeType: 'application/pdf', size: 2_048 },
  { id: 'text', name: 'notes.txt', type: 'file' as const, mimeType: 'text/plain', size: 512 },
  { id: 'other', name: 'archive.bin', type: 'file' as const, mimeType: 'application/octet-stream', size: 4_096 },
];

const FOLDERS = [
  { id: 'folder', name: 'Documents', type: 'folder' as const, childCount: 4 },
];

const SELECTED = ['folder', 'pdf'];

const PROFILES = [
  { name: 'Active User', role: 'Lead', email: 'active@example.test', department: 'Platform', status: 'active' as const },
  { name: 'Away User', role: 'Designer', email: 'away@example.test', department: 'Design', status: 'away' as const },
  { name: 'Busy User', role: 'Engineer', email: 'busy@example.test', department: 'Security', status: 'busy' as const },
  { name: 'Offline User', role: 'Manager', email: 'offline@example.test', department: 'Support', status: 'offline' as const },
];

const ACTIONS = [
  { key: 'primary', label: 'Primary', variant: 'primary' as const, onClick: () => undefined },
  { key: 'default', label: 'Default', onClick: () => undefined },
  { key: 'danger', label: 'Danger', variant: 'danger' as const, disabled: true, onClick: () => undefined },
];

const PLANS = [
  {
    id: 'plain',
    name: 'Plain',
    price: 10,
    description: 'Plain plan',
    priceNote: 'per month',
    cta: 'Choose Plain',
    popular: false,
    features: { storage: '5 GB', automation: false, support: true },
  },
  {
    id: 'highlighted',
    name: 'Highlighted',
    price: 50,
    description: 'Highlighted plan',
    priceNote: 'per month',
    cta: 'Choose Highlighted',
    popular: true,
    features: { storage: 'Unlimited', automation: true, support: false },
  },
];

const FEATURES = [
  { key: 'storage', label: 'Storage', description: 'Storage quota', category: 'Capacity' },
  { key: 'automation', label: 'Automation', category: 'Operations' },
  { key: 'support', label: 'Support', category: 'Operations' },
];

const q = (container: HTMLElement, selector: string) => container.querySelectorAll(selector);

async function waitForSelector(container: HTMLElement, selector: string): Promise<HTMLElement> {
  await waitFor(() => expect(container.querySelector(selector)).not.toBeNull());
  return container.querySelector(selector) as HTMLElement;
}

function expectEngineScope(root: HTMLElement, component: string, engine: 'modern' | 'rustic'): void {
  expect(root.classList.contains(`ds-pattern-${component}`)).toBe(true);
  expect(root.classList.contains(`ds-engine-${engine}`)).toBe(true);
}

describe('file-manager -- data-part contract (CK-H2)', () => {
  it.each(ENGINES)('pins list anatomy, selection and all file-kind branches (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternFileManager
        files={FILES}
        folders={FOLDERS}
        currentPath={['Workspace', 'Documents']}
        viewMode="list"
        selectedItems={SELECTED}
        onUpload={() => undefined}
        onDelete={() => undefined}
        onRename={() => undefined}
        onNavigate={() => undefined}
        onSelectionChange={() => undefined}
        onViewModeChange={() => undefined}
      />,
      engine,
    );

    const root = await waitForSelector(container, '[data-part="root"][data-loading="false"][data-view-mode="list"]');
    expectEngineScope(root, 'file-manager', engine);
    for (const part of ['toolbar', 'breadcrumb', 'breadcrumb-link', 'breadcrumb-current', 'view-toggle', 'file-input', 'content', 'row', 'checkbox', 'folder-icon', 'file-icon', 'folder-link', 'file-name', 'item-action']) {
      expect(q(container, `[data-part="${part}"]`).length, `${engine}: ${part}`).toBeGreaterThanOrEqual(1);
    }

    expect(q(container, '[data-part="row"]')).toHaveLength(5);
    expect(q(container, '[data-part="row"][data-selected="true"]')).toHaveLength(2);
    expect(q(container, '[data-part="row"][data-selected="false"]')).toHaveLength(3);
    for (const kind of ['folder', 'image', 'pdf', 'text', 'other']) {
      expect(q(container, `[data-part="row"][data-file-kind="${kind}"]`)).toHaveLength(1);
    }
    for (const kind of ['image', 'pdf', 'text', 'other']) {
      expect(q(container, `[data-part="file-icon"][data-file-kind="${kind}"]`)).toHaveLength(1);
    }
    expect(q(container, '[data-part="toolbar-action"][data-action="delete-selected"]')).toHaveLength(1);
    expect(q(container, '[data-part="toolbar-action"][data-action="upload"]')).toHaveLength(1);
    expect(q(container, '[data-part="item-action"][data-action="rename"]')).toHaveLength(5);
    expect(q(container, '[data-part="item-action"][data-action="delete"]')).toHaveLength(5);

    if (engine === 'rustic') {
      expect(q(container, '[data-part="column-header"][data-selected="false"]')).toHaveLength(1);
      expect(q(container, '[data-part="file-size"]')).toHaveLength(5);
      expect(q(container, '[data-part="modified-at"]')).toHaveLength(5);
    }
  });

  it.each(ENGINES)('pins grid cards selected/unselected and every file-kind (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternFileManager
        files={FILES}
        folders={FOLDERS}
        viewMode="grid"
        selectedItems={SELECTED}
        onNavigate={() => undefined}
        onSelectionChange={() => undefined}
      />,
      engine,
    );

    const root = await waitForSelector(container, '[data-part="root"][data-loading="false"][data-view-mode="grid"]');
    expectEngineScope(root, 'file-manager', engine);
    expect(q(container, '[data-part="grid-card"]')).toHaveLength(5);
    expect(q(container, '[data-part="grid-card"][data-selected="true"]')).toHaveLength(2);
    expect(q(container, '[data-part="grid-card"][data-selected="false"]')).toHaveLength(3);
    for (const kind of ['folder', 'image', 'pdf', 'text', 'other']) {
      expect(q(container, `[data-part="grid-card"][data-file-kind="${kind}"]`)).toHaveLength(1);
    }
    expect(q(container, '[data-part="item-name"]')).toHaveLength(5);
  });

  it.each(ENGINES)('pins empty and loading roots (%s)', async (engine) => {
    const empty = renderWithEngine(<PatternFileManager files={[]} folders={[]} />, engine);
    const emptyRoot = await waitForSelector(empty.container, '[data-part="root"][data-loading="false"]');
    expectEngineScope(emptyRoot, 'file-manager', engine);
    expect(q(empty.container, '[data-part="empty"]')).toHaveLength(1);
    empty.unmount();

    const loading = renderWithEngine(<PatternFileManager files={[]} folders={[]} viewMode="grid" loading />, engine);
    const loadingRoot = await waitForSelector(loading.container, '[data-part="root"][data-loading="true"][data-view-mode="grid"]');
    expectEngineScope(loadingRoot, 'file-manager', engine);
    expect(q(loading.container, engine === 'modern' ? '[data-part="spinner"]' : '[data-part="loading-label"]')).toHaveLength(1);
  });
});

describe('user-profile-card -- data-part contract (CK-H2)', () => {
  it.each(ENGINES)('pins full status/action/online branches (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <div>
        {PROFILES.map((user, index) => (
          <PatternUserProfileCard
            key={user.name}
            user={user}
            variant="full"
            online={index % 2 === 0}
            actions={index === 0 ? ACTIONS : []}
          />
        ))}
      </div>,
      engine,
    );

    await waitFor(() => expect(q(container, '[data-part="root"][data-loading="false"][data-variant="full"]')).toHaveLength(4));
    for (const root of Array.from(q(container, '[data-part="root"]')) as HTMLElement[]) {
      expectEngineScope(root, 'user-profile-card', engine);
    }
    for (const part of ['avatar-container', 'avatar', 'presence-dot', 'name', 'role', 'department-badge', 'email', 'status-badge']) {
      expect(q(container, `[data-part="${part}"]`).length, `${engine}: ${part}`).toBeGreaterThanOrEqual(4);
    }
    // Modern wraps fallback initials in their own painted child; rustic paints
    // the raw initial directly on the avatar element.
    expect(q(container, '[data-part="avatar-fallback"]')).toHaveLength(engine === 'modern' ? 4 : 0);
    expect(q(container, '[data-part="presence-dot"][data-online="true"]')).toHaveLength(2);
    expect(q(container, '[data-part="presence-dot"][data-online="false"]')).toHaveLength(2);
    for (const status of ['active', 'away', 'busy', 'offline']) {
      expect(q(container, `[data-part="status-badge"][data-status="${status}"]`)).toHaveLength(1);
    }
    for (const variant of ['primary', 'default', 'danger']) {
      expect(q(container, `[data-part="action-button"][data-variant="${variant}"]`)).toHaveLength(1);
    }
    expect(q(container, '[data-part="action-button"][data-disabled="true"]')).toHaveLength(1);
    expect(q(container, '[data-part="action-button"][data-disabled="false"]')).toHaveLength(2);
  });

  it.each(ENGINES)('pins compact online/offline roots (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <div>
        <PatternUserProfileCard user={PROFILES[0]} variant="compact" online />
        <PatternUserProfileCard user={PROFILES[3]} variant="compact" online={false} />
      </div>,
      engine,
    );
    await waitFor(() => expect(q(container, '[data-part="root"][data-loading="false"][data-variant="compact"]')).toHaveLength(2));
    expect(q(container, '[data-part="presence-dot"][data-online="true"]')).toHaveLength(1);
    expect(q(container, '[data-part="presence-dot"][data-online="false"]')).toHaveLength(1);
  });

  it.each(ENGINES)('pins loading root (%s)', async (engine) => {
    const { container } = renderWithEngine(<PatternUserProfileCard user={PROFILES[0]} loading />, engine);
    const root = await waitForSelector(container, '[data-part="root"][data-loading="true"][data-variant="full"]');
    expectEngineScope(root, 'user-profile-card', engine);
    expect(q(container, engine === 'modern' ? '[data-part="spinner"]' : '[data-part="loading-label"]')).toHaveLength(1);
  });
});

describe('pricing-table -- data-part contract (CK-H2)', () => {
  for (const engine of ENGINES) {
    for (const cycle of ['monthly', 'yearly'] as const) {
      it(`pins ${cycle} cycle, highlight and feature tri-state (${engine})`, async () => {
        const { container } = renderWithEngine(
          <PatternPricingTable
            plans={PLANS}
            features={FEATURES}
            highlightedPlan="highlighted"
            billingCycle={cycle}
            onBillingCycleChange={() => undefined}
            onSelectPlan={() => undefined}
          />,
          engine,
        );

        const root = await waitForSelector(container, `[data-part="root"][data-loading="false"][data-cycle="${cycle}"]`);
        expectEngineScope(root, 'pricing-table', engine);
        expect(q(container, `[data-part="toggle"][data-cycle="${cycle}"]`)).toHaveLength(1);
        expect(q(container, '[data-part="toggle-input"]')).toHaveLength(1);
        expect(q(container, '[data-part="plan-card"][data-highlighted="true"]')).toHaveLength(1);
        expect(q(container, '[data-part="plan-card"][data-highlighted="false"]')).toHaveLength(1);
        expect(q(container, '[data-part="plan-badge"][data-variant="savings"]')).toHaveLength(1);
        expect(q(container, '[data-part="plan-badge"][data-variant="popular"]')).toHaveLength(1);
        expect(q(container, '[data-part="cta-button"][data-highlighted="true"]')).toHaveLength(1);
        expect(q(container, '[data-part="cta-button"][data-highlighted="false"]')).toHaveLength(1);
        expect(q(container, '[data-part="feature-row"]')).toHaveLength(3);
        expect(q(container, '[data-part="category-header"]')).toHaveLength(2);
        for (const state of ['included', 'excluded', 'custom']) {
          expect(q(container, `[data-part="feature-value"][data-feature-state="${state}"]`).length).toBeGreaterThanOrEqual(1);
        }

        if (engine === 'rustic') {
          expect(q(container, `[data-part="toggle-track"][data-cycle="${cycle}"]`)).toHaveLength(1);
          expect(q(container, `[data-part="toggle-thumb"][data-cycle="${cycle}"]`)).toHaveLength(1);
          expect(q(container, '[data-part="table-heading"]')).toHaveLength(1);
          expect(q(container, '[data-part="plan-column"]')).toHaveLength(2);
          expect(q(container, '[data-part="price-note"]')).toHaveLength(2);
          expect(q(container, '[data-part="plan-description"]')).toHaveLength(2);
          expect(q(container, '[data-part="feature-label-cell"]')).toHaveLength(3);
          expect(q(container, '[data-part="feature-value-cell"]')).toHaveLength(6);
        } else {
          expect(q(container, '[data-part="feature-label"]')).toHaveLength(1);
        }
      });
    }
  }

  it.each(ENGINES)('pins loading root (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternPricingTable plans={PLANS} features={FEATURES} billingCycle="yearly" loading />,
      engine,
    );
    const root = await waitForSelector(container, '[data-part="root"][data-loading="true"][data-cycle="yearly"]');
    expectEngineScope(root, 'pricing-table', engine);
    expect(q(container, engine === 'modern' ? '[data-part="spinner"]' : '[data-part="loading-label"]')).toHaveLength(1);
  });
});

describe('empty-state -- data-part contract (CK-H2)', () => {
  it.each(ENGINES)('pins icon/title/description and primary/secondary actions (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternEmptyState
        icon={<span>ICON</span>}
        title="No records"
        description="Create the first record."
        action={{ label: 'Create', variant: 'primary', onClick: () => undefined }}
        secondaryAction={{ label: 'Guide', onClick: () => undefined }}
      />,
      engine,
    );
    const root = await waitForSelector(container, '[data-part="root"][data-loading="false"]');
    expectEngineScope(root, 'empty-state', engine);
    for (const part of ['icon', 'title', 'description']) {
      expect(q(container, `[data-part="${part}"]`)).toHaveLength(1);
    }
    expect(q(container, '[data-part="action"][data-variant="primary"]')).toHaveLength(1);
    expect(q(container, '[data-part="secondary-action"][data-variant="default"]')).toHaveLength(1);
  });

  it.each(ENGINES)('pins default action and image branches (%s)', async (engine) => {
    const defaultAction = renderWithEngine(
      <PatternEmptyState title="No matches" action={{ label: 'Reset', variant: 'default', onClick: () => undefined }} />,
      engine,
    );
    await waitForSelector(defaultAction.container, '[data-part="root"][data-loading="false"]');
    expect(q(defaultAction.container, '[data-part="action"][data-variant="default"]')).toHaveLength(1);
    defaultAction.unmount();

    const image = renderWithEngine(<PatternEmptyState title="No image" image="/fixture.png" />, engine);
    await waitForSelector(image.container, '[data-part="root"][data-loading="false"]');
    expect(q(image.container, '[data-part="image"]')).toHaveLength(1);
  });

  it.each(ENGINES)('pins loading root (%s)', async (engine) => {
    const { container } = renderWithEngine(<PatternEmptyState title="Loading" loading />, engine);
    const root = await waitForSelector(container, '[data-part="root"][data-loading="true"]');
    expectEngineScope(root, 'empty-state', engine);
    expect(q(container, engine === 'modern' ? '[data-part="spinner"]' : '[data-part="loading-label"]')).toHaveLength(1);
  });
});

describe('token-inspector -- createElement DOM contract (CK-H2)', () => {
  it('pins panel anatomy, color/text rows and pinned/unpinned states', async () => {
    const { container, getByTestId } = renderWithEngine(
      <div>
        <div
          data-testid="token-target"
          style={{
            '--ds-token-inspector-contract-font': 'monospace',
            backgroundColor: '#123456',
            color: '#abcdef',
            border: '1px solid #333333',
            fontFamily: 'var(--ds-token-inspector-contract-font)',
          } as React.CSSProperties}
        >
          Inspect me
        </div>
        <TokenInspector />
      </div>,
      'modern',
    );

    fireEvent.keyDown(window, { key: 'T', ctrlKey: true, shiftKey: true });
    const panel = await waitForSelector(container, '.ds-pattern-token-inspector[data-part="panel"][data-pinned="false"]');
    for (const part of ['header', 'title', 'pinned-badge', 'element-info', 'empty', 'footer']) {
      expect(q(container, `[data-part="${part}"]`)).toHaveLength(1);
    }
    expect(q(container, '[data-part="pinned-badge"][data-pinned="false"]')).toHaveLength(1);

    const target = getByTestId('token-target');
    fireEvent.mouseMove(target, { clientX: 20, clientY: 20 });
    await waitFor(() => expect(q(container, '[data-part="token-row"]').length).toBeGreaterThanOrEqual(1));
    expect(q(container, '[data-part="token-name"]').length).toBeGreaterThanOrEqual(1);
    expect(q(container, '[data-part="token-value"]').length).toBeGreaterThanOrEqual(1);
    expect(q(container, '[data-part="token-value"][data-value-kind="color"]').length).toBeGreaterThanOrEqual(1);
    expect(q(container, '[data-part="token-value"][data-value-kind="text"]').length).toBeGreaterThanOrEqual(1);

    fireEvent.click(target);
    await waitFor(() => expect(panel.getAttribute('data-pinned')).toBe('true'));
    expect(q(container, '[data-part="pinned-badge"][data-pinned="true"]')).toHaveLength(1);

    fireEvent.click(target);
    await waitFor(() => expect(panel.getAttribute('data-pinned')).toBe('false'));
    expect(q(container, '[data-part="pinned-badge"][data-pinned="false"]')).toHaveLength(1);
  });
});
