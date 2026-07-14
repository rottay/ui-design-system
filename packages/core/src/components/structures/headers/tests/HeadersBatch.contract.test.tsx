import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';

import { DetailHeader } from '../detail';
import { EditHeader } from '../edit';
import { FormHeader } from '../form';
import { CollectionHeader } from '../collection';
import { DashboardHeader } from '../dashboard';
import { renderWithEngine } from '../../../../_internal/testing/helpers/engine-test-utils';

// ---------------------------------------------------------------------------
// WO-SKIN-06 checkpoint CK-B/S -- the structures/headers half of the header
// family (DetailHeader, EditHeader, FormHeader, CollectionHeader,
// DashboardHeader) data-part contract evidence.
//
// The pre-step stamps `data-part` (plus component-private state attributes:
// data-archetype, data-active, data-embedded, data-title-treatment,
// data-tone, data-state, data-direction, data-compact, data-loading) onto
// all five components without moving any paint. Per the checkpoint contract
// (P-79 / "a surface owns no DOM"), these five files are engine-free
// structures that COMPOSE engine-switched primitives (Button, Badge,
// Breadcrumb, Spinner, Tooltip) -- `Grid`/`Card` DROP a `data-part` stamp in
// BOTH engines and `Button` drops it in modern only, so any anatomy this
// file owns on a composed Button rides a className, never `data-part`. This
// file is the only thing in the chain that proves a stamp actually reached
// the DOM (P-79's own lesson from CK-D: tsc accepts the stamp everywhere,
// the paint counter does not read attributes, and a skin rule anchored on a
// dropped stamp would simply never match, silently).
//
// None of these five components are engine-switched themselves (no
// createEngineComponent, no `engine` prop) -- `renderWithEngine` is used
// anyway because every render composes at least one engine-switched leaf
// primitive (Button, Badge, Breadcrumb, Spinner) that lazy-loads via
// `createEngineComponent`'s Suspense boundary, so `waitFor` is still
// required even though the STRUCTURE's own DOM does not vary by engine.
// ---------------------------------------------------------------------------

const WAIT_TIMEOUT = 2000;

async function waitForPart(container: HTMLElement, part: string): Promise<Element> {
  await waitFor(
    () => {
      if (!container.querySelector(`[data-part="${part}"]`)) {
        throw new Error(`expected [data-part="${part}"] in <container>`);
      }
    },
    { timeout: WAIT_TIMEOUT },
  );
  return container.querySelector(`[data-part="${part}"]`) as Element;
}

/**
 * A surface owns no DOM of its own -- it owns composition. `Button` drops a
 * `data-part` stamp in the modern engine (forwards in rustic), so any
 * anatomy hook this file needs on a composed Button is a className, never
 * `data-part`. See the README's "A surface owns no DOM" law and CK-D/R's
 * `RecordBatch.contract.test.tsx`, which established this exact helper for
 * the same reason.
 */
async function waitForClass(container: HTMLElement, className: string): Promise<Element> {
  await waitFor(
    () => {
      if (!container.querySelector(`.${className}`)) {
        throw new Error(`expected .${className} in <container>`);
      }
    },
    { timeout: WAIT_TIMEOUT },
  );
  return container.querySelector(`.${className}`) as Element;
}

describe('Headers-family (structures) data-part contract (WO-SKIN-06 checkpoint CK-B/S)', () => {
  describe('DetailHeader', () => {
    const tabs = [
      { id: 'overview', label: 'Overview', count: 3 },
      { id: 'activity', label: 'Activity', count: 0 },
    ];

    it('stamps root/top-bar/back-button/back-icon/back-label/breadcrumb-divider/hero-panel(data-archetype)/avatar(data-variant)/eyebrow/title/subtitle/context-rail/metadata-card/metadata-chip*/tab-strip/tab(data-active)/tab-icon/tab-label/tab-count/tab-count-text', async () => {
      const { container } = renderWithEngine(
        <DetailHeader
          title="Acme Corp"
          subtitle="Enterprise customer"
          avatar="AC"
          status={{ label: 'Active', variant: 'success' }}
          backHref="/customers"
          breadcrumb={[{ label: 'Customers', href: '/customers' }, { label: 'Acme Corp' }]}
          actions={[{ label: 'Edit', onClick: vi.fn() }]}
          tabs={tabs}
          activeTab="overview"
          onTabChange={vi.fn()}
          metadata={[{ label: 'ID', value: '12345', icon: () => <svg /> }]}
          eyebrow="Customer"
          archetype="editorial"
          contextRail={<span>Context rail content</span>}
        >
          <span>Children content</span>
        </DetailHeader>,
        'modern',
      );

      const root = await waitForPart(container, 'root');
      expect(root.className).toContain('ds-structure');
      expect(root.className).toContain('ds-detail-header');

      expect(container.querySelector('[data-part="top-bar"]')).not.toBeNull();
      expect(container.querySelector('[data-part="back-button"]')).not.toBeNull();
      expect(container.querySelector('[data-part="back-icon"]')).not.toBeNull();
      expect(container.querySelector('[data-part="back-label"]')).not.toBeNull();
      expect(container.querySelector('[data-part="breadcrumb-divider"]')).not.toBeNull();

      const heroPanel = container.querySelector('[data-part="hero-panel"]');
      expect(heroPanel).not.toBeNull();
      expect(heroPanel?.getAttribute('data-archetype')).toBe('editorial');

      expect(container.querySelector('[data-part="avatar"][data-variant="initials"]')).not.toBeNull();
      expect(container.querySelector('[data-part="eyebrow"]')).not.toBeNull();
      expect(container.querySelector('[data-part="title"][data-archetype="editorial"]')).not.toBeNull();
      expect(container.querySelector('[data-part="subtitle"]')).not.toBeNull();
      expect(container.querySelector('[data-part="context-rail"]')).not.toBeNull();

      expect(container.querySelector('[data-part="metadata-card"]')).not.toBeNull();
      expect(container.querySelector('[data-part="metadata-card-children"]')).not.toBeNull();
      expect(container.querySelector('[data-part="metadata-chip"]')).not.toBeNull();
      expect(container.querySelector('[data-part="metadata-chip-label"]')).not.toBeNull();
      expect(container.querySelector('[data-part="metadata-chip-value"]')).not.toBeNull();

      expect(container.querySelector('[data-part="tab-strip"]')).not.toBeNull();
      expect(container.querySelector('[data-part="tab"][data-active="true"]')).not.toBeNull();
      expect(container.querySelector('[data-part="tab"][data-active="false"]')).not.toBeNull();
      expect(container.querySelector('[data-part="tab-icon"]')).toBeNull(); // no tab.icon supplied in this fixture
      expect(container.querySelector('[data-part="tab-label"][data-active="true"]')).not.toBeNull();
      expect(container.querySelector('[data-part="tab-label"][data-active="false"]')).not.toBeNull();
      expect(container.querySelector('[data-part="tab-count"]')).not.toBeNull();
      expect(container.querySelector('[data-part="tab-count-text"][data-active="true"]')).not.toBeNull();
    });

    it('avatar image variant: stamps avatar[data-variant="image"]', async () => {
      const { container } = renderWithEngine(
        <DetailHeader title="With image avatar" avatar="/avatar.png" backHref="/x" />,
        'modern',
      );

      await waitForPart(container, 'root');
      expect(container.querySelector('[data-part="avatar"][data-variant="image"]')).not.toBeNull();
    });

    it('all four archetypes stamp hero-panel/title with the matching data-archetype', async () => {
      for (const archetype of ['editorial', 'control', 'technical', 'governance'] as const) {
        const { container, unmount } = renderWithEngine(
          <DetailHeader title="Archetype check" backHref="/x" archetype={archetype} />,
          'modern',
        );
        const heroPanel = await waitForPart(container, 'hero-panel');
        expect(heroPanel.getAttribute('data-archetype'), `archetype ${archetype}`).toBe(archetype);
        expect(container.querySelector(`[data-part="title"][data-archetype="${archetype}"]`)).not.toBeNull();
        unmount();
      }
    });
  });

  describe('EditHeader', () => {
    it('stamps the loading root(data-loading)', async () => {
      const { container } = renderWithEngine(
        <EditHeader title="Loading" backHref="/x" loading />,
        'modern',
      );

      const root = await waitForPart(container, 'root');
      expect(root.getAttribute('data-loading')).toBe('true');
    });

    it('stamps root/top-bar/back-button(+className)/back-icon/back-label/breadcrumb-divider/breadcrumb-link(+className)/breadcrumb-separator/breadcrumb-item/entity-id/hero-panel/icon-badge/icon-badge-glyph/eyebrow/title/status-pill/status-pill-text/subtitle/actions/context-card/context-rail/context-card-children', async () => {
      // A real lucide-react/DS icon forwards arbitrary props (including
      // `data-part`) onto its root <svg> via a rest-spread -- this fixture
      // must replicate that, or it silently disproves the stamp reaching
      // the DOM for the wrong reason (an unrealistic fixture, not a P-79
      // engine drop).
      const Icon = (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="edit-icon" {...props} />;
      const { container } = renderWithEngine(
        <EditHeader
          icon={Icon}
          title="Edit entity"
          subtitle="Editing an entity"
          entityId="abc123456789"
          backHref="/x"
          colorVariant="primary"
          breadcrumb={[{ label: 'Entities', href: '/entities' }, { label: 'Current' }]}
          actions={[{ label: 'Extra', kind: 'default', onClick: vi.fn() }]}
          status={{ label: 'Draft', color: 'warning' }}
          archetype="technical"
          eyebrow="Entity"
          contextRail={<span>rail</span>}
          onSave={vi.fn()}
          onCancel={vi.fn()}
        >
          <span>children</span>
        </EditHeader>,
        'modern',
      );

      const root = await waitForPart(container, 'root');
      expect(root.className).toContain('ds-structure');
      expect(root.className).toContain('ds-edit-header');

      expect(container.querySelector('[data-part="top-bar"]')).not.toBeNull();

      const backButton = container.querySelector('[data-part="back-button"]');
      expect(backButton).not.toBeNull();
      expect(backButton?.className).toContain('back-button'); // untouched dead-CSS hook, §4

      expect(container.querySelector('[data-part="back-icon"]')).not.toBeNull();
      expect(container.querySelector('[data-part="back-label"]')).not.toBeNull();
      expect(container.querySelector('[data-part="breadcrumb-divider"]')).not.toBeNull();

      const breadcrumbLink = container.querySelector('[data-part="breadcrumb-link"]');
      expect(breadcrumbLink).not.toBeNull();
      expect(breadcrumbLink?.className).toContain('breadcrumb-link'); // untouched dead-CSS hook, §4

      expect(container.querySelector('[data-part="breadcrumb-separator"]')).not.toBeNull();
      expect(container.querySelector('[data-part="breadcrumb-item"]')).not.toBeNull();
      expect(container.querySelector('[data-part="entity-id"]')?.textContent).toContain('abc12345');

      expect(container.querySelector('[data-part="hero-panel"][data-archetype="technical"]')).not.toBeNull();
      expect(container.querySelector('[data-part="icon-badge"]')).not.toBeNull();
      expect(container.querySelector('[data-part="icon-badge-glyph"]')).not.toBeNull();
      expect(container.querySelector('[data-part="eyebrow"]')).not.toBeNull();
      expect(container.querySelector('[data-part="title"]')).not.toBeNull();
      expect(container.querySelector('[data-part="status-pill"]')).not.toBeNull();
      expect(container.querySelector('[data-part="status-pill-text"]')).not.toBeNull();
      expect(container.querySelector('[data-part="subtitle"]')).not.toBeNull();
      expect(container.querySelector('[data-part="actions"]')).not.toBeNull();
      expect(container.querySelector('[data-part="context-card"]')).not.toBeNull();
      expect(container.querySelector('[data-part="context-rail"]')).not.toBeNull();
      expect(container.querySelector('[data-part="context-card-children"]')).not.toBeNull();
    });

    it('the dead <style> block is untouched: back-button/breadcrumb-link className hooks still exist verbatim', async () => {
      const { container } = renderWithEngine(
        <EditHeader title="X" backHref="/x" breadcrumb={[{ label: 'A', href: '/a' }]} />,
        'modern',
      );

      await waitForPart(container, 'root');
      const styleTag = container.querySelector('style');
      expect(styleTag).not.toBeNull();
      expect(styleTag?.textContent).toContain('.back-button:hover');
      expect(styleTag?.textContent).toContain('.breadcrumb-link:hover');
      expect(styleTag?.textContent).toContain('!important');
    });
  });

  describe('FormHeader', () => {
    const Icon = (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="form-icon" {...props} />;

    it('stamps root/top-bar/back-button/back-icon/back-label/breadcrumb-divider/actions/hero-panel/icon-badge/icon-badge-glyph/eyebrow/title/subtitle/context-card/context-rail/context-card-children', async () => {
      const { container } = renderWithEngine(
        <FormHeader
          icon={Icon}
          title="Create entity"
          subtitle="Fill out the form"
          backHref="/x"
          colorVariant="success"
          breadcrumb={[{ label: 'Entities', href: '/entities' }]}
          actions={[{ label: 'Save', onClick: vi.fn() }]}
          archetype="governance"
          eyebrow="New"
          contextRail={<span>rail</span>}
        >
          <span>children</span>
        </FormHeader>,
        'modern',
      );

      const root = await waitForPart(container, 'root');
      expect(root.className).toContain('ds-structure');
      expect(root.className).toContain('ds-form-header');

      expect(container.querySelector('[data-part="top-bar"]')).not.toBeNull();
      expect(container.querySelector('[data-part="back-button"]')).not.toBeNull();
      expect(container.querySelector('[data-part="back-icon"]')).not.toBeNull();
      expect(container.querySelector('[data-part="back-label"]')).not.toBeNull();
      expect(container.querySelector('[data-part="breadcrumb-divider"]')).not.toBeNull();
      expect(container.querySelector('[data-part="actions"]')).not.toBeNull();
      expect(container.querySelector('[data-part="hero-panel"][data-archetype="governance"]')).not.toBeNull();
      expect(container.querySelector('[data-part="icon-badge"]')).not.toBeNull();
      expect(container.querySelector('[data-part="icon-badge-glyph"]')).not.toBeNull();
      expect(container.querySelector('[data-part="eyebrow"]')).not.toBeNull();
      expect(container.querySelector('[data-part="title"]')).not.toBeNull();
      expect(container.querySelector('[data-part="subtitle"]')).not.toBeNull();
      expect(container.querySelector('[data-part="context-card"]')).not.toBeNull();
      expect(container.querySelector('[data-part="context-rail"]')).not.toBeNull();
      expect(container.querySelector('[data-part="context-card-children"]')).not.toBeNull();
    });

    it('has no dead <style> tag (unlike its near-twin EditHeader)', async () => {
      const { container } = renderWithEngine(
        <FormHeader icon={Icon} title="X" backHref="/x" />,
        'modern',
      );
      await waitForPart(container, 'root');
      expect(container.querySelector('style')).toBeNull();
    });
  });

  describe('CollectionHeader', () => {
    it('editorial-tech + dotted title + quickActions: stamps root(data-embedded)/title(data-title-treatment/data-editorial-tech)/subtitle-divider/subtitle(data-variant=editorial-tech)/editorial-tech-rule/eyebrow/meta-item(data-tone)/quick-actions/quick-action className/quick-action-icon/secondary-rail/shortcuts-label/shortcuts-label-icon/shortcut-pill', async () => {
      const { container } = renderWithEngine(
        <CollectionHeader
          eyebrow="Workspace"
          title="Candidates"
          titleTreatment="dotted"
          subtitle="All active candidates"
          layoutVariant="editorial-tech"
          metaItems={[
            { key: 'a', label: '12 active', tone: 'primary' },
            { key: 'b', label: '3 flagged', tone: 'success' },
            { key: 'c', label: 'Neutral', tone: 'neutral' },
          ]}
          shortcuts={[{ key: 's', label: '⌘K search' }]}
          quickActions={[
            { key: 'q1', label: 'Invite', onClick: vi.fn(), variant: 'primary' },
            { key: 'q2', label: 'Export', onClick: vi.fn(), variant: 'secondary' },
            { key: 'q3', label: 'More', onClick: vi.fn(), icon: <svg data-testid="qa-icon" /> },
          ]}
          surfaceVariant="default"
        />,
        'modern',
      );

      const root = await waitForPart(container, 'root');
      expect(root.className).toContain('ds-structure');
      expect(root.className).toContain('ds-collection-header');
      expect(root.getAttribute('data-embedded')).toBe('false');

      const title = container.querySelector('[data-part="title"]');
      expect(title).not.toBeNull();
      expect(title?.getAttribute('data-title-treatment')).toBe('dotted');
      expect(title?.getAttribute('data-editorial-tech')).toBe('true');

      expect(container.querySelector('[data-part="subtitle-divider"]')).not.toBeNull();
      expect(container.querySelector('[data-part="subtitle"][data-variant="editorial-tech"]')).not.toBeNull();
      expect(container.querySelector('[data-part="editorial-tech-rule"]')).not.toBeNull();
      expect(container.querySelector('[data-part="eyebrow"]')).not.toBeNull();

      const metaItems = container.querySelectorAll('[data-part="meta-item"]');
      expect(metaItems.length).toBe(3);
      expect(container.querySelector('[data-part="meta-item"][data-tone="primary"]')).not.toBeNull();
      expect(container.querySelector('[data-part="meta-item"][data-tone="success"]')).not.toBeNull();
      expect(container.querySelector('[data-part="meta-item"][data-tone="neutral"]')).not.toBeNull();

      expect(container.querySelector('[data-part="quick-actions"]')).not.toBeNull();
      await waitForClass(container, 'ds-collection-header__quick-action');
      expect(container.querySelector('.ds-collection-header__quick-action--primary')).not.toBeNull();
      expect(container.querySelector('.ds-collection-header__quick-action--secondary')).not.toBeNull();
      expect(container.querySelector('.ds-collection-header__quick-action--default')).not.toBeNull();
      expect(container.querySelector('[data-part="quick-action-icon"]')).not.toBeNull();

      expect(container.querySelector('[data-part="secondary-rail"]')).not.toBeNull();
      expect(container.querySelector('[data-part="shortcuts-label"]')).not.toBeNull();
      expect(container.querySelector('[data-part="shortcuts-label-icon"]')).not.toBeNull();
      expect(container.querySelector('[data-part="shortcut-pill"]')).not.toBeNull();
    });

    it('embedded + default title + no quickActions: stamps root(data-embedded=true)/title-accent/subtitle(data-variant=default)/secondary-rail(no-quickActions branch)/shortcut-pill(duplicate render path)', async () => {
      const { container } = renderWithEngine(
        <CollectionHeader
          eyebrow="Workspace"
          title="Candidates"
          titleTreatment="default"
          subtitle="All active candidates"
          shortcuts={[{ key: 's', label: '⌘K search' }]}
          surfaceVariant="embedded"
        />,
        'modern',
      );

      const root = await waitForPart(container, 'root');
      expect(root.getAttribute('data-embedded')).toBe('true');

      expect(container.querySelector('[data-part="title"][data-title-treatment="default"]')).not.toBeNull();
      expect(container.querySelector('[data-part="title-accent"]')).not.toBeNull();
      expect(container.querySelector('[data-part="subtitle"][data-variant="default"]')).not.toBeNull();
      expect(container.querySelector('[data-part="secondary-rail"]')).not.toBeNull();
      expect(container.querySelector('[data-part="shortcut-pill"]')).not.toBeNull();
      // Editorial-tech-only parts must NOT render in the default layout.
      expect(container.querySelector('[data-part="subtitle-divider"]')).toBeNull();
      expect(container.querySelector('[data-part="editorial-tech-rule"]')).toBeNull();
    });
  });

  describe('DashboardHeader', () => {
    it('compact mode: stamps root(data-compact=true)/icon/title/actions/action className/metrics-row(data-compact=true)', async () => {
      const { container } = renderWithEngine(
        <DashboardHeader
          title="Overview"
          icon={<svg data-testid="dash-icon" />}
          status={{ state: 'live' }}
          metrics={[{ key: 'm1', label: 'Users', value: 128, change: { value: '4%', direction: 'up' } }]}
          actions={[{ key: 'a1', label: 'Refresh', onClick: vi.fn() }]}
          compact
        />,
        'modern',
      );

      const root = await waitForPart(container, 'root');
      expect(root.className).toContain('ds-structure');
      expect(root.className).toContain('ds-dashboard-header');
      expect(root.getAttribute('data-compact')).toBe('true');

      expect(container.querySelector('[data-part="icon"]')).not.toBeNull();
      expect(container.querySelector('[data-part="title"]')).not.toBeNull();
      expect(container.querySelector('[data-part="actions"]')).not.toBeNull();
      await waitForClass(container, 'ds-dashboard-header__action');
      expect(container.querySelector('[data-part="metrics-row"][data-compact="true"]')).not.toBeNull();
    });

    it('full mode: stamps root(data-compact=false)/subtitle/metrics-row(data-compact=false) and every metric-change direction', async () => {
      const { container } = renderWithEngine(
        <DashboardHeader
          title="Overview"
          subtitle="Live operational metrics"
          icon={<svg data-testid="dash-icon-2" />}
          status={{ state: 'syncing' }}
          metrics={[
            { key: 'm1', label: 'Users', value: 128, change: { value: '4%', direction: 'up' } },
            { key: 'm2', label: 'Errors', value: 3, change: { value: '2%', direction: 'down' } },
            { key: 'm3', label: 'Latency', value: '120ms', change: { value: '0%', direction: 'flat' } },
          ]}
          actions={[{ key: 'a1', label: 'Refresh', onClick: vi.fn() }]}
        />,
        'modern',
      );

      const root = await waitForPart(container, 'root');
      expect(root.getAttribute('data-compact')).toBe('false');
      expect(container.querySelector('[data-part="subtitle"]')).not.toBeNull();
      expect(container.querySelector('[data-part="metrics-row"][data-compact="false"]')).not.toBeNull();

      expect(container.querySelectorAll('[data-part="metric-chip"]').length).toBe(3);
      expect(container.querySelector('[data-part="metric-chip-icon"]')).toBeNull(); // no metric.icon in this fixture
      expect(container.querySelectorAll('[data-part="metric-chip-label"]').length).toBe(3);
      expect(container.querySelectorAll('[data-part="metric-chip-value"]').length).toBe(3);
      expect(container.querySelector('[data-part="metric-chip-change"][data-direction="up"]')).not.toBeNull();
      expect(container.querySelector('[data-part="metric-chip-change"][data-direction="down"]')).not.toBeNull();
      expect(container.querySelector('[data-part="metric-chip-change"][data-direction="flat"]')).not.toBeNull();
    });

    it('StatusDot: stamps status-dot/status-dot-glyph/status-dot-text with data-state for every DashboardStatusState', async () => {
      for (const state of ['live', 'connected', 'syncing', 'offline', 'warning'] as const) {
        const { container, unmount } = renderWithEngine(
          <DashboardHeader title="X" status={{ state }} />,
          'modern',
        );
        await waitForPart(container, 'root');
        expect(container.querySelector(`[data-part="status-dot"][data-state="${state}"]`), `state ${state}`).not.toBeNull();
        expect(container.querySelector(`[data-part="status-dot-glyph"][data-state="${state}"]`), `state ${state}`).not.toBeNull();
        expect(container.querySelector(`[data-part="status-dot-text"][data-state="${state}"]`), `state ${state}`).not.toBeNull();
        unmount();
      }
    });
  });
});
